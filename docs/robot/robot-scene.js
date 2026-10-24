import * as T from './vendor/three.module.js';
import {createCloud,animateCloud} from './ambient-cloud.js';
export function createRobot(environment){
 const scene=new T.Scene();scene.environment=environment;
 const camera=new T.PerspectiveCamera(37,1,.1,40);camera.position.set(0,.35,8.4);camera.lookAt(0,.1,0);
 const cloud=createCloud();scene.add(cloud.points);const root=new T.Group();scene.add(root);
 const black=new T.MeshPhysicalMaterial({color:0x151719,metalness:1,roughness:.19,clearcoat:1,clearcoatRoughness:.07,envMapIntensity:1.6});
 const silver=new T.MeshPhysicalMaterial({color:0x93979e,metalness:1,roughness:.23,clearcoat:1,envMapIntensity:1.2});
 const joint=new T.MeshStandardMaterial({color:0x08090a,metalness:.8,roughness:.34});
 const glass=new T.MeshPhysicalMaterial({color:0x020607,metalness:.75,roughness:.045,clearcoat:1,envMapIntensity:.7});
 const glow=new T.MeshStandardMaterial({color:0xb4e6dc,emissive:0x8ed9c7,emissiveIntensity:2.4,metalness:.5,roughness:.24});
 const dim=new T.MeshStandardMaterial({color:0x657977,emissive:0x71968e,emissiveIntensity:.3,metalness:.8,roughness:.3});
 const ball=new T.SphereGeometry(1,40,28);
 function ell(parent,mat,x,y,z,sx,sy,sz){const mesh=new T.Mesh(ball,mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh;}
 function cylinder(parent,mat,rt,rb,height,x,y,z){const mesh=new T.Mesh(new T.CylinderGeometry(rt,rb,height,36),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 function panel(parent,mat,w,h,d,x,y,z,rad=.12){const shape=new T.Shape(),a=-w/2,b=-h/2,r=Math.min(rad,w/2,h/2);shape.moveTo(a+r,b);shape.lineTo(a+w-r,b);shape.quadraticCurveTo(a+w,b,a+w,b+r);shape.lineTo(a+w,b+h-r);shape.quadraticCurveTo(a+w,b+h,a+w-r,b+h);shape.lineTo(a+r,b+h);shape.quadraticCurveTo(a,b+h,a,b+h-r);shape.lineTo(a,b+r);shape.quadraticCurveTo(a,b,a+r,b);const g=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,curveSegments:16});g.translate(0,0,-d/2);const mesh=new T.Mesh(g,mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 function torus(parent,mat,r,t,x,y,z,rotX=Math.PI/2){const mesh=new T.Mesh(new T.TorusGeometry(r,t,12,48),mat);mesh.position.set(x,y,z);mesh.rotation.x=rotX;parent.add(mesh);return mesh;}
 const torso=new T.Group();root.add(torso);
 ell(torso,black,0,.65,0,.79,.93,.43);
 const breast=panel(torso,black,1.06,.72,.10,0,.83,.385,.21);breast.rotation.x=-.08;
 // Brushed perimeter details and restrained luminous chest status.
 panel(torso,silver,.55,.038,.025,0,1.23,.36,.015);
 for(let i=0;i<3;i++)ell(torso,i===0?glow:dim,(i-1)*.085,.86,.465,.018,.018,.012);
 for(const side of [-1,1]){const p=panel(torso,silver,.055,.40,.03,side*.60,.44,.27,.02);p.rotation.z=-side*.17;}
 cylinder(torso,joint,.24,.22,.25,0,1.54,0);torus(torso,silver,.23,.035,0,1.48,0);
 const head=new T.Group();head.position.set(0,2.02,0);torso.add(head);
 ell(head,silver,0,0,0,.57,.71,.53);
 ell(head,black,0,.06,.135,.535,.63,.485);
 const visor=ell(head,glass,0,.075,.48,.455,.30,.14);
 // Eye pixels follow the face; eye blink scales the complete light assembly.
 const eyes=new T.Group();eyes.position.set(0,.07,.648);head.add(eyes);
 for(const side of [-1,1])for(let row=0;row<3;row++)for(let col=0;col<5;col++){const px=(col-2)*.029;ell(eyes,glow,side*.20+px,(row-1)*.033,0,.010,.010,.007);}
 panel(head,black,.29,.08,.04,0,-.42,.40,.035);
 for(const side of [-1,1]){const ear=cylinder(head,joint,.145,.145,.12,side*.55,0,0);ear.rotation.z=Math.PI/2;const cap=cylinder(head,silver,.105,.105,.135,side*.57,0,0);cap.rotation.z=Math.PI/2;}
 cylinder(root,joint,.39,.35,.32,0,-.38,0);
 for(let i=0;i<4;i++)torus(root,silver,.34-i*.006,.018,0,-.27-i*.075,0);
 ell(root,black,0,-.69,0,.55,.33,.35);
 const arms=[],rig=[];
 for(const side of [-1,1]){
  const shoulder=new T.Group();shoulder.position.set(side*.90,1.12,0);torso.add(shoulder);arms.push(shoulder);
  ell(shoulder,joint,0,0,0,.23,.23,.23);
  const cap=ell(shoulder,silver,side*.10,-.075,0,.28,.37,.29);cap.rotation.z=side*.35;
  const upper=new T.Group();upper.position.set(side*.12,-.22,0);upper.rotation.z=side*.19;shoulder.add(upper);
  ell(upper,black,0,-.35,0,.22,.44,.225);
  ell(upper,joint,0,-.74,0,.18,.18,.18);
  const elbowRing=torus(upper,silver,.18,.033,0,-.74,0,0);elbowRing.rotation.y=Math.PI/2;
  const forearm=new T.Group();forearm.position.set(0,-.74,0);forearm.rotation.x=-.65;upper.add(forearm);
  ell(forearm,black,0,-.34,.01,.235,.39,.25);
  panel(forearm,silver,.11,.35,.04,side*.10,-.33,.22,.035);
  cylinder(forearm,joint,.115,.115,.18,0,-.73,0);torus(forearm,silver,.13,.025,0,-.68,0);
  const palm=new T.Group();palm.position.set(0,-.91,0);forearm.add(palm);
  panel(palm,black,.33,.36,.19,0,0,0,.085);
  const fingers=[];
  for(let i=0;i<4;i++){const finger=new T.Group();finger.position.set((i-1.5)*.083,-.19,.025);palm.add(finger);finger.rotation.x=-.25;fingers.push(finger);
   cylinder(finger,silver,.033,.03,.15,0,-.06,0);ell(finger,joint,0,-.145,0,.037,.037,.037);const tip=ell(finger,black,0,-.218,.03,.033,.087,.038);tip.rotation.x=-.4;
  }
  const thumb=ell(palm,silver,-side*.21,-.04,.04,.068,.15,.065);thumb.rotation.z=-side*.55;
  rig.push({side,shoulder,upper,forearm,palm,fingers,thumb});
 }
 const legs=[];
 for(const side of [-1,1]){
  const hip=new T.Group();hip.position.set(side*.32,-.87,0);root.add(hip);legs.push(hip);
  ell(hip,joint,0,0,0,.22,.22,.22);ell(hip,black,0,-.44,0,.24,.48,.25);panel(hip,silver,.11,.47,.04,side*.13,-.42,.20,.04);
  ell(hip,joint,0,-.89,0,.18,.18,.18);ell(hip,silver,0,-.90,.12,.20,.20,.14);
  ell(hip,black,0,-1.37,0,.22,.43,.23);panel(hip,silver,.09,.45,.03,0,-1.38,.22,.025);
  ell(hip,joint,0,-1.79,0,.12,.12,.12);ell(hip,black,0,-1.94,.15,.24,.15,.43);
 }
 const key=new T.DirectionalLight(0xffffff,3.5);key.position.set(-3,5,5);scene.add(key);
 const rim=new T.DirectionalLight(0xced5ee,3);rim.position.set(4,2,-3);scene.add(rim);
 scene.add(new T.AmbientLight(0x949aa5,.7));
 return {scene,camera,root,torso,head,eyes,arms,legs,rig,isRobot:true,type:'robot',targetX:0,targetY:0,cloud,dragX:0,dragY:0};
}
export function updateRobot(model,time,pointer,rect,paused){
 const {camera,root,head,torso,arms,eyes}=model;
 camera.aspect=rect.width/rect.height;camera.position.z=Math.max(rect.width<600&&rect.width/rect.height>1.1?7.6:8.5,4.7/camera.aspect)*1.12;camera.updateProjectionMatrix();
 const px=Math.max(-1,Math.min(1,(pointer.x-(rect.left+rect.width/2))/(rect.width*.85))),py=Math.max(-1,Math.min(1,(pointer.y-(rect.top+rect.height*.28))/(rect.height*.7)));animateCloud(model.cloud,time,px,py);
 model.targetX+=(px*1.05-model.targetX)*.075;model.targetY+=(py*.60-model.targetY)*.075;
 head.rotation.y=model.targetX;head.rotation.x=model.targetY;root.rotation.x=model.dragY;
 root.rotation.y=model.dragX-.16+model.targetX*.35;
 arms[0].rotation.set(Math.sin(time*.65)*.06,0,-.18+Math.sin(time*.75)*.045);arms[1].rotation.set(Math.sin(time*.65+1)*.08,0,.18+Math.sin(time*.75+.7)*.045);
 if(!paused){root.position.y=Math.sin(time*.9)*.035;torso.rotation.z=Math.sin(time*.55)*.012;const blink=time%6.2;eyes.scale.y=blink<.16?.15:1;}
}

