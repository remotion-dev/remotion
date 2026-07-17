import React from 'react';
import {SectionTitle} from './VideoAppsTitle';

type PipelineIllustrationKind = 'studio' | 'props' | 'preview' | 'render';

const appPipeline: Array<{
	step: string;
	title: string;
	description: React.ReactNode;
	link: string;
	buttonText: string;
	illustration: PipelineIllustrationKind;
}> = [
	{
		step: '01',
		title: 'Design a template',
		description:
			'Start in Remotion Studio and build a reusable composition for your video workflow.',
		link: '/docs/studio',
		buttonText: 'Remotion Studio',
		illustration: 'studio',
	},
	{
		step: '02',
		title: 'Build an app around it',
		description:
			'Expose props for text, images, colors, timing, and layouts to power editors, generators, and automations.',
		link: '/docs/parameterized-rendering',
		buttonText: 'Parameterized rendering',
		illustration: 'preview',
	},
	{
		step: '03',
		title: 'Preview and render',
		description: (
			<>
				Use the{' '}
				<a href="/player" className="font-semibold text-text no-underline">
					Player
				</a>{' '}
				for interactive previews, then render locally, on servers, serverlessly,
				or in-browser.
			</>
		),
		link: '/docs/render',
		buttonText: 'Rendering options',
		illustration: 'render',
	},
];

const launchOptions = [
	{
		title: 'Build a motion design system',
		description:
			'Collect logos, lower thirds, and other animated brand assets in Remotion Studio, then host and export them.',
		link: '/docs/design-systems',
		buttonText: 'Motion design systems',
	},
	{
		title: 'Start from a template',
		description:
			'Use starter projects for SaaS workflows, social videos, slideshows, captions, and repeatable video products.',
		link: '/templates',
		buttonText: 'Browse templates',
	},
	{
		title: 'Build a video editor',
		description:
			'Editor Starter is an official paid template for a timeline, canvas, asset uploads, and rendering.',
		link: '/docs/editor-starter',
		buttonText: 'Editor Starter',
	},
	{
		title: 'See what teams ship',
		description:
			'Audiograms, captioning tools, year-in-review generators, creative editors, and other products built with Remotion.',
		link: '/showcase',
		buttonText: 'Showcase',
	},
];

const icon: React.CSSProperties = {
	height: 16,
	marginLeft: 10,
};

const Arrow: React.FC = () => (
	<svg style={icon} viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M438.6 278.6l-160 160C272.4 444.9 264.2 448 256 448s-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L338.8 288H32C14.33 288 .0016 273.7 .0016 256S14.33 224 32 224h306.8l-105.4-105.4c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160C451.1 245.9 451.1 266.1 438.6 278.6z"
		/>
	</svg>
);

const InlineLink: React.FC<{
	readonly href: string;
	readonly children: React.ReactNode;
}> = ({href, children}) => {
	return (
		<a
			href={href}
			className="mt-3 inline-flex flex-row items-center font-brand text-base font-semibold text-text no-underline sm:text-sm"
		>
			{children}
			<Arrow />
		</a>
	);
};

const illustrationFrame =
	'relative mb-5 flex h-40 w-full items-center justify-center px-3';

const StudioIllustration: React.FC = () => {
	return (
		<div className={illustrationFrame} aria-hidden="true">
			<div className="relative w-full max-w-[220px] rounded-md bg-pane px-4 py-6 fontbrand">
				<div className="absolute bottom-5 left-1/2 top-3 flex -translate-x-1/2 flex-col items-center">
					<div className="h-2 w-1 rounded-full bg-brand" />
					<div className="w-px flex-1 bg-brand/50" />
				</div>
				<div className="space-y-4">
					<div className="grid grid-cols-[28px_1fr] items-center gap-3">
						<div className="h-2 rounded-full bg-muted" />
						<div className="h-3 rounded-full bg-brand" />
					</div>
					<div className="grid grid-cols-[28px_1fr] items-center gap-3">
						<div className="h-2 rounded-full bg-muted" />
						<div className="ml-8 h-3 rounded-full bg-muted" />
					</div>
					<div className="grid grid-cols-[28px_1fr] items-center gap-3">
						<div className="h-2 rounded-full bg-muted" />
						<div className="mr-10 h-3 rounded-full bg-muted" />
					</div>
				</div>
			</div>
		</div>
	);
};

const PropsIllustration: React.FC = () => {
	return (
		<div className={illustrationFrame} aria-hidden="true">
			<div className="flex h-[124px] w-full max-w-[240px] flex-col justify-center whitespace-nowrap rounded-md bg-pane p-4 text-left font-mono text-base leading-6 text-text sm:text-sm sm:leading-5">
				<div className="text-brand">&#123;</div>
				<div className="pl-4">title: &apos;Sale&apos;,</div>
				<div className="pl-4">color: &apos;#0B84F3&apos;,</div>
				<div className="pl-4">items: 42</div>
				<div className="text-brand">&#125;</div>
			</div>
		</div>
	);
};

const PreviewIllustration: React.FC = () => {
	return (
		<div className={illustrationFrame} aria-hidden="true">
			<div className="w-full max-w-[240px] rounded-md border border-solid border-muted bg-card-bg p-2 fontbrand">
				<div className="relative flex h-[92px] items-center justify-center rounded-sm border border-solid border-muted bg-pane text-brand">
					<svg
						className="h-14 w-14 text-brand"
						viewBox="-11.5 -10.23174 23 20.46348"
						fill="none"
					>
						<circle cx="0" cy="0" r="2.05" fill="currentColor" />
						<ellipse
							cx="0"
							cy="0"
							rx="11"
							ry="4.2"
							stroke="currentColor"
							strokeWidth="1"
						/>
						<ellipse
							cx="0"
							cy="0"
							rx="11"
							ry="4.2"
							stroke="currentColor"
							strokeWidth="1"
							transform="rotate(60)"
						/>
						<ellipse
							cx="0"
							cy="0"
							rx="11"
							ry="4.2"
							stroke="currentColor"
							strokeWidth="1"
							transform="rotate(120)"
						/>
					</svg>
				</div>
				<div className="mt-2 flex items-center gap-2">
					<div className="fontbrand text-xs font-semibold text-text">0:12</div>
					<div className="h-1.5 flex-1 rounded-full bg-muted">
						<div className="h-full w-2/5 rounded-full bg-brand" />
					</div>
					<div className="fontbrand text-xs font-semibold text-text">0:30</div>
				</div>
			</div>
		</div>
	);
};

const RenderIllustration: React.FC = () => {
	return (
		<div className={illustrationFrame} aria-hidden="true">
			<div className="grid w-full max-w-[240px] grid-cols-2 gap-2 fontbrand text-base font-semibold">
				{['.mp4', '.webm', '.gif', '.png'].map((format) => (
					<div
						key={format}
						className="rounded-md bg-pane px-4 py-3 text-center text-brand"
					>
						{format}
					</div>
				))}
			</div>
		</div>
	);
};

const PipelineIllustration: React.FC<{
	readonly kind: PipelineIllustrationKind;
}> = ({kind}) => {
	if (kind === 'studio') {
		return <StudioIllustration />;
	}

	if (kind === 'props') {
		return <PropsIllustration />;
	}

	if (kind === 'preview') {
		return <PreviewIllustration />;
	}

	return <RenderIllustration />;
};

const AutomationsSection: React.FC = () => {
	return (
		<div>
			<SectionTitle>Create video apps and automations</SectionTitle>
			<div className="mx-auto mb-8 mt-3 max-w-[70ch] text-center fontbrand text-base leading-relaxed text-muted text-pretty">
				Design a reusable video template in Remotion, expose props for app UIs
				and automations, then preview and render it wherever your workflow runs.
			</div>

			<div className="py-4">
				<dl className="grid grid-cols-1 justify-items-stretch gap-5 lg:grid-cols-3 lg:justify-items-center lg:gap-0">
					{appPipeline.map((item) => (
						<div
							key={item.step}
							className="flex w-full flex-col rounded-lg border border-solid border-text/10 bg-card-bg px-4 py-5 text-left sm:px-5 lg:max-w-[300px] lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:bg-transparent lg:px-6 lg:py-0 lg:first:border-l-0"
						>
							<PipelineIllustration kind={item.illustration} />
							<div className="mb-2 flex items-center gap-2.5">
								<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pane fontbrand text-xs font-semibold text-brand">
									{item.step}
								</div>
								<dt className="fontbrand text-xl font-semibold tracking-tight text-text text-balance">
									{item.title}
								</dt>
							</div>
							<dd className="m-0 mt-1 flex-1 fontbrand text-base leading-relaxed text-muted text-pretty sm:text-sm">
								{item.description}
							</dd>
							<InlineLink href={item.link}>{item.buttonText}</InlineLink>
						</div>
					))}
				</dl>
			</div>

			<div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 fontbrand text-base text-muted sm:text-sm">
				<span>Explore:</span>
				{launchOptions.map((item) => (
					<a
						key={item.link}
						href={item.link}
						className="font-semibold text-text no-underline"
						title={item.description}
					>
						{item.buttonText}
					</a>
				))}
			</div>
		</div>
	);
};

export default AutomationsSection;
