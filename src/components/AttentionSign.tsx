import { AlertTriangle } from 'lucide-react'

export function AttentionSign({ text }: { text: string }) {
  return (
    <div className="attention-sign">
      <AlertTriangle className="attention-sign-icon" aria-hidden="true" />
      <span className="attention-sign-text">{text}</span>
    </div>
  )
}
