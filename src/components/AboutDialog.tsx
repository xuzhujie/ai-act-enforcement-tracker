import { useEffect, useRef } from 'react'
import Icon from './icons'

type AboutDialogProps = {
  open: boolean
  onClose: () => void
}

export default function AboutDialog({ open, onClose }: AboutDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="about-layer" role="presentation">
      <button className="about-backdrop" type="button" aria-label="Close about background" onClick={onClose} />
      <section className="about-dialog" role="dialog" aria-modal="true" aria-label="About AI Act tracker">
        <div className="about-dialog-header">
          <div><p className="eyebrow">ABOUT / SCOPE</p><h2 id="about-dialog-title">AI Act tracker</h2></div>
          <button className="icon-button" type="button" aria-label="Close about" ref={closeRef} onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <div className="about-dialog-body">
          <p>本 tracker 只把明确以 AI Act 为主要法律基础的实施、调查、整改和处罚记录纳入 AI Act KPI。</p>
          <p>涉及 AI 的 GDPR、消费者保护、DMA 和 DSA 案件保留在相邻制度视图中，不计入 AI Act 执法统计。</p>
          <div className="about-boundary"><Icon name="shield" size={17} /><span>日期依据、证据等级和原始来源都保留在事项详情与来源页。</span></div>
        </div>
      </section>
    </div>
  )
}
