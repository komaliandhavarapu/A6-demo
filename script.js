(() => {
  const c = window.SCRAPBOOK_CONFIG || {};
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const pages = $$('.page');
  const shell = $('#bookShell');
  const progress = $('#progress');
  const prev = $('#prevPage'), next = $('#nextPage'), count = $('#pageCount');
  const audio = $('#backgroundMusic');
  const musicToggle = $('#musicToggle'), musicLabel = $('#musicLabel'), musicIcon = $('#musicIcon');
  const toast = $('#toast');
  let current = 0, animating = false, letterOpened = false, noCount = 0;
  let musicAutoplayAttempted = false;
  const pageNames = ['COVER','ANNIVERSARY','LOVE COLLAGE','LOVE LETTER','MY CONSTANT','TOGETHERNESS','CALENDAR','YOU & ME'];

  const put = (id, value) => { const el = document.getElementById(id); if (el && value != null) el.textContent = value; };
  put('coverTitle', c.openingPrompt); put('coverQuestion', c.openingQuestion);
  put('openBook', c.yesButton); put('noButton', c.noButton);
  put('anniversaryHeading', c.celebrationHeading);
  // Preserve designed line breaks on the anniversary title, while allowing editable text.
  const ah = $('#anniversaryHeading');
  if (ah && c.celebrationHeading) {
    const m = c.celebrationHeading.match(/^(Happy\s+)(.*?)(\s+Anniversary)$/i);
    if (m) ah.innerHTML = `${escapeHTML(m[1])}<span>${escapeHTML(m[2])}</span><br>Anniversary`;
    else ah.textContent = c.celebrationHeading;
  }
  put('anniversarySubheading', c.celebrationSubheading);
  if (c.loveHeading) { const lh = $('#loveHeading'); if (lh) lh.innerHTML = escapeHTML(c.loveHeading).split('').map((letter, i) => `<span class="cutout-letter letter-${i}">${letter}</span>`).join(''); }
  put('letterGreeting', c.loveLetterGreeting); put('letterBody', c.loveLetter); put('letterSignoff', c.loveLetterSignoff);
  put('constantCaption', c.constantCaption); put('togethernessHeading', c.togethernessHeading);
  $$('[data-year]').forEach(el => { const key = el.dataset.year; const configKey = key; if (c[configKey]) el.textContent = c[configKey]; });
  put('calendarMonth', c.calendarMonth); put('calendarYear', c.calendarYear); put('calendarHeading', c.calendarHeading);
  put('finalHeading', c.finalHeading); put('finalMessage', c.finalMessage);
  put('prevPage', c.previousLabel); put('nextPage', c.nextLabel); put('restartBook', c.restartLabel);
  function escapeHTML(s){return String(s).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}

  // Photo paths and captions are all sourced from config.js.
  $$('[data-photo]').forEach(img => {
    const key = img.dataset.photo, path = c.photos && c.photos[key];
    if (path) {
      img.addEventListener('load', () => {
        img.classList.toggle('landscape-photo', img.naturalWidth > img.naturalHeight);
      });
      img.src = path;
      img.onerror = () => {
        if (key === 'constantOne' && c.photos && c.photos.constant && !img.dataset.triedLegacy) { img.dataset.triedLegacy='1'; img.src=c.photos.constant; return; }
        img.removeAttribute('src'); img.classList.add('photo-missing'); img.alt = ''; img.setAttribute('aria-hidden','true');
      };
    }
  });
  $$('[data-caption]').forEach(el => { const key = el.dataset.caption; if (c.captions && c.captions[key]) el.textContent = c.captions[key]; });

  function makeCalendar(){
    const grid = $('#calendarGrid'); if (!grid) return;
    grid.innerHTML = '';
    ['M','T','W','T','F','S','S'].forEach(d=>{const s=document.createElement('span');s.className='weekday';s.textContent=d;grid.appendChild(s)});

    // Preferred customer setting: one ISO date (YYYY-MM-DD). Derive the visible month,
    // year and highlighted day from it so the calendar cannot drift out of sync.
    let monthIndex, year, highlightDay;
    const rawDate = String(c.calendarDate || '').trim();
    const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      year = Number(match[1]); monthIndex = Number(match[2]) - 1; highlightDay = Number(match[3]);
      const valid = monthIndex >= 0 && monthIndex <= 11 && highlightDay >= 1 && highlightDay <= new Date(year, monthIndex + 1, 0).getDate();
      if (!valid) { monthIndex = null; }
    }
    if (monthIndex == null) {
      const fallbackMonth = String(c.calendarMonth || 'September');
      year = Number(c.calendarYear) || 2026;
      const parsed = new Date(`${fallbackMonth} 1, ${year}`);
      monthIndex = Number.isNaN(parsed.getTime()) ? 8 : parsed.getMonth();
      highlightDay = Number(c.calendarHighlightDay) || 1;
    }
    const monthName = new Date(year, monthIndex, 1).toLocaleString('en-US', { month: 'long' });
    put('calendarMonth', monthName); put('calendarYear', String(year));
    const first = (new Date(year, monthIndex, 1).getDay()+6)%7;
    const total = new Date(year, monthIndex+1, 0).getDate();
    for(let i=0;i<first;i++){const s=document.createElement('span');s.setAttribute('aria-hidden','true');grid.appendChild(s)}
    for(let day=1;day<=total;day++){
      const s=document.createElement('span');s.textContent=day;
      if(day===highlightDay){s.className='marked';s.setAttribute('aria-label',`${monthName} ${day}, ${year} — anniversary date`);s.title='Customer anniversary date';}
      grid.appendChild(s);
    }
  }
  makeCalendar();

  pages.forEach((p,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`Go to ${pageNames[i] || 'page '+(i+1)}`);b.title=pageNames[i] || `Page ${i+1}`;b.addEventListener('click',()=>go(i));progress.appendChild(b)});
  function updateNav(){
    prev.disabled = current===0; next.classList.toggle('hidden',current===pages.length-1);
    $$('#progress button').forEach((b,i)=>{b.classList.toggle('active',i===current);b.setAttribute('aria-current',i===current?'page':'false')});
    count.textContent = current===0 ? 'COVER · 01/07' : `${pageNames[current]} · ${String(current).padStart(2,'0')}/07`;
  }
  function go(index){
    if(animating || index<0 || index>=pages.length || index===current)return;
    if(current===0 && index>0 && !musicAutoplayAttempted){
      musicAutoplayAttempted = true;
      startMusic();
    }
    animating=true; const old=current, oldPage=pages[old], newPage=pages[index];
    oldPage.classList.remove('turn-in'); oldPage.classList.add('turn-out');
    newPage.classList.add('active','turn-in');
    current=index; updateNav();
    window.setTimeout(()=>{oldPage.classList.remove('active','turn-out');newPage.classList.remove('turn-in');animating=false;},690);
    // Re-run the staged photo fade/slide whenever a scrapbook page is opened.
    newPage.querySelectorAll('img[data-photo]').forEach((img,i)=>{
      img.style.animation='none'; void img.offsetWidth;
      img.style.animation='photoFlowIn .95s cubic-bezier(.2,.75,.2,1) both'; img.style.animationDelay=(i*180)+'ms';
    });
    if(index===3 && !letterOpened) showToast('Open the envelope to reveal your handwritten note ♡');
  }
  prev.addEventListener('click',()=>go(current-1)); next.addEventListener('click',()=>go(current+1));
  $('#openBook').addEventListener('click',()=>go(1));
  $('#noButton').addEventListener('click',()=>{noCount++; const title=$('#coverTitle'), question=$('#coverQuestion'), yes=$('#openBook'), no=$('#noButton'); if(noCount===1){title.innerHTML='NOOOO<br>TRY AGAIN ♡';question.textContent='You know you want to see it!';yes.textContent='OKAY, YES ♡';no.textContent='TRY AGAIN';showToast('Hehe… give it another try 💙');}else{title.innerHTML='I made something<br>for you ♡';question.textContent=c.openingQuestion || 'Do you want to see it?';yes.textContent=c.yesButton || 'YES ♡';no.textContent=c.noButton || 'NO 🙈';noCount=0;} const b=$('#noButton');b.animate([{transform:'translateX(0)'},{transform:'translateX(-5px) rotate(-3deg)'},{transform:'translateX(5px) rotate(3deg)'},{transform:'translateX(0)'}],{duration:320});});
  $('#unfoldLetter').addEventListener('click',()=>{
    letterOpened=true;
    const envelope=$('#envelopeCover');
    if(envelope){envelope.classList.add('envelope-open');}
    $('#letterCard').classList.add('unfolded');
    $('#unfoldLetter').classList.add('hidden');
    showToast('A little note, written just for you ♡');
  });
  $('#restartBook').addEventListener('click',()=>{letterOpened=false;$('#letterCard').classList.remove('unfolded');$('#envelopeCover')?.classList.remove('envelope-open');$('#unfoldLetter').classList.remove('hidden');go(0);});
  document.addEventListener('keydown',e=>{if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();go(current+1)}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1)}});
  let touchX=0,touchY=0;
  shell.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY},{passive:true});
  shell.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.2){go(current+(dx<0?1:-1))}},{passive:true});

  audio.src = c.musicPath || 'assets/music/birthday.mp3';
  function syncMusic(){const playing=!audio.paused;musicToggle.classList.toggle('playing',playing);musicLabel.textContent=playing?'Pause music':'Play music';musicIcon.textContent=playing?'Ⅱ':'♫';musicToggle.setAttribute('aria-label',playing?'Pause music':'Play music')}
  async function startMusic(){
    try{await audio.play();syncMusic()}
    catch(e){showToast(`Could not play music. Check ${c.musicPath || 'assets/music/birthday.mp3'} ♡`)}
  }
  musicToggle.addEventListener('click',()=>{if(audio.paused){startMusic()}else{audio.pause();syncMusic()}});
  audio.addEventListener('play',syncMusic);audio.addEventListener('pause',syncMusic);audio.addEventListener('ended',syncMusic);
  let toastTimer;function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2300)}
  updateNav(); syncMusic();
})();
