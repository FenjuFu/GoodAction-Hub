"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Utensils } from "lucide-react"

export default function HomeSelector() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-100 via-white to-purple-100">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            GoodAction Hub 首页
          </h1>
          <p className="mt-3 text-sm md:text-base text-gray-600">
            请选择进入模块：公益慈善活动截止日期 或 无障碍友好美食指南
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* 公益慈善活动截止日期 */}
          <Link href="/deadlines" className="group block h-full">
            <Card className="h-full min-h-[200px] overflow-hidden border-pink-200 hover:border-pink-400 transition-colors">
              <CardContent className="p-6 h-full">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-pink-100 text-pink-600 p-3 group-hover:bg-pink-200 transition-colors">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg md:text-xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
                      公益慈善活动截止日期
                    </div>
                    <div className="mt-1 text-gray-600 text-sm">
                      汇总各类公益赛事与活动的时间线与截止日期。
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 无障碍友好美食指南 */}
          <Link href="/Barrier-Free-Bites" className="group block h-full">
            <Card className="h-full min-h-[200px] overflow-hidden border-purple-200 hover:border-purple-400 transition-colors">
              <CardContent className="p-6 h-full">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-purple-100 text-purple-600 p-3 group-hover:bg-purple-200 transition-colors">
                    <Utensils className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                      无障碍友好美食指南
                    </div>
                    <div className="mt-1 text-gray-600 text-sm">
                      探索更友好的餐饮空间与无障碍觅食导航。
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
      
      {/* 微信二维码图片 */}
      <div className="flex justify-center mt-12 mb-8">
        <div className="text-center">
          <Image
            src="/goodactionhub-12-6.png"
            alt="GoodAction Hub 公益生活微信群"
            width={192}
            height={192}
            className="w-48 h-48 object-contain mx-auto"
            unoptimized
          />
          <p className="mt-2 text-sm text-gray-500">
            加入GoodAction Hub开源公益生活交流群
          </p>
        </div>
      </div>
    </div>
  )
}
