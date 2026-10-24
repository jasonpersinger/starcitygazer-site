// Theme toggle. The reader's choice overrides the system setting and is kept
// only in this browser (localStorage); nothing is sent anywhere, and no cookies
// are used. Without JavaScript the system setting applies and the button stays
// hidden. Loaded in <head> so a stored choice applies before the page paints.
(function () {
  var KEY = "starcitygazer-theme";
  var root = document.documentElement;
  var stored = null;
  try { stored = window.localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }
  if (stored === "light" || stored === "dark") { root.setAttribute("data-theme", stored); }

  function effective() {
    var chosen = root.getAttribute("data-theme");
    if (chosen === "light" || chosen === "dark") { return chosen; }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector(".theme-toggle");
    if (!button) { return; }
    function label() {
      var next = effective() === "dark" ? "light" : "dark";
      button.textContent = next === "dark" ? "Dark theme" : "Light theme";
      button.setAttribute("aria-label", "Switch to " + next + " theme");
    }
    label();
    button.hidden = false;
    button.addEventListener("click", function () {
      var next = effective() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { window.localStorage.setItem(KEY, next); } catch (e) { /* storage blocked */ }
      label();
    });
  });
})();
