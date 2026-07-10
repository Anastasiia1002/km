(function () {
  "use strict";

  const accordion = document.getElementById("accordion");
  if (!accordion) return;

  const cards = Array.from(accordion.querySelectorAll(".card"));
  const mobileQuery = window.matchMedia("(max-width: 900px)");
  let activeIndex = cards.findIndex((card) => card.classList.contains("is-active"));
  if (activeIndex < 0) activeIndex = 0;

  function isMobile() {
    return mobileQuery.matches;
  }

  function setActive(index, { focusTab = false } = {}) {
    if (index < 0 || index >= cards.length) return;

    activeIndex = index;

    cards.forEach((card, cardIndex) => {
      const isActive = cardIndex === index;
      card.classList.toggle("is-active", isActive);

      const tab = card.querySelector(".card-tab");
      if (tab) {
        tab.setAttribute("aria-expanded", String(isActive));
        if (focusTab && isActive) tab.focus({ preventScroll: true });
      }
    });
  }

  function bindDesktopHover() {
    cards.forEach((card, index) => {
      card.addEventListener("mouseenter", () => {
        if (!isMobile()) setActive(index);
      });
    });

    accordion.addEventListener("mouseleave", () => {
      if (!isMobile()) setActive(0);
    });
  }

  function bindMobileTap() {
    cards.forEach((card, index) => {
      const tab = card.querySelector(".card-tab");
      if (!tab) return;

      tab.addEventListener("click", () => {
        if (!isMobile()) return;
        setActive(card.classList.contains("is-active") ? index : index);
      });

      card.addEventListener("click", (event) => {
        if (!isMobile()) return;
        if (card.classList.contains("is-active")) return;
        if (event.target.closest(".card-tab")) return;
        setActive(index);
      });
    });
  }

  function handleViewportChange() {
    if (isMobile()) {
      setActive(activeIndex);
      return;
    }

    setActive(activeIndex < 0 ? 0 : activeIndex);
  }

  mobileQuery.addEventListener("change", handleViewportChange);
  bindDesktopHover();
  bindMobileTap();
  setActive(activeIndex);
})();
