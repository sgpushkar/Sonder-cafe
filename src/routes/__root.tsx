import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import cafeHero from "@/assets/cafe-hero.jpg";
import appCss from "../styles.css?url";

const siteUrl = (
  import.meta.env.VITE_SITE_URL || "https://sonder-cafe.vercel.app"
).replace(/\/$/, "");
const cafeHeroUrl = `${siteUrl}${cafeHero.startsWith("/") ? cafeHero : `/${cafeHero}`}`;

const cafeStructuredData = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: "Sonder Cafe",
  url: siteUrl,
  image: cafeHeroUrl,
  description:
    "A quiet cafe in Bandra serving slow coffee, honey croissants, and rainy afternoons.",
  telephone: "+91 98200 00000",
  priceRange: "Rs. 160 - Rs. 340",
  servesCuisine: ["Coffee", "Tea", "Bakery", "Dessert"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "12 Bandra Lane",
    addressLocality: "Mumbai",
    addressRegion: "Maharashtra",
    addressCountry: "IN",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "07:00",
      closes: "23:00",
    },
  ],
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sonder Cafe | Slow Coffee in Bandra, Mumbai" },
      {
        name: "description",
        content:
          "Sonder Cafe is a quiet Bandra cafe serving slow coffee, tea, honey croissants, bakery bites, and rainy afternoon atmosphere from 7 am to 11 pm.",
      },
      { name: "robots", content: "index, follow" },
      {
        name: "keywords",
        content:
          "Sonder Cafe, Bandra cafe, Mumbai coffee shop, slow coffee, honey croissant, cafe in Bandra",
      },
      { name: "author", content: "Sonder Cafe" },
      { name: "theme-color", content: "#1c120c" },
      { property: "og:site_name", content: "Sonder Cafe" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:site", content: "@sondercafe" },
    ],
    links: [
      { rel: "canonical", href: siteUrl },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(cafeStructuredData),
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
