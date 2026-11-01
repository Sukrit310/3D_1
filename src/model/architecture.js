import { roofSurface, gablePanel } from './geometry.js';

export function steps(b,width,depth,height,count=5,mat='ivory') {
  for(let i=0;i<count;i++)b.box(0,height*(i+.5)/count,0,width-i*.55,height/count,depth-i*.55,mat);
}

function finial(b,x,y,z,scale=1,sign=1) {
  b.at(x,y,z,0,scale,()=>{
    b.curve([[0,0,0],[sign*.5,.65,0],[sign*.64,1.7,0],[sign*.36,2.4,0],[sign*.6,3.3,0]],.12,'goldLight',12);
    b.leaf(sign*.4,1.2,0,.65,-sign*.22);
    b.ball(0,0,0,.22,.3,.22,'gold');
  });
}

/** Tiered Thai gable roof with individual lapped tiles, gilded bargeboards,
 * chofah silhouettes, small bai raka teeth and carved front/rear pediments. */
export function thaiRoof(b,{width=26,length=48,y=14,rise=7,tiers=3,color='vermilion',ornate=true}) {
  b.on(b.layer==='walls'?'gallery-roofs':'roofs',()=>{
    for(let tier=0;tier<tiers;tier++){
      const w=width-tier*Math.min(3.0,width*.16),l=length-tier*Math.min(7.4,length*.23),base=y+tier*3.2,h=rise+tier*.45;
      const surface=roofSurface(b,w,l,base,h,color);
      const columns=Math.ceil(l/(b.quality==='high'?.82:1.35));
      const rows=Math.ceil((w/2)/(b.quality==='high'?.62:1.0));
      for(const side of [-1,1]){
        for(let row=0;row<rows;row++){
          const t=(row+.5)/rows, x=side*t*w/2, yy=surface(t);
          const derivative=-h*1.23*Math.pow(1-t,.23)/(w/2)+3.2*Math.pow(t,9)/(w/2);
          const slope=Math.atan(derivative*side);
          for(let col=0;col<columns;col++){
            const z=-l/2+(col+.5)*l/columns;
            const border=row<1||row>=rows-2||col<2||col>=columns-2;
            const material=border?'green':color==='vermilion'?['vermilion','redLight','vermilion','redDark'][(row*7+col*13)%4]:color;
            b.box(x,yy+.045,z,w/2/rows*1.045/Math.cos(slope),.095,l/columns*.94,material,0,0,slope);
          }
        }
        b.box(side*w/2,base+.1,0,.23,.28,l+.5,'goldLight');
        b.box(side*(w/2-.1),base-.3,0,.28,.24,l+.5,'wood');
      }
      b.beam([0,base+h+.15,-l/2-.25],[0,base+h+.15,l/2+.25],.2,'goldLight');
      for(const end of [-1,1]){
        const z=end*(l/2+.12);
        gablePanel(b,w-1,base+.05,h-.2,z,end===1?'blue':'green');
        for(const side of [-1,1]){
          const points=[];
          for(let j=0;j<=12;j++){const t=j/12;points.push([side*t*w/2,surface(t)+.12,z+end*.2]);}
          b.curve(points,.18,'goldLight',24);
          const n=Math.floor(w/1.4);
          for(let j=1;j<n;j++){
            const t=j/n;
            b.leaf(side*t*w/2,surface(t)+.18,z+end*.25,.42,side*.35);
          }
          finial(b,side*w/2,base,z,ornate?.85:.55,side);
        }
        finial(b,0,base+h,z,ornate?1.15:.65,end);
        b.box(0,base+.1,z,w,.25,.33,'goldLight');
        if(ornate){
          // Symmetric carved flame tracery, progressively smaller towards the peak.
          for(let row=0;row<5;row++){
            const yy=base+.55+row*h*.145, span=w*.4*Math.pow(1-row/6,1.35);
            const count=Math.max(1,Math.floor(span/.7));
            for(let j=-count;j<=count;j++){
              const x=j*span/(count+.25);
              if(Math.abs(x)>w*.4*(1-row/6))continue;
              const s=.38+(.18*(1-row/5));
              b.leaf(x,yy,z+end*.32,s,(j%2?-.4:.4));
              if(row<3){
                b.diamond(x,yy+.35,z+end*.42,.16,'turquoise');
                b.at(x,yy,z+end*.3,0,.36,()=>{
                  b.curve([[0,0,0],[.55,.25,0],[.7,.75,0],[.45,1,0],[.1,.8,0],[.27,.58,0]],.075,'goldLight',10);
                  b.curve([[0,0,0],[-.55,.25,0],[-.7,.75,0],[-.45,1,0],[-.1,.8,0],[-.27,.58,0]],.075,'goldLight',10);
                });
              }
            }
          }
          b.at(0,base+h*.26,z+end*.4,end===1?0:Math.PI,1,()=>{
            b.ball(0,.9,0,.55,1,.16,'gold');
            b.ball(0,2,0,.3,.35,.2,'goldLight');
            for(const s of [-1,1]){
              b.curve([[0,1,0],[s*.8,1.2,0],[s*1.5,2,0],[s*1.9,1.7,0]],.12,'goldLight');
              for(let k=0;k<5;k++)b.leaf(s*(.45+k*.28),1.3+k*.1,.05,.5,s*.7);
            }
          });
        }
      }
      // Suspended gold eave bells and small rafters.
      for(const side of [-1,1])for(let i=0;i<Math.floor(l/1.3);i++){
        const z=-l/2+.65+i*1.3;
        b.ball(side*w/2,base-.38,z,.1,.15,.1,'goldLight');
        if(i%2===0)b.beam([side*(w/2-.9),base-.2,z],[side*w/2,base-.2,z],.08,'wood');
      }
    }
  });
}

export function column(b,x,z,base,height,style='mosaic') {
  b.at(x,base,z,0,1,()=>{
    b.box(0,.22,0,1.45,.44,1.45,'ivory');
    b.box(0,.54,0,1.1,.2,1.1,'gold');
    b.cylinder(0,height/2,0,.34,.48,height,style==='white'?'ivory':'blue',8);
    for(const y of [.8,1.05,height-1.0,height-.7,height-.4])b.cylinder(0,y,0,.57,.55,.16,'gold',8);
    b.cylinder(0,height-.45,0,.8,.38,.9,'gold',8);
    if(style==='mosaic'){
      for(let y=1.4;y<height-1.4;y+=.75)for(let s=0;s<4;s++){
        const a=s*Math.PI/2;
        b.at(Math.sin(a)*.4,y,Math.cos(a)*.4,a,1,()=>b.diamond(0,0,0,.2,'turquoise'));
      }
      for(let i=0;i<8;i++){const a=i*Math.PI/4;b.at(Math.sin(a)*.5,height-.7,Math.cos(a)*.5,a,1,()=>b.leaf(0,0,0,.52));}
    }
  });
}

function pointedFrame(b,width,height,base,z,door=false){
  b.box(0,base+height/2,z,width+.3,height+.3,.35,'goldDark');
  b.box(0,base+height/2,z+.22,width,height,.16,door?'wood':'black');
  for(const s of [-1,1])b.box(s*width/2,base+height/2,z+.35,.18,height,.2,'goldLight');
  b.box(0,base,z+.35,width+.4,.25,.35,'gold');
  b.box(0,base+height,z+.35,width+.4,.22,.35,'gold');
  const arch=height*.3;
  for(const s of [-1,1]){
    b.curve([[s*(width/2+.15),base+height,z+.4],[s*width*.28,base+height+arch*.45,z+.4],[0,base+height+arch,z+.4]],.12,'goldLight');
    b.leaf(s*width*.28,base+height+.1,z+.35,.7,s*.6);
  }
  b.leaf(0,base+height+arch,z+.3,.55);
  for(let i=0;i<(door?3:4);i++)b.box((i-(door?1:1.5))*width/(door?3.7:5),base+height/2,z+.36,.045,height-.3,.06,'gold');
}

export function hall(b,{x=0,z=0,width=21,length=40,height=12,roofColor='vermilion',style='mosaic',tiers=3,rotation=0,interior=false}){
  b.at(x,0,z,rotation,1,()=>{
    steps(b,width+8,length+8,1.65,5,'ivory');
    // Layered blue/turquoise mosaic plinth.
    for(let i=0;i<3;i++)b.box(0,1.65+i*.23,0,width+4.6-i*.25,.22,length+4.6-i*.25,i===1?'gold':'turquoise');
    const wallW=width-4,wallL=length-5,base=2.35;
    b.box(0,base+.18,0,wallW,.36,wallL,'stone');
    for(const s of [-1,1]){
      b.box(s*(wallW/2-.3),base+height/2,0,.65,height,wallL,style==='white'?'ivory':'blue');
      // Front/back walls leave a real central doorway.
      for(const side of [-1,1])b.box(side*(wallW/4+.9),base+height/2,s*wallL/2,wallW/2-1.8,height,.65,style==='white'?'ivory':'blue');
      b.box(0,base+height-1,s*wallL/2,3.6,2,.65,'goldDark');
      for(let i=0;i<Math.floor(length/4);i++){
        const zz=-(length-5)/2+i*(length-5)/(Math.floor(length/4)-1);
        column(b,s*width/2,zz,1.8,height+.4,style);
      }
      for(let i=0;i<5;i++){
        const xx=(i-2)*width/5;
        column(b,xx,s*length/2,1.8,height+.4,style);
      }
      for(let i=0;i<Math.floor(wallL/5);i++){
        const zz=-wallL/2+3+i*5;
        b.at(s*(wallW/2+.08),0,zz,s*Math.PI/2,1,()=>pointedFrame(b,1.5,4.3,base+2.4,.1));
      }
      b.at(0,0,s*(wallL/2+.3),s===1?0:Math.PI,1,()=>pointedFrame(b,3.3,7,base,0,true));
      // Front stairs and balustrades.
      for(let i=0;i<6;i++)b.box(0,(i+.5)*.28,s*(length/2+4.9-i*.5),7,.28*(i+1),.55,'ivory');
      for(const side of [-1,1]){
        b.beam([side*3.6,.55,s*(length/2+5)],[side*3.6,2.7,s*(length/2+1.7)],.16,'gold');
        finial(b,side*3.6,.4,s*(length/2+5),.45,side);
      }
    }
    // Gold horizontal friezes and tiny mirrored tesserae on the outer walls.
    for(const side of [-1,1]){
      for(const yy of [base+.5,base+1.4,base+height-.4])b.box(side*(wallW/2+.07),yy,0,.12,.18,wallL,'goldLight');
      if(b.quality==='high')for(let zz=-wallL/2+.7;zz<wallL/2;zz+=.8){
        b.at(side*(wallW/2+.12),base+1,zz,side*Math.PI/2,1,()=>b.diamond(0,0,0,.27,'gold'));
      }
    }
    thaiRoof(b,{width:width+7,length:length+9,y:base+height,rise:width*.31,tiers,color:roofColor});
    if(interior)emeraldBuddha(b,0,base,-length*.25);
  });
}

export function emeraldBuddha(b,x,y,z){
  b.on('interior',()=>b.at(x,y,z,0,1,()=>{
    // Symbolic, respectful representation; not a scanned religious artwork.
    for(let i=0;i<7;i++){
      const r=3.3-i*.32;
      b.cylinder(0,.38+i*.5,0,r-.12,r,.5,'gold',24);
      b.ring(0,.15+i*.5,0,r,.12,'goldLight');
      for(let j=0;j<20;j++){
        const a=j/20*Math.PI*2;
        b.at(Math.sin(a)*r,.35+i*.5,Math.cos(a)*r,a,.3,()=>b.leaf(0,0,0,1));
      }
    }
    b.ball(0,4,0,1.5,.4,.85,'jade');
    b.ball(0,4.9,0,.64,1,.46,'jade');
    b.ball(0,6.1,0,.42,.51,.39,'jade');
    b.cylinder(0,6.6,0,0,.24,.65,'gold',16);
    b.ball(-.7,4.1,.3,.9,.24,.4,'jade');b.ball(.7,4.1,.3,.9,.24,.4,'jade');
    b.beam([-.5,5.4,0],[-.9,4.7,.3],.19,'jade');b.beam([-.9,4.7,.3],[.2,4.3,.55],.16,'jade');
    b.beam([.5,5.4,0],[.85,4.4,.45],.18,'jade');
    b.box(0,5.1,.42,.6,1.25,.08,'gold');
    for(let i=0;i<3;i++){
      const yy=8.3+i*.8,r=2.7-i*.65;
      b.cylinder(0,yy,0,.2,r,.6,'gold',32);b.ring(0,yy-.3,0,r,.08,'goldLight');
    }
    for(const xx of [-4,4])b.cylinder(xx,5.5,-1,.2,.24,11,'wood');
    b.cylinder(0,10,0,0,.2,1.6,'gold');
  }));
}

export function pavilion(b,x,z,rotation=0,scale=1){
  b.at(x,0,z,rotation,scale,()=>{
    steps(b,8,10,1,3);
    for(const xx of [-2.7,2.7])for(const zz of [-3.5,3.5])column(b,xx,zz,1,5,'white');
    thaiRoof(b,{width:9,length:11,y:6.1,rise:3.1,tiers:2,ornate:false});
  });
}

export function goldenChedi(b,x,z,scale=1){
  b.at(x,2.1,z,0,scale,()=>{
    for(let i=0;i<5;i++)b.cylinder(0,i*.45,0,8.5-i*.33,8.7-i*.33,.48,'gold',48);
    b.lathe([[0,2],[7.3,2],[7.2,2.5],[6.7,2.7],[6.7,3.2],[6.3,3.5],[6.3,4],[5.7,4.2],[5.7,4.8],[5.5,5.2],[5.15,5.7],[5,6.4],[5.5,6.9],[5.4,7.5],[4.8,8],[4.55,9],[4.5,11.5],[4.2,13],[3.6,14.5],[2.6,15.8],[2.5,16.4],[0,16.4]],'gold',64);
    for(const [yy,r] of [[2.5,7],[3.2,6.7],[4,6.3],[4.8,5.7],[5.7,5.2],[6.9,5.4],[8,4.8],[15.8,2.65]])b.ring(0,yy,0,r,.17,'goldLight');
    b.cylinder(0,17,0,2.05,2.5,1.3,'goldDark',16);
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;b.at(Math.sin(a)*2.3,16.5,Math.cos(a)*2.3,a,1,()=>b.box(0,.5,0,.28,1.1,.22,'goldLight'));}
    for(let i=0;i<27;i++){
      const r=2.55*Math.pow(1-i/29,1.25);
      b.cylinder(0,18+i*.47,0,r*.9,r,.5,'gold',48);
      b.ring(0,17.8+i*.47,0,r,.065,'goldLight');
    }
    b.cylinder(0,32.5,0,.015,.32,5,'goldLight',16);
    b.ball(0,35.1,0,.17,.25,.17,'goldLight');
    for(let s=0;s<4;s++)b.at(0,0,0,s*Math.PI/2,1,()=>{
      b.box(0,3.5,8,2.9,4.5,.65,'gold');
      pointedFrame(b,1.5,2.5,1.2,8.4);
      for(let i=0;i<6;i++)b.box(0,.15+i*.25,10.5-i*.4,3,.3,.5,'ivory');
    });
  });
}

/** Porcelain prang with a tiered, gently narrowing profile and glazed petals. */
export function prang(b,x,z,{scale=1,color='turquoise',height=25}={}){
  b.at(x,0,z,0,scale,()=>{
    steps(b,7.5,7.5,1.6,4);
    for(let tier=0;tier<13;tier++){
      const t=tier/13,r=3.2*Math.pow(1-t,1.15)+.25,yy=2+tier*(height-4)/13,h=(height-4)/13;
      b.cylinder(0,yy+h*.25,0,r*.86,r,h*.7,'ivory',16);
      b.cylinder(0,yy+h*.66,0,r*.94,r*.86,h*.22,color,16);
      b.ring(0,yy+h*.78,0,r*.91,.09,'goldLight');
      for(let j=0;j<12;j++){
        const a=j*Math.PI/6;
        b.at(Math.sin(a)*r,yy,Math.cos(a)*r,a,1,()=>{
          b.leaf(0,.05,0,Math.max(.22,r*.2),0,'white');
          if(b.quality==='high')b.diamond(0,h*.5,.04,Math.max(.1,r*.11),tier%2?'green':'blue');
        });
      }
    }
    b.cylinder(0,height-1,0,.02,.34,4.5,'gold',12);
    for(let i=0;i<4;i++)b.ring(0,height-1+i*.6,0,.25-i*.05,.06,'goldLight');
  });
}

export function mondop(b,x,z){
  b.at(x,2.2,z,0,1,()=>{
    steps(b,19,19,1.2,4);
    b.box(0,6.4,0,11,10.4,11,'blue');
    for(let s=0;s<4;s++)b.at(0,0,0,s*Math.PI/2,1,()=>{
      pointedFrame(b,2.6,5.3,2,5.7,true);
      for(let i=-2;i<=2;i++)column(b,i*3,7,1.1,10.5,'mosaic');
      for(let row=0;row<9;row++)for(let col=-5;col<=5;col++){
        if(Math.abs(col)<2&&row<6)continue;
        b.diamond(col*.85,2+row*.8,5.6,.27,row%2?'gold':'turquoise');
      }
    });
    b.on('roofs',()=>{
      for(let i=0;i<7;i++){
        const w=20-i*2.2,yy=12+i*1.5;
        b.at(0,yy,0,Math.PI/4,1,()=>b.cylinder(0,0,0,(w-3)*.707,w*.707,1.45,'goldDark',4));
        b.box(0,yy-.7,0,w,.22,w,'goldLight');
        for(const xx of [-1,1])for(const zz of [-1,1])finial(b,xx*w/2,yy-.5,zz*w/2,.45,xx);
        for(let j=-3;j<=3;j++)for(const s of [-1,1])b.leaf(j*w/8,yy-.55,s*w/2,.43,0,'gold');
      }
      b.cylinder(0,22.5,0,1.9,2.1,1.8,'gold',24);
      b.cylinder(0,25.2,0,.2,1.9,4.4,'gold',24);
      for(let i=0;i<12;i++)b.ring(0,24+i*.36,0,1.2-i*.08,.08,'goldLight');
      b.cylinder(0,30.7,0,.015,.25,7,'goldLight',12);
    });
  });
}

export function pantheon(b,x,z){
  hall(b,{x,z,width:21,length:29,height:10,roofColor:'green',tiers:3});
  // Cruciform roof wings and a central Khmer-style mosaic tower.
  for(const s of [-1,1])b.at(x+s*13,0,z,Math.PI/2,.72,()=>{
    b.box(0,7,0,12,12,14,'ivory');
    for(const xx of [-7,7])for(const zz of [-7,0,7])column(b,xx,zz,1.5,11,'mosaic');
    thaiRoof(b,{width:20,length:22,y:13,rise:5,tiers:2,color:'green'});
  });
  b.on('roofs',()=>b.at(x,24,z,0,.7,()=>prang(b,0,0,{scale:1,color:'green',height:29})));
}
