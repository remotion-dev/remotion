import React, { useEffect, useReducer, useRef, useState } from "react";
import styled from "styled-components";
import { GithubResponse } from "./GithubDemo";
import { ProgrammaticContent } from "./Programmatic";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  text-align: left;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 2.5em;
  font-weight: 700;
  font-family: --apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  line-height: 1.1;
  text-align: left;
`;

const Mp4 = styled.span`
  background: linear-gradient(to right, rgb(66, 144, 245), rgb(66, 233, 245));
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
`;

const SubmitButton = styled.button`
  appearance: none;
  padding: 14px 16px;
  background-color: rgb(66, 144, 245);
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 3px;
  font-size: 14px;
  cursor: pointer;
`;

const Input = styled.input`
  color: var(--text-color);
`;

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
    <Row>
      <div style={{ flex: 1 }}>
        <Title>
          <Mp4>Programmatic</Mp4> content <br />
          and rendering
        </Title>
        <p>
          Fetch data from an API and use it as the content. <br />
          Render videos programmatically using our server-side APIs.
        </p>
        <span style={{ fontSize: 13 }}>
          Customize the video by entering your Github username.
        </span>
        <div style={{ height: 10 }}></div>
        <div>
          <Input
            autoFocus
            ref={ref}
            type="text"
            placeholder="Your Github username"
          ></Input>{" "}
          <div style={{ width: 8, display: "inline-block" }}></div>
          <SubmitButton
            disabled={state.type === "loading"}
            style={{ opacity: state.type === "loading" ? 0.5 : 1 }}
            onClick={() => setUsername(ref.current?.value as string)}
          >
            Show video
          </SubmitButton>
        </div>
        {state.type === "error" ? (
          <div style={{ color: "red" }}>{state.type}</div>
        ) : null}
      </div>
      <ProgrammaticContent
        data={state.type === "loaded" ? state.response : null}
      />
    </Row>
  );
};
