export type AudioSchedulerSource =
	| string
	| {
			readonly render: string;
			readonly preview?: string;
	  };

export type AudioScheduleEntry = {
	readonly id: string;
	readonly src: AudioSchedulerSource;
	readonly startTimeInSeconds: number;
	readonly durationInSeconds: number;
	readonly sourceStartTimeInSeconds: number;
	readonly volume?: number;
	readonly fadeInDurationInSeconds?: number;
	readonly fadeOutDurationInSeconds?: number;
};

export type AudioSchedulerProps = {
	readonly schedule: readonly AudioScheduleEntry[];
};

export type NormalizedAudioScheduleEntry = Readonly<{
	id: string;
	renderSrc: string;
	previewSrc: string;
	startTimeInSeconds: number;
	durationInSeconds: number;
	sourceStartTimeInSeconds: number;
	volume: number;
	fadeInDurationInSeconds: number;
	fadeOutDurationInSeconds: number;
	originalIndex: number;
}>;

export type NormalizedAudioSchedule = readonly NormalizedAudioScheduleEntry[];
