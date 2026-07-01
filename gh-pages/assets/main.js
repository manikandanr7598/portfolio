/* ── Video controls ── */
const video = document.getElementById('main-video');
function togglePlay() {
  const btn = document.getElementById('play-btn');
  if (video.paused) {
    video.play();
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    btn.setAttribute('aria-label','Pause video');
  } else {
    video.pause();
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    btn.setAttribute('aria-label','Play video');
  }
}
function toggleMute() {
  video.muted = !video.muted;
  const icon = document.getElementById('mute-icon');
  if (video.muted) {
    icon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
  } else {
    icon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
  }
}
function scrollNext() { document.getElementById('next-section').scrollIntoView({behavior:'smooth'}); }
function openDrawer() { document.getElementById('drawer-overlay').style.display='flex'; }
function closeDrawer() { document.getElementById('drawer-overlay').style.display='none'; }
function switchTab(id, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.drawer-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  btn.classList.add('active');
}
document.addEventListener('keydown', e => { if(e.key==='Escape') closeDrawer(); });

/* ── Mute audio when hero scrolls out of view ── */
(function(){
  const hero = document.getElementById('hero');
  const ambientVid = document.querySelector('.ambient-video');
  let wasUnmuted = false;

  const observer = new IntersectionObserver(function(entries){
    const entry = entries[0];
    if(entry.isIntersecting){
      // Hero is visible — restore unmuted state if it was playing with sound
      if(wasUnmuted && !video.muted){
        // already unmuted, nothing to do
      } else if(wasUnmuted) {
        video.muted = false;
      }
      // Resume playback if it was playing
      if(!video.paused) video.play().catch(()=>{});
    } else {
      // Hero scrolled out — mute and pause audio
      wasUnmuted = !video.muted;
      video.muted = true;
      video.pause();
      if(ambientVid) ambientVid.pause();
    }
  }, { threshold: 0.05 });

  observer.observe(hero);

  // Also resume ambient when hero comes back
  const ambientObserver = new IntersectionObserver(function(entries){
    if(entries[0].isIntersecting){
      if(ambientVid && ambientVid.paused) ambientVid.play().catch(()=>{});
    }
  }, { threshold: 0.05 });
  if(ambientVid) ambientObserver.observe(hero);
})();

/* ── Three.js Particles ── */
(function() {
  const canvas = document.getElementById('cinematic-canvas');
  const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setClearColor(0x000000,0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,.1,1000);
  camera.position.z=80;
  const N=280,geo=new THREE.BufferGeometry(),pos=new Float32Array(N*3),col=new Float32Array(N*3),sz=new Float32Array(N);
  const palette=[new THREE.Color(0xFF8C42),new THREE.Color(0xFF6B1A),new THREE.Color(0x42C8FF),new THREE.Color(0x1AFFDB),new THREE.Color(0xFFAA55),new THREE.Color(0x00BFFF)];
  for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*180;pos[i*3+1]=(Math.random()-.5)*100;pos[i*3+2]=(Math.random()-.5)*60;const c=palette[Math.floor(Math.random()*palette.length)];col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;sz[i]=Math.random()*3.5+.5}
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('pColor',new THREE.BufferAttribute(col,3));geo.setAttribute('size',new THREE.BufferAttribute(sz,1));
  const mat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:`attribute float size;attribute vec3 pColor;varying vec3 vColor;varying float vAlpha;uniform float uTime;void main(){vColor=pColor;vec3 p=position;float idx=float(gl_VertexID);p.y+=sin(uTime*.4+idx*.7)*2.5;p.x+=cos(uTime*.25+idx*.5)*1.8;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=size*(180./-mv.z);gl_Position=projectionMatrix*mv;float d=length(position.xy)/90.;vAlpha=smoothstep(1.,.3,d)*.65;}`,fragmentShader:`varying vec3 vColor;varying float vAlpha;void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv);if(d>.5)discard;float a=exp(-d*d*8.)*vAlpha;float h=exp(-d*d*3.)*vAlpha*.3;gl_FragColor=vec4(vColor,a+h);}`,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  const particles=new THREE.Points(geo,mat);scene.add(particles);
  const mouse={x:0,y:0};
  window.addEventListener('mousemove',e=>{mouse.x=(e.clientX/window.innerWidth-.5)*2;mouse.y=-(e.clientY/window.innerHeight-.5)*2});
  window.addEventListener('resize',()=>{renderer.setSize(window.innerWidth,window.innerHeight);camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix()});
  let t=0;(function animate(){requestAnimationFrame(animate);t+=.01;mat.uniforms.uTime.value=t;camera.position.x+=(mouse.x*6-camera.position.x)*.025;camera.position.y+=(mouse.y*3-camera.position.y)*.025;camera.lookAt(scene.position);particles.rotation.z=Math.sin(t*.05)*.015;renderer.render(scene,camera)})();
})();

/* ── GSAP Animations ── */
(function(){
  const els={tagline:document.getElementById('tagline'),nameA:document.getElementById('name-a'),nameB:document.getElementById('name-b'),role:document.getElementById('role-text'),stats:document.getElementById('stats-strip'),cards:document.getElementById('exp-cards'),certs:document.getElementById('cert-row'),actions:document.getElementById('action-row'),scroll:document.getElementById('scroll-ind'),badge:document.getElementById('sound-badge')};

  gsap.set([els.tagline,els.nameA,els.nameB,els.role,els.stats,els.cards,els.certs,els.actions,els.scroll],{autoAlpha:0});
  gsap.set([els.nameA,els.nameB],{y:80,skewY:4});
  gsap.set(els.tagline,{y:16,letterSpacing:'0.5em'});
  gsap.set([els.role,els.stats,els.cards,els.certs,els.actions,els.scroll],{y:20});

  const tl=gsap.timeline({delay:.5});
  tl.to(els.tagline,{autoAlpha:1,y:0,letterSpacing:'0.25em',duration:1.1,ease:'power3.out'})
    .to(els.nameA,{autoAlpha:1,y:0,skewY:0,duration:1.1,ease:'expo.out'},'-=0.5')
    .to(els.nameB,{autoAlpha:1,y:0,skewY:0,duration:1.1,ease:'expo.out'},'-=0.85')
    .to(els.role,{autoAlpha:1,y:0,duration:.9,ease:'power3.out'},'-=0.5')
    .to(els.stats,{autoAlpha:1,y:0,duration:.8,ease:'power3.out'},'-=0.4')
    .to(els.cards,{autoAlpha:1,y:0,duration:.8,ease:'power3.out'},'-=0.4')
    .to(els.certs,{autoAlpha:1,y:0,duration:.7,ease:'power3.out'},'-=0.35')
    .to(els.actions,{autoAlpha:1,y:0,duration:.7,ease:'power3.out'},'-=0.35')
    .to(els.scroll,{autoAlpha:1,y:0,duration:.6,ease:'power3.out'},'-=0.25');

  gsap.fromTo(els.badge,{autoAlpha:0,scale:.9},{autoAlpha:1,scale:1,duration:.6,delay:2.2,ease:'back.out(1.4)'});
  gsap.to(els.badge,{autoAlpha:0,duration:.7,delay:6.2,ease:'power2.in'});
  gsap.to(document.getElementById('scroll-line'),{scaleY:1.6,transformOrigin:'top center',duration:1.1,repeat:-1,yoyo:true,ease:'sine.inOut'});
})();

/* ── Profile page scroll-reveal ── */
(function(){
  const items = document.querySelectorAll('.rv');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const el = entry.target;
        const idx = [...el.parentElement.children].filter(c=>c.classList.contains('rv')).indexOf(el);
        gsap.to(el,{
          autoAlpha:1,
          x:0, y:0,
          duration:.9,
          delay: Math.min(idx*0.07,0.5),
          ease:'power3.out'
        });
        io.unobserve(el);
      }
    });
  },{threshold:0.15,rootMargin:'0px 0px -60px 0px'});

  items.forEach(el=>{
    gsap.set(el,{autoAlpha:0});
    io.observe(el);
  });
})();
