import { ActionFunction } from "react-router";

export const errorAsJson = (fn: ActionFunction): ActionFunction => {
  return async (...args) => {
    try {
      const res = await fn(...args);
      return new Response(JSON.stringify({ type: "success", data: res }), {
        status: 200,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ type: "error", message: (err as Error).message }),
        { status: 500 },
      );
    }
  };
};
