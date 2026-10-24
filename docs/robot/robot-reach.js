import * as T from './vendor/three.module.js';

/*
 Reach & grab behaviour layered on the WEB2050 robot.
 When the pointer comes near the robot, the arm on that side lifts and the hand chases the cursor
 (elbow solved with the law of cosines, shoulder aimed by closing the error between hand and target).
 If the hand stays on the cursor for a moment, the fingers close and the cursor becomes a glowing orb in the palm.
*/

const REACH = 2.05, UPPER = .96, FORE = 1.2, PLANE_Z = 1.15;
const SPLAY_BASE = .19, ELBOW_BASE = -.65, FINGER_BASE = -.25;
const S = new T.Vector3(), P = new T.Vector3(), G = new T.Vector3(), D = new T.Vector3(), A = new T.Vector3(), B = new T.Vector3();
const qd = new T.Quaternion(), qid = new T.Quaternion(), qp = new T.Quaternion(), qw = new T.Quaternion();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function createReach(model, onHold) {
  const arms = model.rig.map(a => {
    const tip = new T.Object3D();
    tip.position.set(0, -.3, .06);
    a.palm.add(tip);
    const orb = new T.Group();
    const core = new T.Mesh(new T.SphereGeometry(1, 24, 16), new T.MeshBasicMaterial({ color: new T.Color(0xbdfbe6).multiplyScalar(2.2) }));
    const halo = new T.Mesh(new T.SphereGeometry(1, 20, 12), new T.MeshBasicMaterial({ color: 0x86e3b5, transparent: true, opacity: .28, depthWrite: false, blending: T.AdditiveBlending }));
    halo.scale.setScalar(2.1);
    orb.add(core, halo);
    orb.scale.setScalar(.001);
    orb.visible = false;
    tip.add(orb);
    return { ...a, tip, orb, w: 0, on: false, aim: new T.Quaternion(), idle: new T.Quaternion(), bend: .65, curl: 0, orbS: 0 };
  });
  return { arms, held: false, closeT: 0, cool: 0, active: -1, onHold, geometries: arms.flatMap(a => [a.orb.children[0].geometry, a.orb.children[1].geometry]) };
}

export function disposeReach(R) {
  R.arms.forEach(a => a.orb.children.forEach(m => { m.geometry.dispose(); m.material.dispose(); }));
}

export function updateReach(R, model, rect, pointer, dt, enabled) {
  const cam = model.camera;
  cam.updateMatrixWorld();
  model.scene.updateMatrixWorld(true);

  const inside = enabled && pointer.x > rect.left - rect.width * .08 && pointer.x < rect.right + rect.width * .08 &&
    pointer.y > rect.top - rect.height * .04 && pointer.y < rect.bottom + rect.height * .04;

  let want = -1;
  if (inside) {
    const dx = pointer.x - (rect.left + rect.width / 2), prefer = dx >= 0 ? 1 : 0;
    want = R.active < 0 || (prefer !== R.active && Math.abs(dx) > rect.width * .05) ? prefer : R.active;
  }
  R.active = want;

  // pointer ray -> plane in front of the chest
  A.set(((pointer.x - rect.left) / rect.width) * 2 - 1, -(((pointer.y - rect.top) / rect.height) * 2 - 1), .5).unproject(cam).sub(cam.position).normalize();
  G.copy(cam.position).addScaledVector(A, (PLANE_Z - cam.position.z) / A.z);

  let sd = 9;
  R.arms.forEach((a, i) => {
    const goal = i === want ? 1 : 0;
    a.w += (goal - a.w) * (1 - Math.exp(-dt * (goal ? 7 : 4)));
    if (goal === 0 && a.w < .004) {
      if (a.on) { a.on = false; a.w = 0; restore(a); }
      return;
    }
    if (!a.on) { a.on = true; a.aim.copy(a.shoulder.quaternion); }
    a.idle.copy(a.shoulder.quaternion);

    a.shoulder.getWorldPosition(S);
    D.copy(G).sub(S);
    const d = Math.min(D.length(), REACH);
    D.setLength(d);

    const cosE = clamp((UPPER * UPPER + FORE * FORE - d * d) / (2 * UPPER * FORE), -1, 1);
    const bendT = clamp(Math.PI - Math.acos(cosE), .12, 1.9);
    a.bend += (bendT - a.bend) * (1 - Math.exp(-dt * 9));
    a.forearm.rotation.x = ELBOW_BASE + (-a.bend - ELBOW_BASE) * a.w;
    a.upper.rotation.z = a.side * SPLAY_BASE * (1 - a.w * .9);

    a.shoulder.quaternion.copy(a.idle).slerp(a.aim, a.w);
    a.shoulder.updateMatrixWorld(true);
    a.tip.getWorldPosition(P);
    A.copy(P).sub(S);
    if (A.lengthSq() > 1e-6) {
      qd.setFromUnitVectors(A.normalize(), B.copy(D).normalize());
      qid.identity().slerp(qd, .45);
      a.shoulder.parent.getWorldQuaternion(qp);
      a.shoulder.getWorldQuaternion(qw).premultiply(qid);
      a.aim.copy(qw).premultiply(qp.invert());
    }
    a.shoulder.quaternion.copy(a.idle).slerp(a.aim, a.w);

    if (i === want) {
      a.shoulder.updateMatrixWorld(true);
      a.tip.getWorldPosition(P).project(cam);
      const sx = rect.left + (P.x * .5 + .5) * rect.width, sy = rect.top + (-P.y * .5 + .5) * rect.height;
      sd = Math.hypot(pointer.x - sx, pointer.y - sy) / rect.height;
    }
  });

  // grab state machine
  const act = want >= 0 ? R.arms[want] : null;
  if (R.held) {
    if (!inside || sd > .22 || R.forceRelease) release(R, 1);
  } else {
    R.cool = Math.max(0, R.cool - dt);
    if (act && act.w > .9 && sd < .075 && !R.cool) {
      R.closeT += dt;
      if (R.closeT > .3) { R.held = true; R.closeT = 0; R.onHold?.(true); }
    } else R.closeT = 0;
  }
  R.forceRelease = false;

  R.arms.forEach((a, i) => {
    const curlT = R.held && i === want ? 1 : (i === want && sd < .2 ? .75 * (1 - sd / .2) : -.25);
    a.curl += (curlT - a.curl) * (1 - Math.exp(-dt * 10));
    a.fingers.forEach(f => { f.rotation.x = FINGER_BASE - 1.2 * a.curl; });
    const orbT = R.held && i === want ? .075 : 0;
    a.orbS += (orbT - a.orbS) * (1 - Math.exp(-dt * 12));
    a.orb.visible = a.orbS > .004;
    a.orb.scale.setScalar(Math.max(.001, a.orbS * (1 + Math.sin(performance.now() * .008) * .08)));
    if (a.orb.visible) a.orb.position.set(0, -.04, .1);
  });
  return R.held;
}

export function releaseReach(R, cooldown = 1) { release(R, cooldown); }

function release(R, cool) {
  if (!R.held) return;
  R.held = false; R.cool = cool; R.closeT = 0;
  R.onHold?.(false);
}

function restore(a) {
  a.forearm.rotation.x = ELBOW_BASE;
  a.upper.rotation.z = a.side * SPLAY_BASE;
  a.bend = -ELBOW_BASE;
}
