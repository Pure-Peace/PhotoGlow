import { api } from '@/api'
import { SearchPage } from '@/components/search/search-page'

export async function generateMetadata() {
  return {
    title: 'Search | PhotoGlow',
    description: 'Search for photos, people and tags on PhotoGlow',
  }
}

export default async function SearchPageWithData({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  // Only fetch initial results if there's a search query
  const { q } = await searchParams
  const initialResults = q
    ? {
        query: q,
        loading: false,
        hasSearched: true,
        ...(await api.search(q)),
      }
    : null

  return <SearchPage initialResults={initialResults} />
}
