import React, {useCallback, useMemo} from 'react';
import {cn} from '../../cn';
import {Counter} from './Counter';
import {InfoTooltip} from './InfoTooltip';
import {PricingBulletPoint} from './PricingBulletPoint';

const Container: React.FC<{readonly children: React.ReactNode}> = ({
	children,
}) => {
	return (
		<div className={'flex flex-col border-effect rounded-xl p-5 bg-pane'}>
			{children}
		</div>
	);
};

const Title: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<div className="text-4xl font-bold leading-none fontbrand mt-2 mb-5">
			{children}
		</div>
	);
};

const Audience: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return <div className={'fontbrand text-lg leading-none'}>{children}</div>;
};

const BottomInfo: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	children,
	className,
	...props
}) => {
	return (
		<div
			className={cn(className, 'text-[var(--subtitle)] fontbrand text-sm')}
			{...props}
		>
			{children}
		</div>
	);
};

const PriceTag: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<div
			className={
				'fontbrand text-2xl font-bold min-w-[80px] w-auto text-right shrink-0 ml-4'
			}
		>
			{children}
		</div>
	);
};

const SmallPriceTag: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<div
			className={
				'fontbrand text-2xl font-medium  w-auto min-w-[80px] text-right shrink-0 ml-4'
			}
		>
			{children}
		</div>
	);
};

export const FreePricing: React.FC = () => {
	return (
		<Container>
			<Audience>For individuals and companies of up to 3 people</Audience>
			<Title>Free License</Title>
			<PricingBulletPoint text="Unlimited videos" checked />
			<PricingBulletPoint text="Commercial use allowed" checked />
			<PricingBulletPoint
				text="Cloud rendering allowed (self-hosted)"
				checked
			/>
			<PricingBulletPoint text="Upgrade when your team grows" checked={false} />
		</Container>
	);
};

const textUnitWrapper: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
};

export const EnterpriseLicense: React.FC = () => {
	return (
		<Container>
			<Audience>For advanced needs</Audience>
			<Title>Enterprise License</Title>
			<PricingBulletPoint text="Everything in Company License" checked />
			<PricingBulletPoint text="Custom terms, billing and pricing" checked />
			<PricingBulletPoint text="Compliance forms" checked />
			<PricingBulletPoint text="Prioritized feature requests" checked />
			<PricingBulletPoint text="Private support channel" checked />
			<PricingBulletPoint text="Monthly consulting session" checked />
			<div style={{height: 30}} />
			<div className={'flex flex-row justify-end'}>
				<div
					style={{
						...textUnitWrapper,
						alignItems: 'flex-end',
					}}
				>
					<PriceTag>
						<a
							className={
								'cursor-pointer no-underline text-inherit hover:text-brand'
							}
							target={'_blank'}
							href="https://www.remotion.pro/contact"
						>
							Contact us
						</a>
					</PriceTag>
					<div className={'text-[var(--subtitle)] fontbrand text-sm'}>
						Starting at $500 per month
					</div>
				</div>
			</div>
		</Container>
	);
};

const SEAT_PRICE = 25;
const RENDER_UNIT_PRICE = 10;

export const CompanyPricing: React.FC = () => {
	const [devSeatCount, setDevSeatCount] = React.useState(1);
	const [cloudUnitCount, setCloudUnitCount] = React.useState(1);

	const formatPrice = useCallback((price: number) => {
		const formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
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
		const formatter = new Intl.NumberFormat('en-US', {
			maximumFractionDigits: 0,
		});
		return formatter.format(cloudUnitCount * 2000);
	}, [cloudUnitCount]);

	return (
		<Container>
			<Audience>For collaborations and companies of 4+ people</Audience>
			<Title>Company License</Title>
			<PricingBulletPoint text="Everything in Free License" checked />
			<PricingBulletPoint text="Prioritized Support" checked />
			<PricingBulletPoint text="Remotion Recorder included" checked />
			<PricingBulletPoint text="$250 Mux credits" checked>
				<InfoTooltip text="Credits for Mux.com. Applies only to new Mux customers." />
			</PricingBulletPoint>
			<div style={{height: 30}} />
			<div className={'flex flex-row items-center'}>
				<div style={textUnitWrapper}>
					<div className={'fontbrand font-bold text-lg'}>Developer Seats</div>
					<div className={'text-muted fontbrand text-sm'}>
						Number of developers working with Remotion
					</div>
				</div>
				<div style={{flex: 3}} />
				<Counter count={devSeatCount} setCount={setDevSeatCount} minCount={1} />
				<SmallPriceTag>
					$
					{new Intl.NumberFormat('en-US', {
						maximumFractionDigits: 0,
					}).format(SEAT_PRICE * devSeatCount)}
				</SmallPriceTag>
			</div>
			<div style={{height: 14}} />
			<div className={'flex flex-row items-center'}>
				<div style={textUnitWrapper}>
					<div className={'fontbrand font-bold text-lg'}>
						Cloud Rendering Units
					</div>
					<div className={'text-muted fontbrand text-sm'}>
						Allows for {rendersPerMonth} self-hosted renders per month
					</div>
				</div>
				<div style={{flex: 3}} />
				<Counter
					count={cloudUnitCount}
					setCount={setCloudUnitCount}
					minCount={0}
				/>
				<SmallPriceTag>
					$
					{new Intl.NumberFormat('en-US', {
						maximumFractionDigits: 0,
					}).format(RENDER_UNIT_PRICE * cloudUnitCount)}
				</SmallPriceTag>
			</div>
			<div style={{height: 20}} />
			<div className={'flex flex-row justify-end'}>
				<div style={{...textUnitWrapper, alignItems: 'flex-end'}}>
					<PriceTag>{totalPriceString}/mo</PriceTag>
					<BottomInfo
						data-visible={totalPrice <= 100}
						className="opacity-0 data-[visible=true]:opacity-100 transition-opacity"
					>
						The minimum is $100 per month
					</BottomInfo>
				</div>
			</div>
		</Container>
	);
};
