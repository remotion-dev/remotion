import type { ReactNode } from "react";

export const Spinner: React.FC = () => {
  return (
    <div className="spinner">
      <div className="spinner-item" />
      <div className="spinner-item" />
      <div className="spinner-item" />
    </div>
  );
};

export const CircleSpinner: React.FC<{ children?: ReactNode }> = ({
  children,
}) => {
  return <span className="loader">{children} </span>;
};
