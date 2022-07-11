import React from "react";
import logo from "./Remotion logo.png"; // Tell webpack this JS file uses this image
import Jonny from "./Jonny Burger.jpg";
import Mehmet from "./Mehmet Ademi.jpg";
import Patric from "./Patric Salvisberg.jpg";

export function Header() {
  // Import result is the URL of your image
  return <img src={logo} style={{ width: 300, height: 300 }} />;
}

export function Header1() {
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
}

export function Header2() {
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
}

export function Header3() {
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
}
