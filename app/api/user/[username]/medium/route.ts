import { NextRequest } from "next/server";
import { parseStringPromise } from "xml2js";
import { MediumBlog } from "@/types/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    if (!username) {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }

    const url = `https://medium.com/feed/@${username}`;
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache feed for an hour
    });

    if (!response.ok) {
      return Response.json({ error: `Medium RSS feed returned ${response.status}` }, { status: response.status });
    }

    const xmlData = await response.text();

    const parserOption = { explicitArray: false };
    const result = await parseStringPromise(xmlData, parserOption);

    if (!result.rss || !result.rss.channel || !result.rss.channel.item) {
      return Response.json([]);
    }

    const items = Array.isArray(result.rss.channel.item)
      ? result.rss.channel.item
      : [result.rss.channel.item];

    // Format the blog posts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blogs: MediumBlog[] = items.map((item: any) => {
      let thumbnail = "";

      if (item["content:encoded"]) {
        const imgMatch = item["content:encoded"].match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch && imgMatch[1]) {
          thumbnail = imgMatch[1];
        }
      }

      if (!thumbnail && item["media:content"] && item["media:content"].$.url) {
        thumbnail = item["media:content"].$.url;
      }

      if (!thumbnail && item.enclosure && item.enclosure.$.url) {
        thumbnail = item.enclosure.$.url;
      }

      if (!thumbnail && item.description) {
        const descImgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
        if (descImgMatch && descImgMatch[1]) {
          thumbnail = descImgMatch[1];
        }
      }

      const previewText = item["content:encoded"]
        ? item["content:encoded"].replace(/<[^>]*>/g, "").substring(0, 300)
        : item.description
        ? item.description.replace(/<[^>]*>/g, "").substring(0, 300)
        : "No preview available";

      const categoriesStr = item.category
        ? Array.isArray(item.category)
          ? item.category.join(", ")
          : item.category
        : "";

      return {
        title: item.title || "No title",
        link: item.link || "",
        pubDate: item.pubDate || "",
        preview: previewText,
        categories: categoriesStr,
        thumbnail: thumbnail,
      };
    });

    return Response.json(blogs);
  } catch (error) {
    console.error("Error in medium API route:", error);
    return Response.json({ error: "Failed to parse Medium blogs" }, { status: 500 });
  }
}
