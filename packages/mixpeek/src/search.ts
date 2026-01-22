/**
 * Search utilities for finding video segments using Mixpeek
 */

import type {Mixpeek} from 'mixpeek';
import type {
  	MixpeekSearchOptions,
  	MixpeekSearchResult,
  	MixpeekVideoSegment,
} from './types';

/**
 * Execute a semantic search across indexed video content using Mixpeek.
 */
export const searchVideoContent = async (
  	client: Mixpeek,
  	options: MixpeekSearchOptions
  ): Promise<MixpeekSearchResult[]> => {
  	const {query, collectionId, limit = 10, minScore, timeRange, filters} = options;

  	const searchRequest: Record<string, unknown> = {
      		query,
      		limit,
    };

  	if (collectionId) {
      		searchRequest.collectionId = collectionId;
    }

  	if (filters) {
      		searchRequest.filters = filters;
    }

  	const response = await client.request({
      		method: 'POST',
      		url: '/v1/search',
      		data: searchRequest,
    });

  	const results: MixpeekSearchResult[] = [];

  	if (response.data?.results) {
      		for (const item of response.data.results) {
            			const score = item.score ?? item._score ?? 1;

      			if (minScore !== undefined && score < minScore) {
              				continue;
            }

      			const segment: MixpeekVideoSegment = {
              				startTime: item.start_time ?? item.startTime ?? 0,
              				endTime: item.end_time ?? item.endTime ?? 0,
              				text: item.text ?? item.transcription,
              				sceneDescription: item.description ?? item.scene_description,
              				ocrText: item.ocr_text,
              				thumbnailUrl: item.thumbnail_url,
              				detectedObjects: item.objects ?? item.detectedObjects,
              				confidence: item.confidence,
              				multimodalEmbedding: item.multimodal_extractor_v1_multimodal_embedding,
              				transcriptionEmbedding: item.multimodal_extractor_v1_transcription_embedding,
              				metadata: item.metadata,
            };

      			if (timeRange) {
              				if (timeRange.start !== undefined && segment.endTime < timeRange.start) {
                        					continue;
                      }
              				if (timeRange.end !== undefined && segment.startTime > timeRange.end) {
                        					continue;
                      }
            }

      			results.push({
              				id: item.id ?? item._id ?? `result-${results.length}`,
              				score,
              				segment,
              				source: {
                        					id: item.source_id ?? item.document_id ?? '',
                        					url: item.source_video_url ?? item.source_url ?? item.url,
                        					title: item.title ?? item.name,
                      },
              				highlights: item.highlights ?? item._highlights,
            });
          }
    }

  	results.sort((a, b) => b.score - a.score);

  	return results;
};

/**
 * Find the best timestamp to start playing a video based on a search query.
 */
export const findBestTimestamp = async (
  	client: Mixpeek,
  	options: Omit<MixpeekSearchOptions, 'limit'>
  ): Promise<number | null> => {
  	const results = await searchVideoContent(client, {
      		...options,
      		limit: 1,
    });

  	if (results.length === 0) {
      		return null;
    }

  	return results[0].segment.startTime;
};

/**
 * Search for segments containing specific entities.
 */
export const searchByEntity = async (
  	client: Mixpeek,
  	options: {
      		entityType: string;
      		entityLabel?: string;
      		collectionId?: string;
      		limit?: number;
    }
  ): Promise<MixpeekSearchResult[]> => {
  	const {entityType, entityLabel, collectionId, limit = 10} = options;

  	let query = `entity:${entityType}`;
  	if (entityLabel) {
      		query += ` "${entityLabel}"`;
    }

  	return searchVideoContent(client, {
      		query,
      		collectionId,
      		limit,
      		filters: {
            			entityType,
            			...(entityLabel && {entityLabel}),
          },
    });
};

/**
 * Find similar segments using embedding similarity.
 */
export const findSimilarSegments = async (
  	client: Mixpeek,
  	referenceSegment: MixpeekVideoSegment,
  	options: {
      		collectionId?: string;
      		limit?: number;
      		excludeSourceId?: string;
      		useTranscriptionEmbedding?: boolean;
    } = {}
  ): Promise<MixpeekSearchResult[]> => {
  	const {collectionId, limit = 10, excludeSourceId, useTranscriptionEmbedding} = options;

  	const embedding = useTranscriptionEmbedding
  		? referenceSegment.transcriptionEmbedding
      		: referenceSegment.multimodalEmbedding;

  	if (!embedding) {
      		const query =
            			referenceSegment.text ||
            			referenceSegment.sceneDescription ||
            			'similar content';
      		return searchVideoContent(client, {
            			query,
            			collectionId,
            			limit: limit + 1,
          });
    }

  	const response = await client.request({
      		method: 'POST',
      		url: '/v1/search/vector',
      		data: {
            			vector: embedding,
            			collectionId,
            			limit: excludeSourceId ? limit + 5 : limit,
          },
    });

  	const results: MixpeekSearchResult[] = [];

  	if (response.data?.results) {
      		for (const item of response.data.results) {
            			if (excludeSourceId && item.source_id === excludeSourceId) {
                    				continue;
                  }

      			const segment: MixpeekVideoSegment = {
              				startTime: item.start_time ?? 0,
              				endTime: item.end_time ?? 0,
              				text: item.transcription,
              				sceneDescription: item.description,
              				ocrText: item.ocr_text,
              				thumbnailUrl: item.thumbnail_url,
              				confidence: item.confidence,
            };

      			results.push({
              				id: item.id,
              				score: item.score ?? 1,
              				segment,
              				source: {
                        					id: item.source_id ?? '',
                        					url: item.source_video_url,
                        					title: item.title,
                      },
            });

      			if (results.length >= limit) {
              				break;
            }
          }
    }

  	return results;
};
