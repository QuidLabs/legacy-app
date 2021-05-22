import React, { useState } from "react";
import styled from "styled-components";
import { useStore } from "../../store/use-store";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { TBailoutLogRow } from "../../types/eos";
// @ts-ignore
import {Tr, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { media } from "../../utils/breakpoints";
import {
  MdAttachMoney,
  MdCancel,
} from "react-icons/md";
import moment from "moment";
import Log from "../shared/Log";
import { decomposeAsset, formatAsset } from "@deltalabs/eos-utils";
import { decomposeAssetNormalized } from "../../utils/format";
import { FiExternalLink } from "react-icons/all";

const Ellipsis = styled.div`
  position: relative;
  flex-grow: 1;

  &:before {
    content: '&nbsp;';
    visibility: hidden; 
  }
  
  span {
    font-family: monospace;
  }
  
  & > span {
    position: absolute;
    left: 0;
    right: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const TdBase = styled(Td)`
  font-family: monospace;
  border-bottom: 1px solid ${p => p.theme.colors.bgLighter};
`;

const LogItemDate = styled(TdBase)`
  width: 160px;

  ${media.lessThan('sm')} {
    width: unset;
  }
`;

const LogItemUser = styled(TdBase)`
  width: 130px;
    
  ${media.lessThan('sm')} {
    width: unset;
  }
`;

const LogItemMessage = styled(TdBase)`
  display: flex;
  
  & > span {
    font-family: monospace;
    width: 59px;
    display: inline-block;
    text-align: right;
  }
`;

const FunctionIconWrap = styled.div`
  margin-right: 8px;
`;

const StyledTr = styled(Tr)`
  color: ${p => !!p.highlight ? p.theme.colors.primaryLighter : 'unset'};
`;

const StyledParentTr = styled(StyledTr)`
  cursor: pointer;
`;

const StyledChildTr = styled(StyledTr)`
  @media screen and (max-width: 40em) {
    padding-left: 32px !important;
  }
`;

const TdHidden = styled(TdBase)`
  @media screen and (max-width: 40em) {
    &.pivoted {
        display: none !important;
    }
  }
`;

const getFunctionIcon = (logItem:TBailoutLogRow) => {
  switch(logItem.type) {
    case 'recap':
    case 'recapup':
      return <MdAttachMoney size={16} color={'#F6D051'}/>;
    case 'liquidate':
    case 'liquidateup':
      return <MdCancel size={16} color={'#E14852'}/>;
    default: return null;
  }
};

const getValueString = (values:string[]) => {
  return values.map((debt:string, index:number) => {
    const asset = decomposeAssetNormalized(debt);

    let debtItem = formatAsset(asset, { separateThousands: true, withSymbol: true});

    if (index > 0) {
      return  ', ' + debtItem;
    }

    return debtItem;
  });
}

const AccountPageLink = styled.a`
  font-family: inherit;
  :hover,
  :active,
  :focus {
    font-weight: bold;
  }
  
  display: flex;
  > div {
    color: ${p => p.theme.colors.primary};
    margin-right: 4px;
  }
`;

const BailoutLogRow: React.FC<{logItem:TBailoutLogRow, loggedInUser:string | undefined, recapItems:TBailoutLogRow[] | undefined}> = props => {
  const { logItem, loggedInUser, recapItems } = props;

  const logItemMoment = moment.utc(logItem.timestamp);
  const relativeTime = moment(logItemMoment).fromNow();
  const logItemDate = logItemMoment.toDate();
  const isLoggedInUser = loggedInUser === logItem.usern;

  const [ showDetails, setShowDetails ] = useState(false);

  return (
    <React.Fragment>
      <StyledParentTr highlight={isLoggedInUser ? 1 : 0} onClick={() => setShowDetails(!showDetails)}>
        <LogItemDate title={`${logItemDate.toLocaleDateString()} ${logItemDate.toLocaleTimeString()}`}>
          { relativeTime }
        </LogItemDate>
        <LogItemUser>
          <AccountPageLink rel="noreferrer noopener" target="_blank" href={`https://bloks.io/account/${logItem.usern}`}>
            <div>
              <FiExternalLink size={11}/>
            </div>
            { logItem.usern }
          </AccountPageLink>
        </LogItemUser>
        <LogItemMessage>
          <FunctionIconWrap title={ logItem.type }>
            { getFunctionIcon(logItem) }
          </FunctionIconWrap>
          { logItem.type }
        </LogItemMessage>
        <TdBase>
          <Ellipsis title={ getValueString(logItem.debt).join('') }>
            <span>
              { getValueString(logItem.debt) }
            </span>
          </Ellipsis>
        </TdBase>
        <TdBase>
          <Ellipsis title={ getValueString(logItem.collateral).join('') }>
            <span>
              { getValueString(logItem.collateral) }
            </span>
          </Ellipsis>
        </TdBase>
      </StyledParentTr>
      { showDetails && createRecapItems(logItem.bailoutid, loggedInUser, recapItems)}
    </React.Fragment>
  );
}

const createRecapItems = (bailoutId:number, loggedInUsername:string | undefined, items:TBailoutLogRow[] | undefined) => {
  if (!items || !items.length) {
    return null;
  }

  return (
    <React.Fragment>
      { items.map((recapItem, index) =>
        <StyledChildTr key={index} highlight={recapItem.usern === loggedInUsername ? 1 : 0}>
          <TdHidden/>
          <LogItemUser>
            { recapItem.usern }
          </LogItemUser>
          <LogItemMessage>
            <FunctionIconWrap>
              { getFunctionIcon(recapItem) }
            </FunctionIconWrap>
            { recapItem.type }: <span>{(Number(recapItem.pcts) * 100).toFixed(2)}%</span>
          </LogItemMessage>
          <TdBase>
            <Ellipsis title={ getValueString(recapItem.debt).join('') }>
            <span>
              { getValueString(recapItem.debt) }
            </span>
            </Ellipsis>
          </TdBase>
          <TdBase>
          <Ellipsis title={ getValueString(recapItem.collateral).join('') }>
            <span>
              { getValueString(recapItem.collateral) }
            </span>
            </Ellipsis>
          </TdBase>
        </StyledChildTr>
      )}
    </React.Fragment>
  );
};


const BailoutLog: React.FC<{}> = props => {
  const { t } = useTranslation();
  const [vigorStore, walletStore] = useStore((store) => [
    store.vigorStore,
    store.walletStore,
  ]);

  const rowElements = vigorStore.bailoutLog?.filter(item => item.type === 'liquidate' || item.type === 'liquidateup')
    .map((logItem:TBailoutLogRow, index:number) => {
      const recapItems = vigorStore.bailoutLog?.filter(
        (item => item.bailoutid === logItem.bailoutid && (item.type !== 'liquidate' && item.type !== 'liquidateup'))
      );

      return (
        <BailoutLogRow key={index} logItem={logItem} loggedInUser={walletStore.accountName} recapItems={recapItems}/>
      );
  });

  return (
    <Log
      title={t('log.bailout.title')}
      subtitle={t('log.bailout.subtitle')}
      headings={[
          t('log.bailout.tableHeadings.dateTime'),
          t('log.bailout.tableHeadings.account'),
          t('log.bailout.tableHeadings.action'),
          t('log.bailout.tableHeadings.debt'),
          t('log.bailout.tableHeadings.collateral'),
      ]}
      rows={rowElements}
    />
  );
};

export default observer(BailoutLog);
