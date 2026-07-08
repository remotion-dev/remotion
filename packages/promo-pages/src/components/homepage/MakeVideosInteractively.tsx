import React, {useRef} from 'react';
import {MakeVideosLinks, type MakeVideosLink} from './MakeVideosLinks';

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
	links = [{label: 'Remotion Studio', href: '/docs/studio'}],
	showVideo = true,
	videoSrc = '/img/editing-vp9-chrome.webm',
	fallbackVideoSrc = '/img/editing-safari.mp4',
}) => {
	const ref = useRef<HTMLDivElement>(null);

	return (
		<div
			ref={ref}
			className={
				'flex min-w-0 basis-0 flex-col justify-start items-start lg:mt-0 flex-1'
			}
		>
			<div className="flex aspect-square w-full items-start">
				{showVideo ? (
					<video
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
					>
						<source src={fallbackVideoSrc} type="video/mp4" />
						<source src={videoSrc} type="video/webm" />
					</video>
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
