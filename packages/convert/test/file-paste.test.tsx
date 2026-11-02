import {afterEach, expect, test} from 'bun:test';
import {cleanup, fireEvent, render} from '@testing-library/react';
import {useState} from 'react';
import {ReplaceVideo} from '../app/components/ReplaceVideo';
import {earlyFileDropScript} from '../app/lib/early-file-drop';
import type {Source} from '../app/lib/convert-state';

afterEach(() => {
	cleanup();
	window.remotionEarlyFileDrop?.stop();
	window.remotionEarlyFileDrop = null;
});

test('accepts early drops, drops over children, and pastes with replacement confirmation', () => {
	const firstFile = new File(['first'], 'first.mp4', {type: 'video/mp4'});
	const secondFile = new File(['second'], 'second.mov', {
		type: 'video/quicktime',
	});

	// Run the same bootstrap embedded in the document before React hydrates.
	window.eval(earlyFileDropScript);
	expect(fireEvent.dragOver(document, {dataTransfer: {types: ['Files']}})).toBe(
		false,
	);
	expect(fireEvent.drop(document, {dataTransfer: {files: [firstFile]}})).toBe(
		false,
	);

	const ConvertWithPaste = () => {
		const [src, setSrc] = useState<Source | null>(null);

		return (
			<>
				<button type="button">
					<span>Drop target</span>
				</button>
				<div>{src?.type === 'file' ? src.file.name : 'No file selected'}</div>
				<ReplaceVideo src={src} setSrc={setSrc} />
			</>
		);
	};

	const rendered = render(<ConvertWithPaste />);

	expect(rendered.getByText('first.mp4')).not.toBeNull();
	expect(window.remotionEarlyFileDrop).toBeNull();
	// The document capture listener must still work over nested controls.
	const target = rendered.getByText('Drop target');
	expect(
		fireEvent.dragOver(target, {dataTransfer: {types: ['text/plain']}}),
	).toBe(true);
	expect(fireEvent.dragOver(target, {dataTransfer: {types: ['Files']}})).toBe(
		false,
	);
	expect(fireEvent.drop(target, {dataTransfer: {files: [secondFile]}})).toBe(
		false,
	);
	expect(rendered.getByText('Replace video?')).not.toBeNull();
	// Further drops while confirming must not navigate or replace the candidate.
	expect(fireEvent.dragOver(document, {dataTransfer: {types: ['Files']}})).toBe(
		false,
	);
	expect(fireEvent.drop(document, {dataTransfer: {files: [firstFile]}})).toBe(
		false,
	);
	fireEvent.click(rendered.getByRole('button', {name: 'Keep current video'}));

	fireEvent.paste(document, {clipboardData: {files: [secondFile]}});
	expect(rendered.getByText('Replace video?')).not.toBeNull();
	expect(rendered.getByText('first.mp4')).not.toBeNull();

	fireEvent.click(rendered.getByRole('button', {name: 'Replace video'}));
	expect(rendered.getByText('second.mov')).not.toBeNull();
});
