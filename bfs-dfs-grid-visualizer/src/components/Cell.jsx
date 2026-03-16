import React from 'react'

export default function Cell({ value, visited, inIsland, onToggle, disabled }) {
  const isLand = value === 1

  let className = 'cell'
  if (isLand) className += ' land'
  else className += ' water'

  // Visited highlight (during traversal)
  if (visited) className += ' visited'

  // Optional: mark all land cells that belong to any island
  if (inIsland && isLand) className += ' island'

  return (
    <button
      type="button"
      className={className}
      onClick={onToggle}
      disabled={disabled}
      aria-label={isLand ? 'Land cell' : 'Water cell'}
    />
  )
}