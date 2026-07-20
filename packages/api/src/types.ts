// 重试配置
export interface RetryConfig {
  /** 最大重试次数（不含首次请求）。不设置则不重试。 */
  maxRetries: number
  /**
   * 哪些 HTTP 状态码触发重试。
   * @default [408, 429, 500, 502, 503, 504]
   */
  retryOn?: number[]
  /** 基础延迟（毫秒），指数退避公式：delay = baseDelay × 2^attempt。@default 1000 */
  baseDelay?: number
  /** 单次延迟上限（毫秒），防止退避时间过长。@default 30_000 */
  capDelay?: number
  /** 所有重试的总截止时间（毫秒）。超过后不再重试。@default Infinity */
  deadline?: number
  /**
   * 抖动类型，防止惊群效应（thundering herd）。
   * - `"full"`: 0 ~ exponential 之间随机（AWS 推荐）
   * - `"equal"`: exponential/2 ~ exponential 之间随机
   * - `"decorrelated"`: baseDelay + random * (exponential * 3 - baseDelay)，上限 capDelay
   * @default "full"
   */
  jitter?: "full" | "equal" | "decorrelated"
}

// 客户端配置

export interface ApiClientConfig {
  /** 后端根地址，末尾不带斜杠。 */
  baseURL: string
  /**
   * 认证 token 提供者，每次请求时调用。
   * 返回 null / undefined 表示跳过 Authorization 头。
   */
  getToken?: () => string | null | undefined
  /** 全局默认超时（毫秒），0 表示不设超时。@default 10_000 */
  timeout?: number
  /** 失败重试配置。不设置则不重试。 */
  retry?: RetryConfig
  /**
   * 请求拦截器链。按数组顺序依次执行，可修改 RequestInit。
   * 适合：注入 trace-id、日志打点、CSRF token 等。
   */
  requestInterceptors?: Array<(url: string, init: RequestInit) => RequestInit | Promise<RequestInit>>
  /**
   * 响应拦截器链。按数组顺序依次执行，可检查/替换 Response。
   * 适合：统一处理 401 跳转登录、响应数据脱敏等。
   */
  responseInterceptors?: Array<(res: Response, url: string) => Response | Promise<Response>>
}

// 单次请求选项

export interface RequestOptions<T = unknown> extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>
  /** 本次请求的超时（毫秒），覆盖全局 timeout。 */
  timeout?: number
  /** 外部 AbortSignal（如 React Query / TanStack Query 传入的 signal）。 */
  signal?: AbortSignal
  /**
   * 响应体运行时验证。传入验证函数，校验通过返回数据，失败抛出 ValidationError。
   * 返回类型应与 request<T> 的泛型参数一致。
   *
   * @example
   * import { z } from "zod"
   * const user = await request("/api/me", {
   *   validate: (data) => z.object({ id: z.number() }).parse(data),
   * })
   */
  validate?: (data: unknown) => T
}
