import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { articles, cases, industries, painCards, partners, prices, regionCitiesLine, regionCount, regionOblastsLine, regions, site } from "./data.js";
import { OfertaContent } from "./content/oferta.jsx";
import { normalizePath, withBase } from "./lib/routes.js";

const routes = {
  home: "/",
  blog: "/statti/",
};

function pushEvent(event, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

function setMeta({ title, description, type = "website", path = "/" }) {
  document.title = title;
  upsertMeta("description", description);
  upsertMeta("og:title", title, "property");
  upsertMeta("og:description", description, "property");
  upsertMeta("og:type", type, "property");
  upsertMeta("og:url", `${site.baseUrl}${path === "/" ? "/" : path}`, "property");
  upsertLink("canonical", `${site.baseUrl}${path === "/" ? "/" : path}`);
}

function upsertMeta(name, content, attr = "name") {
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const onPopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const hideToast = () => setToastVisible(false);
    window.addEventListener("resize", hideToast);
    return () => window.removeEventListener("resize", hideToast);
  }, []);

  useEffect(() => {
    if (!toastVisible) return undefined;
    const timer = window.setTimeout(() => setToastVisible(false), 4200);
    return () => window.clearTimeout(timer);
  }, [toastVisible]);

  useEffect(() => {
    const onLeadSuccess = () => setToastVisible(true);
    window.addEventListener("km:lead-success", onLeadSuccess);
    return () => window.removeEventListener("km:lead-success", onLeadSuccess);
  }, []);

  const navigate = (href) => {
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (href.includes("#")) {
      const [path, hash] = href.split("#");
      const targetPath = path ? withBase(path) : window.location.pathname;
      if (path && normalizePath(window.location.pathname) !== normalizePath(path)) {
        window.history.pushState({}, "", targetPath);
        setPath(normalizePath(new URL(targetPath, window.location.origin).pathname));
        setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 80);
        return;
      }
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const target = withBase(href);
    window.history.pushState({}, "", target);
    setPath(normalizePath(new URL(target, window.location.origin).pathname));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const page = useMemo(() => resolvePage(path), [path]);

  useEffect(() => {
    setMeta(page.meta);
    pushEvent("page_view_init", { page_type: page.type, page_path: path });
    pushEvent("ViewContent", { page_type: page.type, page_path: path });
    if (page.type === "region") pushEvent("region_page_view", { region: page.data.city });
  }, [page, path]);

  useScrollDepth();

  return (
    <>
      <Header navigate={navigate} />
      <main>{renderPage(page, navigate)}</main>
      <Footer navigate={navigate} />
      <div
        className={`notification${toastVisible ? " show" : ""}`}
        id="notification"
        role="status"
        aria-live="polite"
        aria-hidden={!toastVisible}
      >
        ✓ Заявку отримано! Передзвонимо за 15 хвилин
      </div>
    </>
  );
}

function resolvePage(path) {
  const region = regions.find((item) => path === `/${item.slug}/`);
  if (region) {
    return {
      type: "region",
      data: region,
      meta: { title: `${region.title} — КМ Трейд Wialon`, description: region.description, type: "website", path },
    };
  }

  const industry = industries.find((item) => path === `/${item.slug}/`);
  if (industry) {
    return {
      type: "industry",
      data: industry,
      meta: { title: `${industry.title} — КМ Трейд`, description: industry.description, type: "website", path },
    };
  }

  if (path === routes.blog) {
    return {
      type: "blog",
      meta: {
        title: "Статті про GPS-моніторинг транспорту — КМ Трейд",
        description: "Практичні статті про Wialon, контроль пального, GPS для агро, вантажівок і автопарків Заходу України.",
        type: "website",
        path,
      },
    };
  }

  const article = articles.find((item) => path === `/statti/${item.slug}/`);
  if (article) {
    return {
      type: "article",
      data: article,
      meta: { title: `${article.title} — КМ Трейд`, description: article.description, type: "article", path },
    };
  }

  if (path === "/oferta/" || path === "/konfidentsiynist/") {
    const isOferta = path === "/oferta/";
    const title = isOferta ? "Оферта" : "Політика конфіденційності";
    return {
      type: "legal",
      data: { title, kind: isOferta ? "oferta" : "privacy" },
      meta: {
        title: `${title} — КМ Трейд`,
        description: isOferta
          ? "Договір публічної оферти на платне надання послуг GPS моніторингу КМ Трейд."
          : `${title} КМ Трейд. Текст потребує юридичного погодження перед production-запуском.`,
        type: "website",
        path,
      },
    };
  }

  return {
    type: "home",
    meta: {
      title: "КМ Трейд — GPS-моніторинг автопарку в 7 областях України",
      description:
        "GPS-моніторинг транспорту Wialon у 7 областях: Чернівецька, Івано-Франківська, Тернопільська, Хмельницька, Львівська, Рівненська та Київська. Від 250 грн включаючи моб.зв'язок, тест 14 днів.",
      type: "website",
      path: "/",
    },
  };
}

function renderPage(page, navigate) {
  if (page.type === "region") return <RegionPage region={page.data} navigate={navigate} />;
  if (page.type === "industry") return <IndustryPage industry={page.data} navigate={navigate} />;
  if (page.type === "blog") return <BlogPage navigate={navigate} />;
  if (page.type === "article") return <ArticlePage article={page.data} navigate={navigate} />;
  if (page.type === "legal") return <LegalPage title={page.data.title} kind={page.data.kind} navigate={navigate} />;
  return <HomePage navigate={navigate} />;
}

function Header({ navigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const headerRef = useRef(null);
  const afterCloseRef = useRef(null);

  useEffect(() => {
    const syncHeaderOffset = () => {
      const height = headerRef.current?.offsetHeight || 56;
      document.documentElement.style.setProperty("--header-offset", `${height}px`);
    };
    syncHeaderOffset();
    window.addEventListener("resize", syncHeaderOffset);
    return () => window.removeEventListener("resize", syncHeaderOffset);
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1124) setMenuOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      setOpenSection(null);
      const action = afterCloseRef.current;
      afterCloseRef.current = null;
      if (!action) return undefined;
      const timer = window.setTimeout(() => action(), 40);
      return () => window.clearTimeout(timer);
    }

    document.documentElement.classList.add("is-mobile-menu-open");
    document.body.classList.add("is-mobile-menu-open");

    const preventTouchMove = (event) => {
      if (event.target.closest?.(".header-mobile")) return;
      event.preventDefault();
    };
    document.addEventListener("touchmove", preventTouchMove, { passive: false });

    return () => {
      document.documentElement.classList.remove("is-mobile-menu-open");
      document.body.classList.remove("is-mobile-menu-open");
      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, [menuOpen]);

  const closeMenu = (afterClose) => {
    if (typeof afterClose === "function") {
      afterCloseRef.current = afterClose;
    }
    setMenuOpen(false);
  };

  const goToLeadForm = () => {
    closeMenu(() => {
      const target = document.getElementById("trial") || document.getElementById("lead-form");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      navigate("/#trial");
    });
  };

  const toggleSection = (section) => {
    setOpenSection((current) => (current === section ? null : section));
  };

  return (
    <header ref={headerRef} className={menuOpen ? "is-menu-open" : undefined}>
      <div className="container">
        <div className="header-inner">
          <div className="header-brand">
            <Logo
              navigate={(href) => {
                closeMenu();
                navigate(href);
              }}
            />
          </div>
          <nav className="header-nav" aria-label="Головна навігація">
            <div className="nav-dropdown">
              <span className="nav-link nav-link-has-menu" role="button" tabIndex={0}>
                <span>Wialon</span>
                <span className="nav-chevron" aria-hidden="true">▾</span>
              </span>
              <div className="dropdown-menu">
                <a className="nav-link" href="https://gps.km-trade.net/" target="_blank" rel="noopener noreferrer">
                  <span className="di">🛰</span>Wialon Local
                </a>
                <a className="nav-link" href="https://hosting.km-trade.net/?lang=uk" target="_blank" rel="noopener noreferrer">
                  <span className="di">☁️</span>Wialon Hosting
                </a>
              </div>
            </div>
            <NavLink href="/oferta/" navigate={navigate}>
              Оферта
            </NavLink>
            <Dropdown label="Рішення" href="/#industries" navigate={navigate}>
              {industries.slice(0, 6).map((item) => (
                <NavLink key={item.slug} href={`/${item.slug}/`} navigate={navigate}>
                  <span className="di">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </Dropdown>
            <Dropdown label="Статті" href="/statti/" navigate={navigate}>
              <NavLink href="/statti/" navigate={navigate}>
                <span className="di">📚</span>Всі статті
              </NavLink>
              {articles.slice(0, 3).map((item) => (
                <NavLink key={item.slug} href={`/statti/${item.slug}/`} navigate={navigate}>
                  <span className="di">{item.icon}</span>
                  {item.category}
                </NavLink>
              ))}
            </Dropdown>
            <NavLink href="/#pricing" navigate={navigate}>
              Ціни
            </NavLink>
            <NavLink href="/#cases" navigate={navigate}>
              Кейси
            </NavLink>
            <Dropdown label="Регіони" href="/#regions" navigate={navigate}>
              {regions.map((region) => (
                <NavLink key={region.slug} href={`/${region.slug}/`} navigate={navigate}>
                  <span className="di">📍</span>
                  {region.city}
                </NavLink>
              ))}
            </Dropdown>
          </nav>
          <div className="header-cta">
            <a className="header-phone js-call" href={`tel:${site.phonePrimary}`} onClick={() => pushEvent("Contact", { phone: site.phonePrimary })}>
              <span className="header-phone-icon" aria-hidden="true">📞</span>
              <span className="header-phone-text">{formatPhoneLabel(site.phoneDisplay)}</span>
            </a>
            <button className="btn btn-primary btn-header" type="button" onClick={goToLeadForm}>
              <span className="btn-header-full">Залишити заявку</span>
              <span className="btn-header-short">Заявка</span>
            </button>
            <button
              className="header-burger"
              type="button"
              aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
              aria-expanded={menuOpen}
              aria-controls="header-mobile-menu"
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span className="header-burger-lines" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </div>
      {menuOpen
        ? createPortal(
            <div
              id="header-mobile-menu"
              className="header-mobile is-open"
              style={{
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                top: "var(--header-offset, 56px)",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10050,
                width: "100%",
                height: "auto",
                background: "#fff",
                overflowX: "hidden",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div className="container header-mobile-shell">
                <nav className="header-mobile-nav" aria-label="Мобільна навігація">
                  <div className={`header-mobile-group${openSection === "wialon" ? " is-open" : ""}`}>
                    <button
                      className="header-mobile-toggle"
                      type="button"
                      aria-expanded={openSection === "wialon"}
                      onClick={() => toggleSection("wialon")}
                    >
                      <span>Wialon</span>
                      <span className="header-mobile-chevron" aria-hidden="true">▾</span>
                    </button>
                    {openSection === "wialon" ? (
                      <div className="header-mobile-panel">
                        <a className="header-mobile-link header-mobile-sublink" href="https://gps.km-trade.net/" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
                          <span className="di">🛰</span>Wialon Local
                        </a>
                        <a className="header-mobile-link header-mobile-sublink" href="https://hosting.km-trade.net/?lang=uk" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
                          <span className="di">☁️</span>Wialon Hosting
                        </a>
                      </div>
                    ) : null}
                  </div>
                  <NavLink href="/oferta/" navigate={navigate} onNavigate={closeMenu} className="header-mobile-link">
                    Оферта
                  </NavLink>
                  <div className={`header-mobile-group${openSection === "solutions" ? " is-open" : ""}`}>
                    <button
                      className="header-mobile-toggle"
                      type="button"
                      aria-expanded={openSection === "solutions"}
                      onClick={() => toggleSection("solutions")}
                    >
                      <span>Рішення</span>
                      <span className="header-mobile-chevron" aria-hidden="true">▾</span>
                    </button>
                    {openSection === "solutions" ? (
                      <div className="header-mobile-panel">
                        {industries.slice(0, 6).map((item) => (
                          <NavLink key={item.slug} href={`/${item.slug}/`} navigate={navigate} onNavigate={closeMenu} className="header-mobile-link header-mobile-sublink">
                            <span className="di">{item.icon}</span>
                            {item.name}
                          </NavLink>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className={`header-mobile-group${openSection === "articles" ? " is-open" : ""}`}>
                    <button
                      className="header-mobile-toggle"
                      type="button"
                      aria-expanded={openSection === "articles"}
                      onClick={() => toggleSection("articles")}
                    >
                      <span>Статті</span>
                      <span className="header-mobile-chevron" aria-hidden="true">▾</span>
                    </button>
                    {openSection === "articles" ? (
                      <div className="header-mobile-panel">
                        <NavLink href="/statti/" navigate={navigate} onNavigate={closeMenu} className="header-mobile-link header-mobile-sublink">
                          <span className="di">📚</span>Всі статті
                        </NavLink>
                        {articles.slice(0, 3).map((item) => (
                          <NavLink key={item.slug} href={`/statti/${item.slug}/`} navigate={navigate} onNavigate={closeMenu} className="header-mobile-link header-mobile-sublink">
                            <span className="di">{item.icon}</span>
                            {item.category}
                          </NavLink>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <NavLink href="/#pricing" navigate={navigate} onNavigate={closeMenu} className="header-mobile-link">
                    Ціни
                  </NavLink>
                  <NavLink href="/#cases" navigate={navigate} onNavigate={closeMenu} className="header-mobile-link">
                    Кейси
                  </NavLink>
                  <div className={`header-mobile-group${openSection === "regions" ? " is-open" : ""}`}>
                    <button
                      className="header-mobile-toggle"
                      type="button"
                      aria-expanded={openSection === "regions"}
                      onClick={() => toggleSection("regions")}
                    >
                      <span>Регіони</span>
                      <span className="header-mobile-chevron" aria-hidden="true">▾</span>
                    </button>
                    {openSection === "regions" ? (
                      <div className="header-mobile-panel">
                        {regions.map((region) => (
                          <NavLink key={region.slug} href={`/${region.slug}/`} navigate={navigate} onNavigate={closeMenu} className="header-mobile-link header-mobile-sublink">
                            <span className="di">📍</span>
                            {region.city}
                          </NavLink>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <NavLink href="/#about" navigate={navigate} onNavigate={closeMenu} className="header-mobile-link">
                    Контакти
                  </NavLink>
                  <div className="header-mobile-actions">
                    <div className="header-mobile-phones">
                      <a className="header-mobile-phone" href={`tel:${site.phoneSecondary}`} onClick={() => { closeMenu(); pushEvent("Contact", { phone: site.phoneSecondary }); }}>
                        {formatPhoneLabel(site.phoneDisplay2)}
                      </a>
                      <a className="header-mobile-phone" href={`tel:${site.phonePrimary}`} onClick={() => { closeMenu(); pushEvent("Contact", { phone: site.phonePrimary }); }}>
                        {formatPhoneLabel(site.phoneDisplay)}
                      </a>
                    </div>
                    <button className="btn btn-primary" type="button" onClick={goToLeadForm}>
                      Залишити заявку
                    </button>
                  </div>
                </nav>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}

function Logo({ navigate, variant = "default" }) {
  const src = variant === "light" ? "/assets/logo-on-dark.png" : "/assets/logo-full.png";
  return (
    <button className="logo logo-button" type="button" onClick={() => navigate("/")}>
      <img
        className={`logo-img${variant === "light" ? " logo-img-light" : ""}`}
        src={withBase(src)}
        alt="КМ Трейд — GPS моніторинг"
        width="202"
        height="40"
      />
    </button>
  );
}

function Dropdown({ label, href, navigate, children }) {
  return (
    <div className="nav-dropdown">
      <NavLink href={href} navigate={navigate} className="nav-link-has-menu">
        <span>{label}</span>
        <span className="nav-chevron" aria-hidden="true">▾</span>
      </NavLink>
      <div className="dropdown-menu">{children}</div>
    </div>
  );
}

function NavLink({ href, navigate, children, className = "", onNavigate }) {
  return (
    <a
      className={`nav-link ${className}`.trim()}
      href={withBase(href)}
      onClick={(event) => {
        event.preventDefault();
        onNavigate?.();
        if (href.includes("#")) {
          const [path, hash] = href.split("#");
          if (path && normalizePath(window.location.pathname) !== normalizePath(path)) {
            navigate(href);
            return;
          }
          document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
          return;
        }
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

function HomePage({ navigate }) {
  return (
    <>
      <Hero navigate={navigate} />
      <TrustBar />
      <PainSection />
      <Calculator />
      <WhySection />
      <Cases />
      <Partners />
      <Industries navigate={navigate} />
      <Regions navigate={navigate} />
      <HowItWorks />
      <Pricing />
      <TrialSection />
      <TestimonialsNotice />
      <About />
      <BlogPreview navigate={navigate} />
    </>
  );
}

function Hero({ navigate }) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div>
            <div className="hero-badge"><span /> {regionCitiesLine}</div>
            <h1>GPS-моніторинг автопарку в 7 областях України — <em>встановлення сьогодні</em></h1>
            <p className="hero-sub">
              КМ Трейд — авторизований партнер Wialon / Gurtam з Чернівців. Виїжджаємо по {regionOblastsLine} і допомагаємо економити пальне,
              контролювати маршрути та зменшувати втрати автопарку.
            </p>
            <div className="hero-chips">
              <span>🛰 Wialon</span>
              <span>⚡ Виїзд сьогодні</span>
              <span>🧪 Тест 14 днів</span>
            </div>
            <div className="region-badges">
              {regions.map((region) => (
                <button key={region.slug} type="button" onClick={() => navigate(`/${region.slug}/`)}>{region.city}</button>
              ))}
            </div>
            <div className="hero-actions">
              <button className="btn btn-primary" type="button" onClick={() => scrollToForm()}>Спробувати 14 днів безкоштовно →</button>
            </div>
            <div className="hero-stats">
              <div><b>350+</b><span>клієнтів B2B</span></div>
              <div><b>4&nbsp;000+</b><span>авто підключених</span></div>
              <div><b>10 років</b><span>на ринку</span></div>
              <div><b>{regionCount} областей</b><span>виїзд і сервіс</span></div>
            </div>
          </div>
          <Mockup />
        </div>
      </div>
    </section>
  );
}

function Mockup() {
  return (
    <div className="hero-visual">
      <div className="hero-mockup">
        <div className="mockup-header"><span className="mockup-title">Wialon Live Map</span><span className="mockup-status">Онлайн — 14 авто</span></div>
        <div className="mockup-map">
          <div className="map-grid" />
          <svg className="route-svg" viewBox="0 0 300 200"><polyline points="60,160 90,120 130,100 170,80 210,90 250,60" fill="none" stroke="#6272BD" strokeWidth="2.5" strokeDasharray="6 3" /></svg>
          <div className="map-car">🚛</div>
        </div>
        <div className="mockup-vehicles">
          {["СЕ 1234 АА", "АТ 5678 ВВ", "ВО 9012 СС", "ВХ 3456 DD"].map((car, index) => (
            <div className="vehicle-row" key={car}><span>{car}</span><b className={index === 1 ? "status-stop" : "status-active"}>{index === 1 ? "⏸ Стоянка" : "▶ Рухається"}</b></div>
          ))}
        </div>
      </div>
      <div className="hero-float-card float-1"><div className="float-icon fi-green">📉</div><div><b>−20%</b><span>Економія пального</span></div></div>
      <div className="hero-float-card float-2"><div className="float-icon fi-blue">⚡</div><div><b>14 днів</b><span>Безкоштовний тест</span></div></div>
    </div>
  );
}

function TrustBar() {
  const items = [
    ["📍", `${regionCount} областей покриття`],
    ["🛰", "Партнер Gurtam (Wialon)"],
    ["⚡", "Встановлення за 1 день"],
    ["🔧", "Техпідтримка"],
    ["✅", "10 років досвіду"],
  ];
  return (
    <div className="trust-bar">
      <div className="container">
        <ul className="trust-bar-inner">
          {items.map(([icon, label]) => (
            <li key={label}>
              <span aria-hidden="true">{icon}</span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PainSection() {
  return (
    <section className="section pain-section">
      <div className="container">
        <div className="pain-head">
          <div className="pain-head-copy">
            <div className="tag">⚠️ Болі клієнта</div>
            <h2 className="title">Вам потрібен GPS-моніторинг, якщо водії...</h2>
            <p className="subtitle">
              Кожна з цих проблем обходиться бізнесу в десятки тисяч гривень щороку.
              Wialon робить маршрут, пальне і стиль водіння прозорими.
            </p>
          </div>
          <div className="pain-summary">
            <span className="pain-summary-label">Типові втрати без GPS</span>
            <strong>до 17 000 грн</strong>
            <span className="pain-summary-note">на 1 авто на рік</span>
          </div>
        </div>
        <div className="pain-grid">
          {painCards.map((card, index) => (
            <article className={`pain-card pain-card-${card.tone}`} key={card.title}>
              <span className="pain-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="pain-card-top">
                <div className="pain-icon" aria-hidden="true">{card.icon}</div>
                <h3>{card.title}</h3>
              </div>
              <p>{card.text}</p>
              <div className="pain-cost">
                <span>Вартість для вас</span>
                <strong>{card.cost}</strong>
              </div>
            </article>
          ))}
        </div>
        <div className="pain-cta-panel">
          <div>
            <b>Впізнали своїх водіїв?</b>
            <p>Порахуємо реальні збитки для вашого автопарку за 1 хвилину.</p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => document.getElementById("calc")?.scrollIntoView({ behavior: "smooth" })}>
            Порахувати збитки →
          </button>
        </div>
      </div>
    </section>
  );
}

function Calculator() {
  const [values, setValues] = useState({ type: "truck", count: 5, fuel: 30, km: 5 });
  const pricePerLiter = values.type === "car" ? 58 : 55;
  const savings = Math.round((values.fuel / 100) * (values.km * 1000) * values.count * pricePerLiter * 0.2);
  const subscription = values.count * 250;

  useEffect(() => {
    const hidden = document.getElementById("lead-savings");
    if (hidden) hidden.value = `${money(savings)} грн/міс`;
  }, [savings]);

  const update = (field, value) => {
    setValues((current) => ({ ...current, [field]: field === "type" ? value : Number(value) }));
    pushEvent("calculator_used", { field });
  };

  return (
    <section className="calc-section" id="calc">
      <div className="container">
        <div className="calc-inner">
          <div>
            <div className="tag tag-dark">💰 Калькулятор</div>
            <h2 className="title calc-title">Порахуйте вашу економію</h2>
            <p className="calc-sub">Тип авто, кількість, витрата і пробіг дають орієнтир економії від контролю пального, маршрутів і дисципліни водіїв.</p>
            <div className="calc-benefits"><span>⛽ Контроль пального: 15-25%</span><span>🛣 Оптимізація пробігу: до 10%</span><span>🔧 Менше зносу: до 20%</span></div>
          </div>
          <div className="calc-box">
            <label>Тип транспорту
              <select value={values.type} onChange={(e) => update("type", e.target.value)}>
                <option value="truck">Вантажівка / фура</option>
                <option value="car">Легковий автомобіль</option>
                <option value="tractor">Трактор / спецтехніка</option>
                <option value="minibus">Мікроавтобус / маршрутка</option>
              </select>
            </label>
            <Range label="Кількість авто" value={values.count} min="1" max="80" onChange={(value) => update("count", value)} />
            <Range label="Витрата пального, л/100 км" value={values.fuel} min="6" max="60" onChange={(value) => update("fuel", value)} />
            <Range label="Пробіг, тис. км/місяць" value={values.km} min="1" max="30" onChange={(value) => update("km", value)} />
            <div className="calc-result"><b>{money(savings)}</b><span>грн економії щомісяця</span><small>Підписка КМ Трейд: {money(subscription)} грн/міс · ROI: {(savings / subscription).toFixed(1)}x</small></div>
            <button className="btn btn-primary calc-cta" type="button" onClick={() => scrollToForm()}>Хочу заощадити {money(savings)} грн →</button>
            <p className="info-note">Вартість трекера на 1 авто потребує уточнення від КМ Трейд; калькулятор показує абонплату й орієнтовну економію.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Range({ label, value, min, max, onChange }) {
  return (
    <label>{label}: <span>{value}</span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function WhySection() {
  const usp = [
    ["📍", "Локальність", `Ми з Чернівців і працюємо по ${regionCount} областях України.`],
    ["⚡", "Виїзд сьогодні", "Сьогодні зателефонували — сьогодні або завтра встановили."],
    ["🛰", "Wialon №1", "Платформа, якій довіряють 45 000+ компаній у 130 країнах з 2.5 млн підключеними об'єктами."],
    ["💰", "Від 250 грн", "Включаючи моб.зв'язок — менше ніж вартість 4 літрів пального."],
    ["🔧", "Гарантія 1 рік", "Беремо на себе сервіс протягом першого року без доплат."],
    ["🤝", "Техпідтримка", "Допомога з налаштуваннями, звітами і сервісом."],
  ];
  return (
    <section className="section" id="why">
      <div className="container">
        <div className="tag">✓ Чому КМ Трейд</div>
        <h2 className="title">Авторизований партнер Wialon на Заході України та в Києві з виїздом сьогодні</h2>
        <p className="subtitle">Локальна команда поруч: швидкий виїзд, монтаж і підтримка без довгого очікування.</p>
        <div className="usp-grid">{usp.map(([icon, title, text]) => <article className="usp-card" key={title}><span>{icon}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        <div className="partner-strip">
          <div className="partner-logo">Wialon</div>
          <div>
            <b>Авторизований партнер Gurtam</b>
            <span>Авторизований партнер Wialon на Заході України з виїздом сьогодні</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Cases() {
  return (
    <section className="section cases-section" id="cases">
      <div className="cases-atmosphere" aria-hidden="true" />
      <div className="container">
        <div className="cases-head">
          <div className="tag">Кейси</div>
          <h2 className="title">Реальні результати клієнтів</h2>
          <p className="subtitle">Запит бізнесу, що змінилось після GPS і посилання на компанію.</p>
        </div>
        <div className="case-grid">
          {cases.map((item, index) => (
            <article className="case-card" key={item.name} style={{ "--i": index }}>
              <div className="case-card-shine" aria-hidden="true" />
              <div className="case-card-top">
                <span className="case-logo" aria-hidden="true">
                  <img src={withBase(item.logo)} alt="" width="140" height="40" loading="lazy" />
                </span>
                <span className="case-index">0{index + 1}</span>
              </div>
              <div className="case-card-meta">
                <span className="case-tag">{item.tag}</span>
                <h3>{item.name}</h3>
              </div>
              <div className="case-story">
                <div className="case-block">
                  <small>Запит</small>
                  <p>{item.request}</p>
                </div>
                <div className="case-block case-block-result">
                  <small>Результат</small>
                  <p>{item.result}</p>
                </div>
              </div>
              <div className="case-metrics">
                {item.metrics.map(([value, label]) => (
                  <b key={`${item.name}-${value}-${label}`}>
                    <span className="case-metric-value">{value}</span>
                    <span className="case-metric-label">{label}</span>
                  </b>
                ))}
              </div>
              <a className="case-link" href={item.url} target="_blank" rel="noopener noreferrer">
                Відкрити сайт
                <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section className="section partners-section" id="partners">
      <div className="container">
        <div className="partners-head">
          <div className="tag">Партнери</div>
          <h2 className="title">Нам довіряють автопарки</h2>
          <p className="subtitle">Компанії, які вже контролюють транспорт із КМ Трейд. Натисніть, щоб відкрити їхній сайт.</p>
        </div>
        <ul className="partners-list">
          {partners.map((partner) => (
            <li key={partner.url}>
              <a
                className="partners-item"
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${partner.name} — відкрити сайт`}
              >
                <span className="partners-logo" aria-hidden="true">
                  <img src={withBase(partner.logo)} alt="" width="180" height="48" loading="lazy" />
                </span>
                <span className="partners-copy">
                  <b>{partner.name}</b>
                  <span>{partner.note}</span>
                </span>
                <span className="partners-cta">
                  Відкрити сайт
                  <span aria-hidden="true">→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Industries({ navigate }) {
  return (
    <section className="section" id="industries">
      <div className="container">
        <div className="tag">🏭 Галузеві рішення</div>
        <h2 className="title">GPS під ваш тип бізнесу</h2>
        <p className="subtitle">Вантажівки, агро, громадський транспорт, ЖКГ та інші напрями — окремі сценарії контролю й звіти Wialon.</p>
        <div className="industry-grid">
          {industries.map((item) => (
            <button className="industry-card" type="button" key={item.slug} onClick={() => navigate(`/${item.slug}/`)}>
              <span>{item.icon}</span>
              <b>{item.name}</b>
              <small>{item.short}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Regions({ navigate }) {
  return <section className="section region-section" id="regions"><div className="container"><div className="tag">📍 Регіони</div><h2 className="title">Працюємо в Західній Україні та Києві</h2><div className="region-grid">{regions.map((region) => <button className="region-card" type="button" key={region.slug} onClick={() => navigate(`/${region.slug}/`)}><b>{region.city}</b><span>{region.oblast}</span><small>Детальніше про регіон →</small></button>)}</div></div></section>;
}

function HowItWorks() {
  const steps = [["1", "Заявка", "Передзвонюємо за 15 хвилин і уточнюємо регіон, тип транспорту та кількість авто."], ["2", "Виїзд і аудит", `Безкоштовний виїзд по ${regionCount} областях.`], ["3", "Встановлення", "Монтаж трекерів за 1 день, налаштування Wialon і навчання."], ["4", "Техпідтримка", "Гарантія 1 рік і допомога зі звітами."]];
  return <section className="section how-section"><div className="container"><div className="center"><div className="tag">⚡ Процес</div><h2 className="title">Як ми працюємо</h2></div><div className="steps-grid">{steps.map(([n, title, text]) => <article className="step-card" key={n}><b>{n}</b><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>;
}

function Pricing() {
  const [cars, setCars] = useState(10);
  const count = Math.max(1, Math.min(999, Number(cars) || 1));
  const total = count * 250;
  const presets = [5, 10, 20, 50];

  const setCount = (value) => {
    const next = Math.max(1, Math.min(999, Number(value) || 1));
    setCars(next);
  };

  return (
    <section className="section" id="pricing">
      <div className="container">
        <div className="tag">💳 Тарифи</div>
        <h2 className="title">3 пакети під будь-який бізнес</h2>
        <p className="subtitle">
          Абонплата від 250 грн включаючи моб.зв&apos;язок з роумінгом. Повний перелік функцій і вартість
          трекера потребують підтвердження від клієнта.
        </p>
        <div className="pricing-grid">
          {prices.map(([name, price, note, features], index) => (
            <article className={`pricing-card ${index === 0 ? "featured" : ""}`} key={name}>
              <span>{name}</span>
              <h3>{price}</h3>
              <small>{note}</small>
              <ul>
                {features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button
                className={`btn ${index === 0 ? "btn-primary" : "btn-outline"}`}
                type="button"
                onClick={() => scrollToForm()}
              >
                Обрати пакет
              </button>
            </article>
          ))}
        </div>

        <div className="mini-cost" aria-live="polite">
          <div className="mini-cost-copy">
            <span className="mini-cost-kicker">Калькулятор</span>
            <strong className="mini-cost-title">Скільки коштуватиме ваш парк?</strong>
            <p className="mini-cost-hint">Оберіть кількість авто — покажемо орієнтовну абонплату на місяць.</p>
          </div>

          <div className="mini-cost-controls">
            <span className="mini-cost-label" id="mini-cost-label">
              Кількість авто
            </span>
            <div className="mini-cost-stepper" role="group" aria-labelledby="mini-cost-label">
              <button
                className="mini-cost-btn"
                type="button"
                aria-label="Менше авто"
                disabled={count <= 1}
                onClick={() => setCount(count - 1)}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max="999"
                inputMode="numeric"
                value={count}
                aria-labelledby="mini-cost-label"
                onChange={(event) => setCount(event.target.value)}
              />
              <button
                className="mini-cost-btn"
                type="button"
                aria-label="Більше авто"
                onClick={() => setCount(count + 1)}
              >
                +
              </button>
            </div>
            <div className="mini-cost-presets">
              {presets.map((preset) => (
                <button
                  key={preset}
                  className={`mini-cost-preset${count === preset ? " is-active" : ""}`}
                  type="button"
                  onClick={() => setCount(preset)}
                >
                  {preset} авто
                </button>
              ))}
            </div>
          </div>

          <div className="mini-cost-result">
            <span className="mini-cost-result-label">Орієнтовно на місяць</span>
            <strong className="mini-cost-result-value">{money(total)} грн/міс</strong>
            <span className="mini-cost-result-note">від 250 грн/авто · з моб. зв&apos;язком</span>
            <button className="btn btn-primary mini-cost-cta" type="button" onClick={() => scrollToForm()}>
              Отримати точний розрахунок
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrialSection({ region = "" }) {
  return <section className="trial-section" id="trial"><div className="container"><h2 className="trial-title">14 днів безкоштовно</h2><p className="trial-sub">Встановимо трекер на 1 авто без оплати. Ви побачите маршрути, стоянки і звіти Wialon — і тільки тоді вирішите щодо всього парку.</p><div className="trial-perks"><span className="trial-perk">Без передоплати</span><span className="trial-perk">Встановлення за 1 день</span><span className="trial-perk">Техпідтримка</span><span className="trial-perk">Повний доступ Wialon</span><span className="trial-perk">Звіт після тесту</span></div><LeadForm region={region} /></div></section>;
}

function LeadForm({ region = "" }) {
  const [state, setState] = useState({ name: "", phone: "", cars: "", region, company_site: "" });
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    utmKeys.forEach((key) => {
      const value = params.get(key) || localStorage.getItem(`km_${key}`) || "";
      if (params.get(key)) localStorage.setItem(`km_${key}`, value);
    });
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (state.company_site) return;
    const payload = {
      ...state,
      page: window.location.pathname,
      savings: document.getElementById("lead-savings")?.value || "",
    };
    utmKeys.forEach((key) => { payload[key] = localStorage.getItem(`km_${key}`) || ""; });
    pushEvent("form_submit", { region: payload.region, cars: payload.cars, form_name: "trial" });
    pushEvent("Lead", { region: payload.region, cars: payload.cars, form_name: "trial" });
    try {
      await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } catch (error) {
      console.warn("Lead endpoint unavailable", error);
    }
    window.dispatchEvent(new Event("km:lead-success"));
    setState({ name: "", phone: "", cars: "", region, company_site: "" });
  };

  const update = (field, value) => setState((current) => ({ ...current, [field]: value }));

  return (
    <form className="trial-form lead-form" id="lead-form" data-form-name="trial" onSubmit={submit}>
      <input type="text" name="company_site" className="hp" tabIndex="-1" autoComplete="off" aria-hidden="true" value={state.company_site} onChange={(e) => update("company_site", e.target.value)} />
      <input type="hidden" id="lead-savings" name="savings" />
      <h3>Залишити заявку</h3>
      <div className="form-row">
        <div className="form-field"><label htmlFor="lead-name">Ім'я</label><input id="lead-name" type="text" placeholder="Іван Коваленко" value={state.name} onChange={(e) => update("name", e.target.value)} required /></div>
        <div className="form-field"><label htmlFor="lead-phone">Телефон</label><input id="lead-phone" type="tel" placeholder="+38 096 ..." value={state.phone} onChange={(e) => update("phone", e.target.value)} required /></div>
      </div>
      <div className="form-row">
        <div className="form-field"><label htmlFor="lead-cars">Кількість авто</label><select id="lead-cars" value={state.cars} onChange={(e) => update("cars", e.target.value)} required><option value="">Оберіть</option><option>1-3 авто</option><option>4-10 авто</option><option>11-30 авто</option><option>31-50 авто</option><option>50+ авто</option></select></div>
        <div className="form-field"><label htmlFor="lead-region">Регіон</label><select id="lead-region" value={state.region} onChange={(e) => update("region", e.target.value)} required><option value="">Оберіть регіон</option>{regions.map((item) => <option key={item.city}>{item.city}</option>)}<option>Інше місто</option></select></div>
      </div>
      <button className="btn btn-primary form-submit" type="submit">Отримати безкоштовний тест-драйв →</button>
      <p className="form-note">Передзвонимо за 15 хвилин · Дані заявки передаються менеджеру в Telegram</p>
    </form>
  );
}

function TestimonialsNotice() {
  return <section className="section"><div className="container"><div className="tag">💬 Відгуки</div><h2 className="title">Відгуки клієнтів</h2><div className="content-needed"><b>Потрібно отримати від КМ Трейд</b><p>3 реальні відгуки: ім'я, посада, компанія, регіон і текст 2-3 речення. До отримання даних блок не імітує вигаданих клієнтів.</p></div></div></section>;
}

function About() {
  return <section className="section local-section" id="about"><div className="container"><div className="local-inner"><div><div className="tag">📍 Про компанію</div><h2 className="title">10 років на ринку GPS-моніторингу</h2><p className="subtitle">Офіс у Чернівцях, виїзд по {regionCount} областях, техпідтримка і сервіс обладнання протягом першого року.</p><div className="local-features"><div><b>🛰 Сертифікований партнер Gurtam</b><span>Потрібен сертифікат або номер сертифікату для публікації.</span></div><div><b>📷 Фото команди / офісу</b><span>Реальні фото підвищать довіру і замінять цей службовий блок.</span></div></div></div><ContactCard /></div></div></section>;
}

function formatPhoneLabel(display) {
  if (!display.includes("58-43-85")) return display;
  const [prefix] = display.split("58-43-85");
  return (
    <>
      <span className="phone-prefix">{prefix.trimEnd()}</span>
      {" "}
      <span className="phone-accent">58-43-85</span>
    </>
  );
}

function ContactCard() {
  return (
    <div className="contact-card">
      <h3>Контакти</h3>
      <a
        className="contact-address"
        href={site.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => pushEvent("Contact", { type: "address" })}
      >
        {site.address}
      </a>
      <a href={`tel:${site.phoneSecondary}`} onClick={() => pushEvent("Contact", { phone: site.phoneSecondary })}>{formatPhoneLabel(site.phoneDisplay2)}</a>
      <a href={`tel:${site.phonePrimary}`} onClick={() => pushEvent("Contact", { phone: site.phonePrimary })}>{formatPhoneLabel(site.phoneDisplay)}</a>
      <a href={`mailto:${site.email}`}>{site.email}</a>
      <button className="btn btn-primary" type="button" onClick={() => scrollToForm()}>Залишити заявку →</button>
    </div>
  );
}

function BlogPreview({ navigate }) {
  return (
    <section className="section blog-section" id="blog">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="tag">Блог</div>
            <h2 className="title">Корисні матеріали про GPS</h2>
            <p className="subtitle blog-subtitle">Короткі статті про пальне, Wialon і контроль автопарку — без зайвого жаргону.</p>
          </div>
          <button className="btn btn-outline" type="button" onClick={() => navigate("/statti/")}>
            Всі статті →
          </button>
        </div>
        <div className="articles-grid">
          {articles.slice(0, 4).map((article) => (
            <ArticleCard key={article.slug} article={article} navigate={navigate} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RegionPage({ region, navigate }) {
  return <><section className="page-hero"><div className="container"><div className="breadcrumb"><button type="button" onClick={() => navigate("/")}>Головна</button><span>›</span><button type="button" onClick={() => navigate("/#regions")}>Регіони</button><span>›</span>{region.city}</div><div className="tag">📍 {region.oblast}</div><h1 className="title title-lg">{region.hero}</h1><p className="subtitle">{region.local} Підключаємо Wialon Local / Hosting, налаштовуємо звіти і супроводжуємо клієнта після монтажу.</p><div className="hero-actions"><button className="btn btn-primary" type="button" onClick={() => scrollToForm()}>Заявка на виїзд →</button><a className="btn btn-outline" href={`tel:${site.phonePrimary}`}>Подзвонити</a></div></div></section><section className="section"><div className="container"><div className="page-inner"><main className="article-body"><h2>GPS-моніторинг {region.inCity}: що входить</h2><p>КМ Трейд працює з автопарками від 3 авто: логістика, агро, будтехніка, таксі, доставка і корпоративний транспорт. Ми не просто продаємо трекер — встановлюємо, налаштовуємо Wialon, навчаємо диспетчера і допомагаємо читати звіти.</p><h2>Локальні ключі для пошуку</h2><ul>{region.keys.map((key) => <li key={key}>{key}</li>)}</ul><h2>Чому локальний партнер важливий</h2><p>Якщо обладнання потрібно встановити або перевірити терміново, локальна команда реагує швидше за провайдера з іншого регіону. Ваш автопарк не простоює — техпідтримка враховує специфіку маршруту і техніки.</p><CtaBox title={`Підключити автопарк ${region.inCity}`} /><h2>Рішення для регіону</h2><div className="related-articles">{industries.slice(0, 4).map((item) => <button className="related-card" type="button" key={item.slug} onClick={() => navigate(`/${item.slug}/`)}><span>{item.icon}</span><b>{item.name}</b></button>)}</div></main><aside className="sidebar"><Sidebar region={region.city} /></aside></div></div></section><TrialSection region={region.city} /></>;
}

function IndustryPage({ industry }) {
  return <><section className="page-hero"><div className="container"><div className="breadcrumb"><button type="button" onClick={() => navigate("/")}>Головна</button><span>›</span>{industry.name}</div><div className="tag">{industry.icon} {industry.name}</div><h1 className="title title-lg">{industry.title} на Заході України</h1><p className="subtitle">{industry.intro}</p><div className="hero-actions"><button className="btn btn-primary" type="button" onClick={() => scrollToForm()}>Спробувати 14 днів →</button><button className="btn btn-outline" type="button" onClick={() => navigate("/#calc")}>Порахувати економію</button></div></div></section><section className="section"><div className="container"><div className="page-inner"><main className="article-body"><h2>Функції для напряму «{industry.name}»</h2><div className="feature-grid">{industry.features.map((feature) => <div className="feature-item" key={feature}><span>{industry.icon}</span><div><h3>{feature}</h3><p>Налаштовуємо Wialon, звіти, сповіщення і контроль під конкретну техніку та процеси вашого бізнесу.</p></div></div>)}</div><h2>Як це впроваджує КМ Трейд</h2><p>Ми підбираємо трекер і датчики під конкретну техніку, монтуємо без тривалої зупинки роботи, налаштовуємо Wialon, геозони, сповіщення і звіти для керівника, диспетчера або бухгалтера.</p><h2>Покриття</h2><p>Виїжджаємо у Чернівецьку, Івано-Франківську, Тернопільську та Хмельницьку області.</p><CtaBox title={`${industry.title} — тест 14 днів`} /></main><aside className="sidebar"><Sidebar /></aside></div></div></section><TrialSection /></>;
}

function BlogPage({ navigate }) {
  return <><section className="page-hero"><div className="container"><div className="breadcrumb"><button type="button" onClick={() => navigate("/")}>Головна</button><span>›</span>Статті</div><div className="tag">📚 Блог</div><h1 className="title title-lg">Корисні статті про GPS-моніторинг</h1></div></section><section className="section"><div className="container"><div className="articles-grid">{articles.map((article) => <ArticleCard key={article.slug} article={article} navigate={navigate} />)}</div></div></section><TrialSection /></>;
}

function ArticlePage({ article, navigate }) {
  return <><section className="page-hero"><div className="container"><div className="breadcrumb"><button type="button" onClick={() => navigate("/")}>Головна</button><span>›</span><button type="button" onClick={() => navigate("/statti/")}>Статті</button><span>›</span>{article.category}</div><div className="article-meta"><span>{article.category}</span><small>{article.date} · 5 хв читання</small></div><h1 className="title title-lg">{article.title}</h1></div></section><section className="section"><div className="container"><div className="page-inner"><main className="article-body"><p className="lead">{article.excerpt}</p><h2>Що важливо знати</h2><p>{article.description}</p><h2>Як допомагає Wialon</h2><ul><li>Показує транспорт онлайн і зберігає історію маршрутів.</li><li>Фіксує пробіг, стоянки, швидкість, запалювання і датчики пального.</li><li>Дозволяє налаштовувати геозони, сповіщення і звіти під ваш бізнес.</li></ul><CtaBox title="Хочете перевірити це на своєму автопарку?" /><h2>Читайте також</h2><div className="related-articles">{articles.filter((item) => item.slug !== article.slug).slice(0, 3).map((item) => <button className="related-card" type="button" key={item.slug} onClick={() => navigate(`/statti/${item.slug}/`)}><span>{item.icon}</span><b>{item.title}</b></button>)}</div></main><aside className="sidebar"><Sidebar /></aside></div></div></section><TrialSection /></>;
}

function LegalPage({ title, kind, navigate }) {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <button type="button" onClick={() => navigate("/")}>Головна</button>
            <span>›</span>
            {title}
          </div>
          <h1 className="title title-lg">{title}</h1>
          {kind !== "oferta" && (
            <p className="subtitle">Шаблонний текст потребує юридичного погодження перед публікацією.</p>
          )}
        </div>
      </section>
      <section className="section">
        <div className="container">
          <main className="article-body legal-body">
            {kind === "oferta" ? (
              <OfertaContent />
            ) : (
              <p>Ця сторінка зарезервована для погодженого юридичного тексту КМ Трейд.</p>
            )}
          </main>
        </div>
      </section>
      <TrialSection />
    </>
  );
}

function ArticleCard({ article, navigate }) {
  return (
    <button className="article-card" type="button" onClick={() => navigate(`/statti/${article.slug}/`)}>
      <div className="article-img" aria-hidden="true">
        <span className="article-img-icon">{article.icon}</span>
      </div>
      <div className="article-body-card">
        <div className="article-meta">
          <span>{article.category}</span>
          <small>{article.date}</small>
        </div>
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
        <span className="article-card-cta">
          Читати
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </button>
  );
}

function CtaBox({ title = "Готові спробувати на своєму автопарку?" }) {
  return <div className="article-cta-box"><h3>{title}</h3><p>14 днів тест-драйву на 1 авто. Виїжджаємо по {regionCount} областях України.</p><button className="btn btn-primary" type="button" onClick={() => scrollToForm()}>Спробувати безкоштовно →</button></div>;
}

function Sidebar({ region = "Захід України" }) {
  return <div className="sidebar-card"><h3>КМ Трейд поруч</h3><div className="sidebar-stat"><span>Регіон</span><b>{region}</b></div><div className="sidebar-stat"><span>Абонплата</span><b>від 250 грн вкл. моб.зв'язок</b></div><div className="sidebar-stat"><span>Тест-драйв</span><b>14 днів</b></div><div className="sidebar-stat"><span>Сервіс</span><b>1 рік безкоштовно</b></div><button className="btn btn-primary" type="button" onClick={() => scrollToForm()}>Залишити заявку</button></div>;
}

function Footer({ navigate }) {
  return (
    <>
      <footer id="contacts">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand"><Logo navigate={navigate} variant="light" /><p className="footer-desc">GPS-моніторинг транспорту на платформі Wialon Local / Wialon Hosting. Виїзд і сервіс по {regionCount} областях України.</p><div className="footer-phones"><a className="footer-phone" href={`tel:${site.phoneSecondary}`}>{formatPhoneLabel(site.phoneDisplay2)}</a><a className="footer-phone" href={`tel:${site.phonePrimary}`}>{formatPhoneLabel(site.phoneDisplay)}</a><a className="footer-phone" href={`mailto:${site.email}`}>{site.email}</a></div></div>
            <FooterColumn title="Рішення" items={industries.slice(0, 6).map((item) => [item.name, `/${item.slug}/`])} navigate={navigate} />
            <FooterColumn title="Статті" items={articles.slice(0, 5).map((item) => [item.category, `/statti/${item.slug}/`])} navigate={navigate} />
            <FooterColumn title="Регіони" items={regions.map((item) => [item.city, `/${item.slug}/`])} navigate={navigate} />
          </div>
          <div className="footer-divider" />
          <div className="footer-bottom"><span className="footer-copy">© 2026 КМ Трейд. GPS-моніторинг транспорту на Заході України.</span><div className="footer-bottom-links"><button type="button" onClick={() => navigate("/oferta/")}>Оферта</button><button type="button" onClick={() => navigate("/konfidentsiynist/")}>Конфіденційність</button></div></div>
        </div>
      </footer>
      <div className="sticky-cta"><a href={`tel:${site.phonePrimary}`} className="btn btn-outline">📞 Дзвінок</a><button className="btn btn-primary" type="button" onClick={() => scrollToForm()}>Залишити заявку</button></div>
    </>
  );
}

function FooterColumn({ title, items, navigate }) {
  return <div><div className="footer-col-title">{title}</div><div className="footer-links">{items.map(([label, href]) => <button type="button" key={href} onClick={() => navigate(href)}>{label}</button>)}</div></div>;
}

function scrollToForm() {
  const target = document.getElementById("trial") || document.getElementById("lead-form");
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function money(value) {
  return Math.round(value).toLocaleString("uk-UA");
}

function useScrollDepth() {
  useEffect(() => {
    let maxDepth = 0;
    const onScroll = () => {
      const depth = Math.round(((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100);
      [25, 50, 75, 90].forEach((mark) => {
        if (depth >= mark && maxDepth < mark) {
          maxDepth = mark;
          pushEvent("scroll_depth", { percent: mark });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

export default App;
