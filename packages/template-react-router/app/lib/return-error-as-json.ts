import { ActionFunction } from "react-router";

export const errorAsJson = (fn: ActionFunction): ActionFunction => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      return new Response(
        JSON.stringify({ type: "error", message: (err as Error).message }),
        { status: 500 },
      );
    }
  };
};
