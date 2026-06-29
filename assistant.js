/* Keyless in-site assistant for the ENKA guide.
   Retrieval over a curated Q&A (qa.json) — no API key, no backend, fully private.
   Set window.ENKA_PHASE before this script loads to prioritize a phase's questions. */
(function () {
  var DATA = [];
  var onIndex = location.pathname.endsWith("/") || location.pathname.endsWith("index.html") || location.pathname === "" || /\/$/.test(location.pathname);
  var HR = "melih.inan@enka.k12.tr";

  function resolve(link) {
    if (!link) return null;
    if (link.charAt(0) === "#") return (onIndex ? "" : "index.html") + link;
    return link;
  }
  function esc(s) { return (s || "").replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  function tokens(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9çğıöşü\s]/gi, " ").split(/\s+/).filter(function (t) { return t.length > 2; });
  }
  function score(qTokens, item) {
    var strong = (item.q + " " + (item.keywords || "")).toLowerCase();
    var weak = (item.a || "").toLowerCase();
    var s = 0;
    qTokens.forEach(function (t) {
      if (strong.indexOf(t) !== -1) s += 3;
      else if (weak.indexOf(t) !== -1) s += 1;
    });
    return s;
  }
  function search(q) {
    var qt = tokens(q);
    if (!qt.length) return [];
    return DATA.map(function (it) { return { it: it, s: score(qt, it) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 3).map(function (r) { return r.it; });
  }
  function suggestions() {
    var ph = window.ENKA_PHASE;
    var pool = DATA.slice();
    if (ph) {
      var inPhase = pool.filter(function (i) { return i.phase === ph; });
      var rest = pool.filter(function (i) { return i.phase !== ph; });
      pool = inPhase.concat(rest);
    } else {
      // sensible defaults across the journey
      var order = ["waiting", "documents", "visa", "housing", "arrived", "travel", "any"];
      pool.sort(function (a, b) { return order.indexOf(a.phase) - order.indexOf(b.phase); });
    }
    return pool.slice(0, 5);
  }
  function itemHTML(it) {
    var href = resolve(it.link);
    return '<div class="ask-item"><div class="qq">' + esc(it.q) + '</div><div class="aa">' + esc(it.a) + '</div>' +
      (href ? '<a class="go" href="' + href + '">Go to this section ›</a>' : "") + "</div>";
  }
  function renderResults(items, query) {
    var box = document.getElementById("askResults");
    if (!items.length) {
      box.innerHTML = '<div class="ask-hint">No direct match. Try different words, or contact HR: ' +
        '<a class="go" href="mailto:' + HR + '">' + HR + "</a></div>";
      return;
    }
    box.innerHTML = items.map(itemHTML).join("");
  }
  function renderSuggestions() {
    var box = document.getElementById("askSugg");
    box.innerHTML = suggestions().map(function (it) {
      return '<button type="button" data-q="' + esc(it.q) + '">' + esc(it.q) + "</button>";
    }).join("");
    box.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        document.getElementById("askInput").value = b.getAttribute("data-q");
        document.getElementById("askSugg").style.display = "none";
        renderResults(search(b.getAttribute("data-q")));
      });
    });
  }

  function mount() {
    var fab = document.createElement("button");
    fab.className = "ask-fab"; fab.type = "button";
    fab.innerHTML = "💬 Ask the guide";
    var panel = document.createElement("div");
    panel.className = "ask-panel";
    panel.innerHTML =
      '<div class="ask-head">💬 Ask the guide<button class="x" type="button" aria-label="Close">×</button></div>' +
      '<div class="ask-body">' +
      '<input id="askInput" class="ask-input" type="search" placeholder="Type your question… (e.g. is the visa wait normal?)" />' +
      '<div class="ask-hint">Answers from this guide. For anything else, contact HR.</div>' +
      '<div class="ask-results" id="askResults"></div>' +
      '<div class="ask-sugg" id="askSugg"></div>' +
      "</div>";
    document.body.appendChild(panel);
    document.body.appendChild(fab);

    function toggle(open) { panel.classList.toggle("open", open); if (open) document.getElementById("askInput").focus(); }
    fab.addEventListener("click", function () { toggle(!panel.classList.contains("open")); });
    panel.querySelector(".x").addEventListener("click", function () { toggle(false); });
    document.getElementById("askInput").addEventListener("input", function (e) {
      var v = e.target.value.trim();
      var sugg = document.getElementById("askSugg");
      if (!v) { document.getElementById("askResults").innerHTML = ""; sugg.style.display = ""; return; }
      sugg.style.display = "none";
      renderResults(search(v));
    });
    renderSuggestions();
  }

  fetch("./qa.json").then(function (r) { return r.json(); }).then(function (d) {
    DATA = (d && d.items) || [];
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
    else mount();
  }).catch(function () {});
})();
