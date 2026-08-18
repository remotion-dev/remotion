import {Button, Button as RemotionButton} from '@remotion/design';
import React, {useCallback, useState} from 'react';
import type {ConvertState, Source} from '~/lib/convert-state';
import {getMediabunnyOutput} from '~/lib/output-container';
import type {OutputContainer} from '~/seo';
import {ClipboardIcon} from './icons/ClipboardIcon';
import {CloneIcon} from './icons/clone';
import {UndoIcon} from './icons/undo';

export const ConversionDone: React.FC<{
	readonly container: OutputContainer;
	readonly state: ConvertState;
	readonly setState: React.Dispatch<React.SetStateAction<ConvertState>>;
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
}> = ({container, state, setState, setSrc}) => {
	const [copied, setCopied] = useState(false);
	const {mimeType} = getMediabunnyOutput(container);
	const canCopyToClipboard =
		typeof navigator !== 'undefined' &&
		typeof navigator.clipboard?.write === 'function' &&
		typeof ClipboardItem !== 'undefined' &&
		typeof ClipboardItem.supports === 'function' &&
		ClipboardItem.supports(mimeType);

	if (state.type !== 'done') {
		throw new Error('Expected state to be done');
	}

	const onDownload = useCallback(async () => {
		try {
			const file = await state.download();
			const a = document.createElement('a');
			a.href = URL.createObjectURL(file);
			a.download = state.newName;
			a.click();
			URL.revokeObjectURL(a.href);
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
			setState({type: 'error', error: e as Error});
		}
	}, [setState, state]);

	const onCopy = useCallback(async () => {
		try {
			const file = await state.download();
			await navigator.clipboard.write([
				new ClipboardItem({
					[mimeType]: file,
				}),
			]);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
			setState({type: 'error', error: e as Error});
		}
	}, [mimeType, setState, state]);

	const useAsInput = useCallback(async () => {
		const file = await state.download();

		setSrc({
			type: 'file',
			file,
		});
	}, [setSrc, state]);

	const startOver = useCallback(() => {
		setState({type: 'idle'});
	}, [setState]);

	return (
		<>
			<RemotionButton className="block w-full" onClick={onDownload}>
				Download
			</RemotionButton>
			<div className="h-2" />
			<div className="flex flex-row gap-2">
				{canCopyToClipboard ? (
					<Button
						className="w-full flex-1 flex-row justify-start rounded-full text-sm h-10"
						type="button"
						onClick={onCopy}
						depth={0.2}
					>
						<ClipboardIcon size={16} />
						<div className="w-2" />
						{copied ? 'Copied!' : 'Copy to clipboard'}
					</Button>
				) : null}
				<Button
					className="w-full flex-1 flex-row justify-start rounded-full text-sm h-10"
					type="button"
					onClick={useAsInput}
					depth={0.2}
				>
					<CloneIcon className="size-4" />
					<div className="w-2" />
					Use as input
				</Button>
				<Button
					className="w-full flex-1 flex-row justify-start rounded-full text-sm h-10"
					type="button"
					onClick={startOver}
					depth={0.2}
				>
					<UndoIcon className="size-4" />
					<div className="w-2" />
					Start over
				</Button>
			</div>
		</>
	);
};
