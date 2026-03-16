import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'

export default function Grid({ grid, visitedSet, islandSet, onToggleCell, disabled }) {
  const wrapRef = useRef(null)

  const rows = grid.length
  const cols = grid[0]?.length || 0

  const [cellSize, setCellSize] = useState(22)

  // Must match CSS values in grid.css
  const GAP = 2
  const PADDING = 10
  const BORDER = 2 
  const MIN_CELL = 8
  const MAX_CELL = 34

  useLayoutEffect(() => {
    if (!wrapRef.current || !rows || !cols) return

    const el = wrapRef.current

    const compute = () => {
      const rect = el.getBoundingClientRect()

      const availW = rect.width - PADDING * 2 - (cols - 1) * GAP - BORDER
      const availH = rect.height - PADDING * 2 - (rows - 1) * GAP - BORDER

      const next = Math.floor(Math.min(availW / cols, availH / rows))

      const clamped = Math.max(MIN_CELL, Math.min(MAX_CELL, next || MIN_CELL))
      setCellSize(clamped)
    }

    compute()

    const ro = new ResizeObserver(() => compute())
    ro.observe(el)

    return () => ro.disconnect()
  }, [rows, cols])

  const gridStyle = useMemo(() => {
    return {
      gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    }
  }, [rows, cols, cellSize])

  return (
    <div className="grid-wrap" ref={wrapRef}>
      <div className="grid" style={gridStyle}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`
            const isLand = cell === 1
            const isVisited = visitedSet?.has(key)
            const isIsland = islandSet?.has(key)

            const className = [
              'cell',
              isLand ? 'land' : 'water',
              isVisited ? 'visited' : '',
              isIsland && isLand ? 'island' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                key={key}
                type="button"
                className={className}
                onClick={() => onToggleCell(r, c)}
                disabled={disabled}
                aria-label={`cell-${r}-${c}`}
              />
            )
          }),
        )}
      </div>
    </div>
  )
}