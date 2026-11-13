import {
	normalizeHttpUrl,
	type StudioElementLibrary,
} from '@remotion/studio-shared';
import React, {useCallback, useContext, useState} from 'react';
import {createPortal} from 'react-dom';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT} from '../helpers/colors';
import {getElementLibraryLabel} from '../helpers/get-element-library-label';
import {canEditStudioConfig} from '../helpers/settings-tab-availability';
import {SetSelectedModalContext} from '../state/modals';
import {useZIndex} from '../state/z-index';
import {Button} from './Button';
import {Row, Spacing} from './layout';
import {getPortal} from './Menu/portals';
import {ModalButton} from './ModalButton';
import {ModalContainer} from './ModalContainer';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {RemotionInput} from './NewComposition/RemInput';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {useSettings} from './SettingsContext';

const panel: React.CSSProperties = {
	width: 'min(480px, calc(100vw - 40px))',
};

const fields: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 12,
	padding: 16,
};

const fieldLabel: React.CSSProperties = {
	color: LIGHT_TEXT,
	display: 'block',
	fontSize: 13,
	marginBottom: 6,
};

const footer: React.CSSProperties = {
	minWidth: 0,
};

export const ElementLibraryDialog: React.FC<{
	readonly library: StudioElementLibrary | null;
	readonly onClose: () => void;
}> = ({library, onClose}) => {
	const [url, setUrl] = useState(library?.url ?? '');
	const [displayName, setDisplayName] = useState(library?.displayName ?? '');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const {currentZIndex} = useZIndex();
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const {studioRuntimeConfig, addElementLibrary, updateElementLibrary} =
		useSettings();
	const normalizedUrl = normalizeHttpUrl(url.trim());
	const normalizedName = displayName.trim() || null;
	const duplicate =
		!busy &&
		(studioRuntimeConfig?.elementLibraries.some(
			(entry) => entry.url !== library?.url && entry.url === normalizedUrl,
		) ??
			false);
	const validationError = duplicate
		? 'This library is already added.'
		: url.trim() && normalizedUrl === null
			? 'Enter an HTTP or HTTPS URL.'
			: null;
	const changed =
		library === null ||
		normalizedUrl !== library.url ||
		normalizedName !== library.displayName;
	const canSave =
		!busy &&
		normalizedUrl !== null &&
		!duplicate &&
		changed &&
		canEditStudioConfig({
			isBrowserStudio: getBrowserStudioOperations() !== null,
			previewServerConnected: previewServerState.type === 'connected',
			readOnlyStudio: window.remotion_isReadOnlyStudio,
		});
	const close = useCallback(() => {
		if (!busy) onClose();
	}, [busy, onClose]);
	const save = useCallback(async () => {
		if (!canSave || normalizedUrl === null) return;
		const updated = {
			url: normalizedUrl,
			displayName: normalizedName,
			captionStylesUrl: library?.captionStylesUrl ?? null,
		};
		setBusy(true);
		setError(null);
		const saving =
			library === null
				? addElementLibrary(updated)
				: updateElementLibrary(library.url, updated);
		if (library !== null) {
			setSelectedModal((current) =>
				current?.type === 'element-library' && current.url === library.url
					? {
							...current,
							url: updated.url,
							name: getElementLibraryLabel(updated),
						}
					: current,
			);
		}

		const success = await saving;
		if (success) {
			onClose();
			return;
		}

		if (library !== null) {
			setSelectedModal((current) =>
				current?.type === 'element-library' && current.url === updated.url
					? {
							...current,
							url: library.url,
							name: getElementLibraryLabel(library),
						}
					: current,
			);
		}

		setBusy(false);
		setError('Could not save the library. Please try again.');
	}, [
		addElementLibrary,
		canSave,
		library,
		normalizedName,
		normalizedUrl,
		onClose,
		setSelectedModal,
		updateElementLibrary,
	]);

	return createPortal(
		<ModalContainer
			ariaLabel={
				library === null ? 'Add Element Library' : 'Edit Element Library'
			}
			onEscape={close}
			onOutsideClick={close}
			panelStyle={panel}
		>
			<div
				onKeyDown={(event) => {
					if (event.key !== 'Tab') return;
					const focusable = [
						...event.currentTarget.querySelectorAll<HTMLElement>(
							'button, input',
						),
					].filter(
						(element) =>
							!element.matches(':disabled') &&
							element.getClientRects().length > 0,
					);
					const first = focusable[0];
					const last = focusable[focusable.length - 1];
					if (event.shiftKey && document.activeElement === first) {
						event.preventDefault();
						last?.focus();
					} else if (!event.shiftKey && document.activeElement === last) {
						event.preventDefault();
						first?.focus();
					}
				}}
			>
				<ModalHeader
					title={
						library === null ? 'Add Element Library' : 'Edit Element Library'
					}
					onClose={close}
				/>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						save();
					}}
				>
					<div style={fields}>
						<div>
							<label style={fieldLabel} htmlFor="element-library-name">
								Name
							</label>
							<RemotionInput
								id="element-library-name"
								autoFocus={library !== null}
								disabled={busy}
								value={displayName}
								onChange={(event) => {
									setDisplayName(event.target.value);
									setError(null);
								}}
								placeholder="Name (optional)"
								status="ok"
								rightAlign={false}
							/>
						</div>
						<div>
							<label style={fieldLabel} htmlFor="element-library-url">
								URL
							</label>
							<RemotionInput
								id="element-library-url"
								autoFocus={library === null}
								disabled={busy}
								value={url}
								onChange={(event) => {
									setUrl(event.target.value);
									setError(null);
								}}
								placeholder="https://example.com/elements"
								status={validationError ? 'error' : 'ok'}
								rightAlign={false}
							/>
						</div>
						{validationError || error ? (
							<ValidationMessage
								align="flex-start"
								type="error"
								message={validationError || (error as string)}
							/>
						) : null}
					</div>
					<ModalFooterContainer style={footer}>
						<Row align="center" justify="flex-end">
							<Button onClick={close} disabled={busy}>
								Cancel
							</Button>
							<Spacing x={1} />
							<ModalButton onClick={save} disabled={!canSave}>
								{busy
									? 'Saving…'
									: library === null
										? 'Add library'
										: 'Save changes'}
							</ModalButton>
						</Row>
					</ModalFooterContainer>
					<button type="submit" hidden />
				</form>
			</div>
		</ModalContainer>,
		getPortal(currentZIndex),
	);
};
