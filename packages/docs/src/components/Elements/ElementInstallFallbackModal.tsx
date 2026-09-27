import type {StudioElementPayload} from '@remotion/studio-protocol';
import React, {type RefObject, useEffect, useId, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {ElementStudioAction} from './ElementStudioAction';
import styles from './ElementInstallFallbackModal.module.css';

export const ElementInstallFallbackModal: React.FC<{
	readonly installFailureCount: number;
	readonly isInstalling: boolean;
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly onInstall: () => void;
	readonly payload: StudioElementPayload;
	readonly posterRef: RefObject<HTMLImageElement | null>;
	readonly sourceCode: string;
}> = ({
	installFailureCount,
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
				if (event.target !== event.currentTarget) {
					return;
				}

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
						buttonLabel={installFailureCount > 1 ? 'Oops!' : 'Install'}
						loading={isInstalling}
						onClick={onInstall}
						payload={payload}
						posterRef={posterRef}
						showDragHandle
						title="Install in the most recently focused Remotion Studio"
					/>
					{installFailureCount > 1 ? (
						<div
							key={installFailureCount}
							aria-hidden="true"
							className={`${styles.dragCallout} ${
								installFailureCount > 2 ? styles.dragCalloutScale : ''
							}`}
						>
							<svg
								className={styles.dragCalloutLine}
								fill="none"
								viewBox="0 0 59 37"
							>
								<path
									d="M5 15C18 7.711 42 8 54 14"
									stroke="currentColor"
									strokeLinecap="round"
									strokeWidth="4"
								/>
							</svg>
							<span className={styles.dragCalloutLabel}>
								Drag into
								<br />
								Studio
							</span>
						</div>
					) : null}
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
