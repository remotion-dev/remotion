import {Button, Card} from '@remotion/design';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {CardLikeButton} from './CardLikeButton';
import {REMOTION_PRO_ORIGIN} from './config';
import {Page} from './Page';
import {getAuthorName, getAvatarUrl} from './prompt-helpers';
import type {Submission} from './prompt-types';

const SubmissionCard: React.FC<{readonly submission: Submission}> = ({
	submission,
}) => {
	const [hovered, setHovered] = useState(false);
	const [inView, setInView] = useState(false);
	const cardRef = useRef<HTMLAnchorElement>(null);
	const avatarUrl = getAvatarUrl(submission);

	useEffect(() => {
		const el = cardRef.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				setInView(entry.isIntersecting);
			},
			{rootMargin: '-30% 0px -30% 0px'},
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const isTouchDevice =
		typeof window !== 'undefined' &&
		window.matchMedia('(hover: none)').matches;
	const showGif = hovered || (isTouchDevice && inView);

	return (
		<a
			ref={cardRef}
			href={`/prompts/show?prompt=${submission.slug}`}
			className="block no-underline hover:no-underline"
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<Card className="overflow-hidden hover:shadow-md transition-shadow">
				<div className="w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
					<img
						src={
							showGif
								? `https://image.mux.com/${submission.muxPlaybackId}/animated.gif?height=225&fit_mode=smartcrop`
								: `https://image.mux.com/${submission.muxPlaybackId}/thumbnail.png?width=400&height=225&fit_mode=smartcrop`
						}
						className={showGif ? 'h-full' : 'w-full h-full object-cover'}
						alt={submission.title}
					/>
				</div>
				<div className="p-4">
					<h3 className="font-brand font-bold text-lg truncate">
						{submission.title}
					</h3>
					<div className="flex items-center justify-between mt-1">
						<div className="flex items-center gap-2">
							{avatarUrl && (
								<img
									src={avatarUrl}
									width={20}
									height={20}
									className="rounded-full"
									alt={`${getAuthorName(submission)}'s avatar`}
								/>
							)}
							<span className="text-sm font-brand text-text">
								{getAuthorName(submission)}
							</span>
						</div>
						<CardLikeButton
							submissionId={submission.id}
							initialLikeCount={submission.likeCount}
						/>
					</div>
				</div>
			</Card>
		</a>
	);
};

export const PromptsGalleryPage: React.FC = () => {
	const [submissions, setSubmissions] = useState<Submission[]>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchPage = useCallback(async (cursor?: string) => {
		setLoading(true);
		try {
			const url = cursor
				? `${REMOTION_PRO_ORIGIN}/api/prompts?cursor=${cursor}`
				: `${REMOTION_PRO_ORIGIN}/api/prompts`;
			const res = await fetch(url);
			if (!res.ok) {
				throw new Error(
					`Failed to fetch prompts: ${res.status} ${res.statusText}`,
				);
			}

			const data = await res.json();
			setSubmissions((prev) =>
				cursor ? [...prev, ...data.items] : data.items,
			);
			setNextCursor(data.nextCursor);
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchPage();
	}, [fetchPage]);

	return (
		<Page className="flex-col">
			<div className="m-auto max-w-[1200px] w-full px-4 py-12">
				<div className="mb-8">
					<h1 className="text-3xl font-brand font-black">
						Create a video with just a prompt
					</h1>
					<p className="font-brand text-muted-foreground mt-4 max-w-[700px]">
						With{' '}
						<a
							href="/docs/ai/skills"
							className="underline hover:text-text underline-offset-4"
						>
							Remotion Skills
						</a>
						, you can create videos simply by giving a prompt to your coding
						agent, whether it&apos;s Claude Code, Codex, or OpenCode. Browse the
						gallery for inspiration!
					</p>
				</div>
				<div className="flex items-center gap-2">
					<a
						href="/docs/ai/claude-code"
						className="flex items-center no-underline hover:no-underline"
					>
						<Button className="font-brand rounded-full bg-[#D97757] flex items-center text-white">
							<svg
								width="20"
								height="20"
								viewBox="0 0 149 149"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								style={{marginRight: 8}}
							>
								<path
									d="M29.05 98.54L58.19 82.19L58.68 80.77L58.19 79.98H56.77L51.9 79.68L35.25 79.23L20.81 78.63L6.82 77.88L3.3 77.13L0 72.78L0.340004 70.61L3.3 68.62L7.54 68.99L16.91 69.63L30.97 70.6L41.17 71.2L56.28 72.77H58.68L59.02 71.8L58.2 71.2L57.56 70.6L43.01 60.74L27.26 50.32L19.01 44.32L14.55 41.28L12.3 38.43L11.33 32.21L15.38 27.75L20.82 28.12L22.21 28.49L27.72 32.73L39.49 41.84L54.86 53.16L57.11 55.03L58.01 54.39L58.12 53.94L57.11 52.25L48.75 37.14L39.83 21.77L35.86 15.4L34.81 11.58C34.44 10.01 34.17 8.69 34.17 7.08L38.78 0.820007L41.33 0L47.48 0.820007L50.07 3.07001L53.89 11.81L60.08 25.57L69.68 44.28L72.49 49.83L73.99 54.97L74.55 56.54H75.52V55.64L76.31 45.1L77.77 32.16L79.19 15.51L79.68 10.82L82 5.2L86.61 2.16L90.21 3.88L93.17 8.12L92.76 10.86L91 22.3L87.55 40.22L85.3 52.22H86.61L88.11 50.72L94.18 42.66L104.38 29.91L108.88 24.85L114.13 19.26L117.5 16.6H123.87L128.56 23.57L126.46 30.77L119.9 39.09L114.46 46.14L106.66 56.64L101.79 65.04L102.24 65.71L103.4 65.6L121.02 61.85L130.54 60.13L141.9 58.18L147.04 60.58L147.6 63.02L145.58 68.01L133.43 71.01L119.18 73.86L97.96 78.88L97.7 79.07L98 79.44L107.56 80.34L111.65 80.56H121.66L140.3 81.95L145.17 85.17L148.09 89.11L147.6 92.11L140.1 95.93L129.98 93.53L106.36 87.91L98.26 85.89H97.14V86.56L103.89 93.16L116.26 104.33L131.75 118.73L132.54 122.29L130.55 125.1L128.45 124.8L114.84 114.56L109.59 109.95L97.7 99.94H96.91V100.99L99.65 105L114.12 126.75L114.87 133.42L113.82 135.59L110.07 136.9L105.95 136.15L97.48 124.26L88.74 110.87L81.69 98.87L80.83 99.36L76.67 144.17L74.72 146.46L70.22 148.18L66.47 145.33L64.48 140.72L66.47 131.61L68.87 119.72L70.82 110.27L72.58 98.53L73.63 94.63L73.56 94.37L72.7 94.48L63.85 106.63L50.39 124.82L39.74 136.22L37.19 137.23L32.77 134.94L33.18 130.85L35.65 127.21L50.39 108.46L59.28 96.84L65.02 90.13L64.98 89.16H64.64L25.49 114.58L18.52 115.48L15.52 112.67L15.89 108.06L17.31 106.56L29.08 98.46L29.04 98.5L29.05 98.54Z"
									fill="#fff"
								/>
							</svg>
							<div className="text-sm">Create your own video</div>
						</Button>
					</a>
					<a href="/prompts/submit" className="no-underline hover:no-underline">
						<Button className="font-brand rounded-full text-sm">
							Submit a prompt
						</Button>
					</a>
				</div>

				<div className="h-12" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{submissions.map((s) => (
						<SubmissionCard key={s.id} submission={s} />
					))}
				</div>

				{loading && <div className="text-center text-muted-foreground mt-8" />}

				{nextCursor && !loading && (
					<div className="text-center mt-8">
						<Button onClick={() => fetchPage(nextCursor)}>Load more</Button>
					</div>
				)}
			</div>
		</Page>
	);
};
