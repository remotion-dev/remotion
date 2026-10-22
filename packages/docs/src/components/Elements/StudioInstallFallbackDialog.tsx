import React, {useId, useLayoutEffect, useRef, type RefObject} from 'react';
import {createPortal} from 'react-dom';
import styles from './StudioInstallFallbackDialog.module.css';

export const StudioInstallFallbackDialog: React.FC<{
	readonly children: React.ReactNode;
	readonly contentClassName: string;
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly title: string;
	readonly titleClassName: string | null;
	readonly triggerRef: RefObject<HTMLElement | null>;
}> = ({
	children,
	contentClassName,
	isOpen,
	onClose,
	title,
	titleClassName,
	triggerRef,
}) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleId = useId();

	useLayoutEffect(() => {
		if (!isOpen) {
			return;
		}

		const dialog = dialogRef.current;
		const trigger = triggerRef.current;
		if (!dialog) {
			return;
		}

		dialog.showModal();
		return () => {
			if (dialog.open) {
				dialog.close();
			}

			// A successful retry re-enables the trigger in the same commit.
			window.requestAnimationFrame(() => {
				if (trigger?.isConnected && !dialog.open) {
					trigger.focus();
				}
			});
		};
	}, [isOpen, triggerRef]);

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
				if (
					event.clientX < bounds.left ||
					event.clientX > bounds.right ||
					event.clientY < bounds.top ||
					event.clientY > bounds.bottom
				) {
					onClose();
				}
			}}
		>
			<div className={`${styles.content} ${contentClassName}`}>
				<button
					aria-label="Close"
					className={styles.closeButton}
					onClick={onClose}
					type="button"
				>
					×
				</button>
				<h3
					className={[styles.title, titleClassName].filter(Boolean).join(' ')}
					id={titleId}
				>
					{title}
				</h3>
				{children}
			</div>
		</dialog>,
		document.body,
	);
};
