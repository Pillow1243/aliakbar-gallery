const fa=n=>new Intl.NumberFormat('fa-IR').format(n);
const grid=document.querySelector('#galleryGrid'), filters=document.querySelector('#filters'), loadBtn=document.querySelector('#loadMore');
const box=document.querySelector('#lightbox'), boxImg=document.querySelector('#lightboxImg'), boxTitle=document.querySelector('#lightboxTitle'), boxMeta=document.querySelector('#lightboxMeta');
let photos=[],shown=[],active='همه',limit=12,current=0;

fetch('data/gallery.json').then(r=>{if(!r.ok)throw Error('gallery');return r.json()}).then(data=>{
 photos=data; document.querySelector('#photoCount').textContent=fa(data.length);
 document.querySelector('.hero-index').textContent=`ARCHIVE / 01—${String(data.length).padStart(2,'0')}`;
 makeFilters(); render();
}).catch(()=>grid.innerHTML='<p>بارگذاری گالری ممکن نشد. لطفاً صفحه را دوباره باز کنید.</p>');
function makeFilters(){
 const names=['همه',...new Set(photos.map(x=>x.collection))];
 filters.innerHTML=names.map((n,i)=>`<button class="filter ${i?'':'active'}" data-filter="${n}">${n}</button>`).join('');
 filters.onclick=e=>{const b=e.target.closest('button');if(!b)return;active=b.dataset.filter;limit=12;filters.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));render()}
}
function render(){
 const list=active==='همه'?photos:photos.filter(x=>x.collection===active); shown=list.slice(0,limit);
 grid.innerHTML=shown.map((p,i)=>`<article class="card" tabindex="0" role="button" aria-label="باز کردن ${p.title}" data-index="${i}" style="animation-delay:${Math.min(i*.035,.5)}s"><img src="${p.src}" alt="${p.alt}" loading="${i<4?'eager':'lazy'}" width="${p.width}" height="${p.height}"><div class="card-info"><span>${p.title}</span><small>${p.collection} · ${fa(i+1).padStart(2,'۰')}</small></div></article>`).join('');
 loadBtn.hidden=shown.length>=list.length;
}
function openAt(i){current=i;const p=shown[i];if(!p)return;boxImg.src=p.src;boxImg.alt=p.alt;boxTitle.textContent=p.title;boxMeta.textContent=`${p.collection} — ${fa(i+1)} از ${fa(shown.length)}`;box.showModal();history.replaceState(null,'',`#${p.id}`)}
function move(d){current=(current+d+shown.length)%shown.length;openAt(current)}
grid.addEventListener('click',e=>{const c=e.target.closest('.card');if(c)openAt(+c.dataset.index)});grid.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.card')){e.preventDefault();openAt(+e.target.dataset.index)}});
loadBtn.onclick=()=>{limit+=12;render()};document.querySelector('#closeLightbox').onclick=()=>box.close();document.querySelector('#prevPhoto').onclick=()=>move(-1);document.querySelector('#nextPhoto').onclick=()=>move(1);box.addEventListener('click',e=>{if(e.target===box)box.close()});box.addEventListener('close',()=>history.replaceState(null,'','#gallery'));document.addEventListener('keydown',e=>{if(!box.open)return;if(e.key==='ArrowLeft')move(1);if(e.key==='ArrowRight')move(-1)});
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(x=>obs.observe(x));
addEventListener('scroll',()=>{const y=scrollY,d=document.documentElement.scrollHeight-innerHeight;document.querySelector('.progress').style.width=`${d?y/d*100:0}%`;document.querySelector('#nav').classList.toggle('scrolled',y>40)},{passive:true});
document.querySelector('#year').textContent=fa(new Date().getFullYear());

// Accessible responsive navigation
const siteHeader=document.querySelector('#nav');
const menuToggle=document.querySelector('#menuToggle');
const mobileMenu=document.querySelector('#mobileMenu');
function setMenu(open){
 siteHeader.classList.toggle('menu-open',open);
 document.body.classList.toggle('menu-lock',open);
 menuToggle.setAttribute('aria-expanded',String(open));
 menuToggle.setAttribute('aria-label',open?'بستن منو':'باز کردن منو');
 mobileMenu.setAttribute('aria-hidden',String(!open));
}
menuToggle.addEventListener('click',()=>setMenu(!siteHeader.classList.contains('menu-open')));
mobileMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('click',e=>{if(siteHeader.classList.contains('menu-open')&&!siteHeader.contains(e.target))setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&siteHeader.classList.contains('menu-open')){setMenu(false);menuToggle.focus()}});
addEventListener('resize',()=>{if(innerWidth>980)setMenu(false)},{passive:true});

// Creator profile dialog
const creatorDialog=document.querySelector('#creatorDialog');
const creatorButtons=['#creatorOpen','#mobileCreatorOpen','#footerCreatorOpen'].map(x=>document.querySelector(x)).filter(Boolean);
function openCreator(){setMenu(false);creatorDialog.showModal();document.body.classList.add('menu-lock')}
function closeCreator(){creatorDialog.close();document.body.classList.remove('menu-lock')}
creatorButtons.forEach(button=>button.addEventListener('click',openCreator));
document.querySelector('#creatorClose').addEventListener('click',closeCreator);
creatorDialog.addEventListener('click',e=>{if(e.target===creatorDialog)closeCreator()});
creatorDialog.addEventListener('close',()=>document.body.classList.remove('menu-lock'));

// Highlight the current section in the desktop navigation
const desktopLinks=[...document.querySelectorAll('.desktop-menu a')];
const spy=new IntersectionObserver(entries=>{
 const visible=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
 if(!visible)return;
 desktopLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===`#${visible.target.id}`));
},{rootMargin:'-28% 0px -58% 0px',threshold:[0,.1,.3,.6]});
['home','gallery','about','contact'].forEach(id=>{const el=document.getElementById(id);if(el)spy.observe(el)});
