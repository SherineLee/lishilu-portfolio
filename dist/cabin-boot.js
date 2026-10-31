/* 3D 小屋入口的按需加载器：只在需要时下载 cabin.js / cabin.css */
(function () {
  var KEY = 'sherine-cabin-visited';
  var edit = /[?&]edit=1/.test(location.search || '');
  var hash = (location.hash || '').replace(/^#/, '');
  var auto = !edit && (!hash || hash === 'home' || hash.indexOf('home/') === 0);
  var pending = null;
  if(auto){document.documentElement.classList.add('cabin-loading');var cover=document.createElement('style');cover.textContent='html.cabin-loading body{background:#eaf1f7}html.cabin-loading body>header,html.cabin-loading body>main,html.cabin-loading body>footer,html.cabin-loading .edge{visibility:hidden}';document.head.appendChild(cover);}

  function ensureCss() {
    if (document.getElementById('cb-css')) return;
    var link = document.createElement('link');
    link.id = 'cb-css'; link.rel = 'stylesheet'; link.href = 'cabin.css?v=controls-3';
    document.head.appendChild(link);
  }

  function load(cb) {
    if (window.Cabin) { cb && cb(); return; }
    ensureCss();
    if (pending) { pending.push(cb); return; }
    pending = [cb];
    var script = document.createElement('script');
    script.src = 'cabin.js?v=art-3';
    script.async = true;
    script.onload = function () {
      var list = pending; pending = null;
      (list || []).forEach(function (fn) { fn && fn(); });
    };
    script.onerror = function () { pending = null; document.documentElement.classList.remove('cabin-loading'); };
    document.head.appendChild(script);
  }

  function mountButton() {
    ensureCss();
    if (document.querySelector('.cabin-return')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cabin-return' + (edit ? ' cr-top' : '');
    btn.innerHTML = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 7 7 22h5v19h24V22h5L24 7Z"/><path d="M19 41V28h10v13" class="cr-door"/></svg><span>回到小屋</span>';
    btn.setAttribute('aria-label', '回到雪地小屋');
    btn.addEventListener('click', function () {
      load(function () { window.Cabin && window.Cabin.enterHall(); });
    });
    document.body.appendChild(btn);
    document.body.classList.add('has-cabin-btn');

  }

  function boot() {
    // 编辑模式专注于改内容，不挂浮标也不自动加载 3D
    if (edit) return;
    mountButton();
    if (!auto) return;
    var visited = false;
    try { visited = sessionStorage.getItem(KEY) === '1'; } catch (e) { /* ignore */ }
    load(function () { if(window.Cabin)Promise.resolve(window.Cabin.start(visited ? 'hall' : 'snow')).finally(function(){document.documentElement.classList.remove('cabin-loading');});else document.documentElement.classList.remove('cabin-loading'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
