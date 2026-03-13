// Simple heuristic AI for Snake
// Exposes window.AI.decide(state) -> one of 'up','down','left','right'
(function(){
  function keyToDir(k){
    return {up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[k];
  }

  function equal(a,b){return a.x===b.x && a.y===b.y}

  function willCollide(pos, snake, gridW, gridH){
    // wall collision
    if(pos.x < 0 || pos.x >= gridW || pos.y < 0 || pos.y >= gridH) return true;
    // body collision
    for(let i=0;i<snake.length;i++) if(equal(pos, snake[i])) return true;
    return false;
  }

  function dirToString(d){
    if(d[0]===0 && d[1]===-1) return 'up';
    if(d[0]===0 && d[1]===1) return 'down';
    if(d[0]===-1 && d[1]===0) return 'left';
    return 'right';
  }

  function decide(state){
    const head = state.snake[0];
    const food = state.food;
    const gridW = state.gridWidth; const gridH = state.gridHeight;
    const currDir = state.dir; // {x,y}

    const dx = food.x - head.x;
    const dy = food.y - head.y;

    const tryDirs = [];
    // prefer the axis that reduces the larger distance
    if(Math.abs(dx) > Math.abs(dy)){
      tryDirs.push(dx>0? 'right' : 'left');
      if(dy!==0) tryDirs.push(dy>0? 'down' : 'up');
    } else {
      tryDirs.push(dy>0? 'down' : 'up');
      if(dx!==0) tryDirs.push(dx>0? 'right' : 'left');
    }
    // fallback order
    ['up','down','left','right'].forEach(d=>{ if(!tryDirs.includes(d)) tryDirs.push(d)});

    const dirMap = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };

    for(const ds of tryDirs){
      const d = dirMap[ds];
      // prevent immediate reverse
      if(currDir.x + d[0] === 0 && currDir.y + d[1] === 0) continue;
      const next = {x: head.x + d[0], y: head.y + d[1]};
      if(!willCollide(next, state.snake, gridW, gridH)) return ds;
    }

    // if all choices collide, return current direction (will likely die)
    return dirToString([currDir.x, currDir.y]);
  }

  window.AI = { decide };
})();