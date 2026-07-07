import {Button, Button as RemotionButton} from '@remotion/design';
import React, {useCallback, useState} from 'react';
import type {ConvertState, Source} from '~/lib/convert-state';
import type {StudioBridgeSession} from '~/lib/studio-bridge';
import {saveFileToStudio} from '~/lib/studio-bridge';
import {CloneIcon} from './icons/clone';
import {UndoIcon} from './icons/undo';

export const ConversionDone: React.FC<{
	readonly state: ConvertState;
	readonly setState: React.Dispatch<React.SetStateAction<ConvertState>>;
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
	readonly studioBridgeSession: StudioBridgeSession | null;
}> = ({state, setState, setSrc, studioBridgeSession}) => {
	if (state.type !== 'done') {
		throw new Error('Expected state to be done');
	}

	const [saveToStudioState, setSaveToStudioState] = useState<
		| {
				type: 'idle';
		  }
		| {
				type: 'saving';
		  }
		| {
				type: 'saved';
				filename: string;
		  }
		| {
				type: 'error';
				message: string;
		  }
	>({type: 'idle'});

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

	const onSaveToStudio = useCallback(async () => {
		if (!studioBridgeSession) {
			return;
		}

		setSaveToStudioState({type: 'saving'});
		try {
			const file = await state.download();
			const filename = await saveFileToStudio({
				file,
				filename: state.newName,
				session: studioBridgeSession,
			});
			setSaveToStudioState({type: 'saved', filename});
		} catch (err) {
			setSaveToStudioState({
				type: 'error',
				message: (err as Error).message,
			});
		}
	}, [state, studioBridgeSession]);

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
			{studioBridgeSession ? (
				<>
					<RemotionButton
						className="block w-full"
						onClick={onSaveToStudio}
						disabled={saveToStudioState.type === 'saving'}
					>
						{saveToStudioState.type === 'saving'
							? 'Saving to Studio...'
							: saveToStudioState.type === 'saved'
								? 'Saved to Studio'
								: 'Save to Studio'}
					</RemotionButton>
					{saveToStudioState.type === 'error' ? (
						<div className="text-sm text-red-600 mt-2">
							{saveToStudioState.message}
						</div>
					) : null}
					<div className="h-2" />
				</>
			) : null}
			<RemotionButton className="block w-full" onClick={onDownload}>
				Download
			</RemotionButton>
			<div className="h-2" />
			<div className="flex flex-row gap-2">
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
