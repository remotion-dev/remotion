import {PlayerInternals, PreviewSize} from '@remotion/player';
import React, {useCallback, useMemo, useState} from 'react';
import {
	Internals,
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import {noop} from '../helpers/noop';
import {
	CheckerboardContext,
	loadCheckerboardOption,
	persistCheckerboardOption,
} from '../state/checkerboard';
import {HighestZIndexProvider} from '../state/highest-z-index';
import {KeybindingContextProvider} from '../state/keybindings';
import {ModalContextType, ModalsContext, ModalState} from '../state/modals';
import {
	loadPreviewSizeOption,
	persistPreviewSizeOption,
	PreviewSizeContext,
} from '../state/preview-size';
import {
	loadRichTimelineOption,
	persistRichTimelineOption,
	RichTimelineContext,
} from '../state/rich-timeline';
import {HigherZIndex} from '../state/z-index';
import {EditorContent} from './EditorContent';
import {FramePersistor} from './FramePersistor';
import {GlobalKeybindings} from './GlobalKeybindings';
import {KeyboardShortcuts} from './KeyboardShortcutsModal';
import NewComposition from './NewComposition/NewComposition';
import {UpdateModal} from './UpdateModal/UpdateModal';

const background: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	display: 'flex',
	width: '100%',
	height: '100%',
	flexDirection: 'column',
	position: 'absolute',
};

const Root = Internals.getRoot();

export const Editor: React.FC = () => {
	const [emitter] = useState(() => new PlayerInternals.PlayerEmitter());
	const [size, setSizeState] = useState(() => loadPreviewSizeOption());
	const [checkerboard, setCheckerboardState] = useState(() =>
		loadCheckerboardOption()
	);
	const setCheckerboard = useCallback(
		(newValue: (prevState: boolean) => boolean) => {
			setCheckerboardState((prevState) => {
				const newVal = newValue(prevState);
				persistCheckerboardOption(newVal);
				return newVal;
			});
		},
		[]
	);
	const [richTimeline, setRichTimelineState] = useState(() =>
		loadRichTimelineOption()
	);
	const setRichTimeline = useCallback(
		(newValue: (prevState: boolean) => boolean) => {
			setRichTimelineState((prevState) => {
				const newVal = newValue(prevState);
				persistRichTimelineOption(newVal);
				return newVal;
			});
		},
		[]
	);
	const setSize = useCallback(
		(newValue: (prevState: PreviewSize) => PreviewSize) => {
			setSizeState((prevState) => {
				const newVal = newValue(prevState);
				persistPreviewSizeOption(newVal);
				return newVal;
			});
		},
		[]
	);
	const [mediaMuted, setMediaMuted] = useState<boolean>(false);
	const [mediaVolume, setMediaVolume] = useState<number>(1);
	const [modalContextType, setModalContextType] = useState<ModalState | null>(
		null
	);

	const previewSizeCtx = useMemo(() => {
		return {
			size,
			setSize,
		};
	}, [setSize, size]);
	const checkerboardCtx = useMemo(() => {
		return {
			checkerboard,
			setCheckerboard,
		};
	}, [checkerboard, setCheckerboard]);
	const richTimelineCtx = useMemo(() => {
		return {
			richTimeline,
			setRichTimeline,
		};
	}, [richTimeline, setRichTimeline]);

	const mediaVolumeContextValue = useMemo((): MediaVolumeContextValue => {
		return {
			mediaMuted,
			mediaVolume,
		};
	}, [mediaMuted, mediaVolume]);

	const setMediaVolumeContextValue = useMemo((): SetMediaVolumeContextValue => {
		return {
			setMediaMuted,
			setMediaVolume,
		};
	}, []);

	const modalsContext = useMemo((): ModalContextType => {
		return {
			selectedModal: modalContextType,
			setSelectedModal: setModalContextType,
		};
	}, [modalContextType]);

	if (!Root) {
		throw new Error('Root has not been registered. ');
	}

	return (
		<KeybindingContextProvider>
			<RichTimelineContext.Provider value={richTimelineCtx}>
				<CheckerboardContext.Provider value={checkerboardCtx}>
					<PreviewSizeContext.Provider value={previewSizeCtx}>
						<ModalsContext.Provider value={modalsContext}>
							<Internals.MediaVolumeContext.Provider
								value={mediaVolumeContextValue}
							>
								<Internals.SetMediaVolumeContext.Provider
									value={setMediaVolumeContextValue}
								>
									<PlayerInternals.PlayerEventEmitterContext.Provider
										value={emitter}
									>
										<HighestZIndexProvider>
											<HigherZIndex onEscape={noop} onOutsideClick={noop}>
												<div style={background}>
													<Root />
													<FramePersistor />
													<EditorContent />
													<GlobalKeybindings />
												</div>
												{modalContextType &&
													modalContextType.type === 'new-comp' && (
														<NewComposition
															initialCompType={modalContextType.compType}
														/>
													)}
												{modalContextType &&
													modalContextType.type === 'update' && (
														<UpdateModal info={modalContextType.info} />
													)}
												{modalContextType &&
													modalContextType.type === 'shortcuts' && (
														<KeyboardShortcuts />
													)}
											</HigherZIndex>
										</HighestZIndexProvider>
									</PlayerInternals.PlayerEventEmitterContext.Provider>
								</Internals.SetMediaVolumeContext.Provider>
							</Internals.MediaVolumeContext.Provider>
						</ModalsContext.Provider>
					</PreviewSizeContext.Provider>
				</CheckerboardContext.Provider>
			</RichTimelineContext.Provider>
		</KeybindingContextProvider>
	);
};
