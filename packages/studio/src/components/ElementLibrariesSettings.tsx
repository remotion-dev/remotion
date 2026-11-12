import React, {useCallback, useContext, useState} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {CURRENT_COLOR, LIGHT_TEXT, WHITE} from '../helpers/colors';
import {THIRD_PARTY_ELEMENTS_URL} from '../helpers/element-libraries';
import {getElementLibraryLabel} from '../helpers/get-element-library-label';
import {BookIcon} from '../icons/book';
import {LinkIcon} from '../icons/link';
import {TrashIcon} from '../icons/trash';
import {SetSelectedModalContext} from '../state/modals';
import {ActionTooltip} from './ActionTooltip';
import {Button} from './Button';
import {ElementLibraryIcon} from './ElementLibraryIcon';
import {InlineAction} from './InlineAction';
import {sectionHeader} from './InspectorPanel/styles';
import {RemotionInput} from './NewComposition/RemInput';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {useSettings} from './SettingsContext';

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

const addLibraryActions: React.CSSProperties = {
	display: 'flex',
	gap: 8,
	padding: '4px 16px 4px 6px',
};

const addLibraryButtonContent: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 6,
};

const addLibraryButtonIcon: React.CSSProperties = {
	flexShrink: 0,
	height: 14,
	width: 14,
};

const libraryRow: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 10,
	minHeight: 38,
	padding: '4px 16px',
};

const libraryDetails: React.CSSProperties = {
	alignItems: 'flex-start',
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minWidth: 0,
};

const libraryName: React.CSSProperties = {
	fontSize: 13,
	maxWidth: '100%',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

const libraryUrlStyle: React.CSSProperties = {
	cursor: 'pointer',
	fontSize: 12,
	maxWidth: '100%',
	minWidth: 0,
	outline: 'none',
	overflow: 'hidden',
	textDecoration: 'none',
	textOverflow: 'ellipsis',
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
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {studioRuntimeConfig, addElementLibrary, removeElementLibrary} =
		useSettings();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const [url, setUrl] = useState('');
	const [displayName, setDisplayName] = useState('');
	const [busy, setBusy] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);
	const [isAddByUrlVisible, setIsAddByUrlVisible] = useState(false);
	const libraries = studioRuntimeConfig?.elementLibraries ?? [];
	let normalizedUrl: string | null = null;
	try {
		const parsedUrl = new URL(url.trim());
		if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
			normalizedUrl = parsedUrl.href;
		}
	} catch {
		// Keep the Add button disabled until a valid URL is entered.
	}

	const duplicate = libraries.some((library) => library.url === normalizedUrl);
	const canSave = previewServerState.type === 'connected' && busy === null;
	const addLibrary = useCallback(async () => {
		if (!canSave || normalizedUrl === null || duplicate) {
			return;
		}

		setBusy('add');
		setError(null);
		try {
			const success = await addElementLibrary({
				url: normalizedUrl,
				displayName: displayName.trim() || null,
				captionStylesUrl: null,
			});
			if (!success) return;

			setUrl('');
			setDisplayName('');
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setBusy(null);
		}
	}, [addElementLibrary, canSave, displayName, duplicate, normalizedUrl]);

	const renderTrash = useCallback((color: string) => {
		return <TrashIcon color={color} style={trashIcon} />;
	}, []);
	const discoverThirdPartyElements = useCallback(() => {
		setSelectedModal({
			type: 'element-library',
			view: 'library',
			name: 'Third-party Elements',
			url: THIRD_PARTY_ELEMENTS_URL,
		});
	}, [setSelectedModal]);

	return (
		<section style={container}>
			<p style={description}>
				Add libraries to browse their elements in Studio.
			</p>
			<div role="list" aria-label="Element Libraries">
				{libraries.map((library) => (
					<div key={library.url} role="listitem" style={libraryRow}>
						<ElementLibraryIcon
							url={library.url}
							color={LIGHT_TEXT}
							size={22}
						/>
						<div style={libraryDetails}>
							<div style={libraryName}>{getElementLibraryLabel(library)}</div>
							<a
								href={library.url}
								target="_blank"
								rel="noopener noreferrer"
								style={{
									...libraryUrlStyle,
									color: hoveredUrl === library.url ? WHITE : LIGHT_TEXT,
								}}
								onMouseEnter={() => setHoveredUrl(library.url)}
								onMouseLeave={() => setHoveredUrl(null)}
							>
								{library.url.replace(/^https?:\/\//, '')}
							</a>
						</div>
						<ActionTooltip
							label="Remove"
							shortcut={null}
							delay={800}
							dismissOnClick
						>
							<InlineAction
								aria-label={`Remove ${library.displayName ?? library.url}`}
								disabled={!canSave}
								onClick={() => removeElementLibrary(library.url)}
								renderAction={renderTrash}
								variant={null}
							/>
						</ActionTooltip>
					</div>
				))}
			</div>
			<h3 style={addLibraryHeading}>Add new library</h3>
			<div style={addLibraryActions}>
				<Button
					onClick={discoverThirdPartyElements}
					size="default"
					buttonContainerStyle={addLibraryButtonContent}
				>
					<BookIcon
						aria-hidden
						color={CURRENT_COLOR}
						style={addLibraryButtonIcon}
					/>
					Explore libraries
				</Button>
				<Button
					onClick={() => setIsAddByUrlVisible(true)}
					size="default"
					buttonContainerStyle={addLibraryButtonContent}
				>
					<LinkIcon
						aria-hidden
						color={CURRENT_COLOR}
						style={addLibraryButtonIcon}
					/>
					Add by URL
				</Button>
			</div>
			{isAddByUrlVisible ? (
				<>
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
				</>
			) : null}
			{error ? (
				<div style={message}>
					<ValidationMessage align="flex-start" type="error" message={error} />
				</div>
			) : null}
		</section>
	);
};
