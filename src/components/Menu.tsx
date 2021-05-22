import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useOnClickOutside } from '../utils/hooks';
import {media} from "../utils/breakpoints";

export const MenuWrapper = styled.div<any>`
    z-index: 1;
    position: relative;
    cursor: pointer;
    opacity: ${props => (props.disabled ? 0.4 : 1)};

    ${media.lessThan('sm')} {
        display: block;
        text-align: right;
    }
`;

const OptionsList = styled.div`
    position: absolute;
    right: 0;
    margin-top: 4px;
    padding: 4px 0;
    z-index: 1;
    border-radius: ${p => p.theme.borderRadius};
    background-color: ${({ theme }) => theme.colors.bgLight};
`;

export const OptionItem = styled.div<any>`
    padding: 12px 18px;
    font-size: 15px;
    color: #fff;

    ${props =>
        props.active &&
        `
            background-color: #c1c5cc;
            color: #eee;
        `}

    &:hover {
        background-color: ${({ theme }) => theme.colors.bgLighter};
    }
`;

export type MenuOption = {
    content: React.ReactNode;
    value: string;
    active?: boolean;
};

type Props = {
    trigger: any;
    options: MenuOption[];
    onSelect: (value: string) => any;
    renderOption?: (option: MenuOption) => any;
};

const Menu: React.FC<Props> = (props: Props) => {
    const [isOpen, setOpen] = useState(false);
    const ref = useRef();
    const handleClickOutside = useCallback(() => setOpen(false), [setOpen]);
    useOnClickOutside(ref, handleClickOutside);

    const { trigger, options, onSelect, renderOption } = props;

    return (
        <MenuWrapper ref={ref}>
            {React.cloneElement(trigger, { onClick: () => setOpen(prev => !prev) })}

            {isOpen && (
                <OptionsList>
                    {options.map((option, index) => (
                        <OptionItem
                            active={option.active}
                            onClick={() => {
                                setOpen(false);
                                onSelect(option.value);
                            }}
                            key={index}
                        >
                            {renderOption ? renderOption(option) : option.content}
                        </OptionItem>
                    ))}
                </OptionsList>
            )}
        </MenuWrapper>
    );
};

export default Menu;
