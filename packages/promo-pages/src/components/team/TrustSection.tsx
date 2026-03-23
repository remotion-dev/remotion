import {Card} from '@remotion/design';
import React from 'react';

const SwissIcon: React.FC = () => {
	return (
		<svg
			viewBox="0 0 512 512"
			style={{
				height: 36,
				overflow: 'visible',
			}}
		>
			<path
				fill="#DA291C"
				className="stroke-black dark:stroke-white"
				strokeWidth={36}
				d="M64 32C28.7 32 0 60.7 0 96l0 320c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zm80 192l80 0 0-80c0-17.7 14.3-32 32-32l0 0c17.7 0 32 14.3 32 32l0 80 80 0c17.7 0 32 14.3 32 32l0 0c0 17.7-14.3 32-32 32l-80 0 0 80c0 17.7-14.3 32-32 32l0 0c-17.7 0-32-14.3-32-32l0-80-80 0c-17.7 0-32-14.3-32-32l0 0c0-17.7 14.3-32 32-32z"
			/>
		</svg>
	);
};

const ProfitableIcon: React.FC = () => {
	return (
		<svg
			viewBox="0 0 512 512"
			style={{
				height: 36,
				overflow: 'visible',
			}}
		>
			<path
				className="fill-brand stroke-black dark:stroke-white"
				strokeWidth={36}
				d="M470.7 9.4c3 3.1 5.3 6.6 6.9 10.3s2.4 7.8 2.4 12.2l0 .1 0 72c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-29.7L330.5 175.8c-6.2 6.3-14.3 9.9-22.8 10.2s-17-2.8-23.5-8.7l-70.2-63.4L73.4 263.4c-9.2 9.6-24.3 9.9-33.9 .7s-9.9-24.3-.7-33.9l160-168c6.2-6.5 14.4-10.1 23-10.3s17 3 23.4 8.9l70.4 63.6L404.7 33.9 375.9 34c-13.3 0-24-10.7-24-24s10.7-24 24-24L448 6c0 0 0 0 0 0c8.3 0 16.4 3.4 22.7 9.4zM40 288c-13.3 0-24 10.7-24 24l0 160c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-160c0-13.3-10.7-24-24-24l-48 0zm120 24l0 160c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-160c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zm144-72l0 232c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-232c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zm144-48l0 280c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-280c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24z"
			/>
		</svg>
	);
};

const KeyIcon: React.FC = () => {
	return (
		<svg
			viewBox="0 0 512 512"
			style={{
				height: 36,
				overflow: 'visible',
			}}
		>
			<path
				className="fill-brand stroke-black dark:stroke-white"
				strokeWidth={36}
				d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17l0 80c0 13.3 10.7 24 24 24l80 0c13.3 0 24-10.7 24-24l0-40 40 0c13.3 0 24-10.7 24-24l0-40 40 0c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zm40-176a40 40 0 1 1 0-80 40 40 0 1 1 0 80z"
			/>
		</svg>
	);
};

const ShieldIcon: React.FC = () => {
	return (
		<svg
			viewBox="0 0 512 512"
			style={{
				height: 36,
				overflow: 'visible',
			}}
		>
			<path
				className="fill-brand stroke-black dark:stroke-white"
				strokeWidth={36}
				d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8l0 378.1C394 378 431.1 230.1 432 141.4L256 66.8z"
			/>
		</svg>
	);
};

const ClockIcon: React.FC = () => {
	return (
		<svg
			viewBox="0 0 512 512"
			style={{
				height: 36,
				overflow: 'visible',
			}}
		>
			<path
				className="fill-brand stroke-black dark:stroke-white"
				strokeWidth={36}
				d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"
			/>
		</svg>
	);
};

const UsersIcon: React.FC = () => {
	return (
		<svg
			viewBox="0 0 640 512"
			style={{
				height: 36,
				overflow: 'visible',
			}}
		>
			<path
				className="fill-brand stroke-black dark:stroke-white"
				strokeWidth={36}
				d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96l-176.7 0C26.8 320 0 293.2 0 260.7l0 0 0 38zm640 0l0-38 0 0C640 293.2 613.2 320 580.7 320l-176.7 0c26.5-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7zM208 224a112 112 0 1 1 224 0 112 112 0 1 1-224 0zm-16 160l256 0 0 0c53 0 96 43 96 96l0 0c0 17.7-14.3 32-32 32L128 512c-17.7 0-32-14.3-32-32l0 0c0-53 43-96 96-96l0 0z"
			/>
		</svg>
	);
};

const CodeIcon: React.FC = () => {
	return (
		<svg
			viewBox="0 0 640 512"
			style={{
				height: 36,
				overflow: 'visible',
			}}
		>
			<path
				className="fill-brand stroke-black dark:stroke-white"
				strokeWidth={36}
				d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"
			/>
		</svg>
	);
};

const VideoIcon: React.FC = () => {
	return (
		<svg
			viewBox="0 0 576 512"
			style={{
				height: 36,
				overflow: 'visible',
			}}
		>
			<path
				className="fill-brand stroke-black dark:stroke-white"
				strokeWidth={36}
				d="M0 128C0 92.7 28.7 64 64 64l256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2l0 256c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 336l0-16 0-128 0-16 14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z"
			/>
		</svg>
	);
};

const StarIcon: React.FC = () => {
	return (
		<svg
			viewBox="0 0 576 512"
			style={{
				height: 36,
				overflow: 'visible',
			}}
		>
			<path
				className="fill-brand stroke-black dark:stroke-white"
				strokeWidth={36}
				d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.6 329l104.2-103.1c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
			/>
		</svg>
	);
};

export const TrustSection: React.FC = () => {
	return (
		<div className="mt-10">
			<div className="inline-flex flex-col lg:flex-row gap-4 flex-wrap">
				<Card className="lg:w-[300px] text-left px-4 py-6 flex-1">
					<SwissIcon />
					<div className="h-4" />
					<div className="font-brand font-bold text-2xl mb-2">
						Swiss quality
					</div>
					<div className="font-brand">
						We are a company based in Zurich, Switzerland. We{"'"}re far away
						from the craziness that is Silicon Valley.
					</div>
				</Card>
				<Card className="lg:w-[300px] text-left px-4 py-6 flex-1">
					<ProfitableIcon />
					<div className="h-4" />
					<div className="font-brand font-bold text-2xl mb-2">
						Sustainable business
					</div>
					<div className="font-brand">
						Remotion is profitable. Aside from our{' '}
						<a
							href="/investors"
							className="text-brand hover:underline underline-offset-4"
						>
							early investors
						</a>
						, we don{"'"}t need outside investment to sustain the business.
					</div>
				</Card>
				<Card className="lg:w-[300px] text-left px-4 py-6 flex-1">
					<KeyIcon />
					<div className="h-4" />
					<div className="font-brand font-bold text-2xl mb-2">
						Founder-owned
					</div>
					<div className="font-brand">
						Us founders own the company. And we just want one thing: Make
						programmatic video glorious.
					</div>
				</Card>
			</div>
			<div className="h-4" />
			<div className="inline-flex flex-col lg:flex-row gap-4 flex-wrap">
				<Card className="lg:w-[300px] text-left px-4 py-6 flex-1">
					<ClockIcon />
					<div className="h-4" />
					<div className="font-brand font-bold text-2xl mb-2">
						5 years and counting
					</div>
					<div className="font-brand">
						Making Remotion since 2021. No plans to change our business model or
						sell the company.
					</div>
				</Card>
				<Card className="lg:w-[300px] text-left px-4 py-6 flex-1">
					<ShieldIcon />
					<div className="h-4" />
					<div className="font-brand font-bold text-2xl mb-2">
						Succession plan
					</div>
					<div className="font-brand">
						If something happens to us, the project will fall under
						<a
							href="https://github.com/wcandillon"
							target="_blank"
							className="text-brand hover:underline underline-offset-4"
						>
							William Candillon
						</a>
						{"'s"} supervision.
					</div>
				</Card>
				<Card className="lg:w-[300px] text-left px-4 py-6 flex-1">
					<UsersIcon />
					<div className="h-4" />
					<div className="font-brand font-bold text-2xl mb-2">
						200+ customers
					</div>
					<div className="font-brand">
						More than 200 companies trust Remotion, from small businesses to
						FAANG.
					</div>
				</Card>
			</div>
			<div className="h-4" />
			<div className="inline-flex flex-col lg:flex-row gap-4 flex-wrap">
				<Card className="lg:w-[300px] text-left px-4 py-6 flex-1">
					<CodeIcon />
					<div className="h-4" />
					<div className="font-brand font-bold text-2xl mb-2">
						Source-available
					</div>
					<div className="font-brand">
						Our code is publicly available on GitHub. You can inspect, fork, and
						self-host it. Full transparency, no black boxes.
					</div>
				</Card>
				<Card className="lg:w-[300px] text-left px-4 py-6 flex-1">
					<VideoIcon />
					<div className="h-4" />
					<div className="font-brand font-bold text-2xl mb-2">
						1M+ videos/month
					</div>
					<div className="font-brand">
						More than one million videos are rendered with Remotion every month.
						Battle-tested at scale.
					</div>
				</Card>
				<Card className="lg:w-[300px] text-left px-4 py-6 flex-1">
					<StarIcon />
					<div className="h-4" />
					<div className="font-brand font-bold text-2xl mb-2">
						40,000+ GitHub stars
					</div>
					<div className="font-brand">
						One of the most popular media projects on GitHub. Trusted by the
						developer community.
					</div>
				</Card>
			</div>
		</div>
	);
};
