import React, { useState } from "react";
import styled, { css } from "styled-components";
import { BlueButton } from "../layout/Button";
import { mobile } from "../layout/layout";
import { Spacer } from "../layout/Spacer";
import { PeriodSelector } from "../PeriodSelector";
import { Triangle } from "../Triangle";

enum Period {
  Monthly = "monthly",
  Yearly = "yearly",
}

const PricingRow = styled.div`
  display: flex;
  flex-direction: row;
  ${mobile`
		flex-direction: column;
		align-items: center;
	`}
`;

const Panel = styled.div`
  background-color: var(--ifm-background-color);
  box-shadow: var(--box-shadow);
  padding: 10px;
  border-radius: 15px;
  flex: 1;
  text-align: center;
  padding-top: 30px;
  padding-bottom: 10px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  ul {
    text-align: left;
    list-style-type: none;
    padding-left: 0;
  }
  li {
    margin-top: 12px;
    margin-bottom: 12px;
    display: flex;
    color: var(--text-color);
    font-size: 0.95em;
  }
`;

const PerPeriod = styled.div`
  font-weight: 500;
  margin-top: -7px;
  font-size: 0.9em;
`;

const gradient = css`
  -webkit-background-clip: text;
  -moz-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
  text-fill-color: transparent;
`;

const Price = styled.div`
  font-size: 60px;
  font-weight: 700;
  margin-top: -5px;
`;

const FreePrice = styled(Price)`
  background: linear-gradient(to right, #4290f5, #42e9f5);
  ${gradient};
`;

const GradientPrice = styled(Price)`
  background: linear-gradient(to right, #e01d67, #79367a);
  ${gradient};
`;

const OrangePrice = styled(Price)`
  background: linear-gradient(to right, #f5ad43, #fd764a);
  ${gradient};
`;

const Portion = styled.div`
  flex: 1;
  ${mobile`	
	max-width: 500px;
	width: 100%;
	`}
`;

const TargetTitle = styled.div`
  border-bottom: 1px solid var(--text-color);
  font-weight: 600;
  margin-bottom: 20px;
`;

const BulletContainer = styled.div`
  margin-right: 8px;
  display: inline-flex;
  justify-content: center;
  margin-top: 5px;
`;

const Bullet: React.FC<{ color: string }> = ({ color }) => {
  return (
    <BulletContainer>
      <Triangle size={15} opacity={1} color1={color} />
    </BulletContainer>
  );
};

const A = styled.a`
  &:hover {
    text-decoration: none;
  }
  color: inherit;
`;

export const PricingTable: React.FC<{}> = () => {
  const [period, setPeriod] = useState(Period.Monthly);
  return (
    <div>
      <PeriodSelector period={period} setPeriod={setPeriod} />
      <PricingRow>
        <Portion>
          <TargetTitle>Individuals &amp; Small teams</TargetTitle>
          <Panel>
            <strong>Completely</strong>
            <FreePrice>Free</FreePrice>
            <PerPeriod>forever!</PerPeriod>
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
          </Panel>
        </Portion>
        <Spacer />
        <Spacer />
        <Spacer />
        <Portion style={{ flex: 2 }}>
          <TargetTitle>Companies</TargetTitle>
          <PricingRow>
            <Panel>
              <strong>Developer seat</strong>
              <GradientPrice>
                {period === Period.Monthly ? "$15" : "$150"}
              </GradientPrice>
              <PerPeriod>
                per {period === Period.Monthly ? "month" : "year"}
              </PerPeriod>
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
              <A href="https://companies.remotion.dev" target="_blank">
                <div>
                  <BlueButton fullWidth loading={false} size="bg">
                    Buy a license
                  </BlueButton>
                </div>
              </A>
            </Panel>
            <Spacer />
            <Spacer />
            <Spacer />
            <Panel>
              <strong>Cloud rendering seat</strong>
              <OrangePrice>
                {period === Period.Monthly ? "$10" : "$100"}
              </OrangePrice>
              <PerPeriod>
                per {period === Period.Monthly ? "month" : "year"}
              </PerPeriod>
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
              <A href="https://companies.remotion.dev" target="_blank">
                <div>
                  <BlueButton fullWidth loading={false} size="bg">
                    Buy a license
                  </BlueButton>
                </div>
              </A>
            </Panel>
          </PricingRow>
        </Portion>
      </PricingRow>
    </div>
  );
};
