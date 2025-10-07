'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function Aggregation() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/recommend?query=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (

    <div className="w-full">
      {/* Search bar — large, rounded, translucent */}
      <div className="mt-50 w-full bg-black/40 backdrop-blur-md rounded-full px-4 py-3 shadow-2xl flex items-center">
        {/* Left label */}
        <div className="flex items-center gap-3 pl-3">
          <span className="text-white/90 text-lg md:text-xl">探索</span>
        </div>

        {/* Input field */}
        <input
          type="text"
          placeholder="搜索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch()
          }}
          className="flex-1 bg-transparent placeholder-white/60 text-white text-lg md:text-xl outline-none px-6"
        />

        {/* Submit button */}
        <button
          onClick={handleSearch}
          aria-label="搜索"
          className="ml-4 rounded-full bg-white/20 hover:bg-white/30 p-3 flex items-center justify-center transition-colors"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  )
}

