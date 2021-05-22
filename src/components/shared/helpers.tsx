import styled from "styled-components";
import { media } from "../../utils/breakpoints";

export const HorizontalFlex = styled.div<any>`
  display: flex;
  flex-direction: row;
  justify-content: ${props => props.justifyContent || `center`};
  align-items: ${props => props.alignItems || `center`};
  margin: ${props => props.margin || `0`};
  padding: ${props => props.padding || `0`};
  width: ${p => p.width || `100%`};
`;

export const VerticalFlex = styled<any>(HorizontalFlex)`
  flex-direction: column;
  ${p => (p.fullWidth ? `width: 100%;` : ``)}
`;

export const ResponsiveFlex = styled<any>(HorizontalFlex)`
  ${p => (p.fullWidth ? `width: 100%;` : ``)}

  ${media.lessThan(`xs-max`)} {
    flex-direction: column;
    ${p => p.responsiveAlignItems && `align-items: ${p.responsiveAlignItems};`}
  }
`;

export const CenteredHalfWidthHorizontalFlex = styled(HorizontalFlex)`
  width: 50%;
  
  ${media.lessThan('md')} {
    width: 100%;
  }
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 4rem;
`;
