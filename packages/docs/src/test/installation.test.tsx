import {expect, mock, test} from 'bun:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

mock.module('@theme/CodeBlock', () => ({
	default: ({children}: {children: React.ReactNode}) => <pre>{children}</pre>,
}));
mock.module('@theme/TabItem', () => ({
	default: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));
mock.module('@theme/Tabs', () => ({
	default: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

test('pins auxiliary packages in every installation command', async () => {
	const {Installation} = await import('../../components/Installation');
	const markup = renderToStaticMarkup(
		<Installation pkg="@remotion/whisper-webgpu @huggingface/transformers" />,
	);

	expect(markup).toContain(
		'npx remotion add @remotion/whisper-webgpu @huggingface/transformers',
	);
	expect(markup).toContain('@huggingface/transformers@4.2.0');
});
