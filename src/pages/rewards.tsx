import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { ColoredInfoBox } from "../components/index/ColoredBox";
import { ResponsiveFlex, Section } from "../components/shared";
import { media } from "../utils/breakpoints";
import leaseSrc from "../assets/images/icon-become-lender.svg";
import moneyBoxSrc from "../assets/images/icon-saving.svg";

const Description = styled.div`
  margin-bottom: 16px;
`;

const BoxesWrapper = styled(ResponsiveFlex)`
  & > :first-child {
    margin: 0 32px 0 0;
  }

  ${media.lessThan(`xs-max`)} {
    & > :first-child {
      margin: 0 0 32px 0;
    }
  }
`;


const Earn: React.FC<GlobalProps> = props => {
  const { t } = useTranslation();

  return (
    <Section>
      <BoxesWrapper
        alignItems="stretch"
        responsiveAlignItems="center"
        margin="48px 0 0 0"
      >
        <ColoredInfoBox
          width={320}
          padding="32px"
          colorVariant="secondary"
          icon={<img src={leaseSrc} alt="Insure"/>}
          title={t(`earn.insureTitle`)}
          buttonProps={{
            as: `localLink`,
            text: t(`earn.insureButton`),
            to: `/rewards/insure`
          }}
        >
          <React.Fragment>
            <Description>{t(`earn.insureDescription`)}</Description>
          </React.Fragment>
        </ColoredInfoBox>
        <ColoredInfoBox
          width={320}
          padding="32px"
          colorVariant="secondary"
          icon={<img src={moneyBoxSrc} alt="Save"/>}
          title={t(`earn.savingsTitle`)}
          buttonProps={{
            as: `localLink`,
            text: t(`earn.savingsButton`),
            to: `/rewards/savings`
          }}
        >
          <React.Fragment>
            <Description>{t(`earn.savingsDescription`)}</Description>
          </React.Fragment>
        </ColoredInfoBox>
      </BoxesWrapper>
    </Section>
  );
};

export default Earn;
