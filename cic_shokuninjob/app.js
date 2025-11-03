// ====== Apps Script /exec のURL（本番用に更新済み） ======
const ENDPOINT = "https://script.google.com/macros/s/AKfycbwY2gQhaXcWE-eQVSmUN67lA6MQTOmPGQiCxuGevl2tICdydlrx18oXiKStgHTS7niRTA/exec";

// ====== サンクス表示（UI用／既存） ======
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

// ====== ポップアップ：アクセス毎に表示（クールダウンなし） ======
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

  el.addEventListener('click', (e)=>{
    if (e.target.closest('[data-popup-close]')) close();
    if (e.target.classList.contains('popup__backdrop')) close();
  });
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && el.getAttribute('aria-hidden') === 'false') close();
  });

  setTimeout(open, DELAY_MS);

  // ====== クリックログ：三段フォールバック ======
  function logPopupChoice(choice){
    const payload = new URLSearchParams({
      popup_choice: choice,
      ua: navigator.userAgent,
      path: location.pathname + location.search + location.hash,
      ts: String(Date.now())
    });

    // 1) sendBeacon（DOMStringで送る：Blob不要・CSP影響を減らす）
    if (navigator.sendBeacon) {
      const ok = navigator.sendBeacon(ENDPOINT, payload.toString()); // text/plain として送られる
      if (ok) return Promise.resolve(true);
    }

    // 2) fetch no-cors（レスポンスは読めないが送信は通る）
    return fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: payload.toString(),
      keepalive: true
    }).then(()=>true).catch(async ()=>{
      // 3) 画像ビーコン（GET）：最後の保険（doGet で拾う）
      try {
        const img = new Image();
        const u = new URL(ENDPOINT);
        u.searchParams.set('popup_choice', choice);
        u.searchParams.set('ua', navigator.userAgent);
        u.searchParams.set('path', location.pathname + location.search + location.hash);
        u.searchParams.set('ts', String(Date.now()));
        img.src = u.toString();
        // ちょっとだけ待つ（送信猶予）
        await new Promise(res => setTimeout(res, 120));
        return true;
      } catch(e){
        console.warn('[popup img beacon failed]', e);
        return false;
      }
    });
  }

  document.querySelectorAll(".js-popup-choice").forEach(anchor=>{
    anchor.addEventListener("click", async (e)=>{
      e.preventDefault(); // 遷移前に確実に送る
      const choice = anchor.dataset.choice || "";

      try {
        await Promise.race([
          logPopupChoice(choice),
          new Promise(res => setTimeout(res, 400)) // 送信待機は最大400ms
        ]);
      } catch (_) {}

      // UI：閉じてフォームへ
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
