import React from 'react';
import {Label} from './ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';

const formatBitrate = (bitrate: number): string => {
	if (bitrate >= 1000000) {
		return `${(bitrate / 1000000).toFixed(1)} Mbps`;
	}
	return `${(bitrate / 1000).toFixed(0)} Kbps`;
};

export const CompressUi: React.FC<{
	videoBitrate: number | null;
	setVideoBitrate: (bitrate: number | null) => void;
	audioBitrate: number | null;
	setAudioBitrate: (bitrate: number | null) => void;
	hasVideo: boolean;
	hasAudio: boolean;
}> = ({
	videoBitrate,
	setVideoBitrate,
	audioBitrate,
	setAudioBitrate,
	hasVideo,
	hasAudio,
}) => {
	return (
		<div>
			<div className="h-4" />
			{hasVideo ? (
				<>
					<Label htmlFor="video-bitrate">Video bitrate</Label>
					<Select
						value={String(videoBitrate ?? 'none')}
						onValueChange={(val) =>
							setVideoBitrate(val === 'none' ? null : Number(val))
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select video bitrate" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">No compression</SelectItem>
							<SelectItem value="500000">{formatBitrate(500000)}</SelectItem>
							<SelectItem value="1000000">{formatBitrate(1000000)}</SelectItem>
							<SelectItem value="2000000">{formatBitrate(2000000)}</SelectItem>
							<SelectItem value="3000000">{formatBitrate(3000000)}</SelectItem>
							<SelectItem value="5000000">{formatBitrate(5000000)}</SelectItem>
							<SelectItem value="8000000">{formatBitrate(8000000)}</SelectItem>
							<SelectItem value="10000000">{formatBitrate(10000000)}</SelectItem>
						</SelectContent>
					</Select>
					<div className="text-sm mt-2 text-muted-foreground">
						Lower bitrate reduces file size but may affect quality.
					</div>
				</>
			) : null}
			{hasVideo && hasAudio ? <div className="h-4" /> : null}
			{hasAudio ? (
				<>
					<Label htmlFor="audio-bitrate">Audio bitrate</Label>
					<Select
						value={String(audioBitrate ?? 'none')}
						onValueChange={(val) =>
							setAudioBitrate(val === 'none' ? null : Number(val))
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select audio bitrate" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">No compression</SelectItem>
							<SelectItem value="64000">{formatBitrate(64000)}</SelectItem>
							<SelectItem value="96000">{formatBitrate(96000)}</SelectItem>
							<SelectItem value="128000">{formatBitrate(128000)}</SelectItem>
							<SelectItem value="192000">{formatBitrate(192000)}</SelectItem>
							<SelectItem value="256000">{formatBitrate(256000)}</SelectItem>
							<SelectItem value="320000">{formatBitrate(320000)}</SelectItem>
						</SelectContent>
					</Select>
					<div className="text-sm mt-2 text-muted-foreground">
						Lower bitrate reduces file size but may affect audio quality.
					</div>
				</>
			) : null}
		</div>
	);
};
