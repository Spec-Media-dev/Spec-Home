type JsonLdProps = {
  data: unknown;
};

/**
 * Server-rendered so crawlers see the graph without executing JavaScript.
 * `<` is escaped to prevent a stored string from closing the script element.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\u003c"),
      }}
    />
  );
}
