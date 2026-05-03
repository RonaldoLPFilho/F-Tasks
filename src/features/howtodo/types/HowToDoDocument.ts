export interface HowToDoSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface HowToDoDetail extends HowToDoSummary {
  content: string;
}

export interface HowToDoPage {
  content: HowToDoSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface HowToDoPayload {
  title: string;
  content: string;
}
