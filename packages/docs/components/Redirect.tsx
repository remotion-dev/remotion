import { useEffect } from "react";

export default ({ redirect }) => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (typeof window.location === "undefined") {
      return;
    }

    window.location.href = redirect;
  }, [redirect]);
  return null;
};
