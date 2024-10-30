import type {EnhancedErrorInfo} from '@remotion/lambda';
import React, {useCallback} from 'react';
import {z} from 'zod';
import {DoneCheckmark} from './DoneCheckmark';
import {Progress} from './Progress';
import {Spinner} from './Spinner';

const countryPath = z.object({
	d: z.string(),
	class: z.string(),
});

const remoteData = z.object({
	repos: z.array(z.string()),
	date: z.string(),
	temperatureInCelsius: z.number(),
	countryLabel: z.string(),
	countryPaths: z.array(countryPath),
});

const location = z.object({
	country: z.string(),
	city: z.string(),
	latitude: z.number(),
	longitude: z.number(),
});

const data = z.object({
	trending: remoteData,
	location,
	emojiIndex: z.number(),
	theme: z.enum(['light', 'dark']),
	cardOrder: z.array(z.number()),
});

type State =
	| {
			type: 'idle';
	  }
	| {
			type: 'invoking';
	  }
	| {
			type: 'progress';
			progress: number;
	  }
	| {
			type: 'done';
	  };

const style: React.CSSProperties = {
	appearance: 'none',
	border: 'none',
	outline: 'none',
	backgroundColor: 'transparent',
	cursor: 'pointer',
	width: 55,
	height: 50,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
};

export const RenderButton: React.FC<{
	renderData: z.infer<typeof data> | null;
}> = ({renderData}) => {
	const [state, setState] = React.useState<State>({
		type: 'idle',
	});

	const triggerRender = useCallback(async () => {
		if (renderData === null) {
			return;
		}

		setState({type: 'invoking'});

		const {renderId, bucketName} = await (
			await fetch('http://localhost:4000/render', {
				method: 'post',
				headers: {'content-type': 'application/json'},
				body: JSON.stringify(renderData),
			})
		).json();
		setState({type: 'progress', progress: 0});

		let done = false;

		while (!done) {
			const progress = (await (
				await fetch('http://localhost:4000/progress', {
					method: 'post',
					headers: {'content-type': 'application/json'},
					body: JSON.stringify({renderId, bucketName}),
				})
			).json()) as {
				overallProgress: number;
				outputFile: string | null;
				errors: EnhancedErrorInfo[];
				fatalErrorEncountered: boolean;
			};
			setState({
				type: 'progress',
				progress: progress.overallProgress,
			});

			console.log({progress});
			if (progress.outputFile) {
				done = true;
				setState({type: 'done'});
			}

			if (progress.fatalErrorEncountered) {
				done = true;
			}
		}
	}, [renderData]);

	return (
		<button
			type="button"
			onClick={triggerRender}
			style={style}
			disabled={!renderData}
		>
			{state.type === 'done' ? (
				<DoneCheckmark />
			) : state.type === 'progress' ? (
				<Progress progress={state.progress} />
			) : state.type === 'invoking' ? (
				<Spinner size={20} duration={1} />
			) : (
				<svg
					style={{
						width: 18,
						opacity: renderData ? 1 : 0.5,
					}}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 384 512"
				>
					<path d="M214.6 342.6L192 365.3l-22.6-22.6-128-128L18.7 192 64 146.7l22.6 22.6L160 242.7 160 64l0-32 64 0 0 32 0 178.7 73.4-73.4L320 146.7 365.3 192l-22.6 22.6-128 128zM32 416l320 0 32 0 0 64-32 0L32 480 0 480l0-64 32 0z" />
				</svg>
			)}
		</button>
	);
};
