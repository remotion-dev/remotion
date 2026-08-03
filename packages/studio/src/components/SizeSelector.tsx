import React, {useContext, useMemo} from 'react';
import type {PreviewSize} from 'remotion';
import {Internals} from 'remotion';
import {WHITE_ALPHA_80} from '../helpers/colors';
import type {AssetFileType} from '../helpers/get-preview-file-type';
import {getPreviewFileType} from '../helpers/get-preview-file-type';
import {
	CanvasFitIcon,
	CanvasZoomIcon,
	CanvasZoomOutIcon,
} from '../icons/canvas-zoom';
import {Checkmark} from '../icons/Checkmark';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {TimelineCombobox} from './TimelineCombobox';

const commonPreviewSizes: PreviewSize[] = [
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

const zoomableFileTypes: AssetFileType[] = ['video', 'image'];

export const usePreviewSizeMenuItems = () => {
	const {size, setSize} = useContext(Internals.PreviewSizeContext);
	const {canvasContent} = useContext(Internals.CompositionManager);

	const zoomable = useMemo(() => {
		if (!canvasContent) {
			return null;
		}

		if (canvasContent.type === 'composition') {
			return true;
		}

		if (
			canvasContent.type === 'asset' &&
			zoomableFileTypes.includes(getPreviewFileType(canvasContent.asset))
		) {
			return true;
		}

		if (
			canvasContent.type === 'output' &&
			zoomableFileTypes.includes(getPreviewFileType(canvasContent.path))
		) {
			return true;
		}

		return false;
	}, [canvasContent]);

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
				keyHint: newSize.size === 'auto' ? '0' : null,
				leftItem:
					String(size.size) === String(newSize.size) ? <Checkmark /> : null,
				subMenu: null,
				quickSwitcherLabel: null,
			};
		});
	}, [setSize, size]);

	return {
		items,
		selectedId: String(size.size),
		zoomable,
	};
};

export const SizeSelector: React.FC = () => {
	const {items, selectedId, zoomable} = usePreviewSizeMenuItems();

	if (!zoomable) {
		return null;
	}

	return (
		<TimelineCombobox
			title={accessibilityLabel}
			selectedId={selectedId}
			values={items}
			renderLeftItem={(color) =>
				selectedId === 'auto' ? (
					<CanvasFitIcon color={color} />
				) : Number(selectedId) < 1 ? (
					<CanvasZoomOutIcon color={color} />
				) : (
					<CanvasZoomIcon color={color} />
				)
			}
			unhoveredIconColor={WHITE_ALPHA_80}
		/>
	);
};
