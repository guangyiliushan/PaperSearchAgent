/**
 * 错误类层次结构，便于调用方精确匹配不同错误类型。
 *
 *   ApiError               ← 基类
 *   ├── NetworkError       ← 断网 / DNS / TLS 等网络层错误
 *   ├── TimeoutError       ← 请求超时
 *   └── HttpError          ← HTTP 4xx / 5xx
 *         ├── AuthError    ← 401 Unauthorized
 *         └── NotFoundError← 404 Not Found
 */

// 基类

export class ApiError extends Error {
  /** 是否适合自动重试（5xx / 网络错误）。 */
  readonly retryable: boolean

  constructor(
    readonly status: number,
    readonly detail: unknown,
    readonly url: string,
    message: string,
    retryable = false,
  ) {
    super(message)
    this.name = "ApiError"
    this.retryable = retryable
  }

  get isServerError() {
    return this.status >= 500 || this.status === 0
  }
  get isClientError() {
    return this.status >= 400 && this.status < 500
  }
}

// 子类

/** 网络层错误：断网、DNS 解析失败、TLS 握手失败等。status = 0。 */
export class NetworkError extends ApiError {
  constructor(url: string, detail: unknown) {
    super(0, detail, url, "Network request failed", true)
    this.name = "NetworkError"
  }
}

/** 请求超时。status = 0。 */
export class TimeoutError extends ApiError {
  constructor(url: string, timeoutMs: number) {
    super(0, { timeoutMs }, url, `Request timed out after ${timeoutMs}ms`, false)
    this.name = "TimeoutError"
  }
}

/** HTTP 4xx / 5xx 错误。 */
export class HttpError extends ApiError {
  constructor(status: number, url: string, detail: unknown, message: string) {
    super(status, detail, url, message, status >= 500)
    this.name = "HttpError"
  }
}

/** 401 Unauthorized。调用方通常在响应拦截器中捕获，触发 token 刷新或跳转登录。 */
export class AuthError extends HttpError {
  constructor(url: string, detail: unknown) {
    super(401, url, detail, "Unauthorized")
    this.name = "AuthError"
  }
}

/** 404 Not Found。 */
export class NotFoundError extends HttpError {
  constructor(url: string, detail: unknown) {
    super(404, url, detail, "Resource not found")
    this.name = "NotFoundError"
  }
}

/** 响应体运行时校验失败。status = -1。 */
export class ValidationError extends ApiError {
  constructor(message: string, detail: unknown) {
    super(-1, detail, "", `Response validation failed: ${message}`, false)
    this.name = "ValidationError"
  }
}
