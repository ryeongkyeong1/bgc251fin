let video;
let handpose;
let predictions = [];
let fallingTexts = [];
let input;

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);

  // 비디오
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();

  // 반항아 메세지를 입력하세요
  input = select('#inputText');

  input.changed(() => {
    let msg = input.value();
    if (msg.trim() !== '') {
      fallingTexts.push(new FallingText(msg));
      input.value('');
    }
  });

  // 핸드포즈 인식
  video.elt.onloadeddata = () => {
    handpose = ml5.handpose(video, () => {
      console.log('Handpose 띠리리');
    });

    handpose.on('predict', (results) => {
      predictions = results;
    });
  };
}

function draw() {
  image(video, 0, 0, width, height);

  // 떨어지는 텍스트
  for (let txt of fallingTexts) {
    txt.update();
    txt.show();
  }

  // 모자이크 + 하트
  if (predictions.length > 0) {
    for (let hand of predictions) {
      const pt = hand.landmarks[12];

      if (pt) {
        const xRatio = width / video.width;
        const yRatio = height / video.height;
        const mirroredX = width - pt[0] * xRatio;
        const scaledY = pt[1] * yRatio;
        applyMosaicAt(mirroredX, scaledY, 130, 20);
        drawHeart(mirroredX, scaledY, 30);
      }
    }
  }
}

function applyMosaicAt(x, y, size, blockSize) {
  noStroke();
  for (let i = 0; i < size; i += blockSize) {
    for (let j = 0; j < size; j += blockSize) {
      const c = get(x + i - size / 2, y + j - size / 2);
      fill(c);
      rect(x + i - size / 2, y + j - size / 2, blockSize, blockSize);
    }
  }
}

class FallingText {
  constructor(msg) {
    this.msg = msg;
    this.x = random(50, width - 50);
    this.y = -20;
    this.speed = random(1, 2);
    this.alpha = 255;
  }

  update() {
    this.y += this.speed;
    this.alpha -= 0.5;
  }

  show() {
    push();
    fill(0, 0, 0, this.alpha);
    textSize(24);
    textAlign(CENTER);
    text(this.msg, this.x, this.y);
    pop();
  }
}

function drawHeart(x, y, size) {
  push();
  translate(x, y);
  fill(255, 0, 100);
  noStroke();
  beginShape();
  vertex(0, -size / 2);
  bezierVertex(size / 2, -size, size, 0, 0, size);
  bezierVertex(-size, 0, -size / 2, -size, 0, -size / 2);
  endShape(CLOSE);
  pop();
}

function windowResized() {
  let canvas = select('canvas');
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
}
