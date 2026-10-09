import type {AddElementLibraryToStudioErrorCode} from '@remotion/studio-protocol';
import React, {
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
	type RefObject,
} from 'react';
import {createPortal} from 'react-dom';
import {BlueButton} from '../../../components/layout/Button';
import type {ThirdPartyElementLibrary} from './third-party-element-library-data';
import styles from './ElementLibraryInstallFallbackModal.module.css';

export const ElementLibraryInstallFallbackModal: React.FC<{
	readonly buttonLabel: string;
	readonly library: ThirdPartyElementLibrary;
	readonly failure: {
		readonly code: AddElementLibraryToStudioErrorCode | null;
		readonly message: string;
	} | null;
	readonly isAdding: boolean;
	readonly onClose: () => void;
	readonly onAdd: () => void;
	readonly triggerRef: RefObject<HTMLButtonElement | null>;
}> = ({
	buttonLabel,
	library,
	failure,
	isAdding,
	onClose,
	onAdd,
	triggerRef,
}) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const titleId = useId();
	const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>(
		'idle',
	);

	useLayoutEffect(() => {
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
				if (trigger?.isConnected) {
					trigger.focus();
				}
			});
		};
	}, [triggerRef]);

	useEffect(() => {
		if (copyState !== 'copied') {
			return;
		}

		const timeout = window.setTimeout(() => setCopyState('idle'), 2000);
		return () => window.clearTimeout(timeout);
	}, [copyState]);

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
					Add {library.displayName} to Studio
				</h3>
				<div aria-live="polite" className={styles.description}>
					{isAdding ? (
						<p>Finding a compatible Remotion Studio…</p>
					) : failure?.code === 'no-compatible-studio' ? (
						<p>
							<a href="/docs/studio" target="_blank" rel="noreferrer">
								Open a Remotion Studio
							</a>
							, then try again.
						</p>
					) : failure?.code === 'no-configurable-target' ? (
						<p>Focus your Remotion Studio tab, then try again.</p>
					) : failure?.code === 'studio-upgrade-required' ? (
						<p>
							{failure.message}{' '}
							<a href="/docs/upgrading" target="_blank" rel="noreferrer">
								How to upgrade Remotion.
							</a>
						</p>
					) : (
						<p>{failure?.message}</p>
					)}
				</div>
				<BlueButton fullWidth loading={isAdding} onClick={onAdd} size="sm">
					{buttonLabel}
				</BlueButton>
				<h4 className={styles.manualTitle}>Add manually</h4>
				<p className={styles.instructions}>
					In your local Studio, open <strong>Settings</strong>, select{' '}
					<strong>Elements</strong>, then choose <strong>Add by URL</strong> and
					paste this URL:
				</p>
				<div className={styles.urlField}>
					<input
						aria-label={`${library.displayName} library URL`}
						className={styles.url}
						onFocus={(event) => event.currentTarget.select()}
						readOnly
						value={library.libraryUrl}
					/>
					<button
						aria-label="Copy URL"
						className={styles.copyButton}
						onClick={async () => {
							try {
								await navigator.clipboard.writeText(library.libraryUrl);
								setCopyState('copied');
							} catch {
								setCopyState('error');
							}
						}}
						title="Copy URL"
						type="button"
					>
						<svg
							aria-hidden="true"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							{copyState === 'copied' ? (
								<path d="m5 12 4 4L19 6" />
							) : (
								<>
									<rect x="9" y="9" width="13" height="13" rx="2" />
									<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
								</>
							)}
						</svg>
					</button>
				</div>
				<p aria-live="polite" className={styles.copyStatus}>
					{copyState === 'copied'
						? 'Copied.'
						: copyState === 'error'
							? 'Could not copy. Select the URL above and copy it manually.'
							: null}
				</p>
				<p className={styles.configHint}>
					Then click <strong>+ Add Element Library</strong> in Studio.
				</p>
				<p className={styles.configHint}>
					You can also add this URL to <code>remotion.config.ts</code> using{' '}
					<a
						href="/docs/config#addelementlibrary"
						target="_blank"
						rel="noreferrer"
					>
						<code>Config.addElementLibrary()</code>
					</a>
					.
				</p>
			</div>
		</dialog>,
		document.body,
	);
};
