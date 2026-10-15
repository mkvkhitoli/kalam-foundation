// Footer year
document.querySelectorAll('.yr').forEach(e => e.textContent = new Date().getFullYear());

// Highlight current page in the menu
(function(){
  let page = location.pathname.split('/').pop().replace('.html','') || 'index';
  document.querySelectorAll('.menu a[data-page]').forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
  });
})();

// Photo slider (home page)
(function(){
  const box=document.getElementById('ks'); if(!box) return; const track=box.querySelector('.ks-track'),
        slides=[...box.querySelectorAll('.ks-slide')], dotsBox=box.querySelector('.ks-dots');
  let i=0, timer, startX=null;
  slides.forEach((_,n)=>{const d=document.createElement('button');d.setAttribute('aria-label','Slide '+(n+1));d.onclick=()=>go(n,true);dotsBox.appendChild(d);});
  const dots=[...dotsBox.children];
  function go(n,user){i=(n+slides.length)%slides.length;track.style.transform=`translateX(-${i*100}%)`;dots.forEach((d,k)=>d.classList.toggle('on',k===i));if(user)restart();}
  function restart(){clearInterval(timer);timer=setInterval(()=>go(i+1),5000);}
  box.querySelector('.ks-prev').onclick=()=>go(i-1,true);
  box.querySelector('.ks-next').onclick=()=>go(i+1,true);
  box.addEventListener('mouseenter',()=>clearInterval(timer));
  box.addEventListener('mouseleave',restart);
  box.addEventListener('touchstart',e=>startX=e.touches[0].clientX,{passive:true});
  box.addEventListener('touchend',e=>{if(startX===null)return;const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>40)go(i+(dx<0?1:-1),true);startX=null;});
  go(0);restart();
})();
