import React, { useState } from "react";
import "./Counter.css";
import { Player } from "@remotion/player";

const Comp: React.FC = () => {
  return <div>Hello World</div>;
};

export default function Counter({
  children,
  count: initialCount,
}: {
  children: JSX.Element;
  count: number;
}) {
  const [count, setCount] = useState(initialCount);
  const add = () => setCount((i) => i + 1);
  const subtract = () => setCount((i) => i - 1);

  return (
    <>
      <Player
        component={Comp}
        durationInFrames={100}
        compositionWidth={100}
        compositionHeight={100}
        fps={30}
      ></Player>
      <div className="counter">
        <button onClick={subtract}>-</button>
        <pre>{count}</pre>
        <button onClick={add}>+</button>
      </div>
      <div className="counter-message">{children}</div>
    </>
  );
}
