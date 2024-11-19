import {Internals} from 'remotion';
import type {UpdateDefaultPropsFunction} from './helpers/calc-new-props';
import {calcNewProps} from './helpers/calc-new-props';

export const updateDefaultProps = ({
	compositionId,
	defaultProps,
}: {
	compositionId: string;
	defaultProps: UpdateDefaultPropsFunction;
}) => {
	const {generatedDefaultProps, composition} = calcNewProps(
		compositionId,
		defaultProps,
	);

	const propsStore = Internals.editorPropsProviderRef.current;
	if (!propsStore) {
		throw new Error(
			'No props store found. Are you in the Remotion Studio and are the Remotion versions aligned?',
		);
	}

	propsStore.setProps((prev) => {
		return {
			...prev,
			[composition.id]: generatedDefaultProps,
		};
	});

	window.dispatchEvent(
		new CustomEvent<{resetUnsaved: boolean}>(
			Internals.PROPS_UPDATED_EXTERNALLY,
			{
				detail: {
					resetUnsaved: false,
				},
			},
		),
	);
};
