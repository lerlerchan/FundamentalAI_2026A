// Simple heuristic AI for Snake
// Exposes window.AI.decide(state) -> one of 'up','down','left','right'
(function(){
  function equal(a,b){return a.x===b.x && a.y===b.y}

  function inBounds(p, w, h){ return p.x>=0 && p.x<w && p.y>=0 && p.y<h }

  function posKey(p){ return p.x + ',' + p.y }

  // BFS pathfinder that treats snake body cells as obstacles (except optionally tail)
  function bfs(start, goal, snake, w, h){
    const blocked = new Set();
    for(let i=0;i<snake.length;i++){
      blocked.add(posKey(snake[i]));
    }
    // allow stepping into tail because it will move unless we eat food
    const tail = snake[snake.length-1];
    blocked.delete(posKey(tail));

    const q = [];
    const cameFrom = new Map();
    q.push(start);
    cameFrom.set(posKey(start), null);

    const dirs = [ {x:0,y:-1}, {x:0,y:1}, {x:-1,y:0}, {x:1,y:0} ];

    while(q.length){
      const cur = q.shift();
      if(equal(cur, goal)){
        // reconstruct path
        const path = [];
        let k = posKey(cur);
        while(k){ path.unshift(k); k = cameFrom.get(k); }
        return path.map(s=>{ const [x,y]=s.split(',').map(Number); return {x,y}; });
      }
      for(const d of dirs){
        const nx = cur.x + d.x, ny = cur.y + d.y;
        const np = {x:nx,y:ny};
        const key = posKey(np);
        if(!inBounds(np,w,h)) continue;
        if(blocked.has(key)) continue;
        if(cameFrom.has(key)) continue;
        cameFrom.set(key, posKey(cur));
        q.push(np);
      }
    }
    return null;
  }

  function dirToString(d){
    if(d.x===0 && d.y===-1) return 'up';
    if(d.x===0 && d.y===1) return 'down';
    if(d.x===-1 && d.y===0) return 'left';
    return 'right';
  }

  function willCollide(pos, snake, gridW, gridH){
    if(pos.x < 0 || pos.x >= gridW || pos.y < 0 || pos.y >= gridH) return true;
    for(let i=0;i<snake.length;i++) if(equal(pos, snake[i])) return true;
    return false;
  }

  function decide(state){
    const head = state.snake[0];
    const food = state.food;
    const gridW = state.gridWidth; const gridH = state.gridHeight;
    const currDir = state.dir; // {x,y}

    // 1) try BFS path to food
    const path = bfs(head, food, state.snake, gridW, gridH);
    if(path && path.length >= 2){
      const next = path[1];
      const d = { x: next.x - head.x, y: next.y - head.y };
      // prevent immediate reverse
      if(!(d.x + currDir.x === 0 && d.y + currDir.y === 0)) return dirToString(d);
    }

    // 2) fallback heuristic: try directions that move toward food but avoid immediate collisions
    const dx = food.x - head.x; const dy = food.y - head.y;
    const tryDirs = [];
    if(Math.abs(dx) > Math.abs(dy)){
      tryDirs.push(dx>0? 'right' : 'left');
      if(dy!==0) tryDirs.push(dy>0? 'down' : 'up');
    } else {
      tryDirs.push(dy>0? 'down' : 'up');
      if(dx!==0) tryDirs.push(dx>0? 'right' : 'left');
    }
    ['up','down','left','right'].forEach(d=>{ if(!tryDirs.includes(d)) tryDirs.push(d)});

    const dirMap = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
    for(const ds of tryDirs){
      const d = dirMap[ds];
      if(currDir.x + d.x === 0 && currDir.y + d.y === 0) continue;
      const next = {x: head.x + d.x, y: head.y + d.y};
      if(!willCollide(next, state.snake, gridW, gridH)) return ds;
    }

    // 3) if no safe move toward food, pick any safe move
    for(const ds of ['up','left','right','down']){
      const d = dirMap[ds];
      if(currDir.x + d.x === 0 && currDir.y + d.y === 0) continue;
      const next = {x: head.x + d.x, y: head.y + d.y};
      if(!willCollide(next, state.snake, gridW, gridH)) return ds;
    }

    // 4) no safe move — return current dir
    return dirToString(currDir);
  }

  window.AI = { decide };
})();