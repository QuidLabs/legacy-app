const packageJson = require(`./package.json`)

const version = packageJson.version

// populate process.env, same technique that dotenv does
// and using dotenv in gatsby-cofnig is recommended
// need to prefix with GATSBY_ to be available in browser
const key = `GATSBY_VERSION`
if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
  process.env[key] = version
}

const config = {
  siteMetadata: {},
  // pathPrefix: "/vigor-app",
  plugins: [
    {
      resolve: "gatsby-plugin-typescript",
      options: {},
    },
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /assets\/svgs/ // do not mix svgs with non-vectors
        }
      }
    },
    {
      resolve: "gatsby-plugin-styled-components",
      options: {
        // Add any options here
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Vigor Protocol`,
        short_name: `Vigor`,
        start_url: `/`,
        background_color: `#1E212E`,
        theme_color: `#4468CC`,
        display: `standalone`,
        icon: `src/assets/images/favicon.png`
      },
    },
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        precachePages: [`/`],
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-transformer-json`
  ],
};

if(process.env.BUILD_TYPE === `ipfs`) {
  config.pathPrefix = `__GATSBY_IPFS_PATH_PREFIX__`
  config.plugins.unshift( 'gatsby-plugin-ipfs',)
}

module.exports = config