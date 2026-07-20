// 检索

/** 论文核心实体。所有检索结果的统一数据模型。 */
export interface Paper {
  id: string
  title: string
  authors: string[]
  year?: number | null
  venue?: string | null
  abstract?: string | null
  doi?: string | null
  url?: string | null
  /** 数据来源标识（如 semantic_scholar, arxiv, pubmed）。 */
  source: string
  is_oa?: boolean
  impact_factor?: number | null
  citation_count?: number | null
  pdf_url?: string | null
  published_date?: string | null
  /** search.js 专用扩展字段 */
  oa_status?: "open" | "closed" | string
  impact_metric?: number
  best_link?: string
  doi_url?: string
}

/** 单个数据源的检索状态。 */
export interface SourceStatus {
  source: string
  status: "ok" | "empty" | "limited" | "skipped" | "error"
  query_used?: string
  count?: number
}

/** 检索接口的顶层返回体。 */
export interface SearchResponse {
  items: Paper[]
  total?: number
  statuses?: SourceStatus[]
  warning?: string
}