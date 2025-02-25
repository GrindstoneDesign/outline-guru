
export interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  position?: number;
  analysis?: string;
}

export interface OutlineData {
  outline: string;
  searchResults: SearchResult[];
}

export interface ApiResponse {
  success: boolean;
  error?: string;
  data?: {
    outline: string;
    searchResults: SearchResult[];
  };
}
