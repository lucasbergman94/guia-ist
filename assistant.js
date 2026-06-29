/* Keyless in-site assistant for the ENKA guide.
   Retrieval over a curated bilingual Q&A (qa.json); no API key, no backend, fully private.
   Shows EN or TR based on localStorage('enka-lang'), shared with the page toggle.
   Set window.ENKA_PHASE before this script loads to prioritize a phase's questions. */
(function () {
  var DATA = [];
  var onIndex = location.pathname.endsWith("/") || location.pathname.endsWith("index.html") || location.pathname === "" || /\/$/.test(location.pathname);
  var HR = "melih.inan@enka.k12.tr";
  var lastResults = null;

  var STR = {
    en: {
      fab: "Ask the guide", head: "Ask the guide", close: "Close",
      placeholder: "Type your question… (e.g. is the visa wait normal?)",
      hint: "Answers from this guide. For anything else, contact HR.",
      go: "Go to this section ›",
      noMatch: "No direct match. Try different words, or contact HR: "
    },
    tr: {
      fab: "Rehbere sorun", head: "Rehbere sorun", close: "Kapat",
      placeholder: "Sorunuzu yazın… (örn. vize beklemesi normal mi?)",
      hint: "Yanıtlar bu rehberden gelir. Başka her şey için İK ile iletişime geçin.",
      go: "Bu bölüme git ›",
      noMatch: "Doğrudan eşleşme yok. Farklı kelimeler deneyin ya da İK ile iletişime geçin: "
    }
  };
  function getLang() { try { var s = localStorage.getItem("enka-lang"); if (s === "tr" || s === "en") return s; } catch (e) {} return "en"; }
  function S() { return STR[getLang()]; }
  function gq(it) { return (getLang() === "tr" && it.q_tr) ? it.q_tr : it.q; }
  function ga(it) { return (getLang() === "tr" && it.a_tr) ? it.a_tr : it.a; }
  function gk(it) { return (getLang() === "tr" && it.keywords_tr) ? it.keywords_tr : (it.keywords || ""); }

  function resolve(link) {
    if (!link) return null;
    if (link.charAt(0) === "#") return (onIndex ? "" : "index.html") + link;
    return link;
  }
  function esc(s) { return (s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function tokens(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9çğıöşü\s]/gi, " ").split(/\s+/).filter(function (t) { return t.length > 2; });
  }
  function score(qTokens, item) {
    var strong = (gq(item) + " " + gk(item)).toLowerCase();
    var weak = (ga(item) || "").toLowerCase();
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
      var order = ["waiting", "documents", "visa", "housing", "arrived", "travel", "any"];
      pool.sort(function (a, b) { return order.indexOf(a.phase) - order.indexOf(b.phase); });
    }
    return pool.slice(0, 5);
  }
  function itemHTML(it) {
    var href = resolve(it.link);
    return '<div class="ask-item"><div class="qq">' + esc(gq(it)) + '</div><div class="aa">' + esc(ga(it)) + '</div>' +
      (href ? '<a class="go" href="' + href + '">' + esc(S().go) + "</a>" : "") + "</div>";
  }
  function renderResults(items) {
    var box = document.getElementById("askResults");
    if (!box) return;
    lastResults = items;
    if (!items.length) {
      box.innerHTML = '<div class="ask-hint">' + esc(S().noMatch) +
        '<a class="go" href="mailto:' + HR + '">' + HR + "</a></div>";
      return;
    }
    box.innerHTML = items.map(itemHTML).join("");
  }
  function renderSuggestions() {
    var box = document.getElementById("askSugg");
    if (!box) return;
    box.innerHTML = suggestions().map(function (it) {
      return '<button type="button" data-q="' + esc(gq(it)) + '">' + esc(gq(it)) + "</button>";
    }).join("");
    box.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        var q = b.getAttribute("data-q");
        document.getElementById("askInput").value = q;
        document.getElementById("askSugg").style.display = "none";
        renderResults(search(q));
      });
    });
  }

  function applyLang() {
    var fabLbl = document.querySelector(".ask-fab .ask-lbl");
    var fab = document.querySelector(".ask-fab");
    if (fabLbl) fabLbl.textContent = S().fab;
    if (fab) fab.setAttribute("aria-label", S().fab);
    var head = document.getElementById("askHeadTitle"); if (head) head.textContent = S().head;
    var x = document.querySelector(".ask-panel .x"); if (x) x.setAttribute("aria-label", S().close);
    var inp = document.getElementById("askInput"); if (inp) inp.placeholder = S().placeholder;
    var hint = document.getElementById("askHint"); if (hint) hint.textContent = S().hint;
    var sugg = document.getElementById("askSugg");
    if (sugg && sugg.style.display !== "none") renderSuggestions();
    if (lastResults !== null) renderResults(lastResults);
  }

  function mount() {
    var fab = document.createElement("button");
    fab.className = "ask-fab"; fab.type = "button"; fab.setAttribute("aria-label", S().fab);
    fab.innerHTML = '<span class="ask-ic" aria-hidden="true">💬</span><span class="ask-lbl">' + esc(S().fab) + "</span>";
    var panel = document.createElement("div");
    panel.className = "ask-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "false"); panel.setAttribute("aria-label", S().head);
    panel.innerHTML =
      '<div class="ask-head"><span aria-hidden="true">💬</span> <span id="askHeadTitle">' + esc(S().head) + '</span><button class="x" type="button" aria-label="' + esc(S().close) + '">×</button></div>' +
      '<div class="ask-body">' +
      '<input id="askInput" class="ask-input" type="search" placeholder="' + esc(S().placeholder) + '" />' +
      '<div class="ask-hint" id="askHint">' + esc(S().hint) + '</div>' +
      '<div class="ask-results" id="askResults"></div>' +
      '<div class="ask-sugg" id="askSugg"></div>' +
      "</div>";
    document.body.appendChild(panel);
    document.body.appendChild(fab);

    function toggle(open) {
      panel.classList.toggle("open", open);
      if (open) { document.getElementById("askInput").focus(); }
      else { fab.focus(); }
    }
    fab.addEventListener("click", function () { toggle(!panel.classList.contains("open")); });
    panel.querySelector(".x").addEventListener("click", function () { toggle(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) toggle(false); });
    document.getElementById("askInput").addEventListener("input", function (e) {
      var v = e.target.value.trim();
      var sugg = document.getElementById("askSugg");
      if (!v) { lastResults = null; document.getElementById("askResults").innerHTML = ""; sugg.style.display = ""; renderSuggestions(); return; }
      sugg.style.display = "none";
      renderResults(search(v));
    });
    renderSuggestions();

    /* keep the assistant in sync with the page language toggle */
    var lt = document.getElementById("langtog");
    if (lt) lt.querySelectorAll("button").forEach(function (b) { b.addEventListener("click", function () { setTimeout(applyLang, 0); }); });
  }

  fetch("./qa.json?v=2").then(function (r) { return r.json(); }).then(function (d) {
    DATA = (d && d.items) || [];
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
    else mount();
  }).catch(function () {});
})();
