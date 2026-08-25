import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import ModelSelector from '../app/components/transcribe/modelSelector';

afterEach(() => cleanup());

test('offers WebGPU model downloads without a WASM alternative', () => {
	const rendered = render(
		<ModelSelector
			selectedModel="tiny.en"
			setSelectedModel={() => undefined}
			disabled={false}
		/>,
	);

	const model = rendered.getByRole('combobox', {name: 'Whisper model'});
	expect(model.textContent).toContain('119.7 MB WebGPU');
	expect(model.textContent).not.toContain('WASM');
});
