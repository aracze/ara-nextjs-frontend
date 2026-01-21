import qs from "qs";
import Fuse from "fuse.js";
import fs from "fs";
import path from "path";
import removeMd from "remove-markdown";
const strapiUrl = process.env.STRAPI_BASE_API_URL || "http://localhost:1337";

/*
 * Fetches data from Strapi, formats it using Fuse.js,
 * and creates search list and a search index. Saves
 * both to files within src/lib/data.
 */
export async function generateSearchIndex() {
  const query = qs.stringify(
    {
      populate: "*",
    },
    {
      encodeValuesOnly: true,
    },
  );
  const resp = await fetch(`${strapiUrl}/api/pages?${query}`, {
    method: "GET",
  });

  if (!resp.ok) {
    const err = await resp.text();

    try {
      const errResp = JSON.parse(err);
      console.log(errResp);
    } catch (err) {
      console.log(`There was a problem fetching data from Strapi: ${err}`);
    }
  } else {
    let indexData: Record<string, any>[] = [];
    let respData: Record<string, any>[] = [];
    const body = await resp.json();

    if (body?.error) {
      console.log(
        `There was a problem fetching data from Strapi: ${body.error}`,
      );
      return;
    } else {
      respData = body?.data || body;
    }

    // The search index data is created here
    respData.forEach((page: Record<string, any>) => {
      // Add the page itself to the index
      indexData.push({
        title: removeMd(page.attributes?.title || page.title),
        text: removeMd(page.attributes?.text || page.text),
        slug: page.attributes?.slug || page.slug,
        type: "Pages",
      });

      if (page["services"]) {
        page["services"].forEach((service: Record<string, any>) => {
          if (service["showcases"]) {
            service["showcases"].forEach((showcase: Record<string, any>) => {
              showcase["type"] = "Showcases";

              for (let key of [
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

          for (let key of [
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

    // The search list and search index are written
    // to src/lib/data here
    const writeToFile = (fileName: string, fileData: Record<string, any>) => {
      const dataDir = path.resolve(process.cwd(), "src/data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const fpath = path.join(dataDir, `${fileName}.json`);

      fs.writeFile(fpath, JSON.stringify(fileData, null, 2), (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`Search data file successfully written to ${fpath}`);
        }
      });
    };

    writeToFile("search_data", indexData);
    writeToFile("search_index", fuseIndex.toJSON());
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateSearchIndex().catch(console.error);
}
