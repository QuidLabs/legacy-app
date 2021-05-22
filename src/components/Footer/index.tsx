import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import TelegramIcon from "../../assets/svgs/telegram-logo.svg";
import TwitterIcon from "../../assets/svgs/twitter-logo.svg";
import RedditIcon from "../../assets/svgs/reddit-logo.svg";
import GitlabLogo from "../../assets/svgs/gitlab.svg";
import FacebookLogo from "../../assets/svgs/facebook.svg";
import InstagramLogo from "../../assets/svgs/instagram.svg";
import { useStore } from "../../store/use-store";
import { media } from "../../utils/breakpoints";

const Wrapper = styled.div(
  ({ theme }) => `
  display: flex;
  flex: none;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  
  padding: 24px 0 24px 0;

  @media (max-width: 960px) {
    flex-direction: column;
  }
    
  }
`
);

const Version = styled.div`
  font-size: 14px;
  display: flex;
  flex-direction: row;
`;

const LegalLinks = styled.div`
  margin-top: 8px;
  font-weight: 400;
  font-size: 14px;
  color: ${(p) => p.theme.colors.whiteDarkened};
`;

const FooterLinksNav = styled.div`
  display: flex;
  flex: none;
  flex-direction: row;
  justify-content: space-around;
`;

const FooterLink = styled.a`
  font-size: 14px;
  color: ${(p) => p.theme.colors.primary};
`;

const FooterButton = styled.button`
  font-size: 14px;
  color: ${(p) => p.theme.colors.primary};
`;

const PoweredBy = styled.div`
  font-size: 14px;
  margin: 0;

  @media (max-width: 960px) {
    margin: 12px 0;
  }
`;

const SocialBar = styled.div`
  display: flex;
  justify-content: center;
  margin: 32px 0 32px 0;

  & > a:not(:last-child) {
    margin: 0 28px 0 0;
  }

  ${media.lessThan(`sm-max`)} {
    margin: 64px 0 32px 0;
  }
`;

const Footer: React.FC<{}> = (props) => {
  const { t } = useTranslation();
  const [userStore] = useStore((store) => [store.userStore]);

  return (
    <Wrapper>
      <Version>
        {t(`footer.version`)}&nbsp;
        <FooterLink style={{ margin: `0 16px 0 0` }}>
          {process.env.GATSBY_VERSION}
        </FooterLink>
        Audit by&nbsp;
          <FooterLink
            href="https://sentnl.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sentnl
          </FooterLink>
      </Version>
      <PoweredBy>
        {t(`footer.poweredBy`)}&nbsp;
        <FooterLink
          href="https://vigor.ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          Vigor Dac
        </FooterLink>
      </PoweredBy>
      <FooterLinksNav>
        <FooterLink style={{ margin: `0 24px 0 0` }}
                    href="https://docs.vigor.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
        >Docs</FooterLink>
          {/* <FooterLink css={{ margin: `0 24px 0 0` }}
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >Audit</FooterLink> */}
        <FooterButton style={{ margin: `0 24px 0 0` }}
                      as="a"
                      onClick={() => userStore.promptDisclaimer(true)}
        >
          {t(`footer.disclaimer`)}
        </FooterButton>
      </FooterLinksNav>
      <SocialBar>
        <a
          href="https://twitter.com/vigorprotocol"
          target="_blank"
          rel="noopener noreferrer"
        >
          <TwitterIcon height={20} />
        </a>
        <a
          href="https://www.reddit.com/r/vigor"
          target="_blank"
          rel="noopener noreferrer"
        >
          <RedditIcon height={20} />
        </a>
        <a
          href="https://gitlab.com/vigorstablecoin"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitlabLogo height={24} />
        </a>
        <a
          href="https://t.me/vigorprotocol"
          target="_blank"
          rel="noopener noreferrer"
        >
          <TelegramIcon height={22} style={{ margin: `3px 0 0 0` }} />
        </a>
        <a
          href="https://www.facebook.com/groups/VigorDAC"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FacebookLogo height={24}/>
        </a>
        <a
          href="https://www.instagram.com/vigorprotocol"
          target="_blank"
          rel="noopener noreferrer"
        >
          <InstagramLogo height={22}/>
        </a>
      </SocialBar>
      {/* <LegalLinks>
        <a href={withPrefix(`/VIGOR_terms_conditions.pdf`)} target="_blank">{t('footer.termsConditions')}</a>
        <span> | </span>
        <a href={withPrefix(`/VIGOR_privacy_policy.pdf`)} target="_blank">{t('footer.privacyPolicy')}</a>
      </LegalLinks> */}
    </Wrapper>
  );
};

export default Footer;
