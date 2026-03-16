import { createGrid } from './helpers.js'

export function genBestAllWater(rows, cols) {
  return createGrid(rows, cols, 0)
}

export function genBestAllLand(rows, cols) {
  return createGrid(rows, cols, 1)
}

export function genWorstCheckerboard(rows, cols) {
  const g = createGrid(rows, cols, 0)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      g[r][c] = (r + c) % 2 === 0 ? 1 : 0
    }
  }
  return g
}

