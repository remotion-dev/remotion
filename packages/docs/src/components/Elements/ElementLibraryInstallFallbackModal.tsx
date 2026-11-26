import type {AddElementLibraryToStudioErrorCode} from '@remotion/studio-protocol';
import React, {type RefObject} from 'react';
import {BlueButton} from '../../../components/layout/Button';
import type {ElementLibraryEntry} from './element-libraries-data';
import {
	CopyField,
	StudioFallbackAlternatives,
} from './StudioFallbackAlternatives';
import {StudioInstallFallbackDialog} from './StudioInstallFallbackDialog';
import styles from './ElementLibraryInstallFallbackModal.module.css';

export const ElementLibraryInstallFallbackModal: React.FC<{
	readonly buttonLabel: string;
	readonly library: ElementLibraryEntry;
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
	return (
		<StudioInstallFallbackDialog
			contentClassName={styles.content}
			isOpen
			onClose={onClose}
			title={`Add ${library.displayName} to Studio`}
			titleClassName={styles.title}
			triggerRef={triggerRef}
		>
			<StudioFallbackAlternatives
				agentPrompt={`Add the ${library.displayName} Element library from ${library.libraryUrl}`}
				cliCommand={`npx remotion elements add-library ${library.libraryUrl}`}
			>
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
				<p className={styles.manualTitle}>Or add it manually:</p>
				<p className={styles.instructions}>
					In your local Studio, open <strong>Settings</strong>, select{' '}
					<strong>Elements</strong>, then choose <strong>Add by URL</strong> and
					paste this URL:
				</p>
				<CopyField label="URL" value={library.libraryUrl} />
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
			</StudioFallbackAlternatives>
		</StudioInstallFallbackDialog>
	);
};
