import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
  schema?: Record<string, any>;
}

const SEO = ({
  title,
  description,
  url,
  image = "https://mayuraheritagecrafts.com/logo/mayura-heritage-crafts-logo.jpeg",
  type = "website",
  schema,
}: SEOProps) => {
  const currentUrl = url || `https://mayuraheritagecrafts.com${window.location.pathname}`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:url" content={currentUrl} />

      {/* Canonical Link */}
      <link rel="canonical" href={currentUrl} />

      {/* JSON-LD Schema (GEO / Rich Snippets) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
