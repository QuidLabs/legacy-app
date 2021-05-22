# vigor-app

The new Vigor app.

## Development

Uses [Gatsby.js](https://www.gatsbyjs.org/docs/) for static site rendering.

```bash
yarn install

# local development
yarn start

# creating static sites
yarn run build
# deploy from `public` folder
```

## Translations

To add a new language, add some language meta description to `config/i18n.js`.
Translations must be provided in `src/i18n/resources.json`.

> We use the two-letter [ISO_639 language codes](https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes) for defining language paths. Each language will result in their own static pages being built.

## Resources

* [Designs](https://projects.invisionapp.com/d/main/default/?origin=v7#/console/18858395/392928819/preview?newCollabSignupFlow=0&scrollOffset=0)
* [Project Management](https://trello.com/c/gCdojCJE/107-vigor-website-development)

