'use client';

import React from 'react';
import {SectionTitle} from './homepage/VideoAppsTitle';

export const ExploreSection: React.FC = () => {
	return (
		<section className="mx-auto max-w-[1000px] px-5 pt-24 pb-24">
			<SectionTitle>Explore Remotion</SectionTitle>
			<p className="mx-auto mt-3 mb-10 max-w-[760px] text-center fontbrand text-balance leading-relaxed">
				Our mission is to explode the world of video creation into pieces and
				let you assemble them.
			</p>
			<div className="grid grid-cols-3 border-t border-l border-[#353b40]">
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
						{item === 'Rendering' || item === 'Audio' ? (
							<video
								className="explore-video pointer-events-none absolute inset-0 h-full w-full object-cover"
								muted
								loop
								playsInline
								preload="auto"
								aria-hidden="true"
							>
								<source
									src={`/img/explore-remotion-${item === 'Rendering' ? 'render-modal-codec' : 'audio-waveform'}.mp4`}
									type="video/mp4"
								/>
								<source
									src={`/img/explore-remotion-${item === 'Rendering' ? 'render-modal-codec' : 'audio-waveform'}.webm`}
									type="video/webm"
								/>
							</video>
						) : null}
						<h3
							className="relative z-10 m-0 fontbrand text-lg leading-[1.1] font-medium min-[900px]:text-2xl"
							style={
								item === 'Rendering' || item === 'Audio'
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
