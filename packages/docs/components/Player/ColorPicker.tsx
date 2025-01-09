import React from "react";

export const colorPickerColors = ["#686de0", "#be2edd", "#f0932b", "#f9ca24"];

export const ColorPicker: React.FC<{
  readonly selected: string;
  readonly onSelected: (color: string) => void;
}> = ({ selected, onSelected }) => {
  return (
    <div
      style={{
        display: "flex",
        marginTop: 15,
        flexDirection: "row",
      }}
    >
      {colorPickerColors.map((c) => {
        return (
          <div
            key={c}
            onClick={() => onSelected(c)}
            style={{
              backgroundColor: c,
              height: 40,
              width: 40,
              borderRadius: 20,
              marginRight: 8,
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {selected === c ? (
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="check"
                className="svg-inline--fa fa-check fa-w-16"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                style={{
                  height: 20,
                }}
              >
                <path
                  fill="white"
                  d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
                />
              </svg>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
