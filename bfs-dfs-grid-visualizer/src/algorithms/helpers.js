export function createGrid(rows, cols, fillValue = 0) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fillValue))
}

export function cloneGrid(grid) {
  return grid.map(row => row.slice())
}

export function inBounds(grid, r, c) {
  return r >= 0 && c >= 0 && r < grid.length && c < grid[0].length
}

export function getNeighbors4(grid, r, c) {
  const dirs = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
  ]
  const out = []
  for (const [dr, dc] of dirs) {
    const nr = r + dr
    const nc = c + dc
    if (inBounds(grid, nr, nc)) out.push({ r: nr, c: nc })
  }
  return out
}

export function getNeighbors8(grid, r, c) {
  const rows = grid.length
  const cols = grid[0].length

  const out = []

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        out.push({ r: nr, c: nc })
      }
    }
  }

  return out
}

// choose 4-dir or 8-dir
export function getNeighbors(grid, r, c, connectivity = 4) {
  return connectivity === 8 ? getNeighbors8(grid, r, c) : getNeighbors4(grid, r, c)
}

export function toggleCell(grid, r, c) {
  const next = cloneGrid(grid)
  next[r][c] = next[r][c] === 1 ? 0 : 1
  return next
}

export function countLandCells(grid) {
  let count = 0
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === 1) count++
    }
  }
  return count
}