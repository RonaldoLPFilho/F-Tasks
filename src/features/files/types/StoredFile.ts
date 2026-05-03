export interface StoredFile {
  id: string;
  originalFileName: string;
  contentType?: string;
  sizeBytes: number;
  checksumSha256: string;
  uploadedAt: string;
}

export interface StoredFilesPage {
  content: StoredFile[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
