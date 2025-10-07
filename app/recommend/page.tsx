'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, Suspense } from 'react'
import { DateTime } from 'luxon'
import { EventCard } from '@/components/EventCard'
import Fuse from 'fuse.js'

export interface TimelineEvent {
  deadline: string
  comment: string
}

export interface EventData {
  year: number
  id: string
  link: string
  timeline: TimelineEvent[]
  timezone: string
  date: string
  place: string
}

export interface DeadlineItem {
  title: string
  description: string
  category: 'conference' | 'competition' | 'activity'
  tags: string[]
  events: EventData[]
}

export interface FlatEvent {
  item: DeadlineItem
  event: EventData
  nextDeadline: DateTime
  timeRemaining: number
}

async function getData(): Promise<DeadlineItem[]> {
  const res = await fetch('/api/data')
  if (!res.ok) {
    throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`)
  }
  const data = (await res.json()) as DeadlineItem[]
  return data
}

function RecommendPageContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('query') || ''

  const [allDeadlines, setAllDeadlines] = useState<DeadlineItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data once on mount
  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    setError(null)

    getData()
      .then((data) => {
        if (!ac.signal.aborted) {
          setAllDeadlines(data)
        }
      })
      .catch((err) => {
        if (!ac.signal.aborted) {
          console.error(err)
          setError(err instanceof Error ? err.message : String(err))
        }
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false)
      })

    return () => {
      ac.abort()
    }
  }, [])


  // Compute flat events
  const flatEvents: FlatEvent[] = useMemo(() => allDeadlines.flatMap(item =>
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
  ), [allDeadlines])

  // Fuse for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(flatEvents, {
      keys: ['item.title', 'item.description', 'item.tags', 'event.place'],
      threshold: 0.3,
    })
  }, [flatEvents])

  // Filtered and sorted recommendations
  const recommendations = useMemo(() => {
    let results: FlatEvent[]

    if (query.trim() && fuse) {
      results = fuse.search(query.trim()).map(result => result.item)
    } else {
      results = flatEvents
    }

    return results
      .sort((a, b) => {
        const aEnded = a.timeRemaining < 0
        const bEnded = b.timeRemaining < 0

        if (aEnded && !bEnded) return 1
        if (!aEnded && bEnded) return -1
        if (aEnded && bEnded) return b.timeRemaining - a.timeRemaining

        return a.timeRemaining - b.timeRemaining
      })
  }, [flatEvents, query, fuse])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{"events.loading"}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <p className="text-red-600">Failed to load data: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 bg-[url('/bg.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="container mx-auto px-4 py-8">
        {/* Recommendations List */}
        <div className="bg-transparent space-y-4">
          {recommendations.map(({ item, event }) => (
            <EventCard
              key={`${event.id}`}
              item={item}
              event={event}
            />
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{"events.notFound"}</h3>
            <p className="text-slate-600">
              {"events.hint"}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

export default function RecommendPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecommendPageContent />
    </Suspense>
  )
}
