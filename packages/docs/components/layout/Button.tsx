import { opacify } from "polished";
import React, { ComponentProps } from "react";
import styled from "styled-components";
import { RED, UNDERLAY_RED } from "./colors";

type ExtraProps = {
  size: Size;
  fullWidth: boolean;
  background: string;
  hoverColor: string;
  color: string;
  loading: boolean;
};

const Container = styled.button<ExtraProps>`
  padding: ${(props) => (props.size === "sm" ? "10px 16px" : "16px 22px")};
  border-radius: 8px;
  font-weight: bold;
  background-color: ${(props) => props.background};
  color: ${(props) => props.color};
  cursor: ${(props) => (props.disabled ? "default" : "pointer")};
  appearance: none;
  border: none;
  font: inherit;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  transition: background-color 0.1s;
  ${(props) => (props.fullWidth ? "width: 100%;" : "")};
  opacity: ${(props) => (props.disabled ? 0.7 : 1)};
  &:not([disabled]):hover {
    background-color: ${(props) => props.hoverColor};
  }
`;

type Size = "sm" | "bg";

type Props = ComponentProps<typeof Container> & ExtraProps;
type MandatoryProps = Omit<ExtraProps, "background" | "color" | "hoverColor">;
type PrestyledProps = ComponentProps<typeof Container> & MandatoryProps;

export const Button: React.FC<Props> = (props) => {
  const { children, loading, ...other } = props;
  const actualDisabled = other.disabled || loading;
  return (
    <Container {...other} disabled={actualDisabled}>
      {children}
    </Container>
  );
};

export const BlueButton: React.FC<PrestyledProps> = (props) => {
  return (
    <Button
      {...props}
      background="var(--blue-underlay)"
      hoverColor="var(--blue-underlay-hover)"
      color="var(--blue-button-color)"
    />
  );
};

export const RedButton: React.FC<PrestyledProps> = (props) => {
  return (
    <Button
      {...props}
      background={UNDERLAY_RED}
      hoverColor={opacify(0.1, UNDERLAY_RED)}
      color={RED}
    />
  );
};

export const ClearButton: React.FC<PrestyledProps> = (props) => {
  return (
    <Button
      {...props}
      background="transparent"
      color="var(--text-color)"
      hoverColor="var(--clear-hover)"
    />
  );
};
