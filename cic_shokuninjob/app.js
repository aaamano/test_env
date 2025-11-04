// ====== Apps Script /exec のURL（フォーム送信のみで使用） ======
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

// ====== フォーム送信（従来どおり） ======
document.addEventListener('DOMContentLoaded', ()=>{
  const uiForm = document.getElementById('uiForm');
  if (!uiForm) return;
  const submitBtn = uiForm.querySelector('button[type="submit"]');

  uiForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(!uiForm.checkValidity()){ uiForm.reportValidity(); return; }
    if(!uiForm.elements['terms']?.checked){ alert("利用規約に同意してください。"); return; }

    showInlineThanks();
    submitBtn.disabled = true;

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
    } finally {
      submitBtn.disabled = false;
      window.dispatchEvent(new CustomEvent('lp:submitted'));
    }
  });
});

// ====== ポップアップ：アクセス毎に表示（送信ロギングは削除） ======
document.addEventListener('DOMContentLoaded', ()=>{
  const POPUP_ID = "popup";
  const DELAY_MS = 1200;
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

  // アクセス毎に表示（リロードしても毎回）
  setTimeout(open, DELAY_MS);

  // ▼ 2カードクリック時：送信せず UI だけ（閉じる→フォームへ）
  document.querySelectorAll(".js-popup-choice").forEach(anchor=>{
    anchor.addEventListener("click", (e)=>{
      e.preventDefault();
      close();
      const target = document.getElementById('entry');
      if (target) {
        if (location.hash !== "#entry") location.hash = "entry";
        target.scrollIntoView({ behavior: "smooth" });
      }
    }, { passive:false });
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
});
