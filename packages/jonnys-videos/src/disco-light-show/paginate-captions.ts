import type {Caption, TikTokPage, TikTokToken} from '@remotion/captions';
import {createTikTokStyleCaptions} from '@remotion/captions';

const SENTENCE_END = /[.!?…]["'”’)\]]*$/u;

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
}: {
	captions: Caption[];
	pageCount: number;
}): TikTokPage[] => {
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
 * Keeps the library's time-based page cadence, but never crosses a sentence
 * boundary. Once a sentence is complete, its words are spread evenly across
 * the number of pages the default paginator would have produced.
 */
export const createSentenceAwareCaptionPages = ({
	captions,
	combineTokensWithinMilliseconds,
}: {
	captions: Caption[];
	combineTokensWithinMilliseconds: number;
}): TikTokPage[] => {
	return splitIntoSentences(captions).flatMap((sentence) => {
		const visibleCaptions = sentence.filter(
			(caption) => caption.text.trim().length > 0,
		);

		if (visibleCaptions.length === 0) {
			return [];
		}

		const defaultPageCount = createTikTokStyleCaptions({
			captions: visibleCaptions,
			combineTokensWithinMilliseconds,
		}).pages.length;

		return rebalanceSentence({
			captions: visibleCaptions,
			pageCount: defaultPageCount,
		});
	});
};
