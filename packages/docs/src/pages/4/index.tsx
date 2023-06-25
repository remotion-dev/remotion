/* eslint-disable no-alert */
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import React, { useCallback, useMemo, useState } from "react";
import { Spacer } from "../../../components/layout/Spacer";
import { CoolInput } from "../../../components/TextInput";
import { Seo } from "../../components/Seo";
import { V4Countdown } from "../../components/V4Countdown";
import styles from "./v4.module.css";

const spacer: React.CSSProperties = {
  height: "10px",
};

const errorStyle: React.CSSProperties = {
  color: "#FF3232",
  textAlign: "center",
};

const V4: React.FC = () => {
  const context = useDocusaurusContext();

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
      <Head>
        {Seo.renderTitle("Do more with React | Remotion 4.0")}
        {Seo.renderImage("/img/remotion4.png", context.siteConfig.url)}
      </Head>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <h1 className={styles.pagetitle}>Do more with React.</h1>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <p className={styles.title}>
              Learn about the new possibilities of Remotion 4.0 and celebrate
              the launch with us.{" "}
            </p>
          </div>
          <br />
          <br />
          <div style={{ textAlign: "center" }}>
            <div>
              <V4Countdown />
            </div>
            <div>
              <div className={[styles.button, styles.calendarbutton].join(" ")}>
                <a
                  href="/documents/RemotionV4Launch.ics"
                  download="RemotionV4Launch.ics"
                >
                  Add to Calendar
                </a>
              </div>
            </div>
          </div>

          <div style={{ height: "60px" }} />
          <div className={styles.grid}>
            <EventComp
              description="Celebrate the launch of Remotion 4.0 and experience the new possibilities of video creation with React."
              date="July 3rd"
              title="Keynote"
            />
            <EventComp
              date="July 4th"
              title="Visual editing"
              description="Expose parameters to the user interface, edit them, see the result in real-time and save them back to code."
            />
            <EventComp
              date="July 5th"
              title="Render button"
              description="Parametrize React content and export React components as videos and other media with the click of a button."
            />
            <EventComp
              description="Leverage the new system for data fetching and dynamically calculating the duration and dimensions of your video."
              date="July 6th"
              title="Data-driven videos"
            />
            <EventComp
              description="A rundown of the remaining improvements coming with Remotion 4.0."
              date="July 7th"
              title="Last but not least"
            />
            <div className={styles.panel}>
              <div style={{ marginBottom: 10 }}>
                Get a reminder on July 3rd:
              </div>
              <CoolInput
                type="email"
                autoComplete="none"
                onChange={onChange}
                placeholder="Your email adress"
                style={{ width: "100%", fontFamily: "GTPlanar" }}
              />
              <Spacer />
              <Spacer />

              <button
                type="submit"
                onClick={onSubmit}
                disabled={loading || subscribed}
              >
                {buttonLabel}
              </button>
              <Spacer />
              <div style={errorStyle}>{error}</div>
            </div>
          </div>
          <div style={spacer} />
          <div style={spacer} />
        </div>
      </div>
    </Layout>
  );
};

export const EventComp: React.FC<{
  date: string;
  title: string;
  description: string;
}> = ({ date, title, description }) => {
  return (
    <div
      style={{
        border: "2px solid var(--ifm-font-color-base)",
        borderRadius: 8,
        padding: 10,
      }}
    >
      <p className={styles.date}>{date}</p>
      <p className={styles.eventtitle}>{title}</p>
      <p>{description}</p>
    </div>
  );
};

export default V4;
