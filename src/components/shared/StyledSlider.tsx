import _Slider, { createSliderWithTooltip } from "rc-slider";
import styled from "styled-components";

// const Slider = createSliderWithTooltip(_Slider);
// Slider accepts className prop which sc uses internally, i.e., we can just style it like this
const StyledSlider = styled(_Slider)`
  .rc-slider-rail {
    background-color: ${(props) => props.theme.colors.bgLighter};
  }
  .rc-slider-track {
    background-color: ${(props) => props.theme.colors.primary};
  }
  .rc-slider-handle, .rc-slider-dot-active {
    border-color: ${(props) => props.theme.colors.primary};
  }
  .rc-slider-handle:active {
    border-color: ${(props) => props.theme.colors.secondary};
    border: solid 2px ${(props) => props.theme.colors.secondary};
    box-shadow: 0 0 5px ${(props) => props.theme.colors.secondary};
  }
`;

export default StyledSlider;
