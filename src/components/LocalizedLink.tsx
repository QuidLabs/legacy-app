import React from "react";
import styled from "styled-components";
import { Link } from "gatsby";
import LocaleContext from "../localeContext";
import trim from 'lodash/trim'
import locales from "../../config/i18n";
import { createRelativePathForLocale } from "../utils/languages";

type Props = {
  to: string;
};

const StyledLink = styled(Link)`
  color: ${props => props.theme.colors.white};
`;

// Use the globally available context to choose the right path
const LocalizedLink: React.FC<Props> = ({ to, ...props }) => {
  const { locale } = React.useContext<{ locale: string }>(LocaleContext);

  const path = createRelativePathForLocale({ locale, to })

  return <StyledLink {...props} to={path} />;
};

type LocalizedChangeLanguageLinkProps = {
  locale: string;
  currentPath: string;
};
export const LocalizedChangeLanguageLink: React.FC<LocalizedChangeLanguageLinkProps> = ({
  locale: desiredLocale,
  currentPath,
  ...props
}) => {
  const { locale } = React.useContext<{ locale: string }>(LocaleContext);
  const currentLocaleObj = (locales as any)[locale]!;
  const desiredLocaleObj = (locales as any)[desiredLocale]!;

  let pathWithoutLanguage = ``;
  currentPath = trim(currentPath, `/`);
  if (currentLocaleObj.default) {
    pathWithoutLanguage = currentPath;
  } else {
    const splits = currentPath.split(`/`);
    pathWithoutLanguage = splits.slice(1).join(`/`);
  }

  const path = desiredLocaleObj.default
    ? `/${pathWithoutLanguage}`
    : `/${desiredLocale}/${pathWithoutLanguage}`;

  return <StyledLink {...props} to={path} />;
};

export default LocalizedLink;
