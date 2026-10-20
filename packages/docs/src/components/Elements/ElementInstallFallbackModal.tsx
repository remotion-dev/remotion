import Link from '@docusaurus/Link';
import React, {type RefObject, useEffect, useState} from 'react';
import type {ElementDefinition} from './element-definitions';
import {ElementStudioAction} from './ElementStudioAction';
import {StudioInstallFallbackDialog} from './StudioInstallFallbackDialog';
import styles from './ElementInstallFallbackModal.module.css';

export const ElementInstallFallbackModal: React.FC<{
	readonly buttonLabel: string;
	readonly definition: ElementDefinition;
	readonly installFailureCount: number;
	readonly isInstalling: boolean;
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly onInstall: () => void;
	readonly posterRef: RefObject<HTMLImageElement | null>;
	readonly sourceCode: string;
	readonly triggerRef: RefObject<HTMLElement | null>;
}> = ({
	buttonLabel,
	definition,
	installFailureCount,
	isInstalling,
	isOpen,
	onClose,
	onInstall,
	posterRef,
	sourceCode,
	triggerRef,
}) => {
	const [hasCopied, setHasCopied] = useState(false);

	useEffect(() => {
		if (!hasCopied) {
			return;
		}

		const timeout = window.setTimeout(() => setHasCopied(false), 2000);
		return () => window.clearTimeout(timeout);
	}, [hasCopied]);

	return (
		<StudioInstallFallbackDialog
			contentClassName={styles.content}
			isOpen={isOpen}
			onClose={onClose}
			title="Use this element"
			titleClassName={null}
			triggerRef={triggerRef}
		>
			<p className={styles.description}>
				<Link to="/docs/studio/" target="_blank" rel="noreferrer">
					Open a Remotion Studio
				</Link>
				, then click below.
			</p>
			<div className={styles.installAction}>
				<ElementStudioAction
					buttonLabel={buttonLabel}
					definition={definition}
					loading={isInstalling}
					onClick={onInstall}
					posterRef={posterRef}
					showDragHandle
					sourceCode={sourceCode}
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
		</StudioInstallFallbackDialog>
	);
};
