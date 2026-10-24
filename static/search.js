// Search with Pagefind's JavaScript API. Results are built with DOM methods
// only (no innerHTML); excerpts are parsed inertly and only their text and
// <mark> highlights are kept; result links must stay inside this site.
(function () {
  var form = document.getElementById("search-form");
  if (!form) { return; }
  var input = document.getElementById("search-input");
  var status = document.getElementById("search-status");
  var list = document.getElementById("search-results");
  var base = form.getAttribute("data-base") || "/";
  var loading = null;
  var latest = 0;

  function pagefind() {
    if (!loading) {
      loading = import(form.getAttribute("data-pagefind")).then(function (pf) {
        return Promise.resolve(pf.options ? pf.options({ baseUrl: base }) : null).then(function () { return pf; });
      });
    }
    return loading;
  }

  function excerpt(node, html) {
    var doc = new DOMParser().parseFromString("<p>" + html + "</p>", "text/html");
    doc.body.firstChild.childNodes.forEach(function (child) {
      if (child.nodeType === Node.TEXT_NODE) {
        node.appendChild(document.createTextNode(child.textContent));
      } else if (child.nodeName === "MARK") {
        var mark = document.createElement("mark");
        mark.textContent = child.textContent;
        node.appendChild(mark);
      } else {
        node.appendChild(document.createTextNode(child.textContent || ""));
      }
    });
  }

  function safeUrl(url) {
    return typeof url === "string" && url.indexOf(base) === 0 && url.indexOf("//") === -1 ? url : null;
  }

  function show(items, query) {
    list.replaceChildren();
    items.forEach(function (item) {
      var url = safeUrl(item.url);
      if (!url) { return; }
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = url;
      a.textContent = (item.meta && item.meta.title) || url;
      var p = document.createElement("p");
      excerpt(p, item.excerpt || "");
      li.appendChild(a);
      li.appendChild(p);
      list.appendChild(li);
    });
    var n = list.children.length;
    status.textContent = query ? (n === 1 ? "1 meeting matches" : n + " meetings match") + " “" + query + "”." : "";
  }

  function run(query) {
    var ticket = ++latest;
    query = query.trim();
    if (!query) { show([], ""); return; }
    status.textContent = "Searching…";
    pagefind().then(function (pf) { return pf.search(query); }).then(function (search) {
      return Promise.all(search.results.slice(0, 20).map(function (r) { return r.data(); }));
    }).then(function (items) {
      if (ticket === latest) { show(items, query); }
    }).catch(function () {
      if (ticket === latest) { status.textContent = "Search is not available right now. Every meeting is listed in the archive."; }
    });
  }

  var timer = null;
  input.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(function () { run(input.value); }, 250);
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var params = new URLSearchParams(window.location.search);
    params.set("q", input.value);
    window.history.replaceState(null, "", "?" + params.toString());
    run(input.value);
  });
  var initial = new URLSearchParams(window.location.search).get("q");
  if (initial) { input.value = initial; run(initial); }
})();
