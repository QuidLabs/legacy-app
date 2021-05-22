import React, { useEffect, useState } from "react";
import styled from "styled-components";
// @ts-ignore
import { Table, Thead, Tbody, Tr, Th } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import LoadingIndicator from "./LoadingIndicator";
import { useTranslation } from "react-i18next";
import { media } from "../../utils/breakpoints";

const Wrapper = styled.div<any>`
  width: 100%;
  padding: 16px;
  margin-top: 32px;
  background-color: ${p => p.theme.colors.bgLight};
  font-size: 14px;
  font-weight: 300;
  border: 1px solid ${p => p.theme.colors.bgLightest};
  border-radius: ${p => p.theme.borderRadius2x};

  @media screen and (max-width: 40em) {
    .responsiveTable td.pivoted {
        display: flex;
        padding-left: 0 !important;
    }
    
    .responsiveTable td .tdBefore {
      display: none;
    }
  }
  
  @media screen and (max-width: 28em) {
    .responsiveTable td.pivoted {
       padding-left: 0 !important;
    }
  }

  ${p => p.hasPagination && `
    min-height: 448px;
  `}
`;

const TableTitleWrap = styled.div`
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid ${p => p.theme.colors.light};
  display: flex;
  justify-content: space-between;
  
  ${media.lessThan('sm')} {
    display: block;
  }
`;

const TableTitle = styled.div`
  font-size: 1.4rem;
`;

const TableSubtitle = styled.div`
  font-size: 1.2rem;
`;

const LoadingIndicatorWrap = styled.div`
  margin-top: 32px;
  text-align: center;
`;

const LoadMoreButton = styled.button`
  border-radius: ${p => p.theme.borderRadius};
  width: 100%;
  margin-top: 12px;
  padding: 8px;
  background-color: ${p => p.theme.colors.primary};
  font-weight: bold;
`;

const ThLeftAligned = styled(Th)`
  text-align: left;
`;

type Props = {
  title: string,
  subtitle?: string;
  headings: string[],
  rows: React.ReactElement[] | undefined;
  hasPagination?: boolean;
};

const Log: React.FC<Props> = props => {
  const { t } = useTranslation();
  const { title, subtitle, headings, rows, hasPagination } = props;

  const pagingSize = 10;
  const [ numEntriesToShow, setNumEntriesToShow ] = useState(pagingSize);

  const [rowsInView, setRowsInView ]= useState<any>();

  useEffect(() => {
    if (!hasPagination && rows && rows.length) {
      setRowsInView(rows.map((row, index) => {
        if (index > numEntriesToShow) {
          return null;
        }

        return row;
      }));
    } else {
      setRowsInView(rows);
    }
  }, [numEntriesToShow, rows]);

  return (
    <Wrapper hasPagination={hasPagination}>
      <TableTitleWrap>
        <TableTitle>{ title }</TableTitle>
        { subtitle && <TableSubtitle>{ subtitle }</TableSubtitle>}
      </TableTitleWrap>
      { !hasPagination && typeof rowsInView === 'undefined' &&
        <LoadingIndicatorWrap>
          <div>{ t('log.loading') }</div>
          <LoadingIndicator />
        </LoadingIndicatorWrap>
      }
      {
        rowsInView && !rowsInView.length && <div>No Data.</div>
      }
      {
        (rowsInView && rowsInView.length) ?
          <React.Fragment>
            <Table>
              <Thead>
                <Tr>
                  { headings && headings.map((heading, index) =>
                    <ThLeftAligned key={index}>{ heading }</ThLeftAligned>
                  )}
                </Tr>
              </Thead>
              <Tbody>{ rowsInView }</Tbody>
            </Table>
            { !hasPagination && numEntriesToShow <= rowsInView.length &&
              <LoadMoreButton onClick={() => setNumEntriesToShow(numEntriesToShow + pagingSize)}>{t('log.showMore')}</LoadMoreButton>
            }
          </React.Fragment> : ''
      }
    </Wrapper>
  );
};

export default Log;
