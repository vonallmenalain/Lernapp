(() => {
  const displayModeQueries = ["(display-mode: standalone)", "(display-mode: fullscreen)"];

  function isStandaloneMode() {
    return displayModeQueries.some((query) => window.matchMedia(query).matches) || window.navigator.standalone === true;
  }

  function updateStandaloneMode() {
    document.documentElement.classList.toggle("standalone-mode", isStandaloneMode());
  }

  function watchDisplayMode(query) {
    const mediaQuery = window.matchMedia(query);
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateStandaloneMode);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(updateStandaloneMode);
    }
  }

  updateStandaloneMode();
  window.addEventListener("pageshow", updateStandaloneMode);
  displayModeQueries.forEach(watchDisplayMode);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js", { scope: "./" }).then((registration) => {
        registration.update().catch(() => {});
      }).catch(() => {});
    });
  }
})();
