// Cube.js 

let g_cubeVertexBuffer = null;
const g_numCubeVerts = 36;
let g_aPositionLoc = -1;

export function initCubeBuffer(gl, a_Position) {
  g_aPositionLoc = a_Position;

  const v = new Float32Array([
    // Front (z=+0.5)
    -0.5,-0.5, 0.5,   0.5, 0.5, 0.5,   0.5,-0.5, 0.5,
    -0.5,-0.5, 0.5,  -0.5, 0.5, 0.5,   0.5, 0.5, 0.5,

    // Back (z=-0.5)
    -0.5,-0.5,-0.5,   0.5,-0.5,-0.5,   0.5, 0.5,-0.5,
    -0.5,-0.5,-0.5,   0.5, 0.5,-0.5,  -0.5, 0.5,-0.5,

    // Left (x=-0.5)
    -0.5,-0.5,-0.5,  -0.5, 0.5, 0.5,  -0.5,-0.5, 0.5,
    -0.5,-0.5,-0.5,  -0.5, 0.5,-0.5,  -0.5, 0.5, 0.5,

    // Right (x=+0.5)
     0.5,-0.5,-0.5,   0.5,-0.5, 0.5,   0.5, 0.5, 0.5,
     0.5,-0.5,-0.5,   0.5, 0.5, 0.5,   0.5, 0.5,-0.5,

    // Top (y=+0.5)
    -0.5, 0.5,-0.5,   0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,
    -0.5, 0.5,-0.5,   0.5, 0.5,-0.5,   0.5, 0.5, 0.5,

    // Bottom (y=-0.5)
    -0.5,-0.5,-0.5,  -0.5,-0.5, 0.5,   0.5,-0.5, 0.5,
    -0.5,-0.5,-0.5,   0.5,-0.5, 0.5,   0.5,-0.5,-0.5,
  ]);

  g_cubeVertexBuffer = gl.createBuffer();
  if (!g_cubeVertexBuffer) throw new Error("Failed to create cube buffer");

  gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);

  gl.vertexAttribPointer(g_aPositionLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(g_aPositionLoc);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

export function drawCube(gl, u_ModelMatrix, u_FragColor, M, color = [1,1,1,1]) {
  if (!g_cubeVertexBuffer) return;

  // re-bind cube buffer and re-point attribute EVERY draw
  gl.bindBuffer(gl.ARRAY_BUFFER, g_cubeVertexBuffer);
  gl.vertexAttribPointer(g_aPositionLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(g_aPositionLoc);

  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

  gl.drawArrays(gl.TRIANGLES, 0, g_numCubeVerts);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}
