import qs from "qs";
import Fuse from "fuse.js";
import fs from "fs";
import path from "path";
import removeMd from "remove-markdown";
import type { PageData } from "@/types/search";
import type { ServiceData } from "@/types/search";
import type { ShowcaseData } from "@/types/search";

const cmsUrl = process.env.PAYLOAD_BASE_API_URL || "http://localhost:3000";

// The search list and search index are written to src/data here.
// Extracted so we can ALWAYS write the files (even empty ones) — the frontend
// build statically imports these JSON files, so if they are missing the build
// fails. Writing empty files on any CMS failure keeps the build resilient.
const writeToFile = (
  fileName: string,
  fileData: Record<string, unknown> | unknown,
) => {
  const dataDir = path.resolve(process.cwd(), "src/data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const fpath = path.join(dataDir, `${fileName}.json`);
  // Synchronous write so the file is guaranteed to exist before `next build`
  // starts (the generator runs as its own step in the Docker build).
  fs.writeFileSync(fpath, JSON.stringify(fileData, null, 2));
  console.log(`Search data file successfully written to ${fpath}`);
};

// Writes an empty-but-valid search index so the static imports resolve.
const writeEmptyIndex = () => {
  writeToFile("search_data", []);
  writeToFile("search_index", Fuse.createIndex(["title", "text"], []).toJSON());
};

// Payload vrací některá pole (např. `text`) jako rich-text objekt, ne řetězec.
// removeMd() by na ne-řetězci spadl (output.replace is not a function), proto
// odstraníme markdown jen z řetězců, jinak vrátíme prázdno.
const toPlainText = (value: unknown): string =>
  typeof value === "string" ? removeMd(value) : "";

/*
 * Fetches data from the CMS, formats it using Fuse.js, and creates a search
 * list and a search index. Saves both to files within src/data.
 *
 * On any failure (CMS unreachable, error response, …) it writes an empty index
 * instead of throwing, so the build never breaks when the CMS is not available
 * (e.g. during the GitHub Actions image build).
 */
export async function generateSearchIndex() {
  const query = qs.stringify(
    {
      depth: 2,
      limit: 200,
    },
    {
      encodeValuesOnly: true,
    },
  );

  let resp: Response;
  try {
    resp = await fetch(`${cmsUrl}/api/pages?${query}`, {
      method: "GET",
      cache: "no-store",
    });
  } catch (err) {
    console.log(
      `There was a problem reaching the CMS at ${cmsUrl}: ${err}. ` +
        `Writing an empty search index.`,
    );
    writeEmptyIndex();
    return;
  }

  if (!resp.ok) {
    const err = await resp.text();

    try {
      const errResp: unknown = JSON.parse(err);
      console.log(errResp);
    } catch (err) {
      console.log(`There was a problem fetching data from CMS: ${err}`);
    }
    writeEmptyIndex();
  } else {
    const indexData: Record<string, unknown>[] = [];
    let respData: PageData[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = await resp.json();

    if (body?.error) {
      console.log(`There was a problem fetching data from CMS: ${body.error}`);
      writeEmptyIndex();
      return;
    } else {
      respData = (body?.docs || body?.data || body) as PageData[];
    }

    // Zpracování obalíme try/catch — kdyby cokoli v datech mělo neočekávaný
    // tvar, build nesmí spadnout: v nejhorším zapíšeme prázdný index.
    try {
      // The search index data is created here
      respData.forEach((page: PageData) => {
        // Add the page itself to the index
        indexData.push({
          title: toPlainText(page.title),
          text: toPlainText(page.text),
          slug: (page.slug as string) || "",
          fullSlug: (page.fullSlug as string) || "",
          type: "Pages",
        });

        if (page.services) {
          page.services.forEach((service: ServiceData) => {
            if (service.showcases) {
              service.showcases.forEach((showcase: ShowcaseData) => {
                showcase["type"] = "Showcases";

                for (const key of [
                  "id",
                  "cover_image",
                  "createdAt",
                  "updatedAt",
                  "publishedAt",
                ]) {
                  delete showcase[key];
                }

                indexData.push(showcase);
              });
            }

            service["type"] = "Services";

            for (const key of [
              "showcases",
              "cover_image",
              "id",
              "createdAt",
              "updatedAt",
              "publishedAt",
            ]) {
              delete service[key];
            }

            indexData.push(service);
          });
        }
      });

      // The search index is pre-generated here
      const fuseIndex = Fuse.createIndex(
        ["title", "text", "name", "description", "link", "type"],
        indexData,
      );

      writeToFile("search_data", indexData);
      writeToFile("search_index", fuseIndex.toJSON());
    } catch (err) {
      console.log(
        `Chyba při zpracování dat z CMS: ${err}. Zapisuji prázdný index.`,
      );
      writeEmptyIndex();
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateSearchIndex().catch(console.error);
}
