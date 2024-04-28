import React, { useCallback, useMemo } from "react";
import { Counter } from "./Counter";
import { PricingBulletPoint } from "./PricingBulletPoint";
import styles from "./pricing.module.css";

const SEAT_PRICE = 25;
const RENDER_UNIT_PRICE = 10;

const textUnitWrapper: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

export const CompanyPricing: React.FC = () => {
  const [devSeatCount, setDevSeatCount] = React.useState(1);
  const [cloudUnitCount, setCloudUnitCount] = React.useState(1);

  const formatPrice = useCallback((price: number) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
    return formatter.format(price);
  }, []);

  const totalPrice = useMemo(() => {
    return Math.max(
      100,
      devSeatCount * SEAT_PRICE + cloudUnitCount * RENDER_UNIT_PRICE,
    );
  }, [cloudUnitCount, devSeatCount]);

  const totalPriceString = useMemo(() => {
    return formatPrice(totalPrice);
  }, [formatPrice, totalPrice]);

  const rendersPerMonth = useMemo(() => {
    const formatter = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    });
    return formatter.format(cloudUnitCount * 2000);
  }, [cloudUnitCount]);

  return (
    <div className={styles.pricingcontainer}>
      <div className={styles.audience}>
        For collaborations and companies of 4+ people
      </div>
      <h2 className={styles.pricingtitle}>Company License</h2>
      <PricingBulletPoint text="Everything in Free License" checked />
      <PricingBulletPoint text="Prioritized Support" checked />
      <div style={{ height: 30 }} />
      <div className={styles.rowcontainer}>
        <div style={textUnitWrapper}>
          <div className={styles.boldtext}>Developer Seats</div>
          <div className={styles.description}>
            Number of developers working with Remotion
          </div>
        </div>
        <div style={{ flex: 3 }} />
        <Counter count={devSeatCount} setCount={setDevSeatCount} />
        <div style={{ flex: 1 }} />
        <div className={styles.pricetag}>
          $
          {new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 0,
          }).format(SEAT_PRICE * devSeatCount)}
        </div>
      </div>
      <div style={{ height: 14 }} />
      <div className={styles.rowcontainer}>
        <div style={textUnitWrapper}>
          <div className={styles.boldtext}>Cloud Rendering Units</div>
          <div className={styles.description}>
            Allows for {rendersPerMonth} self-hosted renders per month
          </div>
        </div>
        <div style={{ flex: 3 }} />
        <Counter count={cloudUnitCount} setCount={setCloudUnitCount} />
        <div style={{ flex: 1 }} />
        <div className={styles.pricetag}>
          $
          {new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 0,
          }).format(RENDER_UNIT_PRICE * cloudUnitCount)}
        </div>
      </div>
      <div style={{ height: 20 }} />
      <div
        className={styles.rowContainer}
        style={{ justifyContent: "flex-end" }}
      >
        <div style={{ ...textUnitWrapper, alignItems: "flex-end" }}>
          <div className={styles.pricetag}>{totalPriceString}/mo</div>
          {totalPrice <= 100 ? (
            <div className={styles.descriptionsmall} style={{ height: 24 }}>
              The minimum is $100 per month
            </div>
          ) : (
            <div style={{ height: 24 }} />
          )}
        </div>
      </div>
    </div>
  );
};
