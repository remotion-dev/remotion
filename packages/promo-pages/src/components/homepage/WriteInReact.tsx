import React from 'react';
import {GetStarted} from './GetStartedStrip';
import type {StudioHandoffTitleState} from './studio-handoff/animation';
import {StudioHandoffTitle} from './StudioHandoffTitle';

export const WriteInReact: React.FC<{
	readonly onFrameRef: React.RefObject<
		((state: StudioHandoffTitleState) => void) | null
	>;
	readonly sectionLabelsRef: React.RefObject<HTMLDivElement | null>;
}> = ({onFrameRef, sectionLabelsRef}) => {
	const textStyle: React.CSSProperties = {
		textShadow: '0 5px 30px var(--background)',
		margin: 0,
	};

	return (
		<div className="flex flex-col">
			<h1
				className="text-4xl sm:text-5xl lg:text-[5em] fontbrand font-black leading-none text-balance text-left"
				style={{
					...textStyle,
					lineHeight: 0.95,
					// Align the visible letters with the full-width device frame.
					translate: 'calc(-1 * var(--hero-optical-inset)) 0',
				}}
			>
				<StudioHandoffTitle
					onFrameRef={onFrameRef}
					sectionLabelsRef={sectionLabelsRef}
				/>
			</h1>
			<div
				className="flex flex-col lg:flex-row lg:items-end lg:justify-between lg:gap-6"
				style={{
					// Measure spacing from the visible letters rather than their line boxes.
					marginTop: 'calc(var(--hero-gap) - 7px + var(--hero-title-overhang))',
				}}
			>
				<p
					style={{...textStyle, translate: '0 1px'}}
					className="font-medium text-lg text-left min-w-0 flex-1"
				>
					Create videos and motion graphics with React.{' '}
					<br className="lg:hidden" />
					Use agents, render in bulk and build apps.
				</p>
				<div className="hidden min-[900px]:block mt-[calc(var(--hero-gap)-4px)] lg:mt-0 lg:mb-0.5 lg:ml-auto lg:shrink-0">
					<GetStarted command="npx create-video" />
				</div>
			</div>
		</div>
	);
};
