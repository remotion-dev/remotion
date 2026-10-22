'use client';

import React from 'react';
import {SectionTitle} from './homepage/VideoAppsTitle';

const videoSources: Record<string, string> = {
	Video: 'video-playback-2026-09-22.mp4',
	Audio: 'audio-waveform.mp4',
	Captions: 'captions-2026-10-20-7c7e04671491.mp4',
	AI: 'ai-prompt-2026-10-20-77a73116a839.mp4',
	Parameterization: 'parameterization-blue-2026-10-20-6278779b9cd1.mp4',
	Rendering: 'render-modal-codec.mp4',
	Effects: 'effects-2026-10-20-869defbc5f69.mp4',
	Transitions: 'transitions-2026-10-20-b49c7dfb4fe1.mp4',
	'Color Correction': 'color-correction-2026-10-20-b0f28e423a58.mp4',
};

export const ExploreSection: React.FC = () => {
	return (
		<section className="mx-auto max-w-[1000px] px-5 pt-24 pb-24 [&_h2]:mb-0">
			<SectionTitle>Problems we solve</SectionTitle>
			<p className="mx-auto mt-2 mb-10 max-w-[760px] text-center fontbrand text-balance leading-relaxed">
				We explode the world of video creation into pieces and let you assemble
				them.
			</p>
			<div className="grid grid-cols-2 border-t border-l border-[#353b40] min-[700px]:grid-cols-3">
				{[
					'Video',
					'Audio',
					'Captions',
					'AI',
					'Parameterization',
					'Rendering',
					'Effects',
					'Transitions',
					'Elements',
					'Color Correction',
					'Keyframes',
					'Background removal',
					'Fonts',
					'Integrations',
					'Editor Starter',
					'Convert',
				].map((item) => (
					<div
						key={item}
						className="group relative flex aspect-square items-end overflow-hidden border-r border-b border-[#353b40] bg-[#1f2428] p-3 text-white min-[900px]:p-6"
						onPointerEnter={(event) => {
							const video = event.currentTarget.querySelector('video');
							if (video) {
								video.play().catch(() => {});
							}
						}}
						onPointerLeave={(event) => {
							const video = event.currentTarget.querySelector('video');
							if (video) {
								video.pause();
								video.currentTime = 0;
							}
						}}
					>
						{videoSources[item] ? (
							<video
								className="explore-video pointer-events-none absolute inset-0 h-full w-full object-cover"
								muted
								loop
								playsInline
								preload="auto"
								aria-hidden="true"
							>
								<source
									src={`https://remotion.media/explore-remotion/${videoSources[item]}`}
									type="video/mp4"
								/>
							</video>
						) : null}
						<h3
							className="relative z-10 m-0 fontbrand text-lg leading-[1.1] font-medium min-[900px]:text-2xl"
							style={
								videoSources[item]
									? {
											textShadow:
												'0 1px 2px #000, 0 2px 8px #000, 0 0 16px #000',
										}
									: undefined
							}
						>
							{item}
						</h3>
					</div>
				))}
			</div>
		</section>
	);
};
