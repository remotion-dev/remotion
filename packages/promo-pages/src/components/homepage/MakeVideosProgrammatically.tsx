import React from 'react';
import {MakeVideosLinks, type MakeVideosLink} from './MakeVideosLinks';
import {useTransparentVideoSource} from './use-transparent-video-source';

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
			<span className="min-[900px]:text-[var(--subtitle)]">Make videos</span>{' '}
			<br className="hidden min-[900px]:block" />
			programmatically
		</>
	),
	description = 'Connect data and manage complexity with code.',
	showLinks = true,
	links = [],
	showVideo = true,
	videoSrc = '/img/what-is-remotion.webm',
	fallbackVideoSrc = '/img/what-is-remotion.mp4',
}) => {
	const src = useTransparentVideoSource({fallbackVideoSrc, videoSrc});

	return (
		<div className={'flex min-w-0 basis-0 flex-col flex-1'}>
			{showVideo ? (
				<div className="flex aspect-square w-full items-start">
					{src ? (
						<video
							src={src}
							muted
							autoPlay
							playsInline
							loop
							preload="metadata"
							className="relative max-h-full max-w-full cursor-default! object-contain min-[900px]:mb-0 min-[900px]:mt-0"
						/>
					) : null}
				</div>
			) : null}
			<div className="font-brand">
				<h2 className="text-2xl fontbrand leading-[1.1] font-medium max-[900px]:mb-2">
					{title}
				</h2>
				<p className="text-balance leading-relaxed max-[900px]:mb-0">{description}</p>
				{showLinks ? <MakeVideosLinks links={links} /> : null}
			</div>
		</div>
	);
};
