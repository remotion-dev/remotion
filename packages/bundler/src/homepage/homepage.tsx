import React, {useCallback, useEffect, useState} from 'react';
import type {TCompMetadata} from 'remotion';
import {getBundleMode} from '../bundle-mode';
import {setBundleModeAndUpdate} from '../renderEntry';

const container: React.CSSProperties = {
	width: 800,
	margin: 'auto',
	paddingLeft: 20,
	paddingRight: 20,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
};

const pre: React.CSSProperties = {
	display: 'block',
	backgroundColor: '#f7f7f7',
	whiteSpace: 'nowrap',
	padding: 16,
	fontFamily: 'monospace',
	borderRadius: 5,
	fontSize: 15,
	overflowX: 'auto',
};

const AvailableCompositions: React.FC = () => {
	const [comps, setComps] = useState<TCompMetadata[] | null>(null);

	useEffect(() => {
		let timeout: NodeJS.Timeout | null = null;
		const check = () => {
			if (window.ready === true) {
				setComps(window.getStaticCompositions());
			} else {
				timeout = setTimeout(check, 250);
			}
		};

		check();

		return () => {
			if (!timeout) {
				return;
			}

			clearTimeout(timeout);
		};
	}, []);

	const showComps = useCallback(() => {
		setBundleModeAndUpdate({type: 'evaluation'});
	}, []);

	if (getBundleMode().type !== 'evaluation') {
		return (
			<button type="button" onClick={showComps}>
				Click here to see a list of available compositions.
			</button>
		);
	}

	return (
		<div>
			{comps === null ? <p>Loading compositions...</p> : null}
			<ul>
				{comps === null
					? null
					: comps.map((c) => {
							return <li key={c.id}>{c.id}</li>;
					  })}
			</ul>
		</div>
	);
};

export const Homepage: React.FC = () => {
	const url = window.location.origin + window.location.pathname;
	return (
		<div style={container}>
			<h1>Remotion Bundle</h1>
			This is a website which contains a bundled Remotion video. You can render
			videos based on this URL.
			<h2>Available compositions</h2>
			<AvailableCompositions />
			<h2>How to render</h2>
			Locally: <br />
			<br />
			<div style={pre}>
				npx remotion render {url} {'<comp-name> <output-location>'}
			</div>
			<br />
			<br />
			With Remotion Lambda: <br />
			<br />
			<div style={pre}>
				npx remotion lambda render {url} {'<comp-name>'}
			</div>
			<br />
			<p>
				You can also render still images, and use the Node.JS APIs{' '}
				<code>getCompositions()</code>, <code>renderMedia()</code>,{' '}
				<code>renderMediaOnLambda()</code>, <code>renderStill()</code> and{' '}
				<code>renderStillOnLambda()</code> with this URL.
			</p>
			<p>
				Visit{' '}
				<a href="https://remotion.dev/docs" target="_blank">
					remotion.dev/docs
				</a>{' '}
				to read the documentation.
			</p>
		</div>
	);
};
