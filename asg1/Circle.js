// Circle.js - Circle class definition
class Circle {
  constructor(x, y, radius, color, segments = 20) {
    this.type = "circle";
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color.slice();
    this.segments = segments;
  }

  render(gl, a_Position, u_FragColor, u_PointSize) {
    // Pass the color of the circle to u_FragColor variable
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    
    // Draw circle using triangles (triangle fan)
    var vertices = [];
    var angleStep = 2 * Math.PI / this.segments;
    
    // Center vertex
    vertices.push(this.x, this.y, 0.0);
    
    // Create vertices around the circle
    for (var i = 0; i <= this.segments; i++) {
      var angle = i * angleStep;
      var x = this.x + this.radius * Math.cos(angle);
      var y = this.y + this.radius * Math.sin(angle);
      vertices.push(x, y, 0.0);
    }
    
    // Create buffer
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create buffer object');
      return;
    }
    
    // Bind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    
    // Draw the circle as triangle fan
    gl.drawArrays(gl.TRIANGLE_FAN, 0, this.segments + 2);
    
    // IMPORTANT: Disable the vertex attribute array after drawing
    gl.disableVertexAttribArray(a_Position);
  }
}
