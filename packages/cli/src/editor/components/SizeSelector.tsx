import type {PreviewSize} from '@remotion/player';
import React, {useContext, useMemo} from 'react';
import {Checkmark} from '../icons/Checkmark';
import {PreviewSizeContext} from '../state/preview-size';
import {CONTROL_BUTTON_PADDING} from './ControlButton';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {Combobox} from './NewComposition/ComboBox';

export const commonPreviewSizes: PreviewSize[] = [
	{
		size: 'auto',
		translation: {
			x: 0,
			y: 0,
		},
	},
	{
		size: 0.25,
		translation: {
			x: 0,
			y: 0,
		},
	},
	{
		size: 0.5,
		translation: {
			x: 0,
			y: 0,
		},
	},
	{
		size: 1,
		translation: {
			x: 0,
			y: 0,
		},
	},
];

export const getPreviewSizeLabel = (previewSize: PreviewSize) => {
	if (previewSize.size === 'auto') {
		return 'Fit';
	}

	return `${(previewSize.size * 100).toFixed(0)}%`;
};

const accessibilityLabel = 'Preview Size';

const comboStyle: React.CSSProperties = {width: 80};

export const getUniqueSizes = (size: PreviewSize) => {
	const customPreviewSizes = [size, ...commonPreviewSizes];
	const uniqueSizes: PreviewSize[] = [];

	customPreviewSizes.forEach((p) => {
		if (!uniqueSizes.find((s) => s.size === p.size)) {
			uniqueSizes.push(p);
		}
	});

	return uniqueSizes.sort((a, b) => {
		if (a.size === 'auto') {
			return -1;
		}

		if (b.size === 'auto') {
			return 1;
		}

		return a.size - b.size;
	});
};

export const SizeSelector: React.FC = () => {
	const {size, setSize} = useContext(PreviewSizeContext);

	const style = useMemo(() => {
		return {
			padding: CONTROL_BUTTON_PADDING,
		};
	}, []);

	const items: ComboboxValue[] = useMemo(() => {
		return getUniqueSizes(size).map((newSize): ComboboxValue => {
			return {
				id: String(newSize.size),
				label: getPreviewSizeLabel(newSize),
				onClick: () => {
					return setSize(() => {
						return newSize;
					});
				},
				type: 'item',
				value: newSize.size,
				keyHint: newSize.size === 1 ? '0' : null,
				leftItem:
					String(size.size) === String(newSize.size) ? <Checkmark /> : null,
				subMenu: null,
			};
		});
	}, [setSize, size]);

	return (
		<div style={style} aria-label={accessibilityLabel}>
			<Combobox
				title={accessibilityLabel}
				style={comboStyle}
				selectedId={String(size.size)}
				values={items}
			/>
		</div>
	);
};
