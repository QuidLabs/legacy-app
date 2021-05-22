import React from "react";
import styled from "styled-components";
import { useStore } from "../../store/use-store";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { TActivityLogRow } from "../../types/eos";
// @ts-ignore
import {Tr, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { media } from "../../utils/breakpoints";
import {
  MdAdd,
  MdAttachMoney, MdCancel,
  MdDelete,
  MdDeleteForever, MdLocalActivity,
  MdMoneyOff,
  MdRemove,
  MdRotateRight,
} from "react-icons/md";
import moment from "moment";
import Log from "../shared/Log";
import { FiExternalLink, GiLifeBar } from "react-icons/all";
import { formatAsset } from "@deltalabs/eos-utils";
import { decomposeAssetNormalized } from "../../utils/format";

const Ellipsis = styled.div`
  position: relative;
  flex-grow: 1;

  &:before {
    content: '&nbsp;';
    visibility: hidden;
  }
  
  & > span {
    position: absolute;
    left: 0;
    right: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: monospace;
  }
`;

const TdBase = styled(Td)`
  font-family: monospace;
  border-bottom: 1px solid ${p => p.theme.colors.bgLighter};
`;

// @ts-ignore
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
`;

const FunctionIconWrap = styled.div`
  margin-right: 8px;
`;

const StyledTr = styled(Tr)`
  color: ${p => !!p.highlight ? p.theme.colors.primaryLighter : 'unset'};
`;

const getFunctionIcon = (logItem:TActivityLogRow) => {
  switch(logItem.function) {
    case 'dorewards':
      return <MdLocalActivity size={16} color={'#6DE4F0'}/>;
    case 'paybacktok':
      return <MdRotateRight size={16} color={'#009AFF'}/>;
    case 'recapup':
    case 'recap':
      return <MdAttachMoney size={16} color={'#F6D051'}/>;
    case 'liquidate':
    case 'liquidateup':
        return <MdCancel size={16} color={'#E14852'}/>;
    case 'bailoutup':
    case 'bailout':
      return <MdMoneyOff size={16} color={'#F6D051'}/>;
    case 'dodeleteacnt':
      return <MdDeleteForever size={16} color={'#949EA8'}/>;
    case 'kick':
      return <MdDelete size={16} color={'#949EA8'}/>;
    case 'assetin':
      return <MdAdd size={16} color={'#4ECCAE'}/>;
    case 'doassetout':
    case 'exassetout':
      return <MdRemove size={16} color={'#E14852'}/>;
    case 'collectfee':
    case 'viglifeline':
      return <GiLifeBar size={16} color={'#F6D051'} />
    default: return null;
  }
};

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

const formatMessage = (func: string, userName: string, message: string) => {  
  // console.log(userName, func, message);
  
  if (func === 'liquidate' || func === 'liquidateup' || func === 'kick') {
    return message.replace(`: ${ userName }`, '').trim();
  }

  if (func === 'dodeleteacnt' || func === 'collectfee') {
    return message.replace(`${ userName }`, '').trim();
  }

  const messageWithoutUserName = message.substring(message.indexOf(userName) + userName.length).trim();

  if (func === 'assetin') {
    const assetInFragment = 'assetin ';
    const memoFragment = ' with memo - ';

    const valueString = messageWithoutUserName.slice(messageWithoutUserName.indexOf(assetInFragment) + assetInFragment.length, messageWithoutUserName.indexOf(memoFragment));
    const actionString = messageWithoutUserName.slice(messageWithoutUserName.indexOf(memoFragment) + memoFragment.length);

    const asset = decomposeAssetNormalized(valueString);
    const assetFormatted = formatAsset(asset, { separateThousands: true });

    return `deposit ${assetFormatted} to ${actionString === 'insurance' ? 'lending/insurance' : actionString}`;
  }

  if (func === 'viglifeline') {
    const lifelineFragment = 'Success. ';
    const sourcedVIGFromString = messageWithoutUserName.slice(messageWithoutUserName.indexOf(lifelineFragment) + lifelineFragment.length);
    const vigFeesValueFragment = ' vigfees: ';

    const actionString = sourcedVIGFromString.slice(0, sourcedVIGFromString.indexOf(vigFeesValueFragment) + (vigFeesValueFragment.length - 2));
    const valueString = sourcedVIGFromString.slice(sourcedVIGFromString.indexOf(vigFeesValueFragment) + vigFeesValueFragment.length);

    const asset = decomposeAssetNormalized(valueString);
    const assetFormatted = formatAsset(asset, { separateThousands: true });

    return `Lifeline: ${assetFormatted} - ${actionString}`;
  }

  if (func === 'exassetout') {
    const withdrawLendingFragment = 'lending/insurance';
    const withdrawCollateralFragment = 'collateral';
    const withdrawVigFeesFragment = 'vigfees';
    const withdrawSavingsFragment = 'savings';
    const withdrawStakeRefundFragment = 'stakerefund';

    let actionString = '';
    let valueString = '';

    if (messageWithoutUserName.indexOf(withdrawLendingFragment) !== -1) {
      actionString = withdrawLendingFragment;
    }
    if (messageWithoutUserName.indexOf(withdrawCollateralFragment) !== -1) {
      actionString = withdrawCollateralFragment;
    }
    if (messageWithoutUserName.indexOf(withdrawVigFeesFragment) !== -1) {
      actionString = withdrawVigFeesFragment;
      valueString = messageWithoutUserName.slice(messageWithoutUserName.indexOf(withdrawVigFeesFragment + ' ') + (withdrawVigFeesFragment + ' ').length);
    }
    if (messageWithoutUserName.indexOf(withdrawSavingsFragment) !== -1) {
      actionString = withdrawSavingsFragment;
      valueString = messageWithoutUserName.slice(messageWithoutUserName.indexOf(withdrawSavingsFragment + ' ') + (withdrawSavingsFragment + ' ').length);
    }
    if (messageWithoutUserName.indexOf(withdrawStakeRefundFragment) !== -1) {
      actionString = withdrawStakeRefundFragment;
      valueString = messageWithoutUserName.slice(messageWithoutUserName.indexOf(withdrawStakeRefundFragment + ' ') + (withdrawStakeRefundFragment + ' ').length);
    }
    if (messageWithoutUserName.indexOf(' pool ') !== -1) {
      valueString = messageWithoutUserName.slice(messageWithoutUserName.indexOf(' pool ') + ' pool '.length);
    }
    if (messageWithoutUserName.indexOf(' l_debt ') !== -1) {
      valueString = messageWithoutUserName.slice(messageWithoutUserName.indexOf(' l_debt ') + ' l_debt '.length);
      actionString = 'crypto collateral'
    }
    if (messageWithoutUserName.indexOf(' against VIGOR ') !== -1) {
      valueString = messageWithoutUserName.slice(messageWithoutUserName.indexOf(' against VIGOR ') + ' against VIGOR '.length);
      actionString = ' crypto debt'
    }
    if (messageWithoutUserName.indexOf(' against crypto as collateral: ') !== -1) {
      valueString = messageWithoutUserName.slice(messageWithoutUserName.indexOf(' against crypto as collateral: ') + ' against crypto as collateral: '.length).trim();
      actionString = ' vigor debt '
    }

    try {
      const asset = decomposeAssetNormalized(valueString);
      const assetFormatted = formatAsset(asset, { separateThousands: true });

      return `withdraw ${assetFormatted} from ${actionString}`;
    } catch (e) {
      console.error('error formatting log message', message);
    }
  }

  return messageWithoutUserName;
};

const ActivityLog: React.FC<{}> = () => {
  const { t } = useTranslation();
  const [vigorStore, walletStore] = useStore((store) => [
    store.vigorStore,
    store.walletStore,
  ]);

  const rowElements = vigorStore.activityLog?.map((logItem:TActivityLogRow, index:number) => {
    const logItemMoment = moment.utc(logItem.timestamp);
    const relativeTime = moment(logItemMoment).fromNow();
    const logItemDate = logItemMoment.toDate();

    const formattedMessage = formatMessage(logItem.function, logItem.usern, logItem.message);
    const isLoggedInUser = walletStore.accountName === logItem.usern;

    return (
      <StyledTr key={index} highlight={isLoggedInUser ? 1 : 0}>
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
          <FunctionIconWrap title={ logItem.function }>
            { getFunctionIcon(logItem) }
          </FunctionIconWrap>
          <Ellipsis title={ formattedMessage }>
            <span>{ formattedMessage }</span>
          </Ellipsis>
        </LogItemMessage>
      </StyledTr>
    );
  });

  return (
    <Log
      title={t('log.activity.title')}
      headings={[
        t('log.activity.tableHeadings.dateTime'),
        t('log.activity.tableHeadings.account'),
        t('log.activity.tableHeadings.action'),
      ]}
      rows={rowElements}
    />
  );
};

export default observer(ActivityLog);
