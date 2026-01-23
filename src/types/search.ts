export interface SearchItem {
  slug: string;
  title: string;
  text?: string;
  documentId?: string;
}

export interface ShowcaseData {
  [key: string]: unknown;
}

export interface ServiceData {
  showcases?: ShowcaseData[];
  [key: string]: unknown;
}

export interface PageData {
  attributes?: {
    title?: string;
    text?: string;
    slug?: string;
  };
  title?: string;
  text?: string;
  slug?: string;
  services?: ServiceData[];
  [key: string]: unknown;
}
