import { useEffect } from "react";

export default () => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (typeof window.location === "undefined") {
      return;
    }

    window.location.href =
      "https://github.com/remotion-dev/remotion/issues?q=+label%3A%22%F0%9F%A5%A8++hacktoberfest%22+";
  }, []);
  return null;
};
