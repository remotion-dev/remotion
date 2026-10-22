import {Player} from '@remotion/player';
import React, {useLayoutEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Sequence} from 'remotion';

declare global {
	interface Window {
		sequenceRetentionOptions: {
			layout: 'none' | 'absolute-fill';
			registration: boolean;
		};
		sequenceRetention: {
			refs: WeakRef<React.FC>[];
			replace: (revision: number) => void;
			flush: () => void;
			unmount: () => void;
		};
	}
}

const refs: WeakRef<React.FC>[] = [];
const makeChild = (revision: number): React.FC => {
	const buffer = new Uint8Array(1024 * 1024);
	buffer[0] = revision;
	const Child = () => <span id="revision">{buffer[0]}</span>;
	refs.push(new WeakRef(Child));
	return Child;
};

const Composition = () => {
	const [state, setState] = useState(() => ({Child: makeChild(0), nonce: 0}));
	useLayoutEffect(() => {
		window.sequenceRetention.replace = (revision) =>
			setState({Child: makeChild(revision), nonce: revision});
		window.sequenceRetention.flush = () =>
			setState((previous) => ({...previous, nonce: previous.nonce + 1}));
	}, []);
	return (
		<Sequence layout={window.sequenceRetentionOptions.layout}>
			<div>
				<state.Child />
			</div>
		</Sequence>
	);
};

const root = createRoot(document.getElementById('root')!);
window.sequenceRetention = {
	refs,
	replace: () => {
		throw new Error('Not mounted');
	},
	flush: () => {
		throw new Error('Not mounted');
	},
	unmount: () => root.unmount(),
};
root.render(
	<Player
		component={Composition}
		onTimelineSequenceChange={
			window.sequenceRetentionOptions.registration ? () => undefined : undefined
		}
		durationInFrames={100}
		fps={30}
		compositionWidth={100}
		compositionHeight={100}
	/>,
);
