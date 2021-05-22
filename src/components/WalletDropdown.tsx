import { observer } from "mobx-react";
import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useStore } from "../store/use-store";
import { InputStyle, HorizontalFlex } from "./shared";
import { formatAsset } from "@deltalabs/eos-utils";
import { media } from "../utils/breakpoints";

const Wrapper = styled(HorizontalFlex)`
  display: flex;
  justify-content: flex-end;
  width: initial;
  flex-shrink: 0;
  margin-right: 32px;
  
  ${media.lessThan('smd')} {
    margin-right: 16px;
  }
  
  @media (max-width: 601px) {
    width: 100%;
    margin-right: 0;
    order: 1;
    margin-top: 8px;
  }
`;

const WalletTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 400;
  margin-right: 8px;
`;

const Dropdown = styled.div`
  background: ${props => props.theme.colors.bgLighter};
  border-radius: ${p => p.theme.borderRadius};
`;

const SelectInput = styled.input`
  ${InputStyle};
  cursor: pointer;
  border: none;
  height: 36px;
  padding: 2px 8px;
  margin: 0 4px 0 0;
  background: ${props => props.theme.colors.bgLighter};
  color: ${(props) => props.theme.colors.white};
` as any;

const WalletDropdown: React.FC<{}> = props => {
  const { t } = useTranslation();
  const [walletStore] = useStore((store) => [
    store.walletStore,
  ]);

  const { selectedSymbol } = walletStore;

  const onSymbolChange = async (evt: any) => {
    await walletStore.selectSymbol(evt.target.value);
  }

  const walletBalances = walletStore.tokenBalances;

  if(!walletStore.isLoggedIn) return null;

  return (
    <Wrapper>
      <WalletTitle>{t(`walletBalances`)}</WalletTitle>
      <Dropdown>
        <SelectInput
          as="select"
          value={selectedSymbol.code}
          onChange={onSymbolChange}
        >
          {Object.values(walletBalances).map((asset) => (
            <option key={asset.symbol.code} value={asset.symbol.code}>
              {formatAsset(asset, { separateThousands: true })}
            </option>
          ))}
        </SelectInput>
      </Dropdown>
    </Wrapper>
  );
};

export default observer(WalletDropdown);
