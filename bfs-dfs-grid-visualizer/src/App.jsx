import React, { useEffect, useMemo, useState } from 'react'
import Grid from './components/Grid.jsx'
import Controls from './components/Controls.jsx'
import Metrics from './components/Metrics.jsx'
import ResultsTable from './components/ResultsTable.jsx'

import { createGrid, cloneGrid, toggleCell, countLandCells } from './algorithms/helpers.js'
import { runDFSIslands } from './algorithms/dfs.js'
import { runBFSIslands } from './algorithms/bfs.js'
import { benchmarkAlgorithm } from './algorithms/benchmark.js'
import { genBestAllWater, genWorstCheckerboard, genBestAllLand} from './algorithms/generators.js'

const DEFAULT_ROWS = 20
const DEFAULT_COLS = 20
const DEFAULT_BENCH_RUNS = 30

function formatTimeHHMM() {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function toCSV(rows) {
  const header = [
    'index',
    'time',
    'algorithm',
    'grid',
    'landCells',
    'islands',
    'visited',
    'runtime',
  ]
  const lines = [header.join(',')]

  rows.forEach((r, i) => {
    const line = [
      i + 1,
      r.time,
      r.algorithm,
      r.grid,
      r.landCells,
      r.islands,
      r.visited,
      `"${r.runtime}"`,
    ]
    lines.push(line.join(','))
  })

  return lines.join('\n')
}

export default function App() {
  const [rows, setRows] = useState(DEFAULT_ROWS)
  const [cols, setCols] = useState(DEFAULT_COLS)

  const [grid, setGrid] = useState(() => createGrid(DEFAULT_ROWS, DEFAULT_COLS, 0))
  const [visitedSet, setVisitedSet] = useState(() => new Set())
  const [islandSet, setIslandSet] = useState(() => new Set())

  const [algo, setAlgo] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animate, setAnimate] = useState(true)
  const [speedMs, setSpeedMs] = useState(25)

  // Benchmark mode
  const [benchmarkMode, setBenchmarkMode] = useState(true)
  const [benchmarkRuns, setBenchmarkRuns] = useState(DEFAULT_BENCH_RUNS)
  const [benchmarkStats, setBenchmarkStats] = useState(null)

  // Results history
  const [results, setResults] = useState([])

  const [connectivity, setConnectivity] = useState(4)
  const [downloadHref, setDownloadHref] = useState('')

  const [showHelp, setShowHelp] = useState(false);

  // Theme state
  const [theme, setTheme] = useState('light')

  // Toggle theme funksioni
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const [metrics, setMetrics] = useState({
    islands: 0,
    visited: 0,
    runtimeMs: 0,
    landCells: 0,
  })

  const downloadName = useMemo(
    () => `bfs-dfs-results-${new Date().toISOString().slice(0, 10)}.csv`,
    []
  )

  const canInteract = !isAnimating

  const summary = useMemo(() => {
    return {
      rows,
      cols,
      landCells: countLandCells(grid),
    }
  }, [rows, cols, grid])

  // Vendos klasën theme në <html> element
  useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

  const clearHighlights = () => {
    setVisitedSet(new Set())
    setIslandSet(new Set())
    setAlgo(null)
    setIsAnimating(false)
  }

  const onToggleCell = (r, c) => {
    if (!canInteract) return
    setGrid(prev => toggleCell(prev, r, c))
  }

  const onClearGrid = () => {
    if (!canInteract) return
    setGrid(createGrid(rows, cols, 0))
    clearHighlights()
    setMetrics({ islands: 0, visited: 0, runtimeMs: 0, landCells: 0 })
    setBenchmarkStats(null)
  }

  const onRandomize = () => {
    if (!canInteract) return
    const density = 0.32
    const next = createGrid(rows, cols, 0).map(row =>
      row.map(() => (Math.random() < density ? 1 : 0)),
    )
    setGrid(next)
    clearHighlights()
    setBenchmarkStats(null)
  }

  const onResize = (newRows, newCols) => {
    if (!canInteract) return
    const r = Math.max(5, Math.min(60, Number(newRows) || DEFAULT_ROWS))
    const c = Math.max(5, Math.min(60, Number(newCols) || DEFAULT_COLS))
    setRows(r)
    setCols(c)
    setGrid(createGrid(r, c, 0))
    clearHighlights()
    setBenchmarkStats(null)
  }

  const animateVisited = async (visitedOrder, islandCellsSet) => {
    setIsAnimating(true)
    setVisitedSet(new Set())
    setIslandSet(islandCellsSet || new Set())

    if (!animate) {
      const instant = new Set()
      for (const p of visitedOrder) instant.add(`${p.r},${p.c}`)
      setVisitedSet(instant)
      setIsAnimating(false)
      return
    }

    const visited = new Set()
    let i = 0

    await new Promise(resolve => {
      const tick = () => {
        const batch = Math.max(1, Math.floor(50 / Math.max(5, speedMs)))
        for (let k = 0; k < batch && i < visitedOrder.length; k++, i++) {
          const { r, c } = visitedOrder[i]
          visited.add(`${r},${c}`)
        }
        setVisitedSet(new Set(visited))

        if (i >= visitedOrder.length) resolve()
        else setTimeout(tick, speedMs)
      }
      tick()
    })

    setIsAnimating(false)
  }

  const addResultRow = ({ algorithm, islands, visited, landCells, runtimeText }) => {
    const row = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      time: formatTimeHHMM(),
      algorithm,
      grid: `${rows}x${cols}`,
      landCells,
      islands,
      visited,
      runtime: runtimeText,
    }
    setResults(prev => [row, ...prev].slice(0, 50))
  }

  const onClearResults = () => setResults([])

  const run = async (which) => {
    if (!canInteract) return

    clearHighlights()
    setAlgo(which)

    const algoFn = which === 'DFS' ? runDFSIslands : runBFSIslands

    const inputVis = cloneGrid(grid)
    const start = performance.now()
    const visResult = algoFn(inputVis, { recordOrder: true, collectIslandCells: true, connectivity })
    const end = performance.now()
    const singleRuntimeMs = Number((end - start).toFixed(3))

    let stats = null
    if (benchmarkMode) {
      const safeRuns = Math.max(5, Math.min(200, Number(benchmarkRuns) || DEFAULT_BENCH_RUNS))
      stats = benchmarkAlgorithm({
        algoFn,
        grid,
        runs: safeRuns,
        options: { recordOrder: false, collectIslandCells: false, connectivity },
      })
      setBenchmarkStats(stats)
    } else {
      setBenchmarkStats(null)
    }

    setMetrics({
      islands: visResult.islandCount,
      visited: visResult.visitedOrder.length,
      runtimeMs: singleRuntimeMs,
      landCells: summary.landCells,
    })

    const runtimeText = benchmarkMode && stats
      ? `${stats.avgMs} ms avg (min ${stats.minMs}, max ${stats.maxMs}, runs ${stats.runs})`
      : `${singleRuntimeMs} ms`

    addResultRow({
      algorithm: which,
      islands: visResult.islandCount,
      visited: visResult.visitedOrder.length,
      landCells: summary.landCells,
      runtimeText,
    })

    await animateVisited(visResult.visitedOrder, visResult.islandCellsSet)
  }

  const onGenBest = () => {
    if (!canInteract) return
    setGrid(genBestAllWater(rows, cols))
    clearHighlights()
    setBenchmarkStats(null)
  }

  const onGenWorst = () => {
    if (!canInteract) return
    setGrid(genWorstCheckerboard(rows, cols))
    clearHighlights()
    setBenchmarkStats(null)
  }

  const onGenFullTraversal = () => {
    if (!canInteract) return
    setGrid(genBestAllLand(rows, cols))   
    clearHighlights()
    setBenchmarkStats(null)
  }

  useEffect(() => {
    setDownloadHref(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })

    if (!results || results.length === 0) return

    const csv = toCSV(results.slice().reverse())
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    setDownloadHref(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [results])

  return (
    <div className={`app ${theme}`}>
      <header className="header">
        <div className="header-left">
          <h1 className="title">BFS vs DFS — Grid Graph Visualizer</h1>
        </div>

        <div className="header-right">
          {/* Theme Toggle Button */}
          <button 
            className="btn theme-btn"
            onClick={toggleTheme}
            title="Ndrysho në Light/Dark Mode"
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* Help Button */}
          <button 
            className="btn help-btn"
            onClick={() => setShowHelp(true)}
            title="Ndihmë / Info"
          >
            ❓ Help
          </button>

{showHelp && (
  <div className="help-modal-overlay" onClick={() => setShowHelp(false)}>
    <div className="help-modal" onClick={e => e.stopPropagation()}>
      <div className="help-header">
        <h2>BFS vs DFS Visualizer</h2>
        <p className="help-subtitle">Krahasimi vizual i dy algoritmeve klasike të kërkimit në graf</p>
      </div>

      <div className="help-content">
        <div className="help-section">
          <h3>Si ta përdorni</h3>
          <p>Krijoni ose modifikoni grid-in dhe shikoni si BFS dhe DFS gjejnë ishujt (grupe të lidhura të tokës).</p>
        </div>

        <div className="help-section">
          <h3>Resize Grid</h3>
          <p>Vendosni numrin e rreshtave dhe kolonave (5–60) dhe klikoni “Resize Grid” për të krijuar një fushë të re.</p>
        </div>

        <div className="help-section">
          <h3>Controls kryesore</h3>
          <ul>
            <li><strong>Random (32% Land)</strong> – Gjeneron tokë të rastësishme</li>
            <li><strong>Clear</strong> – Fshin gjithçka (vetëm ujë)</li>
          </ul>
        </div>

        <div className="help-section">
          <h3>Test Generators</h3>
          <ul>
            <li>All Water → 0 ishuj (rast minimal)</li>
            <li>Checkerboard → shumë ishuj të vegjël (worst-case)</li>
            <li>All Land → 1 ishull i madh (traversal i plotë) </li>
          </ul>
        </div>

        <div className="help-section">
          <h3>Connectivity</h3>
          <ul>
            <li>4-directional – vetëm drejtimet kryesore (lart, posht, majtas, djathtas)</li>
            <li>8-directional – me diagonale</li>
          </ul>
        </div>

        <div className="help-section">
          <h3>Animate & Speed</h3>
          <p>Shfaq rendin e vizitës hap pas hapi. Rregulloni shpejtësinë me slider-in.</p>
        </div>

        <div className="help-section">
          <h3>Benchmark</h3>
          <p>Mat kohën mesatare të ekzekutimit në numrin e runs që zgjedhni. Rezultatet ruhen në tabelë dhe shkarkohen si CSV.</p>
        </div>


      </div>

      <div className="help-footer">
        <p>Krahasojini algoritmet dhe eksploroni!</p>
        <button className="btn primary" onClick={() => setShowHelp(false)}>
          Mbyll
        </button>
      </div>
    </div>
  </div>
)}
        </div>
      </header>

      <div className="layout">
        <aside className="panel">
          <Controls
            rows={rows}
            cols={cols}
            onResize={onResize}
            onClearGrid={onClearGrid}
            onRandomize={onRandomize}
            onRunDFS={() => run('DFS')}
            onRunBFS={() => run('BFS')}
            benchmarkMode={benchmarkMode}
            setBenchmarkMode={setBenchmarkMode}
            benchmarkRuns={benchmarkRuns}
            setBenchmarkRuns={setBenchmarkRuns}
            animate={animate}
            setAnimate={setAnimate}
            speedMs={speedMs}
            setSpeedMs={setSpeedMs}
            disabled={!canInteract}
            onGenBest={onGenBest}
            onGenWorst={onGenWorst}
            onGenFullTraversal={onGenFullTraversal}
            connectivity={connectivity}
            setConnectivity={setConnectivity}
          />

          <Metrics
            algo={algo}
            islands={metrics.islands}
            visited={metrics.visited}
            runtimeMs={metrics.runtimeMs}
            landCells={metrics.landCells}
            rows={rows}
            cols={cols}
            isAnimating={isAnimating}
            benchmarkMode={benchmarkMode}
            benchmarkStats={benchmarkStats}
          />

          <ResultsTable
            results={results}
            downloadHref={downloadHref}
            downloadName={downloadName}
            onClear={onClearResults}
          />
        </aside>

        <main className="main">
          <Grid
            grid={grid}
            visitedSet={visitedSet}
            islandSet={islandSet}
            onToggleCell={onToggleCell}
            disabled={!canInteract}
          />
        </main>
      </div>

      <footer className="footer">
        <span></span>
      </footer>
    </div>
  )
}