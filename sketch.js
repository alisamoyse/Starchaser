let particles = [];

let pointerX = 0;
let pointerY = 0;
let pointerActive = false;

// tuning values
const repelRadius = 180;
const repelStrength = 0.9;
const returnStrength = 0.02;
const friction = 0.88;

let scene = 0;

const scenes = [
  {
    title: "STARCHASER",
    subtitle: "\ncatch the star, save the universe"
  },
  {
    subtitle: "* narrator script. *"
  },
  {
    subtitle: "* more narrator script. *"
  }
];

function setup() {
  const c = createCanvas(windowWidth, windowHeight);
  c.parent("sketch");

  pointerX = width / 2;
  pointerY = height / 2;

  createParticles();

  const nextButton = document.getElementById("reset");

  nextButton.addEventListener("click", () => {
    if (scene === scenes.length - 1) {
      window.location.href = "game.html";
      return;
    }

    scene++;

    if (scene === scenes.length - 1) {
      nextButton.textContent = "Play Game";
    }
  });
}

function draw() {
  drawBackground();
  updatePointer();
  updateParticles();
  drawConnectionLines();
  drawParticles();
  drawSceneText();
}

function drawSceneText() {
  const currentScene = scenes[scene];

  textAlign(CENTER, CENTER);
  textFont("Courier New");

  fill(255);
  noStroke();
  textSize(80);
  textStyle(BOLD);
  text(currentScene.title, width / 2, height / 2 - 20);

  fill(200);
  textSize(22);
  textStyle(NORMAL);
  text(currentScene.subtitle, width / 2, height / 2 + 25);
}

// circular empty center
function getCenterRadius() {
  return min(width/2, height/2.5);
}

function createParticles() {
  particles = [];

  const count = floor(constrain((width * height) / 700, 55, 150));
  const cx = width / 2;
  const cy = height / 2;
  const r = getCenterRadius();

  for (let i = 0; i < count; i++) {
    let x, y;

    // keep trying until outside center circle
    do {
      x = random(width);
      y = random(height);
    } while (dist(x, y, cx, cy) < r);

    particles.push({
      x: x,
      y: y,
      baseX: x, // original position
      baseY: y,
      vx: 0,
      vy: 0,
      size: random(3, 7),
      colorAmount: random(0.25, 1)
    });
  }
}

function updateParticles() {
  for (let p of particles) {

    // repel from cursor
    if (pointerActive) {
      const dx = p.x - pointerX;
      const dy = p.y - pointerY;
      const d = sqrt(dx * dx + dy * dy);

      if (d < repelRadius && d > 1) {
        const force = (1 - d / repelRadius) * repelStrength;
        p.vx += (dx / d) * force;
        p.vy += (dy / d) * force;
      }
    }

    // subtle idle motion (floating effect)
    const time = millis() * 0.002;

    const floatX = sin(time + p.baseX * 0.1) * 2.5;
    const floatY = cos(time + p.baseY * 0.1) * 3.5;

    // return to slightly shifting "home"
    const homeDX = (p.baseX + floatX) - p.x;
    const homeDY = (p.baseY + floatY) - p.y;

    p.vx += homeDX * returnStrength;
    p.vy += homeDY * returnStrength;

    // apply movement
    p.x += p.vx;
    p.y += p.vy;

    // friction
    p.vx *= friction;
    p.vy *= friction;
  }
}

function drawParticles() {
  noStroke();

  for (let p of particles) {
    const c = lerpColor(color("#68d8ff"), color("#ffffff"), p.colorAmount);
    fill(red(c), green(c), blue(c), 210);
    circle(p.x, p.y, p.size);
  }
}

function drawConnectionLines() {
  strokeWeight(1);

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const d = dist(a.x, a.y, b.x, b.y);

      if (d < 110) {
        const alpha = map(d, 0, 110, 85, 0);
        stroke(155, 215, 255, alpha);
        line(a.x, a.y, b.x, b.y);
      }
    }
  }

  noStroke();
}

function drawBackground() {
  const topColor = color("#111822");
  const bottomColor = color("#243648");

  for (let y = 0; y < height; y++) {
    const amt = map(y, 0, height, 0, 1);
    stroke(lerpColor(topColor, bottomColor, amt));
    line(0, y, width, y);
  }

  noStroke();
}

function updatePointer() {
  pointerActive =
    mouseX >= 0 && mouseX <= width &&
    mouseY >= 0 && mouseY <= height;

  if (pointerActive) {
    pointerX = mouseX;
    pointerY = mouseY;
  }
}

function touchMoved() {
  if (touches.length > 0) {
    pointerX = touches[0].x;
    pointerY = touches[0].y;
    pointerActive = true;
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createParticles(); // random again on resize
}