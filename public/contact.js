document.querySelectorAll('[data-kyutsu-contact-form]').forEach(form=>{
  const status=form.querySelector('[data-contact-status]');
  const button=form.querySelector('button[type="submit"]');
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const fields=new FormData(form);
    if(String(fields.get('website')||'').trim())return;
    status.className='contact-status';status.textContent='送信中です…';button.disabled=true;
    try{
      const configuration=await fetch('/api/form-config',{cache:'no-store'});
      if(!configuration.ok)throw new Error('送信設定の取得に失敗しました。');
      const {accessKey}=await configuration.json();
      if(!accessKey)throw new Error('送信設定が未完了です。');
      const category=form.dataset.kyutsuContactForm;
      const title=category==='match'?'練習試合・対戦依頼':'スポンサー・協賛のお問い合わせ';
      const payload={access_key:accessKey,subject:`【球通BC】${title}`,from_name:'KYUTSU BASEBALL CLUB',botcheck:false};
      for(const [key,value] of fields.entries())if(key!=='website'&&key!=='consent')payload[key]=String(value).trim();
      payload.inquiry_type=category==='match'?'練習試合・対戦依頼':'スポンサー・協賛';
      const response=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify(payload)});
      const result=await response.json().catch(()=>({}));
      if(!response.ok||result.success!==true)throw new Error('送信できませんでした。時間をおいて再度お試しください。');
      form.reset();status.className='contact-status ok';status.textContent='お問い合わせを受け付けました。ありがとうございます。';
    }catch(err){status.className='contact-status error';status.textContent=err.message||'送信できませんでした。';}
    finally{button.disabled=false;}
  });
});