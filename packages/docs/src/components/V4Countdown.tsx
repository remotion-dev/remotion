import { useEffect } from "react";
import React from "react";
import { useState } from "react";

const style: React.CSSProperties = {
  display: "flex",
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
};

const timeWrapper: React.CSSProperties = {
  padding: "10px",
  borderRadius: " 15px",
  paddingBottom: "10px",
  display: "flex",
  flexDirection: "column",
  fontSize: "3em",
  justifyContent: "center",
  alignItems: "center",
  fontVariantNumeric: "tabular-nums",
};

export const V4Countdown: React.FC = () => {
  const [countdown, setCountdown] = useState<[string, string, string, string]>([
    "00",
    "00",
    "00",
    "00",
  ]);

  const targetUnixTimeStamp = 1688403600;

  useEffect(() => {
    const interval = setInterval(() => {
      const currentCountdown = getUpdatedCountdown();
      setCountdown(currentCountdown);
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const getUpdatedCountdown = (): [string, string, string, string] => {
    const currentUnixTime = Math.floor(Date.now() / 1000);

    const timeRemaining = targetUnixTimeStamp - currentUnixTime;
    let remainder = 0;
    const days = Math.floor(timeRemaining / (60 * 60 * 24));
    remainder = timeRemaining % (60 * 60 * 24);
    const hours = Math.floor(remainder / (60 * 60));
    remainder %= 60 * 60;
    const minutes = Math.floor(remainder / 60);
    remainder %= 60;
    const seconds = Math.floor(remainder);

    const strDays = days < 10 ? "0" + days.toString() : days.toString();
    const strHours = hours < 10 ? "0" + hours.toString() : hours.toString();
    const strMinutes =
      minutes < 10 ? "0" + minutes.toString() : minutes.toString();
    const strSeconds =
      seconds < 10 ? "0" + seconds.toString() : seconds.toString();

    return [strDays, strHours, strMinutes, strSeconds];
  };

  return (
    <div style={style}>
      <h1 style={timeWrapper}>
        {countdown[0]}
        <p style={{ fontSize: "16px" }}> Days</p>
      </h1>
      <h1 style={timeWrapper}>
        {countdown[1]}
        <p style={{ fontSize: "16px" }}> Hours</p>
      </h1>
      <h1 style={timeWrapper}>
        {countdown[2]}
        <p style={{ fontSize: "16px" }}> Minutes</p>
      </h1>
      <h1 style={timeWrapper}>
        {countdown[3]} <p style={{ fontSize: "16px" }}> Seconds</p>
      </h1>
    </div>
  );
};
