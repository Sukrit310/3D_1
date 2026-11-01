import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { buildTemple, LANDMARKS } from '../src/model/temple.js';
import { exportGLB } from '../src/export.js';
import { installFileReader } from '../scripts/node-polyfills.mjs';
installFileReader();
const detailed=buildTemple({quality:'high'});
const balanced=buildTemple({quality:'balanced'});

test('Both detail levels retain finite, non-degenerate geometry and required layers',()=>{
  for(const model of [detailed,balanced]){
    for(const layer of ['buildings','roofs','interior','walls','gallery-roofs','landscape','sculptures'])assert.ok(model.layers[layer],layer);
    assert.ok(model.stats.triangles>500000);
    assert.ok(model.stats.drawCalls<600,'Batch count must remain practical');
    model.root.traverse(o=>{
      if(!o.isMesh)return;
      assert.ok(o.material.isMeshStandardMaterial);
      const a=o.geometry.attributes.position.array;
      for(const value of a)assert.ok(Number.isFinite(value));
      if(o.isInstancedMesh){
        const m=new THREE.Matrix4();
        for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);assert.ok(m.elements.every(Number.isFinite));assert.ok(m.determinant()>0);}
      }
    });
  }
});

test('Balanced quality reduces tiles while keeping the overall bounds',()=>{
  assert.ok(balanced.stats.parts<detailed.stats.parts*.8);
  assert.deepEqual(balanced.stats.bounds,detailed.stats.bounds);
  assert.equal(LANDMARKS.length,8);
  assert.equal(new Set(LANDMARKS.map(l=>l.id)).size,8);
});

test('GLB can be exported and reloaded with geometry, materials, layers and instances intact',async()=>{
  // Hidden layers must still be present in a full-model export.
  balanced.layers.roofs.visible=false;
  const glb=await exportGLB(balanced.root);
  const header=new DataView(glb);
  assert.equal(header.getUint32(0,true),0x46546c67);
  assert.equal(header.getUint32(4,true),2);
  assert.equal(header.getUint32(8,true),glb.byteLength);
  const jsonLength=header.getUint32(12,true);
  const json=JSON.parse(new TextDecoder().decode(new Uint8Array(glb,20,jsonLength)).trim());
  assert.ok(json.extensionsUsed.includes('EXT_mesh_gpu_instancing'));
  assert.ok(json.nodes.some(n=>n.name==='roofs'));
  assert.ok(json.materials.length>=20);
  assert.ok(!json.images,'Export is self-contained and texture-free');
  const loaded=await new GLTFLoader().parseAsync(glb,'');
  let meshes=0;let instances=0;
  loaded.scene.traverse(o=>{if(o.isMesh)meshes++;if(o.isInstancedMesh)instances+=o.count;});
  assert.equal(meshes,balanced.stats.drawCalls);
  assert.ok(instances>20000);
  loaded.scene.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(loaded.scene);
  assert.ok(Math.abs(bounds.max.y-balanced.stats.bounds.max[1])<.02);
});
