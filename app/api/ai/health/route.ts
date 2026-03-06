import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  const hasPassword = !!(process.env.SPARK_API_PASSWORD || process.env.IFLYTEK_SPARK_API_PASSWORD)
  const hasWsConfig = !!(process.env.IFLYTEK_APP_ID && process.env.IFLYTEK_API_KEY && process.env.IFLYTEK_API_SECRET)
  const isStaticExport = process.env.STATIC_EXPORT === "true"
  return NextResponse.json({ hasPassword, hasWsConfig, isStaticExport })
}

