import { NextResponse } from "next/server"
import { BITES_CATALOG, AccessibilityFilter, BitesRestaurant, filterBitesCatalog } from "@/lib/bitesCatalog"
import { chatSpark, SparkMessage } from "@/lib/spark"

export const runtime = "nodejs"

interface RecommendRequestBody {
  location?: string
  preferences?: string
  accessibility?: AccessibilityFilter
}

interface ModelRecommendation extends Partial<BitesRestaurant> {
  name?: string
  address?: string
}

// 严格将模型输出限定到本地候选集，并应用地点/无障碍过滤
function normalize(s: string) {
  return (s || "").replace(/[（）()]/g, "").replace(/\s+/g, "").trim()
}

function enforceCatalog(recs: ModelRecommendation[], location: string, accessibility: AccessibilityFilter) {
  const candidates = filterBitesCatalog(location, accessibility)
  const byNameOrAddr = (r: ModelRecommendation, c: BitesRestaurant) => {
    const rn = normalize(r?.name || "")
    const cn = normalize(c?.name || "")
    const ra = normalize(r?.address || "")
    const ca = normalize(c?.address || "")
    return (rn && rn === cn) || (ra && ra === ca) || (rn && cn.includes(rn)) || (ra && ca.includes(ra))
  }

  const matched: BitesRestaurant[] = []
  for (const r of recs || []) {
    const m = candidates.find((c) => byNameOrAddr(r, c))
    if (m) matched.push(m)
  }

  return Array.from(new Map(matched.map((x) => [x.name, x])).values())
}

function safeParseJson(input: string): any {
  const cleaned = (input || "")
    .trim()
    .replace(/^```json/gi, "")
    .replace(/^```/gi, "")
    .replace(/```$/gi, "")

  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {}
    }
    return null
  }
}

export async function POST(req: Request) {
  let location = ""
  let preferences = ""
  let accessibility: AccessibilityFilter = {}

  try {
    const body = (await req.json()) as RecommendRequestBody
    location = body?.location || ""
    preferences = body?.preferences || ""
    accessibility = body?.accessibility || {}
  } catch {
    return NextResponse.json({ recommendations: filterBitesCatalog("", {}).slice(0, 5), source: "fallback_bad_request" })
  }

  const filtersText = `听障友好: ${accessibility?.deafFriendly ? "是" : "否"}; 视障友好: ${accessibility?.blindFriendly ? "是" : "否"}`

  const system: SparkMessage = {
    role: "system",
    content: [
      "你是无障碍友好美食推荐助手。",
      "你的数据来源仅限于下列候选餐厅（来自页面 Barrier-Free-Bites 的静态内容），不可调用任何联网搜索或外部知识：",
      JSON.stringify(BITES_CATALOG),
      "严格只从上述候选中进行筛选与排序，不要发明新的餐厅。",
      "只返回合法JSON字符串，不要任何说明、注释或代码块，不要使用中文标点。",
      "字段名与示例完全一致：{ recommendations: [{ name, address, city, tags, description }] }，按匹配度高到低排序，最多5条。",
    ].join("\n"),
  }

  const user: SparkMessage = {
    role: "user",
    content: `地点: ${location}\n偏好: ${preferences}\n无障碍偏好: ${filtersText}`,
  }

  try {
    const text = await chatSpark({ messages: [system, user], temperature: 0.3, maxTokens: 1200 })
    const parsed = safeParseJson(text) || { recommendations: filterBitesCatalog(location, accessibility) }
    const recommendations: ModelRecommendation[] = Array.isArray(parsed?.recommendations) ? parsed.recommendations : []
    const strict = enforceCatalog(recommendations, location, accessibility)

    if (!strict.length) {
      const fallback = filterBitesCatalog(location, accessibility)
      return NextResponse.json({ recommendations: fallback.slice(0, 5), source: "fallback" })
    }

    return NextResponse.json({ recommendations: strict.slice(0, 5), source: "spark" })
  } catch (err: any) {
    console.error("[AI Recommend] Error:", err)
    const fallback = filterBitesCatalog(location, accessibility)
    return NextResponse.json({
      recommendations: fallback.slice(0, 5),
      source: "fallback_error",
      error: err?.message || "AI推荐失败",
    })
  }
}
