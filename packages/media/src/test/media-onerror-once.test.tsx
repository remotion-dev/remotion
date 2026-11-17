import {Player} from '@remotion/player';
import {createRoot} from 'react-dom/client';
import {expect, test} from 'vitest';
import {Audio} from '../audio/audio';
import {Video} from '../video/video';

const waitFor = async (predicate: () => boolean) => {
	const started = Date.now();
	while (Date.now() - started < 10000) {
		if (predicate()) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	throw new Error('Timed out waiting for condition');
};

test.each(['video', 'audio'] as const)(
	'%s without tracks calls onError once and shows the error fallback when onError returns "fail"',
	async (tagType) => {
		const container = document.createElement('div');
		document.body.appendChild(container);
		const root = createRoot(container);
		const errors: string[] = [];

		const onError = (err: Error) => {
			errors.push(err.message);
			return 'fail' as const;
		};

		const Composition = () =>
			tagType === 'audio' ? (
				<Audio src="/empty.mp4" onError={onError} />
			) : (
				<Video src="/empty.mp4" onError={onError} />
			);

		root.render(
			<Player
				acknowledgeRemotionLicense
				component={Composition}
				compositionHeight={720}
				compositionWidth={1280}
				durationInFrames={100}
				fps={30}
				inputProps={{}}
				errorFallback={({error}) => <div>Caught: {error.message}</div>}
			/>,
		);

		try {
			await waitFor(() => errors.length > 0);
			await waitFor(() => container.textContent?.includes('Caught:') === true);
			await new Promise((resolve) => setTimeout(resolve, 500));

			expect(errors).toEqual([errors[0]]);
			expect(container.textContent).toContain(`Caught: ${errors[0]}`);
		} finally {
			root.unmount();
			container.remove();
		}
	},
);
