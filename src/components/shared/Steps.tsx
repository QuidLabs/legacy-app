import React from "react";
import styled from "styled-components";
import { media } from "../../utils/breakpoints";

const SlideWrapper = styled.div<any>`
  background-color: ${p => p.highlight ? p.theme.colors.bgLight : p.theme.colors.bg};
  width: 260px;
  padding: 16px;
  border-radius: ${p => p.theme.borderRadius2x};
  border: 1px solid ${p => p.theme.colors.primary};
  cursor: pointer;
  opacity: ${p => (p.highlight ? 1.0 : 0.4)};
  display: flex;
  flex-direction: column;
  ${media.lessThan('smd')} {
    &:not(:last-child) {
      margin-bottom: 16px;
    }
    width: initial;
  }
`;

const SlideDivider = styled.div`
  background-color: ${p => p.theme.colors.bgLightest};
  width: 12px;
  height: 12px;
  border-radius: 100%;
  margin: 0 4px;
  align-self: center;
  
  ${media.lessThan('smd')} {
    display: none;
  }
`;

type SlideProps = {
  title?: React.ReactNode;
  children: React.ReactNode;
  // props given by Steps component
  highlight?: boolean;
  onClick?: () => any;
};
export const Slide: React.FC<SlideProps> = props => {
  const { title, children, highlight = false, onClick } = props;
  return (
    <SlideWrapper highlight={highlight} onClick={onClick!}>
      {title ? title : null}
      {children}
    </SlideWrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  
  ${media.lessThan('smd')} {
    flex-direction: column;
  }
`;

type StepsProps = {
  children: React.ReactElement[];
  slidesToStepMap: { [key: number]: number };
  activeStep: number;
  onStepChange: (step: number) => void;
};

const Steps: React.FC<StepsProps> = props => {
  const { children, slidesToStepMap, activeStep, onStepChange } = props;
  return (
    <Wrapper>
      {children.map((slide, slideIndex) => (
        <React.Fragment key={slideIndex}>
          {React.cloneElement(slide, {
            highlight: activeStep === slidesToStepMap[slideIndex],
            onClick: () => onStepChange(slidesToStepMap[slideIndex])
          })}
          {slideIndex < React.Children.count(children) - 1 ? (
            <SlideDivider />
          ) : null}
        </React.Fragment>
      ))}
    </Wrapper>
  );
};

export default Steps;
