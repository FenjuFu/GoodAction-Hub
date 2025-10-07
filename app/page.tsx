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
      console.log('Filtering favorites:', { favorites, showOnlyFavorites, totalEvents: filtered.length })
      filtered = filtered.filter(flatEvent => {
        const eventId = `${flatEvent.event.id}`
        const isFavorited = favorites.includes(eventId)
        console.log(`Event ${eventId}: ${isFavorited ? 'favorited' : 'not favorited'}`)
        return isFavorited
      })
      console.log('Filtered favorites result:', filtered.length)
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

    // 排序逻辑：未结束的活动按 timeRemaining 升序，已结束的活动放在最后
    return filtered.sort((a, b) => {
      const aCompleted = a.timeRemaining < 0
      const bCompleted = b.timeRemaining < 0
      
      // 如果一个已结束，一个未结束，未结束的排在前面
      if (aCompleted && !bCompleted) return 1
      if (!aCompleted && bCompleted) return -1
      
      // 如果都未结束，按 timeRemaining 升序（即将到期的在前）
      if (!aCompleted && !bCompleted) {
        return a.timeRemaining - b.timeRemaining
      }
      
      // 如果都已结束，按 timeRemaining 降序（最近结束的在前）
      return b.timeRemaining - a.timeRemaining
    })
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
            <div className="flex gap-3">
              <Link
                href="https://gitcode.com/Fenju/GoodAction-Hub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 28 28">
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.059 5.80628C18.2234 5.71425 18.3973 5.61696 18.585 5.51037C18.6076 5.63327 18.6297 5.74058 18.6497 5.83784C18.685 6.00943 18.714 6.15059 18.728 6.29005C18.8392 7.50125 19.448 8.39222 20.3108 8.59286C21.5726 8.88583 22.7623 8.40159 23.4033 7.33318C24.1733 6.05123 23.839 4.4812 22.5279 3.53618C18.8826 0.907049 14.8777 0.18191 10.5636 1.44819C1.2616 4.1927 -1.92121 15.6199 4.68062 22.6274C7.50507 25.6249 11.0914 26.9182 15.1624 26.8204C20.3774 26.6979 24.1333 24.099 26.5309 19.5947C28.2308 16.3988 26.3829 12.9055 22.8439 12.1795C20.8227 11.7726 18.7559 11.6405 16.6993 11.7869C16.0151 11.8526 15.3509 12.0547 14.7459 12.3811C14.0691 12.7324 13.8734 13.4614 13.9493 14.1838C14.02 14.8421 14.5247 15.2369 15.1258 15.3362C16.3361 15.5256 17.5609 15.6357 18.7833 15.7361C19.1371 15.7659 19.4942 15.7694 19.8507 15.773C20.3623 15.7781 20.873 15.7832 21.3718 15.8657C22.7949 16.1009 23.2836 17.2557 22.5517 18.4911C22.3724 18.7882 22.1633 19.0662 21.9277 19.3209C20.9703 20.3738 19.7183 21.1144 18.3344 21.4465C15.8084 22.0649 13.2798 22.0996 10.7655 21.3054C7.90238 20.4021 6.19549 18.2991 6.13552 15.4682C6.1131 13.7223 6.55634 12.002 7.41963 10.4843C7.80967 9.77686 8.02376 9.04827 7.96359 8.24664C7.93826 7.90488 7.92423 7.56273 7.90915 7.19506C7.90113 6.99938 7.89281 6.79647 7.88233 6.58254C8.17231 6.6434 8.45871 6.72023 8.74022 6.81271C9.83531 7.25229 10.9132 7.45284 12.0986 7.13019C12.7728 6.96895 13.4697 6.92433 14.159 6.99829C15.269 7.08878 16.3785 6.81759 17.3215 6.22521C17.5569 6.08724 17.7963 5.9533 18.059 5.80628Z" />
                </svg>
                GitCode
              </Link>
              <Link
                href="https://github.com/FenjuFu/GoodAction-Hub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                GitHub
              </Link>
            </div>
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
