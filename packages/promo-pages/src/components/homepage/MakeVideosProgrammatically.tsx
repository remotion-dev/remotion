import React from 'react';
import {MakeVideosLinks, type MakeVideosLink} from './MakeVideosLinks';

export const MakeVideosProgrammatically: React.FC<{
	readonly title?: React.ReactNode;
	readonly description?: React.ReactNode;
	readonly showLinks?: boolean;
	readonly links?: readonly MakeVideosLink[];
	readonly showVideo?: boolean;
}> = ({
	title = (
		<>
			<span className="text-gray-500">Make videos</span>
			<br /> programmatically
		</>
	),
	description = 'Connect data, and manage complexity with code.',
	showLinks = true,
	links = [],
	showVideo = true,
}) => {
	// eslint-disable-next-line no-warning-comments
	// TODO: Add an opaque fallback for browsers that do not support transparent WebM.
	const videoSrc = '/img/what-is-remotion.webm';

	return (
		<div className={'flex min-w-0 basis-0 flex-col flex-1'}>
			<div className="flex aspect-video w-full items-start">
				{showVideo ? (
					<video
						src={videoSrc}
						muted
						autoPlay
						playsInline
						loop
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
