import React from 'react';
import {MakeVideosLinks} from './MakeVideosLinks';
import {useTransparentVideoSource} from './use-transparent-video-source';

const EvaluateRemotionSection: React.FC = () => {
	const licenseVideoSrc = useTransparentVideoSource({
		fallbackVideoSrc: '/img/license-questions.mp4',
		videoSrc: '/img/license-questions.webm',
	});
	const expertsVideoSrc = useTransparentVideoSource({
		fallbackVideoSrc: '/img/experts-graphic.mp4',
		videoSrc: '/img/experts-graphic.webm',
	});

	return (
		<>
			<div className="flex min-w-0 basis-0 flex-1 flex-col">
				<div className="flex aspect-square w-full items-start">
					{licenseVideoSrc ? (
						<video
							src={licenseVideoSrc}
							muted
							autoPlay
							playsInline
							loop
							preload="metadata"
							className="relative max-h-full max-w-full cursor-default! object-contain"
						/>
					) : null}
				</div>
				<div className="font-brand">
					<h2 className="text-2xl fontbrand leading-[1.1] font-medium">
						License questions?
					</h2>
					<p className="text-balance leading-relaxed">
						Book a 20 minute evaluation call or write us an email.
					</p>
					<MakeVideosLinks
						links={[
							{
								label: 'Schedule a call',
								href: 'https://cal.com/remotion/evaluate',
								target: '_blank',
							},
							{
								label: 'Write an email',
								href: 'mailto:hi@remotion.dev',
								target: '_blank',
							},
						]}
					/>
				</div>
			</div>
			<div className="flex min-w-0 basis-0 flex-1 flex-col">
				<div className="flex aspect-square w-full items-center justify-center pl-5">
					{expertsVideoSrc ? (
						<video
							src={expertsVideoSrc}
							muted
							autoPlay
							playsInline
							loop
							preload="metadata"
							className="relative max-h-full max-w-full cursor-default! object-contain"
						/>
					) : null}
				</div>
				<div className="font-brand">
					<h2 className="text-2xl fontbrand leading-[1.1] font-medium">
						Get help from humans
					</h2>
					<p className="text-balance leading-relaxed">
						Chat with us and our community or contact our experts for paid work.
					</p>
					<MakeVideosLinks
						links={[
							{
								label: 'Discord',
								href: 'https://remotion.dev/discord',
								target: '_blank',
							},
							{label: 'Experts', href: '/experts'},
						]}
					/>
				</div>
			</div>
		</>
	);
};

export default EvaluateRemotionSection;
