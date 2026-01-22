/**
 * Video indexing utilities for Mixpeek multimodal extractor integration
 */

import type {Mixpeek} from 'mixpeek';
import type {
  	MixpeekIndexOptions,
  	MixpeekIndexResult,
  	MixpeekVideoAnalysis,
  	MixpeekVideoSegment,
} from './types';

/**
 * Index a video using Mixpeek's multimodal extractor.
 * 
 * Supports video, image, text, and GIF content with configurable
 * extraction options for transcription, embeddings, OCR, and descriptions.
 */
export const indexVideo = async (
  	client: Mixpeek,
  	options: MixpeekIndexOptions
  ): Promise<MixpeekIndexResult> => {
  	const {
      		videoUrl,
      		collectionId,
      		splitMethod,
      		runTranscription,
      		runTranscriptionEmbedding,
      		runMultimodalEmbedding,
      		runVideoDescription,
      		runOcr,
      		enableThumbnails,
      		webhookUrl,
      		metadata,
    } = options;

  	const request: Record<string, unknown> = {
      		video: videoUrl,
      		metadata: metadata ?? {},
    };

  	if (collectionId) {
      		request.collection_id = collectionId;
    }

  	// Video splitting configuration
  	if (splitMethod) {
      		request.split_method = splitMethod;
    }

  	// Multimodal extractor flags
  	if (runTranscription !== undefined) {
      		request.run_transcription = runTranscription;
    }
  	if (runTranscriptionEmbedding !== undefined) {
      		request.run_transcription_embedding = runTranscriptionEmbedding;
    }
  	if (runMultimodalEmbedding !== undefined) {
      		request.run_multimodal_embedding = runMultimodalEmbedding;
    }
  	if (runVideoDescription !== undefined) {
      		request.run_video_description = runVideoDescription;
    }
  	if (runOcr !== undefined) {
      		request.run_ocr = runOcr;
    }
  	if (enableThumbnails !== undefined) {
      		request.enable_thumbnails = enableThumbnails;
    }

  	if (webhookUrl) {
      		request.webhook_url = webhookUrl;
    }

  	const response = await client.request({
      		method: 'POST',
      		url: '/v1/ingest/video',
      		data: request,
    });

  	return {
      		jobId: response.data?.job_id ?? response.data?.jobId ?? '',
      		status: 'pending',
      		progress: 0,
    };
};

/**
 * Check the status of a video indexing job.
 */
export const getIndexingStatus = async (
  	client: Mixpeek,
  	jobId: string
  ): Promise<MixpeekIndexResult> => {
  	const response = await client.request({
      		method: 'GET',
      		url: `/v1/jobs/${jobId}`,
    });

  	const data = response.data;

  	const result: MixpeekIndexResult = {
      		jobId,
      		status: mapStatus(data?.status),
      		progress: data?.progress ?? 0,
    };

  	if (data?.error) {
      		result.error = data.error;
    }

  	if (data?.result) {
      		result.result = transformAnalysis(data.result);
    }

  	return result;
};

/**
 * Wait for a video indexing job to complete.
 */
export const waitForIndexing = async (
  	client: Mixpeek,
  	jobId: string,
  	options: {
      		pollInterval?: number;
      		timeout?: number;
      		onProgress?: (progress: number) => void;
    } = {}
  ): Promise<MixpeekVideoAnalysis> => {
  	const {pollInterval = 3000, timeout = 600000, onProgress} = options;

  	const startTime = Date.now();

  	while (true) {
      		const status = await getIndexingStatus(client, jobId);

  		if (onProgress && status.progress !== undefined) {
        			onProgress(status.progress);
      }

  		if (status.status === 'completed' && status.result) {
        			return status.result;
      }

  		if (status.status === 'failed') {
        			throw new Error(`Indexing failed: ${status.error ?? 'Unknown error'}`);
      }

  		if (Date.now() - startTime > timeout) {
        			throw new Error(`Indexing timed out after ${timeout}ms`);
      }

  		await sleep(pollInterval);
    }
};

/**
 * Index multiple videos in batch.
 */
export const indexVideoBatch = async (
  	client: Mixpeek,
  	videos: MixpeekIndexOptions[]
  ): Promise<MixpeekIndexResult[]> => {
  	return Promise.all(videos.map((video) => indexVideo(client, video)));
};

const sleep = (ms: number): Promise<void> =>
  	new Promise((resolve) => setTimeout(resolve, ms));

const mapStatus = (
  	status: string | undefined
  ): 'pending' | 'processing' | 'completed' | 'failed' => {
    	switch (status?.toLowerCase()) {
        case 'completed':
        case 'complete':
        case 'done':
          			return 'completed';
        case 'failed':
        case 'error':
          			return 'failed';
        case 'processing':
        case 'running':
        case 'in_progress':
          			return 'processing';
        default:
          			return 'pending';
      }
  };

const transformAnalysis = (data: Record<string, unknown>): MixpeekVideoAnalysis => {
  	const segments: MixpeekVideoSegment[] = [];
  	const rawSegments = (data.segments ?? data.results ?? []) as Array<Record<string, unknown>>;

  	for (const seg of rawSegments) {
      		segments.push({
            			startTime: (seg.start_time ?? seg.startTime ?? 0) as number,
            			endTime: (seg.end_time ?? seg.endTime ?? 0) as number,
            			text: (seg.transcription ?? seg.text) as string | undefined,
            			sceneDescription: (seg.description ?? seg.scene_description) as string | undefined,
            			ocrText: seg.ocr_text as string | undefined,
            			thumbnailUrl: seg.thumbnail_url as string | undefined,
            			videoSegmentUrl: seg.video_segment_url as string | undefined,
            			detectedObjects: (seg.objects ?? seg.detectedObjects) as string[] | undefined,
            			confidence: seg.confidence as number | undefined,
            			multimodalEmbedding: seg.multimodal_extractor_v1_multimodal_embedding as number[] | undefined,
            			transcriptionEmbedding: seg.multimodal_extractor_v1_transcription_embedding as number[] | undefined,
            			metadata: seg.metadata as Record<string, unknown> | undefined,
          });
    }

  	return {
      		id: (data.id ?? data._id ?? '') as string,
      		sourceUrl: (data.source_video_url ?? data.source_url ?? data.url ?? '') as string,
      		duration: (data.duration ?? 0) as number,
      		fps: data.fps as number | undefined,
      		segments,
      		transcript: data.transcript as string | undefined,
      		summary: data.summary as string | undefined,
      		tags: data.tags as string[] | undefined,
      		createdAt: (data.created_at ?? data.createdAt ?? new Date().toISOString()) as string,
    };
};
