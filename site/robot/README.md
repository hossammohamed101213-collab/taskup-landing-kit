# Hero robot

Source: the WEB2050 independent robot kit (`robot-scene.js`, `ambient-cloud.js`, Three.js r180 in `vendor/`, MIT licence in `vendor/THREE-LICENSE.txt`).

Changes made on top of the kit:

- `robot-scene.js`: exposes the arm joints as `model.rig`; arm idle motion is set with `rotation.set` (also while paused) so the reach code can blend over it; camera is pulled back ~12% and widened for narrow canvases so the feet are not cropped.
- `robot-reach.js` (new): when the pointer comes near, the arm on that side lifts and the hand chases the cursor (elbow from the law of cosines, shoulder aimed by closing the hand-to-target error). If the hand stays on the cursor the fingers close and the cursor becomes a glowing orb in the palm (`.is-held` hides the real cursor); it lets go when the pointer runs away.
- `hero-robot.js` (new): mounts the component in a host element (own canvas, studio environment, drag/keyboard controls, pause control, offscreen/hidden pause, `destroy()`).
- `robot-sleep.js` (new): after ~12 s without any pointer/key/scroll/touch activity (`data-sleep-after` on the host, in ms, overrides it) the robot lies down on its side, closes its eyes, breathes and gets a floor glow plus floating "Zzz"; the first activity makes it spring up, hop and wave. While asleep the host renders at ~14 fps, and rendering is skipped while the tab is hidden, the canvas is offscreen, or a dialog/portal is open.
