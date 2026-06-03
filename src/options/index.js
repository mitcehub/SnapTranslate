import { initSettingsUI } from './settings-ui.js';

initSettingsUI();

document.getElementById('extVersion').textContent = 'v' + chrome.runtime.getManifest().version;

document.getElementById("checkUpdateBtn")?.addEventListener("click", () => {
  const btn = document.getElementById("checkUpdateBtn");
  const status = document.getElementById("updateStatus");
  btn.disabled = true;
  status.textContent = "...";
  chrome.runtime.sendMessage({ action: "checkUpdate" }, (r) => {
    btn.disabled = false;
    if (r?.hasUpdate) {
      status.innerHTML = `v${r.latest}`;
    } else if (r?.error) {
      status.textContent = "Error";
    } else {
      status.textContent = "v" + r?.current;
    }
  });
});

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
