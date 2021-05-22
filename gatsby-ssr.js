import React from "react";
import Layout from "./src/components/layout";

export const wrapPageElement = ({ element, props }) => {
  // location.pathname includes all translation, f.i., /ko/borrow/vigor
  const plain = props.location.pathname.includes(`/451`)

  // Layout needs access to pageProps like locale for withi18n initialization
  return <Layout plain={plain} {...props}>{element}</Layout>;
};
