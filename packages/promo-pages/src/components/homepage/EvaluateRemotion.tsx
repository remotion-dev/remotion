import React, {useEffect, useState} from 'react';
import {experts} from '../experts';
import {MakeVideosLinks} from './MakeVideosLinks';
import {useTransparentVideoSource} from './use-transparent-video-source';

const EvaluateRemotionSection: React.FC = () => {
	const [dailyAvatars, setDailyAvatars] = useState<string[]>([]);
	const licenseVideoSrc = useTransparentVideoSource({
		fallbackVideoSrc: '/img/license-questions.mp4',
		videoSrc: '/img/license-questions.webm',
	});

	useEffect(() => {
		const avatars = experts.map((expert) => expert.image);

		const selectedAvatars: string[] = [];
		for (let i = 0; i < 3; i++) {
			const index = Math.floor(Math.random() * avatars.length);
			selectedAvatars.push(avatars[index]);
			avatars.splice(index, 1); // Remove selected avatar to avoid duplicates
		}

		setDailyAvatars(selectedAvatars);
	}, []);

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
					{dailyAvatars.map((avatar) => (
						<div
							key={avatar}
							className="border-effect bg-muted -ml-5 h-24 w-24 rounded-full bg-cover bg-center"
							style={{backgroundImage: `url(${avatar})`}}
						/>
					))}
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
							{label: 'Remotion Experts', href: '/experts'},
						]}
					/>
				</div>
			</div>
		</>
	);
};

export default EvaluateRemotionSection;
