function main() {  
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  var ctx = canvas.getContext('2d');
  
  var drawButton = document.getElementById('draw-button');
  drawButton.addEventListener('click', handleDrawEvent);
  
  var drawOpButton = document.getElementById('draw-op-button');
  drawOpButton.addEventListener('click', handleDrawOperationEvent);
  
  handleDrawEvent();
}

function handleDrawEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');
  
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  var x1Input = document.getElementById('x1-coord');
  var y1Input = document.getElementById('y1-coord');
  var x2Input = document.getElementById('x2-coord');
  var y2Input = document.getElementById('y2-coord');
  
  var x1 = parseFloat(x1Input.value) || 0;
  var y1 = parseFloat(y1Input.value) || 0;
  var x2 = parseFloat(x2Input.value) || 0;
  var y2 = parseFloat(y2Input.value) || 0;
  
  var v1 = new Vector3([x1, y1, 0]);
  var v2 = new Vector3([x2, y2, 0]);
  
  drawVector(v1, "red", ctx);
  drawVector(v2, "blue", ctx);
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');
  
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  var x1Input = document.getElementById('x1-coord');
  var y1Input = document.getElementById('y1-coord');
  var x2Input = document.getElementById('x2-coord');
  var y2Input = document.getElementById('y2-coord');
  
  var x1 = parseFloat(x1Input.value) || 0;
  var y1 = parseFloat(y1Input.value) || 0;
  var x2 = parseFloat(x2Input.value) || 0;
  var y2 = parseFloat(y2Input.value) || 0;
  
  var v1 = new Vector3([x1, y1, 0]);
  var v2 = new Vector3([x2, y2, 0]);
  
  drawVector(v1, "red", ctx);
  drawVector(v2, "blue", ctx);
  
  var operation = document.getElementById('operation').value;
  var scalar = parseFloat(document.getElementById('scalar-value').value) || 1;
  
  if (operation === 'add') {
    var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    v3.add(v2);
    drawVector(v3, "green", ctx);
  } else if (operation === 'sub') {
    var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    v3.sub(v2);
    drawVector(v3, "green", ctx);
  } else if (operation === 'mul') {
    var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3, "green", ctx);
    drawVector(v4, "green", ctx);
  } else if (operation === 'div') {
    var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3, "green", ctx);
    drawVector(v4, "green", ctx);
  } else if (operation === 'magnitude') {
    var mag1 = v1.magnitude();
    var mag2 = v2.magnitude();
    console.log("Magnitude v1: " + mag1);
    console.log("Magnitude v2: " + mag2);
  } else if (operation === 'normalize') {
    var mag1 = v1.magnitude();
    var mag2 = v2.magnitude();
    console.log("Magnitude v1: " + mag1);
    console.log("Magnitude v2: " + mag2);
    
    var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
    v3.normalize();
    v4.normalize();
    
    var normMag1 = v3.magnitude();
    var normMag2 = v4.magnitude();
    console.log("Normalized magnitude v1: " + normMag1);
    console.log("Normalized magnitude v2: " + normMag2);
    
    drawVector(v3, "green", ctx);
    drawVector(v4, "green", ctx);
  } else if (operation === 'angle') {
    var angle = angleBetween(v1, v2);
    console.log("Angle between v1 and v2: " + angle + " degrees");
  } else if (operation === 'area') {
    var area = areaTriangle(v1, v2);
    console.log("Area of triangle: " + area);
  }
}

function angleBetween(v1, v2) {
  var dotProduct = Vector3.dot(v1, v2);
  var mag1 = v1.magnitude();
  var mag2 = v2.magnitude();
  
  if (mag1 === 0 || mag2 === 0) {
    return 0;
  }
  
  var cosAlpha = dotProduct / (mag1 * mag2);
  cosAlpha = Math.max(-1, Math.min(1, cosAlpha));
  
  var angleRad = Math.acos(cosAlpha);
  var angleDeg = angleRad * (180 / Math.PI);
  
  return angleDeg;
}

function areaTriangle(v1, v2) {
  var crossProduct = Vector3.cross(v1, v2);
  var parallelogramArea = crossProduct.magnitude();
  var triangleArea = parallelogramArea / 2;
  return triangleArea;
}

function drawVector(v, color, ctx) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  var centerX = ctx.canvas.width / 2;
  var centerY = ctx.canvas.height / 2;
  
  var scale = 20;
  
  var endX = centerX + v.elements[0] * scale;
  var endY = centerY - v.elements[1] * scale;
  
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}
