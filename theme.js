/* Theme toggle with persistence. Default light. */
(function () {
  var KEY = "enka-theme";
  var root = document.documentElement;
  try { var s = localStorage.getItem(KEY); if (s) root.setAttribute("data-theme", s); } catch (e) {}
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".switch")) return;
    var cur = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", cur);
    try { localStorage.setItem(KEY, cur); } catch (e) {}
  });
})();
