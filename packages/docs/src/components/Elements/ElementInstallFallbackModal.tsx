import type {StudioElementPayload} from '@remotion/studio-protocol';
import React, {type RefObject, useEffect, useId, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {ElementStudioAction} from './ElementStudioAction';
import styles from './ElementInstallFallbackModal.module.css';

export const ElementInstallFallbackModal: React.FC<{
	readonly isInstalling: boolean;
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly onInstall: () => void;
	readonly payload: StudioElementPayload;
	readonly posterRef: RefObject<HTMLImageElement | null>;
	readonly sourceCode: string;
}> = ({
	isInstalling,
	isOpen,
	onClose,
	onInstall,
	payload,
	posterRef,
	sourceCode,
}) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [hasCopied, setHasCopied] = useState(false);
	const titleId = useId();

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}

		dialog.showModal();
		return () => {
			if (dialog.open) {
				dialog.close();
			}
		};
	}, [isOpen]);

	useEffect(() => {
		if (!hasCopied) {
			return;
		}

		const timeout = window.setTimeout(() => setHasCopied(false), 2000);
		return () => window.clearTimeout(timeout);
	}, [hasCopied]);

	if (!isOpen) {
		return null;
	}

	return createPortal(
		<dialog
			ref={dialogRef}
			aria-labelledby={titleId}
			className={styles.dialog}
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
			onClick={(event) => {
				const bounds = event.currentTarget.getBoundingClientRect();
				const clickedOutside =
					event.clientX < bounds.left ||
					event.clientX > bounds.right ||
					event.clientY < bounds.top ||
					event.clientY > bounds.bottom;

				if (clickedOutside) {
					onClose();
				}
			}}
		>
			<div className={styles.content}>
				<button
					aria-label="Close"
					className={styles.closeButton}
					onClick={onClose}
					type="button"
				>
					×
				</button>
				<h3 className={styles.title} id={titleId}>
					Use this element
				</h3>
				<p className={styles.description}>
					Open a Remotion Studio and click below to import the Element.
				</p>
				<div className={styles.installAction}>
					<ElementStudioAction
						buttonLabel="Install"
						loading={isInstalling}
						onClick={onInstall}
						payload={payload}
						posterRef={posterRef}
						showDragHandle
						title="Install in the most recently focused Remotion Studio"
					/>
				</div>
				<p className={styles.hint}>
					Not working? Drag the button into your Studio instead.
				</p>
				<p className={styles.copyHint}>
					You can also{' '}
					<button
						className={styles.copyButton}
						onClick={async () => {
							await navigator.clipboard.writeText(sourceCode);
							setHasCopied(true);
						}}
						type="button"
					>
						copy the code
					</button>{' '}
					and create a new file.
					<span aria-live="polite">{hasCopied ? ' Copied.' : null}</span>
				</p>
			</div>
		</dialog>,
		document.body,
	);
};
