import {PreviewSize} from '@remotion/player';
import React, {useContext, useMemo} from 'react';
import {
	persistPreviewSizeOption,
	PreviewSizeContext,
} from '../state/preview-size';
import {CONTROL_BUTTON_PADDING} from './ControlButton';
import {Combobox, ComboboxValue} from './NewComposition/ComboBox';

const sizes: PreviewSize[] = ['auto', 0.25, 0.5, 1];

const getLabel = (previewSize: PreviewSize) => {
	if (previewSize === 1) {
		return '100%';
	}

	if (previewSize === 0.5) {
		return '50%';
	}

	if (previewSize === 0.25) {
		return '25%';
	}

	if (previewSize === 'auto') {
		return 'Fit';
	}
};

export const SizeSelector: React.FC = () => {
	const {size, setSize} = useContext(PreviewSizeContext);

	const style = useMemo(() => {
		return {
			padding: CONTROL_BUTTON_PADDING,
		};
	}, []);

	const items: ComboboxValue[] = useMemo(() => {
		return sizes.map(
			(newSize): ComboboxValue => {
				return {
					id: String(newSize),
					label: getLabel(newSize),
					onClick: () =>
						setSize(() => {
							persistPreviewSizeOption(newSize);
							return newSize;
						}),
					type: 'item',
					value: newSize,
					keyHint: null,
					leftItem: null,
				};
			}
		);
	}, [setSize]);

	return (
		<div style={style} aria-label="Select the size of the preview">
			<Combobox selectedId={String(size)} values={items} />
		</div>
	);
};
