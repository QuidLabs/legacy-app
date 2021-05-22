import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useStore } from "../store/use-store";
import { FaMicrochip, FaMemory, FaNetworkWired } from 'react-icons/fa';
import { Line } from "rc-progress";
import theme from "../utils/theme";
import wallet from "../store/wallet";
import { observer } from "mobx-react";

const ResourcesWrap = styled.div<any>`
  margin: 1rem 0;
`;

const ItemInfoWrapper = styled.div<any>`
  display: flex;
  flex-direction: row; 
  flex-wrap:wrap; 
  margin: 8px 0;
`;

const InfoWrapper = styled.div<any>`

  width:calc(35% - 1.2rem);
  padding: .5rem 0;
`;

const LabelWrapper = styled.div<any>`
  margin-left:5%;
  width:calc(65% - 1rem);
`;

const LabelChart = styled.div`
  font-size:.75rem;
  color: ${p => p.theme.colors.light};
`;

const LabelQuota = styled.span`
  color: #cccccc;
`;

const Loading = styled.div`
  font-size: 14px;
  color: ${p => p.theme.colors.whiteDarkened};
`;

type ChartProps = {
  used: number,
  max: number,
  type: string,
  prefix: string

}

const Chart: React.FC<ChartProps> = (props: ChartProps) =>{
  
  const {used, max, type, prefix} = props;
  const { t } = useTranslation();

  const getAvailable = () => {
    let available = max - used;
    return `${( available < 1000 ? available: available/1000)}  ${( available < 1000 ? prefix: type)}`;
  }

  const getPercentage = (partial: number, total:number)=>{
    return (Math.floor( (partial*100) / total ) ).toFixed(2);
  }

  const getColorByPercentage = (range: number) => {
      if (parseInt(range)<21) return '#27AE60';
      else if (parseInt(range)<41) return '#F7DC6F';
      else if (parseInt(range)<61) return '#D68910';
      else if (parseInt(range)<=81) return '#D35400';
      else if ( parseInt(range)<=100) return '#C0392B';
  }

  let  percentage = getPercentage( used, max );

  return (
    <React.Fragment>
      <LabelChart>{t('resources.Available')}: <LabelQuota>{getAvailable()}</LabelQuota></LabelChart>
      <Line percent={ percentage } strokeWidth={4} strokeColor={getColorByPercentage(parseInt(percentage))} trailColor={theme.colors.bgLightest} />
    </React.Fragment>
  );
}

const Resources: React.FC = () => {

  const [walletStore] = useStore(store => [store.walletStore]);
    
  const { t } = useTranslation();

  return (
    <React.Fragment>
        { walletStore.accountResources && walletStore.accountResources.core_liquid_balance ?
          <ResourcesWrap>
            <ItemInfoWrapper>
              <InfoWrapper><FaMicrochip size={15} /> {t('resources.CPU')}</InfoWrapper>
              <LabelWrapper>
                <Chart prefix="ms" type="ms" used={walletStore.accountResources.cpu_limit.used} max={walletStore.accountResources.cpu_limit.max} />
              </LabelWrapper>
            </ItemInfoWrapper>

            <ItemInfoWrapper>
              <InfoWrapper><FaMemory size={15} /> {t('resources.RAM')}  </InfoWrapper>
              <LabelWrapper>
                <Chart prefix="bytes" type="kB" used={walletStore.accountResources.ram_usage} max={walletStore.accountResources.ram_quota} />
              </LabelWrapper>
            </ItemInfoWrapper>

            <ItemInfoWrapper>
              <InfoWrapper><FaNetworkWired size={15} /> {t('resources.NET')} </InfoWrapper>
              <LabelWrapper>
                <Chart prefix="bytes" type="kB" used={walletStore.accountResources.net_limit.used} max={walletStore.accountResources.net_limit.max} />
              </LabelWrapper>
            </ItemInfoWrapper>
          </ResourcesWrap>
          : <Loading>{t('log.loading')}</Loading>
        }
    </React.Fragment>

  )
};

export default observer(Resources);
