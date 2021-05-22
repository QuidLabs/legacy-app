import React, { useEffect, useState } from 'react';
import { useStore } from "../../store/use-store";
import styled from "styled-components";
import { media } from "../../utils/breakpoints";
import { useTranslation } from "react-i18next";
import {
  ResponsiveFlex,
  BlueButton,
  HorizontalFlex,
} from '../shared';
import { observer } from "mobx-react";
import { formatAsset } from "@deltalabs/eos-utils";
import { MdInfoOutline } from 'react-icons/all';
import { MODAL_TYPES } from '../../store/modal';
import { symbolCode2Symbol } from '../../utils/tokens';

const Wrapper = styled.div`
  width: 100%;
  padding: 24px;
  margin: 0 0 32px 0;
  background-color: ${(p) => p.theme.colors.bgLight};
  font-size: 14px;
  font-weight: 300;
  border: 1px solid ${(p) => p.theme.colors.primary};
  border-radius: ${p => p.theme.borderRadius2x};
`;

const Block = styled.div`
  flex-shrink: 0;
  white-space: nowrap;
  
  ${media.lessThan('sm')} {
    width: 50%;
    margin-bottom: 24px;
  }
  
  ${media.lessThan(`xs`)} {
    margin-bottom: 0;
    width: 100%;
  }
`;

const Title = styled.h3`
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  align-self: flex-start;
  
  ${media.lessThan('sm')} {
    margin-bottom: 24px;
  }
  
  ${media.lessThan('xs')} {
    margin-bottom: 0;
  }
`;

const CategoryTitle = styled.h4`
  display: flex;
  font-size: 16px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.bgLightest};
  margin: 0 0 8px 0; 
  
  ${media.lessThan('xs')} {
    margin-top: 24px;
  }
`;

const StyledMdInfoOutlineIcon = styled(MdInfoOutline)`
  margin-left: 4px;
  color: ${p => p.theme.colors.primary};
`;

const CategoryValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  
  ${media.lessThan(`md`)} {
    font-size: 16px;
  }
`;

const BalanceTitle = styled<any>(CategoryTitle)`
  color: ${(p) => p.theme.colors.white};
  margin-top: 0;
`;

const Balance = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${(p) => p.theme.colors.secondary};
  text-align: right;
  margin-bottom: 16px;

  ${media.lessThan(`md`)} {
    font-size: 16px;
  }

  ${media.lessThan(`xs-max`)} {
    text-align: left;
    margin-bottom: 0;
  }
`;

const BalanceFlow = styled.div<{ positive: boolean }>`
  margin-top: 4px;
  font-size: 12px;
  color: ${ (p) => p.positive ? p.theme.colors.success : p.theme.colors.error };
`;

// @ts-ignore
const ResponsiveFlexWrapping = styled(ResponsiveFlex)`
  flex-wrap: wrap;
`;

const ButtonWrap = styled.div`
  margin-top: 16px;

  ${media.lessThan('sm')} {
    margin-top: 0;
    width: 100%;
  }
  
  ${media.lessThan('xs')} {
    margin-top: 16px;
  }
`;

type Props = {
  netVigEquivalentPerDayInUsd?: number,
}

const FeesInfo: React.FC<Props> = (props) => {
  const { netVigEquivalentPerDayInUsd } = props;
  const [ netVigDaily, setNetVigDaily ] = useState<string>('');

  const { t } = useTranslation();
  const [vigorStore, modalStore, priceFeedStore ] = useStore((store) => [
    store.vigorStore,
    store.modalStore,
    store.priceFeedStore,
  ]);

  const handleDepositWithdrawClick = async () => {
    const response = await modalStore.openModal(
      MODAL_TYPES.DEPOSIT_WITHDRAW_FEES
    );
    console.log('modal response', response);
  }

  useEffect(() => {
    if (netVigEquivalentPerDayInUsd) {
      const netVigDaily = formatAsset(priceFeedStore.convertUsd2Token(netVigEquivalentPerDayInUsd, symbolCode2Symbol('VIG')), {
        separateThousands: true,
      });

      setNetVigDaily(netVigDaily.startsWith('-') ? netVigDaily : `+${netVigDaily}`);
    }
  }, [ netVigEquivalentPerDayInUsd ])

  return (
    <Wrapper>
      <ResponsiveFlexWrapping
        alignItems="flex-end"
        responsiveAlignItems="flex-start"
        justifyContent="space-between"
      >
        <Title>{t(`user.fees.title`)}</Title>
        <Block>
          <BalanceTitle>{t(`balance`)}</BalanceTitle>
          <Balance>
            {formatAsset(vigorStore.userFeesBalance, {
              separateThousands: true,
            })}
            { netVigEquivalentPerDayInUsd !== 0 && netVigDaily &&
              <BalanceFlow positive={ netVigDaily.startsWith('+') }>
                { netVigDaily }/day
              </BalanceFlow>
            }
          </Balance>
        </Block>
      </ResponsiveFlexWrapping>
      <ResponsiveFlexWrapping
        alignItems="flex-end"
        responsiveAlignItems="flex-start"
        justifyContent="space-between"
      >
        <HorizontalFlex justifyContent="space-between" style={{ flexWrap: 'wrap' }}>
          <Block>
            <CategoryTitle>
              <div>{t(`user.fees.vigRewards`)}</div>
              <StyledMdInfoOutlineIcon size={19} data-tip={t('user.fees.vigRewardsToolTip')} data-place='top'/>
            </CategoryTitle>
            <CategoryValue>
              {formatAsset(vigorStore.userTotalVigRewards, {
                separateThousands: true,
              })}
            </CategoryValue>
          </Block>
          <Block>
            <CategoryTitle>
              <div>{t(`user.fees.eosRewards`)}</div>
              <StyledMdInfoOutlineIcon size={19} data-tip={t('user.fees.eosRewardsToolTip')} data-place='top'/>
            </CategoryTitle>
            <CategoryValue>
              {formatAsset(vigorStore.userRexRewards, {
                separateThousands: true,
              })}
            </CategoryValue>
          </Block>
          <Block>
            <CategoryTitle>
              <div>{t(`user.fees.vigorRewards`)}</div>
              <StyledMdInfoOutlineIcon size={19} data-tip={t('user.fees.vigorRewardsToolTip')} data-place='top'/>
            </CategoryTitle>
            <CategoryValue>
              {formatAsset(vigorStore.userVigorRewards, {
                separateThousands: true,
              })}
            </CategoryValue>
          </Block>
          <Block>
            <CategoryTitle>
              <div>{t(`user.fees.feesPaid`)}</div>
              <StyledMdInfoOutlineIcon size={19} data-tip={t('user.fees.feesPaidToolTip')} data-place='top'/>
            </CategoryTitle>
            <CategoryValue>
              {formatAsset(vigorStore.userTotalPremiums, {
                separateThousands: true,
              })}
            </CategoryValue>
          </Block>
        </HorizontalFlex>
        <ButtonWrap>
          <BlueButton
            type="button"
            fullWidth
            onClick={handleDepositWithdrawClick}
            colorVariant="primary"
          >
            {t(`deposit`)} / {t(`withdraw`)}
          </BlueButton>
        </ButtonWrap>
      </ResponsiveFlexWrapping>
    </Wrapper>
  );
};

export default observer(FeesInfo);
