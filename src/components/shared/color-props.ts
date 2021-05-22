export type ColorVariantProps = {
  colorVariant: "primary" | "secondary";
};

export const variant2Color = (props: ColorVariantProps & any) =>
  props.colorVariant === `secondary`
    ? props.theme.colors.secondary
    : props.theme.colors.primary;

export const variant2ColorInverted = (props: ColorVariantProps & any) =>
  props.colorVariant === `secondary`
    ? props.theme.colors.bg
    : props.theme.colors.white