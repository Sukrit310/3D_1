import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildTemple, LANDMARKS } from './model/temple.js';
import { exportGLB, downloadBlob } from './export.js';

const $=id=>document.getElementById(id);
const state={roofs:true,labels:false,walls:true,wireframe:false,selected:'overview',quality:'high',exporting:false};
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4500);}

async function start(){
  const viewport=$('viewport');
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});}
  catch(error){$('loading').innerHTML='<h2>เบราว์เซอร์นี้ยังเปิด WebGL 2 ไม่ได้</h2><p>ลองเปิด Hardware acceleration หรือใช้ Chrome / Edge / Firefox รุ่นใหม่</p>';throw error;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.65));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
  viewport.append(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#e7e7dc');scene.fog=new THREE.Fog('#e7e7dc',300,600);
  const camera=new THREE.PerspectiveCamera(40,1,.15,750);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=5;controls.maxDistance=600;
  controls.maxPolarAngle=Math.PI*.486;controls.minPolarAngle=.04;controls.panSpeed=.7;controls.autoRotateSpeed=.35;
  controls.listenToKeyEvents(viewport);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();const environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;scene.environmentIntensity=.5;
  room.dispose();pmrem.dispose();
  const hemi=new THREE.HemisphereLight('#eaf4ff','#7e815c',2.2);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#fff0d4',3.3);sun.position.set(-70,115,65);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-110;sun.shadow.camera.right=110;sun.shadow.camera.top=110;sun.shadow.camera.bottom=-110;sun.shadow.camera.near=1;sun.shadow.camera.far=350;sun.shadow.bias=-.00025;sun.shadow.normalBias=.22;
  scene.add(sun);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),new THREE.MeshStandardMaterial({color:'#e7e7dc',roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-3.65;ground.receiveShadow=true;scene.add(ground);
  let temple;
  // Give the loading screen one painted frame before building geometry.
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  temple=buildTemple({quality:state.quality});scene.add(temple.root);
  function setLayerVisibility(){
    if(temple.layers.roofs)temple.layers.roofs.visible=state.roofs;
    if(temple.layers['gallery-roofs'])temple.layers['gallery-roofs'].visible=state.roofs&&state.walls;
    if(temple.layers.walls)temple.layers.walls.visible=state.walls;
    Object.values(temple.materials).forEach(m=>m.wireframe=state.wireframe);
    $('roofs').setAttribute('aria-pressed',String(state.roofs));
  }
  function updateStats(){const s=temple.stats;$('model-stats').textContent=`${s.parts.toLocaleString()} ชิ้นส่วน · ${Math.round(s.triangles).toLocaleString()} สามเหลี่ยม · ${s.drawCalls} ชุดวาด`;}updateStats();
  let tween=null;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function moveTo(position,target,instant=false){
    controls.autoRotate=false;$('rotate').setAttribute('aria-pressed','false');
    if(instant||reducedMotion){camera.position.fromArray(position);controls.target.fromArray(target);controls.update();tween=null;}
    else tween={from:camera.position.clone(),to:new THREE.Vector3(...position),fromTarget:controls.target.clone(),target:new THREE.Vector3(...target),start:performance.now()};
  }
  function select(id,instant=false){
    const item=LANDMARKS.find(l=>l.id===id);if(!item)return;
    state.selected=id;camera.fov=item.fov||40;camera.updateProjectionMatrix();
    document.querySelectorAll('.landmark-button').forEach(b=>b.setAttribute('aria-current',String(b.dataset.id===id)));
    $('view-title').textContent=item.title;$('view-subtitle').textContent=item.subtitle;
    $('info-en').textContent=item.en;$('info-description').textContent=item.description;
    if(item.interior){state.roofs=false;setLayerVisibility();}
    const position=item.camera.slice();
    if(id==='overview'){const fit=Math.min(1.85,Math.max(1,1.25/camera.aspect));position.forEach((v,i)=>position[i]=item.target[i]+(v-item.target[i])*fit);}
    moveTo(position,item.target,instant);
  }
  const hotSpots=[];
  LANDMARKS.forEach((l,index)=>{
    const btn=document.createElement('button');btn.className='landmark-button';btn.dataset.id=l.id;
    const num=document.createElement('span');num.className='number';num.textContent=String(index+1).padStart(2,'0');
    const label=document.createElement('span');label.className='label';label.textContent=l.title;
    const small=document.createElement('small');small.textContent=l.en;label.append(small);
    const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='↗';btn.append(num,label,arrow);
    btn.addEventListener('click',()=>select(l.id));$('landmarks').append(btn);
    if(l.anchor&&!l.interior){const el=document.createElement('button');el.className='hotspot';el.textContent=l.title;el.hidden=true;el.addEventListener('click',()=>select(l.id));$('labels').append(el);hotSpots.push({el,position:new THREE.Vector3(...l.anchor)});}
  });
  controls.addEventListener('start',()=>{tween=null;});
  function resize(){const {width,height}=viewport.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}
  new ResizeObserver(resize).observe(viewport);resize();select('overview',true);
  $('loading').classList.add('done');
  setTimeout(()=>$('loading').hidden=true,500);
  $('reset').onclick=()=>select('overview');
  $('top').onclick=()=>{moveTo([0,205,.1],[0,0,0]);$('view-title').textContent='ผังพระอารามจากด้านบน';};
  $('rotate').onclick=()=>{tween=null;controls.autoRotate=!controls.autoRotate;$('rotate').setAttribute('aria-pressed',String(controls.autoRotate));};
  $('roofs').onclick=()=>{state.roofs=!state.roofs;setLayerVisibility();};
  $('labels-toggle').onclick=()=>{state.labels=!state.labels;$('labels-toggle').setAttribute('aria-pressed',String(state.labels));};
  $('walls').onchange=e=>{state.walls=e.target.checked;setLayerVisibility();};
  $('wireframe').onchange=e=>{state.wireframe=e.target.checked;setLayerVisibility();};
  function settings(open){$('settings').hidden=!open;$('settings-toggle').setAttribute('aria-expanded',String(open));}
  $('settings-toggle').onclick=()=>settings($('settings').hidden);$('close-settings').onclick=()=>settings(false);
  $('light').oninput=e=>{
    const t=Number(e.target.value)/100;
    sun.position.set(-90+t*150,115-t*83,65);sun.color.set(t>.65?'#ffbd7e':'#fff0d4');sun.intensity=3.3-t*.65;
    hemi.intensity=2.2-t*.8;scene.environmentIntensity=.5-t*.15;
    $('light-value').textContent=t<.25?'เช้า':t<.65?'กลางวัน':'แสงยามเย็น';
  };
  function zoom(factor){tween=null;const offset=camera.position.clone().sub(controls.target);const length=THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(offset.setLength(length));controls.update();}
  $('zoom-in').onclick=()=>zoom(.82);$('zoom-out').onclick=()=>zoom(1.22);
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('stage').requestFullscreen();}catch{toast('เบราว์เซอร์นี้ไม่รองรับโหมดเต็มหน้าจอ');}};
  $('screenshot').onclick=()=>{renderer.render(scene,camera);renderer.domElement.toBlob(blob=>{if(blob){downloadBlob(blob,'wat-phra-kaew.png');toast('บันทึกภาพโมเดลแล้ว');}else toast('ไม่สามารถสร้างภาพได้');},'image/png');};
  $('export').onclick=async()=>{
    if(state.exporting)return;state.exporting=true;$('export').disabled=true;$('quality').disabled=true;toast('กำลังเตรียมโมเดล GLB แบบครบทุกชั้น…');
    try{
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      const binary=await exportGLB(temple.root);
      downloadBlob(new Blob([binary],{type:'model/gltf-binary'}),'wat-phra-kaew.glb');
      toast(`ส่งออก GLB แล้ว (${(binary.byteLength/1048576).toFixed(1)} MB)`);
    }catch(error){console.error(error);toast('ส่งออกไม่สำเร็จ ลองเลือกรายละเอียดแบบสมดุลแล้วส่งออกอีกครั้ง');}
    finally{state.exporting=false;$('export').disabled=false;$('quality').disabled=false;}
  };
  $('quality').onchange=async e=>{
    const oldQuality=state.quality;state.quality=e.target.value;$('quality').disabled=true;$('export').disabled=true;
    toast('กำลังปรับรายละเอียดโมเดล…');
    try{
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      const next=buildTemple({quality:state.quality});
      scene.remove(temple.root);
      // Cached shared primitive geometry is retained for subsequent rebuilds.
      temple.root.traverse(o=>{if(o.isInstancedMesh)o.dispose();else if(o.isMesh)o.geometry.dispose();});
      Object.values(temple.materials).forEach(m=>m.dispose());
      temple=next;scene.add(temple.root);setLayerVisibility();updateStats();toast('ปรับรายละเอียดเรียบร้อยแล้ว');
    }catch(error){console.error(error);state.quality=oldQuality;$('quality').value=oldQuality;toast('ไม่สามารถเปลี่ยนรายละเอียดได้');}
    finally{$('quality').disabled=false;$('export').disabled=false;}
  };
  document.addEventListener('keydown',e=>{
    if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
    if(e.key.toLowerCase()==='r')select('overview');
    if(e.key==='Escape')settings(false);
  });
  const projected=new THREE.Vector3();let last=performance.now();
  renderer.setAnimationLoop(time=>{
    const dt=Math.min((time-last)/1000,.05);last=time;
    if(tween){const t=Math.min((time-tween.start)/1100,1),ease=t*t*(3-2*t);camera.position.lerpVectors(tween.from,tween.to,ease);controls.target.lerpVectors(tween.fromTarget,tween.target,ease);if(t===1)tween=null;}
    controls.update(dt);
    renderer.render(scene,camera);
    const width=viewport.clientWidth,height=viewport.clientHeight;
    hotSpots.forEach(h=>{
      projected.copy(h.position).project(camera);
      h.el.hidden=!state.labels||projected.z>1||projected.z< -1||Math.abs(projected.x)>.94||Math.abs(projected.y)>.85;
      if(!h.el.hidden){h.el.style.left=`${(projected.x*.5+.5)*width}px`;h.el.style.top=`${(-projected.y*.5+.5)*height}px`;}
    });
  });
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();toast('การแสดงผล 3D หยุดชั่วคราว กรุณารีเฟรชหน้าเว็บ');});
}
start().catch(error=>{console.error(error);if(!$('loading').textContent.includes('WebGL')){$('loading').hidden=false;$('loading').classList.remove('done');$('loading').innerHTML='<h2>เปิดโมเดลไม่สำเร็จ</h2><p>รัน npm install แล้วเปิดด้วย npm run dev ตาม README</p>';}});
