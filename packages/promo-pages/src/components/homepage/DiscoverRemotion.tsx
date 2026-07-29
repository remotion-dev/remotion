import {Button} from '@remotion/design';
import {reduceMatrices, rotateX, rotateY} from '@remotion/svg-3d-engine';
import React, {useEffect, useState} from 'react';
import './DiscoverRemotion.css';
import {SectionTitle} from './VideoAppsTitle';

type Orientation = {
	readonly x: number;
	readonly y: number;
};

type Merit = {
	readonly href: string;
	readonly label: string;
};

type MeritWithPosition = Merit & {
	readonly isLast: boolean;
	readonly rotationX: number;
	readonly rotationY: number;
	readonly mobileRotationX: number;
	readonly mobileRotationY: number;
};

const meritRows: readonly (readonly Merit[])[] = [
	[
		{
			label: '1,000+ pages of docs',
			href: '/docs',
		},
		{
			label: '5M monthly npm downloads',
			href: 'https://www.npmjs.com/package/remotion',
		},
		{
			label: '50,000 GitHub stars',
			href: 'https://github.com/remotion-dev/remotion',
		},
	],
	[
		{
			label: '20+ ready-to-use templates',
			href: '/templates',
		},
		{label: 'Remotion Convert', href: '/convert'},
		{label: 'Editor Starter', href: '/editor-starter'},
		{label: 'Experts for hire', href: '/experts'},
	],
	[
		{label: 'Make videos in React', href: '/docs'},
		{label: 'Server rendering', href: '/docs/ssr'},
		{
			label: 'Browser rendering',
			href: '/docs/client-side-rendering',
		},
		{label: 'Drag & drop effects', href: '/docs/effects'},
		{label: 'Animated captions', href: '/docs/captions'},
	],
	[
		{label: 'Elements library', href: '/elements'},
		{label: 'Sound effects', href: '/docs/sfx'},
		{label: 'Transition library', href: '/docs/transitions'},
		{label: 'AI-native tooling', href: '/docs/ai'},
	],
	[
		{
			label: 'Loved by OpenAI & Anthropic',
			href: '/showcase',
		},
		{
			label: 'Independent team, no VCs',
			href: '/about',
		},
		{
			label: 'Join us on Discord',
			href: 'https://remotion.dev/discord',
		},
	],
];

const positionedRows: readonly (readonly MeritWithPosition[])[] = meritRows.map(
	(row, rowIndex) => {
		return row.map((merit, columnIndex) => {
			const itemIndex =
				meritRows.slice(0, rowIndex).reduce((sum, items) => {
					return sum + items.length;
				}, 0) + columnIndex;
			const x = row.length === 1 ? 0 : columnIndex / (row.length - 1) - 0.5;
			const y = rowIndex / (meritRows.length - 1) - 0.5;
			const mobileRow = Math.floor(itemIndex / 2);
			const mobileRows = Math.ceil(meritRows.flat().length / 2);

			return {
				...merit,
				isLast: itemIndex === meritRows.flat().length - 1,
				rotationX: y * 40,
				rotationY: x * -50,
				mobileRotationX: (mobileRow / Math.max(1, mobileRows - 1) - 0.5) * 26,
				mobileRotationY: (itemIndex % 2 === 0 ? 1 : -1) * 12,
			};
		});
	},
);

const MeritButton: React.FC<{
	readonly initialOrientation: Orientation;
	readonly isMobile: boolean;
	readonly merit: MeritWithPosition;
}> = ({initialOrientation, isMobile, merit}) => {
	const isExternal = merit.href.startsWith('http');

	return (
		<div
			className={
				merit.isLast
					? 'discovery-merit discovery-merit-last'
					: 'discovery-merit'
			}
		>
			<Button
				href={merit.href}
				target={isExternal ? '_blank' : undefined}
				rel={isExternal ? 'noreferrer' : undefined}
				depth={1.5}
				initialTransform={reduceMatrices([
					rotateX(
						((isMobile ? merit.mobileRotationX : merit.rotationX) +
							initialOrientation.x) *
							(Math.PI / 180),
					),
					rotateY(
						((isMobile ? merit.mobileRotationY : merit.rotationY) +
							initialOrientation.y) *
							(Math.PI / 180),
					),
				])}
				className="discovery-merit-button rounded-full"
			>
				{merit.label}
			</Button>
		</div>
	);
};

export const DiscoverRemotion: React.FC<{
	readonly initialOrientation?: Orientation;
}> = ({initialOrientation = {x: -4, y: 6}}) => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia('(max-width: 767px)');
		const updateLayout = () => setIsMobile(mediaQuery.matches);

		updateLayout();
		mediaQuery.addEventListener('change', updateLayout);

		return () => mediaQuery.removeEventListener('change', updateLayout);
	}, []);

	return (
		<section className="discovery-section">
			<SectionTitle>Discover Remotion</SectionTitle>
			<p className="discovery-subtitle">
				The most complete ecosystem for programmatic video creation.
			</p>
			<div className="discovery-perspective">
				<div className="discovery-cluster">
					{positionedRows.map((row, rowIndex) => {
						return (
							<div
								// The rows are structural, so their order is their identity.
								// eslint-disable-next-line react/no-array-index-key
								key={rowIndex}
								className="discovery-row"
							>
								{row.map((merit) => {
									return (
										<MeritButton
											key={`${merit.label}-${isMobile ? 'mobile' : 'desktop'}`}
											initialOrientation={initialOrientation}
											isMobile={isMobile}
											merit={merit}
										/>
									);
								})}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};
