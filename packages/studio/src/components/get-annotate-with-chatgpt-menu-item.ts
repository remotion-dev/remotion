import {getCodexAnnotation} from '../helpers/get-codex-annotation';
import {requestCodexAnnotation} from '../helpers/request-codex-annotation';
import type {ComboboxValue} from './NewComposition/ComboBox';

export const getAnnotateWithChatGPTMenuItems = ({
	id,
	getTarget,
	initialComment,
	metadata,
}: {
	readonly id: string;
	readonly getTarget: () => Element | null;
	readonly initialComment: string | null;
	readonly metadata: Record<string, string | number>;
}): ComboboxValue[] => {
	if (window.remotion_isReadOnlyStudio || getCodexAnnotation() === null) {
		return [];
	}

	return [
		{
			type: 'item',
			id,
			keyHint: null,
			label: 'Annotate with ChatGPT',
			leftItem: null,
			disabled: false,
			onClick: () => {
				requestCodexAnnotation({target: getTarget(), initialComment, metadata});
			},
			quickSwitcherLabel: null,
			subMenu: null,
			value: id,
		},
	];
};
