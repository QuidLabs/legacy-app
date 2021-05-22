import React from "react";
import styled from "styled-components";
import { PageSubtitle, PageTitle } from "../components/shared/PageTitle";
import { useTranslation } from "react-i18next";
import { Section } from "./shared";

const ErrorBox = styled.pre`
  width: 100%;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: break-word;
  font-size: 0.8rem;
  color: ${(p) => p.theme.colors.bgLightest};
`;

type Props = {
  error?: Error;
  componentStack?: string;
};
const ErrorFallback: React.FC<Props> = ({ error, componentStack }) => {
  const { t } = useTranslation();
  const errorMessage = `${error ? error.message : JSON.stringify(error)}${
    componentStack || ``
  }
${typeof window !== `undefined` ? window.location.toString() : `N/A`}
`;

  return (
    <Section>
      <PageTitle>{t(`errorFallback.title`)}</PageTitle>
      <PageSubtitle>{t(`errorFallback.subtitle`)}</PageSubtitle>

      <ErrorBox>{btoa(errorMessage)}</ErrorBox>
    </Section>
  );
};

export default ErrorFallback;
