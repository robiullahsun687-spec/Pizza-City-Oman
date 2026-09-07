import { useEffect } from "react";

interface SeoProps {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
  schemaId?: string;
}

function upsertMetaByName(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertMetaByProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Lightweight head manager (no external dep). Updates title/meta/canonical/OG + optional JSON-LD. */
export default function Seo({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  noindex,
  schema,
  schemaId = "page-schema",
}: SeoProps) {
  useEffect(() => {
    document.title = title;
    upsertMetaByName("description", description);
    upsertMetaByName("robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertCanonical(canonical);

    upsertMetaByProperty("og:title", ogTitle || title);
    upsertMetaByProperty("og:description", ogDescription || description);
    upsertMetaByProperty("og:url", canonical);
    upsertMetaByProperty("og:type", "website");
    if (ogImage) {
      upsertMetaByProperty("og:image", ogImage);
      let tw = document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]');
      if (!tw) {
        tw = document.createElement("meta");
        tw.setAttribute("name", "twitter:image");
        document.head.appendChild(tw);
      }
      tw.setAttribute("content", ogImage);
    }
    upsertMetaByName("twitter:title", ogTitle || title);
    upsertMetaByName("twitter:description", ogDescription || description);

    // JSON-LD
    const prev = document.getElementById(schemaId);
    if (prev) prev.remove();
    if (schema) {
      const script = document.createElement("script");
      script.id = schemaId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      return () => {
        const el = document.getElementById(schemaId);
        if (el) el.remove();
      };
    }
    return undefined;
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, noindex, schema, schemaId]);

  return null;
}
