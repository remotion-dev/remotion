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
          setError("Invalid Email");
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
          <p className={styles.title}>V4 Launch</p>

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
            {error}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default V4;
