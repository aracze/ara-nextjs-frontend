export interface StrapiMedia {
  url: string;
  alternativeText: string | null;
}

export interface Homepage {
  title: string;
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
  id: string | number;
  title: string;
  fullSlug: string;
  documentId: string;
  category?: string;
  featuredImage?: SharedImageComponent | null;
  children?: {
    docs: PageChild[];
  };
}

export interface Article {
  documentId: string;
  title: string;
  slug: string;
  text: string;
  category: string;
  publishedAt: string;
  featuredImage: SharedImageComponent | null;
}

export interface Page {
  id: string | number;
  title: string;
  fullSlug: string;
  category: PageCategory;
  text: string;
  publishedAt: string;
  featuredImage: SharedImageComponent | null;
  children: {
    docs: PageChild[];
  };
  articles: Article[];
}

export interface PagesResponse {
  data: {
    pages: Page[];
    global: {
      header: GlobalHeader;
    } | null;
    homepage: Homepage | null;
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
  children: unknown[]; // Array of page-like objects (incomplete structure)
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

export enum PageCategory {
  Misto_k_navstiveni = 'Místo k navštívení',
  Turisticky_cil = 'Turistický cíl',
  Mista = 'Místa',
  Prakticke_informace = 'Praktické informace',
  Vstupni_podminky = 'Vstupní podmínky',
  Cesta = 'Cesta',
  Pocasi = 'Počasí',
  Doprava = 'Doprava',
  Mena_a_ceny = 'Měna a ceny',
  Zdravi_a_bezpeci = 'Zdraví a bezpečí',
  Jazyk_a_kultura = 'Jazyk a kultura',
  Jidlo_a_pit = 'Jídlo a pití',
  Ubytovani = 'Ubytování',
  Clanky = 'Články',
}
