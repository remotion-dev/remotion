import {Player} from '@remotion/player';
import React, {useLayoutEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Sequence} from 'remotion';

const refs = [];
const makeChild = (revision) => {
	const buffer = new Uint8Array(1024 * 1024);
	buffer[0] = revision;
	const Child = () => <span>Current revision: {buffer[0]}</span>;
	refs.push(new WeakRef(Child));
	return Child;
};

let replace;
let flush;
const Composition = () => {
	const [state, setState] = useState(() => ({Child: makeChild(0), tick: 0}));
	useLayoutEffect(() => {
		replace = (revision) =>
			setState({Child: makeChild(revision), tick: revision});
		flush = () => setState((current) => ({...current, tick: current.tick + 1}));
		return () => {
			replace = null;
			flush = null;
		};
	}, []);
	return (
		<Sequence layout="none">
			<state.Child />
		</Sequence>
	);
};

const root = createRoot(document.getElementById('root'));
root.render(
	<Player
		component={Composition}
		durationInFrames={100}
		fps={30}
		compositionWidth={320}
		compositionHeight={100}
	/>,
);

const afterCommit = () =>
	new Promise((resolve) =>
		requestAnimationFrame(() => requestAnimationFrame(resolve)),
	);
window.retainedRevisions = () =>
	refs.flatMap((ref, index) => (ref.deref() ? [index] : []));
document.getElementById('replace').onclick = async () => {
	document.getElementById('replace').disabled = true;
	for (let revision = 1; revision <= 5; revision++) {
		replace(revision);
		await afterCommit();
	}
	// Commit twice more so both current and alternate React trees have child 5.
	for (let i = 0; i < 2; i++) {
		flush();
		await afterCommit();
	}
	document.getElementById('result').textContent =
		'Replacement complete. Collect garbage, then inspect.';
};
document.getElementById('inspect').onclick = () => {
	document.getElementById('result').textContent = JSON.stringify(
		window.retainedRevisions(),
	);
};
document.getElementById('unmount').onclick = () => root.unmount();
