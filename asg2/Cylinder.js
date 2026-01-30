// Cylinder.js 

let g_cylVertexBuffer = null;
let g_numCylVerts = 0;
let g_aPositionLoc = -1;

export function initCylinderBuffer(gl, a_Position, segments = 24) {
  g_aPositionLoc = a_Position;

  const verts = [];
  const r = 0.5;
  const z0 = -0.5;
  const z1 = 0.5;

  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;

    const x0 = r * Math.cos(a0), y0 = r * Math.sin(a0);
    const x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);

    // Side (two triangles)
    verts.push(
      x0, y0, z0,   x1, y1, z0,   x1, y1, z1,
      x0, y0, z0,   x1, y1, z1,   x0, y0, z1
    );

    // Cap at z0
    verts.push(
      0, 0, z0,   x1, y1, z0,   x0, y0, z0
    );

    // Cap at z1
    verts.push(
      0, 0, z1,   x0, y0, z1,   x1, y1, z1
    );
  }

  const v = new Float32Array(verts);
  g_numCylVerts = v.length / 3;

  g_cylVertexBuffer = gl.createBuffer();
  if (!g_cylVertexBuffer) throw new Error("Failed to create cylinder buffer");

  gl.bindBuffer(gl.ARRAY_BUFFER, g_cylVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);

  gl.vertexAttribPointer(g_aPositionLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(g_aPositionLoc);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

export function drawCylinder(gl, u_ModelMatrix, u_FragColor, M, color = [1, 1, 1, 1]) {
  if (!g_cylVertexBuffer) return;

  // re-bind cylinder buffer and re-point attribute EVERY draw
  gl.bindBuffer(gl.ARRAY_BUFFER, g_cylVertexBuffer);
  gl.vertexAttribPointer(g_aPositionLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(g_aPositionLoc);

  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

  gl.drawArrays(gl.TRIANGLES, 0, g_numCylVerts);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}
