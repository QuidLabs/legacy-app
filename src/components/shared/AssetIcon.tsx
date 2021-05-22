import React from "react";
import EosIcon from "../../assets/svgs/eos.svg";
import IqIcon from "../../assets/svgs/everipedia_logo.svg";
import VigIcon from "../../assets/svgs/vig-mark.svg";
import VigorIcon from "../../assets/svgs/vigor__primary--horizontal.svg";
import UsdtIcon from "../../assets/svgs/tether-usdt-logo.svg";
import PbtcIcon from "../../assets/svgs/pbtc.svg";

const AssetIcon: React.FC<{ symbolCode: string } & any> = ({
  symbolCode,
  ...otherProps
}) => {
  switch (symbolCode) {
    case 'EOS': {
      return <EosIcon {...otherProps} />;
    }
    case 'IQ': {
      return <IqIcon {...otherProps} />;
    }
    case 'VIG': {
      return <VigIcon {...otherProps}/>;
    }
    case 'VIGOR': {
      return <VigorIcon {...otherProps}/>;
    }
    case 'USDT': {
      return <UsdtIcon {...otherProps}/>;
    }
    case 'PBTC': {
      return <PbtcIcon {...otherProps}/>;
    }
  }

  // default to EOS icon
  return <EosIcon {...otherProps} />;
};

export default AssetIcon;
