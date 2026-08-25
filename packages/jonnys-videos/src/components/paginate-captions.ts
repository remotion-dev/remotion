import type {Caption, TikTokPage, TikTokToken} from '@remotion/captions';
import {createTikTokStyleCaptions} from '@remotion/captions';
import {measureText} from '@remotion/layout-utils';

const SENTENCE_END = /[.!?…]["'”’)\]]*$/u;
const PREFERRED_BREAK = /[,;:—–-]["'”’)\]]*$/u;
const MAX_LAYOUT_PAGE_DURATION_IN_MS = 2500;
const TARGET_WIDTH_PER_TWO_LINE_PAGE = 1.6;
const WORDS_THAT_MAKE_AN_AWKWARD_PAGE_END = new Set([
	'a',
	'an',
	'and',
	'are',
	'as',
	'at',
	'be',
	'been',
	'being',
	'but',
	'by',
	'can',
	'could',
	'did',
	'do',
	'does',
	'for',
	'from',
	'gonna',
	'gotta',
	'had',
	'has',
	'have',
	'he',
	'her',
	'his',
	'i',
	'if',
	'in',
	'is',
	'it',
	'its',
	'may',
	'might',
	'must',
	'my',
	'of',
	'on',
	'or',
	'our',
	'should',
	'she',
	'than',
	'that',
	'the',
	'their',
	'they',
	'to',
	'was',
	'wanna',
	'were',
	'we',
	'will',
	'with',
	'without',
	'would',
	'your',
]);
const WORDS_THAT_MAKE_AN_AWKWARD_PAGE_START = new Set([
	'a',
	'an',
	'and',
	'are',
	'as',
	'at',
	'be',
	'been',
	'being',
	'but',
	'by',
	'can',
	'could',
	'did',
	'do',
	'does',
	'for',
	'from',
	'had',
	'has',
	'have',
	'in',
	'is',
	'may',
	'might',
	'must',
	'of',
	'on',
	'or',
	'should',
	'so',
	'than',
	'that',
	'the',
	'to',
	'was',
	'were',
	'which',
	'who',
	'will',
	'with',
	'without',
	'would',
	'you',
]);
const WORDS_THAT_MAKE_YOU_A_SUBJECT = new Set([
	'are',
	'buy',
	'can',
	'could',
	'did',
	'do',
	'get',
	'had',
	'have',
	'need',
	'pay',
	'should',
	'want',
	'will',
	'would',
]);

export type CaptionPageLayout = {
	fontFamily: string;
	fontSize: number;
	fontWeight: number | string;
	letterSpacing: number;
	maxLineWidth: number;
	maxLines: 2;
	wordGap: number;
};

const normalizeWord = (text: string) =>
	text
		.trim()
		.toLocaleLowerCase()
		.replace(/^["'“‘([{]+|[.,!?…:;—–\-"'”’)\]}]+$/gu, '');

const countAwkwardPageBreaks = (pages: TikTokPage[]) => {
	let awkwardBreaks = 0;

	for (let pageIndex = 0; pageIndex < pages.length - 1; pageIndex++) {
		const lastToken = pages[pageIndex].tokens.at(-1)!;
		const firstTokenOnNextPage = pages[pageIndex + 1].tokens[0];

		if (PREFERRED_BREAK.test(lastToken.text.trim())) {
			continue;
		}

		if (
			WORDS_THAT_MAKE_AN_AWKWARD_PAGE_END.has(normalizeWord(lastToken.text)) ||
			WORDS_THAT_MAKE_AN_AWKWARD_PAGE_START.has(
				normalizeWord(firstTokenOnNextPage.text),
			) ||
			(normalizeWord(lastToken.text) === 'you' &&
				WORDS_THAT_MAKE_YOU_A_SUBJECT.has(
					normalizeWord(firstTokenOnNextPage.text),
				))
		) {
			awkwardBreaks++;
		}
	}

	return awkwardBreaks;
};

const splitIntoSentences = (captions: Caption[]): Caption[][] => {
	const sentences: Caption[][] = [];
	let sentence: Caption[] = [];

	for (const caption of captions) {
		sentence.push(caption);

		if (SENTENCE_END.test(caption.text.trim())) {
			sentences.push(sentence);
			sentence = [];
		}
	}

	if (sentence.length > 0) {
		sentences.push(sentence);
	}

	return sentences;
};

const toToken = (caption: Caption, isFirst: boolean): TikTokToken => ({
	text: isFirst ? caption.text.trimStart() : caption.text,
	fromMs: caption.startMs,
	toMs: caption.endMs,
});

const rebalanceSentence = ({
	captions,
	pageCount,
	layout,
}: {
	captions: Caption[];
	pageCount: number;
	layout: CaptionPageLayout | null;
}): TikTokPage[] => {
	if (layout) {
		const wordWidths = captions.map(
			(caption) =>
				measureText({
					text: caption.text.trim(),
					fontFamily: layout.fontFamily,
					fontSize: layout.fontSize,
					fontWeight: layout.fontWeight,
					letterSpacing: `${layout.letterSpacing}px`,
				}).width,
		);
		const widthPrefixSums = [0];

		for (const width of wordWidths) {
			widthPrefixSums.push(widthPrefixSums[widthPrefixSums.length - 1] + width);
		}

		const getLineWidth = ({
			from,
			to,
			isFirstLine,
		}: {
			from: number;
			to: number;
			isFirstLine: boolean;
		}) => {
			const wordCount = to - from;
			const gaps = isFirstLine ? wordCount - 1 : wordCount;
			return (
				widthPrefixSums[to] -
				widthPrefixSums[from] +
				Math.max(0, gaps) * layout.wordGap
			);
		};

		const sentenceStartMs = captions[0].startMs;
		const sentenceEndMs = captions[captions.length - 1].endMs;
		const targetPageDurationMs = (sentenceEndMs - sentenceStartMs) / pageCount;
		const costs = new Array(pageCount + 1)
			.fill(null)
			.map(() => new Array(captions.length + 1).fill(Number.POSITIVE_INFINITY));
		const previousBreaks = new Array(pageCount + 1)
			.fill(null)
			.map(() => new Array<number | null>(captions.length + 1).fill(null));
		costs[0][0] = 0;

		for (let pagesUsed = 0; pagesUsed < pageCount; pagesUsed++) {
			for (let from = pagesUsed; from < captions.length; from++) {
				if (!Number.isFinite(costs[pagesUsed][from])) {
					continue;
				}

				const pagesRemaining = pageCount - pagesUsed - 1;
				const latestBreak = captions.length - pagesRemaining;

				for (let to = from + 1; to <= latestBreak; to++) {
					const singleLineWidth = getLineWidth({
						from,
						to,
						isFirstLine: true,
					});
					let layoutCost: number;

					if (singleLineWidth <= layout.maxLineWidth) {
						const fill = singleLineWidth / layout.maxLineWidth;
						const shortfall = Math.max(0, 0.58 - fill);
						const overfill = Math.max(0, fill - 0.94);
						layoutCost = shortfall ** 2 * 11 + overfill ** 2 * 4;
					} else {
						let bestTwoLineCost = Number.POSITIVE_INFINITY;

						for (let lineBreak = from + 1; lineBreak < to; lineBreak++) {
							const firstLineWidth = getLineWidth({
								from,
								to: lineBreak,
								isFirstLine: true,
							});
							const secondLineWidth = getLineWidth({
								from: lineBreak,
								to,
								isFirstLine: false,
							});

							if (
								firstLineWidth > layout.maxLineWidth ||
								secondLineWidth > layout.maxLineWidth
							) {
								continue;
							}

							const imbalance =
								Math.abs(firstLineWidth - secondLineWidth) /
								layout.maxLineWidth;
							const shortestLine =
								Math.min(firstLineWidth, secondLineWidth) / layout.maxLineWidth;
							const shortLinePenalty = Math.max(0, 0.4 - shortestLine);
							const twoLineCost =
								imbalance ** 2 * 9 + shortLinePenalty ** 2 * 12;

							bestTwoLineCost = Math.min(bestTwoLineCost, twoLineCost);
						}

						if (!Number.isFinite(bestTwoLineCost)) {
							continue;
						}

						layoutCost = bestTwoLineCost;
					}

					const pageEndMs = captions[to]?.startMs ?? captions[to - 1].endMs;
					const pageDurationMs = pageEndMs - captions[from].startMs;
					const durationDifference =
						(pageDurationMs - targetPageDurationMs) / targetPageDurationMs;
					let breakCost = durationDifference ** 2 * 1.25;

					if (to < captions.length) {
						const wordBeforeBreak = normalizeWord(captions[to - 1].text);
						const wordAfterBreak = normalizeWord(captions[to].text);

						if (WORDS_THAT_MAKE_AN_AWKWARD_PAGE_END.has(wordBeforeBreak)) {
							breakCost += 3.5;
						}

						if (WORDS_THAT_MAKE_AN_AWKWARD_PAGE_START.has(wordAfterBreak)) {
							breakCost += 2;
						}

						if (
							wordBeforeBreak === 'you' &&
							WORDS_THAT_MAKE_YOU_A_SUBJECT.has(wordAfterBreak)
						) {
							breakCost += 3.5;
						}

						if (PREFERRED_BREAK.test(captions[to - 1].text.trim())) {
							breakCost -= 4;
						}
					}

					const cost = costs[pagesUsed][from] + layoutCost + breakCost;

					if (cost < costs[pagesUsed + 1][to]) {
						costs[pagesUsed + 1][to] = cost;
						previousBreaks[pagesUsed + 1][to] = from;
					}
				}
			}
		}

		if (Number.isFinite(costs[pageCount][captions.length])) {
			const breaks = [captions.length];
			let cursor = captions.length;

			for (let pagesUsed = pageCount; pagesUsed > 0; pagesUsed--) {
				const previousBreak = previousBreaks[pagesUsed][cursor];

				if (previousBreak === null) {
					break;
				}

				breaks.push(previousBreak);
				cursor = previousBreak;
			}

			breaks.reverse();

			if (breaks.length === pageCount + 1) {
				return breaks.slice(0, -1).map((from, pageIndex) => {
					const to = breaks[pageIndex + 1];
					const pageCaptions = captions.slice(from, to);
					const tokens = pageCaptions.map((caption, tokenIndex) =>
						toToken(caption, tokenIndex === 0),
					);
					const startMs = pageCaptions[0].startMs;
					const endMs = captions[to]?.startMs ?? pageCaptions.at(-1)!.endMs;

					return {
						text: tokens
							.map((token) => token.text)
							.join('')
							.trimStart(),
						startMs,
						tokens,
						durationMs: endMs - startMs,
					};
				});
			}
		}
	}

	const wordsPerPage = Math.floor(captions.length / pageCount);
	const pagesWithExtraWord = captions.length % pageCount;
	const pages: TikTokPage[] = [];
	let cursor = 0;

	for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
		const wordCount = wordsPerPage + (pageIndex < pagesWithExtraWord ? 1 : 0);
		const pageCaptions = captions.slice(cursor, cursor + wordCount);
		const nextCaption = captions[cursor + wordCount];
		const startMs = pageCaptions[0].startMs;
		const endMs = nextCaption
			? nextCaption.startMs
			: pageCaptions[pageCaptions.length - 1].endMs;
		const tokens = pageCaptions.map((caption, tokenIndex) =>
			toToken(caption, tokenIndex === 0),
		);

		pages.push({
			text: tokens
				.map((token) => token.text)
				.join('')
				.trimStart(),
			startMs,
			tokens,
			durationMs: endMs - startMs,
		});

		cursor += wordCount;
	}

	return pages;
};

/**
 * Never crosses a sentence boundary. When layout information is supplied, the
 * page count is derived from rendered width and a duration ceiling. Dynamic
 * programming then chooses boundaries based on line balance, timing and
 * natural phrase boundaries. Without layout information, the library's
 * time-based cadence is retained.
 */
export const createSentenceAwareCaptionPages = ({
	captions,
	combineTokensWithinMilliseconds,
	layout,
}: {
	captions: Caption[];
	combineTokensWithinMilliseconds: number;
	layout: CaptionPageLayout | null;
}): TikTokPage[] => {
	return splitIntoSentences(captions).flatMap((sentence) => {
		const visibleCaptions = sentence.filter(
			(caption) => caption.text.trim().length > 0,
		);

		if (visibleCaptions.length === 0) {
			return [];
		}

		const pageCount = layout
			? Math.min(
					visibleCaptions.length,
					Math.max(
						1,
						Math.ceil(
							visibleCaptions.reduce(
								(totalWidth, caption, index) =>
									totalWidth +
									measureText({
										text: caption.text.trim(),
										fontFamily: layout.fontFamily,
										fontSize: layout.fontSize,
										fontWeight: layout.fontWeight,
										letterSpacing: `${layout.letterSpacing}px`,
									}).width +
									(index === 0 ? 0 : layout.wordGap),
								0,
							) /
								(layout.maxLineWidth * TARGET_WIDTH_PER_TWO_LINE_PAGE),
						),
						Math.ceil(
							(visibleCaptions.at(-1)!.endMs - visibleCaptions[0].startMs) /
								MAX_LAYOUT_PAGE_DURATION_IN_MS,
						),
					),
				)
			: createTikTokStyleCaptions({
					captions: visibleCaptions,
					combineTokensWithinMilliseconds,
				}).pages.length;

		const pages = rebalanceSentence({
			captions: visibleCaptions,
			pageCount,
			layout,
		});

		if (!layout || pageCount === visibleCaptions.length) {
			return pages;
		}

		const awkwardBreakCount = countAwkwardPageBreaks(pages);

		if (awkwardBreakCount === 0) {
			return pages;
		}

		const pagesWithOneMoreBreak = rebalanceSentence({
			captions: visibleCaptions,
			pageCount: pageCount + 1,
			layout,
		});

		return countAwkwardPageBreaks(pagesWithOneMoreBreak) < awkwardBreakCount
			? pagesWithOneMoreBreak
			: pages;
	});
};
