import React from 'react';

const StepTitle: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<div className="text-left text-xl font-semibold fontbrand">{children}</div>
	);
};

const Subtitle: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<div className="text-left text-base fontbrand text-[var(--subtitle)]">
			{children}
		</div>
	);
};

const Pane: React.FC<{
	readonly children: React.ReactNode;
	readonly className?: string;
}> = ({children, className}) => {
	return (
		<div
			className={`border-effect bg-pane flex-1 flex flex-col ${className || ''}`}
		>
			{children}
		</div>
	);
};

const FeatureCard: React.FC<{
	readonly title: string;
	readonly subtitle: string;
	readonly image: string;
	readonly link: string;
}> = ({title, subtitle, image, link}) => {
	return (
		<a
			href={link}
			className="group lg:border-r-2 border-b lg:border-b-0 border-[var(--border)] cursor-pointer hover:bg-[var(--hover)] transition-colors no-underline text-inherit"
		>
			<div className="relative">
				<img src={image} alt={title} className="w-full h-auto" />
			</div>
			<div className="p-4">
				<div className="flex items-center gap-2">
					<StepTitle>{title}</StepTitle>
					<svg
						width="16"
						viewBox="0 0 448 512"
						fill="currentColor"
						className="opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
					</svg>
				</div>
				<Subtitle>{subtitle}</Subtitle>
				<br />
				<div className="flex-1" />
			</div>
		</a>
	);
};

export const MoreVideoPowerSection: React.FC = () => {
	return (
		<div className="w-full">
			<Pane className="overflow-hidden">
				<div className="grid grid-cols-1 lg:grid-cols-3 h-full">
					<FeatureCard
						title="Media Parser"
						subtitle="A new multimedia library for the web"
						image="/img/media-parser.png"
						link="/media-parser"
					/>
					<FeatureCard
						title="WebCodecs"
						subtitle="Read, process, transform and create videos on the frontend"
						image="/img/webcodecs.png"
						link="/webcodecs"
					/>
					<FeatureCard
						title="Recorder"
						subtitle="Produce engaging screencasts end-to-end in JavaScript"
						image="/img/recorder.png"
						link="/recorder"
					/>
				</div>
			</Pane>
		</div>
	);
};
