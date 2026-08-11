import React, {useEffect, useState} from 'react';
import {
	BLACK_HEX,
	ERROR_LINK_COLOR,
	WHITE,
	WHITE_ALPHA_10,
} from '../../helpers/colors';

type ProbeResult =
	| {type: 'loading'}
	| {type: 'not-found'}
	| {type: 'other-error'; statusCode: number}
	| {type: 'wrong-content-type'; contentType: string}
	| {type: 'ok'}
	| {type: 'fetch-error'};

const container: React.CSSProperties = {
	borderRadius: 3,
	color: WHITE,
	padding: 12,
	backgroundColor: BLACK_HEX,
	fontSize: 14,
	fontFamily: 'sans-serif',
	lineHeight: 1.5,
};

const codeStyle: React.CSSProperties = {
	backgroundColor: WHITE_ALPHA_10,
	padding: '2px 5px',
	borderRadius: 3,
	fontFamily: 'monospace',
	fontSize: 13,
};

const linkStyle: React.CSSProperties = {
	color: ERROR_LINK_COLOR,
};

export const MediaPlaybackErrorExplainer: React.FC<{
	readonly src: string;
}> = ({src}) => {
	const [result, setResult] = useState<ProbeResult>({type: 'loading'});

	useEffect(() => {
		fetch(src, {method: 'HEAD'})
			.then((res) => {
				if (res.status === 404) {
					setResult({type: 'not-found'});
				} else if (!res.ok) {
					setResult({type: 'other-error', statusCode: res.status});
				} else {
					const contentType = res.headers.get('content-type') ?? '';
					if (
						contentType.includes('text/html') ||
						contentType.includes('application/json')
					) {
						setResult({type: 'wrong-content-type', contentType});
					} else {
						setResult({type: 'ok'});
					}
				}
			})
			.catch(() => {
				setResult({type: 'fetch-error'});
			});
	}, [src]);

	if (result.type === 'loading') {
		return null;
	}

	if (result.type === 'not-found') {
		return (
			<div style={container}>
				The file <code style={codeStyle}>{src}</code> was not found (404).
				<br />
				If the file is in your <code style={codeStyle}>public/</code> folder,
				make sure to use{' '}
				<a
					style={linkStyle}
					href="https://remotion.dev/docs/staticfile"
					target="_blank"
				>
					<code style={codeStyle}>staticFile()</code>
				</a>{' '}
				to reference it.
				<br />
				<a
					style={linkStyle}
					href="https://remotion.dev/docs/media-playback-error"
					target="_blank"
				>
					Learn more
				</a>
			</div>
		);
	}

	if (result.type === 'other-error') {
		return (
			<div style={container}>
				⚠️ Fetching <code style={codeStyle}>{src}</code> returned status code{' '}
				{result.statusCode}.
				<br />
				<a
					style={linkStyle}
					href="https://remotion.dev/docs/media-playback-error"
					target="_blank"
				>
					Learn more
				</a>
			</div>
		);
	}

	if (result.type === 'wrong-content-type') {
		return (
			<div style={container}>
				⚠️ Fetching <code style={codeStyle}>{src}</code> returned a{' '}
				<code style={codeStyle}>{result.contentType}</code> content type.
				<br />👉 If the file is in your <code style={codeStyle}>
					public/
				</code>{' '}
				folder, make sure to use{' '}
				<a
					style={linkStyle}
					href="https://remotion.dev/docs/staticfile"
					target="_blank"
				>
					<code style={codeStyle}>staticFile()</code>
				</a>{' '}
				to reference it.
				<br />
				<a
					style={linkStyle}
					href="https://remotion.dev/docs/media-playback-error"
					target="_blank"
				>
					Learn more
				</a>
			</div>
		);
	}

	return null;
};
