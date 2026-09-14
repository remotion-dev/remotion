import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {FAIL_COLOR, LIGHT_TEXT} from '../helpers/colors';
import {
	type AssetSelectionModalState,
	SetSelectedModalContext,
} from '../state/modals';
import {Button} from './Button';
import {Row, Spacing} from './layout';
import {ModalButton} from './ModalButton';
import {ModalContainer} from './ModalContainer';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {RemotionInput} from './NewComposition/RemInput';
import {QuickSwitcherContent} from './QuickSwitcher/QuickSwitcherContent';
import type {SegmentedControlItem} from './SegmentedControl';
import {SegmentedControl} from './SegmentedControl';

const panel: React.CSSProperties = {
	maxWidth: 'calc(100vw - 40px)',
	overflow: 'hidden',
	width: 400,
};

const sourceSelector: React.CSSProperties = {
	display: 'flex',
	padding: '12px 16px 0',
};

const urlContent: React.CSSProperties = {
	boxSizing: 'border-box',
	minHeight: 300,
	padding: 16,
};

const compactUrlContent: React.CSSProperties = {
	boxSizing: 'border-box',
	padding: 16,
};

const label: React.CSSProperties = {
	color: LIGHT_TEXT,
	display: 'block',
	fontFamily: 'sans-serif',
	fontSize: 12,
	marginBottom: 8,
};

const previewRow: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 16,
	minHeight: 112,
	paddingTop: 16,
};

const previewImage: React.CSSProperties = {
	display: 'block',
	height: 96,
	objectFit: 'contain',
	width: 96,
};

const previewStatus: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 12,
	lineHeight: 1.5,
};

const footer: React.CSSProperties = {
	display: 'flex',
	minWidth: 0,
	width: '100%',
};

const isHttpUrl = (value: string) => {
	try {
		const {protocol} = new URL(value);
		return protocol === 'http:' || protocol === 'https:';
	} catch {
		return false;
	}
};

type PreviewState =
	| {type: 'empty'}
	| {type: 'invalid'}
	| {type: 'loading'}
	| {type: 'loaded'; width: number; height: number}
	| {type: 'error'};

export const AssetSelectorModal: React.FC<{
	readonly state: AssetSelectionModalState;
	readonly readOnlyStudio: boolean;
}> = ({state, readOnlyStudio}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const [mode, setMode] = useState<'project' | 'url'>('project');
	const [draft, setDraft] = useState(state.initialUrl ?? '');
	const [previewState, setPreviewState] = useState<PreviewState>(() =>
		state.assetType === 'image' && state.initialUrl !== null
			? {type: 'loading'}
			: {type: 'empty'},
	);

	const close = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	useEffect(() => {
		if (state.assetType !== 'image') {
			setPreviewState({type: 'empty'});
			return;
		}

		const value = draft.trim();
		if (value === '') {
			setPreviewState({type: 'empty'});
			return;
		}

		if (!isHttpUrl(value)) {
			setPreviewState({type: 'invalid'});
			return;
		}

		let cancelled = false;
		const image = new Image();
		setPreviewState({type: 'loading'});
		image.onload = () => {
			if (!cancelled) {
				setPreviewState({
					type: 'loaded',
					width: image.naturalWidth,
					height: image.naturalHeight,
				});
			}
		};

		image.onerror = () => {
			if (!cancelled) {
				setPreviewState({type: 'error'});
			}
		};

		image.src = value;

		return () => {
			cancelled = true;
			image.onload = null;
			image.onerror = null;
		};
	}, [draft, state.assetType]);

	const items = useMemo<SegmentedControlItem[]>(
		() => [
			{
				key: 'project',
				label: 'Project assets',
				onClick: () => setMode('project'),
				selected: mode === 'project',
			},
			{
				key: 'url',
				label: 'URL',
				onClick: () => setMode('url'),
				selected: mode === 'url',
			},
		],
		[mode],
	);
	const trimmedDraft = draft.trim();
	const canApply = isHttpUrl(trimmedDraft);
	const invalidDraft = trimmedDraft !== '' && !canApply;
	const apply = useCallback(() => {
		if (!canApply) {
			return;
		}

		state.onSelectedUrl(trimmedDraft);
		close();
	}, [canApply, close, state, trimmedDraft]);
	const onSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
		(event) => {
			event.preventDefault();
			apply();
		},
		[apply],
	);

	const assetTypeLabel =
		state.assetType.charAt(0).toUpperCase() + state.assetType.slice(1);

	return (
		<ModalContainer onEscape={close} onOutsideClick={close} panelStyle={panel}>
			<ModalHeader title={`Replace ${state.assetType}`} onClose={close} />
			<div style={sourceSelector}>
				<SegmentedControl items={items} needsWrapping={false} size="compact" />
			</div>
			{mode === 'project' ? (
				<QuickSwitcherContent
					assetSelection={state.assetSelection}
					compositionSelection={null}
					initialMode="assets"
					invocationTimestamp={state.invocationTimestamp}
					readOnlyStudio={readOnlyStudio}
				/>
			) : (
				<form onSubmit={onSubmit}>
					<div
						style={state.assetType === 'image' ? urlContent : compactUrlContent}
					>
						<label htmlFor="remotion-asset-url" style={label}>
							{assetTypeLabel} URL
						</label>
						<RemotionInput
							id="remotion-asset-url"
							autoFocus
							onChange={(event) => setDraft(event.target.value)}
							placeholder={`https://example.com/${state.assetType}`}
							rightAlign={false}
							status={invalidDraft ? 'error' : 'ok'}
							type="url"
							value={draft}
						/>
						{state.assetType === 'image' ? (
							<div style={previewRow} role="status">
								{previewState.type === 'loaded' ? (
									<img
										alt="Image URL preview"
										src={trimmedDraft}
										style={previewImage}
									/>
								) : null}
								<div
									style={
										previewState.type === 'error'
											? {...previewStatus, color: FAIL_COLOR}
											: previewStatus
									}
								>
									{previewState.type === 'empty'
										? 'Enter an image URL.'
										: previewState.type === 'invalid'
											? 'Enter an HTTP(S) URL.'
											: previewState.type === 'loading'
												? 'Loading preview…'
												: previewState.type === 'error'
													? 'Preview unavailable. You can still replace the source.'
													: `${previewState.width} × ${previewState.height}`}
								</div>
							</div>
						) : null}
					</div>
					<ModalFooterContainer style={footer}>
						<Row align="center" flex={1} justify="flex-end">
							<Button onClick={close}>Cancel</Button>
							<Spacing x={1} />
							<ModalButton disabled={!canApply} onClick={apply}>
								Replace {state.assetType}
							</ModalButton>
						</Row>
					</ModalFooterContainer>
				</form>
			)}
		</ModalContainer>
	);
};
