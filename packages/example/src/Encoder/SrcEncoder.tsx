import {
	ALL_FORMATS,
	BufferTarget,
	Conversion,
	Input,
	Output,
	UrlSource,
	WebMOutputFormat,
} from 'mediabunny';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AbsoluteFill} from 'remotion';

const CANVAS_WIDTH = 1024 / 4;
const CANVAS_HEIGHT = (CANVAS_WIDTH / 16) * 9;

const SampleLabel: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	return (
		<div
			style={{
				height: 18,
				fontSize: 11,
				border: '1px solid white',
				display: 'inline-flex',
				justifyContent: 'center',
				alignItems: 'center',
				borderRadius: 5,
				marginRight: 4,
				padding: 3,
				fontFamily: 'Arial',
				color: 'white',
			}}
		>
			{children}
		</div>
	);
};

const SampleCount: React.FC<{
	readonly count: number;
	readonly label: string;
}> = ({count, label}) => {
	return (
		<div style={{display: 'inline-block', color: 'white'}}>
			<SampleLabel>{label}</SampleLabel>
			{count}
		</div>
	);
};

export const SrcEncoder: React.FC<{
	readonly src: string;
	readonly label: string;
}> = ({src, label}) => {
	const [state, setState] = useState({
		decodedAudioFrames: 0,
		decodedVideoFrames: 0,
		overallProgress: 0,
	});

	const [downloadFn, setDownloadFn] = useState<null | (() => void)>(null);
	const [abortfn, setAbortFn] = useState<null | (() => void)>(null);
	const [error, setError] = useState<Error | null>(null);
	const abortRef = useRef<null | (() => void)>(null);
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		return () => abortRef.current?.();
	}, [src]);

	const onClick = useCallback(async () => {
		if (abortRef.current) {
			return;
		}

		const input = new Input({
			formats: ALL_FORMATS,
			source: new UrlSource(src),
		});
		const output = new Output({
			format: new WebMOutputFormat(),
			target: new BufferTarget(),
		});
		let conversion: Conversion | null = null;
		let cancelled = false;
		const abort = () => {
			cancelled = true;
			if (conversion) {
				void conversion.cancel();
			} else {
				input.dispose();
			}
		};
		abortRef.current = abort;
		setAbortFn(() => abort);
		setError(null);
		setDownloadFn(null);
		const progress = {
			decodedAudioFrames: 0,
			decodedVideoFrames: 0,
			overallProgress: 0,
		};
		setState({...progress});

		try {
			conversion = await Conversion.init({
				input,
				output,
				video: {
					codec: 'vp9',
					forceTranscode: true,
					process: (sample) => {
						progress.decodedVideoFrames++;
						const context = ref.current?.getContext('2d');
						if (context && progress.decodedVideoFrames % 10 === 1) {
							context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
							sample.drawWithFit(context, {fit: 'contain'});
						}
						return sample;
					},
				},
				audio: {
					codec: 'opus',
					forceTranscode: true,
					process: (sample) => {
						progress.decodedAudioFrames++;
						return sample;
					},
				},
			});
			if (cancelled) {
				return;
			}
			if (!conversion.isValid) {
				throw new Error('Cannot convert this file to WebM in this browser');
			}
			conversion.onProgress = (overallProgress) => {
				progress.overallProgress = overallProgress;
				setState({...progress});
			};
			await conversion.execute();
			const buffer = output.target.buffer;
			if (!buffer) {
				throw new Error('Conversion produced no output');
			}
			setState({...progress, overallProgress: 1});
			const file = new Blob([buffer], {type: 'video/webm'});
			setDownloadFn(() => () => {
				const a = document.createElement('a');
				const url = URL.createObjectURL(file);
				a.href = url;
				a.download = 'converted.webm';
				a.click();
				setTimeout(() => URL.revokeObjectURL(url), 1000);
			});
		} catch (err) {
			if (!cancelled) {
				setError(err as Error);
			}
		} finally {
			try {
				if (conversion && conversion.state !== 'canceled') {
					await conversion.cancel();
				} else {
					await output.cancel();
				}
			} finally {
				input.dispose();
				abortRef.current = null;
				setAbortFn(null);
			}
		}
	}, [src]);

	return (
		<div
			style={{
				height: 200,
				width: 1024 / 4,
				padding: 10,
				display: 'inline-block',
				position: 'relative',
				marginBottom: -4,
			}}
		>
			<AbsoluteFill
				style={{
					background: 'black',
					textAlign: 'center',
					fontFamily: 'Arial',
				}}
			>
				<canvas
					ref={ref}
					width={CANVAS_WIDTH}
					height={CANVAS_HEIGHT}
					style={{
						background: 'black',
					}}
				/>
				<div
					style={{
						color: 'white',
						height: 20,
						position: 'absolute',
						textAlign: 'left',
						width: 1024 / 4,
						wordBreak: 'break-word',
						fontSize: 14,
						padding: 5,
					}}
				>
					{label}{' '}
				</div>

				{error ? (
					<div style={{color: 'red'}}>{error.message}</div>
				) : downloadFn ? (
					<button type="button" onClick={downloadFn}>
						Download
					</button>
				) : abortfn ? (
					<button
						type="button"
						onClick={() => {
							abortfn();
						}}
					>
						Abort
					</button>
				) : (
					<button type="button" onClick={onClick}>
						Decode
					</button>
				)}
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						gap: 10,
						justifyContent: 'center',
						alignItems: 'center',
						height: 38,
					}}
				>
					<SampleCount count={state.decodedVideoFrames} label="VD" />
					<SampleCount count={state.decodedAudioFrames} label="AD" />
					<SampleCount
						count={Math.round(state.overallProgress * 100)}
						label="%"
					/>
					<br />
				</div>
			</AbsoluteFill>
		</div>
	);
};
