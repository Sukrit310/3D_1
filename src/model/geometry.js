import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const geometries = new Map();
const cached = (key, fn) => {
  if (!geometries.has(key)) geometries.set(key, fn());
  return geometries.get(key);
};
const unitBox = cached('box', () => new THREE.BoxGeometry(1, 1, 1));
const unitSphere = cached('sphere', () => new THREE.SphereGeometry(1, 12, 8));
const matrix = (x,y,z,sx,sy,sz,rx=0,ry=0,rz=0) => new THREE.Matrix4().compose(
  new THREE.Vector3(x,y,z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)), new THREE.Vector3(sx,sy,sz));

/** Batched world-space geometry. Shared primitives use hardware instancing;
 * one-off geometry is merged by material. Semantic layers remain independent. */
export class Builder {
  constructor(materials, quality='high') {
    this.m = materials;
    this.quality = quality;
    this.transform = new THREE.Matrix4();
    this.layer = 'buildings';
    this.parts = new Map();
    this.partCount = 0;
  }
  at(x,y,z,rotation,scale,fn) {
    const previous = this.transform;
    this.transform = previous.clone().multiply(matrix(x,y,z,scale,scale,scale,0,rotation,0));
    try { fn(); } finally { this.transform = previous; }
  }
  on(layer,fn) { const previous=this.layer; this.layer=layer; try {fn();} finally {this.layer=previous;} }
  add(geometry,mat,local=new THREE.Matrix4()) {
    const material=typeof mat==='string'?this.m[mat]:mat;
    if (!material) throw new Error(`Unknown material: ${mat}`);
    const key=`${this.layer}/${material.uuid}/${geometry.uuid}`;
    if(!this.parts.has(key)) this.parts.set(key,{layer:this.layer,geometry,material,matrices:[]});
    this.parts.get(key).matrices.push(this.transform.clone().multiply(local));
    this.partCount++;
  }
  box(x,y,z,w,h,d,mat,rx=0,ry=0,rz=0) { this.add(unitBox,mat,matrix(x,y,z,w,h,d,rx,ry,rz)); }
  ball(x,y,z,rx,ry,rz,mat) {this.add(unitSphere,mat,matrix(x,y,z,rx,ry,rz));}
  cylinder(x,y,z,top,bottom,height,mat,sides=16) {
    const g=cached(`cyl/${top}/${bottom}/${sides}`,()=>new THREE.CylinderGeometry(top,bottom,1,sides));
    this.add(g,mat,matrix(x,y,z,1,height,1));
  }
  ring(x,y,z,r,t,mat,rx=Math.PI/2) {
    const g=cached(`ring/${r}/${t}`,()=>new THREE.TorusGeometry(r,t,6,32));
    this.add(g,mat,matrix(x,y,z,1,1,1,rx));
  }
  beam(a,b,r,mat,sides=8) {
    const v1=new THREE.Vector3(...a), v2=new THREE.Vector3(...b), d=v2.clone().sub(v1);
    const g=cached(`beam/${sides}`,()=>new THREE.CylinderGeometry(1,1,1,sides));
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());
    this.add(g,mat,new THREE.Matrix4().compose(v1.add(v2).multiplyScalar(.5),q,new THREE.Vector3(r,d.length(),r)));
  }
  curve(points,r,mat,segments=16) {
    const key=`curve/${r}/${segments}/${JSON.stringify(points)}`;
    const g=cached(key,()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),segments,r,5,false));
    this.add(g,mat);
  }
  lathe(profile,mat,sides=48) {
    const g=cached(`lathe/${sides}/${JSON.stringify(profile)}`,()=>new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),sides));
    this.add(g,mat);
  }
  leaf(x,y,z,s,rotation=0,mat='gold') {
    const g=cached('flame-leaf',()=>{
      const shape=new THREE.Shape();
      shape.moveTo(0,0); shape.bezierCurveTo(-.7,.4,-.44,1.15,0,1.72);
      shape.bezierCurveTo(.05,.8,.66,.65,0,0);
      return new THREE.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:false,curveSegments:5});
    });
    this.add(g,mat,matrix(x,y,z,s,s,s,0,0,rotation));
  }
  diamond(x,y,z,s,mat,ry=0) {this.box(x,y,z,s,s,.055,mat,0,ry,Math.PI/4);}
  finish() {
    const root=new THREE.Group(); root.name='Wat Phra Kaew — procedural architectural study';
    const layers={}; const merged=new Map();
    const getLayer=name=>{
      if(!layers[name]) {layers[name]=new THREE.Group();layers[name].name=name;root.add(layers[name]);}
      return layers[name];
    };
    for(const p of this.parts.values()) {
      if(p.matrices.length>=4) {
        const mesh=new THREE.InstancedMesh(p.geometry,p.material,p.matrices.length);
        p.matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));
        mesh.instanceMatrix.needsUpdate=true;
        mesh.name=`${p.material.name} × ${p.matrices.length}`;
        mesh.castShadow=p.layer!=='landscape'; mesh.receiveShadow=true;
        mesh.computeBoundingSphere();getLayer(p.layer).add(mesh);
      } else {
        const key=p.layer+'/'+p.material.uuid;
        if(!merged.has(key))merged.set(key,{layer:p.layer,material:p.material,geos:[]});
        for(const m of p.matrices){
          const g=p.geometry.index?p.geometry.toNonIndexed():p.geometry.clone();
          g.deleteAttribute('uv');g.applyMatrix4(m);merged.get(key).geos.push(g);
        }
      }
    }
    for(const p of merged.values()){
      const geo=mergeGeometries(p.geos,false);
      if(!geo)throw new Error(`Could not batch ${p.material.name}`);
      const mesh=new THREE.Mesh(geo,p.material);
      mesh.name=p.material.name;mesh.castShadow=p.layer!=='landscape';mesh.receiveShadow=true;
      getLayer(p.layer).add(mesh);p.geos.forEach(g=>g.dispose());
    }
    root.userData={quality:this.quality,proceduralParts:this.partCount,units:'approximate metres',surveyAccurate:false};
    this.parts.clear();
    return {root,layers};
  }
}

export function roofSurface(b,width,length,base,rise,mat='green') {
  const key=`roof/${width}/${length}/${base}/${rise}`;
  const shapeY=t=>base+rise*Math.pow(1-t,1.23)+.32*Math.pow(t,10);
  const g=cached(key,()=>{
    const positions=[],indices=[],segments=18;
    for(const side of [-1,1]) {
      const start=positions.length/3;
      for(let i=0;i<=segments;i++){
        const t=i/segments,x=side*width/2*t,y=shapeY(t);
        positions.push(x,y,-length/2,x,y,length/2);
      }
      for(let i=0;i<segments;i++){
        const a=start+i*2;
        if(side===1)indices.push(a,a+1,a+2,a+1,a+3,a+2);
        else indices.push(a,a+2,a+1,a+1,a+2,a+3);
      }
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geo.setIndex(indices);geo.computeVertexNormals();return geo;
  });
  b.add(g,mat);
  return shapeY;
}

export function gablePanel(b,width,base,height,z,mat='blue') {
  const key=`gable/${width}/${base}/${height}/${z}`;
  const g=cached(key,()=>{
    const shape=new THREE.Shape();shape.moveTo(-width/2,base);shape.lineTo(width/2,base);
    shape.quadraticCurveTo(width*.22,base+height*.35,0,base+height);
    shape.quadraticCurveTo(-width*.22,base+height*.35,-width/2,base);
    const g=new THREE.ExtrudeGeometry(shape,{depth:.2,bevelEnabled:false,curveSegments:12});
    g.translate(0,0,z);return g;
  });
  b.add(g,mat);
}
