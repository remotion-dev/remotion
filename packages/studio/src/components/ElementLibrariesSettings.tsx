import React, {useCallback, useContext, useState} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT} from '../helpers/colors';
import {TrashIcon} from '../icons/trash';
import {ActionTooltip} from './ActionTooltip';
import {Button} from './Button';
import {callApi} from './call-api';
import {InlineAction} from './InlineAction';
import {sectionHeader} from './InspectorPanel/styles';
import {RemotionInput} from './NewComposition/RemInput';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {useSettings} from './SettingsContext';
import {Spinner} from './Spinner';

const REMOTION_ELEMENTS_URL = 'https://www.remotion.dev/elements';

const container: React.CSSProperties = {
	alignSelf: 'flex-start',
	boxSizing: 'border-box',
	flex: 1,
	minWidth: 0,
	width: '100%',
};

const description: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 13,
	lineHeight: 1.5,
	margin: '16px 16px 12px',
};

const addLibraryHeading: React.CSSProperties = {
	...sectionHeader,
	margin: '12px 0 0',
	padding: '4px 16px',
};

const libraryRow: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 10,
	minHeight: 42,
	padding: '4px 16px',
};

const libraryDetails: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
};

const libraryName: React.CSSProperties = {
	fontSize: 13,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const libraryUrlStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 12,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const builtInLabel: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 12,
	whiteSpace: 'nowrap',
};

const inputRow: React.CSSProperties = {
	display: 'flex',
	gap: 8,
	padding: '4px 16px',
};

const input: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
};

const message: React.CSSProperties = {
	padding: '4px 16px',
};

const trashIcon: React.CSSProperties = {
	height: 14,
	width: 14,
};

export const ElementLibrariesSettings: React.FC = () => {
	const {studioRuntimeConfig} = useSettings();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const [url, setUrl] = useState('');
	const [displayName, setDisplayName] = useState('');
	const [busy, setBusy] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const libraries = (studioRuntimeConfig?.elementLibraries ?? []).filter(
		(library) => library.url !== REMOTION_ELEMENTS_URL,
	);
	let normalizedUrl: string | null = null;
	try {
		const parsedUrl = new URL(url.trim());
		if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
			normalizedUrl = parsedUrl.href;
		}
	} catch {
		// Keep the Add button disabled until a valid URL is entered.
	}

	const duplicate =
		normalizedUrl === REMOTION_ELEMENTS_URL ||
		libraries.some((library) => library.url === normalizedUrl);
	const canSave = previewServerState.type === 'connected' && busy === null;
	const addLibrary = useCallback(async () => {
		if (!canSave || normalizedUrl === null || duplicate) {
			return;
		}

		setBusy('add');
		setError(null);
		try {
			const response = await callApi('/api/update-config', {
				clientId: previewServerState.clientId,
				updates: [
					{
						setter: 'addElementLibrary',
						type: 'set',
						value: displayName.trim()
							? {url: normalizedUrl, displayName: displayName.trim()}
							: {url: normalizedUrl},
					},
				],
			});
			if (!response.success) {
				setError(response.reason);
				return;
			}

			setUrl('');
			setDisplayName('');
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setBusy(null);
		}
	}, [canSave, displayName, duplicate, normalizedUrl, previewServerState]);

	const removeLibrary = useCallback(
		async (libraryUrl: string) => {
			if (previewServerState.type !== 'connected' || busy !== null) {
				return;
			}

			setBusy(libraryUrl);
			setError(null);
			try {
				const response = await callApi('/api/update-config', {
					clientId: previewServerState.clientId,
					updates: [
						{
							setter: 'addElementLibrary',
							type: 'delete',
							value: libraryUrl,
						},
					],
				});
				if (!response.success) {
					setError(response.reason);
				}
			} catch (err) {
				setError((err as Error).message);
			} finally {
				setBusy(null);
			}
		},
		[busy, previewServerState],
	);

	const renderTrash = useCallback((color: string) => {
		return <TrashIcon color={color} style={trashIcon} />;
	}, []);

	return (
		<section style={container}>
			<p style={description}>
				Add libraries to browse their elements in Studio. Changes save to
				remotion.config.ts.
			</p>
			<div role="list" aria-label="Element Libraries">
				<div role="listitem" style={libraryRow}>
					<div style={libraryDetails}>
						<div style={libraryName}>Remotion Elements</div>
						<div style={libraryUrlStyle}>{REMOTION_ELEMENTS_URL}</div>
					</div>
					<span style={builtInLabel}>Built in</span>
				</div>
				{libraries.map((library) => (
					<div key={library.url} role="listitem" style={libraryRow}>
						<div style={libraryDetails}>
							<div style={libraryName}>
								{library.displayName ?? new URL(library.url).host}
							</div>
							<div style={libraryUrlStyle} title={library.url}>
								{library.url}
							</div>
						</div>
						{busy === library.url ? (
							<Spinner duration={0.5} size={14} />
						) : (
							<ActionTooltip
								label="Remove"
								shortcut={null}
								delay={800}
								dismissOnClick
							>
								<InlineAction
									aria-label={`Remove ${library.displayName ?? library.url}`}
									title=""
									disabled={!canSave}
									onClick={() => removeLibrary(library.url)}
									renderAction={renderTrash}
									variant={null}
								/>
							</ActionTooltip>
						)}
					</div>
				))}
			</div>
			<h3 style={addLibraryHeading}>Add new library</h3>
			<div style={inputRow}>
				<RemotionInput
					aria-label="Element Library URL"
					placeholder="https://example.com/elements"
					status="ok"
					rightAlign={false}
					style={input}
					value={url}
					onChange={(event) => setUrl(event.target.value)}
				/>
				<RemotionInput
					aria-label="Element Library name"
					placeholder="Name (optional)"
					status="ok"
					rightAlign={false}
					style={input}
					value={displayName}
					onChange={(event) => setDisplayName(event.target.value)}
				/>
			</div>
			<div style={inputRow}>
				<Button
					disabled={!canSave || normalizedUrl === null || duplicate}
					onClick={addLibrary}
					size="compact"
				>
					{busy === 'add' ? 'Adding…' : '+ Add Element Library'}
				</Button>
			</div>
			{duplicate ? (
				<div style={message}>
					<ValidationMessage
						align="flex-start"
						type="warning"
						message="This library is already added."
					/>
				</div>
			) : null}
			{error ? (
				<div style={message}>
					<ValidationMessage align="flex-start" type="error" message={error} />
				</div>
			) : null}
		</section>
	);
};
