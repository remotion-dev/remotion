import type {ConvertMediaContainer} from '@remotion/webcodecs';
import React, {useCallback} from 'react';
import {canUseOutputAsInput} from '~/lib/can-use-output-as-input';
import type {ConvertState, Source} from '~/lib/convert-state';
import {getNewName} from '~/lib/generate-new-name';
import {CloneIcon} from './icons/clone';
import {UndoIcon} from './icons/undo';
import {Button} from './ui/button';

export const ConversionDone: React.FC<{
	readonly state: ConvertState;
	readonly setState: React.Dispatch<React.SetStateAction<ConvertState>>;
	readonly name: string | null;
	readonly container: ConvertMediaContainer;
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
}> = ({state, name, container, setState, setSrc}) => {
	if (state.type !== 'done') {
		throw new Error('Expected state to be done');
	}

	const onDownload = useCallback(async () => {
		if (!name) {
			throw new Error('Expected name to be set');
		}

		try {
			const file = await state.download();
			const a = document.createElement('a');
			a.href = URL.createObjectURL(file);
			a.download = getNewName(name, container);
			a.click();
			URL.revokeObjectURL(a.href);
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
			setState({type: 'error', error: e as Error});
		}
	}, [container, name, setState, state]);

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
			<Button className="block w-full" type="button" onClick={onDownload}>
				Download
			</Button>
			{canUseOutputAsInput(container) ? (
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
						Use new video as input
					</Button>
				</>
			) : null}
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
