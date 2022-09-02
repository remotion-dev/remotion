import React from "react";
import { BlueButton, ClearButton } from "./layout/Button";

enum Period {
  Monthly = "monthly",
  Yearly = "yearly",
}

export const PeriodSelector: React.FC<{
  period: Period;
  setPeriod: (per: Period) => void;
}> = ({ period, setPeriod }) => {
  const MonthlyComponent = period === Period.Monthly ? BlueButton : ClearButton;
  const YearlyComponent = period === Period.Monthly ? ClearButton : BlueButton;

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}
    >
      <MonthlyComponent
        loading={false}
        size="sm"
        fullWidth={false}
        onClick={() => setPeriod(Period.Monthly)}
      >
        Monthly
      </MonthlyComponent>
      <YearlyComponent
        loading={false}
        size="sm"
        fullWidth={false}
        onClick={() => setPeriod(Period.Yearly)}
      >
        Yearly
      </YearlyComponent>
    </div>
  );
};
