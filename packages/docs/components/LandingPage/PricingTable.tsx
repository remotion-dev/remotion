import React, { useState } from "react";
import { BlueButton } from "../layout/Button";
import { Spacer } from "../layout/Spacer";
import { PeriodSelector } from "../PeriodSelector";
import { Triangle } from "../Triangle";
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
                Unlimited usage of all Remotion tools
              </li>
              <li>
                <Bullet color="#4290f5" />
                Commercial use allowed
              </li>
              <li>
                <Bullet color="#4290f5" />
                Community support
              </li>
            </ul>
            <div style={{ flex: 1 }} />
            <BlueButton fullWidth disabled loading={false} size="bg">
              No signup required
            </BlueButton>
          </div>
        </div>
        <Spacer />
        <Spacer />
        <Spacer />
        <div className={styles.portion} style={{ flex: 2 }}>
          <div className={styles.targettitle}>Companies</div>
          <div className={styles.pricingrow}>
            <div className={styles.panel}>
              <strong>Developer seat</strong>
              <div
                className={[styles.tableprice, styles.gradientprice].join(" ")}
              >
                {period === Period.Monthly ? "$15" : "$150"}
              </div>
              <div className={styles.perperiod}>
                per {period === Period.Monthly ? "month" : "year"}
              </div>
              <ul>
                <li>
                  <Bullet color="#79367a" />
                  allows 1 developer to work on Remotion projects
                </li>
                <li>
                  <Bullet color="#79367a" />
                  may use Remotion on multiple machines
                </li>
                <li>
                  <Bullet color="#79367a" />
                  Access to prioritized support
                </li>
                <li>
                  <Bullet color="#79367a" />
                  As long as you make renders, at least one license must be kept
                  active
                </li>
              </ul>
              <div style={{ flex: 1 }} />
              <a
                className={styles.pricinga}
                href="https://companies.remotion.dev"
                target="_blank"
                data-splitbee-event="License-Buy"
                data-splitbee-event-target={`developer-${period}`}
              >
                <div>
                  <BlueButton fullWidth loading={false} size="bg">
                    Buy a license
                  </BlueButton>
                </div>
              </a>
            </div>
            <Spacer />
            <Spacer />
            <Spacer />
            <div className={styles.panel}>
              <strong>Cloud rendering seat</strong>
              <div
                className={[styles.tableprice, styles.orangeprice].join(" ")}
              >
                {period === Period.Monthly ? "$10" : "$100"}
              </div>
              <div className={styles.perperiod}>
                per {period === Period.Monthly ? "month" : "year"}
              </div>
              <ul>
                <li>
                  <Bullet color="#f5ad43" />
                  Choose 1 seat per cloud instance (e.g. VPS, EC2) you are
                  running Remotion on
                </li>
                <li>
                  <Bullet color="#f5ad43" />
                  Pay only for as long as you are rendering videos.
                </li>
                <li>
                  <Bullet color="#f5ad43" />
                  Using serverless? Choose 1 seat per 2.000 renders per month.
                </li>
              </ul>
              <div style={{ flex: 1 }} />
              <a
                className={styles.pricinga}
                href="https://companies.remotion.dev"
                target="_blank"
                data-splitbee-event="License-Buy"
                data-splitbee-event-target={`cloud-${period}`}
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
      <p style={{ textAlign: "center", marginTop: 24 }}>
        Want a 15 minute call to evaluate if Remotion is right for you?{" "}
        <a
          style={{
            color: "var(--blue-button-color)",
            fontWeight: "bold",
            textDecoration: "none",
          }}
          href="mailto:hi@remotion.dev"
        >
          Contact us
        </a>
      </p>
    </div>
  );
};
