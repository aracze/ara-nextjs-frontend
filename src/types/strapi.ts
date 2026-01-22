export interface StrapiImage {
  url: string;
  alternativeText: string | null;
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
  image: StrapiImage | null;
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
  slug: string;
  documentId: string;
}

export interface Page {
  documentId: string;
  title: string;
  slug: string;
  text: string;
  publishedAt: string;
  featuredImage: StrapiImage | null;
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
