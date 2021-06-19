import type { AppProps } from "next/app";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
      <h1
        style={{
          textAlign: "center",
          color: "rgb(74,149,245)",
          textDecoration: "underline",
        }}
      >
        {" "}
        Remotion Player with Next.js
      </h1>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
