/**
 * Implement Gatsby's SSR APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/ssr-apis/
 */
import React from "react"

import { Providers, Layout } from "./src/components/App"

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://js.stripe.com https://*.sentry.io https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://*.stripe.com https://*.googleapis.com https://*.google.com https://*.firebaseio.com https://*.firebaseapp.com https://*.cloudfunctions.net https://firestore.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://*.sentry.io https://www.google-analytics.com https://stats.g.doubleclick.net wss://*.firebaseio.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://accounts.google.com https://lyf-registration.firebaseapp.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ")

export const onRenderBody = ({ setHtmlAttributes, setHeadComponents }) => {
  setHtmlAttributes({ lang: "en" })
  setHeadComponents([
    <meta
      key="csp"
      httpEquiv="Content-Security-Policy"
      content={cspDirectives}
    />,
  ])
}

export const wrapRootElement = ({ element }) => <Providers>{element}</Providers>
export const wrapPageElement = ({ element }) => <Layout>{element}</Layout>
 