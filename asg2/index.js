/**
 * Assignment 2 - Blocky Rat
*/

import { initCubeBuffer, drawCube } from "./Cube.js";
import { initCylinderBuffer, drawCylinder } from "./Cylinder.js";

// ===================== SHADERS =====================
const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`;

// ===================== MINIMAL PROGRAM INIT =====================
function compileShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) || "Shader compile failed");
  }
  return s;
}
function initProgram(gl, vsSrc, fsSrc) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) || "Program link failed");
  }
  gl.useProgram(p);
  gl.program = p;
  return p;
}

// ===================== GLOBALS =====================
let canvas, gl;
let a_Position, u_ModelMatrix, u_GlobalRotateMatrix, u_FragColor;

let perfDiv;

// fps indicator
let g_lastFpsTime = performance.now();
let g_frameCount = 0;
let g_fps = 0;


// Global rotation (slider + mouse)
let gAnimalGlobalRotation = 0; // Y
let gMouseRotX = 0;
let gMouseRotY = 0;

// Joint sliders (leg chain)
let gAllThigh = 15;
let gAllCalf = -25;
let gAllFoot = 10;

// Extra controls
let gHeadYaw = 0;
let gTailSwing = 0;

// Animation
let gAnimationOn = true;
let g_startTime = performance.now() / 1000;
let g_seconds = 0;

function stopAnimation() {
  gAnimationOn = false;
}

// Poke animation
let gJumpY = 0;
let gPokeActive = false;
let gPokeStart = 0;

// ===================== MAIN =====================
main();
function main() {
  canvas = document.getElementById("webgl");
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  if (!gl) throw new Error("WebGL not supported");

  gl.viewport(0, 0, canvas.width, canvas.height);

  initProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");

  if (a_Position < 0 || !u_ModelMatrix || !u_GlobalRotateMatrix || !u_FragColor) {
    throw new Error("Failed to get GLSL locations");
  }

  // for your Cube.js drawCube that uses gl.program.a_Position
  gl.program.a_Position = a_Position;

  initCubeBuffer(gl, a_Position);
  initCylinderBuffer(gl, a_Position);

  gl.enable(gl.DEPTH_TEST);

  setupUI();
  setupMouse();

  renderScene();
  requestAnimationFrame(tick);
}

// ===================== UI =====================
function setupUI() {
  perfDiv = document.createElement("div");
  perfDiv.style.position = "fixed";
  perfDiv.style.left = "10px";
  perfDiv.style.bottom = "10px";
  perfDiv.style.padding = "8px 10px";
  perfDiv.style.background = "rgba(0,0,0,0.5)";
  perfDiv.style.color = "white";
  perfDiv.style.fontFamily = "monospace";
  perfDiv.style.fontSize = "12px";
  document.body.appendChild(perfDiv);

  const panel = document.createElement("div");
  panel.style.position = "absolute";
  panel.style.top = "20px";
  panel.style.left = "690px";
  panel.style.width = "360px";
  panel.style.padding = "12px";
  panel.style.background = "rgba(255,255,255,0.92)";
  panel.style.fontFamily = "system-ui, Arial";
  panel.style.borderRadius = "12px";
  panel.style.boxShadow = "0 6px 18px rgba(0,0,0,0.15)";
  panel.style.maxWidth = "360px";
  panel.innerHTML = `<div style="font-weight:700;margin-bottom:8px;">🐀 Blocky Rat Controls</div>`;
  document.body.appendChild(panel);

  const addSlider = (label, min, max, value, onInput) => {
    const row = document.createElement("div");
    row.style.margin = "8px 0";
    const id = "s_" + Math.random().toString(16).slice(2);
    row.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;">
        <span>${label}</span>
        <span id="${id}_val" style="font-variant-numeric:tabular-nums;">${value}</span>
      </div>
      <input id="${id}" type="range" min="${min}" max="${max}" value="${value}" step="1" style="width:100%;" />
    `;
    panel.appendChild(row);

    const slider = row.querySelector(`#${id}`);
    const val = row.querySelector(`#${id}_val`);
    slider.addEventListener("input", (e) => {
      const v = Number(e.target.value);
      val.textContent = v;
      onInput(v);

      stopAnimation();

      renderScene();
    });
  };

  addSlider("Global rotate (Y)", -180, 180, gAnimalGlobalRotation, (v) => (gAnimalGlobalRotation = v));
  addSlider("Thighs (1st joint)", -90, 90, gAllThigh, (v) => (gAllThigh = v));
  addSlider("Calves (2nd joint)", -120, 30, gAllCalf, (v) => (gAllCalf = v));
  addSlider("Feet (3rd joint)", -60, 60, gAllFoot, (v) => (gAllFoot = v));
  addSlider("Head yaw", -45, 45, gHeadYaw, (v) => (gHeadYaw = v));
  addSlider("Tail swing", -80, 80, gTailSwing, (v) => (gTailSwing = v));

  const btnRow = document.createElement("div");
  btnRow.style.display = "flex";
  btnRow.style.gap = "8px";
  btnRow.style.marginTop = "10px";
  panel.appendChild(btnRow);

  const onBtn = document.createElement("button");
  onBtn.textContent = "Animation ON";
  onBtn.style.flex = "1";

  onBtn.onclick = () => {
    gAnimationOn = true;
    g_startTime = performance.now() / 1000;
  };
  btnRow.appendChild(onBtn);

  const offBtn = document.createElement("button");
  offBtn.textContent = "Animation OFF";
  offBtn.style.flex = "1";
  offBtn.onclick = () => (gAnimationOn = false);
  btnRow.appendChild(offBtn);

  const hint = document.createElement("div");
  hint.style.marginTop = "10px";
  hint.style.fontSize = "12px";
  hint.style.opacity = "0.8";
  hint.innerHTML = `
    <div><b>Mouse drag</b>: rotate view</div>
    <div><b>Shift + click</b>: poke animation</div>
  `;
  panel.appendChild(hint);
}

// ===================== MOUSE =====================
function setupMouse() {
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener("mousedown", (e) => {
    if (e.shiftKey) {
      gPokeActive = true;
      gPokeStart = g_seconds;
      return;
    }
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener("mouseup", () => (dragging = false));

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    gMouseRotY += dx * 0.5;
    gMouseRotX += dy * 0.5;
    gMouseRotX = Math.max(-89, Math.min(89, gMouseRotX));
    renderScene();
  });
}

// ===================== ANIMATION =====================
/*function tick() {
  const now = performance.now() / 1000;
  g_seconds = now - g_startTime;

  if (gAnimationOn) updateAnimationAngles();

  renderScene();

  // FPS calc
  g_frameCount++;
  const nowMs = performance.now();
  if (nowMs - g_lastFpsTime >= 500) {          // update twice per second
    g_fps = (g_frameCount * 1000) / (nowMs - g_lastFpsTime);
    g_frameCount = 0;
    g_lastFpsTime = nowMs;
  }

  perfDiv.textContent =
    `fps=${g_fps.toFixed(1)} | anim=${gAnimationOn ? "on" : "off"} | t=${g_seconds.toFixed(2)}s`;

  requestAnimationFrame(tick);
}*/

function tick() {
  const now = performance.now() / 1000;
  g_seconds = now - g_startTime;

  // Always allow poke to animate, even if normal animation is off
  if (gAnimationOn || gPokeActive) updateAnimationAngles();

  renderScene();

  // FPS calc
  g_frameCount++;
  const nowMs = performance.now();
  if (nowMs - g_lastFpsTime >= 500) { // update twice per second
    g_fps = (g_frameCount * 1000) / (nowMs - g_lastFpsTime);
    g_frameCount = 0;
    g_lastFpsTime = nowMs;
  }

  perfDiv.textContent =
    `fps=${g_fps.toFixed(1)} | anim=${gAnimationOn ? "on" : "off"} | t=${g_seconds.toFixed(2)}s`;

  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  const s = Math.sin(g_seconds * 5.5);

  // leg
  gAllThigh = 8 + 22 * s;
  gAllCalf = -18 + 40 * Math.max(0, -s);
  gAllFoot = 6 + 14 * Math.sin(g_seconds * 5.5 + Math.PI / 4);

  // head + tail
  gHeadYaw = 10 * Math.sin(g_seconds * 2.2);
  gTailSwing = 35 * Math.sin(g_seconds * 7.0 + 0.7);

  // poke
  // poke
  if (gPokeActive) {
    const t = g_seconds - gPokeStart;

    if (t < 1.0) {
      // --- tail / pose ---
      gTailSwing = 85 * Math.sin(g_seconds * 22.0);
      gAllThigh = 55;
      gAllCalf = -95;
      gAllFoot = 25;
      gHeadYaw = -25;

      // --- JUMP (quick up, then down) ---
      // t in [0,1]. This makes a single hop.
      const jumpHeight = 0.25; // increase for bigger jump
      gJumpY = jumpHeight * Math.sin(Math.PI * t); // 0 -> up -> 0

    } else {
      gPokeActive = false;
      gJumpY = 0; // reset after poke
    }
  }
}

// Render

function renderScene() {
  //gl.clearColor(0.85, 0.92, 1.0, 1.0);
  gl.clearColor(0.98, 0.9, 0.92, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Global transform
  const globalRot = new Matrix4();
  globalRot.setIdentity();

  // JUMP first (before scaling so it actually moves)
  globalRot.translate(0, gJumpY, 0);

  // keep rat small
  globalRot.scale(0.25, 0.25, 0.25);

  globalRot.rotate(gMouseRotX, 1, 0, 0);
  globalRot.rotate(gAnimalGlobalRotation + gMouseRotY, 0, 1, 0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRot.elements);

  // colors
  const RAT   = [0.75, 0.75, 0.75, 1.0];
  const DARK  = [0.55, 0.55, 0.55, 1.0];
  const PINK  = [0.90, 0.70, 0.78, 1.0];
  const BLACK = [0.08, 0.08, 0.10, 1.0];

  // ================= ONE BODY =================
  const bodyLen = 0.85;
  const bodyH   = 0.42;
  const bodyW   = 0.45;

  const bodyX = -0.05;
  const bodyY = 0.10;

  const body = new Matrix4();
  body.setIdentity();
  body.translate(bodyX, bodyY, 0);
  body.scale(bodyLen, bodyH, bodyW);
  drawCube(gl, u_ModelMatrix, u_FragColor, body, RAT);

  // ================= HEAD =================
  const headLen = 0.28;
  const headH   = 0.28;
  const headW   = 0.28;

  const headX = bodyX + bodyLen * 0.5 + headLen * 0.45;

  const head = new Matrix4();
  head.setIdentity();
  head.translate(headX, bodyY + 0.03, 0);
  head.rotate(gHeadYaw, 0, 1, 0);
  head.scale(headLen, headH, headW);
  drawCube(gl, u_ModelMatrix, u_FragColor, head, RAT);

  // snout
  /*const snout = new Matrix4();
  snout.setIdentity();

  snout.translate(headX + headLen * 0.55 + 0.07, bodyY + 0.01, 0);

  snout.scale(0.10, 0.07, 0.10);
  drawCube(gl, u_ModelMatrix, u_FragColor, snout, PINK);*/

  // snout (non-cube primitive: cylinder)
const snout = new Matrix4();
snout.setIdentity();

// same position as before
snout.translate(headX + headLen * 0.55 + 0.07, bodyY + 0.01, 0);

// rotate so cylinder points forward (along X in your scene)
snout.rotate(90, 0, 0, 1);

// scale: radius, length, radius
snout.scale(0.05, 0.14, 0.05);

// draw cylinder instead of cube
drawCylinder(gl, u_ModelMatrix, u_FragColor, snout, PINK);


  // whiskers
const whiskerLen = 0.14;
const whiskerThk = 0.008;
const whiskerZ   = 0.16; // <-- pushes whiskers outward (KEY CHANGE)

for (let side of [1, -1]) {

  // upper whisker
  const w1 = new Matrix4();
  w1.setIdentity();
  w1.translate(
    headX + headLen * 0.62,  // just in front of face
    bodyY + 0.035,           // slightly above nose
    side * whiskerZ          // push OUT to the sides
  );
  w1.rotate(side * 35, 0, 1, 0); // strong outward angle
  w1.scale(whiskerLen, whiskerThk, whiskerThk);
  drawCube(gl, u_ModelMatrix, u_FragColor, w1, BLACK);

  // lower whisker
  const w2 = new Matrix4();
  w2.setIdentity();
  w2.translate(
    headX + headLen * 0.62,
    bodyY - 0.005,
    side * whiskerZ
  );
  w2.rotate(side * 45, 0, 1, 0); // even more outward
  w2.scale(whiskerLen * 0.9, whiskerThk, whiskerThk);
  drawCube(gl, u_ModelMatrix, u_FragColor, w2, BLACK);
}


  // eyes
for (let side of [1, -1]) {
  const eye = new Matrix4();
  eye.setIdentity();
  eye.translate(
    headX + headLen * 0.5 + 0.001, // ← tiny forward offset
    bodyY + 0.08,
    side * 0.07
  );
  eye.scale(0.03, 0.03, 0.03);
  drawCube(gl, u_ModelMatrix, u_FragColor, eye, BLACK);
}

    // ears
    for (let side of [1, -1]) {
      const ear = new Matrix4();
      ear.setIdentity();
      ear.translate(headX - 0.08, bodyY + 0.18, side * 0.09);
      ear.scale(0.07, 0.09, 0.05);
      drawCube(gl, u_ModelMatrix, u_FragColor, ear, PINK);
    }

  // ================= LEGS =================
  const legAttachY = bodyY - bodyH * 0.5;
  const shoulderX = bodyX + bodyLen * 0.28;
  const hipX      = bodyX - bodyLen * 0.10;
  const legZ      = bodyW * 0.40;

  drawLegChain({ baseX: shoulderX, baseY: legAttachY, baseZ:  legZ,
    thighAngle: gAllThigh, calfAngle: gAllCalf, footAngle: gAllFoot, color: DARK });

  drawLegChain({ baseX: shoulderX, baseY: legAttachY, baseZ: -legZ,
    thighAngle: -gAllThigh * 0.9, calfAngle: gAllCalf * 0.7, footAngle: -gAllFoot * 0.6, color: DARK });

  drawLegChain({ baseX: hipX, baseY: legAttachY, baseZ:  legZ,
    thighAngle: -gAllThigh * 0.8, calfAngle: gAllCalf * 0.65, footAngle: gAllFoot * 0.5, color: DARK });

  drawLegChain({ baseX: hipX, baseY: legAttachY, baseZ: -legZ,
    thighAngle:  gAllThigh * 0.8, calfAngle: gAllCalf * 0.65, footAngle: -gAllFoot * 0.5, color: DARK });

  // ================= TAIL =================
  /*const tailRootX = bodyX - bodyLen * 0.5 - 0.06;

  const tail = new Matrix4();
  tail.setIdentity();
  tail.translate(tailRootX, bodyY + 0.02, 0);
  tail.rotate(gTailSwing, 0, 1, 0);
  tail.scale(1.5, 0.04, 0.04);
  drawCube(gl, u_ModelMatrix, u_FragColor, tail, PINK);
}*/

    // ================= CURVED TAIL (3 segments) =================
  const tailLen1 = 0.35;
  const tailLen2 = 0.28;
  const tailLen3 = 0.22;
  const tailThk  = 0.03;

  // attach point (back face of body)
  const tailBaseX = bodyX - bodyLen * 0.5 - 0.01;

  const tailBase = new Matrix4();
  tailBase.setIdentity();
  tailBase.translate(tailBaseX, bodyY - bodyH * 0.10, 0);
  tailBase.rotate(gTailSwing, 0, 1, 0); // wag left/right

  // ---------- Segment 1 ----------
  const t1 = new Matrix4(tailBase);
  t1.translate(-tailLen1 * 0.5, 0, 0);
  t1.scale(tailLen1, tailThk, tailThk);
  drawCube(gl, u_ModelMatrix, u_FragColor, t1, PINK);

  // frame at end of segment 1
  const t1End = new Matrix4(tailBase);
  t1End.translate(-tailLen1, 0, 0);
  t1End.rotate(15, 0, 0, 1); // slight upward curve

  // ---------- Segment 2 ----------
  const t2 = new Matrix4(t1End);
  t2.translate(-tailLen2 * 0.5, 0, 0);
  t2.scale(tailLen2, tailThk * 0.9, tailThk * 0.9);
  drawCube(gl, u_ModelMatrix, u_FragColor, t2, PINK);

  // frame at end of segment 2
  const t2End = new Matrix4(t1End);
  t2End.translate(-tailLen2, 0, 0);
  t2End.rotate(20, 0, 0, 1);

  // ---------- Segment 3 ----------
  const t3 = new Matrix4(t2End);
  t3.translate(-tailLen3 * 0.5, 0, 0);
  t3.scale(tailLen3, tailThk * 0.8, tailThk * 0.8);
  drawCube(gl, u_ModelMatrix, u_FragColor, t3, PINK);
}

// ===================== HIERARCHICAL LEG (3 JOINTS) =====================
function drawLegChain({
  baseX,
  baseY,
  baseZ,
  thighAngle,
  calfAngle,
  footAngle,
  color,
  thighLen = 0.075,
  calfLen = 0.070,
  footScale = [0.12, 0.04, 0.14],
}) {
  // Hip frame
  const hip = new Matrix4();
  hip.setIdentity();
  hip.translate(baseX, baseY, baseZ);

  // Thigh
  const thighFrame = new Matrix4(hip);
  thighFrame.rotate(thighAngle, 0, 0, 1);

  const thigh = new Matrix4(thighFrame);
  thigh.translate(0, -thighLen * 0.5, 0);
  thigh.scale(0.10, thighLen, 0.10);
  drawCube(gl, u_ModelMatrix, u_FragColor, thigh, color);

  // Knee frame
  const knee = new Matrix4(thighFrame);
  knee.translate(0, -thighLen, 0);

  // Calf
  const calfFrame = new Matrix4(knee);
  calfFrame.rotate(calfAngle, 0, 0, 1);

  const calf = new Matrix4(calfFrame);
  calf.translate(0, -calfLen * 0.5, 0);
  calf.scale(0.095, calfLen, 0.095);
  drawCube(gl, u_ModelMatrix, u_FragColor, calf, color);

  // Ankle frame
  const ankle = new Matrix4(calfFrame);
  ankle.translate(0, -calfLen, 0);

  // Foot (3rd joint)
  const footFrame = new Matrix4(ankle);
  footFrame.rotate(footAngle, 0, 0, 1);

  const foot = new Matrix4(footFrame);
  foot.translate(0.06, -0.02, 0);
  foot.scale(footScale[0], footScale[1], footScale[2]);
  drawCube(gl, u_ModelMatrix, u_FragColor, foot, color);
}
