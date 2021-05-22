import locales from "../../config/i18n";
// use two-letter ISO 639-1 https://en.wikipedia.org/wiki/List_of_ISO_639-2_codes
export type TLanguageCodes = `en` | `zh` | `ko` | `es` | `fr` | `it` | `de` | `tr` | `id` | `pt` | `vi` | `fil`;

export const supportedLanguageCodes:TLanguageCodes[] = [`en`, `zh`, `ko`, `es`, `fr`, `it`, `de`, `tr`, `id`, `pt`, `vi`, `fil`];

export const getFullLanguage = (code:TLanguageCodes) => {
    switch (code) {
        case `zh`:
            return `中文`;
        case `ko`:
            return `한국어`;
        case `es`:
            return `Español`;
        case `fr`:
            return `Français`;
        case `it`:
            return `Italiano`;
        case `de`:
            return `Deutsch`;
        case `tr`:
            return `Türkçe`;
        case `id`:
            return `bahasa Indonesia`;
        case `pt`:
            return `português`;
        case `vi`:
            return `tiếng việt`;
        case `fil`:
            return `filipino`;
        case `en`:
        default:
            return `English`;
    }
};

export const getLanguageFlag = (code:TLanguageCodes) => {
    switch (code) {
        case `zh`:
            return `🇨🇳`;
        case `ko`:
            return `🇰🇷`;
        case `es`:
          return `🇪🇸`;
        case `fr`:
          return `🇫🇷`;
        case `it`:
          return `🇮🇹`;
        case `de`:
          return `🇩🇪`;
        case `tr`:
          return `🇹🇷`;
        case `id`:
          return `🇮🇩`;
        case `pt`:
          return `🇧🇷`;
        case `vi`:
          return `🇻🇳`;
        case `fil`:
          return `🇵🇭`;
        case `en`:
        default:
            return `🇺🇸`;
    }
};

export const createRelativePathForLocale = ({locale, to }: { locale: string, to: string }) => {
    const isIndex = to === `/`;

    // If it's the default language, don't do anything
    // If it's another language, add the "path"
    // However, if the homepage/index page is linked don't add the "to"
    // Because otherwise this would add a trailing slash
    const localeObject = (locales as any)[locale]!;
    const languageCode = localeObject.path
    
    const path = localeObject.default
    ? to
    : `/${languageCode}${isIndex ? `` : `${to}`}`;
    
    return path;
}
