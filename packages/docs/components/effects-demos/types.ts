import type React from 'react';
import type {LogLevel, SequenceSchema} from 'remotion';

export type EffectsDemoType = {
	id: string;
	effectName: string;
	effectImportPath: string;
	comp: React.FC;
	schema: SequenceSchema;
	initialValues?: Record<string, unknown>;
	compWidth: number;
	compHeight: number;
	fps: number;
	durationInFrames: number;
	autoPlay: boolean;
	controls: boolean;
	logLevel: LogLevel;
};
