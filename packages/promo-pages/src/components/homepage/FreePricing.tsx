import {Switch} from '@remotion/design';
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

const icon: React.CSSProperties = {
	height: 16,
	marginLeft: 4,
};

const PricingSlider: React.FC<{
	readonly value: number;
	readonly onChange: (value: number) => void;
	readonly min: number;
	readonly max: number;
	readonly step?: number;
}> = ({value, onChange, min, max, step = 1}) => {
	const percentage = ((value - min) / (max - min)) * 100;

	return (
		<>
			<style>
				{`
					.pricing-slider {
						-webkit-appearance: none;
						appearance: none;
						height: 12px;
						border-radius: 8px;
						border: 2px solid black;
						cursor: pointer;
					}
					.pricing-slider::-webkit-slider-thumb {
						-webkit-appearance: none;
						appearance: none;
						width: 24px;
						height: 24px;
						border-radius: 50%;
						background: var(--background);
						border: 2px solid black;
						border-bottom-width: 4px;
						cursor: pointer;
						scale: 1.2;
					}
					.pricing-slider::-moz-range-thumb {
						width: 24px;
						height: 24px;
						border-radius: 50%;
						background: var(--background);
						border: 2px solid black;
						border-bottom-width: 4px;
						scale: 1.2;
						cursor: pointer;
					}
				`}
			</style>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				className="pricing-slider flex-1"
				style={{
					background: `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${percentage}%, var(--background) ${percentage}%, var(--background) 100%)`,
				}}
			/>
		</>
	);
};

const textUnitWrapper: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
};

export const FreePricing: React.FC = () => {
	return (
		<Container>
			<Audience>For individuals and companies of up to 3 people</Audience>
			<Title>Free License</Title>
			<PricingBulletPoint text="Create and automate" checked />
			<PricingBulletPoint text="Commercial use allowed" checked />
			<PricingBulletPoint text="Unlimited use" checked />
			<PricingBulletPoint
				text="Must upgrade when your team grows"
				checked={false}
			/>
			<div className={'flex flex-row justify-end mt-4'}>
				<div
					style={{
						...textUnitWrapper,
						alignItems: 'flex-end',
					}}
				>
					<a
						target="_blank"
						href="https://www.remotion.dev/docs"
						className="font-brand text-brand flex flex-row items-center gap-1 no-underline"
					>
						No sign up needed - get started{' '}
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

const SectionCheckbox: React.FC<{
	readonly checked: boolean;
	readonly onChange: (checked: boolean) => void;
	readonly title: string;
	readonly subtitle: React.ReactNode;
	readonly children?: React.ReactNode;
}> = ({checked, onChange, title, subtitle, children}) => {
	return (
		<div className="flex flex-row gap-3 cursor-pointer select-none items-center">
			<Switch active={checked} onToggle={() => onChange(!checked)} />
			<div className="flex flex-col">
				<div className="fontbrand font-bold text-lg flex flex-row items-center gap-1">
					{title}
					{children}
				</div>
				<div className="text-muted fontbrand text-sm">{subtitle}</div>
			</div>
			<div className="flex-1" />
			<div
				className={cn(
					'fontbrand text-muted transition-opacity duration-150',
					checked ? 'hidden' : 'opacity-100',
				)}
			>
				Not selected
			</div>
		</div>
	);
};

export const CompanyPricing: React.FC = () => {
	const [creatorsSelected, setCreatorsSelected] = React.useState(true);
	const [automatorsSelected, setAutomatorsSelected] = React.useState(false);
	const [devSeatCount, setDevSeatCount] = React.useState(3);
	const [cloudRenders, setCloudRenders] = React.useState(10000);

	const formatPrice = useCallback((price: number) => {
		const formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0,
		});
		return formatter.format(price);
	}, []);

	const creatorsPrice = creatorsSelected ? devSeatCount * SEAT_PRICE : 0;
	const automatorsPrice = automatorsSelected
		? Math.ceil(cloudRenders / 1000) * RENDER_UNIT_PRICE
		: 0;

	const totalPrice = useMemo(() => {
		const basePrice = creatorsPrice + automatorsPrice;
		// Minimum only applies if automation is selected
		if (automatorsSelected) {
			return Math.max(100, basePrice);
		}

		return basePrice;
	}, [creatorsPrice, automatorsPrice, automatorsSelected]);

	const totalPriceString = useMemo(() => {
		return formatPrice(totalPrice);
	}, [formatPrice, totalPrice]);

	const showMinimumMessage =
		automatorsSelected && creatorsPrice + automatorsPrice < 100;

	return (
		<Container>
			<Audience>For collaborations and companies of 4+ people</Audience>
			<Title>Company License</Title>
			<PricingBulletPoint text="Create and automate" checked />
			<PricingBulletPoint text="Commercial use allowed" checked />
			<PricingBulletPoint text="Pay according to usage" checked />
			<PricingBulletPoint text="Prioritized Support" checked />
			<PricingBulletPoint text="$250 Mux credits" checked>
				<InfoTooltip>
					Credits for Mux.com.
					<br /> Applies only to new Mux customers.
				</InfoTooltip>
			</PricingBulletPoint>
			<div style={{height: 30}} />

			{/* Remotion for Creators Section */}
			<SectionCheckbox
				checked={creatorsSelected}
				onChange={setCreatorsSelected}
				title="Remotion for Creators"
				subtitle="Create videos for yourself - $25/mo per seat"
			>
				<InfoTooltip>
					Intended for low volume video creations through coding and prompting,
					and building motion design systems. Get 1 seat per user.
				</InfoTooltip>
			</SectionCheckbox>
			<div
				className={cn(
					'grid ease-out',
					creatorsSelected
						? 'grid-rows-[1fr] opacity-100'
						: 'grid-rows-[0fr] opacity-0',
				)}
				style={{
					transition: creatorsSelected
						? 'grid-template-rows 150ms ease-out, opacity 150ms ease-out 75ms'
						: 'opacity 150ms ease-out, grid-template-rows 150ms ease-out 75ms',
				}}
			>
				<div className="overflow-hidden py-3">
					<div className="flex flex-row items-center gap-4 w-full">
						<div className="flex flex-row items-center gap-4 w-4/7 py-3 lg:w-5/7">
							<PricingSlider
								value={devSeatCount}
								onChange={setDevSeatCount}
								min={1}
								max={50}
							/>
						</div>
						<div className="flex flex-col items-end shrink-0 gap-2 w-3/7 lg:flex-row lg:justify-end lg:w-2/7">
							<div className="fontbrand text-right w-full">
								{devSeatCount} {devSeatCount === 1 ? 'Seat' : 'Seats'}
							</div>

							<div className="fontbrand font-bold text-right w-full">
								{`$${new Intl.NumberFormat('en-US', {
									maximumFractionDigits: 0,
								}).format(SEAT_PRICE * devSeatCount)}`}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="h-6" />

			{/* Remotion for Automators Section */}
			<SectionCheckbox
				checked={automatorsSelected}
				onChange={setAutomatorsSelected}
				title="Remotion for Automators"
				subtitle="Build video creation tools - $0.01 per render, $100/mo minimum"
			>
				<InfoTooltip>
					Intended for companies launching SaaS applications, such as video
					editors and prompt-to-video apps, and automated high-volume video
					creation.
					<br />A $100/mo minimum spend applies.
				</InfoTooltip>
			</SectionCheckbox>
			<div
				className={cn(
					'grid ease-out',
					automatorsSelected
						? 'grid-rows-[1fr] opacity-100'
						: 'grid-rows-[0fr] opacity-0',
				)}
				style={{
					transition: automatorsSelected
						? 'grid-template-rows 150ms ease-out, opacity 150ms ease-out 75ms'
						: 'opacity 150ms ease-out, grid-template-rows 150ms ease-out 75ms',
				}}
			>
				<div className="overflow-hidden py-3">
					<div className="flex flex-row items-center gap-4 w-full">
						<div className="flex flex-row items-center gap-4 w-4/7 py-3 lg:w-5/7">
							<PricingSlider
								value={cloudRenders}
								onChange={setCloudRenders}
								min={1000}
								max={100000}
								step={1000}
							/>
						</div>
						<div className="flex flex-col items-end shrink-0 gap-2 w-3/7 lg:flex-row lg:justify-end lg:w-2/7">
							<div className="fontbrand text-right w-full">
								{new Intl.NumberFormat('en-US').format(cloudRenders)} Renders
							</div>
							<div className="fontbrand font-bold text-right w-full">
								{`$${new Intl.NumberFormat('en-US', {
									maximumFractionDigits: 0,
								}).format(Math.ceil(cloudRenders / 1000) * RENDER_UNIT_PRICE)}`}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div style={{height: 14}} />
			<div className={'flex flex-row justify-end'}>
				<div style={{...textUnitWrapper, alignItems: 'flex-end'}}>
					<PriceTag>{totalPriceString}/mo</PriceTag>
					<BottomInfo
						data-visible={showMinimumMessage}
						className="opacity-0 data-[visible=true]:opacity-100 transition-opacity"
					>
						The minimum is $100 per month for Remotion for Automators
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
