const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;


const ship = {
  x: W / 2,
  y: H - 60,
  w: 40,
  h: 40,
  color: "#6cf"
};



let meteors = [];
let meteorInterval = 70;
let meteorSpeed = 3;
let frames = 0;
let score = 0;
let isGameOver = false;


const scoreDiv = document.getElementById('scoreDiv');
const restartBtn = document.getElementById('restartBtn');


function drawShip() {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.beginPath();
  ctx.moveTo(0, -ship.h / 2);
  ctx.lineTo(-ship.w / 2, ship.h / 2);
  ctx.lineTo(ship.w / 2, ship.h / 2);
  ctx.closePath();
  ctx.fillStyle = ship.color;
  ctx.fill();
  ctx.restore();
}


function drawMeteor(m) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.r, 0, 2 * Math.PI);
  ctx.fillStyle = m.color;
  ctx.fill();
  ctx.restore();
}


function updateShip() {
  if (ship.moveLeft && ship.x - ship.w / 2 > 0) ship.x -= 7;
  if (ship.moveRight && ship.x + ship.w / 2 < W) ship.x += 7;
}


function addMeteor() {
  meteors.push({
    x: Math.random() * (W - 60) + 30,
    y: -30,
    r: 30,
    color: "#f90"
  });
}


function updateMeteors() {
  for (let m of meteors) m.y += meteorSpeed;
 
  for (let i = meteors.length - 1; i >= 0; i--) {
    if (meteors[i].y - meteors[i].r > H) meteors.splice(i, 1);
  }
}


function checkCollision() {
  for (let m of meteors) {
    let dx = Math.abs(ship.x - m.x);
    let dy = Math.abs(ship.y - m.y);
    if (dx < ship.w / 2 + m.r && dy < ship.h / 2 + m.r) return true;
  }
  return false;
}


function gameLoop() {
  ctx.clearRect(0, 0, W, H);
  drawShip();
  for (let m of meteors) drawMeteor(m);

  updateShip();
  updateMeteors();

  if (frames % meteorInterval === 0) addMeteor();
  frames++;

  
  if (frames % 400 === 0 && meteorInterval > 35) meteorInterval--;
  if (frames % 500 === 0) meteorSpeed += 0.2;

  // Colisión
  if (checkCollision()) {
    gameOver();
    return;
  }

  
  score++;
  scoreDiv.textContent = `Puntaje: ${score}`;

  if (!isGameOver) requestAnimationFrame(gameLoop);
}





function gameOver() {
  isGameOver = true;
  ctx.save();
  ctx.font = "bold 36px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.shadowColor = "#f44";
  ctx.shadowBlur = 17;
  ctx.fillText("💥 GAME OVER 💥", W / 2, H / 2 - 20);
  ctx.font = "24px Arial";
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#eee";
  ctx.fillText(`Puntaje final: ${score}`, W / 2, H / 2 + 20);
  ctx.restore();
  restartBtn.style.display = "inline-block";
}


function restartGame() {
  ship.x = W / 2;
  meteors = [];
  meteorInterval = 70;
  meteorSpeed = 3;
  frames = 0;
  score = 0;
  isGameOver = false;
  scoreDiv.textContent = "Puntaje: 0";
  restartBtn.style.display = "none";
  gameLoop();
}


document.addEventListener('keydown', (e) => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") ship.moveLeft = true;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") ship.moveRight = true;
});
document.addEventListener('keyup', (e) => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") ship.moveLeft = false;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") ship.moveRight = false;
});

restartBtn.addEventListener('click', restartGame);


restartGame();
