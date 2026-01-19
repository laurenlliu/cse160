// PigPicture.js - Creates a pig picture
class PigPicture {
  constructor() {
    this.triangles = [];
    this.happiness = 0; // Happiness level
    this.createPig();
  }

  // Create all triangles for the pig
  createPig() {
    // Clear any existing triangles
    this.triangles = [];

    // Pig colors
    var pink = [1.0, 0.75, 0.8, 1.0];
    var darkPink = [0.9, 0.6, 0.7, 1.0];
    var noseColor = [0.95, 0.5, 0.6, 1.0];
    var black = [0, 0, 0, 1];
    var blue = [0.3, 0.6, 1.0, 1.0];
    var lightPink = [1.0, 0.85, 0.9, 1.0]; // For inner ear

    // ============ BODY - Square made of 2 triangles ============
    // Body square coordinates: (-0.4, -0.4) to (0.4, 0.2)
    this.triangles.push(new Triangle(
      -0.4, -0.4,   // Bottom-left of body
      0.4, -0.4,    // Bottom-right of body
      -0.4, 0.2,    // Top-left of body
      pink
    ));
    
    this.triangles.push(new Triangle(
      0.4, -0.4,    // Bottom-right of body
      0.4, 0.2,     // Top-right of body
      -0.4, 0.2,    // Top-left of body
      pink
    ));

    // ============ HEAD - Square made of 2 triangles ============
    // Head square coordinates: (-0.2, 0.2) to (0.2, 0.6)
    this.triangles.push(new Triangle(
      -0.2, 0.2,    // Bottom-left of head
      0.2, 0.2,     // Bottom-right of head
      -0.2, 0.6,    // Top-left of head
      pink
    ));
    
    this.triangles.push(new Triangle(
      0.2, 0.2,     // Bottom-right of head
      0.2, 0.6,     // Top-right of head
      -0.2, 0.6,    // Top-left of head
      pink
    ));

    // ============ EARS - PROPER WIGGLE ANIMATION (4 triangles) ============
    // Calculate wiggle rotation (in radians) - ears tilt back and forth
    var wiggleAngle = Math.sin(this.happiness * 0.5) * 0.3; // Rotation angle
    
    // Left ear base position (on head)
    var leftBaseX = -0.15;
    var leftBaseY = 0.45;
    
    // Right ear base position (on head)
    var rightBaseX = 0.15;
    var rightBaseY = 0.45;
    
    // Ear dimensions
    var earWidth = 0.1;
    var earHeight = 0.2;
    
    // ===== LEFT EAR =====
    // Original points (before rotation)
    var leftTipOriginalX = leftBaseX;
    var leftTipOriginalY = leftBaseY + earHeight;
    var leftInnerTipOriginalX = leftBaseX + 0.02;
    var leftInnerTipOriginalY = leftBaseY + earHeight - 0.05;
    
    // Rotate left ear points around base
    var cosAngle = Math.cos(wiggleAngle);
    var sinAngle = Math.sin(wiggleAngle);
    
    // Left ear outer - tip rotates around base
    var leftTipX = leftBaseX + (leftTipOriginalX - leftBaseX) * cosAngle - (leftTipOriginalY - leftBaseY) * sinAngle;
    var leftTipY = leftBaseY + (leftTipOriginalX - leftBaseX) * sinAngle + (leftTipOriginalY - leftBaseY) * cosAngle;
    
    this.triangles.push(new Triangle(
      leftBaseX - earWidth/2, leftBaseY,      // Base-left (fixed on head)
      leftBaseX + earWidth/2, leftBaseY,      // Base-right (fixed on head)
      leftTipX, leftTipY,                     // Tip (rotates)
      darkPink
    ));
    
    // Left ear inner - rotates with outer ear
    var leftInnerTipX = leftBaseX + (leftInnerTipOriginalX - leftBaseX) * cosAngle - (leftInnerTipOriginalY - leftBaseY) * sinAngle;
    var leftInnerTipY = leftBaseY + (leftInnerTipOriginalX - leftBaseX) * sinAngle + (leftInnerTipOriginalY - leftBaseY) * cosAngle;
    
    this.triangles.push(new Triangle(
      leftBaseX - earWidth/2 + 0.01, leftBaseY + 0.05,  // Inner base-left
      leftBaseX + earWidth/2 - 0.01, leftBaseY + 0.05,  // Inner base-right
      leftInnerTipX, leftInnerTipY,                    // Inner tip (rotates)
      lightPink
    ));
    
    // ===== RIGHT EAR =====
    // Rotate right ear in opposite direction (negative angle)
    var rightCosAngle = Math.cos(-wiggleAngle);
    var rightSinAngle = Math.sin(-wiggleAngle);
    
    var rightTipOriginalX = rightBaseX;
    var rightTipOriginalY = rightBaseY + earHeight;
    var rightInnerTipOriginalX = rightBaseX - 0.02;
    var rightInnerTipOriginalY = rightBaseY + earHeight - 0.05;
    
    // Right ear outer - tip rotates opposite direction
    var rightTipX = rightBaseX + (rightTipOriginalX - rightBaseX) * rightCosAngle - (rightTipOriginalY - rightBaseY) * rightSinAngle;
    var rightTipY = rightBaseY + (rightTipOriginalX - rightBaseX) * rightSinAngle + (rightTipOriginalY - rightBaseY) * rightCosAngle;
    
    this.triangles.push(new Triangle(
      rightBaseX - earWidth/2, rightBaseY,    // Base-left (fixed)
      rightBaseX + earWidth/2, rightBaseY,    // Base-right (fixed)
      rightTipX, rightTipY,                   // Tip (rotates opposite)
      darkPink
    ));
    
    // Right ear inner - rotates with outer ear
    var rightInnerTipX = rightBaseX + (rightInnerTipOriginalX - rightBaseX) * rightCosAngle - (rightInnerTipOriginalY - rightBaseY) * rightSinAngle;
    var rightInnerTipY = rightBaseY + (rightInnerTipOriginalX - rightBaseX) * rightSinAngle + (rightInnerTipOriginalY - rightBaseY) * rightCosAngle;
    
    this.triangles.push(new Triangle(
      rightBaseX - earWidth/2 + 0.01, rightBaseY + 0.05,  // Inner base-left
      rightBaseX + earWidth/2 - 0.01, rightBaseY + 0.05,  // Inner base-right
      rightInnerTipX, rightInnerTipY,                    // Inner tip (rotates)
      lightPink
    ));

    // ============ SNOUT (1 triangle) ============
    this.triangles.push(new Triangle(
      -0.08, 0.3,
      0.08, 0.3,
      0, 0.2,
      noseColor
    ));

    // ============ NOSTRILS (2 triangles) ============
    this.triangles.push(new Triangle(
      -0.025, 0.25,
      -0.035, 0.23,
      -0.015, 0.23,
      black
    ));
    
    this.triangles.push(new Triangle(
      0.025, 0.25,
      0.015, 0.23,
      0.035, 0.23,
      black
    ));

    // ============ EYES (2 triangles) ============
    this.triangles.push(new Triangle(
      -0.05, 0.4,
      -0.07, 0.38,
      -0.03, 0.38,
      black
    ));
    
    this.triangles.push(new Triangle(
      0.05, 0.4,
      0.03, 0.38,
      0.07, 0.38,
      black
    ));

    // ============ CHEEKS (2 triangles - blush effect when happy) ============
    var cheekColor = this.happiness > 0 ? [1.0, 0.7, 0.8, 1.0] : pink;
    this.triangles.push(new Triangle(
      -0.12, 0.35,
      -0.08, 0.35,
      -0.1, 0.32,
      cheekColor
    ));
    
    this.triangles.push(new Triangle(
      0.08, 0.35,
      0.12, 0.35,
      0.1, 0.32,
      cheekColor
    ));

    // ============ FEET (4 triangles) ============
    this.triangles.push(new Triangle(-0.2, -0.4, -0.25, -0.55, -0.15, -0.55, darkPink));
    this.triangles.push(new Triangle(0.2, -0.4, 0.15, -0.55, 0.25, -0.55, darkPink));
    this.triangles.push(new Triangle(-0.35, -0.3, -0.4, -0.45, -0.3, -0.45, darkPink));
    this.triangles.push(new Triangle(0.35, -0.3, 0.3, -0.45, 0.4, -0.45, darkPink));

    // ============ TAIL - "LL" initials (2 triangles) ============
    this.createSimpleLetterL(0.42, -0.1, 0.07, darkPink);
    this.createSimpleLetterL(0.52, -0.1, 0.07, darkPink);
  }

  // Create simple letter "L" (2 triangles)
  createSimpleLetterL(centerX, centerY, size, color) {
    this.triangles.push(new Triangle(
      centerX - size/3, centerY + size/2,
      centerX - size/3, centerY - size/2,
      centerX + size/3, centerY + size/2,
      color
    ));
    
    this.triangles.push(new Triangle(
      centerX - size/3, centerY - size/2,
      centerX + size/2, centerY - size/2,
      centerX - size/3, centerY - size,
      color
    ));
  }

  // Increase happiness when clicked
  increaseHappiness() {
    this.happiness += 1;
    this.createPig(); // Recreate pig with wiggling ears
  }

  // Render all triangles
  renderAll(gl, a_Position, u_FragColor, u_PointSize) {
    for (let i = 0; i < this.triangles.length; i++) {
      this.triangles[i].render(gl, a_Position, u_FragColor, u_PointSize);
    }
  }

  // Add all triangles to the main shapesList
  addToShapesList(shapesList) {
    for (let i = 0; i < this.triangles.length; i++) {
      shapesList.push(this.triangles[i]);
    }
    return this.triangles.length;
  }

  // Check if a point is inside the pig (simple bounding box)
  isPointInPig(x, y) {
    // Check if point is within pig's approximate bounds (body + head)
    return x >= -0.5 && x <= 0.5 && y >= -0.6 && y <= 0.7;
  }
}
