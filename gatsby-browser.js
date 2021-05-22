import React, { useEffect } from "react";
import TagManager from "react-gtm-module";
import { Provider, observer } from "mobx-react";
import { UALProvider } from "ual-reactjs-renderer";
import RootStore from "./src/store";
import Layout from "./src/components/layout";
import ualConfig from "./config/ual";
import { useStore } from "./src/store/use-store";
import 'rc-slider/assets/index.css';

const tagManagerArgs = {
  gtmId: "GTM-MTJ6CSM",
};

export const onInitialClientRender = function () {
  if (process.env.NODE_ENV === "production") {
    TagManager.initialize(tagManagerArgs);
  }
};

const UALWrapper = observer((props) => {
  const [rootStore] = useStore((store) => [
    store,
  ]);

  useEffect(() => {
    rootStore.init();
  }, []);

  const walletStore = useStore((store) => store.walletStore);

  return (
    <UALProvider
      chains={[ualConfig.chain]}
      authenticators={walletStore.authenticators}
      appName={walletStore.appName}
    >
      {props.children}
    </UALProvider>
  );
});

export const wrapRootElement = ({ element, props }) => {
  return (
    <Provider store={RootStore}>
      <UALWrapper {...props}>
        {element}
      </UALWrapper>
    </Provider>
  );
};

export const wrapPageElement = ({ element, props, ...other }) => {
  const plain = props.path === `/451`;
  // Layout needs access to pageProps like locale for withi18n initialization
  return (
    <Layout plain={plain} {...props}>
      {element}
    </Layout>
  );
};

export const onServiceWorkerUpdateReady = () => {
  console.log("sw: found update;");
  // const answer = window.confirm(
  //   `This application has been updated. ` +
  //   `Reload to display the latest version?`
  // );
  //
  // if (answer === true) {
  //   window.location.reload()
  // }
};
