import styled, { css } from "styled-components";
import React from "react";
import { BlueButton } from "./BlueButton";

type StyledInputProps = {
  as: "textarea" | "text" | "number" | "select";
  suffixButton?: { onClick: () => any; text: string };
};

export const InputStyle = css`
  background-color: ${(props) => props.theme.colors.bg};
  color: ${(props) => props.theme.colors.gray};
  border: none;
  border-radius: ${(p) => p.theme.borderRadius};
  font-size: 0.9rem;
  line-height: 18px;
`;

const StyledInputWrapper = styled.div`
  position: relative;
`;

const StyledInputNumber = styled.input`
  ${InputStyle};

  padding: 15px;
  width: 100%;

  /* Webkit - hide spin arrows */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
  }
  /* Firefox - hide spin arrows */
  -moz-appearance: textfield;
`;

const StyledInputText = styled.input`
  ${InputStyle};
  padding: 15px;
  width: 100%;
`;

const StyledInputTextArea = styled.select`
  ${InputStyle};
  padding: 15px;
  width: 100%;
`;

const StyledInputSelect = styled.select`
  ${InputStyle};
  margin-left: 16px;
`;

const SuffixButton = styled(BlueButton)`
  background-color: ${(p) => p.theme.colors.bgLightest};
  &:hover {
    background-color: ${(p) => p.theme.colors.bgLighter};
  }
  font-size: 10px;
  text-transform: uppercase;
  position: absolute;
  height: 32px;
  top: 0;
  bottom: 0;
  right: 8px;
  margin: auto;
  padding: 0 8px;
  border-radius: 2px;
`;

export const StyledInput: React.FC<
  StyledInputProps &
    React.HTMLProps<HTMLInputElement> &
    React.HTMLProps<HTMLSelectElement> &
    React.HTMLProps<HTMLTextAreaElement>
> = ({ as, suffixButton, ...otherProps }) => {
  if (as === "select") {
    return <StyledInputSelect type={as} {...(otherProps as any)} />;
  }

  if (as === "textarea") {
    return <StyledInputTextArea type={as} {...(otherProps as any)} />;
  }

  return (
    <StyledInputWrapper>
      <StyledInputNumber type={as} {...(otherProps as any)} />
      {suffixButton ? (
        <SuffixButton onClick={suffixButton.onClick}>
          {suffixButton.text}
        </SuffixButton>
      ) : null}
    </StyledInputWrapper>
  );
};

export const StyledLabel = styled.label<any>`
  display: inline-block;
  color: ${(p) => p.theme.colors.gray};
  margin: ${(p) => p.margin || `0`};
  font-size: 0.9rem;
  font-weight: 600;
`;
export const StyledCheckboxLabel = styled<any>(StyledLabel)`
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const SuffixText = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 8px;
  margin: auto;
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.colors.gray};
`;

export const StyledInputSuffix: React.FC<
  { as: "text" | "number"; suffix: string } & React.HTMLProps<
    HTMLInputElement
  > &
    React.HTMLProps<HTMLSelectElement> &
    React.HTMLProps<HTMLTextAreaElement>
> = ({ as, suffix, ...otherProps }) => {
  return (
    <StyledInputWrapper>
      <StyledInputNumber type={as} {...(otherProps as any)} />
      <SuffixText>{suffix}</SuffixText>
    </StyledInputWrapper>
  );
};
