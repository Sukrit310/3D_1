import { cp, mkdir, rm } from 'node:fs/promises';
await rm('dist', { recursive:true, force:true });
await mkdir('dist/vendor', { recursive:true });
for (const f of ['index.html','src']) await cp(f, `dist/${f}`, { recursive:true });
for (const f of ['build','examples/jsm','LICENSE']) await cp(`node_modules/three/${f}`, `dist/vendor/${f}`, { recursive:true });
console.log('Built dist/ — self-contained, no CDN or external textures.');
