import * as T from './vendor/three.module.js';
export function createCloud(){
 const n=innerWidth<720?1800:3200,positions=new Float32Array(n*3),galaxy=new Float32Array(n*3),brain=new Float32Array(n*3),seeds=new Float32Array(n),colors=new Float32Array(n*3);
 const rnd=i=>{const x=Math.sin(i*127.1+73.7)*43758.5453;return x-Math.floor(x);};
 for(let i=0;i<n;i++){
  const a=rnd(i*7)*Math.PI*2,z=rnd(i*7+1)*2-1,r=Math.sqrt(1-z*z),volume=.65+Math.pow(rnd(i*7+2),.3)*.35;
  positions.set([Math.cos(a)*r*2*volume,z*2*volume,Math.sin(a)*r*2*volume],i*3);
  const gr=Math.sqrt(rnd(i*7+3))*3.3,angle=(i%5)/5*Math.PI*2+gr*1.7+(rnd(i*7+4)-.5)*.32;
  galaxy.set([Math.cos(angle)*gr,Math.sin(angle)*gr*.63,(rnd(i*7+5)-.5)*.25],i*3);
  const side=i%2?1:-1,u=rnd(i*11)*Math.PI*2,v=Math.acos(2*rnd(i*11+1)-1),fold=1+.055*Math.sin(u*17+v*9)*Math.sin(v*23);
  let bx=side*(.48+Math.abs(Math.sin(v)*Math.cos(u))*.78)*fold,by=Math.cos(v)*1.2*fold,bz=Math.sin(v)*Math.sin(u)*.85*fold;
  if(i%22===0){bx=side*.13;by=-1.15-rnd(i*11+2)*.65;bz=-.18;}
  brain.set([bx*1.6,by*1.5,bz*1.5],i*3);seeds[i]=rnd(i*13)*6.28;
  new T.Color(i%3?0x9ce8c7:0xb899e7).toArray(colors,i*3);
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('aGalaxy',new T.BufferAttribute(galaxy,3));geometry.setAttribute('aBrain',new T.BufferAttribute(brain,3));geometry.setAttribute('aSeed',new T.BufferAttribute(seeds,1));geometry.setAttribute('color',new T.BufferAttribute(colors,3));
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,vertexColors:true,uniforms:{uTime:{value:0},uPointer:{value:new T.Vector2()},uRatio:{value:Math.min(devicePixelRatio,1.3)}},vertexShader:`attribute vec3 aGalaxy;attribute vec3 aBrain;attribute float aSeed;uniform float uTime;uniform vec2 uPointer;uniform float uRatio;varying vec3 vColor;varying float vAlpha;
 void main(){float phase=mod(uTime,21.);float g=smoothstep(4.,7.,phase)*(1.-smoothstep(11.,14.,phase));float b=smoothstep(11.,14.,phase)*(1.-smoothstep(18.,21.,phase));vec3 p=mix(mix(position,aGalaxy,g),aBrain,b);float breathe=1.+sin(uTime*1.4)*.065;p*=breathe;float angle=uTime*.09*(1.-b*.8);mat2 rot=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));p.xy=rot*p.xy;p.xy+=uPointer*(.32+.15*sin(aSeed+uTime));p.z+=sin(uTime*.7+aSeed)*.09;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(4.1+sin(aSeed)*1.5)*uRatio*(12./max(4.,-mv.z));vColor=color;vAlpha=.55+.25*sin(aSeed+uTime*.6);}`,fragmentShader:`varying vec3 vColor;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);float a=exp(-d*d*19.)*vAlpha;gl_FragColor=vec4(vColor,a);}`});
 const points=new T.Points(geometry,material);points.position.set(0,.4,-1.8);points.scale.setScalar(1.18);points.frustumCulled=false;const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=128;const ctx=haloCanvas.getContext('2d');const gradient=ctx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'rgba(155,228,197,.18)');gradient.addColorStop(.45,'rgba(165,124,220,.08)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);const halo=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(haloCanvas),transparent:true,depthWrite:false,blending:T.AdditiveBlending}));halo.scale.set(6.2,6.2,1);halo.position.z=-.5;points.add(halo);return {points,material};
}
export function animateCloud(cloud,time,x,y){cloud.material.uniforms.uTime.value=time;const p=cloud.material.uniforms.uPointer.value;p.x+=(x-p.x)*.045;p.y+=(-y-p.y)*.045;cloud.points.rotation.y=x*.15;cloud.points.rotation.x=y*.12;}

