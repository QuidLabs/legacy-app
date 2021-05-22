import React from "react";
import { useStore } from "../../store/use-store";
import styled from "styled-components";
import moment from "moment";
import { media } from "../../utils/breakpoints";
import { observer } from 'mobx-react';
import { formatAsset } from '@deltalabs/eos-utils';
import { dec2asset } from '../../utils/format';

const Wrapper = styled.div`
  margin-bottom: 32px;
  width: 100%;
  padding: 16px;
  background-color: ${p => p.theme.colors.bgLight};
  font-size: 14px;
  font-weight: 300;
  border: 1px solid ${p => p.theme.colors.bgLightest};
  border-radius: ${p => p.theme.borderRadius2x};
`;

const LimitFieldsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 4px;
  margin-bottom: 4px;
`;

const LimitsField = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  
  :not(:last-child) {
    margin-right: 8px;
  }
`;

const LimitsFieldLabel = styled.div`
  margin-right: 4px;
  color: ${p => p.theme.colors.light};
`;

const LimitsFieldValue = styled.div`
  color: ${p => p.theme.colors.whiteDarkened};
`;

const LimitsTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const LimitsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  
  ${media.lessThan('smd')} {
    width: 100%;
  }
`;

const LimitsColumn = styled.div`
  flex-shrink: 0;
  :not(:last-child) {
    margin-right: 32px;
  }

  ${media.lessThan('smd')} {
    width: 100%;
  }
`;

const LimitsColumnTitle = styled.div`
  margin-right: 12px;
  margin-bottom: 4px;
  
  ${media.lessThan('smd')} {
    width: 100%;
  }
`;

const usdIntWithSeparators = (val:number) => {
  return formatAsset(dec2asset(Math.round(val), { code: 'USD', precision: 2 }), { separateThousands: true, withSymbol: false }).slice(0, -3)
}

const LimitsInfo: React.FC<{}> = () => {
  const [ vigorStore ] = useStore((store) => [ store.vigorStore ]);

  const usedAccountValue = usdIntWithSeparators(vigorStore.userWithdrawLimits.usedAccountValue);
  const allowedAccountValue = usdIntWithSeparators(vigorStore.userWithdrawLimits.allowedAccountValue);
  const perTxAllowed = usdIntWithSeparators(vigorStore.userWithdrawLimits.perTxAllowed);
  const available = usdIntWithSeparators(vigorStore.userWithdrawLimits.available);
  const used = usdIntWithSeparators(vigorStore.userWithdrawLimits.used);
  const totalAllowed = usdIntWithSeparators(vigorStore.userWithdrawLimits.totalAllowed);

  return (
    <Wrapper>
      <LimitsTitle>Limits</LimitsTitle>
      <LimitsRow>
        <LimitsColumn>
          <LimitFieldsWrap>
            <LimitsColumnTitle>Account</LimitsColumnTitle>
            <LimitsField>
              <LimitsFieldLabel>Total Value:</LimitsFieldLabel>
              <LimitsFieldValue>${ usedAccountValue } / ${ allowedAccountValue }</LimitsFieldValue>
            </LimitsField>
            <LimitsField>
              <LimitsFieldLabel>Per Transaction:</LimitsFieldLabel>
              <LimitsFieldValue>${ perTxAllowed }</LimitsFieldValue>
            </LimitsField>
          </LimitFieldsWrap>
        </LimitsColumn>
        <LimitsColumn>
          <LimitFieldsWrap>
            <LimitsColumnTitle>24h Withdrawal</LimitsColumnTitle>
            <LimitsField>
              <LimitsFieldLabel>Available:</LimitsFieldLabel>
              <LimitsFieldValue>${ available }</LimitsFieldValue>
            </LimitsField>
            <LimitsField>
              <LimitsFieldLabel>Used:</LimitsFieldLabel>
              <LimitsFieldValue>${ used } / ${ totalAllowed }</LimitsFieldValue>
            </LimitsField>
            <LimitsField>
              <LimitsFieldLabel>Reset:</LimitsFieldLabel>
              <LimitsFieldValue>{ moment(moment.utc(vigorStore.userWithdrawLimits.nextResetDate)).fromNow() }</LimitsFieldValue>
            </LimitsField>
          </LimitFieldsWrap>
        </LimitsColumn>
      </LimitsRow>
    </Wrapper>
  );
};

export default observer(LimitsInfo);
