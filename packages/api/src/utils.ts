import type { RetryConfig } from "./types"

// 计时 / 延迟

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// Signal 工具：超时、合并

/**
 * 创建一个在 `timeoutMs` 毫秒后自动 abort 的 AbortSignal。
 * 优先使用现代 `AbortSignal.timeout()`（Node 18 / Chrome 103+），
 * 不支持时回退到手动 AbortController。
 */
export function createTimeoutSignal(timeoutMs: number): AbortSignal {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(timeoutMs)
  }
  // 兼容性回退
  const ctrl = new AbortController()
  setTimeout(
    () => ctrl.abort(new DOMException(`Request timed out after ${timeoutMs}ms`, "TimeoutError")),
    timeoutMs,
  )
  return ctrl.signal
}

/**
 * 合并多个 AbortSignal：任一触发则合并后的 signal 也触发。
 * 优先使用 `AbortSignal.any()`（Node 20.17 / Chrome 116+），
 * 不支持时回退到手动事件转发。
 */
export function mergeSignals(...signals: (AbortSignal | undefined)[]): AbortSignal | undefined {
  const valid = signals.filter((s): s is AbortSignal => s != null)
  if (valid.length === 0) return undefined
  if (valid.length === 1) return valid[0]

  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any(valid)
  }

  // 兼容性回退
  const ctrl = new AbortController()
  const onAbort = (reason: unknown) => {
    ctrl.abort(reason)
    // 清理其他 listener
    for (const s of valid) {
      s.removeEventListener("abort", onAbort)
    }
  }
  for (const s of valid) {
    if (s.aborted) {
      ctrl.abort(s.reason)
      break
    }
    s.addEventListener("abort", () => onAbort(s.reason), { once: true })
  }
  return ctrl.signal
}

// 重试延迟计算（带抖动）

/**
 * 根据重试次数计算带抖动的等待延迟。
 *
 * 参考 AWS Architecture Blog "Timeouts, Retries and Backoff with Jitter"。
 * `"full"` jitter 对服务端最友好，能最大程度分散并发重试。
 */
export function calculateDelay(
  attempt: number,   // 0-based（第 0 次重试 = 首次退避）
  baseDelay: number,
  capDelay: number,
  jitter: NonNullable<RetryConfig["jitter"]> = "full",
): number {
  const exponential = Math.min(capDelay, baseDelay * Math.pow(2, attempt))

  switch (jitter) {
    case "full":
      // 0 ~ exponential 之间均匀随机
      return Math.floor(Math.random() * exponential)

    case "equal":
      // exponential/2 ~ exponential 之间均匀随机
      return Math.floor(exponential / 2 + Math.random() * (exponential / 2))

    case "decorrelated":
      // baseDelay + random * (exponential * 3 - baseDelay)，上限 capDelay
      return Math.min(capDelay, baseDelay + Math.random() * (exponential * 3 - baseDelay))

    default:
      return exponential
  }
}

// 杂项

/** 从响应体 / 错误详情中提取人类可读的错误消息。 */
export function humanMessage(detail: unknown, status: number): string {
  if (typeof detail === "string" && detail) return detail
  if (detail && typeof detail === "object") {
    const d = detail as Record<string, unknown>
    if (typeof d.message === "string") return d.message
    if (typeof d.error === "string") return d.error
  }
  return `HTTP ${status}`
}

/** 判断 HTTP 状态码是否属于可重试范围。 */
export function isRetryableStatus(status: number, retryOn: number[]): boolean {
  return status === 0 || retryOn.includes(status)
}
