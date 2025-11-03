// ====== Apps Script /exec のURL ======
const ENDPOINT = "https://script.google.com/macros/s/AKfycbwY2gQhaXcWE-eQVSmUN67lA6MQTOmPGQiCxuGevl2tICdydlrx18oXiKStgHTS7niRTA/exec";

// ====== サンクス表示（UI用） ======
function showInlineThanks(){
  const p = document.getElementById('inlineThanks');
  if (p) p.hidden = false;
}
function hideInlineThanks(){
  const p = document.getElementById('inlineThanks');
  if (p) p.hidden = true;
}

// ====== フォーム送信（既存ロジック） ======
document.addEventListener('DOMContentLoaded', ()=>{
  const uiForm = document.getElementById('uiForm');
  if (!uiForm) return;
  const submitBtn = uiForm.querySelector('button[type="submit"]');

  uiForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(!uiForm.checkValidity()){ uiForm.reportValidity(); return; }
    if(!uiForm.elements['terms']?.checked){ alert("利用規約に同意してください。"); return; }

    // UIは即サンクス表示
    showInlineThanks();
    submitBtn.disabled = true;

    // 送信（form-urlencoded：プリフライト回避）
    const params = new URLSearchParams({
      name: uiForm.elements['name'].value.trim(),
      email: uiForm.elements['email'].value.trim(),
      job_change_timing: uiForm.elements['job_change_timing'].value,
      industry_experience: uiForm.elements['industry_experience'].value
    });

    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},
        body: params.toString()
      });
      uiForm.reset();
    } catch (err) {
      console.error('[FORM FETCH ERROR]', err);
      // 失敗でもUIはサンクスのまま
    } finally {
      submitBtn.disabled = false;
      // 以後の自動ポップアップ抑止に使う場合のフック
      window.dispatchEvent(new CustomEvent('lp:submitted'));
    }
  });
});

// ====== ポップアップ：アクセス毎に表示（クールダウンなし） ======
(function(){
  const POPUP_ID = "popup";
  const DELAY_MS = 1200; // 表示までの遅延

  const el = document.getElementById(POPUP_ID);
  if (!el) return;

  const open = () => {
    el.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    trapFocus();
  };
  const close = () => {
    el.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    releaseFocus();
  };

  // ×／背景クリック／「閉じる」で閉じる
  el.addEventListener('click', (e)=>{
    if (e.target.closest('[data-popup-close]')) close();
    if (e.target.classList.contains('popup__backdrop')) close();
  });
  // Escで閉じる
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && el.getAttribute('aria-hidden') === 'false') close();
  });

  // アクセス毎に表示（リロードしても毎回出す）
  setTimeout(open, DELAY_MS);

  // ====== クリックログ：sendBeacon優先 → fetchフォールバック ======
  function logPopupChoice(choice){
    const bodyStr = new URLSearchParams({
      popup_choice: choice,
      ua: navigator.userAgent,
      path: location.pathname + location.search + location.hash,
      ts: String(Date.now())
    }).toString();

    // 1) sendBeacon（遷移中でも投げやすい）
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(
        ENDPOINT,
        new Blob([bodyStr], { type: "application/x-www-form-urlencoded;charset=UTF-8" })
      );
      if (ok) return Promise.resolve(true);
    }
    // 2) fetch フォールバック（短時間だけ待つ）
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: bodyStr,
      keepalive: true,
    }).then(()=>true).catch(()=>false);
  }

  // 2つのカードにバインド（data-choice を送る）
  document.querySelectorAll(".js-popup-choice").forEach(anchor=>{
    anchor.addEventListener("click", async (e)=>{
      e.preventDefault(); // 遷移前に確実に送る
      const choice = anchor.dataset.choice || "";

      try {
        await Promise.race([
          logPopupChoice(choice),
          new Promise(res => setTimeout(res, 300)) // 長く待たない
        ]);
      } catch (_) {}

      // UI：閉じてフォームへスクロール
      close();
      const target = document.getElementById('entry');
      if (target) {
        if (location.hash !== "#entry") location.hash = "entry";
        target.scrollIntoView({ behavior: "smooth" });
      }
      // a[href] のデフォルト遷移は抑制したままでOK
    }, { passive: false });
  });

  // ====== フォーカス制御（アクセシビリティ） ======
  let prevFocus = null;
  function trapFocus(){
    prevFocus = document.activeElement;
    const focusables = el.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (focusables.length) focusables[0].focus();
    function loop(){
      if (el.getAttribute('aria-hidden') === 'true') return;
      if (!el.contains(document.activeElement)) {
        if (focusables.length) focusables[0].focus();
      }
    }
    el.__focusLoop = loop;
    document.addEventListener('focus', loop, true);
  }
  function releaseFocus(){
    document.removeEventListener('focus', el.__focusLoop, true);
    if (prevFocus && document.body.contains(prevFocus)) prevFocus.focus();
  }
})();
