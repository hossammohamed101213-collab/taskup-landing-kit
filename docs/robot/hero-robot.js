import * as T from './vendor/three.module.js';
import { createRobot, updateRobot } from './robot-scene.js';
import { createReach, updateReach, releaseReach, disposeReach } from './robot-reach.js';
import { createSleep, updateSleep, headPixels } from './robot-sleep.js';

export function mountRobot(host) {
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let renderer;
  try {
    const canvas = document.createElement('canvas');
    canvas.tabIndex = 0;
    canvas.className = 'robot-canvas';
    canvas.setAttribute('aria-label', (window.taskupI18n && window.taskupI18n('robot.aria')) || 'Interactive 3D robot. Drag to rotate. Arrow keys turn. Home resets.');
    canvas.setAttribute('data-i18n-aria', 'robot.aria');
    host.prepend(canvas);
    renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (err) {
    host.classList.add('no-webgl');
    host.querySelector('canvas')?.remove();
    return () => {};
  }
  const canvas = renderer.domElement;
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1 : 1.3));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const studio = new T.Scene();
  studio.background = new T.Color(0x191b25);
  const softbox = (w, h, x, y, z, color, strength, rx = 0, ry = 0) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color, side: T.DoubleSide }));
    m.material.color.multiplyScalar(strength);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    studio.add(m);
  };
  softbox(4, 6, -5, 2, 1, 0xffffff, 5, 0, Math.PI / 2);
  softbox(3, 7, 5, 1, 2, 0xaebce7, 4, 0, -Math.PI / 2);
  softbox(8, 3, 0, 5, 0, 0xffffff, 4, Math.PI / 2);
  softbox(3, 5, 1, 1, 6, 0xc5c7e3, 2.3, 0, Math.PI);
  softbox(5, 2, 0, -4, 0, 0x9381c1, 2, -Math.PI / 2);
  const pmrem = new T.PMREMGenerator(renderer);
  const env = pmrem.fromScene(studio, .06);
  pmrem.dispose();
  studio.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });

  const model = createRobot(env.texture);
  const reach = createReach(model, held => host.classList.toggle('is-held', held));
  const sleep = createSleep(model);
  const sleepAfter = Number(host.dataset.sleepAfter) || 12000;
  let lastActive = performance.now(), asleep = false, lastZ = 0;
  const pause = host.querySelector('[data-robot-pause]');
  const pointer = { x: 0, y: 0, type: 'mouse', set: false };
  let paused = reduce, drag = null, visible = true, raf = 0, last = 0, time = 0, dead = false;

  const size = () => {
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
  };
  size();
  const ro = new ResizeObserver(size);
  ro.observe(host);
  const io = new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { threshold: 0 });
  io.observe(host);

  const poke = () => { lastActive = performance.now(); };
  const onMove = e => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.type = e.pointerType || 'mouse'; pointer.set = true; lastActive = performance.now(); };
  const onLeave = () => { pointer.set = false; };
  addEventListener('pointermove', onMove, { passive: true });
  ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(n => addEventListener(n, poke, { passive: true, capture: true }));
  document.documentElement.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; releaseReach(reach, 1.5); canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    model.dragX += (e.clientX - drag.x) * .012;
    model.dragY = Math.max(-.65, Math.min(.65, model.dragY + (e.clientY - drag.y) * .006));
    drag = { x: e.clientX, y: e.clientY };
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) return;
    e.preventDefault();
    model.dragX += e.key === 'ArrowLeft' ? -.18 : e.key === 'ArrowRight' ? .18 : 0;
    model.dragY = Math.max(-.65, Math.min(.65, model.dragY + (e.key === 'ArrowUp' ? -.1 : e.key === 'ArrowDown' ? .1 : 0)));
    if (e.key === 'Home') model.dragX = model.dragY = 0;
  });
  const syncPause = () => pause?.setAttribute('aria-pressed', String(paused));
  pause?.addEventListener('click', () => { paused = !paused; syncPause(); });
  syncPause();

  const frame = now => {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    if (document.hidden || !visible || document.documentElement.classList.contains('modal-open')) return;
    if (now - last < (asleep ? 70 : 33)) return;
    const dt = Math.min((now - last) / 1000, .1);
    last = now;
    const wantSleep = !paused && sleepAfter > 0 && performance.now() - lastActive > sleepAfter;
    if (!paused) time += dt * (1 - .75 * sleep.amt);
    const rect = canvas.getBoundingClientRect();
    if (!pointer.set || sleep.amt > .02) { pointer.x = rect.left + rect.width / 2; pointer.y = rect.top + rect.height * .28; }
    updateRobot(model, time, pointer, rect, paused);
    const st = updateSleep(sleep, model, dt, time, wantSleep);
    asleep = wantSleep && st.e > .98;
    if (host.classList.contains('is-sleeping') !== (st.e > .85)) host.classList.toggle('is-sleeping', st.e > .85);
    if (st.e > .85 && now - lastZ > 200) {
      lastZ = now;
      const [zx, zy] = headPixels(sleep, model, rect.width, rect.height);
      host.style.setProperty('--zx', zx.toFixed(0) + 'px');
      host.style.setProperty('--zy', zy.toFixed(0) + 'px');
    }
    updateReach(reach, model, rect, pointer, dt, pointer.set && pointer.type !== 'touch' && !drag && st.e < .05 && !st.busy);
    renderer.render(model.scene, model.camera);
  };
  raf = requestAnimationFrame(frame);
  host.classList.add('is-live');

  return function destroy() {
    dead = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    removeEventListener('pointermove', onMove);
    ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(n => removeEventListener(n, poke, { capture: true }));
    document.documentElement.removeEventListener('pointerleave', onLeave);
    disposeReach(reach);
    model.scene.traverse(o => {
      o.geometry?.dispose();
      const m = o.material;
      (Array.isArray(m) ? m : m ? [m] : []).forEach(x => { x.map?.dispose(); x.dispose(); });
    });
    env.dispose();
    renderer.dispose();
    canvas.remove();
  };
}
