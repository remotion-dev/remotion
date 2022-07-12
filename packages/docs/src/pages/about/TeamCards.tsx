import React from "react";
import TeamCardsCSS from "./TeamCardsCSS.module.css";
import Jonny from "../about/images/Jonny Burger.png";
import Mehmet from "../about/images/Mehmet Ademi.png";
import Patric from "../about/images/Patric Salvisberg.png";
import { TwitterLogo, LinkedInLogo, GitHubLogo, EmailLogo } from "./icons";
import { BlueButton } from "../../../components/layout/Button";
import { Spacer } from "../../../components/layout/Spacer";

const ButtonMailto = ({ mailto, label }) => {
  return <a href={mailto}>{label}</a>;
};

export default ButtonMailto;

const panel: React.CSSProperties = {
  backgroundColor: "var(--ifm-background-color)",
  boxShadow: "var(--box-shadow)",
  padding: 10,
  borderRadius: 15,
  flex: 1,
  paddingTop: 30,
  paddingBottom: 10,
  minHeight: 600,
  display: "flex",
  flexDirection: "column",
};

const center: React.CSSProperties = {
  textAlign: "center",
};

const row: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
};

const flex: React.CSSProperties = {
  flex: 1,
};

const step: React.CSSProperties = {
  flex: 1,
  ...panel,
};

const list: React.CSSProperties = {
  listStyleType: "none",
  textAlign: "center",
  paddingLeft: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontWeight: 500,
};

const stepTitle: React.CSSProperties = {
  textAlign: "center",
  fontSize: "1.6em",
  marginBottom: 0,
  color: "var(--ifm-color-primary)",
};

const docsButton: React.CSSProperties = {
  textDecoration: "none",
};

export const TeamCardsLayout: React.FC<{}> = () => {
  return (
    <div className={TeamCardsCSS.row}>
      <div style={step}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={Jonny}
            style={{
              width: 250,
              height: 250,
              boxShadow: "var(--box-shadow)",
              borderRadius: 1500,
            }}
          />
        </div>
        <Spacer />
        <Spacer />
        <Spacer />
        <Spacer />
        <Spacer />
        <h2 style={stepTitle}>Jonny</h2>
        <strong style={center}>Chief Hacker</strong>

        <ul style={{ ...list, flex: 1 }}>
          <li>
            As a former indie hacker I loved working on projects that combine
            engineering, art and business. At Remotion I bascially do the same
            just together with an amazing community and team.
          </li>
        </ul>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          {
            <>
              <div style={flex}>
                <a style={docsButton} href="https://twitter.com/JNYBGR">
                  <BlueButton loading={false} fullWidth size="sm">
                    <TwitterLogo /> Twitter
                  </BlueButton>
                </a>
              </div>
              <Spacer />
              <Spacer />
            </>
          }
          <div style={flex}>
            <a
              style={docsButton}
              href="https://ch.linkedin.com/in/jonny-burger-4115109b"
            >
              <BlueButton loading={false} fullWidth size="sm">
                <LinkedInLogo /> LinkedIn
              </BlueButton>
            </a>
          </div>
        </div>
        <div style={{ height: 10 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div style={flex}>
            <a style={docsButton} href="https://github.com/JonnyBurger">
              <BlueButton loading={false} fullWidth size="sm">
                <GitHubLogo /> GitHub
              </BlueButton>
            </a>
          </div>
          <Spacer />
          <Spacer />
          <div style={flex}>
            <a style={docsButton} href="mailto:jonny@remotion.dev">
              <BlueButton loading={false} fullWidth size="sm">
                <EmailLogo /> E-Mail
              </BlueButton>
            </a>
          </div>
        </div>
      </div>
      <Spacer />
      <Spacer />
      <Spacer />
      <div style={step}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={Mehmet}
            style={{
              width: 250,
              height: 250,
              boxShadow: "var(--box-shadow)",
              borderRadius: 1500,
            }}
          />
        </div>
        <Spacer />
        <Spacer />
        <Spacer />
        <Spacer />
        <Spacer />

        <h2 style={stepTitle}>Mehmet</h2>
        <strong style={center}>Business Manager</strong>

        <ul style={{ ...list, flex: 1 }}>
          <li>
            Coming from traditional business, I had the opportunity to join
            Remotion. It allows me to express my passion for technology and
            business, and uniquely combine these two.
          </li>
        </ul>
        <div style={row}>
          {
            <>
              <div style={flex}>
                <a style={docsButton} href="https://twitter.com/MehmetAdemi">
                  <BlueButton loading={false} fullWidth size="sm">
                    <TwitterLogo /> Twitter
                  </BlueButton>
                </a>
              </div>
              <Spacer />
              <Spacer />
            </>
          }
          <div style={flex}>
            <a
              style={docsButton}
              href="https://www.linkedin.com/in/mehmet-ademi/?locale=en_US"
            >
              <BlueButton loading={false} fullWidth size="sm">
                <LinkedInLogo /> LinkedIn
              </BlueButton>
            </a>
          </div>
        </div>
        <div style={{ height: 10 }} />
        <div style={row}>
          {
            <>
              <div style={flex}>
                <a style={docsButton} href="https://github.com/MehmetAdemi">
                  <BlueButton loading={false} fullWidth size="sm">
                    <GitHubLogo /> GitHub
                  </BlueButton>
                </a>
              </div>
              <Spacer />
              <Spacer />
              <div style={flex}>
                <a style={docsButton} href="mailto:mehmet@remotion.dev">
                  <BlueButton loading={false} fullWidth size="sm">
                    <EmailLogo /> E-Mail
                  </BlueButton>
                </a>
              </div>
            </>
          }
        </div>
      </div>
      <Spacer />
      <Spacer />
      <Spacer />
      <div style={step}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={Patric}
            style={{
              width: 250,
              height: 250,
              boxShadow: "var(--box-shadow)",
              borderRadius: 1500,
            }}
          />
        </div>
        <Spacer />
        <Spacer />
        <Spacer />
        <Spacer />
        <Spacer />

        <h2 style={stepTitle}>Patric</h2>
        <strong style={center}>Intern</strong>

        <ul style={{ ...list, flex: 1 }}>
          <li>
            {
              "My passion for programming and art led to Remotion. Where I'm able to work with cutting-edge technology while I'm doing my CS degree."
            }
          </li>
        </ul>
        <div style={row}>
          {
            <>
              <div style={flex}>
                <a style={docsButton} href="https://twitter.com/Salvispat">
                  <BlueButton loading={false} fullWidth size="sm">
                    <TwitterLogo /> Twitter
                  </BlueButton>
                </a>
              </div>
              <Spacer />
              <Spacer />
            </>
          }
          <div style={flex}>
            <a
              style={docsButton}
              href="https://www.linkedin.com/in/patric-salvisberg-b73b51234/"
            >
              <BlueButton loading={false} fullWidth size="sm">
                <LinkedInLogo /> LinkedIn
              </BlueButton>
            </a>
          </div>
        </div>
        <div style={{ height: 10 }} />
        <div style={row}>
          {
            <>
              <div style={flex}>
                <a style={docsButton} href="https://github.com/patsalv">
                  <BlueButton loading={false} fullWidth size="sm">
                    <GitHubLogo /> GitHub
                  </BlueButton>
                </a>
              </div>
              <Spacer />
              <Spacer />
              <div style={flex}>
                <a style={docsButton} href="mailto:patric@remotion.dev">
                  <BlueButton loading={false} fullWidth size="sm">
                    <EmailLogo /> E-Mail
                  </BlueButton>
                </a>
              </div>
            </>
          }
        </div>
      </div>
    </div>
  );
};
