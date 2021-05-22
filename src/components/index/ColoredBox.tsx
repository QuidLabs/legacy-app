import React from "react";
import styled, { css } from "styled-components";
import LocalizedLink from "../LocalizedLink";
import { VerticalFlex } from "../shared";
import { variant2Color, ColorVariantProps } from "../shared/color-props";
import { media } from "../../utils/breakpoints";

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${variant2Color};

  border: 1px solid ${variant2Color};
  border-radius: ${p => p.theme.borderRadius2x};
  background-color: ${p => p.theme.colors.bgLight};
`;

const QuickInfoWrapper = styled(Wrapper)`
  width: 100%;
  flex-direction: row;
  
  ${media.lessThan('smd')} {
    flex-direction: column;
  }
`;

const ChildWrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  text-align: center;
  height: 100%;
  color: ${p => p.theme.colors.white};
  margin-bottom: 16px;
  
  ${media.lessThan('smd')} {
    text-align: center;
  }
`;
const IconWrapper = styled.div`
  width: 92px;
  min-height: 85px;
  margin: 0 auto 16px;
  vertical-align: middle;
  text-align: center;
  display: table-cell;
  img {
    max-width: 100%;
    height: 100%;
    display: block;
    margin: 0 auto;
  }
`;

const Title = styled.h3`
  text-align: center;
  text-transform: uppercase;
  font-size: 1.4rem;
  min-width: 132px;
  margin-top: 0;
`;

const ButtonStyles = css<any>`
  margin-top: auto;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 12px 24px;
  background-color: ${variant2Color};
  border-radius: ${p => p.theme.borderRadius};
  color: ${p =>
    p.colorVariant === `secondary`
      ? p.theme.colors.bgLight
      : p.theme.colors.white};
`;
const StyledButton = styled.button<any>`
  ${ButtonStyles}
`;
const StyledLocalizedLink = styled<any>(({ colorVariant, ...rest }: any) => (
  <LocalizedLink {...rest} />
))`
  ${ButtonStyles}
`;

const FullHeightVerticalFlex = styled(VerticalFlex)`
  height: 100%;
  
  ${media.lessThan('smd')} {
    margin-left: 0;
    align-items: center;
  }
`;

type ButtonProps = {
  text: string;
  as: "localLink" | "button";
  onClick?: () => void;
  to?: string;
};
const InfoButton: React.FC<ButtonProps & ColorVariantProps> = props => {
  const { as, colorVariant, ...otherProps } = props;
  if (as === `localLink`) {
    const { text, to } = otherProps;

    return (
      <StyledLocalizedLink colorVariant={colorVariant} to={to!}>
        {text}
      </StyledLocalizedLink>
    );
  } else {
    const { text, onClick } = otherProps;
    return (
      <StyledButton colorVariant={colorVariant} onClick={onClick}>
        {text}
      </StyledButton>
    );
  }
};

type ColoredInfoBoxProps = {
  width: number | string;
  padding: string;
  icon: React.ReactNode;
  title: React.ReactNode;
  buttonProps: ButtonProps;
} & ColorVariantProps;

const ColoredInfoBox: React.FC<ColoredInfoBoxProps> = props => {
  const {
    colorVariant,
    icon,
    title,
    children,
    buttonProps,
    ...wrapperCSSProps
  } = props;

  return (
    <Wrapper css={wrapperCSSProps} colorVariant={colorVariant}>
      <IconWrapper>
        {icon}
      </IconWrapper>
      
      <Title>{title}</Title>
      <ChildWrapper>{children}</ChildWrapper>
      <div>
        <InfoButton colorVariant={colorVariant} {...buttonProps} />
      </div>
    </Wrapper>
  );
};

type ColoredQuickInfoBoxProps = Omit<ColoredInfoBoxProps, "width" | "icon">
const ColoredQuickInfoBox: React.FC<ColoredQuickInfoBoxProps> = props => {
  const {
    colorVariant,
    title,
    children,
    buttonProps,
    ...wrapperCSSProps
  } = props;

  return (
    <QuickInfoWrapper css={wrapperCSSProps} colorVariant={colorVariant} fullWidth>
      <Title>{title}</Title>
      <FullHeightVerticalFlex alignItems="flex-start" margin="0 0 0 48px">
        <ChildWrapper css={{textAlign: `left`}}>{children}</ChildWrapper>
        <InfoButton colorVariant={colorVariant} {...buttonProps} />
      </FullHeightVerticalFlex>
    </QuickInfoWrapper>
  );
};

export { ColoredInfoBox, ColoredQuickInfoBox };
