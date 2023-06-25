/* eslint-disable no-alert */
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import React, { useCallback, useMemo, useState } from "react";
import { Spacer } from "../../../components/layout/Spacer";
import { CoolInput } from "../../../components/TextInput";
import { DoMoreHero } from "../../components/DoMoreHero/DoMoreHero";
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
      <DoMoreHero />
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <h1 className={styles.pagetitle}>Do more with React</h1>
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
              locked={false}
            />
            <EventComp
              locked
              date="July 4th"
              title="Visual editing"
              description="Expose parameters to the user interface, edit them, see the result in real-time and save them back to code."
            />
            <EventComp
              locked
              date="July 5th"
              title="Render button"
              description="Parametrize React content and export React components as videos and other media with the click of a button."
            />
            <EventComp
              locked
              description="Leverage the new system for data fetching and dynamically calculating the duration and dimensions of your video."
              date="July 6th"
              title="Data-driven videos"
            />
            <EventComp
              locked
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
  locked: boolean;
}> = ({ date, title, description, locked }) => {
  return (
    <div
      style={{
        border: "2px solid var(--ifm-font-color-base)",
        borderRadius: 8,
        padding: 10,
      }}
    >
      <p className={styles.date}>{date}</p>
      {locked ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 448 512"
          >
            <path
              fill="var(--subtitle)"
              d="M144 128v64H304V128c0-44.2-35.8-80-80-80s-80 35.8-80 80zM96 192V128C96 57.3 153.3 0 224 0s128 57.3 128 128v64h32c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H96zM48 256V448c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V256c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16z"
            />
          </svg>
        </div>
      ) : (
        <>
          <p className={styles.eventtitle}>{title}</p>
          <p>{description}</p>
        </>
      )}
    </div>
  );
};

export default V4;
