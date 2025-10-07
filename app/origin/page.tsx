'use client'

import { Aggregation } from '@/components/Aggregation'
import { useEventStore } from '@/lib/store'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function Home() {
  const {
    loading,
    fetchItems,
  } = useEventStore()

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const { t } = useTranslation();

  // Filtered events for display (currently unused in this page)
  // const filteredEvents = useMemo(() => {
  //   let results: FlatEvent[]

  //   if (searchQuery.trim() && fuse) {
  //     results = fuse.search(searchQuery.trim()).map(result => result.item)
  //   } else {
  //     results = flatEvents
  //   }

  //   return results
  //     .filter(({ item, event }) => {
  //       if (showOnlyFavorites && !favorites.includes(`${event.id}`)) return false
  //       if (selectedCategory && item.category !== selectedCategory) return false
  //       if (selectedTags.length > 0 && !selectedTags.some(tag => item.tags.includes(tag))) return false
  //       if (selectedLocations.length > 0 && !selectedLocations.includes(event.place)) return false
  //       return true
  //     })
  //     .sort((a, b) => {
  //       const aEnded = a.timeRemaining < 0
  //       const bEnded = b.timeRemaining < 0

  //       if (aEnded && !bEnded) return 1
  //       if (!aEnded && bEnded) return -1
  //       if (aEnded && bEnded) return b.timeRemaining - a.timeRemaining

  //       return a.timeRemaining - b.timeRemaining
  //     })
  // }, [flatEvents, searchQuery, fuse, selectedCategory, selectedTags, selectedLocations, favorites, showOnlyFavorites]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{t("events.loading")}</p>
        </div>
      </div>
    )
  }


  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900/40 to-slate-200/10
             bg-[url('/bg.jpg')] bg-cover bg-center"
    >
      {/* Center column with a constrained max width */}
      <div className="w-full max-w-4xl px-6 py-24 flex flex-col items-center">
        {/* Title */}
        <header className="text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight tracking-tighter">
            GOODACTION HUB
          </h1>
          <div className="mt-3 text-2xl md:text-3xl text-white/90">益 行</div>
        </header>

        <Aggregation />
        {/* Footer description */}
        <footer className="mt-14 text-center max-w-2xl">
          <p className="text-white/80 text-base md:text-lg italic">
            GoodAction Hub helps you discover the world&apos;s best free opportunities — powered by AI, open to all.
          </p>
        </footer>
      </div>
    </div>
  )
}
