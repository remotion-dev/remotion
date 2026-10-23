export type OpenTimelineDiagnostic = {
	code: string;
	severity: 'error' | 'warning' | 'info';
	path: string;
	message: string;
};

export type OpenTimelineAnnotation = {
	path: string;
	metadata: Record<string, unknown> | null;
	markers: unknown[];
};

export type OpenTimelineNode = {
	type: 'track' | 'stack' | 'clip' | 'gap' | 'transition';
	path: string;
	name: string;
	/** Seconds in the parent timeline, unaffected by OTIO time effects. */
	duration: number;
	/** Source timecode for clips; the child-timeline trim for compositions. */
	sourceStart: number;
	enabled: boolean;
	kind: 'Video' | 'Audio';
	children: OpenTimelineNode[];
	media: Record<string, unknown> | null;
	playbackRate: number;
	freeze: boolean;
	transition: {
		inOffset: number;
		outOffset: number;
		type: string;
	} | null;
};

export type NormalizedOpenTimeline = {
	root: OpenTimelineNode | null;
	diagnostics: OpenTimelineDiagnostic[];
	annotations: OpenTimelineAnnotation[];
	globalStartTime: {value: number; rate: number} | null;
};
