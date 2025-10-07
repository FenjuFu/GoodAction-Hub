'use client'

import { useEventStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Search, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { TimezoneSelector } from './TimezoneSelector'

export function FilterBar() {
  const {
    selectedCategory,
    searchQuery,
    setCategory,
    setSearchQuery,
    showOnlyFavorites,
    setShowOnlyFavorites,
    mounted,
  } = useEventStore()

  const { t } = useTranslation('common')

  const categories = ['conference', 'competition', 'activity']

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={t('filter.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Favorites and Timezone Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Favorites Toggle */}
        {mounted && (
          <Button
            variant={showOnlyFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`
              relative overflow-hidden transition-all duration-300 ease-in-out
              ${showOnlyFavorites 
                ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30 hover:scale-105' 
                : 'border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-700'
              }
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
              before:translate-x-[-100%] before:transition-transform before:duration-700
              ${showOnlyFavorites ? 'hover:before:translate-x-[100%]' : ''}
            `}
          >
            <Star 
              className={`w-4 h-4 transition-all duration-300 ${
                showOnlyFavorites 
                  ? 'text-white fill-white drop-shadow-sm' 
                  : 'text-yellow-500 hover:text-yellow-600'
              }`} 
            />
            <span className="font-medium">
              {t('filter.onlyFavorites')}
            </span>
            {showOnlyFavorites && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 animate-pulse" />
            )}
          </Button>
        )}

        {/* 时区选择器 */}
        <TimezoneSelector />
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium mb-2">{t('filter.category')}</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            className={`transition-colors ${selectedCategory === null
              ? 'bg-primary hover:bg-primary/90'
              : 'hover:bg-primary/10'
              } hover:cursor-pointer`}
            onClick={() => setCategory(null)}
          >
            {t('filter.all')}
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              className={`transition-colors ${selectedCategory === category
                ? 'bg-primary hover:bg-primary/90'
                : 'hover:bg-primary/10'
                } capitalize hover:cursor-pointer`}
              onClick={() => setCategory(category)}
            >
              {t(`filter.category_${category}`)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
