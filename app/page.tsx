'use client'

import { EventCard } from '@/components/EventCard'
import { FilterBar } from '@/components/FilterBar'
import { SwitchLanguage } from '@/components/SwitchLanguage'
import { DeadlineItem, EventData } from '@/lib/data'
import { useEventStore } from '@/lib/store'
import Fuse from 'fuse.js'
import { Calendar } from 'lucide-react'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface FlatEvent {
  item: DeadlineItem
  event: EventData
  nextDeadline: DateTime
  timeRemaining: number
}

export default function Home() {
  const {
    items,
    loading,
    fetchItems,
    selectedCategory,
    selectedTags,
    selectedLocations,
    searchQuery,
    favorites,
    showOnlyFavorites,
  } = useEventStore()

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const { t } = useTranslation();

  const flatEvents: FlatEvent[] = useMemo(() => items.flatMap(item =>
    item.events.map(event => {
      const now = DateTime.now().setZone("Asia/Shanghai")
      const upcomingDeadlines = event.timeline
        .map(t => DateTime.fromISO(t.deadline, { zone: event.timezone }))
        .filter(d => d > now)
        .sort((a, b) => a.toMillis() - b.toMillis())

      const nextDeadline = upcomingDeadlines[0] ||
        DateTime.fromISO(event.timeline[event.timeline.length - 1].deadline, { zone: event.timezone })
      const timeRemaining = nextDeadline.toMillis() - now.toMillis()

      return { item, event, nextDeadline, timeRemaining }
    })
  ), [items])

  const fuse = useMemo(() => {
    return new Fuse(flatEvents, {
      keys: ['item.title', 'item.description', 'item.tags', 'event.place'],
      threshold: 0.3,
    })
  }, [flatEvents])

  const filteredEvents = useMemo(() => {
    let results: FlatEvent[]

    if (searchQuery.trim() && fuse) {
      results = fuse.search(searchQuery.trim()).map(result => result.item)
    } else {
      results = flatEvents
    }

    return results
      .filter(({ item, event }) => {
        if (showOnlyFavorites && !favorites.includes(`${event.id}`)) return false
        if (selectedCategory && item.category !== selectedCategory) return false
        if (selectedTags.length > 0 && !selectedTags.some(tag => item.tags.includes(tag))) return false
        if (selectedLocations.length > 0 && !selectedLocations.includes(event.place)) return false
        return true
      })
      .sort((a, b) => {
        const aEnded = a.timeRemaining < 0
        const bEnded = b.timeRemaining < 0

        if (aEnded && !bEnded) return 1
        if (!aEnded && bEnded) return -1
        if (aEnded && bEnded) return b.timeRemaining - a.timeRemaining

        return a.timeRemaining - b.timeRemaining
      })
  }, [flatEvents, searchQuery, fuse, selectedCategory, selectedTags, selectedLocations, favorites, showOnlyFavorites]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 bg-[url('/bg.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="container mx-auto px-4 py-8">

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <FilterBar />
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.map(({ item, event }) => (
            <EventCard
              key={`${event.id}`}
              item={item}
              event={event}
            />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{t("events.notFound")}</h3>
            <p className="text-slate-600">
              {t("events.hint")}
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-slate-600">
          <p className="text-sm">
            {t("acknowledgments.stack")}
          </p>
          <p className="text-sm">{' '}
            <Link
              href="https://github.com/inscripoem"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {t("acknowledgments.contributor")}
            </Link>
            {' '} {t("acknowledgments.develop")}
            {' '} • {' '}
            <Link
              href="https://hust.openatom.club"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {t("acknowledgments.organization")}
            </Link>
            {' '}{t("acknowledgments.support")}
          </p>
        </footer>

      </div>
    </div>
  )
}
