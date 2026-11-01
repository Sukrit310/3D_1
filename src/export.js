import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

/** Exports the complete model, independent of the viewer's visibility toggles.
 * Hardware instances are preserved using EXT_mesh_gpu_instancing. */
export async function exportGLB(root) {
  root.updateMatrixWorld(true);
  return new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:false,trs:true});
}

export function downloadBlob(blob,filename){
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
}
