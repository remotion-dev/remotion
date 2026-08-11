import React, { useEffect, useState } from "react";

export const BlinkingCircle: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsVisible((prev) => !prev);
    }, 800);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="10px"
      viewBox="0 0 512 512"
      style={{ visibility: isVisible ? "visible" : "hidden" }}
    >
      <path fill="red" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
    </svg>
  );
};

export const RecordCircle: React.FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="10px" viewBox="0 0 512 512">
      <path fill="red" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
    </svg>
  );
};
