(() => {
  const displayModeQueries = ["(display-mode: standalone)", "(display-mode: fullscreen)"];
  const UPDATE_CHECK_INTERVAL = 60 * 1000;
  let lastUpdateCheck = 0;
  let hasController = "serviceWorker" in navigator && Boolean(navigator.serviceWorker.controller);
  let refreshing = false;

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

  function reloadForUpdate() {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  }

  function activateWaitingWorker(registration) {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }

  function watchForWorkerUpdates(registration) {
    activateWaitingWorker(registration);
    registration.addEventListener("updatefound", () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.addEventListener("statechange", () => {
        if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
          installingWorker.postMessage({ type: "SKIP_WAITING" });
        }
      });
    });
  }

  function checkForUpdates(registration) {
    const now = Date.now();
    if (now - lastUpdateCheck < UPDATE_CHECK_INTERVAL) return;

    lastUpdateCheck = now;
    registration.update().then(() => activateWaitingWorker(registration)).catch(() => {});
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hasController) reloadForUpdate();
      hasController = true;
    });

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "APP_UPDATED") {
        reloadForUpdate();
      }
    });

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js", { scope: "./", updateViaCache: "none" }).then((registration) => {
        watchForWorkerUpdates(registration);
        checkForUpdates(registration);
        window.addEventListener("pageshow", () => checkForUpdates(registration));
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") checkForUpdates(registration);
        });
      }).catch(() => {});
    });
  }
})();
