import React from "react";
import styled from "styled-components";
import { observer } from "mobx-react";
import { useMedia } from "react-use-media";
import { ColorVariantProps, variant2Color } from "../shared/color-props";
import { HorizontalFlex, VerticalFlex, ResponsiveFlex } from "../shared";
import LocalizedLink from "../LocalizedLink";
import { media } from "../../utils/breakpoints";
import ActionCardBodyDivider from "./ActionCardDivider";

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 288px;
  width: 100%;
  margin: 0 16px;

  border: 1px solid ${variant2Color};
  border-radius: ${(p) => p.theme.borderRadius2x};
  background-color: ${(p) => p.theme.colors.bgLight};

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }

  ${media.lessThan("sm")} {
    &:first-child,
    &:last-child {
      margin-left: 0;
      margin-right: 0;
    }

    &:not(:first-child) {
      margin-top: 24px;
    }
  }
`;

const ActionCardHeaderTitle = styled.div`
  color: ${(props) => props.theme.colors.white};
  font-size: 1.375rem;
`;

const ActionCardHeaderStatsValue = styled.div<any>`
  color: ${variant2Color};
  font-size: 24px;
  
  ${media.lessThan('xs')} {
    font-size: 16px;
  }
`;

// @ts-ignore
const ActionCardHeaderWrapper = styled(HorizontalFlex)`
  justify-content: space-between;
  border-bottom: 1px solid ${(props) => props.theme.colors.gray};

  & ${HorizontalFlex} {
    width: initial;
  }
  
  > ${HorizontalFlex} {
    &:only-child {
      flex-grow: 1;
      
      & > div {
        width: 100%;
        text-align: center;
      }
    }
    
    &:nth-child(2):last-child {
      flex-grow: 0;
    }
  }

  /* give header items same size on big screens, centering them */
  ${media.greaterThan(`xs-max`)} {
    & > * {
      flex: 1 1 0;
    }
  }

  ${media.lessThan(`xs-max`)} {
    & > * {
      flex: 0 1 0;
    }
  }
`;

const ActionCardHeaderStatsWrapper = styled(VerticalFlex)`
  background-color: ${props => props.theme.colors.bgLight};
  
  &:last-child {
    margin-left: 16px;
  }
  
  ${media.lessThan('md')} {
    font-size: 12px;
  }
  
  ${media.lessThan('sm')} {
    &:last-child {
      margin-left: 0;
    }
  }
`;

const ActionCardHeaderStatsText = styled.div`
  white-space: nowrap;
`;

const ActionCardHeaderStats: React.FC<
  ColorVariantProps & {
    description: React.ReactNode;
    value: React.ReactNode;
    tooltip?: string;
  }
> = (props) => {
  return (
    <ActionCardHeaderStatsWrapper className="header-stats" margin="0 0 0 0" data-tip={props.tooltip}>
      <ActionCardHeaderStatsValue colorVariant={props.colorVariant}>
        {props.value}
      </ActionCardHeaderStatsValue>
      <ActionCardHeaderStatsText>{props.description}</ActionCardHeaderStatsText>
    </ActionCardHeaderStatsWrapper>
  );
};

const ActionCardHeaderStatsResponsive: React.FC<
  ColorVariantProps & {
    descriptions: React.ReactNode[];
    values: React.ReactNode[];
    tooltips?: string[];
  }
> = (props) => {
  const tooltips = props.tooltips || [];
  return (
    <ResponsiveFlex>
      {props.descriptions.map((description, index) => (
        <ActionCardHeaderStatsWrapper
          key={index}
          data-tip={tooltips[index]}
        >
          <ActionCardHeaderStatsValue colorVariant={props.colorVariant}>
            {props.values[index]}
          </ActionCardHeaderStatsValue>
          <ActionCardHeaderStatsText>{description}</ActionCardHeaderStatsText>
        </ActionCardHeaderStatsWrapper>
      ))}
    </ResponsiveFlex>
  );
};

const ActionCardHeaderWizardLinkWrapper = styled.span`
  display: inline-block;
  margin: 0 8px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid ${(p) => p.theme.colors.secondary};
  color: ${(p) => p.theme.colors.secondary};
  font-size: 14px;
  
  ${media.lessThan('md')} {
    margin: 0;
  }
`;

const ActionCardHeaderWizardLink: React.FC<{ url: string }> = ({ url }) => {
  return (
    <ActionCardHeaderWizardLinkWrapper>
      <LocalizedLink to={url}>Wizard</LocalizedLink>
    </ActionCardHeaderWizardLinkWrapper>
  );
};

const ActionCardHeader: React.FC<{
  onCollapse?: any;
}> & {
  Title: typeof ActionCardHeaderTitle;
  Stats: typeof ActionCardHeaderStats;
  StatsResponsive: typeof ActionCardHeaderStatsResponsive;
  WizardLink: typeof ActionCardHeaderWizardLink;
} = (props) => {
  const { children, onCollapse } = props;

  const getAlignment = (index: number) => {
    if (index === 0) return `flex-start`;
    else if (index === 1) return `center`;
    else return `flex-end`;
  };

  return (
    <ActionCardHeaderWrapper padding="16px" onClick={onCollapse}>
      {React.Children.map(children, (child, index) => (
          <HorizontalFlex key={index} justifyContent={getAlignment(index)}>
            {child}
          </HorizontalFlex>
      ))}
    </ActionCardHeaderWrapper>
  );
};
ActionCardHeader.Title = ActionCardHeaderTitle;
ActionCardHeader.Stats = ActionCardHeaderStats;
ActionCardHeader.StatsResponsive = ActionCardHeaderStatsResponsive;
ActionCardHeader.WizardLink = ActionCardHeaderWizardLink;

const ActionCardBodyTitle = styled.div`
  color: ${(props) => props.theme.colors.white};
  font-size: 18px;
  margin-bottom: 12px;
`;

const ActionCardBodyBlock = styled.div`
  align-self: stretch;
  background-color: ${(props) => props.theme.colors.bgLight};
  width: 100%;
  
  ${media.greaterThan(`sm`)} {
    // use margin when there's more than one block 
    &:not(:only-of-type) {
      &:first-of-type {
        margin-right: 32px;
      }
      
      &:last-of-type {
        margin-left: 32px;
      }
    }
  }
`;
const ActionCardBodyEndBlock = styled.div`
  padding: 16px 0 0 0;
  max-width: 100%;
  
  ${media.lessThan('xs')} {
    max-width: initial;
  }
`;

const ActionCardBody = (styled(HorizontalFlex)`
  position: relative;
  width: 100%;
  height: 100%;
  padding: 16px;

  ${media.lessThan(`xs-max`)} {
    flex-direction: column;
  }
` as unknown) as React.FC<{}> & {
  EndBlock: typeof ActionCardBodyEndBlock;
  Block: typeof ActionCardBodyBlock;
  Divider: typeof ActionCardBodyDivider;
  Title: typeof ActionCardBodyTitle;
};
ActionCardBody.Block = ActionCardBodyBlock;
ActionCardBody.EndBlock = ActionCardBodyEndBlock;
ActionCardBody.Divider = ActionCardBodyDivider;
ActionCardBody.Title = ActionCardBodyTitle;

const ActionCard: React.FC<{id?: string} & ColorVariantProps> & {
  Header: typeof ActionCardHeader;
  Body: typeof ActionCardBody;
} = (props) => {
  const { children, colorVariant, id, ...wrapperCSSProps } = props;
  const isMobile = useMedia(media.xs.replace(`@media `, ``));

  const [collapsed, setCollapsed] = React.useState<boolean>(isMobile);
  const handleCollapseClick = () => {
    if (isMobile) {
      setCollapsed((val) => !val);
    }
  };

  return (
    <Wrapper id={id} css={wrapperCSSProps} colorVariant={colorVariant}>
      {React.Children.map(children, (child) => {
        if (!child || !(child as any).type) return child;

        let reactElementChild = child as React.ReactElement;
        if (reactElementChild.type === ActionCardBody && collapsed) {
          return null;
        }
        if (reactElementChild.type === ActionCardHeader) {
          return React.cloneElement(reactElementChild, {
            ...reactElementChild.props,
            onCollapse: handleCollapseClick,
          });
        }

        return child;
      })}
    </Wrapper>
  );
};
ActionCard.Header = ActionCardHeader;
ActionCard.Body = ActionCardBody;

export default observer(ActionCard);
