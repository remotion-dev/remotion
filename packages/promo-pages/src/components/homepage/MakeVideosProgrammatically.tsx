import React, {useEffect, useState} from 'react';
import {isWebkit} from './IfYouKnowReact';
import {MakeVideosLinks, type MakeVideosLink} from './MakeVideosLinks';

export const MakeVideosProgrammatically: React.FC<{
	readonly title?: React.ReactNode;
	readonly description?: React.ReactNode;
	readonly showLinks?: boolean;
	readonly links?: readonly MakeVideosLink[];
	readonly showVideo?: boolean;
	readonly videoSrc?: string;
	readonly fallbackVideoSrc?: string;
}> = ({
	title = (
		<>
			<span className="text-[var(--subtitle)]">Make videos</span>
			<br /> programmatically
		</>
	),
	description = 'Connect data and manage complexity with code.',
	showLinks = true,
	links = [],
	showVideo = true,
	videoSrc = '/img/what-is-remotion.webm',
	fallbackVideoSrc = '/img/what-is-remotion.mov',
}) => {
	const [src, setSrc] = useState(videoSrc);

	useEffect(() => {
		setSrc(isWebkit() ? fallbackVideoSrc : videoSrc);
	}, [fallbackVideoSrc, videoSrc]);

	return (
		<div className={'flex min-w-0 basis-0 flex-col flex-1'}>
			<div className="flex aspect-square w-full items-start">
				{showVideo ? (
					<video
						src={src}
						muted
						autoPlay
						playsInline
						loop
						preload="metadata"
						className="relative max-h-full max-w-full cursor-default! object-contain lg:mb-0 lg:mt-0"
					/>
				) : null}
			</div>
			<div className="font-brand">
				<h2 className="text-2xl fontbrand leading-[1.1] font-medium">
					{title}
				</h2>
				<p className="leading-relaxed">{description}</p>
				{showLinks ? <MakeVideosLinks links={links} /> : null}
			</div>
		</div>
	);
};
