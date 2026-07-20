import {Highlight} from '@remotion/rough-notation';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';

const HEADLINE = {
	baseText:
		'Markets brace for a government shutdown as Congress confronts fresh funding lapses',
	textToHighlight: ['government shutdown', 'funding lapses'],
} as const;

const escapeForRegExp = (text: string) => {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const splitHeadline = ({
	baseText,
	textToHighlight,
}: {
	readonly baseText: string;
	readonly textToHighlight: readonly string[];
}) => {
	const phrases = textToHighlight
		.map((text, highlightIndex) => ({
			highlightIndex,
			text: text.trim(),
		}))
		.filter(({text}) => text.length > 0);

	if (phrases.length === 0) {
		return [{highlightIndex: null, text: baseText}];
	}

	const matcher = new RegExp(
		`(${phrases
			.slice()
			.sort((a, b) => b.text.length - a.text.length)
			.map(({text}) => escapeForRegExp(text))
			.join('|')})`,
		'gi',
	);

	return baseText
		.split(matcher)
		.filter((text) => text.length > 0)
		.map((text) => {
			const phrase = phrases.find(
				(candidate) => candidate.text.toLowerCase() === text.toLowerCase(),
			);

			return {
				highlightIndex: phrase?.highlightIndex ?? null,
				text,
			};
		});
};

const getHighlightProgress = (frame: number, highlightIndex: number) => {
	const start = 31 + highlightIndex * 29;

	return interpolate(frame, [start, start + 24], [0, 1], {
		easing: [
			Easing.spring({
				allowTail: true,
				damping: 200,
				durationRestThreshold: 0.02,
				mass: 1,
				overshootClamping: false,
				stiffness: 100,
			}),
		],
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
};

export const NewsArticleHeadlineHighlight: React.FC = () => {
	const frame = useCurrentFrame();
	const headlineSegments = splitHeadline(HEADLINE);

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#ffffff',
				display: 'flex',
				justifyContent: 'center',
				overflow: 'hidden',
				perspective: 1800,
			}}
		>
			<div
				style={{
					filter: `blur(${interpolate(frame, [0, 30, 125, 149], [16, 0, 0, 8], {
						easing: Easing.bezier(0.16, 1, 0.3, 1),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})}px)`,
					height: 760,
					opacity: interpolate(frame, [125, 149], [1, 0], {
						easing: Easing.in(Easing.cubic),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					scale: interpolate(frame, [0, 149], [1, 1.045], {
						easing: Easing.inOut(Easing.quad),
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					transformOrigin: '50% 50%',
					width: 1420,
					willChange: 'filter, opacity, transform',
				}}
			>
				<div
					style={{
						backfaceVisibility: 'hidden',
						height: '100%',
						rotate: `x ${interpolate(frame, [0, 149], [7.5, -7.5], {
							easing: Easing.inOut(Easing.quad),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}deg`,
						transformStyle: 'preserve-3d',
						width: '100%',
						willChange: 'transform',
					}}
				>
					<div
						style={{
							backfaceVisibility: 'hidden',
							height: '100%',
							rotate: `y ${interpolate(frame, [0, 149], [-7.5, 7.5], {
								easing: Easing.inOut(Easing.quad),
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							})}deg`,
							transformStyle: 'preserve-3d',
							width: '100%',
							willChange: 'transform',
						}}
					>
						<article
							style={{
								backfaceVisibility: 'hidden',
								backgroundColor: '#ffffff',
								border: '1px solid #d9d9d6',
								boxShadow: '0 32px 80px rgba(24, 24, 20, 0.13)',
								boxSizing: 'border-box',
								color: '#181816',
								display: 'flex',
								flexDirection: 'column',
								height: '100%',
								padding: '54px 84px 62px',
								transform: 'translateZ(0)',
								width: '100%',
								willChange: 'transform',
							}}
						>
							<header
								style={{
									alignItems: 'center',
									borderBottom: '2px solid #181816',
									display: 'flex',
									fontFamily: 'Arial, Helvetica, sans-serif',
									justifyContent: 'space-between',
									paddingBottom: 18,
								}}
							>
								<div
									style={{
										fontSize: 18,
										fontWeight: 700,
										letterSpacing: 3.8,
									}}
								>
									THE MORNING REPORT
								</div>
								<div
									style={{
										color: '#696965',
										fontSize: 14,
										fontWeight: 600,
										letterSpacing: 1.7,
										textTransform: 'uppercase',
									}}
								>
									Tuesday · National affairs
								</div>
							</header>

							<div
								style={{
									color: '#a0432d',
									fontFamily: 'Arial, Helvetica, sans-serif',
									fontSize: 15,
									fontWeight: 700,
									letterSpacing: 2.6,
									marginTop: 32,
									textTransform: 'uppercase',
								}}
							>
								Politics
							</div>

							<h1
								style={{
									fontFamily: "Georgia, 'Times New Roman', serif",
									fontSize: 70,
									fontWeight: 700,
									letterSpacing: -2.8,
									lineHeight: 1.04,
									margin: '14px 0 18px',
									overflowWrap: 'break-word',
									textWrap: 'balance',
								}}
							>
								{headlineSegments.map((segment, segmentIndex) => {
									if (segment.highlightIndex === null) {
										return (
											<React.Fragment key={segmentIndex}>
												{segment.text}
											</React.Fragment>
										);
									}

									const words = segment.text.split(/\s+/);
									const phraseProgress = getHighlightProgress(
										frame,
										segment.highlightIndex,
									);

									return (
										<React.Fragment key={segmentIndex}>
											{words.map((word, wordIndex) => {
												const progress = interpolate(
													phraseProgress,
													[
														wordIndex / words.length,
														(wordIndex + 1) / words.length,
													],
													[0, 1],
													{
														extrapolateLeft: 'clamp',
														extrapolateRight: 'clamp',
													},
												);

												return (
													<React.Fragment key={wordIndex}>
														{wordIndex > 0 ? ' ' : null}
														<Highlight
															name={`Highlight ${segment.highlightIndex + 1}, word ${wordIndex + 1}`}
															showInTimeline={false}
															progress={progress}
															bowing={0}
															color="rgba(255, 224, 76, 0.62)"
															maxRandomnessOffset={7}
															padding={{left: 4, right: 4}}
															roughness={2.1}
															seed={segment.highlightIndex * 10 + wordIndex + 1}
														>
															{word}
														</Highlight>
													</React.Fragment>
												);
											})}
										</React.Fragment>
									);
								})}
							</h1>

							<Interactive.P
								name="Summary"
								style={{
									color: '#4c4c48',
									fontFamily: "Georgia, 'Times New Roman', serif",
									fontSize: 25,
									lineHeight: 1.42,
									margin: 0,
									maxWidth: 1080,
								}}
							>
								Negotiators returned to the Capitol with the deadline
								approaching, but leaders remained divided over a short-term
								spending agreement.
							</Interactive.P>

							<div
								style={{
									alignItems: 'center',
									borderTop: '1px solid #d9d9d6',
									color: '#696965',
									display: 'flex',
									fontFamily: 'Arial, Helvetica, sans-serif',
									fontSize: 14,
									fontWeight: 600,
									justifyContent: 'space-between',
									letterSpacing: 1.3,
									marginTop: 'auto',
									paddingTop: 22,
									textTransform: 'uppercase',
								}}
							>
								<Interactive.Span name="Byline">
									By Elena Ward · Washington
								</Interactive.Span>
								<Interactive.Span name="Reading time">
									6 minute read
								</Interactive.Span>
							</div>
						</article>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
