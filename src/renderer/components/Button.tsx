import React, { FC } from 'react';

export enum ButtonType {
  Neutral,
  Emphasis,
  Positive,
  Caution,
  Danger,
}

export interface ButtonProps {
  type?: ButtonType;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Button: FC<ButtonProps> = ({
  type = ButtonType.Neutral,
  disabled = false,
  className = '',
  onClick = () => {},
  children,
}) => {
  let buttonClass;
  switch (type) {
    case ButtonType.Neutral:
      buttonClass = 'button-neutral';
      break;
    case ButtonType.Emphasis:
      buttonClass = 'button-emphasis';
      break;
    case ButtonType.Positive:
      buttonClass = 'button-positive';
      break;
    case ButtonType.Caution:
      buttonClass = 'button-caution';
      break;
    case ButtonType.Danger:
      buttonClass = 'button-danger';
      break;
  }

  return (
    <button disabled={disabled} className={`button ${buttonClass} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};
