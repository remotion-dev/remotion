/**
 * Convert Mixpeek video analysis to Remotion captions
 */

import type {Caption} from '@remotion/captions';
import type {
  	MixpeekVideoAnalysis,
  	MixpeekVideoSegment,
  	MixpeekToCaptionsOptions,
} from './types';

/**
 * Input for converting Mixpeek analysis to captions
 */
export interface MixpeekToCaptionsInput {
  	/**
  	 * The Mixpeek video analysis result
  	 */
	analysis: MixpeekVideoAnalysis;
  	/**
  	 * Conversion options
  	 */
	options?: MixpeekToCaptionsOptions;
}

/**
 * Output from converting Mixpeek analysis to captions
 */
export interface MixpeekToCaptionsOutput {
  	/**
  	 * The generated captions in Remotion format
  	 */
	captions: Caption[];
}

/**
 * Default formatter that extracts text from a segment
 */
const defaultFormatter = (
  	segment: MixpeekVideoSegment,
  	options: MixpeekToCaptionsOptions
  ): string | null => {
    	const parts: string[] = [];

  	// Add transcript text
  	if (segment.text?.trim()) {
      		parts.push(segment.text.trim());
    }

  	// Optionally add scene descriptions
  	if (options.includeSceneDescriptions && segment.sceneDescription?.trim()) {
      		parts.push(`[${segment.sceneDescription.trim()}]`);
    }

  	// Optionally add detected objects
  	if (
      		options.includeDetectedObjects &&
      		segment.detectedObjects?.length
      	) {
      		parts.push(`[Objects: ${segment.detectedObjects.join(', ')}]`);
    }

  	return parts.length > 0 ? parts.join(' ') : null;
  };

/**
 * Convert Mixpeek video analysis to Remotion captions format.
 */
export const mixpeekToCaptions = ({
  	analysis,
  	options = {},
}: MixpeekToCaptionsInput): MixpeekToCaptionsOutput => {
  	const {
      		maxDuration = 5,
      		minDuration = 0.5,
      		includeSceneDescriptions = false,
      		includeDetectedObjects = false,
      		formatter,
    } = options;

  	const effectiveOptions: MixpeekToCaptionsOptions = {
      		maxDuration,
      		minDuration,
      		includeSceneDescriptions,
      		includeDetectedObjects,
    };

  	const captions: Caption[] = [];

  	for (const segment of analysis.segments) {
      		const text = formatter
      			? formatter(segment)
            			: defaultFormatter(segment, effectiveOptions);

  		if (!text) {
        			continue;
      }

  		const startMs = segment.startTime * 1000;
      		const endMs = segment.endTime * 1000;
      		const durationMs = endMs - startMs;

  		if (durationMs < minDuration * 1000) {
        			continue;
      }

  		if (durationMs > maxDuration * 1000) {
        			const words = text.split(/\s+/);
        			const segmentCount = Math.ceil(durationMs / (maxDuration * 1000));
        			const wordsPerSegment = Math.ceil(words.length / segmentCount);
        			const segmentDurationMs = durationMs / segmentCount;

      			for (let i = 0; i < segmentCount; i++) {
              				const segmentWords = words.slice(
                        					i * wordsPerSegment,
                        					(i + 1) * wordsPerSegment
                        				);

        				if (segmentWords.length === 0) {
                  					continue;
                }

        				captions.push({
                  					text: segmentWords.join(' '),
                  					startMs: startMs + i * segmentDurationMs,
                  					endMs: startMs + (i + 1) * segmentDurationMs,
                  					confidence: segment.confidence ?? null,
                  					timestampMs: startMs + i * segmentDurationMs,
                });
            }
      } else {
        			captions.push({
                				text,
                				startMs,
                				endMs,
                				confidence: segment.confidence ?? null,
                				timestampMs: startMs,
              });
      }
    }

  	captions.sort((a, b) => a.startMs - b.startMs);

  	return {captions};
};

/**
 * Extract transcript text from Mixpeek analysis as a single string.
 */
export const extractTranscript = (analysis: MixpeekVideoAnalysis): string => {
  	if (analysis.transcript) {
      		return analysis.transcript;
    }

  	return analysis.segments
  		.filter((s) => s.text?.trim())
  		.map((s) => s.text!.trim())
  		.join(' ');
};

/**/**
 * Convert Mixpeek video analysis to Remotion captions
 */

  import type {Caption} from '@remotion/captions';
import type {
  	MixpeekVideoAnalysis,
  	MixpeekVideoSegment,
  	MixpeekToCaptionsOptions,
} from './types';

/**
 * Input for converting Mixpeek analysis to captions
 */
export interface MixpeekToCaptionsInput {
  	/**
  	 * The Mixpeek video analysis result
  	 */
	analysis: MixpeekVideoAnalysis;
  	/**
  	 * Conversion options
  	 */
	options?: MixpeekToCaptionsOptions;
}
