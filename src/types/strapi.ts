export interface StrapiMedia {
  url: string;
  alternativeText: string | null;
}

export interface SharedImageComponent {
  alternativeText: string;
  url: string | URL;
  image: StrapiMedia | null;
  featureImageStyleCss: string | null;
}

export interface NavLink {
  id: number;
  title: string;
  href: string;
  isExternal: boolean;
  isButtonLink: boolean;
}

export interface ImageLink {
  id: number;
  svgCode: string | null;
  image: SharedImageComponent | null;
  Link: NavLink | null;
}

export interface GlobalHeader {
  id: number;
  logo: ImageLink | null;
  navItems: NavLink[];
  login: NavLink | null;
}

export interface PageChild {
  title: string;
  fullSlug: string;
  documentId: string;
}

export interface Page {
  documentId: string;
  title: string;
  fullSlug: string;
  text: string;
  publishedAt: string;
  featuredImage: SharedImageComponent | null;
  children: PageChild[];
}

export interface PagesResponse {
  data: {
    pages: Page[];
    global: {
      header: GlobalHeader;
    } | null;
  };
}

export interface StrapiEvent {
  event: string;
  createdAt: string;
  model: string;
  uid: string;
  entry: PageEntry;
}

interface PageEntry {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  category: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  fullSlug: string;
  includeInChildUrlPaths: null;
  parent: PageParent;
  children: any[]; // Array of page-like objects (incomplete structure)
  featuredImage: null;
}

interface PageParent {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  category: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  fullSlug: string;
  includeInChildUrlPaths: boolean | null;
}
