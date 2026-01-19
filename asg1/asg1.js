// Global variables
var gl;
var a_Position;
var u_FragColor;
var u_PointSize;
var shapesList = [];
var currentColor = [1.0, 0.0, 0.0, 1.0];
var currentSize = 10.0;
var currentShape = "point";
var circleSegments = 20;
var isMouseDown = false;
var lastRenderTime = 0;
var lastClickTime = 0;
var minTimeBetweenShapes = 16;

// Pig Clicker Game variables
var pigGame = null;
var pigClicks = 0;

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_PointSize;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_PointSize;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Point class definition
class Point {
  constructor(x, y, color, size) {
    this.type = "point";
    this.x = x;
    this.y = y;
    this.color = color.slice();
    this.size = size;
  }

  render(gl, a_Position, u_FragColor, u_PointSize) {
    gl.vertexAttrib3f(a_Position, this.x, this.y, 0.0);
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.uniform1f(u_PointSize, this.size);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  setupUIControls();
  addCanvasHandlers();
  
  document.getElementById('numPoints').innerHTML = 'Number of shapes: 0';
  document.getElementById('performance').textContent = 'Performance: Ready';
  
  renderAllShapes();
}

function setupWebGL() {
  var canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }) || 
       canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
  
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return false;
  }
  
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  return true;
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return false;
  }
  
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return false;
  }
  
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return false;
  }
  
  u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
  if (!u_PointSize) {
    console.log('Failed to get the storage location of u_PointSize');
    return false;
  }
  
  return true;
}

function renderAllShapes() {
  var startTime = performance.now();
  
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  var len = shapesList.length;
  for (var i = 0; i < len; i++) {
    shapesList[i].render(gl, a_Position, u_FragColor, u_PointSize);
  }
  
  var endTime = performance.now();
  var renderTime = endTime - startTime;
  lastRenderTime = renderTime;
  
  if (shapesList.length > 50) {
    document.getElementById('performance').textContent = 
      'Performance: ' + renderTime.toFixed(2) + 'ms for ' + shapesList.length + ' shapes';
  }
}

function click(ev) {
  // First check if we clicked the pig
  if (pigGame && handlePigClick(ev)) {
    return; // Pig was clicked, don't create a new shape
  }
  
  var currentTime = performance.now();
  if (currentTime - lastClickTime < minTimeBetweenShapes && isMouseDown) {
    return;
  }
  lastClickTime = currentTime;
  
  var x = ev.clientX;
  var y = ev.clientY;
  var canvas = ev.target;
  var rect = canvas.getBoundingClientRect();
  
  x = ((x - rect.left) - canvas.width/2) / (canvas.width/2);
  y = (canvas.height/2 - (y - rect.top)) / (canvas.height/2);
  
  var shape;
  switch(currentShape) {
    case "point":
      shape = new Point(x, y, currentColor, currentSize);
      break;
    case "triangle":
      var size = currentSize / 100;
      shape = new Triangle(
        x, y + size,
        x - size, y - size,
        x + size, y - size,
        currentColor
      );
      break;
    case "circle":
      var radius = currentSize / 100;
      shape = new Circle(x, y, radius, currentColor, circleSegments);
      break;
    default:
      shape = new Point(x, y, currentColor, currentSize);
  }
  
  shapesList.push(shape);
  document.getElementById('numPoints').innerHTML = 'Number of shapes: ' + shapesList.length;
  renderAllShapes();
}

function handleMouseMove(ev) {
  if (ev.buttons == 1) {
    click(ev);
  }
}

function handleMouseDown(ev) {
  isMouseDown = true;
  click(ev);
}

function handleMouseUp(ev) {
  isMouseDown = false;
}

function clearCanvas() {
  shapesList = [];
  pigGame = null;
  pigClicks = 0;
  updatePigGameDisplay();
  document.getElementById('numPoints').innerHTML = 'Number of shapes: 0';
  document.getElementById('performance').textContent = 'Performance: Canvas cleared';
  renderAllShapes();
}

// NEW: Save non-pig shapes before drawing pig
var nonPigShapes = [];

function drawPigPicture() {
  // Save existing shapes that aren't part of the pig
  nonPigShapes = [];
  for (var i = 0; i < shapesList.length; i++) {
    if (!isPigTriangle(shapesList[i])) {
      nonPigShapes.push(shapesList[i]);
    }
  }
  
  // Clear and add back non-pig shapes
  shapesList = [];
  for (var i = 0; i < nonPigShapes.length; i++) {
    shapesList.push(nonPigShapes[i]);
  }
  
  // Create pig picture
  pigGame = new PigPicture();
  
  // Add pig to shapesList
  var numTriangles = pigGame.addToShapesList(shapesList);
  
  // Update counter
  document.getElementById('numPoints').innerHTML = 
    'Number of shapes: ' + shapesList.length;
  
  document.getElementById('performance').textContent = 
    'Added pig picture. Click the pig or draw other shapes!';
  
  pigClicks = 0;
  updatePigGameDisplay();
  
  renderAllShapes();
}

// Helper to check if a shape is part of the pig
function isPigTriangle(shape) {
  if (!pigGame) return false;
  
  // Check if this shape is in pigGame's triangles
  for (var i = 0; i < pigGame.triangles.length; i++) {
    if (pigGame.triangles[i] === shape) {
      return true;
    }
  }
  return false;
}

// ============ PIG CLICKER GAME FUNCTIONS ============

function handlePigClick(event) {
  var canvas = document.getElementById('webgl');
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  if (pigGame && pigGame.isPointInPig(
    (x / canvas.width) * 2 - 1,
    1 - (y / canvas.height) * 2
  )) {
    pigGame.increaseHappiness();
    pigClicks++;
    
    // Recreate the pig with updated happiness
    recreatePigWithExistingShapes();
    
    updatePigGameDisplay();
    return true;
  }
  return false;
}

// Recreate pig while keeping other shapes
function recreatePigWithExistingShapes() {
  // Save non-pig shapes
  var savedShapes = [];
  for (var i = 0; i < shapesList.length; i++) {
    if (!isPigTriangle(shapesList[i])) {
      savedShapes.push(shapesList[i]);
    }
  }
  
  // Clear and rebuild
  shapesList = [];
  
  // Add saved shapes back
  for (var i = 0; i < savedShapes.length; i++) {
    shapesList.push(savedShapes[i]);
  }
  
  // Recreate and add pig
  pigGame.createPig();
  pigGame.addToShapesList(shapesList);
  
  renderAllShapes();
}

function updatePigGameDisplay() {
  if (!pigGame) {
    document.getElementById('pigHappiness').textContent = '0';
    document.getElementById('pigClicks').textContent = '0';
    return;
  }
  
  document.getElementById('pigHappiness').textContent = pigGame.happiness;
  document.getElementById('pigClicks').textContent = pigClicks;
}

function resetPigGame() {
  if (pigGame) {
    // Remove pig from shapesList
    var newShapesList = [];
    for (var i = 0; i < shapesList.length; i++) {
      if (!isPigTriangle(shapesList[i])) {
        newShapesList.push(shapesList[i]);
      }
    }
    shapesList = newShapesList;
    
    // Reset pig
    pigGame = null;
    pigClicks = 0;
    updatePigGameDisplay();
    
    document.getElementById('numPoints').innerHTML = 'Number of shapes: ' + shapesList.length;
    renderAllShapes();
  }
}

function setActiveShape(shapeType) {
  currentShape = shapeType;
  
  document.getElementById('pointButton').classList.remove('active');
  document.getElementById('triangleButton').classList.remove('active');
  document.getElementById('circleButton').classList.remove('active');
  
  document.getElementById(shapeType + 'Button').classList.add('active');
  
  var segmentsContainer = document.getElementById('segmentsContainer');
  if (shapeType === 'circle') {
    segmentsContainer.style.display = 'block';
  } else {
    segmentsContainer.style.display = 'none';
  }
}

function setupUIControls() {
  var redSlider = document.getElementById('redSlider');
  var greenSlider = document.getElementById('greenSlider');
  var blueSlider = document.getElementById('blueSlider');
  var sizeSlider = document.getElementById('sizeSlider');
  var segmentsSlider = document.getElementById('segmentsSlider');
  
  var redValue = document.getElementById('redValue');
  var greenValue = document.getElementById('greenValue');
  var blueValue = document.getElementById('blueValue');
  var sizeValue = document.getElementById('sizeValue');
  var segmentsValue = document.getElementById('segmentsValue');
  
  var clearButton = document.getElementById('clearButton');
  var pointButton = document.getElementById('pointButton');
  var triangleButton = document.getElementById('triangleButton');
  var circleButton = document.getElementById('circleButton');
  var drawPigButton = document.getElementById('drawPigButton');
  
  var colorDisplay = document.getElementById('colorDisplay');
  
  function updateColor() {
    var r = redSlider.value / 100;
    var g = greenSlider.value / 100;
    var b = blueSlider.value / 100;
    
    currentColor = [r, g, b, 1.0];
    
    redValue.textContent = r.toFixed(2);
    greenValue.textContent = g.toFixed(2);
    blueValue.textContent = b.toFixed(2);
    
    var r255 = Math.round(r * 255);
    var g255 = Math.round(g * 255);
    var b255 = Math.round(b * 255);
    colorDisplay.style.backgroundColor = 'rgb(' + r255 + ',' + g255 + ',' + b255 + ')';
  }
  
  function updateSize() {
    currentSize = parseFloat(sizeSlider.value);
    sizeValue.textContent = sizeSlider.value;
  }
  
  function updateSegments() {
    circleSegments = parseInt(segmentsSlider.value);
    segmentsValue.textContent = segmentsSlider.value;
  }
  
  redSlider.addEventListener('input', updateColor);
  greenSlider.addEventListener('input', updateColor);
  blueSlider.addEventListener('input', updateColor);
  sizeSlider.addEventListener('input', updateSize);
  segmentsSlider.addEventListener('input', updateSegments);
  
  clearButton.addEventListener('click', clearCanvas);
  
  pointButton.addEventListener('click', function() { setActiveShape('point'); });
  triangleButton.addEventListener('click', function() { setActiveShape('triangle'); });
  circleButton.addEventListener('click', function() { setActiveShape('circle'); });
  
  drawPigButton.addEventListener('click', drawPigPicture);

  updateColor();
  updateSize();
  updateSegments();
  updatePigGameDisplay();
}

function addCanvasHandlers() {
  var canvas = document.getElementById('webgl');
  canvas.onmousedown = handleMouseDown;
  canvas.onmouseup = handleMouseUp;
  canvas.onmousemove = handleMouseMove;
  canvas.onclick = click;
}

function initShaders(gl, vshader, fshader) {
  var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  
  if (!vertexShader || !fragmentShader) {
    return false;
  }
  
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log('Failed to link program: ' + gl.getProgramInfoLog(program));
    return false;
  }
  
  gl.useProgram(program);
  gl.program = program;
  return true;
}

function loadShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log('Failed to compile shader: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  
  return shader;
}
