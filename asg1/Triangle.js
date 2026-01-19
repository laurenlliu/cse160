// Triangle.js - Triangle class definition
class Triangle {
  constructor(x1, y1, x2, y2, x3, y3, color) {
    this.type = "triangle";
    this.vertices = [x1, y1, 0.0, x2, y2, 0.0, x3, y3, 0.0];
    this.color = color.slice();
  }

  render(gl, a_Position, u_FragColor, u_PointSize) {
    // Pass the color of the triangle to u_FragColor variable
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    
    // Create buffer
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create buffer object');
      return;
    }
    
    // Bind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
    // Write data into the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
    
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
    
    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    // IMPORTANT: Disable the vertex attribute array after drawing
    gl.disableVertexAttribArray(a_Position);
  }
}
