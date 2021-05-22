import React, { useEffect, useState } from 'react';
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import {
  HorizontalFlex, Section,
} from '../shared';
import { useStore } from "../../store/use-store";
import Log from '../shared/Log';
import { BailoutItem, TransferItem } from '../../types/eos';
import { FiExternalLink } from 'react-icons/all';
// @ts-ignore
import {Tr, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import styled, { css } from 'styled-components';
import ual from "../../../config/ual";
import { decomposeAssetNormalized } from '../../utils/format';
import { formatAsset } from '@deltalabs/eos-utils';
import LoadingIndicator from '../shared/LoadingIndicator';
import moment from 'moment';

const TdBase = styled(Td)`
  font-family: monospace;
  border-bottom: 1px solid ${p => p.theme.colors.bgLighter};
`;

// @ts-ignore
const TdDate = styled(TdBase)`
  width: 225px;
`;

// @ts-ignore
const TdDirection = styled(TdBase)`
  width: 94px;
`;

const Pagination = styled.div`
  display: flex;
  margin-top: 12px;
`;

const PaginationButton = css`
  padding: 6px 8px;
  border-radius: ${p => p.theme.borderRadius};
  background-color: ${p => p.theme.colors.bgLighter};
  margin-top: 4px;
  margin-bottom: 4px;
  outline: none;
  
  :hover {
    background-color: ${p => p.theme.colors.primary};
  }
  
  :disabled {
    color: ${p => p.theme.colors.bgLight};
    background-color: ${p => p.theme.colors.bgLighter};
    cursor: not-allowed;
  }
`;

const PaginationButtonPrev = styled.button`
  ${PaginationButton};
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
`;

const PaginationButtonNext = styled.button`
  ${PaginationButton};
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
`;

const PaginationNumber = styled.div`
  padding: 8px;
  background-color: ${p => p.theme.colors.bgLightest};
  box-shadow: 0 0 4px #000;
  z-index: 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  min-width: 36px;
  justify-content: center;
`;

const LoadingIndicatorWrap = styled.div`
    position: absolute;
    width: 100%;
    height: calc(100% - 32px);
    background: rgba(0,0,0,0.5);
    margin-top: 32px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;

const BailoutRow: React.FC<{item:BailoutItem}> = props => {
  const { item } = props;

  const logItemMoment = moment.utc(item.timestamp);
  const relativeTime = moment(logItemMoment).fromNow();
  const logItemDate = logItemMoment.toDate();

  return (
    <React.Fragment>
      <Tr>
        <TdDate title={relativeTime}>
          { `${logItemDate.toLocaleDateString()} ${logItemDate.toLocaleTimeString()}` }
        </TdDate>
        <TdBase>{ item.bailoutid }</TdBase>
        <TdBase>{ item.type }</TdBase>
      </Tr>
    </React.Fragment>
  );
};

const AccountBailoutLog: React.FC<{}> = () => {
  const { t } = useTranslation();
  const [historyStore, walletStore] = useStore((store) => [
    store.historyStore,
    store.walletStore,
  ]);
  const [ page, setPage ] = useState(0);
  const [ rows, setRows ] = useState(undefined);
  const [ isLoading, setIsLoading ] = useState(false);

  useEffect(() => {
    if (walletStore.isLoggedIn) {
      setIsLoading(true);
      historyStore.fetchBailouts(walletStore.accountName, page).then((bailouts) => {
        setRows(bailouts.map((bailout:BailoutItem) => <BailoutRow key={bailout.timestamp} item={bailout} />));
        setIsLoading(false);
      });
    }
  }, [page, walletStore.isLoggedIn]);

  return (
    <Section>
      <HorizontalFlex style={{ position: 'relative' }}>
        <Log
          title={t('history.bailouts.title')}
          headings={[
            t('log.bailout.tableHeadings.dateTime'),
            t('history.bailouts.tableHeadings.id'),
            t('history.transfers.tableHeadings.type'),
          ]}
          rows={rows}
          hasPagination={true}
        />
        { isLoading &&
        <LoadingIndicatorWrap>
          <div>{ t('log.loading') }</div>
          <LoadingIndicator />
        </LoadingIndicatorWrap>
        }
      </HorizontalFlex>
      <Pagination>
        <PaginationButtonPrev disabled={isLoading || page === 0} onClick={() => setPage(page > 0 ? page - 1 : 0)}>Prev</PaginationButtonPrev>
        <PaginationNumber>{ page + 1 }</PaginationNumber>
        <PaginationButtonNext disabled={isLoading} onClick={() => setPage(page + 1)}>Next</PaginationButtonNext>
      </Pagination>
    </Section>
  );
};

export default observer(AccountBailoutLog);
