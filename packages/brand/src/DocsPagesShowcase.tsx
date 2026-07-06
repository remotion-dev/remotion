import {paper} from '@remotion/effects/paper';
import React, {useEffect, useMemo, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {
	AbsoluteFill,
	CanvasImage,
	HtmlInCanvas,
	Sequence,
	continueRender,
	delayRender,
	random,
	staticFile,
	useCurrentFrame,
} from 'remotion';
import {z} from 'zod';

type DocsPageScreenshot = {
	relativePath: string;
	route: string;
	title: string;
	url: string;
	screenshot: string;
};

type DocsPagesManifest = {
	version: number;
	createdAt: string;
	sourceBaseUrl: string;
	width: number;
	height: number;
	format: 'jpeg';
	quality: number;
	totalDocumentationSourceFiles: number;
	totalBrowserPages: number;
	capturedBrowserPages?: number;
	pages: DocsPageScreenshot[];
	failed: {
		relativePath: string;
		route: string;
		error: string;
	}[];
};

const MANIFEST_PATH = 'documentation-pages/manifest.json';
export const INSTAGRAM_POST_WIDTH = 1500;
export const INSTAGRAM_POST_HEIGHT = 1290;
const DEFAULT_DURATION = 90;
const SCREENSHOT_SCALE = 1;
const SCREENSHOT_TRANSLATE_X = -380;
const SCREENSHOT_PLATE_SCALE = 0.95;
const EXCLUDED_ROUTES = new Set([
	'/docs/svelte',
	'/docs/null',
	'/docs/clipper',
	'/docs/captions/ensure-max-characters-per-line',
	'/docs/4-0-alpha',
	'/docs/contributing/presentation',
	'/docs/react-18',
	'/docs/tailwind-legacy',
	'/docs/ffmpeg',
	'/docs/media-parser/seeking-hints',
	'/docs/paths/cut-path',
	'/docs/spline',
	'/docs/cli/install',
	'/docs/lambda/sqs',
	'/docs/lambda/feb-2022-outage',
	'/docs/ssr-legacy',
	'/docs/investors',
	'/docs/lambda/feb-2023-incident',
	'/docs/use-img-and-iframe',
	'/docs/freeze',
	'/docs/cors-issues',
	'/docs/ask-in-public',
	'/docs/vue',
]);

export const docsPagesShowcaseSchema = z.object({
	framesPerPage: z.number().int().min(2).max(30),
	maxPages: z.number().int().min(1).nullable(),
	seed: z.string(),
});

export type DocsPagesShowcaseProps = z.infer<typeof docsPagesShowcaseSchema>;

export const docsPagesShowcaseDefaultProps: DocsPagesShowcaseProps = {
	framesPerPage: 4,
	maxPages: null,
	seed: '1000-documentation-pages',
};

const fetchManifest = async (): Promise<DocsPagesManifest> => {
	const response = await fetch(staticFile(MANIFEST_PATH));

	if (!response.ok) {
		throw new Error(`Unable to load ${MANIFEST_PATH}`);
	}

	return response.json() as Promise<DocsPagesManifest>;
};

const getLimitedPages = ({
	manifest,
	maxPages,
}: {
	manifest: DocsPagesManifest;
	maxPages: number | null;
}): DocsPageScreenshot[] => {
	const includedPages = manifest.pages.filter(
		(page) => !EXCLUDED_ROUTES.has(page.route),
	);

	return maxPages === null ? includedPages : includedPages.slice(0, maxPages);
};

const shufflePages = ({
	pages,
	seed,
}: {
	pages: DocsPageScreenshot[];
	seed: string;
}): DocsPageScreenshot[] => {
	const shuffled = pages.slice();

	for (let i = shuffled.length - 1; i > 0; i--) {
		const swapIndex = Math.floor(random(`${seed}-${i}`) * (i + 1));
		const current = shuffled[i];
		shuffled[i] = shuffled[swapIndex];
		shuffled[swapIndex] = current;
	}

	return shuffled;
};

const pageStyle: React.CSSProperties = {
	backgroundColor: '#fff',
	overflow: 'hidden',
};

const plateStyle: React.CSSProperties = {
	backgroundColor: '#fff',
	bottom: -50,
	height: INSTAGRAM_POST_HEIGHT,
	left: '50%',
	overflow: 'hidden',
	position: 'absolute',
	transform: `translateX(-50.7%) translateY(2.2%) scale(${SCREENSHOT_PLATE_SCALE})`,
	transformOrigin: 'bottom center',
	width: INSTAGRAM_POST_WIDTH,
};

const placeholderStyle: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: '#f6f7f9',
	color: '#111827',
	display: 'flex',
	fontFamily: 'Arial, sans-serif',
	fontSize: 54,
	fontWeight: 700,
	justifyContent: 'center',
	lineHeight: 1.1,
	padding: 120,
	textAlign: 'center',
};

export const DocsPagesShowcase: React.FC<DocsPagesShowcaseProps> = ({
	framesPerPage,
	maxPages,
	seed,
}) => {
	const frame = useCurrentFrame();
	const [manifest, setManifest] = useState<DocsPagesManifest | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);

	useEffect(() => {
		const handle = delayRender(
			'Loading documentation page screenshot manifest',
		);
		let active = true;

		fetchManifest()
			.then((fetchedManifest) => {
				if (active) {
					setManifest(fetchedManifest);
				}
			})
			.catch((err) => {
				if (active) {
					setLoadError(err instanceof Error ? err.message : String(err));
				}
			})
			.finally(() => continueRender(handle));

		return () => {
			active = false;
		};
	}, []);

	const pages = useMemo(() => {
		if (!manifest) {
			return [];
		}

		return shufflePages({
			pages: getLimitedPages({manifest, maxPages}),
			seed,
		});
	}, [manifest, maxPages, seed]);

	if (pages.length === 0) {
		return (
			<AbsoluteFill style={placeholderStyle}>
				{loadError ?? 'No documentation page screenshots found'}
			</AbsoluteFill>
		);
	}

	const currentIndex = Math.min(
		Math.floor(frame / framesPerPage),
		pages.length - 1,
	);

	return (
		<AbsoluteFill style={pageStyle}>
			<HtmlInCanvas
				width={INSTAGRAM_POST_WIDTH}
				height={INSTAGRAM_POST_HEIGHT}
				style={pageStyle}
				effects={[
					paper({
						amount: 0.29,
						folds: 0.49,
						colorFront: '#ffffff',
						seed: currentIndex,
					}),
				]}
			>
				<AbsoluteFill style={pageStyle}>
					<Sequence style={plateStyle}>
						<CanvasImage
							src={staticFile(pages[currentIndex].screenshot)}
							style={{
								display: 'block',
								transform: `translateX(${SCREENSHOT_TRANSLATE_X}px) translateY(-75px) scale(${SCREENSHOT_SCALE})`,
								transformOrigin: 'top left',
								scale: 1.04,
								translate: '21.8px -4.9px',
							}}
						/>
					</Sequence>
				</AbsoluteFill>
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};

export const calculateDocsPagesShowcaseMetadata: CalculateMetadataFunction<
	DocsPagesShowcaseProps
> = async ({props}) => {
	try {
		const manifest = await fetchManifest();
		const pageCount = getLimitedPages({
			manifest,
			maxPages: props.maxPages,
		}).length;

		return {
			durationInFrames:
				pageCount === 0 ? DEFAULT_DURATION : pageCount * props.framesPerPage,
			height: INSTAGRAM_POST_HEIGHT,
			width: INSTAGRAM_POST_WIDTH,
		};
	} catch {
		return {
			durationInFrames: DEFAULT_DURATION,
			height: INSTAGRAM_POST_HEIGHT,
			width: INSTAGRAM_POST_WIDTH,
		};
	}
};
