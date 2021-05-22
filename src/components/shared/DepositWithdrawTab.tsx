import React from "react";
import styled from "styled-components";
import { HorizontalFlex } from "./helpers";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div<any>`
  width: 100%;
  max-width: 480px;
  background-color: ${p => p.theme.colors.bgLight};
  border: 1px solid ${p => p.theme.colors[p.colorVariant]};
  border-radius: ${p => p.theme.borderRadius2x};
  overflow: hidden;
`;

const TabHeader = styled(HorizontalFlex)`
  justify-content: space-between;
    border-bottom: 1px solid ${p => p.theme.colors.bgLighter};
`;
const TabHeaderItem = styled.button<any>`
  width: 100%;
  outline: none;
  text-align: center;
  font-size: 1.4rem;
  padding: 16px 0;
  background-color: ${p => p.highlight ? p.theme.colors.bgLightest : p.theme.colors.bgLight};
`;

type DepositWithdrawTabProps = {
  children: React.ReactElement[];
  colorVariant: "primary" | "secondary";
  className?: string;
  tabTitles?: string[]
};

const DepositWithdrawTab: React.FC<DepositWithdrawTabProps> = props => {
  const { children, className, colorVariant } = props;
  const [activeIndex, setIndex] = React.useState<number>(0);
  const { t } = useTranslation();
  const tabTitles = props.tabTitles || [];

  return (
    <Wrapper className={className} colorVariant={colorVariant}>
      <TabHeader colorVariant={colorVariant}>
        <TabHeaderItem onClick={() => setIndex(0)} highlight={activeIndex === 0}>
          {tabTitles[0] || t(`deposit`)}
        </TabHeaderItem>
        <TabHeaderItem onClick={() => setIndex(1)} highlight={activeIndex === 1}>
          {tabTitles[1] || t(`withdraw`)}
        </TabHeaderItem>
      </TabHeader>
      {React.Children.toArray(children)[activeIndex]}
    </Wrapper>
  );
};

export default DepositWithdrawTab;
