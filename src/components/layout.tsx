import React, { useEffect } from "react";
import Helmet from "react-helmet";
import styled, { ThemeProvider } from "styled-components";
import { ErrorBoundary } from "react-error-boundary";
import Toolbar from "../components/Toolbar";
import GlobalStyles from "../components/GlobalStyles";
import withI18next from "../i18n/withI18next";
import theme from "../utils/theme";
import Footer from "../components/Footer";
import bg from "../assets/images/bg.jpg";
import { useStore } from "../store/use-store";
import { ToastContainer } from "react-toastify";
import TransactionStateOverlay from "./TransactionStateOverlay";
import { observer } from "mobx-react";
import ModalsContainer from "./modals/ModalsContainer";
import { media } from "../utils/breakpoints";
import Snackbar from "./Snackbar";
import "react-toastify/dist/ReactToastify.min.css";
import "intro.js/minified/introjs.min.css";
import ErrorFallback from "./ErrorFallback";

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  background-image: url('${bg}');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  background-attachment: fixed;
`;

const PageHeader = styled.header`
  width: 100%;
  z-index: 1;
`;

const MainSection = styled.main`
  /* toolbar height + top spacing */
  margin-top: 102px;
  padding: 16px;
  width: 100%;
  max-width: 1240px;
  flex: 1;

  ${media.lessThan("smd")} {
    /* toolbar height + top spacing */
    margin-top: 146px;
  }

  @media (max-width: 601px) {
    /* toolbar height + top spacing */
    margin-top: 130px;
  }
`;

type Props = {
  plain: boolean;
};
const Layout: React.FC<GlobalProps & Props> = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <Page>
        <GlobalStyles />
        <Helmet>
          <link
            href="https://fonts.googleapis.com/css?family=Montserrat:400,600,700&display=swap"
            rel="stylesheet"
          />
          <title>
            VIGOR Protocol - Peer-to-Peer Lending - Borrow, Lend, Insure, Earn{" "}
          </title>
          <meta
            name="title"
            content="VIGOR Protocol - Peer-to-Peer Lending - Borrow, Lend, Insure"
          />
          <meta
            name="description"
            content="Borrow, lend, insure, and vote through open source smart contracts."
          />
          <meta
            name="keywords"
            content="vigor, low volatility, crypto, borrow, earn, lend, insure, peer-to-peer, lending, defi"
          />
          <meta name="robots" content="index, follow" />
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <meta name="language" content="English" />
          <meta name="author" content="VIGOR DAC" />
        </Helmet>
        {props.plain ? null : (
          <PageHeader>
            <Toolbar />
          </PageHeader>
        )}
        <MainSection>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={console.error}
          >
            {props.children}
          </ErrorBoundary>
        </MainSection>
        {props.plain ? null : <Footer />}
        <ModalsContainer />
        <ToastContainer autoClose={10000} position={"bottom-right"} />
        <Snackbar />
        <TransactionStateOverlay />
      </Page>
    </ThemeProvider>
  );
};

export default withI18next()(observer(Layout));
