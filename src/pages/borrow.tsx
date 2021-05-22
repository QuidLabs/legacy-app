import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { ColoredInfoBox } from "../components/index/ColoredBox";
import { ResponsiveFlex, Section } from "../components/shared";
import { media } from "../utils/breakpoints";
import cryptoLoans from "../assets/images/icon-crypto-loans.svg";
import lowVolLoans from "../assets/images/icon-low-vol-loan.svg";

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


const Borrow: React.FC<GlobalProps> = props => {
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
          colorVariant="primary"
          icon={<img src={lowVolLoans} alt="Borrow VIG"/>}
          title={t(`borrow.stableTitle`)}
          buttonProps={{
            as: `localLink`,
            text: t(`borrow.startLoan`),
            to: `/borrow/vigor`
          }}
        >
          <React.Fragment>
            <Description>{t(`borrow.stableDescription`)}</Description>
          </React.Fragment>
        </ColoredInfoBox>
        <ColoredInfoBox
          width={320}
          padding="32px"
          colorVariant="primary"
          icon={<img src={cryptoLoans} alt="Borrow EOS"/>}
          title={t(`borrow.cryptoTitle`)}
          buttonProps={{
            as: `localLink`,
            text: t(`borrow.startLoan`),
            to: `/borrow/crypto`
          }}
        >
          <React.Fragment>
            <Description>{t(`borrow.cryptoDescription`)}</Description>
          </React.Fragment>
        </ColoredInfoBox>
      </BoxesWrapper>
    </Section>
  );
};

export default Borrow;
