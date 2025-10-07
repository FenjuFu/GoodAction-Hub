'use client'

import { EventCard } from '@/components/EventCard'
import { FilterBar } from '@/components/FilterBar'

import { DeadlineItem, EventData } from '@/lib/data'
import { useEventStore } from '@/lib/store'
import Fuse from 'fuse.js'

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



  // 为每个事件添加搜索用的日期字段
  const eventsWithSearchDates = useMemo(() => {
    return flatEvents.map(flatEvent => ({
      ...flatEvent,
      searchableDate: flatEvent.nextDeadline.toFormat('yyyy-MM-dd'),
      searchableMonth: flatEvent.nextDeadline.toFormat('MM'),
      searchableYear: flatEvent.nextDeadline.toFormat('yyyy'),
    }))
  }, [flatEvents])



  const filteredEvents = useMemo(() => {
    let filtered = eventsWithSearchDates

    // 分类过滤
    if (selectedCategory) {
      filtered = filtered.filter(flatEvent => flatEvent.item.category === selectedCategory)
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      filtered = filtered.filter(flatEvent =>
        selectedTags.some(tag => flatEvent.item.tags?.includes(tag))
      )
    }

    // 地点过滤
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(flatEvent =>
        selectedLocations.includes(flatEvent.event.place)
      )
    }

    // 收藏过滤
    if (showOnlyFavorites) {
      filtered = filtered.filter(flatEvent => favorites.has(flatEvent.item.id))
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const fuse = new Fuse(filtered, {
        keys: [
          { name: 'item.title', weight: 0.4 },
          { name: 'item.tags', weight: 0.3 },
          { name: 'event.place', weight: 0.2 },
          { name: 'searchableDate', weight: 0.1 },
          { name: 'searchableMonth', weight: 0.1 },
          { name: 'searchableYear', weight: 0.1 },
        ],
        threshold: 0.3,
        includeScore: true,
      })

      const results = fuse.search(searchQuery)
      filtered = results.map(result => result.item)
    }

    return filtered.sort((a, b) => a.timeRemaining - b.timeRemaining)
  }, [eventsWithSearchDates, selectedCategory, selectedTags, selectedLocations, searchQuery, showOnlyFavorites, favorites])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-700">{t("events.loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 relative overflow-hidden">
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-300/10 to-cyan-300/10 rounded-full blur-3xl"></div>
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
              公益慈善活动截止日期
            </h1>
            <Link
              href="https://github.com/your-repo/GoodAction-Hub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              GitHub 仓库
            </Link>
          </div>
          <p className="text-lg text-gray-700 mb-4 font-medium">
              公益慈善会议、竞赛和活动重要截止日期概览，不再错过参与公益事业、奉献爱心和社会服务的机会
            </p>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
              所有截止日期均默认转换为北京时间，如果您不知道当前所在时区，请点击时区选择器右侧的&ldquo;自动检测&rdquo;
            </p>
            <p className="text-gray-500 bg-white/40 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
              *免责声明：本站数据由人工维护，仅供参考
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-8">
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
            <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">{t("events.notFound")}</h3>
            <p className="text-gray-600 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
              {t("events.hint")}
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 inline-block">
            <p className="text-sm">
              公益慈善活动追踪平台 - 让爱心传递，让公益更简单
            </p>
          </div>
        </footer>

      </div>
    </div>
  )
}
