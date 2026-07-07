import React, {useEffect, useRef} from 'react';
import {MakeVideosLinks, type MakeVideosLink} from './MakeVideosLinks';

export const MakeVideosAgentically: React.FC<{
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
			<br /> agentically
		</>
	),
	description = 'Turn your idea into a video using your coding agent.',
	showLinks = true,
	links = [
		{label: 'Agent Skills', href: '/docs/ai/skills'},
		{label: 'Prompts', href: '/prompts'},
	],
	showVideo = true,
	videoSrc = '/img/render-progress.webm',
	fallbackVideoSrc = '/img/render-progress.mp4',
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		const callback = (data: IntersectionObserverEntry[]) => {
			if (data[0].isIntersecting) {
				videoRef.current?.play();
			}
		};

		const observer = new IntersectionObserver(callback, {
			root: null,
			threshold: 0.5,
		});
		observer.observe(current);

		return () => observer.unobserve(current);
	}, []);

	return (
		<div ref={ref} className={'flex min-w-0 basis-0 flex-col flex-1'}>
			<div className="flex aspect-square w-full items-start">
				{showVideo ? (
					<video
						ref={videoRef}
						muted
						autoPlay
						playsInline
						loop
						preload="metadata"
						style={{
							width: 400,
							maxWidth: '100%',
							maxHeight: '100%',
							borderRadius: 7,
							overflow: 'hidden',
						}}
						className="cursor-default! relative object-contain"
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
