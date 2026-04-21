export type ReportStatus = "draft" | "in_review" | "published" | "archived";

export type ReportCategory =
  | "finance"
  | "marketing"
  | "engineering"
  | "sales"
  | "operations"
  | "product";

export interface Report {
  id: string;
  title: string;
  category: ReportCategory;
  status: ReportStatus;
  author: string;
  createdAt: string;
  updatedAt: string;
  summary: string;
  content: string;
  tags: string[];
  metrics: {
    views: number;
    shares: number;
    readTimeMinutes: number;
  };
}

export type ReportSortKey =
  | "title"
  | "createdAt"
  | "updatedAt"
  | "author"
  | "views";

export type SortDirection = "asc" | "desc";

export interface ReportListQuery {
  q?: string;
  sort?: ReportSortKey;
  order?: SortDirection;
  category?: ReportCategory;
  status?: ReportStatus;
}

export interface ReportListResponse {
  items: Report[];
  total: number;
  query: Required<Pick<ReportListQuery, "sort" | "order">> & ReportListQuery;
}

export interface AiSummaryResponse {
  reportId: string;
  model: string;
  summary: string;
  generatedAt: string;
  source: "openai" | "mock";
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
