import React from 'react'

export default function ResultsTable({ results, downloadHref, downloadName, onClear }) {
  const hasResults = results.length > 0

  return (
    <div className="card">
      <div className="card-title">Results</div>

      <div className="results-actions">
        <a
          className={`btn ${!hasResults ? 'disabled-link' : ''}`}
          href={!hasResults ? undefined : downloadHref}
          download={downloadName}
          onClick={(e) => {
            if (!hasResults) e.preventDefault()
          }}
        >
          Download CSV
        </a>

        <button
          type="button"
          className="btn secondary"
          onClick={onClear}
          disabled={!hasResults}
        >
          Clear Results
        </button>
      </div>

      <div className="muted">
        {hasResults ? `Saved runs: ${results.length}` : 'No saved runs yet. Run BFS/DFS to generate results.'}
      </div>
    </div>
  )
}