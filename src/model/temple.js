import * as THREE from 'three';
import { createMaterials } from './materials.js';
import { Builder } from './geometry.js';
import { hall, pavilion, goldenChedi, mondop, pantheon, prang } from './architecture.js';
import { grounds, enclosure, guardian } from './details.js';

export const LANDMARKS = [
  { id:'overview', title:'ภาพรวมพระอาราม', en:'The temple grounds', subtitle:'วัดพระศรีรัตนศาสดาราม', description:'สำรวจองค์ประกอบสถาปัตยกรรมทั้งพระอาราม หมุนมุมมองเพื่อชมหลังคาซ้อนชั้น เจดีย์ทอง และแนวพระระเบียง', camera:[151,127,187], target:[0,0,0] },
  { id:'ubosot', title:'พระอุโบสถ', en:'The ordination hall', subtitle:'หลังคาซ้อนชั้น · ลายประดับปิดทอง', description:'หลังคากระเบื้องสีส้มขอบเขียว ช่อฟ้า ใบระกา หน้าบันลายเปลว เสาประดับโมเสก และฐานซ้อนชั้น ลองซ่อนหลังคาเพื่อชมพระแก้วมรกตจำลองด้านใน', camera:[43,31,72], target:[-9,12,23], anchor:[-9,28,23] },
  { id:'chedi', title:'พระศรีรัตนเจดีย์', en:'Phra Si Rattana Chedi', subtitle:'เจดีย์ทรงระฆังสีทอง', description:'องค์ระฆังสร้างจากเส้นโค้งหมุนรอบแกน มีฐานบัว วงแหวน ปล้องไฉน และปลียอด พร้อมซุ้มประดิษฐานทั้งสี่ทิศ', camera:[-63,29,7], target:[-37,17,-26], anchor:[-37,38,-26] },
  { id:'mondop', title:'พระมณฑป', en:'Phra Mondop', subtitle:'ยอดบุษบก · โมเสกและลายทอง', description:'อาคารทรงมณฑปบนฐานยกสูง เสาและผนังสีน้ำเงินประดับทอง หลังคาทรงบุษบกไล่ระดับขึ้นสู่ยอด', camera:[17,30,-2], target:[-8,16,-28], anchor:[-8,35,-28] },
  { id:'pantheon', title:'ปราสาทพระเทพบิดร', en:'The Royal Pantheon', subtitle:'หลังคาจตุรมุข · ยอดปรางค์', description:'อาคารหลังคาสีเขียวซ้อนชั้น มีมุขยื่นทั้งสองด้านและยอดปรางค์ประดับกระเบื้องเหนือหลังคา', camera:[68,39,5], target:[25,20,-26], anchor:[25,47,-26] },
  { id:'prang', title:'พระอัษฎามหาเจดีย์', en:'The eight prangs', subtitle:'เจดีย์ทรงปรางค์ ๘ องค์', description:'แนวพระปรางค์แปดองค์ มีฐานซ้อนชั้น ลายกลีบ และแถบกระเบื้องเคลือบสีต่างกัน', camera:[87,26,49], target:[56,13,2], anchor:[56,27,16] },
  { id:'guardians', title:'ยักษ์ทวารบาล', en:'The guardians', subtitle:'มงกุฎ · เกราะ · กระบอง', description:'คู่ยักษ์สีเขียวและสีแดง ใบหน้ามีเขี้ยว มงกุฎหลายชั้น เกราะประดับลาย และกระบอง แยกสร้างจากชิ้นส่วนสามมิติ', camera:[0,13,61], target:[0,5.5,53], fov:60, anchor:[-5.6,14,53] },
  { id:'buddha', title:'พระแก้วมรกตจำลอง', en:'The Emerald Buddha study', subtitle:'พระพุทธรูป · ฐานทอง · ฉัตร', description:'พระพุทธรูปสีหยกในพระอุโบสถ พร้อมฐานทองซ้อนชั้นและฉัตร เป็นรูปจำลองเชิงสัญลักษณ์จากภาพอ้างอิง เลือกมุมมองนี้เพื่อเปิดหลังคา', camera:[-4,11,32], target:[-9,7,12], anchor:[-9,11,12], interior:true },
];

/** Approximate visual arrangement from the supplied photographs, not a survey plan. */
export function buildTemple({quality='high'}={}) {
  if(!['high','balanced'].includes(quality))throw new Error('quality must be high or balanced');
  const materials=createMaterials();
  const b=new Builder(materials,quality);
  grounds(b);
  hall(b,{x:-9,z:23,width:20,length:38,height:11,interior:true});
  goldenChedi(b,-37,-26,1);
  mondop(b,-8,-28);
  pantheon(b,25,-26);
  hall(b,{x:32,z:23,width:12,length:22,height:7.5,roofColor:'gold',style:'white',tiers:2});
  hall(b,{x:-40,z:0,width:9,length:14,height:6.5,roofColor:'blue',style:'mosaic',tiers:2,rotation:Math.PI/2});
  for(const x of [-27,9])for(const z of [2,44])pavilion(b,x,z,0,.75);
  const colors=['turquoise','blue','greenLight','ivory','goldLight','green','redLight','turquoise'];
  for(let i=0;i<8;i++)prang(b,56,-43+i*12.2,{scale:.72,color:colors[i],height:29});
  for(const x of [-24,7])for(const z of [8,34])prang(b,x,z,{scale:.38,color:'white',height:24});
  for(const x of [-49,3])prang(b,x,-8,{scale:.39,color:'gold',height:25});
  for(const [x,z,s] of [[-23,-44,.28],[8,-44,.28],[-48,-42,.22]])goldenChedi(b,x,z,s);
  enclosure(b);
  guardian(b,-5.6,53,'green',0,.93);guardian(b,5.6,53,'flagRed',0,.93);
  guardian(b,-58,5,'green',-Math.PI/2,.75);guardian(b,-58,-5,'flagRed',-Math.PI/2,.75);
  const {root,layers}=b.finish();
  root.updateMatrixWorld(true);
  const stats=getModelStats(root);
  root.userData.stats=stats;
  return {root,layers,materials,landmarks:LANDMARKS,stats};
}

export function getModelStats(root){
  let triangles=0,instances=0,drawCalls=0;
  root.traverse(o=>{if(o.isMesh){const n=o.isInstancedMesh?o.count:1;triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3*n;instances+=n;drawCalls++;}});
  const bounds=new THREE.Box3().setFromObject(root);
  return {triangles,instances,drawCalls,parts:root.userData.proceduralParts,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}};
}
