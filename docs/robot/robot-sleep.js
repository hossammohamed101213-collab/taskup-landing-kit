import * as T from './vendor/three.module.js';

/*
 Idle behaviour layered on the robot: when the visitor stops interacting it lies down on its side, closes its eyes and breathes
 slowly; on the first activity it springs up, hops a few times and waves. All of it is a handful of transforms on existing
 groups, so it costs nothing extra to render; the host also drops the frame rate while the robot sleeps.
*/

const ease = t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function createSleep(model) {
  const pivot = new T.Group();
  model.scene.add(pivot);
  pivot.add(model.root);
  const eyeMat = model.eyes.children[0].material;
  return { pivot, eyeMat, base: eyeMat.emissiveIntensity, amt: 0, wakeT: 99, v: new T.Vector3() };
}

/* returns { e: how asleep (0..1), busy: still moving a lot } */
export function updateSleep(S, model, dt, time, wantSleep) {
  const prev = S.amt;
  S.amt = wantSleep ? Math.min(1, S.amt + dt * .55) : Math.max(0, S.amt - dt * 2.2);
  if (wantSleep) S.wakeT = 99;
  else if (prev > .4 && S.wakeT >= 99) S.wakeT = 0;
  if (S.wakeT < 50) { S.wakeT += dt; if (S.wakeT > 3.2) S.wakeT = 99; }

  const e = ease(S.amt), w = S.wakeT < 50 ? S.wakeT : 99;
  const hop = w < 3 ? Math.max(0, Math.sin(w * 8.2)) * Math.exp(-w * 1.5) * .9 : 0;
  const { pivot, eyeMat } = S;
  pivot.rotation.set(0, -.3 * e, e * Math.PI / 2 * .97);
  pivot.position.y = -1.15 * e + hop;
  pivot.scale.setScalar(1 - .18 * e);

  const { torso, head, eyes, arms, legs } = model;
  torso.scale.y = 1 + Math.sin(time * 1.7) * .018 * e;
  head.rotation.x += e * .35;
  head.rotation.z = e * .12;
  eyes.scale.y = Math.min(eyes.scale.y, 1 - .92 * e);
  eyeMat.emissiveIntensity = S.base * (1 - .8 * e) + (w < 3 ? S.base * 1.4 * Math.exp(-w * 4) : 0);
  legs[0].rotation.x = -e * .5;
  legs[1].rotation.x = -e * .3;
  if (w < 3) {
    const k = Math.exp(-w * 1.3) * (.65 + .35 * Math.sin(w * 14));
    arms[0].rotation.z -= 1.3 * k;
    arms[1].rotation.z += 1.3 * k;
  }
  return { e, busy: w < 1.2 };
}

/* head position in canvas pixels, for the floating "Zzz" */
export function headPixels(S, model, width, height) {
  model.head.getWorldPosition(S.v).project(model.camera);
  return [(S.v.x * .5 + .5) * width, (-S.v.y * .5 + .5) * height];
}
