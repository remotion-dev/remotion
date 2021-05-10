import React from "react";
import styled from "styled-components";
import { BlueButton, ClearButton } from "./layout/Button";

enum Period {
  Monthly = "monthly",
  Yearly = "yearly",
}
const PeriodSwitcher = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
`;

export const PeriodSelector: React.FC<{
  period: Period;
  setPeriod: (per: Period) => void;
}> = ({ period, setPeriod }) => {
  const MonthlyComponent = period === Period.Monthly ? BlueButton : ClearButton;
  const YearlyComponent = period !== Period.Monthly ? BlueButton : ClearButton;

  return (
    <PeriodSwitcher>
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
    </PeriodSwitcher>
  );
};
