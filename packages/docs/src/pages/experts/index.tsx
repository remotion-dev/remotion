import Layout from "@theme/Layout";
import React, { useMemo } from "react";
import { random } from "remotion";
import { experts } from "../../data/experts";
import styles from "./experts.module.css";
import { Spacer } from "../../../components/layout/Spacer";
import { BlueButton } from "../../../components/layout/Button";
import {
  TwitterLogo,
  LinkedInLogo,
  GitHubLogo,
  EmailLogo,
} from "../../components/icons";

const dateString = (date: Date) =>
  date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();

const todayHash = dateString(new Date());

const docsButton: React.CSSProperties = {
  textDecoration: "none",
};

const flex: React.CSSProperties = {
  flex: 1,
};



const Experts: React.FC = () => {
  const expertsInRandomOrder = useMemo(() => {
    if (typeof window === "undefined") {
      return [];
    }

    // Have a different order every day.
    return experts.sort(
      (a, b) => random(a.name + todayHash) - random(b.name + todayHash)
    );
  }, []);

  return (
    <Layout>
      <div
        style={{
          backgroundImage: "url(/img/background-hire-page.svg)",
          backgroundSize: "100%",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className={styles.wrapper}>
          <h1 className={styles.pagetitle}>Find a Remotion expert</h1>
          <p className={styles.tagline}>
            Get help realizing your Remotion project. <br /> These people have
            indicated that they are available to work on Remotion projects. They
            appear in random order.{" "}
          </p>
            <p className={styles.tagline}>
              <a href="mailto:hi@remotion.dev?subject=Remotion+experts+directory">
                <strong>

                Are you available for hire? Let us know!
                </strong>
              </a>
            </p>
          <br />
          <br />
          {expertsInRandomOrder.map((e) => {
            return (
              <div key={e.name} className={styles.card}>
                <img className={styles.profile} src={e.image} />
                <div className={styles.spacer} />
                <div className={styles.right}>
                  <div className={styles.title}>{e.name}</div>
                  <p>{e.description}</p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    {e.twitter ? (
                      <>
                        <div style={flex}>
                          <a
                            style={docsButton}
                            target={"_blank"}
                            href={`https://twitter.com/${e.twitter}`}
                          >
                            <BlueButton loading={false} fullWidth size="sm">
                              <TwitterLogo /> Twitter
                            </BlueButton>
                          </a>
                        </div>
                        <Spacer />
                        <Spacer />
                      </>
                    ) : null}

                    {e.github ? (
                      <div style={flex}>
                        <a
                          style={docsButton}
                          target={"_blank"}
                          href={`https://github.com/${e.github}`}
                        >
                          <BlueButton loading={false} fullWidth size="sm">
                            <GitHubLogo /> GitHub
                          </BlueButton>
                        </a>
                      </div>
                    ) : null}
                  </div>
                  <Spacer />
                  <Spacer />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    {e.linkedin ? (
                      <div style={flex}>
                          <a
                            style={docsButton}
                            target={"_blank"}
                            href={`https://www.linkedin.com/${e.linkedin}`}
                          >
                            <BlueButton loading={false} fullWidth size="sm">
                              <LinkedInLogo /> LinkedIn
                            </BlueButton>
                          </a>
                        </div>
                    ) : null}
                    {e.linkedin && e.email ? (
                      <>
                        <Spacer />
                        <Spacer />
                      </>
                    ) : null} 
                    {e.email ? (
                      <div style={flex}>
                        <a
                          style={docsButton}
                          target={"_blank"}
                          href={`mailto:${e.email}`}
                        >
                          <BlueButton loading={false} fullWidth size="sm">
                            <EmailLogo /> Email
                          </BlueButton>
                        </a>
                      </div>
                    ) : null}
                  </div>

                  <br />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Experts;
