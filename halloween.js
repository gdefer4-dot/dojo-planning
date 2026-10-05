(function () {
  'use strict';
  function actualiserTheme() {
    const octobre = new Intl.DateTimeFormat('fr-FR', {timeZone: 'Europe/Paris', month: 'numeric'}).format(new Date()) === '10';
    document.documentElement.classList.toggle('halloween', octobre);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = octobre ? '#21132f' : '#0f172a';
  }
  actualiserTheme();
  document.addEventListener('visibilitychange', actualiserTheme);
  setInterval(actualiserTheme, 60000);
})();
