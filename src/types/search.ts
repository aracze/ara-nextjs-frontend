export interface SearchItem {
  slug: string;
  fullSlug: string;
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
  title?: string;
  text?: string;
  slug?: string;
  fullSlug?: string;
  services?: ServiceData[];
  [key: string]: unknown;
}
