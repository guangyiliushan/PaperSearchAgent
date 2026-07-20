// MCP

/** MCP Server 暴露的单个工具。 */
export interface McpTool {
  name: string
  description?: string
}

/** MCP Server 实例。 */
export interface McpServer {
  id: number
  registry_name: string
  title?: string
  description?: string
  transport: string
  status: string
  enabled: boolean
  tools_cache?: McpTool[]
  last_error?: string
  command?: string
  args?: string[]
  url?: string
}

/** MCP 注册表 / 市场中的可发现 Server 条目。 */
export interface McpDiscoverItem {
  registry_name: string
  title?: string
  description?: string
  transport?: string
  source?: string
  needs_secrets?: boolean
  command?: string
  args?: string[]
  env?: Record<string, string>
  url?: string
  headers?: Record<string, string>
  package?: Record<string, unknown>
}

/** MCP 搜索 / 发现接口的返回体。 */
export interface McpSearchResponse {
  items: McpDiscoverItem[]
  registry_count?: number
  curated_count?: number
  registry_error?: string
}
