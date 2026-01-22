/**
 * React hooks for using Mixpeek data in Remotion compositions
 */

import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {
  	MixpeekVideoAnalysis,
  	MixpeekVideoSegment,
  	MixpeekFrameData,
  	MixpeekEntity,
} from './types';

/**
 * Get the segment that is active at a specific time
 */
const getSegmentAtTime = (
  	segments: MixpeekVideoSegment[],
  	timeInSeconds: number
  ): MixpeekVideoSegment | null => {
    	for (const segment of segments) {
        		if (timeInSeconds >= segment.startTime && timeInSeconds < segment.endTime) {
              			return segment;
            }
      }
    	return null;
  };

/**
 * Get all segments that overlap with a specific time
 */
const getActiveSegments = (
  	segments: MixpeekVideoSegment[],
  	timeInSeconds: number
  ): MixpeekVideoSegment[] => {
    	return segments.filter(
        		(segment) =>
              			timeInSeconds >= segment.startTime && timeInSeconds < segment.endTime
              	);
  };

/**
 * Hook to access Mixpeek analysis data synchronized with the current Remotion frame.
 */
export const useMixpeekData = (
  	analysis: MixpeekVideoAnalysis
  ): MixpeekFrameData => {
    	const frame = useCurrentFrame();
    	const {fps} = useVideoConfig();

  	const timeInSeconds = frame / fps;

  	const segment = getSegmentAtTime(analysis.segments, timeInSeconds);
    	const activeSegments = getActiveSegments(analysis.segments, timeInSeconds);

  	const currentEntities: MixpeekEntity[] = activeSegments.flatMap(
      		(s) => s.entities ?? []
            	);

  	const currentText = segment?.text ?? null;
    	const currentScene = segment?.sceneDescription ?? null;

  	return {
      		frame,
      		time: timeInSeconds,
      		segment,
      		activeSegments,
      		currentText,
      		currentScene,
      		currentEntities,
    };
  };

/**
 * Hook to get interpolated progress through a segment.
 */
export const useSegmentProgress = (
  	analysis: MixpeekVideoAnalysis
  ): number | null => {
    	const frame = useCurrentFrame();
    	const {fps} = useVideoConfig();

  	const timeInSeconds = frame / fps;
    	const segment = getSegmentAtTime(analysis.segments, timeInSeconds);

  	if (!segment) {
      		return null;
    }

  	const segmentDuration = segment.endTime - segment.startTime;
    	const timeInSegment = timeInSeconds - segment.startTime;

  	return Math.min(1, Math.max(0, timeInSegment / segmentDuration));
  };

/**
 * Hook to check if a specific segment is currently active.
 */
export const useIsSegmentActive = (
  	analysis: MixpeekVideoAnalysis,
  	segmentIndex: number
  ): boolean => {
    	const frame = useCurrentFrame();
    	const {fps} = useVideoConfig();

  	const timeInSeconds = frame / fps;
    	const segment = analysis.segments[segmentIndex];

  	if (!segment) {
      		return false;
    }

  	return timeInSeconds >= segment.startTime && timeInSeconds < segment.endTime;
  };

/**
 * Hook to get entities that are visible at the current frame.
 */
export const useCurrentEntities = (
  	analysis: MixpeekVideoAnalysis,
  	entityType?: string
  ): MixpeekEntity[] => {
    	const {currentEntities} = useMixpeekData(analysis);

  	if (!entityType) {
      		return currentEntities;
    }

  	return currentEntities.filter(
      		(entity) => entity.type.toLowerCase() === entityType.toLowerCase()
      	);
  };

/**
 * Hook to search through Mixpeek analysis and highlight matching segments.
 */
export const useSearchSegments = (
  	analysis: MixpeekVideoAnalysis,
  	query: string
  ): MixpeekVideoSegment[] => {
    	if (!query.trim()) {
        		return [];
      }

  	const lowerQuery = query.toLowerCase();

  	return analysis.segments.filter((segment) => {
      		const textMatch = segment.text?.toLowerCase().includes(lowerQuery);
      		const sceneMatch = segment.sceneDescription
      			?.toLowerCase()
      			.includes(lowerQuery);
      		const objectMatch/**
             * React hooks for using Mixpeek data in Remotion compositions
             */

                                    import {useCurrentFrame, useVideoConfig} from 'remotion';
      import type {
        	MixpeekVideoAnalysis,
        	MixpeekVideoSegment,
        	MixpeekFrameData,
        	MixpeekEntity,
      } from './types';

                                    /**
       * Get the segment that is active at a specific time
       */
                                    const getSegmentAtTime = (
                                      	segments: MixpeekVideoSegment[],
                                      	timeInSeconds: number
                                      ): MixpeekVideoSegment | null => {
                                        	for (const segment of segments) {
                                            		if (timeInSecon
