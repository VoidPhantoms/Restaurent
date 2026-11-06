
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';
(()=>{
 const canvas=document.getElementById('hero3d'),hero=document.getElementById('home');
 if(!canvas||!hero||!window.WebGLRenderingContext)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const coarse=matchMedia('(pointer: coarse)').matches;
 let renderer,scene,camera,root,plateGroup,raf=0,visible=true,scrollY=0;
 const pointer={x:0,y:0,tx:0,ty:0};
 try{
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!coarse,powerPreference:'low-power'});
 }catch(e){canvas.style.display='none';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,coarse?1.35:1.8));
 renderer.setSize(innerWidth,innerHeight,false);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,100);
 // Elevated three-quarter camera: the plate's top surface faces the visitor instead of appearing edge-on.
 const mobileView=()=>innerWidth<680;
 camera.position.set(0,mobileView()?12.5:10.5,mobileView()?18:16);
 scene.add(new THREE.HemisphereLight(0xc7e4d0,0x120d08,1.35));
 const key=new THREE.DirectionalLight(0xffe3b0,4.2);key.position.set(-4,7,7);scene.add(key);
 const rim=new THREE.PointLight(0xd5a95f,32,18,2);rim.position.set(4,2,3);scene.add(rim);
 const emerald=new THREE.PointLight(0x4eaa7a,18,16,2);emerald.position.set(-4,-2,1);scene.add(emerald);
 const top=new THREE.SpotLight(0xfff0d5,42,24,Math.PI/5,.55,1.4);top.position.set(1,7,6);top.target.position.set(1,0,0);scene.add(top,top.target);
 root=new THREE.Group();scene.add(root);plateGroup=new THREE.Group();root.add(plateGroup);
 const mat=(color,roughness=.35,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const ceramic=mat(0x111b16,.2,.32),edge=mat(0x927347,.22,.78),inner=mat(0x202a23,.26,.25),food=mat(0xb87943,.42,.05),foodLight=mat(0xd9aa69,.32,.08),leaf=mat(0x466c45,.48,0),leaf2=mat(0x91a66c,.4,0),cream=mat(0xe2d3b0,.3,.02),gold=mat(0xc9a45e,.2,.85),sauce= new THREE.MeshPhysicalMaterial({color:0x9b5735,roughness:.16,metalness:.03,clearcoat:1,clearcoatRoughness:.08});
 function mesh(g,m,parent=plateGroup){const o=new THREE.Mesh(g,m);parent.add(o);return o;}
 // Sculptural black ceramic service plate with machined gold lip and recessed well.
 const plate=mesh(new THREE.CylinderGeometry(3.05,3.18,.24,112),ceramic);plate.position.y=-.2;
 const rimMesh=mesh(new THREE.TorusGeometry(2.93,.035,12,120),edge);rimMesh.rotation.x=Math.PI/2;rimMesh.position.y=-.055;
 const innerRim=mesh(new THREE.TorusGeometry(2.55,.018,10,120),mat(0x5b654f,.3,.55));innerRim.rotation.x=Math.PI/2;innerRim.position.y=-.065;
 const well=mesh(new THREE.CylinderGeometry(2.58,2.66,.035,96),inner);well.position.y=-.07;
 // Main plated tasting element: a layered, gently irregular roasted delicacy.
 const centerpiece=new THREE.Group();plateGroup.add(centerpiece);
 const base=mesh(new THREE.SphereGeometry(1,48,32),food,centerpiece);base.scale.set(1.28,.27,.88);base.position.set(-.12,.24,.08);
 const crown=mesh(new THREE.SphereGeometry(1,48,32),foodLight,centerpiece);crown.scale.set(.86,.19,.68);crown.position.set(-.05,.43,.04);
 const glaze=mesh(new THREE.SphereGeometry(1,48,32),sauce,centerpiece);glaze.scale.set(.72,.065,.57);glaze.position.set(-.03,.55,.02);
 // Charred crisp shards, herbs and tiny gold pearls.
 for(let i=0;i<7;i++){
  const a=i*2.399,rad=.48+(i%3)*.12;
  const shard=mesh(new THREE.ConeGeometry(.18+(i%2)*.07,.72+(i%3)*.13,5),i%2?leaf:food,centerpiece);
  shard.position.set(Math.cos(a)*rad,.85+(i%3)*.08,Math.sin(a)*rad);shard.rotation.set(.2, a, (i%2?1:-1)*.55);
 }
 for(let i=0;i<13;i++){
  const a=i*2.4,rad=1.05+(i%3)*.11;
  const herb=mesh(new THREE.SphereGeometry(.13+(i%3)*.025,16,12),i%2?leaf:leaf2,centerpiece);
  herb.scale.set(1,.3,.65);herb.position.set(Math.cos(a)*rad,.24,Math.sin(a)*rad);herb.rotation.y=a;
 }
 for(let i=0;i<18;i++){
  const a=i*2.1,rad=.9+(i%4)*.28;
  const pearl=mesh(new THREE.SphereGeometry(.045+(i%3)*.012,12,10),gold,centerpiece);
  pearl.position.set(Math.cos(a)*rad,.27+(i%3)*.04,Math.sin(a)*rad);
 }
 // A painterly sauce ring, made from a smooth tube with a deliberate opening.
 const pts=[];for(let i=0;i<92;i++){const a=(i/91)*Math.PI*1.72-.9;const r=2.12+.06*Math.sin(a*5);pts.push(new THREE.Vector3(Math.cos(a)*r,.035,Math.sin(a)*r));}
 const curve=new THREE.CatmullRomCurve3(pts);mesh(new THREE.TubeGeometry(curve,180,.025,8,false),sauce);
 // Fine gold dots around the plate, restrained like a chef's finishing detail.
 for(let i=0;i<36;i++){const a=i/36*Math.PI*2;const dot=mesh(new THREE.SphereGeometry(.018,8,8),gold);dot.position.set(Math.cos(a)*2.78,-.025,Math.sin(a)*2.78);}
 // Floating garnish orbit: subtle depth cue, not a particle storm.
 const orbit=new THREE.Group();root.add(orbit);
 for(let i=0;i<5;i++){const g=mesh(new THREE.IcosahedronGeometry(.055+(i%2)*.025,1),i%2?leaf2:gold,orbit);const a=i*1.256;g.position.set(Math.cos(a)*(3.15+i%2*.18),.3+(i%3)*.28,Math.sin(a)*(2.8+i%2*.2));}
 // Presentation tilt: plate viewed slightly from above.
 plateGroup.rotation.x=.72;plateGroup.rotation.z=0;
 root.position.set(innerWidth<680?.45:2.35,innerWidth<680?-1.35:-.15,0);root.rotation.y=-.18;
 function resize(){const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.position.set(0,mobileView()?12.5:10.5,mobileView()?18:16);camera.lookAt(0,0,0);camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio||1,coarse?1.25:1.8));renderer.setSize(w,h,false);root.position.x=mobileView()?1.0:2.05;root.position.y=mobileView()?-1.55:-.05;}
 addEventListener('resize',resize,{passive:true});
 addEventListener('pointermove',e=>{if(coarse)return;pointer.tx=(e.clientX/innerWidth-.5)*.42;pointer.ty=(e.clientY/innerHeight-.5)*.28},{passive:true});
 addEventListener('scroll',()=>{scrollY=Math.min(1,scrollY+0);},{passive:true});
 const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible&&raf){cancelAnimationFrame(raf);raf=0}else if(visible&&!raf)animate();},{threshold:0});io.observe(hero);
 const clock=new THREE.Clock();let elapsed=0;
 function animate(){if(!visible)return;raf=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;
  const y=window.scrollY/Math.max(1,hero.offsetHeight);const scroll=Math.min(1,Math.max(0,y));
  const ease=scroll*scroll*(3-2*scroll);
  if(!reduced){pointer.x+=(pointer.tx-pointer.x)*.045;pointer.y+=(pointer.ty-pointer.y)*.045;plateGroup.rotation.y=elapsed*.2;root.rotation.y=pointer.x*.10+Math.sin(elapsed*.22)*.012;root.rotation.x=pointer.y*.075+Math.sin(elapsed*.3)*.009;root.position.y=(mobileView()?-1.55:-.05)+Math.sin(elapsed*.65)*.035;orbit.rotation.y=elapsed*.07;}
  root.position.x=(mobileView()?1.0:2.05)+ease*.55;root.position.z=-ease*.8;root.scale.setScalar((mobileView()?.68:1)* (1-ease*.14));
  camera.position.x+=(pointer.x*.35-camera.position.x)*.025;camera.position.y+=(-pointer.y*.25-camera.position.y)*.025;camera.lookAt(0,0,0);
  renderer.render(scene,camera);
 }
 animate();
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0}else if(visible&&!raf){clock.getDelta();animate();}});
 // If WebGL is unavailable, the editorial hero and liquid background remain usable.
})();


import*as T from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';
(()=>{const c=document.getElementById('dust'),rm=matchMedia('(prefers-reduced-motion:reduce)').matches,co=matchMedia('(pointer:coarse)').matches,lo=(navigator.hardwareConcurrency||4)<=4||(navigator.deviceMemory||4)<=2;
let r;try{r=new T.WebGLRenderer({canvas:c,alpha:true,antialias:false,powerPreference:'low-power'})}catch(e){return}
let N=co||lo?280:900,dpr=Math.min(devicePixelRatio||1,co?1:1.5);r.setPixelRatio(dpr);
const sc=new T.Scene(),cam=new T.PerspectiveCamera(60,1,.1,100);cam.position.z=8;
const g=new T.BufferGeometry(),p=new Float32Array(N*3),sp=new Float32Array(N);
for(let i=0;i<N;i++){p[i*3]=(Math.random()-.5)*34;p[i*3+1]=(Math.random()-.5)*34;p[i*3+2]=(Math.random()-.5)*30;sp[i]=.2+Math.random()}
g.setAttribute('position',new T.BufferAttribute(p,3));
const cv=document.createElement('canvas');cv.width=cv.height=32;const x=cv.getContext('2d'),gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'#fff');gr.addColorStop(.35,'rgba(243,223,173,.6)');gr.addColorStop(1,'rgba(215,184,121,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);
const m=new T.PointsMaterial({size:.16,map:new T.CanvasTexture(cv),transparent:true,opacity:.75,depthWrite:false,blending:T.AdditiveBlending,color:0xf3dfad}),pts=new T.Points(g,m);sc.add(pts);
const rz=()=>{r.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};rz();addEventListener('resize',rz);
let mx=0,my=0,sy=0,t0=performance.now(),last=0,slow=0,on=true,id=0;
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
addEventListener('scroll',()=>sy=scrollY,{passive:true});
function f(n){id=requestAnimationFrame(f);if(!on)return;const d=n-last;last=n;
if(d>34){if(++slow>25&&dpr>.75){dpr=Math.max(.75,dpr-.25);r.setPixelRatio(dpr);r.setSize(innerWidth,innerHeight,false);g.setDrawRange(0,Math.floor(g.drawRange.count>N?N*.6:g.drawRange.count*.7));slow=0}}else slow=Math.max(0,slow-1);
const t=(n-t0)/1000;pts.rotation.y=t*.025+mx*.4;pts.rotation.x=my*.25;pts.position.y=sy*.0016;pts.position.z=Math.sin(t*.2)*.8;cam.position.x+=(mx*1.2-cam.position.x)*.04;r.render(sc,cam)}
if(rm){r.render(sc,cam);return}
document.addEventListener('visibilitychange',()=>on=!document.hidden);f(0);
// card/gallery 3D tilt + magnetic buttons (fine pointers only)
if(!co){document.querySelectorAll('.gallery-grid>*,.story-main').forEach(e=>{e.addEventListener('pointermove',v=>{const b=e.getBoundingClientRect();e.style.transform=`rotateY(${((v.clientX-b.left)/b.width-.5)*10}deg) rotateX(${-((v.clientY-b.top)/b.height-.5)*10}deg) scale(1.02)`});e.addEventListener('pointerleave',()=>e.style.transform='')});
document.querySelectorAll('.btn,.add').forEach(e=>{e.addEventListener('pointermove',v=>{const b=e.getBoundingClientRect();e.style.translate=`${(v.clientX-b.left-b.width/2)*.2}px ${(v.clientY-b.top-b.height/2)*.3}px`});e.addEventListener('pointerleave',()=>e.style.translate='')})}
})();
