// 设置

/** LLM 配置档案。 */
export interface LlmProfile {
  id: number
  name: string
  model: string
  api_key: string
  base_url?: string
  context_window: number
  is_active: boolean
}

/** Embedding 模型配置档案。 */
export interface EmbeddingProfile {
  id: number
  name: string
  model: string
  api_key: string
  base_url?: string
  dimensions: number
  is_active: boolean
}

/** 通用应用设置。 */
export interface GeneralSettings {
  agent_max_rounds: number
  agent_max_tool_calls: number
  citation_expand_depth: number
  context_window_tokens: number
  context_compress_trigger_ratio: number
  proxy_url: string
  semantic_scholar_api_key: string
  download_dir: string
  pdf_dir: string
  always_allow_llm_pdf_ocr: boolean
  data_dir?: string
  resolved_download_dir?: string
  resolved_pdf_dir?: string
  default_export_dir?: string
  default_pdf_dir?: string
  pdf_file_count?: number
}

/** LLM / Embedding 档案连通性测试结果。 */
export interface ProfileTestResult {
  ok: boolean
  message: string
}
