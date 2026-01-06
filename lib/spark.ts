import crypto from "crypto"
import WebSocket from "ws"

const HOST = "spark-api.xf-yun.com"
const PATH = "/v3.5/chat"

const APP_ID = process.env.IFLYTEK_APP_ID || ""
const API_KEY = process.env.IFLYTEK_API_KEY || ""
const API_SECRET = process.env.IFLYTEK_API_SECRET || ""
const SPARK_API_PASSWORD = process.env.SPARK_API_PASSWORD || ""

export interface SparkMessage {
  role: "system" | "user" | "assistant"
  content: string
}

function buildWsUrl(): string {
  const date = new Date().toUTCString()
  const signatureOrigin = `host: ${HOST}\ndate: ${date}\nGET ${PATH} HTTP/1.1`
  const signature = crypto
    .createHmac("sha256", API_SECRET)
    .update(signatureOrigin)
    .digest("base64")

  const authorizationOrigin = `api_key=${API_KEY},algorithm=hmac-sha256,headers=host date request-line,signature=${signature}`
  const authorization = Buffer.from(authorizationOrigin).toString("base64")

  const url = `wss://${HOST}${PATH}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(HOST)}`
  return url
}

async function chatSparkWs({
  messages,
  temperature = 0.5,
  maxTokens = 1024,
  domain = "generalv3.5",
}: {
  messages: SparkMessage[]
  temperature?: number
  maxTokens?: number
  domain?: string
}): Promise<string> {
  if (!APP_ID || !API_KEY || !API_SECRET) {
    throw new Error("星火API环境变量未配置：IFLYTEK_APP_ID、IFLYTEK_API_KEY、IFLYTEK_API_SECRET")
  }

  const url = buildWsUrl()

  const reqPayload = {
    header: {
      app_id: APP_ID,
    },
    parameter: {
      chat: {
        domain,
        temperature,
        max_tokens: maxTokens,
        top_k: 4,
        auditing: "default",
      },
    },
    payload: {
      message: {
        text: messages.map((m) => ({ role: m.role, content: m.content })),
      },
    },
  }

  return new Promise<string>((resolve, reject) => {
    const ws = new WebSocket(url)
    let acc = ""

    ws.on("open", () => {
      ws.send(JSON.stringify(reqPayload))
    })

    ws.on("message", (data) => {
      try {
        const resp = JSON.parse(data.toString())
        const code = resp?.header?.code
        if (code && code !== 0) {
          const msg = resp?.header?.message || "未知错误"
          reject(new Error(`星火返回错误: ${code} ${msg}`))
          ws.close()
          return
        }

        const status = resp?.header?.status
        const choices = resp?.payload?.choices?.text || []
        for (const ch of choices) {
          if (typeof ch?.content === "string") {
            acc += ch.content
          }
        }

        if (status === 2) {
          ws.close()
          resolve(acc)
        }
      } catch (err) {
        reject(err as Error)
      }
    })

    ws.on("error", (err) => {
      reject(err)
    })

    ws.on("close", () => {
      // if server closes unexpectedly without status 2, still resolve accumulated text
      if (acc) resolve(acc)
    })
  })
}

export async function chatSparkX1Http({
  messages,
  temperature = 0.5,
  maxTokens = 1024,
}: {
  messages: SparkMessage[]
  temperature?: number
  maxTokens?: number
}): Promise<string> {
  const apiKeyForHttp = SPARK_API_PASSWORD || (API_KEY && API_SECRET ? `${API_KEY}:${API_SECRET}` : "")
  if (!apiKeyForHttp) {
    throw new Error("星火X1 HTTP环境变量未配置：SPARK_API_PASSWORD 或 IFLYTEK_API_KEY/SECRET")
  }

  const body = {
    model: "spark-x",
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    stream: false,
    temperature,
    // max_tokens 在X1 http中可能由服务端策略控制，这里保留以备兼容
    max_tokens: maxTokens,
    user: "GoodActionHub",
  }

  const resp = await fetch("https://spark-api-open.xf-yun.com/v2/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKeyForHttp}`,
    },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    throw new Error(`X1 HTTP调用失败: ${resp.status} ${errText}`)
  }

  const data = await resp.json()
  let acc = ""
  const choices = Array.isArray(data?.choices) ? data.choices : []
  for (const ch of choices) {
    const content = ch?.message?.content ?? ch?.delta?.content ?? ch?.content
    if (typeof content === "string") {
      acc += content
    }
  }
  return acc || ""
}

export async function chatSpark(opts: {
  messages: SparkMessage[]
  temperature?: number
  maxTokens?: number
  domain?: string
}): Promise<string> {
  // 优先使用 X1 HTTP（若配置了 SPARK_API_PASSWORD），否则回退到 WS v3.5
  if (SPARK_API_PASSWORD) {
    return chatSparkX1Http({
      messages: opts.messages,
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
    })
  }
  return chatSparkWs(opts)
}
