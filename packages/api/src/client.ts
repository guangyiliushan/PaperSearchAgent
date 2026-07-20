/**
 * 核心请求函数 + 便捷方法（api.get / post / put / patch / del）。
 *
 * 使用前必须调用 initApiClient() 初始化配置。
 */

import { getApiClientConfig } from "./config"
import {
  ApiError,
  NetworkError,
  TimeoutError,
  HttpError,
  AuthError,
  NotFoundError,
  ValidationError,
} from "./errors"
import type { RequestOptions } from "./types"
import {
  sleep,
  createTimeoutSignal,
  mergeSignals,
  calculateDelay,
  humanMessage,
} from "./utils"

// 核心

export async function request<T = unknown>(
  path: string,
  options?: RequestOptions<T>,
): Promise<T> {
  const cfg = getApiClientConfig()
  const retry = cfg.retry
  const maxRetries = retry?.maxRetries ?? 0
  const retryOn = retry?.retryOn ?? [408, 429, 500, 502, 503, 504]
  const baseDelay = retry?.baseDelay ?? 1000
  const capDelay = retry?.capDelay ?? 30_000
  const deadline = retry?.deadline ?? Infinity
  const jitter = retry?.jitter ?? "full"

  const startTime = Date.now()

  const attempt = async (retriesLeft: number): Promise<T> => {
    // deadline 检查
    if (Date.now() - startTime >= deadline) {
      throw new ApiError(0, null, path, `Retry deadline of ${deadline}ms exceeded`, false)
    }

    // 构建 signal（超时 + 外部）
    const timeoutSignal = options?.timeout ?? cfg.timeout
      ? createTimeoutSignal((options?.timeout ?? cfg.timeout)!)
      : undefined

    const combinedSignal = mergeSignals(options?.signal, timeoutSignal)

    try {
      // 构建 Headers
      const headers = new Headers(options?.headers)
      if (options?.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json")
      }
      const token = cfg.getToken?.()
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }

      // 构建 fetch init
      let init: RequestInit = {
        method: options?.method,
        body: options?.body,
        signal: combinedSignal,
        headers,
      }

      // 透传标准 fetch 选项
      for (const k of [
        "mode", "credentials", "cache", "redirect",
        "referrer", "referrerPolicy", "integrity", "keepalive",
      ] as const) {
        if (options?.[k] !== undefined) {
          ;(init as Record<string, unknown>)[k] = options[k]
        }
      }

      // 请求拦截器链
      const fullUrl = `${cfg.baseURL}${path}`
      if (cfg.requestInterceptors) {
        for (const interceptor of cfg.requestInterceptors) {
          init = await interceptor(fullUrl, init)
        }
      }

      // 发起请求
      let res = await fetch(fullUrl, init)

      // 响应拦截器链
      if (cfg.responseInterceptors) {
        for (const interceptor of cfg.responseInterceptors) {
          res = await interceptor(res, fullUrl)
        }
      }

      // 错误处理
      if (!res.ok) {
        let detail: unknown = ""
        try {
          detail = await res.clone().json()
        } catch {
          try {
            detail = await res.clone().text()
          } catch {
            /* 无法读取响应体 */
          }
        }

        // 按状态码抛出精密错误子类
        if (res.status === 401) throw new AuthError(path, detail)
        if (res.status === 404) throw new NotFoundError(path, detail)
        throw new HttpError(res.status, path, detail, humanMessage(detail, res.status))
      }

      // 解析响应体
      const contentType = res.headers.get("content-type") ?? ""
      let data: unknown

      if (contentType.includes("application/json")) {
        const text = await res.text()
        data = text ? JSON.parse(text) : undefined
      } else {
        data = await res.text()
      }

      // 运行时校验（可选）
      if (options?.validate) {
        try {
          return options.validate(data) as T
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          throw new ValidationError(msg, { raw: data, error: err })
        }
      }

      return data as T
    } catch (err: unknown) {
      // 重试逻辑
      if (retriesLeft > 0) {
        const shouldRetry =
          (err instanceof ApiError && err.retryable) ||
          // fetch 网络错误抛出 TypeError（非 ApiError）
          (err instanceof TypeError)

        if (shouldRetry) {
          const delay = calculateDelay(maxRetries - retriesLeft, baseDelay, capDelay, jitter)

          // deadline 二次检查
          if (Date.now() + delay - startTime >= deadline) {
            throw new ApiError(0, null, path, `Next retry would exceed deadline of ${deadline}ms`, false)
          }

          await sleep(delay)
          return attempt(retriesLeft - 1)
        }
      }

      // 错误包装
      if (err instanceof ApiError) throw err

      // AbortError / TimeoutError
      if (err instanceof DOMException && err.name === "AbortError") {
        const isTimeout =
          err.message.includes("timed out") ||
          err.message.includes("TimeoutError")

        if (isTimeout) {
          throw new TimeoutError(path, options?.timeout ?? cfg.timeout ?? 0)
        }
        throw new ApiError(0, err, path, err.message || "Request was cancelled", false)
      }

      // 网络错误（TypeError from fetch）
      throw new NetworkError(path, err)
    }
  }

  return attempt(maxRetries)
}

// 便捷方法

export const api = {
  get: <T = unknown>(path: string, opts?: RequestOptions<T>) =>
    request<T>(path, { ...opts, method: "GET" }),

  post: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions<T>) =>
    request<T>(path, {
      ...opts,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions<T>) =>
    request<T>(path, {
      ...opts,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions<T>) =>
    request<T>(path, {
      ...opts,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  del: <T = unknown>(path: string, opts?: RequestOptions<T>) =>
    request<T>(path, { ...opts, method: "DELETE" }),
}