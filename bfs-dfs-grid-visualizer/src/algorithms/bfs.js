import { getNeighbors } from './helpers.js'

export function runBFSIslands(grid, options = {}) {
  const { recordOrder = true, collectIslandCells = true, connectivity = 4 } = options

  const rows = grid.length
  const cols = grid[0].length
  const visited = Array.from({ length: rows }, () => Array.from({ length: cols }, () => false))

  const visitedOrder = recordOrder ? [] : null
  const islandCellsSet = collectIslandCells ? new Set() : null

  
  let islandCount = 0

  const bfs = (sr, sc) => {
    const q = []
    let head = 0

    q.push({ r: sr, c: sc })
    visited[sr][sc] = true

    while (head < q.length) {
      const { r, c } = q[head++]

      if (recordOrder) visitedOrder.push({ r, c })
      if (collectIslandCells) islandCellsSet.add(`${r},${c}`)

      for (const nb of getNeighbors(grid, r, c, connectivity)) {
        if (!visited[nb.r][nb.c] && grid[nb.r][nb.c] === 1) {
          visited[nb.r][nb.c] = true
          q.push(nb)
        }
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1 && !visited[r][c]) {
        islandCount++
        bfs(r, c)
      }
    }
  }

  return {
    islandCount,
    visitedOrder: visitedOrder || [],
    islandCellsSet: islandCellsSet || new Set(),
  }
}