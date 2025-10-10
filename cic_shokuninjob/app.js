// あなたの Apps Script /exec
const ENDPOINT = "https://script.google.com/macros/s/AKfycbwSrH3mdJAT5IcKYRlOkXLN8a9a05n5LG2fKCvBebsXv2KAkQX_f1jQDd-xZx7dSFS0qg/exec";

// サンクスを即表示（CORSで失敗アラートを出さない設計）
function showInlineThanks(){
  const p = document.getElementById('inlineThanks');
  if (p) p.hidden = false;
}

document.addEventListener('DOMContentLoaded', ()=>{
  const uiForm = document.getElementById('uiForm');
  const submitBtn = uiForm.querySelector('button[type="submit"]');

  uiForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(!uiForm.checkValidity()){ uiForm.reportValidity(); return; }
    if(!uiForm.elements['terms']?.checked){ alert("利用規約に同意してください。"); return; }

    // 1) UIは即サンクス表示
    showInlineThanks();
    submitBtn.disabled = true;

    // 2) 送信は裏で継続（form-urlencodedで安定）
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
      // 成否に関係なく UI はサンクスのまま
      uiForm.reset();
      submitBtn.disabled = false;
    } catch (err) {
      console.error('[FETCH ERROR]', err);
      // 失敗でもUIはサンクスのまま（ご希望どおり）
      submitBtn.disabled = false;
    }
  });
});
