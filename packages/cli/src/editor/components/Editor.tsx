import type {PreviewSize} from '@remotion/player';
import {PlayerInternals} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {
	MediaVolumeContextValue,
	SetMediaVolumeContextValue,
} from 'remotion';
import {continueRender, delayRender, Internals} from 'remotion';
import {BACKGROUND} from '../helpers/colors';
import {noop} from '../helpers/noop';
import {
	CheckerboardContext,
	loadCheckerboardOption,
	persistCheckerboardOption,
} from '../state/checkerboard';
import {FolderContextProvider} from '../state/folders';
import {HighestZIndexProvider} from '../state/highest-z-index';
import type {
	SetTimelineInOutContextValue,
	TimelineInOutContextValue,
} from '../state/in-out';
import {SetTimelineInOutContext, TimelineInOutContext} from '../state/in-out';
import {KeybindingContextProvider} from '../state/keybindings';
import type {ModalContextType, ModalState} from '../state/modals';
import {ModalsContext} from '../state/modals';
import {loadMuteOption} from '../state/mute';
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
import {SidebarContextProvider} from '../state/sidebar';
import {HigherZIndex} from '../state/z-index';
import {EditorContent} from './EditorContent';
import {FramePersistor} from './FramePersistor';
import {GlobalKeybindings} from './GlobalKeybindings';
import {KeyboardShortcuts} from './KeyboardShortcutsModal';
import NewComposition from './NewComposition/NewComposition';
import {NoRegisterRoot} from './NoRegisterRoot';
import {NotificationCenter} from './Notifications/NotificationCenter';
import {UpdateModal} from './UpdateModal/UpdateModal';

const background: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	display: 'flex',
	width: '100%',
	height: '100%',
	flexDirection: 'column',
	position: 'absolute',
};

export const Editor: React.FC = () => {
	const [emitter] = useState(() => new PlayerInternals.PlayerEmitter());
	const [size, setSizeState] = useState(() => loadPreviewSizeOption());
	const [Root, setRoot] = useState<React.FC | null>(() => Internals.getRoot());
	const [waitForRoot] = useState(() => {
		if (Root) {
			return 0;
		}

		return delayRender('Waiting for registerRoot()');
	});
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
	const [inAndOutFrames, setInAndOutFrames] =
		useState<TimelineInOutContextValue>({
			inFrame: null,
			outFrame: null,
		});
	const [mediaMuted, setMediaMuted] = useState<boolean>(() => loadMuteOption());
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

	const timelineInOutContextValue = useMemo((): TimelineInOutContextValue => {
		return inAndOutFrames;
	}, [inAndOutFrames]);

	const setTimelineInOutContextValue =
		useMemo((): SetTimelineInOutContextValue => {
			return {
				setInAndOutFrames,
			};
		}, []);

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

	useEffect(() => {
		if (Root) {
			return;
		}

		const cleanup = Internals.waitForRoot((NewRoot) => {
			setRoot(() => NewRoot);
			continueRender(waitForRoot);
		});

		return () => cleanup();
	}, [Root, waitForRoot]);

	return (
		<KeybindingContextProvider>
			<RichTimelineContext.Provider value={richTimelineCtx}>
				<CheckerboardContext.Provider value={checkerboardCtx}>
					<PreviewSizeContext.Provider value={previewSizeCtx}>
						<ModalsContext.Provider value={modalsContext}>
							<TimelineInOutContext.Provider value={timelineInOutContextValue}>
								<SetTimelineInOutContext.Provider
									value={setTimelineInOutContextValue}
								>
									<Internals.MediaVolumeContext.Provider
										value={mediaVolumeContextValue}
									>
										<Internals.SetMediaVolumeContext.Provider
											value={setMediaVolumeContextValue}
										>
											<PlayerInternals.PlayerEventEmitterContext.Provider
												value={emitter}
											>
												<SidebarContextProvider>
													<FolderContextProvider>
														<HighestZIndexProvider>
															<HigherZIndex
																onEscape={noop}
																onOutsideClick={noop}
															>
																<div style={background}>
																	{Root === null ? null : <Root />}
																	<Internals.CanUseRemotionHooksProvider>
																		<FramePersistor />
																		{Root === null ? (
																			<NoRegisterRoot />
																		) : (
																			<EditorContent />
																		)}
																		<GlobalKeybindings />
																	</Internals.CanUseRemotionHooksProvider>
																</div>
																<NotificationCenter />
																{modalContextType &&
																	modalContextType.type === 'new-comp' && (
																		<NewComposition
																			initialCompType={
																				modalContextType.compType
																			}
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
													</FolderContextProvider>
												</SidebarContextProvider>
											</PlayerInternals.PlayerEventEmitterContext.Provider>
										</Internals.SetMediaVolumeContext.Provider>
									</Internals.MediaVolumeContext.Provider>
								</SetTimelineInOutContext.Provider>
							</TimelineInOutContext.Provider>
						</ModalsContext.Provider>
					</PreviewSizeContext.Provider>
				</CheckerboardContext.Provider>
			</RichTimelineContext.Provider>
		</KeybindingContextProvider>
	);
};
