import { useEffect, useMemo, useState } from 'react'
import AppShell from './components/AppShell'
import AboutDialog from './components/AboutDialog'
import MatterDrawer from './components/MatterDrawer'
import { authorityDirectory, authorities, seedMatters } from './data/seed'
import rawSourceSnapshot from './data/source-snapshot.json'
import { sourceRegistry } from './data/sourceRegistry'
import { filterMatters, getOverviewMetrics } from './lib/filters'
import { validateTrackerData } from './lib/dataValidation'
import { editorialReview, getReviewableMatters, getReviewSummary, validateEditorialReview } from './lib/editorialReview'
import { parseTrackerUrl, serializeTrackerUrl } from './lib/urlState'
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

  const reviewedSeedMatters = useMemo(() => getReviewableMatters(seedMatters, editorialReview), [])
  const visibleMatters = useMemo(() => filterMatters(reviewedSeedMatters, filters, includeAdjacent), [filters, includeAdjacent, reviewedSeedMatters])
  const metrics = useMemo(() => getOverviewMetrics(visibleMatters), [visibleMatters])
  const validationIssues = useMemo(() => [
    ...validateTrackerData(seedMatters, authorities, sourceRegistry),
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
    const query = serializeTrackerUrl({ page: currentPage, includeAdjacent, filters: { ...urlState.filters, ...filters } as Required<FilterState> })
    window.history.replaceState(null, '', `${window.location.pathname}${query}`)
  }, [currentPage, includeAdjacent, filters, urlState.filters])

  const handleFiltersChange = (nextFilters: FilterState) => setFilters(nextFilters)
  const handleClearFilters = () => setFilters({ search: '', authorityLane: 'all', actionType: 'all', status: 'all', memberState: 'all', regime: 'all' })
  const handleIncludeAdjacentChange = (nextIncludeAdjacent: boolean) => {
    setIncludeAdjacent(nextIncludeAdjacent)
    if (!nextIncludeAdjacent) setFilters((current) => ({ ...current, regime: 'all' }))
  }
  const handlePageChange = (page: AppPage) => {
    setCurrentPage(page)
    setSelectedMatterId(null)
  }
  const handleSearchChange = (search: string) => setFilters((current) => ({ ...current, search }))
  const hasActiveFilters = Boolean(filters.search || filters.authorityLane !== 'all' || filters.actionType !== 'all' || filters.status !== 'all' || filters.memberState !== 'all' || filters.regime !== 'all')

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
      {currentPage === 'authorities' && <AuthoritiesPage matters={reviewedSeedMatters} authorities={authorities} />}
      {currentPage === 'excluded' && <ExcludedPage matters={reviewedSeedMatters.filter((matter) => matter.regime !== 'ai-act')} onSelectMatter={setSelectedMatterId} />}
      {currentPage === 'sources' && <SourcesPage matters={seedMatters} sources={sourceRegistry} snapshot={sourceSnapshot} validationIssues={validationIssues} reviewSummary={reviewSummary} />}
      <span className="sr-only" aria-live="polite">{selectedMatter ? `已选择 ${selectedMatter.shortTitle}` : ''}</span>
    </AppShell>
  )
}
