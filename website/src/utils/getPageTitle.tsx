import * as React from "react"
import { HeadFC } from "gatsby";

export default function getPageTitle(title: string): HeadFC {
  return () => <title>{title} | LYF Registration</title>
}