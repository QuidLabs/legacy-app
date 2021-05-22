import React from 'react';
import { observer } from "mobx-react";
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import TransferLog from '../components/history/TransferLog';
import AccountBailoutLog from '../components/history/AccountBailoutLog';
import styled from 'styled-components';

const Hint = styled.div`
  padding: 16px 12px;
  background-color: ${p => p.theme.colors.primaryLighter};
  border-radius: ${p => p.theme.borderRadius};
  font-weight: normal;
`;

const History: React.FC<{}> = (props) => {
  return (
    <div>
      <Hint>
        Please note that data displayed on this page may be delayed by up to 24 hours.
      </Hint>
      <TransferLog />
      <AccountBailoutLog />
    </div>
  );
};

export default observer(History);
