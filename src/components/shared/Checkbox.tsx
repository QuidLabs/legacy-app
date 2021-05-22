import styled from "styled-components";
import React from "react";
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

const CheckboxWrap = styled.div<{ disabled: boolean }>`
  display: flex;
  margin-top: 4px;
 
  cursor: pointer;
  
  ${p => p.disabled && `
    cursor: not-allowed;
  `}
`;

const CheckboxLabel = styled.div`
  margin-left: 4px;
`;

type Props = {
  label: string,
  checked: boolean,
  disabled?: boolean,
  onClick?: Function,
}

const Checkbox: React.FC<Props> = props => {
  const { label, checked, onClick, disabled } = props;

  return (
    <CheckboxWrap onClick={() => !disabled && onClick ? onClick() : null} disabled={disabled || false}>
      {
        checked ?
          <MdCheckBox size={20} color={'#4ECCAE'}/> :
          <MdCheckBoxOutlineBlank size={20} color={!disabled ? '#E14852' : '#a4a5aa'}/>
      }
      <CheckboxLabel>{label}</CheckboxLabel>
    </CheckboxWrap>
  );
};

export default Checkbox;
