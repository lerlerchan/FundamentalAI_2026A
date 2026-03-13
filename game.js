(function(){
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const restartBtn = document.getElementById('restartBtn');
  const aiToggle = document.getElementById('aiToggle');
  const speedSelect = document.getElementById('speedSelect');

  const tileSize = 20;
  const gridWidth = canvas.width / tileSize | 0;
  const gridHeight = canvas.height / tileSize | 0;

  let snake = [];
  let dir = {x:1,y:0};
  let nextDir = dir;
  let food = {x:0,y:0};
  let score = 0;
  let running = false;
  let intervalId = null;
  let stepMs = parseInt(speedSelect.value,10);

  function init(){
    snake = [ {x:Math.floor(gridWidth/2), y:Math.floor(gridHeight/2)} ];
    dir = {x:1,y:0}; nextDir = dir;
    spawnFood();
    score = 0; updateScore();
    running = false;
    clearInterval(intervalId);
    draw();
  }

  function spawnFood(){
    while(true){
      const x = Math.floor(Math.random()*gridWidth);
      const y = Math.floor(Math.random()*gridHeight);
      if(!snake.some(s=>s.x===x && s.y===y)) { food = {x,y}; break; }
    }
  }

  function updateScore(){ scoreEl.textContent = ''+score; }

  function step(){
    // AI
    if(aiToggle.checked && window.AI){
      const state = { snake: snake.slice(), food: food, dir: dir, gridWidth, gridHeight };
      const want = AI.decide(state);
      const map = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
      const d = map[want];
      if(!(d.x + dir.x === 0 && d.y + dir.y === 0)) nextDir = d;
    }

    dir = nextDir;
    const head = snake[0];
    const newHead = { x: head.x + dir.x, y: head.y + dir.y };

    // wall collision
    if(newHead.x < 0 || newHead.x >= gridWidth || newHead.y < 0 || newHead.y >= gridHeight){
      gameOver(); return;
    }
    // self collision
    if(snake.some(s=>s.x===newHead.x && s.y===newHead.y)){ gameOver(); return; }

    snake.unshift(newHead);
    if(newHead.x === food.x && newHead.y === food.y){
      score += 1; updateScore(); spawnFood();
      // optionally speed up
    } else {
      snake.pop();
    }
    draw();
  }

  function draw(){
    ctx.fillStyle = '#0b0b0b'; ctx.fillRect(0,0,canvas.width,canvas.height);
    // draw grid faint
    ctx.strokeStyle = '#111';
    for(let x=0;x<=canvas.width;x+=tileSize){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
    for(let y=0;y<=canvas.height;y+=tileSize){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }

    // food
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x*tileSize+2, food.y*tileSize+2, tileSize-4, tileSize-4);

    // snake
    for(let i=0;i<snake.length;i++){
      const s = snake[i];
      ctx.fillStyle = i===0 ? '#2ecc71' : '#27ae60';
      ctx.fillRect(s.x*tileSize+1, s.y*tileSize+1, tileSize-2, tileSize-2);
    }
  }

  function gameOver(){
    running = false;
    clearInterval(intervalId);
    alert('Game Over — score: ' + score);
  }

  function start(){
    if(running) return;
    running = true;
    stepMs = parseInt(speedSelect.value,10);
    intervalId = setInterval(step, stepMs);
  }
  function pause(){ running = false; clearInterval(intervalId); }
  function restart(){ init(); start(); }

  window.addEventListener('keydown', (e)=>{
    const key = e.key;
    const mapping = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0], w:[0,-1], s:[0,1], a:[-1,0], d:[1,0] };
    const m = mapping[key];
    if(m){
      // prevent reverse
      if(!(m[0] + dir.x === 0 && m[1] + dir.y === 0)) nextDir = {x:m[0], y:m[1]};
      e.preventDefault();
    }
  });

  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', pause);
  restartBtn.addEventListener('click', restart);
  speedSelect.addEventListener('change', ()=>{
    stepMs = parseInt(speedSelect.value,10);
    if(running){ clearInterval(intervalId); intervalId = setInterval(step, stepMs); }
  });

  init();
  // expose for debugging
  window._snakeGame = { start, pause, restart, getState:()=>({snake,food,dir,score}) };
})();