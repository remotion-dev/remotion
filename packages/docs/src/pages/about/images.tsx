import React from "react";
import Jonny from "../about/images/Jonny Burger.png";
import Mehmet from "../about/images/Mehmet Ademi.png";
import Patric from "../about/images/Patric Salvisberg.png";

export const JonnyImage = () => {
  // Import result is the URL of your image
  return (
    <img
      src={Jonny}
      style={{
        width: 300,
        height: 300,
        boxShadow: "var(--box-shadow)",
        borderRadius: 100,
      }}
    />
  );
};

export const MehmetImage = () => {
  // Import result is the URL of your image
  return (
    <img
      src={Mehmet}
      style={{
        width: 300,
        height: 300,
        boxShadow: "var(--box-shadow)",
        borderRadius: 100,
      }}
    />
  );
};

export const PatricImage = () => {
  // Import result is the URL of your image
  return (
    <img
      src={Patric}
      style={{
        width: 300,
        height: 300,
        boxShadow: "var(--box-shadow)",
        borderRadius: 100,
      }}
    />
  );
};
