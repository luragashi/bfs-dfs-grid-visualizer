import { cloneGrid } from './helpers.js'

export function benchmarkAlgorithm({ algoFn, grid, runs = 30, options = {} }) {
  const times = []

  for (let i = 0; i < runs; i++) {
    const input = cloneGrid(grid)

    const start = performance.now()
    algoFn(input, options)
    const end = performance.now()

    times.push(end - start)
  }

  const min = Math.min(...times)
  const max = Math.max(...times)
  const avg = times.reduce((a, b) => a + b, 0) / times.length

  return {
    runs,
    avgMs: Number(avg.toFixed(3)),
    minMs: Number(min.toFixed(3)),
    maxMs: Number(max.toFixed(3)),
  }
}