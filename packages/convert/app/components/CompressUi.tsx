import {
	QUALITY_HIGH,
	QUALITY_LOW,
	QUALITY_MEDIUM,
	QUALITY_VERY_HIGH,
	QUALITY_VERY_LOW,
} from 'mediabunny';
import React from 'react';
import {Label} from './ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';

type QualityLevel =
	| typeof QUALITY_VERY_LOW
	| typeof QUALITY_LOW
	| typeof QUALITY_MEDIUM
	| typeof QUALITY_HIGH
	| typeof QUALITY_VERY_HIGH
	| null;

export const CompressUi: React.FC<{
	readonly videoQuality: QualityLevel;
	readonly setVideoQuality: (quality: QualityLevel) => void;
	readonly audioQuality: QualityLevel;
	readonly setAudioQuality: (quality: QualityLevel) => void;
	readonly hasVideo: boolean;
	readonly hasAudio: boolean;
}> = ({
	videoQuality,
	setVideoQuality,
	audioQuality,
	setAudioQuality,
	hasVideo,
	hasAudio,
}) => {
	const getQualityValue = (quality: QualityLevel): string => {
		if (quality === null) return 'none';
		if (quality === QUALITY_VERY_LOW) return 'very-low';
		if (quality === QUALITY_LOW) return 'low';
		if (quality === QUALITY_MEDIUM) return 'medium';
		if (quality === QUALITY_HIGH) return 'high';
		if (quality === QUALITY_VERY_HIGH) return 'very-high';
		return 'none';
	};

	const setQualityFromValue = (value: string): QualityLevel => {
		if (value === 'very-low') return QUALITY_VERY_LOW;
		if (value === 'low') return QUALITY_LOW;
		if (value === 'medium') return QUALITY_MEDIUM;
		if (value === 'high') return QUALITY_HIGH;
		if (value === 'very-high') return QUALITY_VERY_HIGH;
		return null;
	};

	return (
		<div>
			<div className="h-4" />
			{hasVideo ? (
				<>
					<Label htmlFor="video-quality">Video quality</Label>
					<Select
						value={getQualityValue(videoQuality)}
						onValueChange={(val) => setVideoQuality(setQualityFromValue(val))}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select video quality" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">No compression</SelectItem>
							<SelectItem value="very-low">Very Low</SelectItem>
							<SelectItem value="low">Low</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="high">High</SelectItem>
							<SelectItem value="very-high">Very High</SelectItem>
						</SelectContent>
					</Select>
					<div className="text-sm mt-2 text-muted-foreground">
						Lower quality reduces file size but may affect visual quality.
					</div>
				</>
			) : null}
			{hasVideo && hasAudio ? <div className="h-4" /> : null}
			{hasAudio ? (
				<>
					<Label htmlFor="audio-quality">Audio quality</Label>
					<Select
						value={getQualityValue(audioQuality)}
						onValueChange={(val) => setAudioQuality(setQualityFromValue(val))}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select audio quality" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">No compression</SelectItem>
							<SelectItem value="very-low">Very Low</SelectItem>
							<SelectItem value="low">Low</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="high">High</SelectItem>
							<SelectItem value="very-high">Very High</SelectItem>
						</SelectContent>
					</Select>
					<div className="text-sm mt-2 text-muted-foreground">
						Lower quality reduces file size but may affect audio quality.
					</div>
				</>
			) : null}
		</div>
	);
};
