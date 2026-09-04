import type { GatsbyConfig } from "gatsby"

// Served from a custom domain (see static/CNAME), so no pathPrefix. Change the
// CNAME file and this URL together at cutover.
const config: GatsbyConfig = {
  siteMetadata: {
    title: `TACL LYF Registration`,
    siteUrl: `https://v2.lyf-registration.tacl.org`,
  },
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: true,
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    {
      resolve: `gatsby-omni-font-loader`,
      options: {
        enableListener: true,
        preconnect: [`https://fonts.googleapis.com`, `https://fonts.gstatic.com`],
        web: [
          {
            name: `IBM Plex Mono`,
            file: `https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap`,
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "Register for TACL LYF",
        short_name: "LYF Registration",
        start_url: "/",
        background_color: "#29A19D",
        theme_color: "#29A19D",
        display: "standalone",
        icon: "static/lyf-logo-black.png",
      },
    },
  ],
}

export default config
