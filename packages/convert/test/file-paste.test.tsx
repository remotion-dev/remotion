import {afterEach, expect, test} from 'bun:test';
import {cleanup, fireEvent, render} from '@testing-library/react';
import {useState} from 'react';
import {ReplaceVideo} from '../app/components/ReplaceVideo';
import type {Source} from '../app/lib/convert-state';

afterEach(() => {
	cleanup();
});

test('pastes files and asks before replacing the current file', () => {
	const firstFile = new File(['first'], 'first.mp4', {type: 'video/mp4'});
	const secondFile = new File(['second'], 'second.mov', {
		type: 'video/quicktime',
	});

	const ConvertWithPaste = () => {
		const [src, setSrc] = useState<Source | null>(null);

		return (
			<>
				<div>{src?.type === 'file' ? src.file.name : 'No file selected'}</div>
				<ReplaceVideo src={src} setSrc={setSrc} />
			</>
		);
	};

	const rendered = render(<ConvertWithPaste />);

	fireEvent.paste(document, {clipboardData: {files: [firstFile]}});
	expect(rendered.getByText('first.mp4')).not.toBeNull();

	fireEvent.paste(document, {clipboardData: {files: [secondFile]}});
	expect(rendered.getByText('Replace video?')).not.toBeNull();
	expect(rendered.getByText('first.mp4')).not.toBeNull();

	fireEvent.click(rendered.getByRole('button', {name: 'Replace video'}));
	expect(rendered.getByText('second.mov')).not.toBeNull();
});
