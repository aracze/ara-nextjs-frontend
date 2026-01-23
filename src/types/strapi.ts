export interface StrapiMedia {
  url: string;
  alternativeText: string | null;
}

export interface SharedImageComponent {
  image: StrapiMedia | null;
  cloudinary: string | null;
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
  slug: string;
  documentId: string;
}

export interface Page {
  documentId: string;
  title: string;
  slug: string;
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
