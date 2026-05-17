import { initSettingsUI } from './settings-ui.js';

initSettingsUI();

(function () {
  var btns = document.querySelectorAll('.tab-btn');
  var contents = document.querySelectorAll('.tab-content');
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btns.forEach(function (b) { b.classList.remove('tab-active') });
      contents.forEach(function (c) { c.classList.remove('tab-content-active') });
      btn.classList.add('tab-active');
      var target = document.getElementById('tab-' + btn.getAttribute('data-tab'));
      if (target) target.classList.add('tab-content-active');
    });
  });
})();
