import { useEffect, useMemo, useRef, useState } from 'react'
import AppShell from './components/AppShell'
import AboutDialog from './components/AboutDialog'
import MatterDrawer from './components/MatterDrawer'
import { authorityDirectory, authorities, seedMatters } from './data/seed'
import rawSourceSnapshot from './data/source-snapshot.json'
import { sourceRegistry } from './data/sourceRegistry'
import { filterMatters, getOverviewMetrics } from './lib/filters'
import { validateTrackerData } from './lib/dataValidation'
import { editorialReview, getReviewableMatters, getReviewSummary, validateEditorialReview } from './lib/editorialReview'
import { DEFAULT_FILTERS, parseTrackerUrl, serializeTrackerUrl } from './lib/urlState'
import AuthoritiesPage from './pages/AuthoritiesPage'
import ExcludedPage from './pages/ExcludedPage'
import MattersPage from './pages/MattersPage'
import OverviewPage from './pages/OverviewPage'
import SourcesPage from './pages/SourcesPage'
import type { AppPage, FilterState } from './types'
import type { SourceRefreshSnapshot } from './types'

const sourceSnapshot = rawSourceSnapshot as SourceRefreshSnapshot

export default function App() {
  const [urlState] = useState(() => parseTrackerUrl(typeof window === 'undefined' ? '' : window.location.search))
  const [currentPage, setCurrentPage] = useState<AppPage>(urlState.page)
  const [includeAdjacent, setIncludeAdjacent] = useState(urlState.includeAdjacent)
  const [filters, setFilters] = useState<FilterState>(urlState.filters)
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const hasSyncedUrlRef = useRef(false)

  const reviewedSeedMatters = useMemo(() => getReviewableMatters(seedMatters, editorialReview), [])
  const visibleMatters = useMemo(() => filterMatters(reviewedSeedMatters, filters, includeAdjacent), [filters, includeAdjacent, reviewedSeedMatters])
  const metrics = useMemo(() => getOverviewMetrics(visibleMatters), [visibleMatters])
  const validationIssues = useMemo(() => [
    ...validateTrackerData(seedMatters, authorities, sourceRegistry, sourceSnapshot),
    ...validateEditorialReview(seedMatters, editorialReview),
  ], [])
  const reviewSummary = useMemo(() => getReviewSummary(seedMatters, editorialReview), [])
  const selectedMatter = seedMatters.find((matter) => matter.id === selectedMatterId)
  const selectedMatterIsVisible = currentPage === 'excluded'
    ? Boolean(selectedMatter && selectedMatter.regime !== 'ai-act')
    : visibleMatters.some((matter) => matter.id === selectedMatterId)

  useEffect(() => {
    if (selectedMatterId && !selectedMatterIsVisible) setSelectedMatterId(null)
  }, [selectedMatterId, selectedMatterIsVisible])

  useEffect(() => {
    const query = serializeTrackerUrl({ page: currentPage, includeAdjacent, filters: { ...DEFAULT_FILTERS, ...filters } })
    const nextUrl = `${window.location.pathname}${query}`
    const currentUrl = `${window.location.pathname}${window.location.search}`
    if (currentUrl !== nextUrl) {
      if (hasSyncedUrlRef.current) window.history.pushState(null, '', nextUrl)
      else window.history.replaceState(null, '', nextUrl)
    }
    hasSyncedUrlRef.current = true
  }, [currentPage, includeAdjacent, filters])

  useEffect(() => {
    const handlePopState = () => {
      const next = parseTrackerUrl(window.location.search)
      setCurrentPage(next.page)
      setIncludeAdjacent(next.includeAdjacent)
      setFilters(next.filters)
      setSelectedMatterId(null)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleFiltersChange = (nextFilters: FilterState) => setFilters(nextFilters)
  const handleClearFilters = () => setFilters({ ...DEFAULT_FILTERS })
  const handleIncludeAdjacentChange = (nextIncludeAdjacent: boolean) => {
    setIncludeAdjacent(nextIncludeAdjacent)
    if (!nextIncludeAdjacent) setFilters((current) => ({ ...current, regime: 'all' }))
  }
  const handlePageChange = (page: AppPage) => {
    setCurrentPage(page)
    setSelectedMatterId(null)
  }
  const handleAuthoritySelect = (authorityId: string) => {
    const authority = authorities.find((candidate) => candidate.id === authorityId)
    const directoryAuthority = authorityDirectory.find((candidate) => candidate.id === authorityId)
    setIncludeAdjacent(false)
    setFilters({ ...DEFAULT_FILTERS, authorityLane: authority?.lane ?? 'all', memberState: directoryAuthority?.country ?? 'all' })
    handlePageChange('matters')
  }
  const handleSearchChange = (search: string) => setFilters((current) => ({ ...current, search }))
  const hasActiveFilters = Boolean(filters.search || filters.authorityLane !== 'all' || filters.actionType !== 'all' || filters.actionSubtype !== 'all' || filters.actionHistory !== 'all' || filters.status !== 'all' || filters.memberState !== 'all' || filters.regime !== 'all' || filters.scope !== 'all' || filters.evidenceLevel !== 'all')

  return (
    <AppShell
      currentPage={currentPage}
      search={filters.search}
      includeAdjacent={includeAdjacent}
      onNavigate={handlePageChange}
      onSearchChange={handleSearchChange}
      onIncludeAdjacentChange={handleIncludeAdjacentChange}
      onOpenAbout={() => setAboutOpen(true)}
      overlay={<><MatterDrawer matter={selectedMatterIsVisible ? selectedMatter ?? null : null} authorities={authorities} onClose={() => setSelectedMatterId(null)} /><AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} /></>}
    >
      {currentPage === 'overview' && <OverviewPage matters={visibleMatters} authorities={authorities} metrics={metrics} onSelectMatter={setSelectedMatterId} hasActiveFilters={hasActiveFilters} onClearFilters={handleClearFilters} onOpenMatters={() => handlePageChange('matters')} />}
      {currentPage === 'matters' && <MattersPage matters={visibleMatters} filters={filters} includeAdjacent={includeAdjacent} memberStates={authorityDirectory.map((authority) => authority.country)} onFiltersChange={handleFiltersChange} onClearFilters={handleClearFilters} onSelectMatter={setSelectedMatterId} />}
      {currentPage === 'authorities' && <AuthoritiesPage matters={reviewedSeedMatters} authorities={authorities} onSelectAuthority={handleAuthoritySelect} />}
      {currentPage === 'excluded' && <ExcludedPage matters={reviewedSeedMatters.filter((matter) => matter.regime !== 'ai-act')} onSelectMatter={setSelectedMatterId} />}
      {currentPage === 'sources' && <SourcesPage matters={seedMatters} sources={sourceRegistry} snapshot={sourceSnapshot} validationIssues={validationIssues} reviewSummary={reviewSummary} />}
      <span className="sr-only" aria-live="polite">{selectedMatter ? `已选择 ${selectedMatter.shortTitle}` : ''}</span>
    </AppShell>
  )
}
