import {Counter} from '@remotion/design';
import React, {useCallback, useMemo} from 'react';
import {cn} from '../../cn';
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
	readonly children: string;
}> = ({children}) => {
	const shrink = children.length > 6;
	return (
		<div
			className={cn(
				'fontbrand text-2xl font-medium w-auto min-w-[100px] text-right shrink-0',
				shrink ? 'text-lg' : 'text-2xl',
			)}
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
			<PricingBulletPoint text="Self-hosted cloud rendering allowed" checked />
			<PricingBulletPoint
				text="Must upgrade when your team grows"
				checked={false}
			/>
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
			<PricingBulletPoint text="Private Slack or Discord" checked />
			<PricingBulletPoint text="Monthly consulting session" checked />
			<PricingBulletPoint text="Custom terms, billing and pricing" checked />
			<PricingBulletPoint text="Compliance forms" checked />
			<PricingBulletPoint text="Prioritized feature requests" checked />
			<PricingBulletPoint
				text={
					<span>
						<a
							href="https://www.remotion.dev/editor-starter"
							className="underline underline-offset-4 text-inherit"
						>
							Editor Starter
						</a>{' '}
						included
					</span>
				}
				checked
			/>
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

const icon: React.CSSProperties = {
	height: 16,
	marginLeft: 4,
};

export const CompanyPricing: React.FC = () => {
	const [devSeatCount, setDevSeatCount] = React.useState(1);
	const [cloudRenders, setCloudRenders] = React.useState(1000);

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
			devSeatCount * SEAT_PRICE +
				Math.ceil(cloudRenders / 1000) * RENDER_UNIT_PRICE,
		);
	}, [cloudRenders, devSeatCount]);

	const totalPriceString = useMemo(() => {
		return formatPrice(totalPrice);
	}, [formatPrice, totalPrice]);

	return (
		<Container>
			<Audience>For collaborations and companies of 4+ people</Audience>
			<Title>Company License</Title>
			<PricingBulletPoint text="Commercial use allowed" checked />
			<PricingBulletPoint text="Self-hosted cloud rendering allowed" checked />
			<PricingBulletPoint text="Prioritized Support" checked />
			<PricingBulletPoint text="$250 Mux credits" checked>
				<InfoTooltip text="Credits for Mux.com. Applies only to new Mux customers." />
			</PricingBulletPoint>
			<div style={{height: 30}} />
			<div className={'flex flex-col md:flex-row md:items-center'}>
				<div style={textUnitWrapper}>
					<div className={'fontbrand font-bold text-lg'}>Developer Seats</div>
					<div className={'text-muted fontbrand text-sm'}>
						Number of developers working with Remotion
					</div>
				</div>
				<div style={{flex: 3}} className="hidden md:block" />
				<div className="flex flex-row items-center justify-between mt-3 md:mt-0">
					<Counter
						count={devSeatCount}
						setCount={setDevSeatCount}
						minCount={1}
						incrementStep={1}
						step={1}
					/>
					<SmallPriceTag>
						{`$${new Intl.NumberFormat('en-US', {
							maximumFractionDigits: 0,
						}).format(SEAT_PRICE * devSeatCount)}`}
					</SmallPriceTag>
				</div>
			</div>
			<div style={{height: 14}} />
			<div className={'flex flex-col md:flex-row md:items-center'}>
				<div style={textUnitWrapper}>
					<div className={'fontbrand font-bold text-lg'}>Video renders</div>
					<div className={'text-muted fontbrand text-sm'}>
						<a
							href="https://www.remotion.dev/docs/render"
							className="underline underline-offset-4 text-inherit"
						>
							Renders per month (self-hosted)
						</a>
					</div>
				</div>
				<div style={{flex: 3}} className="hidden md:block" />
				<div className="flex flex-row items-center justify-between mt-3 md:mt-0">
					<Counter
						count={cloudRenders}
						setCount={setCloudRenders}
						minCount={0}
						step={1}
						incrementStep={1000}
					/>
					<SmallPriceTag>
						{`$${new Intl.NumberFormat('en-US', {
							maximumFractionDigits: 0,
						}).format(Math.ceil(cloudRenders / 1000) * RENDER_UNIT_PRICE)}`}
					</SmallPriceTag>
				</div>
			</div>
			<div style={{height: 14}} />
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
			<div className={'flex flex-row justify-end mt-4'}>
				<div
					style={{
						...textUnitWrapper,
						alignItems: 'flex-end',
					}}
				>
					<a
						href="https://remotion.pro/dashboard"
						className="font-brand text-brand flex flex-row items-center gap-1 no-underline"
					>
						Buy now{' '}
						<svg
							style={icon}
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 448 512"
						>
							<path
								fill="currentColor"
								d="M438.6 278.6l-160 160C272.4 444.9 264.2 448 256 448s-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L338.8 288H32C14.33 288 .0016 273.7 .0016 256S14.33 224 32 224h306.8l-105.4-105.4c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160C451.1 245.9 451.1 266.1 438.6 278.6z"
							/>
						</svg>
					</a>
				</div>
			</div>
		</Container>
	);
};
