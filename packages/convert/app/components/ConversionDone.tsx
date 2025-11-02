import {Button as RemotionButton} from '@remotion/design';
import React, {useCallback} from 'react';
import type {ConvertState, Source} from '~/lib/convert-state';
import {CloneIcon} from './icons/clone';
import {UndoIcon} from './icons/undo';
import {Button} from './ui/button';

export const ConversionDone: React.FC<{
	readonly state: ConvertState;
	readonly setState: React.Dispatch<React.SetStateAction<ConvertState>>;
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
}> = ({state, setState, setSrc}) => {
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
			<>
				<div className="h-2" />
				<Button
					variant="ghost"
					className="w-full flex flex-row justify-start"
					type="button"
					onClick={useAsInput}
				>
					<CloneIcon className="size-4" />
					<div className="w-2" />
					Use as input
				</Button>
			</>
			<Button
				variant="ghost"
				className="w-full flex flex-row justify-start"
				type="button"
				onClick={startOver}
			>
				<UndoIcon className="size-4" />
				<div className="w-2" />
				Start over
			</Button>
		</>
	);
};
