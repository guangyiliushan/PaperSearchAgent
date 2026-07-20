import type { ApiClientConfig } from "./types"

// 默认配置

/**
 * 根据运行环境生成初始配置。
 * - Tauri desktop：默认 http://127.0.0.1:8756（sidecar）
 * - 浏览器 web：默认 location.origin（同源）
 */
export function createDefaultConfig(): ApiClientConfig {
  const baseURL = "http://127.0.0.1:8756"

  return {
    baseURL,
    timeout: 10_000,
    retry: {
      maxRetries: 3,
      retryOn: [408, 429, 500, 502, 503, 504],
      baseDelay: 1000,
      capDelay: 30_000,
      deadline: 30_000,
      jitter: "full",
    },
  }
}

// 内部状态
let _config: ApiClientConfig = createDefaultConfig()

// 公开 API
/**
 * 应用启动时调用一次，注入后端地址、token 获取方式等。
 * 传入的 config 与默认值浅合并，未指定的字段保留默认值。
 */
export function initApiClient(config: Partial<ApiClientConfig> = {}): void {
  const defaults = createDefaultConfig()

  _config = {
    ...defaults,
    ...config,
    // 深度合并 retry（保留 required 字段的确定性）
    retry: config.retry !== undefined
      ? { ...defaults.retry, ...config.retry }
      : defaults.retry,
  }
}

/** 获取当前配置快照（只读，调试用）。 */
export function getApiClientConfig(): Readonly<ApiClientConfig> {
  return _config
}
