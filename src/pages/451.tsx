import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Section } from "../components/shared";

const Header = styled.h1`
  font-size: 2rem;
  margin-bottom: 64px;
  white-space: pre-wrap;
  text-align: center;
`;

const Blocked: React.FC<GlobalProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Section>
      <Header>{t(`blocked.title`)}</Header>
    </Section>
  );
};

export default Blocked;
