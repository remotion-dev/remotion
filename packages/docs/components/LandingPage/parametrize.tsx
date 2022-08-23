import React, { useEffect, useReducer, useRef, useState } from "react";
import "../input-fields.css";
import { BlueButton } from "../layout/Button";
import type { GithubResponse } from "./GithubDemo";
import styles from "./parametrize.module.css";
import { ProgrammaticContent } from "./Programmatic";

const cache: { [key: string]: GithubResponse } = {};

const makeRequest = async (username: string): Promise<GithubResponse> => {
  if (cache[username]) {
    return cache[username];
  }

  const response = await fetch(`https://api.github.com/users/${username}`);
  const json = await response.json();
  if (response.status !== 200) {
    throw new Error(json.message);
  }

  cache[username] = json;
  return json;
};

type Actions =
  | {
      type: "fetch-video";
    }
  | {
      type: "receive-video";
      response: GithubResponse;
    }
  | {
      type: "receive-error";
      error: Error;
    };

type State =
  | {
      type: "error";
      error: Error;
    }
  | {
      type: "loaded";
      response: GithubResponse;
    }
  | {
      type: "loading";
    };

const reducer = (state: State, action: Actions): State => {
  switch (action.type) {
    case "fetch-video":
      return {
        type: "loading",
      };
    case "receive-video":
      return {
        type: "loaded",
        response: action.response,
      };
    case "receive-error":
      return {
        type: "error",
        error: action.error,
      };
    default:
      return state;
  }
};

export const Parametrize: React.FC = () => {
  const ref = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("JonnyBurger");

  const [state, dispatch] = useReducer(reducer, { type: "loading" });

  useEffect(() => {
    dispatch({
      type: "fetch-video",
    });
    makeRequest(username)
      .then((response) => {
        dispatch({
          type: "receive-video",
          response,
        });
      })
      .catch((error) => {
        dispatch({
          type: "receive-error",
          error,
        });
      });
  }, [username]);

  return (
    <div className={styles.parametrizerow}>
      <div style={{ flex: 1 }}>
        <h2 className={styles.parametrizetitle}>
          <span className={styles.parametrizegradient}>Programmatic</span>{" "}
          content <br />
          and rendering
        </h2>
        <p>
          Fetch data from an API and use it as the content. <br />
          Display it in real-time with the{" "}
          <a href="/player">@remotion/player</a>.<br />
          Render videos programmatically using{" "}
          <a href="/lambda">@remotion/lambda</a>.
        </p>
        <span style={{ fontSize: 13 }}>
          Customize the video by entering your GitHub username.
        </span>
        <div style={{ height: 10 }} />
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!ref.current?.value) {
                return;
              }

              setUsername(ref.current?.value as string);
            }}
            style={{ display: "flex", flexDirection: "row" }}
          >
            <input
              ref={ref}
              className={styles.parametrizeinput}
              type="text"
              placeholder="Your GitHub username"
            />{" "}
            <div style={{ width: 8, display: "inline-block" }} />
            <BlueButton
              loading={state.type === "loading"}
              fullWidth={false}
              size="sm"
              onClick={() => {
                if (!ref.current?.value) {
                  return;
                }

                setUsername(ref.current?.value as string);
              }}
            >
              Show video
            </BlueButton>
          </form>
        </div>
        {state.type === "error" ? (
          <div style={{ color: "red", fontSize: 13 }}>
            Error: {state.error.message}
          </div>
        ) : null}
      </div>
      <ProgrammaticContent
        data={state.type === "loaded" ? state.response : null}
      />
    </div>
  );
};
