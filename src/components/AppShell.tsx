import type { ReactNode } from 'react'
import type { AppPage } from '../types'
import Icon from './icons'

type AppShellProps = {
  currentPage: AppPage
  search: string
  includeAdjacent: boolean
  onNavigate: (page: AppPage) => void
  onSearchChange: (value: string) => void
  onIncludeAdjacentChange: (value: boolean) => void
  onOpenAbout?: () => void
  children: ReactNode
  overlay?: ReactNode
}

const navigation: Array<{ page: AppPage; label: string; icon: 'home' | 'grid' | 'building' | 'layers' | 'file' }> = [
  { page: 'overview', label: '概览', icon: 'home' },
  { page: 'matters', label: '事项', icon: 'grid' },
  { page: 'authorities', label: '监管机关', icon: 'building' },
  { page: 'excluded', label: '排除项', icon: 'layers' },
  { page: 'sources', label: '来源', icon: 'file' },
]

export default function AppShell({
  currentPage,
  search,
  includeAdjacent,
  onNavigate,
  onSearchChange,
  onIncludeAdjacentChange,
  onOpenAbout = () => undefined,
  children,
  overlay,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">跳转到主要内容</a>
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true"><Icon name="spark" size={18} /></div>
          <span className="brand-name">AI Act tracker</span>
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-context">EU AI Act 执法台账</span>
        </div>
        <div className="topbar-tools">
          <label className="scope-toggle">
            <input
              type="checkbox"
              checked={!includeAdjacent}
              onChange={(event) => onIncludeAdjacentChange(!event.target.checked)}
            />
            <span className="scope-toggle-track" aria-hidden="true"><span /></span>
            <span>AI Act only</span>
          </label>
          <button className="icon-button topbar-info" type="button" aria-label="About AI Act tracker" title="关于本 tracker" onClick={onOpenAbout}>
            <Icon name="info" size={18} />
          </button>
          <label className="search-field">
            <Icon name="search" size={17} />
            <span className="sr-only">Search matters, authorities, sources</span>
            <input
              type="search"
              aria-label="Search matters, authorities, sources"
              placeholder="搜索事项、机关、来源…"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>
        </div>
      </header>

      <div className="app-body">
        <nav className="sidebar" aria-label="Primary navigation">
          <div className="sidebar-label">工作台</div>
          <div className="nav-list">
            {navigation.map((item) => (
              <button
                className={`nav-item ${currentPage === item.page ? 'nav-item-active' : ''}`}
                type="button"
                key={item.page}
                aria-current={currentPage === item.page ? 'page' : undefined}
                onClick={() => onNavigate(item.page)}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="sidebar-footnote">
            <Icon name="shield" size={16} />
            <span>默认只统计 AI Act</span>
          </div>
        </nav>
        <main id="main-content" className="main-content">{children}</main>
        {overlay}
      </div>
    </div>
  )
}
