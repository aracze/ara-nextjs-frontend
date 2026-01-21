export interface StrapiImage {
    url: string;
    alternativeText: string | null;
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
    };
}
