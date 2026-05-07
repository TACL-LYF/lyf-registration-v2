<p align="center">
  <a href="https://lyf.tacl.org/">
    <img alt="LYF Logo" src="https://github.com/TACL-LYF/lyf-website/blob/main/static/lyf-logo-black.png" width="60" />
  </a>
</p>
<h1 align="center">
  TACL-LYF Website
</h1>

## Installation

First thing to do is make sure you have all the required tools installed

- `nvm`: node version management
  - Here's the [officail instruction](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating), or if you are a Mac and homebrew user (highly suggested if you are not) you can install with `brew install nvm`
  - nvm will allow you to have multiple version of node installed at the same time and make it easy to switch between
  - once installed, you can verify the installation with `nvm -v`
- `node`: we are currently on node v22.22.0, you can install it with `nvm install`
  - nvm should pick up the node version from the `.nvmrc` file, if not, try `nvm install 22.22.0`
  - once installed, you can verify the installation with `node -v`, you should see `v22.22.0`
- `yarn`: install yarn with `npm install -g yarn`
  - once installed, you can verify the installation with `yarn -v`
- `gatsby`: install with `yarn add -g gatsby-cli`
  - once installed, you can verify the installation with `gatsby -v`

Now you have all the required tool, next thing will be install the packages we use for the project

``` bash
# if you haven't change your directory to where this readme is at
cd website 

# make sure you are using the correct version of node
# you should see `Now using node v22.22.0` from this command
nvm use

# install the packages from package.json
yarn install
```

### Gatsby

## 🚀 Quick start

1.  **Start developing.**

    Create `.env` file under the `/website/` folder, add the values save in Bitwarden `lyf-registration env var` into the `.env`.

    Navigate into the site’s directory 

    ```shell
    cd website
    ```    
    
    and start it up.

    ``` bash
    # start the dev mode for gatsby
    gatsby develop

    # if you are developing gatsby along with firestore functions emulators, you will need:
    GATSBY_USE_EMULATORS=true gatsby develop
    ```

2.  **Open the code and start customizing!**

    Your site is now running at http://localhost:8000/ !

    Edit `src/pages/index.tsx` to see your site update in real-time!

3.  **Learn more about Gatsby**

    - [Documentation](https://www.gatsbyjs.com/docs/?utm_source=starter&utm_medium=readme&utm_campaign=minimal-starter-ts)

    - [Tutorials](https://www.gatsbyjs.com/tutorial/?utm_source=starter&utm_medium=readme&utm_campaign=minimal-starter-ts)

    - [Guides](https://www.gatsbyjs.com/tutorial/?utm_source=starter&utm_medium=readme&utm_campaign=minimal-starter-ts)

    - [API Reference](https://www.gatsbyjs.com/docs/api-reference/?utm_source=starter&utm_medium=readme&utm_campaign=minimal-starter-ts)

    - [Plugin Library](https://www.gatsbyjs.com/plugins?utm_source=starter&utm_medium=readme&utm_campaign=minimal-starter-ts)

    - [Cheat Sheet](https://www.gatsbyjs.com/docs/cheat-sheet/?utm_source=starter&utm_medium=readme&utm_campaign=minimal-starter-ts)

## Libraries Used

- [react-spring](https://beta.react-spring.dev/) for animations
- [MUI components](https://mui.com/) for base UI components

## File Structure

### Root Level Files

- [gatsby-config.ts](/gatsby-config.ts): This file contains all the configuration for the Gatsby site including what [plugins](https://www.gatsbyjs.com/plugins) we use and site metadata.
- [gatsby-browser.tsx](/gatsby-browser.tsx): Contains the [APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/) we call when events happen client-side on the browser
- [gatsby-ssr.tsx](/gatsby-ssr.tsx): Contains the [APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/) we call when events happen server-side during compilation
- [gatsby-node.tsx](/gatsby-node.tsx): Contains the [APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/) that plugins and we can use to build pages and do other cool things

### Directories

- [/pages/](/pages/): All of the hard-coded pages for the site. Gatsby takes each of these files and converts them to a page with the path `https://sitename.com/[filename]`
- [/components](/components/): All of the components that make up the site! Each folder represents related components such as the [Header](/components/Header/) folder which contains the sub components that make up the Header. Generally if a component is re-ususable it'll have its own subfoler under components
- [/hooks](/hooks/): Hooks are a [React-specific concept](https://reactjs.org/docs/hooks-intro.html) that enable functionality such as state and many other things
