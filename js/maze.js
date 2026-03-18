// maze.js — Maze generation and wall collision
// No dependencies beyond basic math

// Maze generation using recursive backtracking
function generateMaze(cols, rows) {
  // Each cell: { top, right, bottom, left } — true = wall exists
  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = { top: true, right: true, bottom: true, left: true, visited: false };
    }
  }
  const stack = [];
  let cur = { r: 0, c: 0 };
  grid[0][0].visited = true;
  stack.push(cur);

  while (stack.length > 0) {
    const { r, c } = cur;
    // Find unvisited neighbors
    const neighbors = [];
    if (r > 0 && !grid[r-1][c].visited) neighbors.push({ r: r-1, c, dir: 'top' });
    if (r < rows-1 && !grid[r+1][c].visited) neighbors.push({ r: r+1, c, dir: 'bottom' });
    if (c > 0 && !grid[r][c-1].visited) neighbors.push({ r, c: c-1, dir: 'left' });
    if (c < cols-1 && !grid[r][c+1].visited) neighbors.push({ r, c: c+1, dir: 'right' });

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      // Remove wall between cur and next
      if (next.dir === 'top')    { grid[r][c].top = false; grid[next.r][next.c].bottom = false; }
      if (next.dir === 'bottom') { grid[r][c].bottom = false; grid[next.r][next.c].top = false; }
      if (next.dir === 'left')   { grid[r][c].left = false; grid[next.r][next.c].right = false; }
      if (next.dir === 'right')  { grid[r][c].right = false; grid[next.r][next.c].left = false; }
      grid[next.r][next.c].visited = true;
      stack.push(cur);
      cur = next;
    } else {
      cur = stack.pop();
    }
  }

  // Remove a few extra walls to make it more open and less frustrating
  const removals = Math.floor(cols * rows * 0.12);
  for (let i = 0; i < removals; i++) {
    const rr = Math.floor(Math.random() * rows);
    const cc = Math.floor(Math.random() * cols);
    const dir = ['top','right','bottom','left'][Math.floor(Math.random() * 4)];
    if (dir === 'top' && rr > 0) { grid[rr][cc].top = false; grid[rr-1][cc].bottom = false; }
    if (dir === 'bottom' && rr < rows-1) { grid[rr][cc].bottom = false; grid[rr+1][cc].top = false; }
    if (dir === 'left' && cc > 0) { grid[rr][cc].left = false; grid[rr][cc-1].right = false; }
    if (dir === 'right' && cc < cols-1) { grid[rr][cc].right = false; grid[rr][cc+1].left = false; }
  }

  return grid;
}

// Convert maze grid to wall segments for collision
function getMazeWalls(maze, cols, rows, cs, ox, oy) {
  const walls = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ox + c * cs;
      const y = oy + r * cs;
      if (maze[r][c].top)    walls.push({ x1: x, y1: y, x2: x + cs, y2: y });
      if (maze[r][c].left)   walls.push({ x1: x, y1: y, x2: x, y2: y + cs });
      // Right edge
      if (c === cols - 1 && maze[r][c].right) walls.push({ x1: x + cs, y1: y, x2: x + cs, y2: y + cs });
      // Bottom edge
      if (r === rows - 1 && maze[r][c].bottom) walls.push({ x1: x, y1: y + cs, x2: x + cs, y2: y + cs });
    }
  }
  return walls;
}

// Check circle vs line segment collision, return push-out vector
function circleVsSegment(cx, cy, rad, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = ((cx - x1) * dx + (cy - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;
  const distX = cx - closestX, distY = cy - closestY;
  const dist = Math.hypot(distX, distY);
  if (dist < rad && dist > 0.001) {
    const push = rad - dist;
    return { x: (distX / dist) * push, y: (distY / dist) * push };
  }
  return null;
}

function resolveWallCollisions(px, py, rad, walls) {
  let x = px, y = py;
  for (const wall of walls) {
    const push = circleVsSegment(x, y, rad, wall.x1, wall.y1, wall.x2, wall.y2);
    if (push) { x += push.x; y += push.y; }
  }
  return { x, y };
}
