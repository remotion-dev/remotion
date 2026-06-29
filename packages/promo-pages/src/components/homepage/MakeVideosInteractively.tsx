import React, {useRef} from 'react';
import {MakeVideosLinks, type MakeVideosLink} from './MakeVideosLinks';

export const MakeVideosInteractively: React.FC<{
	readonly title?: React.ReactNode;
	readonly description?: React.ReactNode;
	readonly showLinks?: boolean;
	readonly links?: readonly MakeVideosLink[];
	readonly showVideo?: boolean;
}> = ({
	title = (
		<>
			<span className="text-gray-500">Make videos</span>
			<br /> interactively
		</>
	),
	description = 'Edit and animate using drag and drop and save back to code.',
	showLinks = true,
	links = [{label: 'Remotion Studio', href: '/docs/studio'}],
	showVideo = true,
}) => {
	const ref = useRef<HTMLDivElement>(null);
	// eslint-disable-next-line no-warning-comments
	// TODO: Add an opaque fallback for browsers that do not support transparent WebM.
	const videoSrc = '/img/editing-vp9-chrome.webm';

	return (
		<div
			ref={ref}
			className={
				'flex min-w-0 basis-0 flex-col justify-start items-start lg:mt-0 flex-1'
			}
		>
			<div className="flex aspect-video w-full items-start">
				{showVideo ? (
					<video
						src={videoSrc}
						autoPlay
						muted
						playsInline
						loop
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
				<p className="leading-relaxed">{description}</p>
				{showLinks ? <MakeVideosLinks links={links} /> : null}
			</div>
		</div>
	);
};
