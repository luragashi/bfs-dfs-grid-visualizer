import React from 'react'

export default function Metrics({
  algo,
  islands,
  visited,
  runtimeMs,
  landCells,
  rows,
  cols,
  isAnimating,

  benchmarkMode,
  benchmarkStats,
}) {
  const runtimeLabel = benchmarkMode && benchmarkStats
    ? `${benchmarkStats.avgMs} ms (avg)`
    : runtimeMs
      ? `${runtimeMs} ms`
      : '-'

  return (
    <div className="card">
      <div className="card-title">Metrics</div>

      <div className="metrics">
        <div className="metric">
          <div className="metric-label">Algorithm</div>
          <div className="metric-value">{algo || '-'}</div>
        </div>

        <div className="metric">
          <div className="metric-label">Grid Size</div>
          <div className="metric-value">
            {rows} × {cols}
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">Land Cells</div>
          <div className="metric-value">{landCells}</div>
        </div>

        <div className="metric">
          <div className="metric-label">Islands</div>
          <div className="metric-value">{islands}</div>
        </div>

        <div className="metric">
          <div className="metric-label">Visited Cells</div>
          <div className="metric-value">{visited}</div>
        </div>

        <div className="metric">
          <div className="metric-label">Runtime</div>
          <div className="metric-value">{runtimeLabel}</div>
        </div>
      </div>
    </div>
  )
}