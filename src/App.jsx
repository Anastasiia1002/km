import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { articles, cases, certificates, industries, painCards, partners, prices, regionCitiesLine, regionCount, regionOblastsLine, regions, site, testimonials } from "./data.js";
import { OfertaContent } from "./content/oferta.jsx";
import { PrivacyContent } from "./content/privacy.jsx";
import { VEHICLE_TYPES, formatPercent, getVehicleType, monthlyFuelSavings } from "./lib/fuelSavings.js";
import { normalizePath, withBase } from "./lib/routes.js";
import { canPlacePhoneCall, telHref } from "./lib/phone.js";
import { SupportCabinetForm } from "./SupportCabinet.jsx";

const routes = {
  home: "/",
  blog: "/statti/",
};

function PhoneLink({ phone, className, children, onClick, ...rest }) {
  return (
    <a
      className={className}
      href={telHref(phone)}
      onClick={(event) => {
        // Avoid macOS / desktop FaceTime prompts — calls only on real phones.
        if (!canPlacePhoneCall()) {
          event.preventDefault();
        }
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

function pushEvent(event, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

function setMeta({ title, description, type = "website", path = "/", image = site.ogImage, jsonLd = null, robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" }) {
  document.title = title;
  upsertMeta("description", description);
  upsertMeta("robots", robots);
  upsertMeta("og:title", title, "property");
  upsertMeta("og:description", description, "property");
  upsertMeta("og:type", type, "property");
  upsertMeta("og:site_name", site.name, "property");
  upsertMeta("og:locale", "uk_UA", "property");
  upsertMeta("og:url", `${site.baseUrl}${path === "/" ? "/" : path}`, "property");
  upsertMeta("og:image", image, "property");
  upsertMeta("og:image:alt", title, "property");
  upsertMeta("twitter:card", "summary_large_image");
  upsertMeta("twitter:title", title);
  upsertMeta("twitter:description", description);
  upsertMeta("twitter:image", image);
  upsertLink("canonical", `${site.baseUrl}${path === "/" ? "/" : path}`);
  upsertJsonLd("page-jsonld", jsonLd);
}

function upsertJsonLd(id, data) {
  let tag = document.getElementById(id);
  if (!data) {
    tag?.remove();
    return;
  }
  if (!tag) {
    tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.id = id;
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(data);
}

function absoluteUrl(path = "/") {
  if (!path || path === "/") return `${site.baseUrl}/`;
  return `${site.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
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
      meta: {
        title: `${region.title} — КМ Трейд Wialon`,
        description: region.description,
        type: "website",
        path,
        jsonLd: [
          breadcrumbJsonLd([
            { name: "Головна", path: "/" },
            { name: region.city, path: `/${region.slug}/` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: region.title,
            description: region.description,
            provider: { "@type": "LocalBusiness", name: site.name, url: site.baseUrl },
            areaServed: region.oblast,
            url: absoluteUrl(`/${region.slug}/`),
          },
        ],
      },
    };
  }

  const industry = industries.find((item) => path === `/${item.slug}/`);
  if (industry) {
    return {
      type: "industry",
      data: industry,
      meta: {
        title: `${industry.title} — КМ Трейд`,
        description: industry.description,
        type: "website",
        path,
        jsonLd: [
          breadcrumbJsonLd([
            { name: "Головна", path: "/" },
            { name: industry.name, path: `/${industry.slug}/` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: industry.title,
            description: industry.description,
            provider: { "@type": "Organization", name: site.name, url: site.baseUrl },
            url: absoluteUrl(`/${industry.slug}/`),
          },
        ],
      },
    };
  }

  if (path === routes.blog) {
    return {
      type: "blog",
      meta: {
        title: "Статті про GPS-моніторинг транспорту — КМ Трейд",
        description: "Практичні статті про Wialon, контроль пального, GPS для агро, вантажівок і автопарків в Україні.",
        type: "website",
        path,
        jsonLd: breadcrumbJsonLd([
          { name: "Головна", path: "/" },
          { name: "Статті", path: "/statti/" },
        ]),
      },
    };
  }

  const article = articles.find((item) => path === `/statti/${item.slug}/`);
  if (article) {
    return {
      type: "article",
      data: article,
      meta: {
        title: `${article.title} — КМ Трейд`,
        description: article.description,
        type: "article",
        path,
        jsonLd: [
          breadcrumbJsonLd([
            { name: "Головна", path: "/" },
            { name: "Статті", path: "/statti/" },
            { name: article.title, path: `/statti/${article.slug}/` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.description,
            datePublished: article.date,
            inLanguage: "uk-UA",
            author: { "@type": "Organization", name: site.name },
            publisher: {
              "@type": "Organization",
              name: site.name,
              logo: { "@type": "ImageObject", url: site.ogImage },
            },
            mainEntityOfPage: absoluteUrl(`/statti/${article.slug}/`),
          },
        ],
      },
    };
  }

  if (path === "/online-kabinet/") {
    return {
      type: "cabinet",
      meta: {
        title: "Online-кабінет техпідтримки — КМ Трейд",
        description:
          "Заявка в техпідтримку КМ Трейд: опишіть проблему з GPS-обладнанням, додайте файли або зателефонуйте +38 050 374-74-76.",
        type: "website",
        path,
        robots: "noindex, follow",
        jsonLd: breadcrumbJsonLd([
          { name: "Головна", path: "/" },
          { name: "Online-кабінет", path: "/online-kabinet/" },
        ]),
      },
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
          : "Політика конфіденційності КМ Трейд: збір, обробка та захист персональних даних користувачів сайту.",
        type: "website",
        path,
        jsonLd: breadcrumbJsonLd([
          { name: "Головна", path: "/" },
          { name: title, path },
        ]),
      },
    };
  }

  return {
    type: "home",
    meta: {
      title: "КМ Трейд — GPS-моніторинг автопарку в Україні | Wialon",
      description:
        "Авторизований партнер Wialon / Gurtam. GPS-моніторинг транспорту у 7 областях України. Офіс у місті Чернівці. Від 250 грн з моб.зв'язком, тест 14 днів, виїзд на монтаж.",
      type: "website",
      path: "/",
      jsonLd: null,
    },
  };
}

function renderPage(page, navigate) {
  if (page.type === "region") return <RegionPage region={page.data} navigate={navigate} />;
  if (page.type === "industry") return <IndustryPage industry={page.data} navigate={navigate} />;
  if (page.type === "blog") return <BlogPage navigate={navigate} />;
  if (page.type === "article") return <ArticlePage article={page.data} navigate={navigate} />;
  if (page.type === "legal") return <LegalPage title={page.data.title} kind={page.data.kind} navigate={navigate} />;
  if (page.type === "cabinet") return <CabinetPage navigate={navigate} />;
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
      // Menu already closed: setMenuOpen(false) won't re-run the effect,
      // so execute the callback immediately instead of waiting forever.
      if (!menuOpen) {
        afterClose();
        return;
      }
      afterCloseRef.current = afterClose;
    }
    setMenuOpen(false);
  };

  const goToLeadForm = () => {
    // Never gate the CTA on the mobile-menu close effect — on desktop the menu
    // stays closed and a queued callback would never run.
    if (menuOpen) setMenuOpen(false);
    const target = document.getElementById("trial") || document.getElementById("lead-form");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        document.getElementById("lead-name")?.focus({ preventScroll: true });
      }, 450);
      return;
    }
    navigate("/#trial");
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
            <PhoneLink className="header-phone js-call" phone={site.phonePrimary} onClick={() => pushEvent("Contact", { phone: site.phonePrimary })}>
              <span className="header-phone-icon" aria-hidden="true">📞</span>
              <span className="header-phone-text">{formatPhoneLabel(site.phoneDisplay)}</span>
            </PhoneLink>
            <a
              className="btn btn-primary btn-header"
              href={withBase("/#trial")}
              onClick={(event) => {
                event.preventDefault();
                goToLeadForm();
              }}
            >
              <span className="btn-header-full">Залишити заявку</span>
              <span className="btn-header-short">Заявка</span>
            </a>
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
                      <PhoneLink className="header-mobile-phone" phone={site.phoneSecondary} onClick={() => { closeMenu(); pushEvent("Contact", { phone: site.phoneSecondary }); }}>
                        {formatPhoneLabel(site.phoneDisplay2)}
                      </PhoneLink>
                      <PhoneLink className="header-mobile-phone" phone={site.phonePrimary} onClick={() => { closeMenu(); pushEvent("Contact", { phone: site.phonePrimary }); }}>
                        {formatPhoneLabel(site.phoneDisplay)}
                      </PhoneLink>
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
      <Hero />
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
      <Testimonials />
      <About navigate={navigate} />
      <Certificates />
      <BlogPreview navigate={navigate} />
    </>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div className="hero-badge"><span /> {regionCitiesLine}</div>
          <h1 className="hero-title">
            GPS-моніторинг автопарку в 7 областях України — <em><span className="hero-accent-a">встановлення</span> <span className="hero-accent-b">сьогодні</span></em>
          </h1>
          <div className="hero-copy">
            <p className="hero-sub">
              КМ Трейд — авторизований партнер Wialon / Gurtam з міста Чернівці. Виїжджаємо по {regionOblastsLine} і допомагаємо економити пальне,
              контролювати маршрути та зменшувати втрати автопарку.
            </p>
            <div className="hero-chips">
              <span>🛰 Wialon</span>
              <span>⚡ Виїзд сьогодні</span>
              <span>🧪 Тест 14 днів</span>
            </div>
            <div className="hero-actions">
              <button className="btn btn-primary" type="button" onClick={() => scrollToForm()}>Спробувати 14 днів безкоштовно →</button>
            </div>
            <div className="hero-stats">
              <div><b>350+</b><span>клієнтів B2B</span></div>
              <div><b>4000+</b><span>підключених авто</span></div>
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
    ["🛰", "Партнер Wialon / Gurtam"],
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
            <div className="tag">Ваші болі</div>
            <h2 className="title">Вам потрібен GPS-моніторинг, якщо знайомі такі ситуації</h2>
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
            <b>Впізнали знайомі ситуації?</b>
            <p>Порахуємо орієнтовні втрати для вашого автопарку за 1 хвилину.</p>
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
  const [values, setValues] = useState({ type: "truck", count: 3, hoursPerDay: 8, daysPerMonth: 15 });
  const vehicle = getVehicleType(values.type);
  const { savings, ratePercent, costPerHour } = monthlyFuelSavings(values);
  const subscription = values.count * 250;
  const roi = subscription > 0 ? (savings / subscription).toFixed(1) : "0.0";

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
            <p className="calc-sub">Тип транспорту, кількість, години роботи на добу і дні на місяць дають орієнтир економії від GPS-контролю пального, маршрутів і дисципліни водіїв.</p>
            <div className="calc-benefits">
              {vehicle.breakdown.map((item) => (
                <span key={`${vehicle.id}-${item.label}`}>⛽ {formatPercent(item.percent)}% — {item.label}</span>
              ))}
            </div>
          </div>
          <div className="calc-box">
            <label>Тип транспорту
              <select value={values.type} onChange={(e) => update("type", e.target.value)}>
                {VEHICLE_TYPES.map((item) => (
                  <option value={item.id} key={item.id}>{item.label}</option>
                ))}
              </select>
            </label>
            <Range label="К-ть транспорту" value={values.count} min="1" max="80" onChange={(value) => update("count", value)} />
            <Range label="К-ть годин роботи на добу" value={values.hoursPerDay} min="1" max="24" onChange={(value) => update("hoursPerDay", value)} />
            <Range label="К-ть днів роботи на місяць" value={values.daysPerMonth} min="1" max="30" onChange={(value) => update("daysPerMonth", value)} />
            <div className="calc-result"><b><span className="calc-result-prefix">до</span> {money(savings)}</b><span>грн в місяць економії*</span><small>Собівартість м/год {money(costPerHour)} грн · Економія {formatPercent(ratePercent)}% · Підписка: {money(subscription)} грн/міс · ROI: {roi}x</small></div>
            <button className="btn btn-primary calc-cta" type="button" onClick={() => scrollToForm()}>Хочу заощадити до {money(savings)} грн →</button>
            <p className="info-note">Вартість трекера на 1 авто потребує уточнення від КМ Трейд; калькулятор показує абонплату й орієнтовну економію за собівартістю мотогодини.</p>
            <p className="info-note">*Це орієнтовна оцінка потенційної економії. Фактичний результат залежить від режиму роботи автопарку, дисципліни водіїв і впроваджених налаштувань контролю.</p>
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
    ["📍", "Локальність", `Ми з міста Чернівці і працюємо по ${regionCount} областях України.`],
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
        <h2 className="title">Авторизований партнер Wialon / Gurtam в Україні з виїздом сьогодні</h2>
        <p className="subtitle">Локальна команда поруч: швидкий виїзд, монтаж і підтримка без довгого очікування.</p>
        <div className="usp-grid">{usp.map(([icon, title, text]) => <article className="usp-card" key={title}><span>{icon}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        <div className="partner-strip">
          <div className="partner-logo">
            <img
              src={withBase("/assets/partners/wialon-silver-partner.png?v=official-1")}
              alt="Wialon Silver Partner"
              width="220"
              height="68"
              loading="lazy"
            />
          </div>
          <div>
            <b>Авторизований партнер Wialon / Gurtam</b>
            <span>Авторизований партнер Wialon / Gurtam в Україні з виїздом сьогодні</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CaseCard({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const needsExpand = String(item.result || "").length > 110;
  const initials = item.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <article className={`case-card${expanded ? " is-expanded" : ""}`} style={{ "--i": index }}>
      <div className="case-card-shine" aria-hidden="true" />
      <div className="case-card-top">
        <span className={`case-logo${item.brand ? ` case-logo--${item.brand}` : ""}${item.logo ? "" : " case-logo--fallback"}`} aria-hidden="true">
          {item.logo ? (
            <img src={withBase(item.logo)} alt="" width="140" height="40" loading="lazy" />
          ) : (
            <span className="case-logo-fallback">{initials}</span>
          )}
        </span>
        <span className="case-index">0{index + 1}</span>
      </div>
      <div className="case-card-meta">
        <span className="case-tag">{item.tag}</span>
        <h3>{item.name}</h3>
      </div>
      <div className="case-story">
        {item.request ? (
          <div className="case-block">
            <small>Запит</small>
            <p>{item.request}</p>
          </div>
        ) : null}
        <div className="case-block case-block-result">
          <small>Результат</small>
          <p className={needsExpand && !expanded ? "is-clamped" : undefined}>{item.result}</p>
          {needsExpand ? (
            <button
              className="case-expand"
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Згорнути" : "Читати повністю"}
            </button>
          ) : null}
        </div>
      </div>
      {item.metrics?.length ? (
        <div className="case-metrics">
          {item.metrics.map(([value, label]) => (
            <b key={`${item.name}-${value}-${label}`}>
              <span className="case-metric-value">{value}</span>
              <span className="case-metric-label">{label}</span>
            </b>
          ))}
        </div>
      ) : null}
      {item.url ? (
        <a className="case-link" href={item.url} target="_blank" rel="noopener noreferrer">
          Відкрити сайт
          <span aria-hidden="true">→</span>
        </a>
      ) : (
        <span className="case-link case-link-muted">Без публічної назви компанії</span>
      )}
    </article>
  );
}

function Cases() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const syncCarousel = () => {
    const track = trackRef.current;
    if (!track) return;
    const cards = [...track.querySelectorAll(".case-slide")];
    if (!cards.length) return;

    const mid = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let nearestDist = Infinity;
    cards.forEach((card, index) => {
      const center = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = index;
      }
    });

    setActive(nearest);
    setCanPrev(track.scrollLeft > 8);
    setCanNext(track.scrollLeft < track.scrollWidth - track.clientWidth - 8);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    syncCarousel();
    track.addEventListener("scroll", syncCarousel, { passive: true });
    window.addEventListener("resize", syncCarousel);
    return () => {
      track.removeEventListener("scroll", syncCarousel);
      window.removeEventListener("resize", syncCarousel);
    };
  }, []);

  const scrollByCard = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".case-slide");
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "18") || 18;
    const step = card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.85;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const goTo = (index) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelectorAll(".case-slide")[index];
    if (!card) return;
    const pad = Number.parseFloat(window.getComputedStyle(track).paddingInlineStart || "0") || 0;
    track.scrollTo({ left: Math.max(0, card.offsetLeft - pad), behavior: "smooth" });
  };

  return (
    <section className="section cases-section" id="cases">
      <div className="cases-atmosphere" aria-hidden="true" />
      <div className="container">
        <div className="cases-head">
          <div>
            <div className="tag">Кейси</div>
            <h2 className="title">Реальні результати клієнтів</h2>
            <p className="subtitle">Запит бізнесу, що змінилось після GPS і посилання на компанію.</p>
          </div>
          <div className="cases-controls" aria-label="Керування слайдером кейсів">
            <button className="cases-nav cases-nav--prev" type="button" aria-label="Попередній кейс" disabled={!canPrev} onClick={() => scrollByCard(-1)}>
              <span className="slider-nav-icon" aria-hidden="true"><BrandChevronIcon direction="left" /></span>
            </button>
            <button className="cases-nav cases-nav--next" type="button" aria-label="Наступний кейс" disabled={!canNext} onClick={() => scrollByCard(1)}>
              <span className="slider-nav-icon" aria-hidden="true"><BrandChevronIcon direction="right" /></span>
            </button>
          </div>
        </div>

        <ul className="cases-track" ref={trackRef} tabIndex={0} aria-label="Слайдер кейсів">
          {cases.map((item, index) => (
            <li className="case-slide" key={item.name}>
              <CaseCard item={item} index={index} />
            </li>
          ))}
        </ul>

        <div className="cases-dots" role="tablist" aria-label="Кейси">
          {cases.map((item, index) => (
            <button
              key={`${item.name}-dot`}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={`Кейс ${index + 1}: ${item.name}`}
              className={active === index ? "is-active" : undefined}
              onClick={() => goTo(index)}
            />
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
                className={`partners-item${partner.brand ? ` partners-item--${partner.brand}` : ""}`}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${partner.name} — відкрити сайт`}
              >
                <span className={`partners-logo${partner.brand ? ` partners-logo--${partner.brand}` : ""}`} aria-hidden="true">
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
  return <section className="section region-section" id="regions"><div className="container"><div className="tag">📍 Регіони</div><h2 className="title">Працюємо в західній Україні та Києві</h2><div className="region-grid">{regions.map((region) => <button className="region-card" type="button" key={region.slug} onClick={() => navigate(`/${region.slug}/`)}><b>{region.city}</b><span>{region.oblast}</span><small>Детальніше про регіон →</small></button>)}</div></div></section>;
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Заявка",
      text: "Передзвонюємо за 15 хвилин і уточнюємо регіон, тип транспорту та кількість авто.",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 4h4l2 5-2.2 1.2a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      n: "02",
      title: "Виїзд і аудит",
      text: `Безкоштовний виїзд по ${regionCount} областях.`,
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      n: "03",
      title: "Встановлення",
      text: "Монтаж трекерів за 1 день, налаштування Wialon і навчання.",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-1.9-1.9 2-2.1z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      n: "04",
      title: "Техпідтримка",
      text: "Гарантія 1 рік і допомога зі звітами.",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 12a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-1v-7a5 5 0 1 0-10 0v7H6a2 2 0 0 1-2-2v-5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 19v2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <section className="section how-section" id="process">
      <div className="how-atmosphere" aria-hidden="true" />
      <div className="container">
        <div className="how-head">
          <div className="tag">⚡ Процес</div>
          <h2 className="title">Як ми працюємо</h2>
          <p className="subtitle">Чотири зрозумілі кроки від заявки до щоденної підтримки — без зайвої бюрократії.</p>
        </div>

        <div className="how-board">
          <ol className="steps-track">
            {steps.map((step, index) => (
              <li className="step-card" key={step.n} style={{ "--i": index }}>
                <article className="step-panel">
                  <span className="step-ghost" aria-hidden="true">
                    {step.n}
                  </span>
                  <div className="step-top">
                    <span className="step-icon">{step.icon}</span>
                    <span className="step-index">Крок {step.n}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>

        <div className="how-footer">
          <p>Готові пройти цей шлях на своєму автопарку?</p>
          <button className="btn btn-primary" type="button" onClick={() => scrollToForm()}>
            Залишити заявку
          </button>
        </div>
      </div>
    </section>
  );
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

function isValidUaPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (/^0\d{9}$/.test(digits)) return true;
  if (/^380\d{9}$/.test(digits)) return true;
  return false;
}

const LEAD_API_URL =
  (import.meta.env.VITE_LEAD_API_URL || "https://km-trade.net/api/lead").replace(/\/$/, "") ||
  "https://km-trade.net/api/lead";

function LeadForm({ region = "" }) {
  const [state, setState] = useState({ name: "", phone: "", cars: "", region, company_site: "" });
  const [phoneError, setPhoneError] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
    if (!isValidUaPhone(state.phone)) {
      setPhoneError("Вкажіть номер у форматі +38 0XX XXX XX XX");
      document.getElementById("lead-phone")?.focus();
      return;
    }
    setPhoneError("");
    const leadBody = {
      name: state.name.trim(),
      phone: state.phone.trim(),
      cars: state.cars,
      region: state.region,
      company_site: state.company_site,
      page: window.location.pathname,
      savings: document.getElementById("lead-savings")?.value || "",
    };
    utmKeys.forEach((key) => {
      leadBody[key] = localStorage.getItem(`km_${key}`) || "";
    });
    pushEvent("form_submit", { region: leadBody.region, cars: leadBody.cars, form_name: "trial" });
    pushEvent("Lead", { region: leadBody.region, cars: leadBody.cars, form_name: "trial" });
    setSubmitting(true);
    try {
      const response = await fetch(LEAD_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadBody),
      });
      if (!response.ok) {
        console.warn("Lead endpoint rejected request", response.status);
      }
    } catch (error) {
      console.warn("Lead endpoint unavailable", error);
    } finally {
      setSubmitting(false);
    }
    window.dispatchEvent(new Event("km:lead-success"));
    setState({ name: "", phone: "", cars: "", region, company_site: "" });
  };

  const update = (field, value) => {
    setState((current) => ({ ...current, [field]: value }));
    if (field === "phone" && (isValidUaPhone(value) || !value)) {
      setPhoneError("");
    }
  };

  return (
    <form className="trial-form lead-form" id="lead-form" data-form-name="trial" onSubmit={submit} noValidate>
      <input type="text" name="company_site" className="hp" tabIndex="-1" autoComplete="off" aria-hidden="true" value={state.company_site} onChange={(e) => update("company_site", e.target.value)} />
      <input type="hidden" id="lead-savings" name="savings" />
      <h3>Залишити заявку</h3>
      <div className="form-row">
        <div className="form-field"><label htmlFor="lead-name">Ім'я</label><input id="lead-name" type="text" placeholder="Іван Коваленко" value={state.name} onChange={(e) => update("name", e.target.value)} required /></div>
        <div className={`form-field${phoneError ? " is-invalid" : ""}`}>
          <label htmlFor="lead-phone">Телефон</label>
          <input
            id="lead-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+38 096 ..."
            value={state.phone}
            onChange={(e) => update("phone", e.target.value)}
            onBlur={() => {
              if (state.phone && !isValidUaPhone(state.phone)) {
                setPhoneError("Вкажіть номер у форматі +38 0XX XXX XX XX");
              }
            }}
            aria-invalid={phoneError ? "true" : "false"}
            aria-describedby={phoneError ? "lead-phone-error" : undefined}
            required
          />
          {phoneError ? <p className="form-error" id="lead-phone-error" role="alert">{phoneError}</p> : null}
        </div>
      </div>
      <div className="form-row">
        <div className="form-field"><label htmlFor="lead-cars">Кількість авто</label><select id="lead-cars" value={state.cars} onChange={(e) => update("cars", e.target.value)} required><option value="">Оберіть</option><option>1-3 авто</option><option>4-10 авто</option><option>11-30 авто</option><option>31-50 авто</option><option>50+ авто</option></select></div>
        <div className="form-field"><label htmlFor="lead-region">Регіон</label><select id="lead-region" value={state.region} onChange={(e) => update("region", e.target.value)} required><option value="">Оберіть регіон</option>{regions.map((item) => <option key={item.city}>{item.city}</option>)}<option>Інше місто</option></select></div>
      </div>
      <button className="btn btn-primary form-submit" type="submit" disabled={submitting}>
        {submitting ? "Надсилаємо…" : "Отримати безкоштовний тест-драйв →"}
      </button>
      <p className="form-note">Передзвонимо за 15 хвилин · Дані заявки передаються менеджеру в Telegram</p>
    </form>
  );
}

function Testimonials() {
  const [active, setActive] = useState(0);
  const total = testimonials.length;
  const item = testimonials[active] || testimonials[0];

  const goTo = (index) => {
    const next = ((index % total) + total) % total;
    setActive(next);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const section = document.getElementById("testimonials");
      if (!section) return;
      const focusedInside = section.contains(document.activeElement);
      const inView = section.getBoundingClientRect().top < window.innerHeight && section.getBoundingClientRect().bottom > 0;
      if (!focusedInside && !inView) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(active + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(active - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, total]);

  if (!item) return null;

  const initials = item.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const roleLine = [item.role, item.company].filter(Boolean).join(", ");

  return (
    <section className="section testimonials-section" id="testimonials">
      <div className="container">
        <div className="testimonials-intro">
          <div className="tag">💬 Відгуки</div>
          <h2 className="title">Що кажуть клієнти</h2>
          <p className="subtitle">Цитати від керівників і спеціалістів, які реально працюють з КМ Трейд.</p>
        </div>

        <figure className="testimonial-feature" aria-live="polite">
          <div className="testimonial-feature-top">
            <span className="testimonial-mark" aria-hidden="true">„</span>
            <div className="testimonials-controls" aria-label="Керування відгуками">
              <button className="testimonials-nav testimonials-nav--prev" type="button" aria-label="Попередній відгук" onClick={() => goTo(active - 1)}>
                <span className="slider-nav-icon" aria-hidden="true"><BrandChevronIcon direction="left" /></span>
              </button>
              <span className="testimonials-count">{active + 1} / {total}</span>
              <button className="testimonials-nav testimonials-nav--next" type="button" aria-label="Наступний відгук" onClick={() => goTo(active + 1)}>
                <span className="slider-nav-icon" aria-hidden="true"><BrandChevronIcon direction="right" /></span>
              </button>
            </div>
          </div>

          <blockquote className="testimonial-quote">
            <p>{item.text}</p>
          </blockquote>

          <figcaption className="testimonial-author">
            <span className="testimonial-avatar" aria-hidden="true">{initials}</span>
            <span className="testimonial-author-text">
              <cite>{item.name}</cite>
              {roleLine ? <span className="testimonial-role">{roleLine}</span> : null}
              {item.region ? <span className="testimonial-region">{item.region}</span> : null}
            </span>
          </figcaption>
        </figure>

        <div className="testimonials-people" role="tablist" aria-label="Автори відгуків">
          {testimonials.map((person, index) => {
            const personMeta = [person.role, person.company].filter(Boolean).join(", ") || person.region;
            return (
              <button
                key={`${person.name}-${person.company || person.role}`}
                type="button"
                role="tab"
                aria-selected={active === index}
                className={`testimonial-person${active === index ? " is-active" : ""}`}
                onClick={() => goTo(index)}
              >
                <span className="testimonial-person-name">{person.name}</span>
                {personMeta ? <span className="testimonial-person-meta">{personMeta}</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function About({ navigate }) {
  return (
    <section className="section local-section" id="about">
      <div className="container">
        <div className="about-head">
          <div className="tag">📍 Про компанію</div>
          <h2 className="title about-title">10 років на ринку GPS-моніторингу</h2>
          <p className="subtitle about-subtitle">
            Офіс у місті Чернівці, виїзд по {regionCount} областях, техпідтримка і сервіс обладнання протягом першого року.
          </p>
        </div>
        <div className="local-inner">
          <div className="about-main">
            <div className="about-channels">
              <div className="about-channel">
                <div className="about-channel-head">
                  <span className="about-channel-icon" aria-hidden="true">
                    <AboutIconPhone />
                  </span>
                  <h3 className="about-channel-title">Відділ продажу</h3>
                </div>
                <div className="about-channel-body">
                  <PhoneLink
                    className="about-phone-line"
                    phone={site.phoneSecondary}
                    onClick={() => pushEvent("Contact", { phone: site.phoneSecondary, dept: "sales" })}
                  >
                    <span className="about-phone-num">{formatPhoneLabel(site.phoneDisplay2)}</span>
                    <span className="about-messenger-chips" aria-label="Доступно в месенджерах">
                      <span>Telegram</span>
                      <span>Viber</span>
                      <span>WhatsApp</span>
                    </span>
                  </PhoneLink>
                  <PhoneLink
                    className="about-phone-line"
                    phone={site.phonePrimary}
                    onClick={() => pushEvent("Contact", { phone: site.phonePrimary, dept: "sales" })}
                  >
                    <span className="about-phone-num">{formatPhoneLabel(site.phoneDisplay)}</span>
                  </PhoneLink>
                </div>
              </div>

              <div className="about-channel">
                <div className="about-channel-head">
                  <span className="about-channel-icon" aria-hidden="true">
                    <AboutIconSupport />
                  </span>
                  <h3 className="about-channel-title">Техпідтримка та сервіс</h3>
                </div>
                <div className="about-channel-body">
                  <PhoneLink
                    className="about-phone-line"
                    phone={site.phoneSupport}
                    onClick={() => pushEvent("Contact", { phone: site.phoneSupport, dept: "support" })}
                  >
                    <span className="about-phone-num">{formatPhoneLabel(site.phoneDisplaySupport)}</span>
                  </PhoneLink>
                  <button
                    type="button"
                    className="about-portal-link"
                    onClick={() => {
                      pushEvent("Contact", { type: "client_portal" });
                      navigate("/online-kabinet/");
                    }}
                  >
                    Online-кабінет
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="about-online">
              <div className="about-channel-head">
                <span className="about-channel-icon" aria-hidden="true">
                  <AboutIconSocial />
                </span>
                <h3 className="about-channel-title">Соцмережі</h3>
              </div>
              <div className="about-channel-body">
                <div className="about-social-list" role="list">
                  <a
                    className="about-social-link about-social-link--instagram"
                    href={site.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram КМ Трейд — відкрити в новій вкладці"
                    role="listitem"
                    onClick={() => pushEvent("Contact", { type: "instagram" })}
                  >
                    <SocialIconInstagram />
                  </a>
                  <a
                    className="about-social-link about-social-link--facebook"
                    href={site.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook КМ Трейд — відкрити в новій вкладці"
                    role="listitem"
                    onClick={() => pushEvent("Contact", { type: "facebook" })}
                  >
                    <SocialIconFacebook />
                  </a>
                  <a
                    className="about-social-link about-social-link--telegram"
                    href={site.social.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Telegram канал КМ Трейд — відкрити в новій вкладці"
                    role="listitem"
                    onClick={() => pushEvent("Contact", { type: "telegram" })}
                  >
                    <SocialIconTelegram />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <ContactCard />
        </div>
      </div>
    </section>
  );
}

function Certificates() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const syncCarousel = () => {
    const track = trackRef.current;
    if (!track) return;

    const cards = [...track.querySelectorAll(".certificate-slide")];
    if (!cards.length) return;

    const mid = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let nearestDist = Infinity;
    cards.forEach((card, index) => {
      const center = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = index;
      }
    });

    setActive(nearest);
    setCanPrev(track.scrollLeft > 8);
    setCanNext(track.scrollLeft < track.scrollWidth - track.clientWidth - 8);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    syncCarousel();
    track.addEventListener("scroll", syncCarousel, { passive: true });
    window.addEventListener("resize", syncCarousel);
    return () => {
      track.removeEventListener("scroll", syncCarousel);
      window.removeEventListener("resize", syncCarousel);
    };
  }, []);

  const scrollByCard = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".certificate-slide");
    const step = card ? card.getBoundingClientRect().width + 18 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const goTo = (index) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelectorAll(".certificate-slide")[index];
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft - 8, behavior: "smooth" });
  };

  return (
    <section className="section certificates-section" id="certificates">
      <div className="container">
        <div className="certificates-head">
          <div>
            <div className="tag">Документи</div>
            <h2 className="title">Сертифікати та авторизація</h2>
            <p className="subtitle">
              Підтвердження партнерства з Wialon / Gurtam і кваліфікації команди. Гортайте слайдер або відкрийте документ.
            </p>
          </div>
          <div className="certificates-controls" aria-label="Керування слайдером сертифікатів">
            <button
              className="certificates-nav certificates-nav--prev"
              type="button"
              aria-label="Попередній сертифікат"
              disabled={!canPrev}
              onClick={() => scrollByCard(-1)}
            >
              <span className="slider-nav-icon" aria-hidden="true"><BrandChevronIcon direction="left" /></span>
            </button>
            <button
              className="certificates-nav certificates-nav--next"
              type="button"
              aria-label="Наступний сертифікат"
              disabled={!canNext}
              onClick={() => scrollByCard(1)}
            >
              <span className="slider-nav-icon" aria-hidden="true"><BrandChevronIcon direction="right" /></span>
            </button>
          </div>
        </div>

        <div className="certificates-carousel">
          <ul className="certificates-track" ref={trackRef} tabIndex={0} aria-label="Слайдер сертифікатів">
            {certificates.map((item, index) => (
              <li className={`certificate-slide${index === active ? " is-active" : ""}`} key={item.id}>
                <a
                  className="certificate-card"
                  href={withBase(item.file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.title} — відкрити документ`}
                >
                  <span className="certificate-preview" aria-hidden="true">
                    <img src={withBase(item.preview)} alt="" width="360" height="508" loading="lazy" />
                  </span>
                  <span className="certificate-copy">
                    <b>{item.title}</b>
                    <span>{item.meta}</span>
                  </span>
                  <span className="certificate-cta">
                    Відкрити документ
                    <span aria-hidden="true">→</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="certificates-dots" role="tablist" aria-label="Позиція в слайдері">
          {certificates.map((item, index) => (
            <button
              key={item.id}
              className={`certificates-dot${index === active ? " is-active" : ""}`}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={`Сертифікат ${index + 1}: ${item.title}`}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutIconPhone() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path
        d="M8.2 4.8c.4-.4 1-.5 1.5-.3l2.1.8c.5.2.8.7.7 1.2l-.4 2a1.2 1.2 0 0 1-.7.9l-1 .4a10.4 10.4 0 0 0 4.8 4.8l.4-1c.2-.4.6-.7.9-.7l2-.4c.5-.1 1 .2 1.2.7l.8 2.1c.2.5.1 1.1-.3 1.5l-1.1 1.1c-.4.4-1 .6-1.6.5C11.2 18 6 12.8 5.2 6.5c-.1-.6.1-1.2.5-1.6l1.1-1.1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AboutIconSupport() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path d="M12 3.8a6.2 6.2 0 0 0-6.2 6.2v1.4H7a1.4 1.4 0 0 1 1.4 1.4V16A1.4 1.4 0 0 1 7 17.4H5.8A1.8 1.8 0 0 1 4 15.6v-5.6A8 8 0 0 1 12 2a8 8 0 0 1 8 8v5.6a1.8 1.8 0 0 1-1.8 1.8H17A1.4 1.4 0 0 1 15.6 16v-3.2A1.4 1.4 0 0 1 17 11.4h1.2V10A6.2 6.2 0 0 0 12 3.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10.2 19.2c.4 1.1 1.3 1.8 2.5 1.8s2.1-.7 2.5-1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AboutIconSocial() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.2 12h15.6M12 3.8c2.4 2.6 3.6 5.3 3.6 8.2s-1.2 5.6-3.6 8.2M12 3.8C9.6 6.4 8.4 9.1 8.4 12s1.2 5.6 3.6 8.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SocialIconInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" stroke="currentColor" strokeWidth="2.1" />
      <circle cx="12" cy="12" r="4.15" stroke="currentColor" strokeWidth="2.1" />
      <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
    </svg>
  );
}

function SocialIconFacebook() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      {/* Official Meta "f": slightly right-shifted, stem to the bottom edge */}
      <path d="M14.35 24V13.05h3.55l.53-4.12h-4.08V6.55c0-1.19.33-2 2.04-2H18.5V.28C18.02.22 16.74 0 15.25 0 12.12 0 10 1.9 10 5.4v3.53H6.5v4.12H10V24h4.35Z" />
    </svg>
  );
}

function SocialIconTelegram() {
  return (
    <svg viewBox="48 66 132 116" width="22" height="22" aria-hidden="true">
      {/* Official Telegram paper plane mark */}
      <path
        d="M81.229 128.772 95.466 168.178s1.78 3.687 3.686 3.687 30.255-29.492 30.255-29.492l31.525-60.89-79.703 37.289Z"
        fill="#c8daea"
      />
      <path
        d="M100.106 138.878 97.373 167.924s-1.144 8.9 7.754 0 17.415-15.763 17.415-15.763"
        fill="#a9c6d8"
      />
      <path
        d="M81.486 130.178 52.2 120.636s-3.5-1.42-2.373-4.64c.232-.664.7-1.229 2.1-2.2 6.489-4.523 120.106-45.36 120.106-45.36s3.208-1.081 5.1-.362a2.766 2.766 0 0 1 1.885 2.055 9.357 9.357 0 0 1 .254 2.585c-.009.752-.1 1.449-.169 2.542-.692 11.165-21.4 94.493-21.4 94.493s-1.239 4.876-5.678 5.043a8.13 8.13 0 0 1-5.825-2.149c-8.711-7.493-38.819-27.727-45.472-32.177a1.27 1.27 0 0 1-.546-.9c-.093-.469.417-1.05.417-1.05s52.426-46.6 53.821-51.492c.108-.379-.3-.566-.848-.4-3.482 1.281-63.844 39.4-70.506 43.607a3.21 3.21 0 0 1-1.58 1.147Z"
        fill="#fff"
      />
    </svg>
  );
}

/** Brandbook chevron tile used for slider controls (K/M mark language). */
function BrandChevronIcon({ direction = "left" }) {
  const isLeft = direction === "left";
  const isRight = direction === "right";
  const rotate = isRight ? "180" : isLeft ? "0" : "270";

  return (
    <svg className="brand-chevron-icon" viewBox="0 0 30 30" width="22" height="22" aria-hidden="true">
      <g transform={`rotate(${rotate} 15 15)`}>
        <path
          d="M21.6 8.1 11.2 14.7a1.55 1.55 0 0 0 0 2.6L21.6 23.9"
          fill="none"
          stroke="currentColor"
          strokeWidth="5.4"
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
        <path
          d="M11.2 16 21.6 22.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="5.4"
          strokeLinecap="butt"
          opacity="0.55"
        />
      </g>
    </svg>
  );
}

function formatPhoneLabel(display) {
  const match = String(display).match(/^(\+38)\s+(\d{3})\s+(\d{3}-\d{2}-\d{2})$/);
  if (!match) return display;

  const [, country, operator, local] = match;
  const accent = "58-43-85";
  const localHead = local.endsWith(accent) ? local.slice(0, -accent.length) : null;
  const isAccented = localHead !== null;

  // Accented sales numbers: "+38 0961 58-43-85" (space after the 1, not after operator).
  return (
    <span className={`phone-label${isAccented ? "" : " phone-label--plain"}`}>
      <span className="phone-cc">{country}</span>
      <span className="phone-op">{isAccented ? `${operator}${localHead}` : operator}</span>
      <span className="phone-num">
        {isAccented ? <span className="phone-accent">{accent}</span> : local}
      </span>
    </span>
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
      <div className="phone-stack">
        <PhoneLink phone={site.phoneSecondary} onClick={() => pushEvent("Contact", { phone: site.phoneSecondary })}>
          {formatPhoneLabel(site.phoneDisplay2)}
        </PhoneLink>
        <PhoneLink phone={site.phonePrimary} onClick={() => pushEvent("Contact", { phone: site.phonePrimary })}>
          {formatPhoneLabel(site.phoneDisplay)}
        </PhoneLink>
      </div>
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
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <button type="button" onClick={() => navigate("/")}>Головна</button>
            <span>›</span>
            <button type="button" onClick={() => navigate("/#regions")}>Регіони</button>
            <span>›</span>
            {region.city}
          </div>
          <div className="tag">📍 {region.oblast}</div>
          <h1 className="title title-lg">{region.hero}</h1>
          <p className="subtitle">
            {region.local} Підключаємо Wialon Local / Hosting, налаштовуємо звіти і супроводжуємо клієнта після монтажу.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button" onClick={() => scrollToForm()}>
              Заявка на виїзд →
            </button>
            <PhoneLink className="btn btn-outline" phone={site.phonePrimary}>Подзвонити</PhoneLink>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="page-inner">
            <main className="article-body">
              <h2>GPS-моніторинг {region.inCity}: що входить</h2>
              <p>
                КМ Трейд працює з автопарками від 3 авто: логістика, агро, будтехніка, таксі, доставка і корпоративний транспорт. Ми не просто продаємо трекер — встановлюємо, налаштовуємо Wialon, навчаємо диспетчера і допомагаємо читати звіти.
              </p>
              <h2>Чому локальний партнер важливий</h2>
              <p>
                Якщо обладнання потрібно встановити або перевірити терміново, локальна команда реагує швидше за провайдера з іншого регіону. Ваш автопарк не простоює — техпідтримка враховує специфіку маршруту і техніки.
              </p>
              <CtaBox title={`Підключити автопарк ${region.inCity}`} />
              <h2>Рішення для регіону</h2>
              <div className="related-articles">
                {industries.slice(0, 4).map((item) => (
                  <button
                    className="related-card"
                    type="button"
                    key={item.slug}
                    onClick={() => navigate(`/${item.slug}/`)}
                  >
                    <span>{item.icon}</span>
                    <b>{item.name}</b>
                  </button>
                ))}
              </div>
            </main>
            <aside className="sidebar">
              <Sidebar region={region.city} />
            </aside>
          </div>
        </div>
      </section>
      <TrialSection region={region.city} />
    </>
  );
}

function IndustryPage({ industry, navigate }) {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <button type="button" onClick={() => navigate("/")}>Головна</button>
            <span>›</span>
            {industry.name}
          </div>
          <div className="tag">{industry.icon} {industry.name}</div>
          <h1 className="title title-lg">{industry.title} в Україні</h1>
          <p className="subtitle">{industry.intro}</p>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button" onClick={() => scrollToForm()}>
              Спробувати 14 днів →
            </button>
            <button className="btn btn-outline" type="button" onClick={() => navigate("/#calc")}>
              Порахувати економію
            </button>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="page-inner">
            <main className="article-body">
              <h2>Функції для напряму «{industry.name}»</h2>
              <div className="feature-grid">
                {industry.features.map((feature) => (
                  <div className="feature-item" key={feature}>
                    <span>{industry.icon}</span>
                    <div>
                      <h3>{feature}</h3>
                      <p>Налаштовуємо Wialon, звіти, сповіщення і контроль під конкретну техніку та процеси вашого бізнесу.</p>
                    </div>
                  </div>
                ))}
              </div>
              <h2>Як це впроваджує КМ Трейд</h2>
              <p>
                Ми підбираємо трекер і датчики під конкретну техніку, монтуємо без тривалої зупинки роботи, налаштовуємо Wialon, геозони, сповіщення і звіти для керівника, диспетчера або бухгалтера.
              </p>
              <h2>Покриття</h2>
              <p>Виїжджаємо у Чернівецьку, Івано-Франківську, Тернопільську та Хмельницьку області.</p>
              <CtaBox title={`${industry.title} — тест 14 днів`} />
            </main>
            <aside className="sidebar">
              <Sidebar />
            </aside>
          </div>
        </div>
      </section>
      <TrialSection />
    </>
  );
}

function BlogPage({ navigate }) {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <button type="button" onClick={() => navigate("/")}>Головна</button>
            <span>›</span>
            Статті
          </div>
          <div className="tag">📚 Блог</div>
          <h1 className="title title-lg">Корисні статті про GPS-моніторинг</h1>
          <p className="subtitle">Практичні матеріали про контроль пального, Wialon, окупність GPS і роботу автопарку.</p>
        </div>
      </section>
      <section className="section blog-listing">
        <div className="container">
          <div className="articles-grid">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} navigate={navigate} />
            ))}
          </div>
        </div>
      </section>
      <TrialSection />
    </>
  );
}

function ArticlePage({ article, navigate }) {
  const related = articles.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <button type="button" onClick={() => navigate("/")}>Головна</button>
            <span>›</span>
            <button type="button" onClick={() => navigate("/statti/")}>Статті</button>
            <span>›</span>
            {article.category}
          </div>
          <div className="article-meta article-meta-hero">
            <span>{article.category}</span>
            <small>{article.date} · 5 хв читання</small>
          </div>
          <h1 className="title title-lg">{article.title}</h1>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="page-inner">
            <main className="article-body">
              <p className="lead">{article.excerpt}</p>
              <h2>Що важливо знати</h2>
              <p>{article.description}</p>
              <h2>Як допомагає Wialon</h2>
              <ul>
                <li>Показує транспорт онлайн і зберігає історію маршрутів.</li>
                <li>Фіксує пробіг, стоянки, швидкість, запалювання і датчики пального.</li>
                <li>Дозволяє налаштовувати геозони, сповіщення і звіти під ваш бізнес.</li>
              </ul>
              <CtaBox title="Хочете перевірити це на своєму автопарку?" />
              <h2>Читайте також</h2>
              <div className="related-articles">
                {related.map((item) => (
                  <button
                    className="related-card"
                    type="button"
                    key={item.slug}
                    onClick={() => navigate(`/statti/${item.slug}/`)}
                  >
                    <span>{item.icon}</span>
                    <b>{item.title}</b>
                  </button>
                ))}
              </div>
            </main>
            <aside className="sidebar">
              <Sidebar />
            </aside>
          </div>
        </div>
      </section>
      <TrialSection />
    </>
  );
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
        </div>
      </section>
      <section className="section">
        <div className="container">
          <main className="article-body legal-body">
            {kind === "oferta" ? <OfertaContent /> : <PrivacyContent />}
          </main>
        </div>
      </section>
      <TrialSection />
    </>
  );
}

function CabinetPage({ navigate }) {
  return (
    <>
      <section className="page-hero cabinet-page-hero">
        <div className="container">
          <div className="breadcrumb">
            <button type="button" onClick={() => navigate("/")}>
              Головна
            </button>
            <span>›</span>
            Online-кабінет
          </div>
          <div className="tag">Техпідтримка</div>
          <h1 className="title title-lg">Online-кабінет</h1>
          <p className="subtitle cabinet-page-lead">
            Шановний клієнт! Заповніть форму або зателефонуйте за номером{" "}
            <a className="cabinet-page-phone" href={`tel:${site.phoneSupport}`}>
              {site.phoneDisplaySupport}
            </a>{" "}
            для реєстрації звернення щодо GPS-обладнання чи сервісу.
          </p>
        </div>
      </section>
      <section className="section cabinet-page-section">
        <div className="container cabinet-page-layout">
          <SupportCabinetForm />
          <aside className="cabinet-page-aside" aria-label="Контакти техпідтримки">
            <div className="cabinet-aside-card">
              <h2>Як ми допомагаємо</h2>
              <ul>
                <li>Приймаємо заявки з описом і файлами</li>
                <li>Передзвонюємо в робочий час</li>
                <li>Виїзд і віддалена діагностика за потреби</li>
              </ul>
              <PhoneLink
                className="btn btn-outline cabinet-aside-call"
                phone={site.phoneSupport}
                onClick={() => pushEvent("Contact", { phone: site.phoneSupport, dept: "support", source: "cabinet_page" })}
              >
                {formatPhoneLabel(site.phoneDisplaySupport)}
              </PhoneLink>
            </div>
          </aside>
        </div>
      </section>
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

function Sidebar({ region = "захід України" }) {
  return <div className="sidebar-card"><h3>КМ Трейд поруч</h3><div className="sidebar-stat"><span>Регіон</span><b>{region}</b></div><div className="sidebar-stat"><span>Абонплата</span><b>від 250 грн вкл. моб.зв'язок</b></div><div className="sidebar-stat"><span>Тест-драйв</span><b>14 днів</b></div><div className="sidebar-stat"><span>Сервіс</span><b>1 рік безкоштовно</b></div><button className="btn btn-primary" type="button" onClick={() => scrollToForm()}>Залишити заявку</button></div>;
}

function Footer({ navigate }) {
  return (
    <>
      <footer id="contacts">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Logo navigate={navigate} variant="light" />
              <p className="footer-desc">
                GPS-моніторинг транспорту на платформі Wialon Local / Wialon Hosting. Виїзд і сервіс по {regionCount} областях України.
              </p>
              <div className="footer-phones">
                <div className="phone-stack">
                  <PhoneLink className="footer-phone" phone={site.phoneSecondary}>
                    {formatPhoneLabel(site.phoneDisplay2)}
                  </PhoneLink>
                  <PhoneLink className="footer-phone" phone={site.phonePrimary}>
                    {formatPhoneLabel(site.phoneDisplay)}
                  </PhoneLink>
                </div>
                <a className="footer-phone" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
                <div className="footer-support">
                  <div className="footer-support-label" id="footer-support-label">
                    Техпідтримка та сервіс
                  </div>
                  <PhoneLink
                    className="footer-phone footer-support-phone"
                    phone={site.phoneSupport}
                    aria-labelledby="footer-support-label"
                    onClick={() => pushEvent("Contact", { phone: site.phoneSupport, dept: "support" })}
                  >
                    {formatPhoneLabel(site.phoneDisplaySupport)}
                  </PhoneLink>
                  <button
                    type="button"
                    className="footer-portal-link"
                    aria-label="Відкрити Online-кабінет клієнта"
                    onClick={() => {
                      pushEvent("Contact", { type: "client_portal", source: "footer" });
                      navigate("/online-kabinet/");
                    }}
                  >
                    Online-кабінет
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </div>
            <FooterColumn title="Рішення" items={industries.slice(0, 6).map((item) => [item.name, `/${item.slug}/`])} navigate={navigate} />
            <FooterColumn title="Статті" items={articles.slice(0, 5).map((item) => [item.category, `/statti/${item.slug}/`])} navigate={navigate} />
            <FooterColumn title="Регіони" items={regions.map((item) => [item.city, `/${item.slug}/`])} navigate={navigate} />
          </div>
          <div className="footer-divider" />
          <div className="footer-bottom"><span className="footer-copy">© 2026 КМ Трейд. GPS-моніторинг транспорту на заході України.</span><div className="footer-bottom-links"><button type="button" onClick={() => navigate("/oferta/")}>Оферта</button><button type="button" onClick={() => navigate("/konfidentsiynist/")}>Конфіденційність</button></div></div>
        </div>
      </footer>
      <div className="sticky-cta"><PhoneLink phone={site.phonePrimary} className="btn btn-outline">📞 Дзвінок</PhoneLink><button className="btn btn-primary" type="button" onClick={() => scrollToForm()}>Залишити заявку</button></div>
    </>
  );
}

function FooterColumn({ title, items, navigate }) {
  return <div><div className="footer-col-title">{title}</div><div className="footer-links">{items.map(([label, href]) => <button type="button" key={href} onClick={() => navigate(href)}>{label}</button>)}</div></div>;
}

function scrollToForm() {
  const target = document.getElementById("trial") || document.getElementById("lead-form");
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    document.getElementById("lead-name")?.focus({ preventScroll: true });
  }, 450);
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
