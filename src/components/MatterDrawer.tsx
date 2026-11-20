import { useEffect, useRef } from 'react'
import type { AuthorityProfile, Matter } from '../types'
import Badge from './Badge'
import Icon from './icons'
import Timeline from './Timeline'

type MatterDrawerProps = {
  matter: Matter | null
  authorities: AuthorityProfile[]
  onClose: () => void
}

export default function MatterDrawer({ matter, authorities, onClose }: MatterDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!matter) return
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeButtonRef.current?.focus()

    const backgroundElements = [
      document.querySelector<HTMLElement>('.topbar'),
      document.querySelector<HTMLElement>('.sidebar'),
      document.querySelector<HTMLElement>('.main-content'),
    ].filter((element): element is HTMLElement => Boolean(element))
    const previousInert = new Map<HTMLElement, boolean>()
    const previousAriaHidden = new Map<HTMLElement, string | null>()
    backgroundElements.forEach((element) => {
      previousInert.set(element, (element as HTMLElement & { inert?: boolean }).inert ?? false)
      previousAriaHidden.set(element, element.getAttribute('aria-hidden'))
      ;(element as HTMLElement & { inert: boolean }).inert = true
      element.setAttribute('aria-hidden', 'true')
    })
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? [])
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      const activeElement = document.activeElement
      if (!drawerRef.current?.contains(activeElement)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      backgroundElements.forEach((element) => {
        ;(element as HTMLElement & { inert: boolean }).inert = previousInert.get(element) ?? false
        const ariaHidden = previousAriaHidden.get(element)
        if (ariaHidden === null || ariaHidden === undefined) element.removeAttribute('aria-hidden')
        else element.setAttribute('aria-hidden', ariaHidden)
      })
      document.body.style.overflow = previousOverflow
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [matter, onClose])

  if (!matter) return null

  const isExcluded = matter.regime !== 'ai-act'
  const supportingAuthorities = (matter.supportingAuthorities ?? []).map((authorityId) => authorities.find((authority) => authority.id === authorityId)?.name ?? authorityId)

  return (
    <div className="drawer-layer" role="presentation">
      <button className="drawer-backdrop" type="button" aria-label="Close matter details background" onClick={onClose} />
      <aside ref={drawerRef} className="matter-drawer" role="dialog" aria-modal="true" aria-labelledby="matter-drawer-title" aria-label={matter.title}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow">{isExcluded ? 'ADJACENT REGIME' : 'AI ACT MATTER'}</p>
            <h2 id="matter-drawer-title">{matter.title}</h2>
          </div>
          <button className="icon-button drawer-close" type="button" aria-label="Close matter details" ref={closeButtonRef} onClick={onClose}><Icon name="close" size={19} /></button>
        </div>

        <div className="drawer-scroll">
          <div className="drawer-badges"><Badge kind="action" value={matter.currentActionType} subtype={matter.currentActionSubtype} /><Badge kind="status" value={matter.status} /><Badge kind="regime" value={matter.regime} /></div>

          <section className="drawer-section drawer-summary">
            <p>{matter.summary}</p>
            <dl className="meta-list">
              <div><dt>监管机关</dt><dd>{matter.authorityName}</dd></div>
              <div><dt>对象 / 系统</dt><dd>{matter.subject}</dd></div>
              <div><dt>范围</dt><dd>{matter.scope}</dd></div>
              <div><dt>最后核验</dt><dd><time dateTime={matter.lastVerifiedAt}>{matter.lastVerifiedAt}</time></dd></div>
              <div><dt>时间依据</dt><dd>{matter.dateBasis === 'tracker-capture' ? 'Tracker capture · source date not shown' : 'Source publication / update date'}</dd></div>
              {supportingAuthorities.length > 0 && <div><dt>协同机关</dt><dd>{supportingAuthorities.join(' · ')}</dd></div>}
            </dl>
          </section>

          <section className={`drawer-boundary ${isExcluded ? 'drawer-boundary-excluded' : ''}`}>
            <div className="drawer-boundary-icon"><Icon name={isExcluded ? 'layers' : 'shield'} size={17} /></div>
            <div>
              <h3>{isExcluded ? '排除理由' : '收录理由'}</h3>
              <p>{isExcluded ? matter.exclusionReason : matter.inclusionNote}</p>
            </div>
          </section>

          <section className="drawer-section">
            <div className="drawer-section-heading"><h3>程序事件</h3><span>{matter.events.length} 条</span></div>
            <Timeline events={matter.events} sources={matter.sources} />
          </section>

          <section className="drawer-section">
            <div className="drawer-section-heading"><h3>法律基础</h3></div>
            <ul className="basis-list">{matter.legalBasis.map((basis) => <li key={basis}>{basis}</li>)}</ul>
          </section>

          {matter.relatedRegimes && matter.relatedRegimes.length > 0 && (
            <section className="drawer-section">
              <div className="drawer-section-heading"><h3>关联制度</h3></div>
              <div className="drawer-badges">{matter.relatedRegimes.map((regime) => <Badge kind="regime" value={regime} key={regime} />)}</div>
            </section>
          )}

          <section className="drawer-section">
            <div className="drawer-section-heading"><h3>来源</h3><span>{matter.sources.length} 个</span></div>
            <div className="source-list">
              {matter.sources.map((source) => (
                <a className="source-card" href={source.url} target="_blank" rel="noreferrer" key={source.id}>
                  <div><strong>{source.title}</strong><span>{source.publisher}</span></div>
                  <div className="source-card-meta"><Badge kind="evidence" value={source.evidenceLevel} compact /><Icon name="external-link" size={14} /></div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}
