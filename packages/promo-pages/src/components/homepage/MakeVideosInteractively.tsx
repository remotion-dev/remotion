import React, {useRef} from 'react';
import {MakeVideosLinks, type MakeVideosLink} from './MakeVideosLinks';
import {useTransparentVideoSource} from './use-transparent-video-source';

export const MakeVideosInteractively: React.FC<{
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
			<br /> interactively
		</>
	),
	description = 'Edit and animate using drag and drop and save back to code.',
	showLinks = true,
	links = [
		{label: 'Studio', href: '/docs/studio'},
		{label: 'Elements', href: '/elements'},
	],
	showVideo = true,
	videoSrc = '/img/editing-vp9-chrome.webm',
	fallbackVideoSrc = '/img/editing-safari.mp4',
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const src = useTransparentVideoSource({fallbackVideoSrc, videoSrc});

	return (
		<div
			ref={ref}
			className={
				'flex min-w-0 basis-0 flex-col justify-start items-start lg:mt-0 flex-1'
			}
		>
			<div className="flex aspect-square w-full items-start">
				{showVideo && src ? (
					<video
						src={src}
						autoPlay
						muted
						playsInline
						loop
						preload="metadata"
						style={{
							width: 500,
							maxWidth: '100%',
							maxHeight: '100%',
							borderRadius: 7,
							overflow: 'hidden',
						}}
						className="object-contain"
					/>
				) : null}
			</div>
			<div className="font-brand">
				<h2 className="text-2xl fontbrand leading-[1.1] font-medium">
					{title}
				</h2>
				<p className="text-balance leading-relaxed">{description}</p>
				{showLinks ? <MakeVideosLinks links={links} /> : null}
			</div>
		</div>
	);
};
