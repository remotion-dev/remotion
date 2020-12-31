import React from "react";

export function StartPageExplainer(props) {
  return (
    <div style={{ display: "inline-block", textAlign: "center" }}>
      <img
        src={props.img}
        alt="Screenshot Remotion Player"
        style={{ maxHeight: 400 }}
      />
      <br />
      <div style={{ color: "white", fontSize: 14 }}>{props.text}</div>
    </div>
  );
}
