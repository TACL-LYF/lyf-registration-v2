import type { GatsbyConfig } from "gatsby"

// Hosting mode is decided by GATSBY_CUSTOM_DOMAIN (set as a GitHub Actions
// repository variable):
//   unset  -> served from tacl-lyf.github.io/lyf-registration-v2, so assets
//             need the repo-name prefix (build with --prefix-paths)
//   set    -> served from that domain at the root; the deploy workflow also
//             writes it into public/CNAME
// Staging is v2.lyf-registration.tacl.org; at cutover change the variable to
// lyf-registration.tacl.org. No code change either way.
const customDomain = process.env.GATSBY_CUSTOM_DOMAIN
const repoPrefix = `/lyf-registration-v2`

const config: GatsbyConfig = {
  ...(customDomain ? {} : { pathPrefix: repoPrefix }),
  siteMetadata: {
    title: `TACL LYF Registration`,
    siteUrl: customDomain
      ? `https://${customDomain}`
      : `https://tacl-lyf.github.io${repoPrefix}`,
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
