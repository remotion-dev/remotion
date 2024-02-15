import React, { useState } from "react";
import { BlueButton } from "../layout/Button";
import { Spacer } from "../layout/Spacer";
import { PeriodSelector } from "../PeriodSelector";
import { Triangle } from "../Triangle";
import { DEV_SEAT_PRICE_INCREASE } from "./price-increase";
import styles from "./pricing.module.css";

enum Period {
  Monthly = "monthly",
  Yearly = "yearly",
}

const Bullet: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className={styles.bulletcontainer}>
      <Triangle size={15} opacity={1} color1={color} />
    </div>
  );
};

export const PricingTable: React.FC<{}> = () => {
  const [period, setPeriod] = useState(Period.Monthly);
  return (
    <div>
      <PeriodSelector period={period} setPeriod={setPeriod} />
      <div className={styles.pricingrow}>
        <div className={styles.portion}>
          <div className={styles.targettitle}>
            Individuals &amp; Small teams
          </div>
          <div className={styles.panel}>
            <strong>Completely</strong>
            <div className={[styles.tableprice, styles.freeprice].join(" ")}>
              Free
            </div>
            <div className={styles.perperiod}>forever!</div>
            <ul>
              <li>
                <Bullet color="#4290f5" />
                Unlimited use of Remotion
              </li>
              <li>
                <Bullet color="#4290f5" />
                For teams up to 3 people
              </li>
              <li>
                <Bullet color="#4290f5" />
                Commercial use allowed
              </li>
              <li>
                <Bullet color="#4290f5" />
                Cloud rendering allowed
              </li>
              <li>
                <Bullet color="#4290f5" />
                Community support
              </li>
            </ul>
            <div style={{ flex: 1 }} />
            <a className={styles.pricinga} href="/docs">
              <div>
                <BlueButton fullWidth loading={false} size="bg">
                  Get started
                </BlueButton>
              </div>
            </a>
          </div>
        </div>
        <Spacer />
        <Spacer />
        <Spacer />
        <div style={{ flex: 2 }}>
          <div className={styles.targettitle}>Companies</div>
          <div className={styles.pricingrow}>
            <div className={styles.panel}>
              <div className={styles.doublepanel}>
                <div className={styles.doublepanelsingle}>
                  <strong>Developer Seat</strong>
                  <div
                    className={[styles.tableprice, styles.gradientprice].join(
                      " ",
                    )}
                  >
                    {Date.now() < DEV_SEAT_PRICE_INCREASE
                      ? period === Period.Monthly
                        ? "$15"
                        : "$150"
                      : period === Period.Monthly
                        ? "$25"
                        : "$250"}
                  </div>
                  <div className={styles.perperiod}>
                    per {period === Period.Monthly ? "month" : "year"}
                  </div>
                  <ul>
                    <li>
                      <Bullet color="#79367a" />
                      Allows 1 developer to work on Remotion projects
                    </li>
                    <li>
                      <Bullet color="#79367a" />
                      May use Remotion on multiple local machines
                    </li>
                    <li>
                      <Bullet color="#79367a" />
                      Designated stable releases
                    </li>
                    <li>
                      <Bullet color="#79367a" />
                      Prioritized support
                      <a
                        href="/docs/support"
                        style={{
                          color: "inherit",
                          opacity: 0.5,
                          marginLeft: 4,
                        }}
                      >
                        <sup> see policy</sup>
                      </a>
                    </li>
                    <li>
                      <Bullet color="#79367a" />
                      Rendering requires at least one active license
                    </li>
                  </ul>
                  <div style={{ flex: 1 }} />
                </div>
                <div className={styles.plus}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path
                      fill="currentColor"
                      d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"
                    />
                  </svg>
                </div>
                <div className={styles.doublepanelsingle}>
                  <strong>Cloud Rendering Seat</strong>
                  <div
                    className={[styles.tableprice, styles.orangeprice].join(
                      " ",
                    )}
                  >
                    {period === Period.Monthly ? "$10" : "$100"}
                  </div>
                  <div className={styles.perperiod}>
                    per {period === Period.Monthly ? "month" : "year"}
                  </div>
                  <ul>
                    <li>
                      <Bullet color="#f5ad43" />
                      Rendering up to {"2'000 "} videos in a serverless or
                      serverside infrastructure
                    </li>
                    <li>
                      <Bullet color="#f5ad43" />
                      Flexible licensing for projects and campaigns
                    </li>
                  </ul>
                </div>
              </div>
              {Date.now() > DEV_SEAT_PRICE_INCREASE ? (
                <div className={styles.minimum}>
                  Minimum Amount:{" "}
                  {period === Period.Monthly ? "$100/month" : "$1'000/year"}
                </div>
              ) : null}
              <a
                className={styles.pricinga}
                href="https://www.remotion.pro"
                target="_blank"
              >
                <div>
                  <BlueButton fullWidth loading={false} size="bg">
                    Buy a license
                  </BlueButton>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <p style={{ marginTop: 24, fontFamily: "GTPlanar" }}>
        Want a 20-minute call to evaluate if Remotion is right for you?{" "}
        <a
          style={{
            color: "var(--ifm-color-primary)",
            fontWeight: "bold",
            textDecoration: "none",
          }}
          target="_blank"
          href="https://cal.com/remotion/evaluate"
        >
          Contact us
        </a>
      </p>
      <p style={{ marginTop: 0 }}>
        Looking for help realizing your project?{" "}
        <a
          style={{
            color: "var(--ifm-color-primary)",
            fontWeight: "bold",
            textDecoration: "none",
          }}
          href="/experts"
        >
          Find experts
        </a>
      </p>
    </div>
  );
};
