import React, {useLayoutEffect, useRef, useState} from 'react';
import {
	BACKGROUND,
	BLACK_ALPHA_30,
	SHADOW_BLACK,
	WHITE,
} from '../helpers/colors';
import {HighestZIndexProvider} from '../state/highest-z-index';
import {
	getActiveStudioDialog,
	getDialogTabStops,
	openStudioDialog,
	StudioDialogContext,
} from '../state/studio-dialog';
import {HigherZIndex} from '../state/z-index';

const padding = 20;

export const getMaxModalWidth = (width: number) => {
	return `min(calc(100vw - ${padding * 2}px), calc(${width}px - ${
		padding * 2
	}px))`;
};

export const getMaxModalHeight = (height: number) => {
	return `min(calc(100vh - ${padding * 2}px), calc(${height}px - ${
		padding * 2
	}px))`;
};

const backgroundOverlay: React.CSSProperties = {
	backgroundColor: BLACK_ALPHA_30,
	position: 'fixed',
	height: '100%',
	width: '100%',
	display: 'flex',
	padding,
};

const panel: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	boxShadow: SHADOW_BLACK,
	color: WHITE,
	margin: 'auto',
};

const nativeOverlay: React.CSSProperties = {
	...backgroundOverlay,
	display: undefined,
	inset: 0,
	margin: 0,
	border: 0,
	boxSizing: 'border-box',
	maxHeight: 'none',
	maxWidth: 'none',
};

const stopPointerPropagation = (event: React.PointerEvent) =>
	event.stopPropagation();

type ModalContainerProps = {
	readonly ariaLabel?: string;
	readonly ariaLabelledBy?: string;
	readonly onEscape: () => void;
	readonly onOutsideClick: () => void;
	readonly children: React.ReactNode;
	readonly noZIndex?: boolean;
	readonly panelStyle?: React.CSSProperties;
};

const ModalPanel: React.FC<ModalContainerProps> = ({
	children,
	noZIndex,
	onOutsideClick,
	onEscape,
	panelStyle,
}) => (
	<HigherZIndex
		disabled={noZIndex}
		onOutsideClick={onOutsideClick}
		onEscape={onEscape}
	>
		<div style={{...panel, ...panelStyle}}>{children}</div>
	</HigherZIndex>
);

export const ModalDialog: React.FC<Omit<ModalContainerProps, 'noZIndex'>> = (
	props,
) => {
	const ref = useRef<HTMLDialogElement>(null);
	const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);

	useLayoutEffect(() => {
		const element = ref.current;
		if (!element) {
			return;
		}

		const doc = element.ownerDocument;
		const opener = doc.activeElement;
		const close = openStudioDialog(element);
		setDialog(element);
		queueMicrotask(() => {
			const {activeElement} = doc;
			if (
				getActiveStudioDialog() === element &&
				(activeElement === element || !element.contains(activeElement))
			) {
				getDialogTabStops(element)[0]?.focus({preventScroll: true});
			}
		});

		const onTab = (event: KeyboardEvent) => {
			if (
				event.key !== 'Tab' ||
				event.defaultPrevented ||
				event.altKey ||
				event.ctrlKey ||
				event.metaKey ||
				getActiveStudioDialog() !== element
			) {
				return;
			}

			const stops = getDialogTabStops(element);
			const first = stops[0];
			const last = stops[stops.length - 1];
			const focused = doc.activeElement;
			if (
				focused === (event.shiftKey ? first : last) ||
				focused === element ||
				!element.contains(focused)
			) {
				event.preventDefault();
				(event.shiftKey ? last : first)?.focus();
			}
		};

		doc.addEventListener('keydown', onTab);

		return () => {
			doc.removeEventListener('keydown', onTab);
			const wasActive = getActiveStudioDialog() === element;
			close();
			if (
				wasActive &&
				opener instanceof HTMLElement &&
				opener.isConnected &&
				doc.activeElement !== opener
			) {
				opener.focus({preventScroll: true});
			}
		};
	}, []);

	return (
		<dialog
			ref={ref}
			aria-label={props.ariaLabel}
			aria-labelledby={props.ariaLabelledBy}
			className="css-reset __remotion-modal-dialog"
			data-canvas-drop-occluder
			style={nativeOverlay}
			onPointerDown={stopPointerPropagation}
			onDrop={(event) => {
				event.preventDefault();
				event.stopPropagation();
			}}
			onCancel={(event) => {
				event.preventDefault();
				props.onEscape();
			}}
		>
			{dialog && (
				<StudioDialogContext.Provider value={dialog}>
					<HighestZIndexProvider>
						<ModalPanel {...props} />
					</HighestZIndexProvider>
				</StudioDialogContext.Provider>
			)}
		</dialog>
	);
};

export const ModalContainer: React.FC<ModalContainerProps> = (props) => (
	<div
		aria-label={props.ariaLabel}
		aria-labelledby={props.ariaLabelledBy}
		aria-modal="true"
		className="css-reset"
		role="dialog"
		style={backgroundOverlay}
		onPointerDown={stopPointerPropagation}
	>
		<ModalPanel {...props} />
	</div>
);
