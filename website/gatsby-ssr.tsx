/**
 * Implement Gatsby's SSR APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/ssr-apis/
 */
 import React from "react"

 import { Providers, Layout } from "./src/components/App"

 import * as Sentry from "@sentry/gatsby";
 Sentry.init({
    dsn: "https://3414e48dc3888601e6615b647e04b037@o4510758163251200.ingest.us.sentry.io/4510758330499072",
  });
 
 export const wrapRootElement = ({ element }) => <Providers>{element}</Providers>
 export const wrapPageElement = ({ element }) => <Layout>{element}</Layout>
 