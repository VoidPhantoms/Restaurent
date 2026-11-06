
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const header=$('#header'),progress=$('#progress');
window.addEventListener('scroll',()=>{header.classList.toggle('scrolled',scrollY>40);progress.style.width=(scrollY/(document.documentElement.scrollHeight-innerHeight)*100)+'%'});
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}}),{threshold:.12});
$$('.reveal').forEach(el=>revealObserver.observe(el));
$('#menuToggle').addEventListener('click',()=>$('#nav').classList.toggle('open'));
$$('#nav a').forEach(a=>a.addEventListener('click',()=>$('#nav').classList.remove('open')));
$$('.filter').forEach(btn=>btn.addEventListener('click',()=>{$$('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');$$('.dish').forEach(card=>{const show=btn.dataset.filter==='all'||card.dataset.category===btn.dataset.filter;card.style.display=show?'block':'none'})}));
let cart={};
const fmt=n=>'₹'+n.toLocaleString('en-IN');
function renderCart(){const items=Object.entries(cart);$('#cartCount').textContent=items.reduce((a,[,v])=>a+v.qty,0);$('#cartItems').innerHTML=items.length?items.map(([name,item])=>`<div class="cart-item"><div><strong>${name}</strong><small>${fmt(item.price)} each</small></div><div class="qty"><button data-name="${name}" data-change="-1">−</button><span>${item.qty}</span><button data-name="${name}" data-change="1">+</button></div></div>`).join(''):'<div class="empty">Your bag is waiting for something delicious.</div>';$('#cartTotal').textContent=fmt(items.reduce((sum,[,v])=>sum+v.price*v.qty,0))}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1900)}
$$('.add').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('.dish'),name=card.dataset.name,price=Number(card.dataset.price);cart[name]??={price,qty:0};cart[name].qty++;renderCart();toast(name+' added to your bag')}));
$('#cartItems').addEventListener('click',e=>{const b=e.target.closest('button[data-change]');if(!b)return;const name=b.dataset.name;cart[name].qty+=Number(b.dataset.change);if(cart[name].qty<=0)delete cart[name];renderCart()});
function toggleCart(open){$('#cartPanel').classList.toggle('open',open);$('#overlay').classList.toggle('show',open)}
$('#openCart').addEventListener('click',()=>toggleCart(true));$('#closeCart').addEventListener('click',()=>toggleCart(false));$('#overlay').addEventListener('click',()=>toggleCart(false));
$('#checkout').addEventListener('click',()=>toast(Object.keys(cart).length?'This demo bag is ready for backend checkout':'Add a dish to your bag first'));
const dateInput=$('#guestDate');const today=new Date();dateInput.min=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().split('T')[0];
$('#bookingForm').addEventListener('submit',e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;const name=$('#guestName').value.trim();toast('Thank you, '+name+' — request prepared!');e.currentTarget.reset();dateInput.min=new Date().toISOString().split('T')[0]});
// Subtle pointer-follow and 3D menu-card tilt on fine-pointer devices.
if(matchMedia('(pointer:fine)').matches){const c=$('#cursor'),r=$('#cursor-ring');let mx=0,my=0,rx=0,ry=0;window.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;c.style.left=mx+'px';c.style.top=my+'px'});function follow(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;r.style.left=rx+'px';r.style.top=ry+'px';requestAnimationFrame(follow)}follow();$$('a,button,.dish').forEach(el=>{el.addEventListener('mouseenter',()=>{r.style.width='58px';r.style.height='58px'});el.addEventListener('mouseleave',()=>{r.style.width='38px';r.style.height='38px'})});$$('.dish').forEach(card=>{card.addEventListener('mousemove',e=>{const b=card.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;card.style.transform=`perspective(900px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-5px)`});card.addEventListener('mouseleave',()=>card.style.transform='')})}

// Liquid glass field: soft metaball gradients, floating glass spheres and touch ripples.
(()=>{
 const canvas=document.getElementById('liquidCanvas'); if(!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:true});
 let w=0,h=0,dpr=1,points=[],ripples=[],pointer={x:-1000,y:-1000,active:false};
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const rand=(a,b)=>Math.random()*(b-a)+a;
 function resize(){
   dpr=Math.min(window.devicePixelRatio||1,1.7);w=innerWidth;h=innerHeight;
   canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);
   canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
   const count=Math.max(5,Math.min(10,Math.round(w/170)));
   points=Array.from({length:count},(_,i)=>({x:rand(0,w),y:rand(0,h),r:rand(100,210),vx:rand(-.22,.22),vy:rand(-.2,.2),phase:rand(0,6.28),hue:i%2?150:42}));
 }
 function ripple(x,y){ripples.push({x,y,r:8,life:1});if(ripples.length>12)ripples.shift()}
 function move(e){const t=e.touches?.[0];pointer.x=t?t.clientX:e.clientX;pointer.y=t?t.clientY:e.clientY;pointer.active=true}
 addEventListener('resize',resize,{passive:true});resize();
 addEventListener('pointermove',move,{passive:true});
 addEventListener('pointerdown',e=>{move(e);ripple(pointer.x,pointer.y)},{passive:true});
 addEventListener('touchstart',e=>{if(e.touches[0]){move(e);ripple(pointer.x,pointer.y)}},{passive:true});
 addEventListener('pointerleave',()=>pointer.active=false);
 function draw(){
   ctx.clearRect(0,0,w,h);
   // Diffused liquid light pools.
   ctx.globalCompositeOperation='screen';
   points.forEach(p=>{
     if(!reduced){p.phase+=.006;p.x+=p.vx;p.y+=p.vy;p.x+=Math.sin(p.phase)*.18;p.y+=Math.cos(p.phase*.8)*.14}
     if(p.x<-p.r)p.x=w+p.r;if(p.x>w+p.r)p.x=-p.r;if(p.y<-p.r)p.y=h+p.r;if(p.y>h+p.r)p.y=-p.r;
     let dx=p.x-pointer.x,dy=p.y-pointer.y,dist=Math.hypot(dx,dy)||1;
     if(pointer.active&&dist<190){p.x+=dx/dist*(190-dist)*.003;p.y+=dy/dist*(190-dist)*.003}
     const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
     if(p.hue===150){g.addColorStop(0,'rgba(63,139,103,.16)');g.addColorStop(.5,'rgba(36,103,76,.075)');g.addColorStop(1,'rgba(36,103,76,0)')}
     else{g.addColorStop(0,'rgba(215,184,121,.13)');g.addColorStop(.5,'rgba(180,144,83,.055)');g.addColorStop(1,'rgba(180,144,83,0)')}
     ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
   });
   // Glass bubbles with a fine rim and moving specular glint.
   ctx.globalCompositeOperation='screen';
   const time=performance.now()*.00025;
   points.slice(0,7).forEach((p,i)=>{
     const bx=(p.x+Math.sin(time+i*2)*35+w)%(w+90)-45;
     const by=(p.y+Math.cos(time*.8+i*1.7)*28+h)%(h+90)-45;
     const r=11+(i%4)*6;
     const dx=bx-pointer.x,dy=by-pointer.y,dist=Math.hypot(dx,dy)||1;
     const push=pointer.active&&dist<115?(115-dist)*.17:0;
     const x=bx+dx/dist*push,y=by+dy/dist*push;
     ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
     ctx.fillStyle='rgba(195,226,210,.025)';ctx.fill();
     ctx.lineWidth=1;ctx.strokeStyle='rgba(240,225,190,.27)';ctx.stroke();
     const shine=ctx.createRadialGradient(x-r*.35,y-r*.42,1,x-r*.2,y-r*.3,r*.8);
     shine.addColorStop(0,'rgba(255,255,255,.38)');shine.addColorStop(.22,'rgba(255,255,255,.08)');shine.addColorStop(1,'rgba(255,255,255,0)');
     ctx.fillStyle=shine;ctx.beginPath();ctx.arc(x,y,r*.83,0,Math.PI*2);ctx.fill();
     ctx.beginPath();ctx.ellipse(x-r*.28,y-r*.38,r*.24,r*.09,-.55,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.32)';ctx.fill();
   });
   // Expanding rings follow taps and clicks.
   ctx.globalCompositeOperation='source-over';
   ripples=ripples.filter(r=>r.life>.015);
   ripples.forEach(r=>{r.r+=reduced?0:2.2;r.life*=.965;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,Math.PI*2);ctx.strokeStyle=`rgba(225,199,145,${r.life*.34})`;ctx.lineWidth=1.2;ctx.stroke();ctx.beginPath();ctx.arc(r.x,r.y,r.r*.72,0,Math.PI*2);ctx.strokeStyle=`rgba(190,222,204,${r.life*.17})`;ctx.stroke()});
   requestAnimationFrame(draw);
 }
 draw();
 // A few larger CSS glass bubbles add depth; they never intercept taps.
 for(let i=0;i<5;i++){const b=document.createElement('i');b.className='glass-bubble';const size=24+(i%3)*22;b.style.width=size+'px';b.style.height=size+'px';b.style.left=(8+i*19)+'%';b.style.top=(18+(i%3)*25)+'%';b.style.opacity='.45';b.style.setProperty('--duration',(15+i*3)+'s');document.body.appendChild(b)}
})();


// Custom WebGL liquid-glass shader. No external library or paid asset required.
(()=>{
 const canvas=document.getElementById('shaderCanvas'); if(!canvas)return;
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});
 if(!gl)return;
 const vert=`attribute vec2 p; void main(){gl_Position=vec4(p,0.0,1.0);}`;
 const frag=`precision highp float;
 uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse; uniform vec2 u_tap; uniform float u_tapTime;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.02;a*=.5;}return v;}
 void main(){
  vec2 uv=gl_FragCoord.xy/u_res; vec2 p=(uv-.5)*vec2(u_res.x/u_res.y,1.0);
  float t=u_time*.12;
  vec2 m=(u_mouse-.5)*vec2(u_res.x/u_res.y,1.0);
  float md=length(p-m); float influence=exp(-md*2.7)*.20;
  float wave=sin(p.x*2.2+p.y*3.1+t*2.0)*.12+cos(p.y*4.0-p.x*1.8-t)*.10;
  vec2 q=p+vec2(wave,wave*.8);
  q+=vec2(fbm(q*2.0+vec2(t,-t)),fbm(q*2.0+vec2(-t,t)))*.34;
  q+=(m-p)*influence;
  float n=fbm(q*3.4+vec2(t*.5,-t*.35));
  float ridges=pow(1.0-abs(sin((q.x*2.1+q.y*1.7+n*2.5)*3.0+t)),13.0);
  float caustic=smoothstep(.60,.96,fbm(q*5.5+vec2(t,-t*.8)));
  float edge=exp(-abs(n-.51)*15.0);
  float vignette=smoothstep(1.15,.12,length(p));
  vec3 deep=vec3(.012,.035,.026);
  vec3 jade=vec3(.045,.19,.12);
  vec3 teal=vec3(.10,.31,.23);
  vec3 champagne=vec3(.62,.46,.24);
  vec3 col=mix(deep,jade,smoothstep(.28,.78,n)*.72);
  col=mix(col,teal,caustic*.34);
  col+=champagne*(ridges*.18+edge*.045);
  col+=vec3(.12,.29,.21)*pow(max(0.,1.-length(q-vec2(.48,-.18))),3.)*.32;
  float tapAge=max(0.,u_time-u_tapTime);
  float tapDist=length((uv-u_tap)*vec2(u_res.x/u_res.y,1.));
  float ripple=exp(-tapAge*1.2)*exp(-abs(tapDist-tapAge*.38)*34.0);
  col+=vec3(.30,.42,.29)*ripple*.22;
  col*=vignette;
  float alpha=(.22+caustic*.23+ridges*.12+edge*.05)*vignette;
  gl_FragColor=vec4(col,alpha);
 }`;
 function compile(type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(sh));return null;}return sh}
 const vs=compile(gl.VERTEX_SHADER,vert),fs=compile(gl.FRAGMENT_SHADER,frag);if(!vs||!fs)return;
 const prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return;gl.useProgram(prog);
 const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const loc=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
 const res=gl.getUniformLocation(prog,'u_res'),time=gl.getUniformLocation(prog,'u_time'),mouse=gl.getUniformLocation(prog,'u_mouse'),tap=gl.getUniformLocation(prog,'u_tap'),tapTime=gl.getUniformLocation(prog,'u_tapTime');
 let px=.72,py=.35,tx=.5,ty=.5,lastTap=-1000,start=performance.now(),lastFrame=0;
 function resize(){const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.floor(innerWidth*d);canvas.height=Math.floor(innerHeight*d);canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(res,canvas.width,canvas.height)}
 function setPointer(x,y){px=x/innerWidth;py=1-y/innerHeight}
 addEventListener('resize',resize,{passive:true});resize();
 addEventListener('pointermove',e=>setPointer(e.clientX,e.clientY),{passive:true});
 addEventListener('pointerdown',e=>{setPointer(e.clientX,e.clientY);tx=px;ty=py;lastTap=(performance.now()-start)/1000},{passive:true});
 addEventListener('touchstart',e=>{if(e.touches[0]){setPointer(e.touches[0].clientX,e.touches[0].clientY);tx=px;ty=py;lastTap=(performance.now()-start)/1000}},{passive:true});
 function frame(now){if(now-lastFrame<30){requestAnimationFrame(frame);return}lastFrame=now;const t=(now-start)/1000;gl.uniform1f(time,t);gl.uniform2f(mouse,px,py);gl.uniform2f(tap,tx,ty);gl.uniform1f(tapTime,lastTap);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(frame)}
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)requestAnimationFrame(frame);else{gl.uniform1f(time,0);gl.uniform2f(mouse,.5,.5);gl.uniform2f(tap,.5,.5);gl.uniform1f(tapTime,-100);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
})();

