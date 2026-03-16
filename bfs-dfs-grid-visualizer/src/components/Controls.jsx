import React, { useEffect, useState } from 'react'

export default function Controls({
  rows,
  cols,
  onResize,
  onClearGrid,
  onRandomize,
  onRunDFS,
  onRunBFS,

  // generators (best/worst)
  onGenBest,
  onGenWorst,
  onGenFullTraversal,

  // benchmark
  benchmarkMode,
  setBenchmarkMode,
  benchmarkRuns,
  setBenchmarkRuns,

  // animation
  animate,
  setAnimate,
  speedMs,
  setSpeedMs,

  disabled,

  connectivity,
  setConnectivity,
}) {
  const [r, setR] = useState(rows)
  const [c, setC] = useState(cols)

  // keep local inputs in sync when grid is resized/loaded from a test-case
  useEffect(() => {
    setR(rows)
    setC(cols)
  }, [rows, cols])

  const applyResize = () => onResize(r, c)

  const hasGenerators = Boolean(onGenBest && onGenWorst && onGenFullTraversal)

  return (
    <div className="card">
      <div className="card-title">Controlls</div>

      {/* Resize */}
      <div className="section">
        <div className="row">
          <label className="label">Rows</label>
          <input
            className="input"
            type="number"
            min={5}
            max={60}
            value={r}
            onChange={(e) => setR(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="row">
          <label className="label">Cols</label>
          <input
            className="input"
            type="number"
            min={5}
            max={60}
            value={c}
            onChange={(e) => setC(e.target.value)}
            disabled={disabled}
          />
        </div>

        <button type="button" className="btn" onClick={applyResize} disabled={disabled}>
          Resize Grid
        </button>
      </div>

      {/* Quick grid actions */}
      <div className="section">
        <button type="button" className="btn" onClick={onRandomize} disabled={disabled}>
          Random (32% Land)
        </button>
        <button type="button" className="btn secondary" onClick={onClearGrid} disabled={disabled}>
          Clear
        </button>
      </div>

      {/* Best/Worst generators */}
      {hasGenerators && (
        <div className="section">
          <div className="section-title">Test Generators</div>

          <button type="button" className="btn secondary" onClick={onGenBest} disabled={disabled}>
            Best Case (All Water - 0 Islands)
          </button>

          <button type="button" className="btn secondary" onClick={onGenWorst} disabled={disabled}>
            Worst Case (Checkerboard - Many Islands)
          </button>

          <button type="button" className="btn secondary" onClick={onGenFullTraversal} disabled={disabled}>
            Best Case (All Land - 1 Island)
          </button>

          <div className="muted">
          <p></p>
          </div>
        </div>
      )}

      {/* Run */}
      <div className="section">
        <button type="button" className="btn primary" onClick={onRunDFS} disabled={disabled}>
          Run DFS
        </button>
        <button type="button" className="btn primary" onClick={onRunBFS} disabled={disabled}>
          Run BFS
        </button>
      </div>

      {/* Benchmark */}
      <div className="section">
        <div className="row">
          <label className="label">Benchmark</label>
          <input
            type="checkbox"
            checked={benchmarkMode}
            onChange={(e) => setBenchmarkMode(e.target.checked)}
            disabled={disabled}
          />
        </div>

        <div className="row">
          <label className="label">Runs</label>
          <input
            className="input"
            type="number"
            min={5}
            max={200}
            value={benchmarkRuns}
            onChange={(e) => setBenchmarkRuns(Number(e.target.value))}
            disabled={disabled || !benchmarkMode}
          />
        </div>
      </div>

      <div className="section">
  <div className="row">
    <label className="label">Connectivity</label>
    <select
      className="select"
      value={connectivity}
      onChange={(e) => setConnectivity(Number(e.target.value))}
      disabled={disabled}
    >
      <option value={4}>4-directional</option>
      <option value={8}>8-directional</option>
    </select>
  </div>
</div>

      {/* Animation */}
      <div className="section">
        <div className="row">
          <label className="label">Animate</label>
          <input
            type="checkbox"
            checked={animate}
            onChange={(e) => setAnimate(e.target.checked)}
            disabled={disabled}
          />
        </div>

        <div className="row">
          <label className="label">Speed</label>
          <input
            className="range"
            type="range"
            min={5}
            max={120}
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
            disabled={disabled || !animate}
          />
        </div>
      </div>
    </div>
  )
}