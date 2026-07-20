// 文献库

import type { Paper } from "./search"

/** 文献库项目。 */
export interface Project {
  id: number
  name: string
  paper_count?: number
  created_at?: string
}

/** 文献库中的论文，在 Paper 基础上扩展持久化字段。 */
export interface LibraryPaper extends Paper {
  project_id?: number | null
  saved_at?: string
  has_pdf?: boolean
  reading_status?: string
  authors_json?: string
  tags_json?: string
  notes?: string
  has_local_pdf?: boolean
  in_vector_store?: boolean
}

/** 期刊订阅源。用户关注的期刊/平台的 RSS feed 配置。 */
export interface JournalChip {
  id: number
  platform_name: string
  category?: string
  /** RSS / Atom 订阅地址。 */
  feed_url?: string
  is_active: boolean
  is_builtin: boolean
}

// PDF / 文件管理

/** PDF 目录下的单个文件描述。 */
export interface PdfFileItem {
  name: string
  size?: number
}

/** PDF 目录扫描结果（API 层 DTO）。 */
export interface PdfFilesResponse {
  directory?: string
  files?: PdfFileItem[]
}

/** 导出操作结果。 */
export interface ExportResult {
  filename?: string
  path?: string
  directory?: string
  count?: number
}
