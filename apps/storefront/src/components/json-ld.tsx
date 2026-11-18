import { serializeJsonLd } from "@/lib/seo"

/** Structured data for search engines (schema.org JSON-LD). */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Escaped by serializeJsonLd, so product text can't break out of the script tag.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
