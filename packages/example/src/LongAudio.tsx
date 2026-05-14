import {Audio} from '@remotion/media';
import {getStaticFiles} from '@remotion/studio';
import {AbsoluteFill} from 'remotion';

const FILES = [
	{
		name: 'long-audio.wav',
		codec: 'pcm_s16le',
	},
	{
		name: 'long-audio.mp3',
		codec: 'libmp3lame',
	},
	{
		name: 'long-audio.aac',
		codec: 'aac',
	},
] as const;

const ffmpegCommand = (fileName: string, codec: string) =>
	`bunx remotion ffmpeg -f lavfi -i "sine=frequency=440:duration=3600" -c:a ${codec} public/${fileName}`;

export const LongAudio: React.FC = () => {
	const staticFiles = getStaticFiles();
	const resolved = FILES.map((f) => ({
		...f,
		file: staticFiles.find((s) => s.name === f.name),
	}));
	const missing = resolved.filter((r) => !r.file);

	if (missing.length > 0) {
		return (
			<AbsoluteFill
				style={{
					backgroundColor: '#111',
					color: '#eee',
					fontFamily: 'monospace',
					padding: 60,
					justifyContent: 'center',
				}}
			>
				<div style={{fontSize: 32, marginBottom: 24}}>
					Missing {missing.length} audio file(s)
				</div>
				<div style={{fontSize: 20, marginBottom: 16, opacity: 0.8}}>
					Generate the missing 1h test audio file(s) with:
				</div>
				{missing.map((m) => (
					<pre
						key={m.name}
						style={{
							fontSize: 20,
							background: '#222',
							padding: 20,
							borderRadius: 8,
							marginBottom: 12,
							whiteSpace: 'pre-wrap',
							wordBreak: 'break-all',
						}}
					>
						{ffmpegCommand(m.name, m.codec)}
					</pre>
				))}
			</AbsoluteFill>
		);
	}

	return (
		<>
			{resolved.map((r) => (
				<Audio key={r.name} src={r.file!.src} />
			))}
		</>
	);
};
