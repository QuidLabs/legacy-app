const locales = require(`./config/i18n`);
const {
  removeTrailingSlash
} = require(`./src/utils/gatsby-node-helpers`);

const resources = require("./src/i18n/resources.json");

exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions;

  // First delete the incoming page that was automatically created by Gatsby
  // So everything in src/pages/
  deletePage(page);

  // Grab the keys ('en' & 'de') of locales and map over them
  Object.keys(locales).map(lang => {
    // Use the values defined in "locales" to construct the path
    const localizedPath = locales[lang].default
      ? page.path
      : `${locales[lang].path}${page.path}`;

    return createPage({
      // Pass on everything from the original page
      ...page,
      // Since page.path returns with a trailing slash (e.g. "/de/")
      // We want to remove that
      path: removeTrailingSlash(localizedPath),
      // Pass in the locale as context to every page
      // This context also gets passed to the src/components/layout file
      // This should ensure that the locale is available on every page
      context: {
        ...page.context,
        locale: lang,
        localeResources: resources[lang] ? resources[lang] : {},
        dateFormat: locales[lang].dateFormat
      }
    });
  });
};

// in gatsby-node.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const iltorb = require('iltorb');
const glob = require('glob');

exports.onPostBuild = () =>
  new Promise((resolve, reject) => {
    try {
      const publicPath = path.join(__dirname, 'public');
      const gzippableFiles = glob.sync(`${publicPath}/**/?(*.html|*.js|*.json|*.css|*.svg)`, { nodir: true });
      gzippableFiles.forEach((file) => {
        const content = fs.readFileSync(file);
        const zipped = zlib.gzipSync(content);
        fs.writeFileSync(`${file}.gz`, zipped);
        const brotlied = iltorb.compressSync(content);
        fs.writeFileSync(`${file}.br`, brotlied);
      });
    } catch (e) {
      console.error(e);
      reject(new Error('onPostBuild: Could not compress the files'));
    }

    resolve();
  });
