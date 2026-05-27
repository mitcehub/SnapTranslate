import { initSettingsUI } from './settings-ui.js';

initSettingsUI();

document.getElementById("checkUpdateBtn")?.addEventListener("click", () => {
  const btn = document.getElementById("checkUpdateBtn");
  const status = document.getElementById("updateStatus");
  btn.disabled = true;
  status.textContent = "检查中...";
  chrome.runtime.sendMessage({ action: "checkUpdate" }, (r) => {
    btn.disabled = false;
    if (r?.hasUpdate) {
      status.textContent = ''; status.insertAdjacentHTML('beforeend', `发现新版本 <a href="${r.url}" target="_blank">v${r.latest}</a>（当前 v${r.current}）`);
    } else if (r?.error) {
      status.textContent = "检查失败: " + r.error;
    } else {
      status.textContent = "已是最新版本 v" + r?.current;
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
