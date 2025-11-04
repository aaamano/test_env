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

// ====== ポップアップ：毎回表示／選択肢以外で閉じられない ======
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

  // ★ 以前の「×／背景クリック／Escで閉じる」は無効化
  // （意図せず閉じられないように、イベントを付けない）
  // el.addEventListener('click', ... );
  // document.addEventListener('keydown', ... );

  // アクセス毎に表示
  setTimeout(open, DELAY_MS);

  // ▼ 2カードのクリックでのみ閉じる → フォームへスクロール
  document.querySelectorAll(".js-popup-choice").forEach(anchor=>{
    anchor.addEventListener("click", (e)=>{
      e.preventDefault();               // ページ遷移より先にUI制御
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
    // 選択肢にフォーカスを当てる（1枚目を初期フォーカス）
    const first = el.querySelector('.js-popup-choice') || focusables[0];
    if (first) first.focus();

    function loop(){
      if (el.getAttribute('aria-hidden') === 'true') return;
      if (!el.contains(document.activeElement)) {
        if (first) first.focus();
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
