import type { ReactNode } from 'react'
import './StatePanel.css'

interface StatePanelProps {
  title: string
  children?: ReactNode
  /** A button or link, e.g. Retry or Clear search. */
  action?: ReactNode
}

/** Dashed box for "nothing here" messages. */
export function EmptyState({ title, children, action }: StatePanelProps) {
  return (
    <div className="state-panel">
      <strong className="state-panel__title">{title}</strong>
      {children && <p className="state-panel__text">{children}</p>}
      {action}
    </div>
  )
}

/** Red box for a failed request, announced to screen readers. */
export function ErrorState({ title, children, action }: StatePanelProps) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <strong className="state-panel__title">{title}</strong>
      {children && <p className="state-panel__text">{children}</p>}
      {action}
    </div>
  )
}
