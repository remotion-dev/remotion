import type { SetStateAction } from "react";
import React from "react";
import styles from "./pricing.module.css";

const triangle = (
  <svg
    width="12px"
    height="7px"
    viewBox="0 0 12 7"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.17096 0.475588C6.73198 0.0764969 6.01906 0.0764969 5.58007 0.475588L1.08483 4.56228C0.761737 4.85601 0.666915 5.29341 0.84251 5.67654C1.01811 6.05966 1.42549 6.3087 1.88203 6.3087H10.8725C11.3255 6.3087 11.7364 6.05966 11.912 5.67654C12.0876 5.29341 11.9893 4.85601 11.6697 4.56228L7.17448 0.475588H7.17096Z"
      fill="#EAEAEA"
    />
  </svg>
);

const container: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  border: "1px solid #EAEAEA",
  borderRadius: 4,
  width: 90,
  height: 42,
  overflow: "hidden",
};

const buttonContainer: React.CSSProperties = {
  display: "flex",
  width: 30,
  padding: 2,
  height: 20,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "inherit",
  cursor: "pointer",
  border: "none",
};

export const Counter: React.FC<{
  count: number;
  setCount: React.Dispatch<SetStateAction<number>>;
}> = ({ count, setCount }) => {
  return (
    <div style={container}>
      <div className={styles.pricetag}>{count}</div>
      <div style={{ display: "flex", flexDirection: "column", marginLeft: 10 }}>
        <button
          type="button"
          style={{
            ...buttonContainer,
            borderLeft: "1px solid #EAEAEA",
            borderBottom: "1px solid #EAEAEA",
          }}
          onClick={() => setCount((c) => Math.max(1, c + 1))}
        >
          {triangle}
        </button>
        <button
          type="button"
          style={{
            transform: "rotate(180deg)",
            ...buttonContainer,
            borderRight: "1px solid #EAEAEA",
            borderLeft: "none",
          }}
          onClick={() => setCount((c) => Math.max(1, c - 1))}
        >
          {triangle}
        </button>
      </div>
    </div>
  );
};
