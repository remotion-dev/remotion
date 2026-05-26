import React from 'react';
import {MuxVideo} from './MuxVideo';
import {SectionTitle} from './VideoAppsTitle';

const creatorExamples = [
	{
		title: 'Motion graphics',
		description:
			'Create animated explainers, map flyovers, visual metaphors, and graphics that make a story easier to follow.',
		slug: 'travel-route-on-map-with-3d-landmarks',
		muxPlaybackId: '2E2ksNC9FIgnczmLZZQ4iJjDp760101pcLnyLeNal9MjA',
	},
	{
		title: 'B-roll for stories',
		description:
			'Turn screenshots, headlines, product moments, and references into supporting visuals for your edit.',
		slug: 'news-article-headline-highlight',
		muxPlaybackId: 'Cb4BOLZkhLeNa01on4DH9195qH00CF1h4qQ3qRnyD9XZE',
	},
	{
		title: 'Transparent video overlays',
		description:
			'Render lower-thirds, subscribe animations, and callouts with alpha, then drop them into DaVinci Resolve, Premiere, or Final Cut.',
		slug: 'transparent-call-to-action-overlay',
		muxPlaybackId: '00KwCg00hc01Ugk5UjXD02MuT47EuZSshmbIbRkeNoZyyaM',
	},
];

const icon: React.CSSProperties = {
	height: 16,
	marginLeft: 10,
};

const Arrow: React.FC = () => (
	<svg style={icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M438.6 278.6l-160 160C272.4 444.9 264.2 448 256 448s-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L338.8 288H32C14.33 288 .0016 273.7 .0016 256S14.33 224 32 224h306.8l-105.4-105.4c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160C451.1 245.9 451.1 266.1 438.6 278.6z"
		/>
	</svg>
);

const CreatorExample: React.FC<{
	readonly example: (typeof creatorExamples)[number];
}> = ({example}) => {
	return (
		<a
			href={`/prompts/${example.slug}`}
			className="card p-0 overflow-hidden no-underline hover:no-underline flex flex-col shadow-sm"
		>
			<div className="aspect-video bg-black overflow-hidden">
				<MuxVideo
					muxId={example.muxPlaybackId}
					className="w-full h-full object-cover"
					muted
					autoPlay
					playsInline
					loop
					poster={`https://image.mux.com/${example.muxPlaybackId}/thumbnail.png?time=1`}
				/>
			</div>
			<div className="p-5 flex flex-col flex-1">
				<div className="text-xl font-bold fontbrand text-text">
					{example.title}
				</div>
				<div className="text-muted text-sm fontbrand leading-relaxed mt-2 flex-1">
					{example.description}
				</div>
				<div className="text-brand font-brand font-bold text-sm inline-flex flex-row items-center mt-4">
					See prompt
					<Arrow />
				</div>
			</div>
		</a>
	);
};

export const CreatorShowcase: React.FC = () => {
	return (
		<div>
			<SectionTitle>For video creators</SectionTitle>
			<div className="text-center text-muted fontbrand text-base mt-2 mb-6">
				Prompt production assets, then iterate until they fit your edit.
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{creatorExamples.map((example) => (
					<CreatorExample key={example.slug} example={example} />
				))}
			</div>
			<div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8 font-brand text-sm">
				<a
					href="/prompts"
					className="no-underline text-brand font-bold inline-flex flex-row items-center"
				>
					Browse prompt examples
					<Arrow />
				</a>
				<a
					href="/docs/overlay"
					className="no-underline text-brand font-bold inline-flex flex-row items-center"
				>
					Create transparent overlays
					<Arrow />
				</a>
			</div>
		</div>
	);
};
