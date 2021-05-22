import React, { useEffect, useState } from "react";
import styled from "styled-components";
import LocalizedLink from "./LocalizedLink";
import VigorLogo from "./VigorLogo";
import Nav from "./Nav";
import BurgerButton from "./BurgerButton";
import LanguageDropdown from "./LanguageDropdown";
import { useStore } from "../store/use-store";
import { UALProps, withUAL } from "ual-reactjs-renderer";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import AccountData from "./AccountData";
import WalletDropdown from "./WalletDropdown";
import { media } from "../utils/breakpoints";
import ualConfig from "../../config/ual";

const Wrapper = styled.div<any>`
  position: fixed;
  display: flex;
  width: 100%;
  padding: 16px;
  background-color: ${p => p.theme.colors.bg};
  border-bottom: 1px solid ${p => p.theme.colors.bgLightest};
  box-shadow: 0 16px 16px -16px #000;
`;

const StyledLocalizedLink = styled(LocalizedLink)`
  z-index: 1;
  position: relative;
  display: inherit;
  height: 35px;
  
  ${media.lessThan('xs')} {
    position: absolute;
  }
`;

const ConnectWalletButton = styled.button`
  flex-shrink: 0;
  font-size: 15px;
  margin-left: 16px;
  z-index: 1;
  position: relative;
  top: 7px;
`;

const LoginButtonWrap = styled.div`
  z-index: 1;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: start;
  justify-content: flex-end;
  
  ${media.lessThan('smd')} {
    flex-wrap: wrap;
  }
`;

const AccountWrap = styled.div`
  display: flex;
  height: 36px;
  margin-right: 32px;
  
  ${media.lessThan('smd')} {
    justify-content: flex-end;
    order: 1;
    width: 100%;
    margin-right: 0;
    margin-top: 5px;
  }
  
  @media (max-width: 600px) {
    flex-direction: column;
    height: 100%;
    align-items: flex-end;
  }
`;

const NetworkName = styled.span`
  color: ${p => p.theme.colors.primary};
  font-weight: 600;
  font-size: 11px;
  position: absolute;
  top: 25px;
  right: 0;
`;

const Toolbar: React.FC<GlobalProps & UALProps> = props => {
  const { t } = useTranslation();
  const [walletStore] = useStore((store) => [
    store.walletStore,
  ]);
  const [ open, setOpen ] = useState(false);

  useEffect(() => {
    walletStore.onUALChange(props.ual);
  }, [props.ual, walletStore]);

  const isLoggedIn = walletStore.isLoggedIn;
  const onClick = async () => {
    if(isLoggedIn) {
      await walletStore.logout();
    } else {
      await walletStore.login();
    }
  };

  return (
    <Wrapper>
      <StyledLocalizedLink to="/">
        <VigorLogo height={35} inverted={true} primary={true} horizontal={true} variant={'primaryHorizontalInverted'}/>
        { ualConfig.isTestNet && <NetworkName>testnet</NetworkName>}
      </StyledLocalizedLink>
      <LoginButtonWrap>
        <AccountWrap>
          <WalletDropdown />
          <AccountData isLoggedIn={isLoggedIn}/>
        </AccountWrap>
        <LanguageDropdown path={props.path} />
        <ConnectWalletButton type="button" onClick={onClick}>{isLoggedIn ? t('logout') : t('login')}</ConnectWalletButton>
        <BurgerButton setOpen={setOpen} open={open}/>
        <Nav setOpen={setOpen} open={open}/>
      </LoginButtonWrap>
    </Wrapper>
  );
};

export default withUAL(observer(Toolbar));
