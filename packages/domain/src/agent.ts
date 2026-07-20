// Agent 对话

/** 对话消息。 */
export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  tools?: ToolProgress[]
  charts?: ChartConfig[]
}

/** 工具执行进度（流式推送）。 */
export interface ToolProgress {
  name: string
  status: "running" | "done" | "error"
  detail?: string
}

/** Agent 生成的图表配置。用于前端按类型渲染相应图表组件。 */
export interface ChartConfig {
  type: "bar" | "line" | "pie" | "scatter"
  data: {
    labels: string[]
    datasets: { label?: string; data: number[] }[]
  }
  options?: { title?: string }
}
