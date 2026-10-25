import React from 'react';
import {GetStarted} from './GetStartedStrip';
import type {StudioHandoffTitleState} from './studio-handoff/animation';
import {StudioHandoffTitle} from './StudioHandoffTitle';

export const WriteInReact: React.FC<{
	readonly alignWithDevice: boolean;
	readonly onFrameRef: React.RefObject<
		((state: StudioHandoffTitleState) => void) | null
	> | null;
	readonly sectionLabelsRef: React.RefObject<HTMLDivElement | null> | null;
}> = ({alignWithDevice, onFrameRef, sectionLabelsRef}) => {
	const textAlignment = alignWithDevice ? 'text-left' : 'text-center';
	const textStyle: React.CSSProperties = {
		textShadow: '0 5px 30px var(--background)',
		margin: alignWithDevice ? 0 : undefined,
	};
	const secondaryRowStyle: React.CSSProperties = {
		// Measure spacing from the visible letters rather than their line boxes.
		marginTop: alignWithDevice
			? 'calc(var(--hero-gap) - 7px + var(--hero-title-overhang))'
			: undefined,
	};

	return (
		<div className={alignWithDevice ? 'flex flex-col' : undefined}>
			<h1
				className={`text-4xl sm:text-5xl lg:text-[5em] fontbrand font-black leading-none text-balance ${textAlignment}`}
				style={{
					...textStyle,
					lineHeight: alignWithDevice ? 0.95 : undefined,
					// Align the visible letters with the full-width device frame.
					translate: alignWithDevice
						? 'calc(-1 * var(--hero-optical-inset)) 0'
						: undefined,
				}}
			>
				{onFrameRef ? (
					<StudioHandoffTitle
						onFrameRef={onFrameRef}
						sectionLabelsRef={sectionLabelsRef}
					/>
				) : (
					'Make videos programmatically.'
				)}
			</h1>
			<div
				className={
					alignWithDevice
						? 'flex flex-col lg:flex-row lg:items-end lg:justify-between lg:gap-6'
						: undefined
				}
				style={secondaryRowStyle}
			>
				<p
					style={{
						...textStyle,
						translate: alignWithDevice ? '0 1px' : undefined,
					}}
					className={`font-medium text-lg ${textAlignment} ${alignWithDevice ? 'min-w-0 flex-1' : ''}`}
				>
					Create videos and motion graphics with React.{' '}
					<br className={alignWithDevice ? 'lg:hidden' : undefined} />
					{alignWithDevice ? 'Use agents' : 'Use coding agents'}, render in bulk
					and build apps.
				</p>
				{alignWithDevice ? null : <br />}
				<div
					className={
						alignWithDevice
							? 'hidden min-[900px]:block mt-[calc(var(--hero-gap)-4px)] lg:mt-0 lg:mb-0.5 lg:ml-auto lg:shrink-0'
							: undefined
					}
				>
					<GetStarted
						alignRight={alignWithDevice}
						command={
							alignWithDevice ? 'npx create-video' : 'npx create-video@latest'
						}
					/>
				</div>
			</div>
		</div>
	);
};
