import { steps, thaiRoof, column, prang } from './architecture.js';

export function guardian(b,x,z,color='green',rotation=0,scale=1){
  b.on('sculptures',()=>b.at(x,0,z,rotation,scale,()=>{
    steps(b,3.8,3.8,1.1,4);
    // Armoured yaksha silhouette: bent arms, fanged face, high crown and club.
    for(const s of [-1,1]){
      b.box(s*.57,1.32,.2,.9,.4,1.65,color);
      b.cylinder(s*.56,2.3,0,.36,.3,1.75,color,12);
      b.cylinder(s*.56,3.4,0,.5,.4,1.0,'gold',12);
      for(let i=0;i<3;i++)b.ring(s*.56,3+i*.27,0,.44,.08,'goldLight');
      b.ball(s*.56,4.1,0,.6,.7,.5,color);
    }
    b.cylinder(0,4.4,0,1.1,1.35,1.4,'goldDark',12);
    b.cylinder(0,5.3,0,.82,1.1,1.2,color,12);
    b.ball(0,6.3,0,1.18,1.2,.65,color);
    b.box(0,5.35,.66,1.75,.28,.16,'goldLight');
    for(const s of [-1,1]){
      b.ball(s*1.06,6.5,0,.5,.55,.55,'gold');
      b.beam([s*1.15,6.3,0],[s*1.35,5.7,.3],.31,color);
      b.beam([s*1.35,5.7,.3],[s*.25,5.6,1.0],.3,color);
      b.ball(s*.25,5.6,1,.32,.27,.3,color);
      b.ring(s*.8,5.67,.7,.33,.09,'gold',Math.PI/2);
      // Hip armour fans.
      b.leaf(s*1.0,3.5,.1,.9,-s*.85);
      b.leaf(s*.8,3.8,.15,.8,-s*.55);
      b.leaf(s*.6,6.0,.58,.65,-s*.35);
    }
    for(let yy=4;yy<7;yy+=.32)for(let xx=-.75;xx<=.75;xx+=.3){
      b.diamond(xx,yy,.66,.14,(Math.round(yy*10)+Math.round(xx*10))%2?'goldLight':'turquoise');
    }
    b.ball(0,7.8,0,.86,.93,.72,color);
    b.box(0,7.7,.67,1.45,.3,.15,'goldDark');
    b.box(0,7.72,.79,1.2,.13,.06,'ivory');
    for(const s of [-1,1]){
      b.ball(s*.36,8.14,.62,.28,.22,.15,'white');
      b.ball(s*.34,8.14,.76,.09,.12,.06,'black');
      b.curve([[s*.1,8.34,.7],[s*.4,8.45,.7],[s*.7,8.31,.5]],.1,'gold');
      b.cylinder(s*.54,7.76,.86,.03,.14,.52,'ivory',8);
      b.ball(s*.9,7.9,0,.18,.43,.23,'gold');
    }
    b.ball(0,7.97,.78,.18,.23,.22,color);
    for(let i=0;i<6;i++){
      const r=.92-i*.12;
      b.cylinder(0,8.65+i*.29,0,r*.83,r,.34,'gold',16);
      b.ring(0,8.48+i*.29,0,r,.07,'goldLight');
      for(let j=0;j<8;j++){const a=j*Math.PI/4;b.ball(Math.sin(a)*r,8.65+i*.29,Math.cos(a)*r,.08,.09,.08,'turquoise');}
    }
    b.cylinder(0,11.1,0,.01,.28,2.0,'goldLight',12);
    b.cylinder(0,3.55,1.15,.17,.22,5.2,'goldDark',12);
    for(let y=1.2;y<6;y+=.27)b.ring(0,y,1.15,.22,.055,'goldLight');
    b.ball(0,6.3,1.15,.28,.28,.28,'gold');
  }));
}

export function tree(b,x,z,scale=1,kind='topiary'){
  b.on('landscape',()=>b.at(x,0,z,0,scale,()=>{
    b.cylinder(0,.4,0,1.6,1.5,.8,'ivory',16);
    b.cylinder(0,.86,0,1.4,1.4,.15,'darkStone',16);
    b.cylinder(0,2,0,.16,.32,3.6,'trunk',8);
    const positions=kind==='topiary'?[[0,4.6,0,1.9],[1.25,3,.15,1.3],[-.9,3.4,-.25,1.2]]:[[0,6,0,2.9],[1.5,4.9,0,2.3],[-1.5,5.1,.5,2.1],[.5,5,-1.6,1.9]];
    for(const [xx,yy,zz,r] of positions){
      b.beam([0,1.5,0],[xx,yy,zz],.11,'trunk');
      b.ball(xx,yy,zz,r,r*.8,r,'leaf');
      for(let j=0;j<5;j++){const a=j/5*Math.PI*2;b.ball(xx+Math.sin(a)*r*.6,yy+.35,zz+Math.cos(a)*r*.6,r*.48,r*.4,r*.48,'leafLight');}
    }
  }));
}

function wallSection(b,length){
  b.box(0,1.9,0,length,3.8,1,'ivory');
  b.box(0,.35,0,length+.1,.5,1.3,'white');
  b.box(0,3.65,0,length+.1,.22,1.3,'white');
  for(let i=0;i<Math.floor(length/.85);i++){
    const x=-length/2+.43+i*.85;
    b.box(x,4,0,.55,.65,.75,'white');
    b.ball(x,4.34,0,.29,.42,.38,'white');
    b.box(x,2.4,.52,.12,.7,.05,'darkStone');
  }
}

export function gate(b,x,z,rotation=0){
  b.at(x,0,z,rotation,1,()=>{
    for(const s of [-1,1]){
      b.box(s*3.1,3,0,2,6,3.3,'ivory');
      b.box(s*3.1,.3,0,2.5,.6,3.8,'white');
      b.box(s*3.1,6,0,2.4,.4,3.7,'gold');
    }
    b.box(0,6.8,0,8.2,1.3,3.4,'ivory');
    thaiRoof(b,{width:9,length:6,y:7.3,rise:3,tiers:2,ornate:true});
    b.at(0,10.8,0,0,.43,()=>prang(b,0,0,{color:'turquoise',height:24}));
  });
}

export function enclosure(b){
  b.on('walls',()=>{
    for(const z of [-65,65]){
      for(const s of [-1,1])b.at(s*39,0,z,0,1,()=>wallSection(b,66));
      gate(b,0,z,z<0?Math.PI:0);
    }
    for(const x of [-72,72]){
      for(const s of [-1,1])b.at(x,0,s*35.5,Math.PI/2,1,()=>wallSection(b,59));
      gate(b,x,0,x>0?Math.PI/2:-Math.PI/2);
    }
    for(const x of [-72,72])for(const z of [-65,65])b.at(x,0,z,0,1,()=>{
      b.cylinder(0,2.1,0,3.4,3.4,4.2,'ivory',8);
      for(let i=0;i<12;i++){const a=i*Math.PI/6;b.box(Math.sin(a)*3.3,4.4,Math.cos(a)*3.3,.6,.8,.6,'white');}
    });
    // Covered Ramakien galleries. Roofs are in their own visibility layer.
    for(const s of [-1,1]){
      for(const part of [-1,1])b.at(part*37,0,s*58,0,1,()=>{
        b.box(0,.25,0,60,.5,6,'ivory');b.box(0,2.5,s*2.4,60,4.5,.4,'wood');
        for(let i=0;i<20;i++)column(b,-28.5+i*3,-s*2.2,.5,4.8,'white');
        b.at(0,0,0,Math.PI/2,1,()=>thaiRoof(b,{width:7.5,length:61,y:5.6,rise:2.1,tiers:1,ornate:false}));
        for(let i=0;i<20;i++){
          b.box(-28+i*3,2.5,s*2.12,2.7,3,.07,'goldDark');
          for(let j=0;j<3;j++)b.leaf(-28.6+i*3+j*.6,1.3,s*2.04,.6,j*.3,j%2?'green':'gold');
        }
      });
      for(const part of [-1,1])b.at(s*65,0,part*32,Math.PI/2,1,()=>{
        b.box(0,.25,0,50,.5,6,'ivory');b.box(0,2.5,-s*2.4,50,4.5,.4,'wood');
        for(let i=0;i<17;i++)column(b,-24+i*3,s*2.2,.5,4.8,'white');
        b.at(0,0,0,Math.PI/2,1,()=>thaiRoof(b,{width:7.5,length:51,y:5.6,rise:2.1,tiers:1,ornate:false}));
      });
    }
  });
}

export function grounds(b){
  b.on('landscape',()=>{
    b.box(0,-2,0,166,3.2,152,'plinth');
    b.box(0,-.55,0,162,.35,148,'goldDark');
    b.box(0,-.3,0,160,.3,146,'road');
    b.box(0,-.05,0,146,.35,132,'stone');
    // Staggered limestone joints, modeled rather than loaded from an image.
    for(let z=-63;z<=63;z+=3){
      b.box(0,.14,z,142,.018,.035,'darkStone');
      for(let x=-70+(Math.round(z)%2?1.5:0);x<71;x+=3)b.box(x,.14,z+1.5,.025,.018,3,'darkStone');
    }
    for(const x of [-48,29])for(const z of [30,46]){
      b.box(x,.22,z,15,.2,10,'ivory');b.box(x,.35,z,14.3,.1,9.3,'lawn');
    }
    // Raised shared terrace under the northern landmarks.
    b.box(-8,1.1,-24,90,2.2,43,'ivory');
    b.box(-8,2.25,-24,89,.16,42,'stone');
    for(let i=0;i<8;i++)b.box(-9,.14*(i+1),1.5-i*.48,12,.28*(i+1),.5,'ivory');
    for(const s of [-1,1])b.beam([-9+s*6,.8,2],[-9+s*6,3,-3],.18,'ivory');
    for(let x=-51;x<=35;x+=2.4){
      if(x>-17&&x<-1)continue;
      b.cylinder(x,2.8,-3,.13,.17,1.1,'ivory',8);
      b.ball(x,3.4,-3,.24,.24,.24,'white');
    }
    for(const x of [-78,78])for(let z=-65;z<65;z+=9)b.box(x,.01,z,.15,.035,4,'white');
    for(const z of [-71,71])for(let x=-71;x<71;x+=9)b.box(x,.01,z,4,.035,.15,'white');
    for(const z of [-66.5,66.5])for(let x=-71;x<=71;x+=2)b.box(x,.05,z,1.95,.2,.6,Math.floor((x+71)/2)%2?'white':'flagRed');
  });
  for(const s of [-1,1])for(const z of [-43,-21,19,39,49])tree(b,s*52,z,z===49?1.2:.8,z===49?'natural':'topiary');
  for(const x of [-47,-29,26,42])tree(b,x,47,1,'natural');
  for(const x of [-43,-26,-8,13,35])tree(b,x,-48,.8,'topiary');
  for(const x of [-38,-27])for(const z of [14,32])tree(b,x,z,.65);
  // Thai flags and small bronze lamp posts.
  b.on('sculptures',()=>{
    for(const x of [-53,-35,-16,16,35,53]){
      b.cylinder(x,3.5,62,.045,.065,7,'goldDark',8);
      let yy=6.8;
      for(const [h,m] of [[.25,'flagRed'],[.25,'white'],[.5,'flagBlue'],[.25,'white'],[.25,'flagRed']]){
        b.box(x+.85,yy-h/2,62,1.7,h,.025,m);yy-=h;
      }
    }
    for(const x of [-18,19])for(const z of [8,31,48]){
      b.cylinder(x,2.1,z,.06,.1,4.2,'goldDark',8);
      b.ball(x,4.35,z,.28,.4,.28,'white');
      b.cylinder(x,4.8,z,0,.42,.4,'gold',8);
    }
  });
}
