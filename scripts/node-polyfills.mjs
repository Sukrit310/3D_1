/** GLTFExporter uses FileReader in browsers. Node has Blob but no FileReader. */
export function installFileReader(){
  if(globalThis.FileReader)return;
  globalThis.FileReader=class {
    constructor(){this.result=null;this.error=null;this.onload=null;this.onloadend=null;this.onerror=null;}
    async readAsArrayBuffer(blob){
      try{this.result=await blob.arrayBuffer();this.onload?.({target:this});this.onloadend?.({target:this});}
      catch(error){this.error=error;this.onerror?.({target:this});}
    }
    async readAsDataURL(blob){
      try{this.result=`data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`;this.onload?.({target:this});this.onloadend?.({target:this});}
      catch(error){this.error=error;this.onerror?.({target:this});}
    }
  };
}
