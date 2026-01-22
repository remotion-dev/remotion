/**
 * @remotion/mixpeek
 *
 * Integrate Mixpeek multimodal AI with Remotion for intelligent video
 * search, indexing, captioning, and media retrieval.
 *
 * @example
 * ```tsx
 * import {Mixpeek} from 'mixpeek';
 * import {
 *   mixpeekToCaptions,
 *   useMixpeekData,
 *   searchVideoContent,
 *   indexVideo,
 * } from '@remotion/mixpeek';
 *
 * // Convert Mixpeek analysis to captions
 * const {captions} = mixpeekToCaptions({analysis: myAnalysis});
 *
 * // Use Mixpeek data in your composition
 * const {currentText, currentScene} = useMixpeekData(analysis);
 *
 * // Search video content
 * const results = await searchVideoContent(client, {query: 'demo'});
 *
 * // Index a new video
 * const job = await indexVideo(client, {videoUrl: '...'});
 * ```
 */

// Types
export type {
  	MixpeekConfig,
  	MixpeekVideoSegment,
  	MixpeekEntity,
  	MixpeekVideoAnalysis,
  	MixpeekSearchResult,
  	MixpeekToCaptionsOptions,
  	MixpeekSearchOptions,
  	MixpeekIndexOptions,
  	MixpeekIndexResult,
  	MixpeekFrameData,
} from './types';

// Caption conversion
export {
  	mixpeekToCaptions,
  	extractTranscript,
  	extractScenes,
} from './mixpeek-to-captions';

export type {
  	MixpeekToCaptionsInput,
  	MixpeekToCaptionsOutput,
} from './mixpeek-to-captions';

// React hooks
export {
  	useMixpeekData,
  	useSegmentProgress,
  	useIsSegmentActive,
  	useCurrentEntities,
  	useSearchSegments,
} from './use-mixpeek-data';

// Search utilities
export {
	searchVideoContent,
  	findBestTimestamp,
  	searchByEntity,
  	findSimilarSegments,
} from './search';

// Indexing utilities
export {
  	indexVideo,
  	getIndexingStatus,
  	waitForIndexing,
  	indexVideoBatch,
} from './index-video';
