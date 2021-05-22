import React from "react";
import styled, { css } from "styled-components";
import { useTranslation } from "react-i18next";
import { CSSTransition } from 'react-transition-group';
import Overlay from "./shared/Overlay";
import LocalizedLink from "./LocalizedLink";
import { FiExternalLink, MdNavigateNext } from "react-icons/all";

import Resources from "./Resources";

const transitionDuration = 200;

const slideStyles = css`
  width: 0;
  transition-property: width;
  transition-duration: ${ transitionDuration }ms;

  &.slide-enter,
  &.slide-exit-done {
    width: 0;
    transition-timing-function: ease-out;
  }
  
  &.slide-enter-done,
  &.slide-exit {
    transition-timing-function: ease-in;
  }
`;

const NavWrap = styled.div<any>`
  z-index: 2;
  height: 100%;
  background-color: ${p => p.theme.colors.bgLight};
  position: fixed;
  top: 0;
  right: 0;
  border-right: none;
  max-width: 320px;
  
  ${slideStyles}
  
  &.slide-enter-done,
  &.slide-exit {
    width: 320px;
  }
  
  &.slide-enter,
  &.slide-enter-done,
  &.slide-exit {
    box-shadow: 16px 0 16px -16px #000;
    border-left: 2px solid ${p => p.theme.colors.bgLightest};
  }
  
  ${p => !p.open && `
    pointer-events: none;
  `}
`;

const NavBlock = styled.nav<any>`
  opacity: 0;
  transition-property: opacity;
  transition-duration: ${ transitionDuration }ms;
  transition-delay: 100ms;
  z-index: 5;
  position: relative;
  margin-top: 46px;
  height: 100%;
  padding: 16px;

  &.fade-enter,
  &.fade-exit-done {
    opacity: 0;
    transition-timing-function: ease-out;
  }
  
  &.fade-enter-done,
  &.fade-exit {
    opacity: 100%;
    transition-timing-function: ease-in;
  }
  
  ${props => !props.isOpen && `
    transition-delay: 0ms;
    transition-duration: ${ transitionDuration / 2 }ms;
  `}
`;

const NavSub = styled.div`
  padding-left: 16px;
`;

const NavLink = styled(LocalizedLink)<any>`
  padding: 8px 0;
  display: block;
  color: ${props => props.theme.colors.light};
  
  &.active {
    color: ${props => props.theme.colors.primaryLighter};
  }
  
  &:hover {
    color: ${props => props.theme.colors.white};
  }
`;

// @ts-ignore
const NavLinkParent = styled(NavLink)<any>`
  color: ${props => props.theme.colors.whiteDarkened};
`;

const ExternalLink = styled.a`
  display: flex;
  padding: 8px 0;
  color: ${props => props.theme.colors.light};
  
  &:hover {
    color: ${props => props.theme.colors.white};
  }
  
  > :first-child {
    margin-right: 4px;
  }
  
  > svg {
    position: relative;
    top: 2px;
  }
`;

const ExternalLinkParent = styled(ExternalLink)`
  color: ${props => props.theme.colors.whiteDarkened};
`;

const AnimatedOverlay = styled(Overlay)`
  ${slideStyles}
  
  &.slide-enter-done,
  &.slide-exit {
    width: calc(100% - 320px);
  }
`;

const StyledIcon = styled(MdNavigateNext)`
  position: relative;
  top: 2px;
`;

type Props = {
  open: boolean,
  setOpen: React.ComponentState,
}

const Nav: React.FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const { open, setOpen } = props;

  return (
    <CSSTransition classNames={'slide'} in={open} timeout={0}>
      <React.Fragment>
        <NavWrap open={open}>
          <CSSTransition classNames={'fade'} in={open} timeout={0}>
            <NavBlock isOpen={open}>
              <NavLinkParent to={'/'} activeClassName={'active'}>{t('nav.home')}</NavLinkParent>
              <NavLinkParent to={'/user'} activeClassName={'active'}>{t('nav.YourDashboard')}</NavLinkParent>
              <NavLinkParent to={'/history'} activeClassName={'active'}>{t('nav.history')}</NavLinkParent>
              <NavLinkParent to={'/health'} activeClassName={'active'}>{t('nav.Health')}</NavLinkParent>

              <NavLinkParent to={'/rewards'} activeClassName={'active'}>{t('nav.Earn')}</NavLinkParent>
              <NavSub>
                <NavLink to={'/rewards/insure'} activeClassName={'active'}><StyledIcon /> {t('nav.EarnInsure')}</NavLink>
                <NavLink to={'/rewards/savings'} activeClassName={'active'}><StyledIcon /> {t('nav.EarnSaving')}</NavLink>
              </NavSub>

              <NavLinkParent to={'/borrow'} activeClassName={'active'}>{t('nav.Borrow')}</NavLinkParent>
              <NavSub>
                <NavLink to={'/borrow/vigor'} activeClassName={'active'}><StyledIcon /> {t('nav.BorrowVIGOR')}</NavLink>
                <NavLink to={'/borrow/crypto'} activeClassName={'active'}><StyledIcon /> {t('nav.BorrowCrypto')}</NavLink>
              </NavSub>

              <NavLinkParent to={'/alerts'} activeClassName={'active'}>{t('nav.Alerts')}</NavLinkParent>

              <ExternalLinkParent href="https://stats.vigor.ai/d/aHTjcofWz/vigor-home?orgId=1" target="_blank" rel="noopener noreferrer">
                <span>{t('nav.Stats')}</span>
                <FiExternalLink />
              </ExternalLinkParent>
              {/*<NavSub>*/}
              {/*  <ExternalLink href={`https://stats.vigor.ai/d/mobile/users?orgId=1${accountNameParam}`} target="_blank" rel="noopener noreferrer">*/}
              {/*    <span><StyledIcon /> {t('nav.StatsUsersMobile')}</span>*/}
              {/*    <FiExternalLink />*/}
              {/*  </ExternalLink>*/}
              {/*  <ExternalLink href="https://stats.vigor.ai/d/-iXb4XYZz/vigor-markets" target="_blank" rel="noopener noreferrer">*/}
              {/*    <span><StyledIcon /> {t('nav.StatsMarkets')}</span>*/}
              {/*    <FiExternalLink />*/}
              {/*  </ExternalLink>*/}
                {/*<ExternalLink href="https://stats.vigor.ai/d/5b-73UiMz/vigor-loans" target="_blank" rel="noopener noreferrer">*/}
                {/*  <span><StyledIcon /> {t('nav.StatsVIGORLoans')}</span>*/}
                {/*  <FiExternalLink />*/}
                {/*</ExternalLink>*/}
                {/*<ExternalLink href="https://stats.vigor.ai/d/9umW6UiMz/crypto-loans" target="_blank" rel="noopener noreferrer">*/}
                {/*  <span><StyledIcon /> {t('nav.StatsCryptoLoans')}</span>*/}
                {/*  <FiExternalLink />*/}
                {/*</ExternalLink>*/}
              {/*</NavSub>*/}
              <Resources />
            </NavBlock>
          </CSSTransition>
        </NavWrap>
        <CSSTransition classNames={'slide'} in={open} timeout={0}>
          <AnimatedOverlay onClick={() => setOpen(false)}/>
        </CSSTransition>
      </React.Fragment>
    </CSSTransition>
  )
};

export default Nav;
