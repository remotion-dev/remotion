import React, {useCallback, useEffect, useState} from 'react';
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

type CompositionState =
	| {
			type: 'not-initialized';
	  }
	| {
			type: 'loading';
	  }
	| {
			type: 'loaded';
			comps: string[];
	  }
	| {
			type: 'error';
			error: Error;
	  };

const AvailableCompositions: React.FC = () => {
	const [state, setComps] = useState<CompositionState>({
		type: 'not-initialized',
	});

	useEffect(() => {
		if (getBundleMode().type !== 'evaluation') {
			return;
		}

		let timeout: NodeJS.Timeout | null = null;
		const check = () => {
			if (window.remotion_renderReady === true) {
				setComps({type: 'loading'});
				try {
					const newComps = window.remotion_getCompositionNames();
					setComps({type: 'loaded', comps: newComps});
				} catch (err) {
					setComps({type: 'error', error: err as Error});
				}
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

	if (state.type === 'loading') {
		return <div>{state === null ? <p>Loading compositions...</p> : null}</div>;
	}

	if (state.type === 'error') {
		return <div>Error loading compositions: {state.error.stack}</div>;
	}

	if (state.type === 'not-initialized') {
		return <div>Not initialized</div>;
	}

	return (
		<div>
			<ul>
				{state === null
					? []
					: state.comps.map((c) => {
							return <li key={c}>{c}</li>;
					  })}
			</ul>
		</div>
	);
};

const TestCORS: React.FC = () => {
	const [serveUrl, setServeUrl] = useState('');
	const [result, setResult] = useState('');

	const handleServeUrl = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setServeUrl(e.target.value);
		},
		[]
	);

	const isCORSWorking: React.FormEventHandler<HTMLFormElement> = useCallback(
		async (e) => {
			e.preventDefault();
			try {
				const response = await fetch(serveUrl, {mode: 'cors'});

				if (response.ok) {
					setResult(`CORS is enabled on this URL: ${serveUrl}`);
				} else {
					setResult(
						'URL does not support CORS - See DevTools console for more details'
					);
				}
			} catch (error) {
				setResult(
					'URL does not support CORS - See DevTools console for more details'
				);
			}
		},
		[serveUrl]
	);

	return (
		<div>
			<p>
				Quickly test if a URL is supported being loaded on origin{' '}
				<code>{window.location.origin}</code>. Enter the URL of an asset below.
			</p>
			{result ? <p className="result">{result}</p> : null}
			<form onSubmit={isCORSWorking}>
				<label htmlFor="serveurl">
					<input
						placeholder="Enter URL"
						type="text"
						name="serveurl"
						value={serveUrl}
						onChange={handleServeUrl}
					/>
				</label>
				<br />
				<button type="submit">Test CORS</button>
			</form>
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
			<h2>CORS testing tool</h2>
			<TestCORS />
			<br />
			<br />
			<br />
		</div>
	);
};
