/* eslint-disable no-alert */
import { useMemo } from "react";
import { useCallback, useState } from "react";
import React from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import { Seo } from "../../components/Seo";
import styles from "./v4.module.css";
import { BlueButton } from "../../../components/layout/Button";
import { CoolInput } from "../../../components/TextInput";
import { Spacer } from "../../../components/layout/Spacer";
import { V4Countdown } from "../../components/V4Countdown";

const spacer: React.CSSProperties = {
  height: "10px",
};

const errorStyle: React.CSSProperties = {
  color: "#FF3232",
  textAlign: "center",
};

const V4: React.FC = () => {
  const [email, setEmail] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buttonLabel = useMemo(() => {
    if (subscribed) {
      return "Subscribed!";
    }

    return loading ? "submitting..." : "submit";
  }, [loading, subscribed]);
  const isValidEmail = (inputMail: string) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(inputMail);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setEmail(e.target.value);
    },
    []
  );

  const onSubmit: React.FormEventHandler = useCallback(
    async (e) => {
      try {
        e.preventDefault();
        setSubscribed(false);
        setError(null);

        if (isValidEmail(email)) {
          setLoading(true);
          const res = await fetch(
            "https://companies.remotion.dev/api/launch-4",
            {
              method: "POST",
              body: JSON.stringify({ email }),
              headers: { "content-type": "application/json" },
            }
          );
          const json = await res.json();
          if (json.success) {
            setSubscribed(true);
          } else {
            setLoading(false);
            alert("Something went wrong. Please try again later.");
          }
        } else {
          setError("Invalid email provided");
        }
      } catch (err) {
        setLoading(false);
        alert("Something went wrong. Please try again later");
        console.error(err);
      }
    },
    [email]
  );

  return (
    <Layout>
      <Head>{Seo.renderTitle("Remotion V4")}</Head>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <h1 className={styles.pagetitle}>Remotion V4 launches in</h1>

          <V4Countdown />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <p className={styles.title}>On July 3, 7 p.m UTC+2</p>
          </div>

          <div style={spacer} />
          <div style={spacer} />

          <p className={styles.title}> July 3: V4 keynotes</p>
          <p> Whats new with Remotion V4? </p>
          <p className={styles.title}> July 4: .....</p>
          <p> insert text</p>

          <p className={styles.title}> July 5: .....</p>
          <p> Insert text</p>
          <div className={styles.panel}>
            <p>
              Get a newsletter with all the imporant information when Remotion
              V4 launches!
            </p>
            <CoolInput
              type="email"
              autoComplete="none"
              onChange={onChange}
              placeholder="Your email adress"
              style={{ width: "100%" }}
            />
            <Spacer />
            <Spacer />

            <BlueButton
              type="submit"
              fullWidth
              onClick={onSubmit}
              loading={loading}
              disabled={loading || subscribed}
              size="bg"
            >
              {buttonLabel}
            </BlueButton>
            <Spacer />
            <div style={errorStyle}>{error}</div>
          </div>
          <div style={spacer} />
        </div>
      </div>
    </Layout>
  );
};

export default V4;
