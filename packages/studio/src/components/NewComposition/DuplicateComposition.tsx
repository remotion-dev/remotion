import type {ProjectInfo} from '@remotion/studio-shared';
import type {ChangeEventHandler} from 'react';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {ShortcutHint} from '../../error-overlay/remotion-overlay/ShortcutHint';
import {BLUE, BLUE_DISABLED, LIGHT_TEXT} from '../../helpers/colors';
import {useKeybinding} from '../../helpers/use-keybinding';
import {
	validateCompositionDimension,
	validateCompositionName,
} from '../../helpers/validate-new-comp-data';
import {
	loadAspectRatioOption,
	persistAspectRatioOption,
} from '../../state/aspect-ratio-locked';
import {ModalsContext} from '../../state/modals';
import {Button} from '../Button';
import {Flex, Row, Spacing} from '../layout';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import {
	notificationCenter,
	showNotification,
} from '../Notifications/NotificationCenter';
import {
	ResolveCompositionBeforeModal,
	ResolvedCompositionContext,
} from '../RenderModal/ResolveCompositionBeforeModal';
import {applyCodemod, getProjectInfo} from '../RenderQueue/actions';
import type {ComboboxValue} from './ComboBox';
import {Combobox} from './ComboBox';
import {InputDragger} from './InputDragger';
import {inputArea, leftLabel} from './new-comp-layout';
import {NewCompAspectRatio} from './NewCompAspectRatio';
import {NewCompDuration} from './NewCompDuration';
import {RemotionInput} from './RemInput';
import {ValidationMessage} from './ValidationMessage';

const content: React.CSSProperties = {
	padding: 12,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
};

const comboBoxStyle: React.CSSProperties = {
	width: inputArea.width,
};

const buttonStyle: React.CSSProperties = {
	backgroundColor: BLUE,
	color: 'white',
};

type CompType = 'composition' | 'still';

const DuplicateCompositionLoaded: React.FC<{
	compositionId: string;
}> = () => {
	const context = useContext(ResolvedCompositionContext);
	if (!context) {
		throw new Error('Resolved composition context');
	}

	const {resolved} = context;

	const initialCompType: CompType =
		resolved.result.durationInFrames === 1 ? 'still' : 'composition';
	const [selectedFrameRate, setFrameRate] = useState<string>(
		String(resolved.result.fps),
	);
	const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
	const {compositions} = useContext(Internals.CompositionManager);
	const [type, setType] = useState<CompType>(initialCompType);
	const [newId, setName] = useState(() => {
		const numberAtEnd = resolved.result.id.match(/([0-9]+)$/)?.[0];
		let prefix = numberAtEnd ? Number(numberAtEnd) : 1;
		const initialName = resolved.result.id.replace(/([0-9]+)$/, '');
		let currentName = initialName;

		// eslint-disable-next-line no-constant-condition
		while (true) {
			currentName = initialName + prefix;

			const err = validateCompositionName(currentName, compositions);
			if (!err) {
				break;
			}

			prefix++;
		}

		return currentName;
	});

	const [size, setSize] = useState(() => ({
		width: String(resolved.result.width),
		height: String(resolved.result.height),
	}));

	useEffect(() => {
		const controller = new AbortController();

		getProjectInfo(controller.signal)
			.then((info) => {
				setProjectInfo(info.projectInfo);
			})
			.catch((err) => {
				notificationCenter.current?.addNotification({
					content: `Could not get project info: ${err.message}. Unable to duplicate composition`,
					created: Date.now(),
					duration: 3000,
					id: String(Math.random()),
				});
			});

		return () => {
			controller.abort();
		};
	}, []);

	const [lockedAspectRatio, setLockedAspectRatio] = useState(
		loadAspectRatioOption() ? Number(size.width) / Number(size.height) : null,
	);
	const [durationInFrames, setDurationInFrames] = useState('150');

	const setAspectRatioLocked = useCallback(
		(option: boolean) => {
			persistAspectRatioOption(option);
			setLockedAspectRatio(
				option ? Number(size.width) / Number(size.height) : null,
			);
		},
		[size.height, size.width],
	);

	const onTypeChanged = useCallback((newType: CompType) => {
		setType(newType);
	}, []);

	const onWidthChanged = useCallback(
		(newValue: string) => {
			setSize((s) => {
				const {height} = s;
				const newWidth = Number(newValue);
				return {
					height:
						lockedAspectRatio === null
							? height
							: String(Math.ceil(newWidth / lockedAspectRatio / 2) * 2),
					width: String(newWidth),
				};
			});
		},
		[lockedAspectRatio],
	);

	const onWidthDirectlyChanged = useCallback(
		(newWidth: number) => {
			setSize((s) => {
				const {height} = s;

				return {
					height:
						lockedAspectRatio === null
							? height
							: String(Math.ceil(newWidth / lockedAspectRatio / 2) * 2),
					width: String(newWidth),
				};
			});
		},
		[lockedAspectRatio],
	);

	const onHeightDirectlyChanged = useCallback(
		(newHeight: number) => {
			setSize((s) => {
				const {width} = s;

				return {
					width:
						lockedAspectRatio === null
							? width
							: String(Math.ceil((newHeight / 2) * lockedAspectRatio) * 2),
					height: String(newHeight),
				};
			});
		},
		[lockedAspectRatio],
	);

	const onHeightChanged = useCallback(
		(newValue: string) => {
			setSize((s) => {
				const {width} = s;
				const newHeight = Number(newValue);
				return {
					width:
						lockedAspectRatio === null
							? width
							: String(Math.ceil((newHeight / 2) * lockedAspectRatio) * 2),
					height: String(newHeight),
				};
			});
		},
		[lockedAspectRatio],
	);
	const onNameChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setName(e.target.value);
		},
		[],
	);
	const onTextFpsChange = useCallback((newFps: string) => {
		setFrameRate(String(newFps));
	}, []);

	const onFpsChange = useCallback((newFps: number) => {
		setFrameRate(String(newFps));
	}, []);

	const compNameErrMessage = validateCompositionName(newId, compositions);
	const compWidthErrMessage = validateCompositionDimension('Width', size.width);
	const compHeightErrMessage = validateCompositionDimension(
		'Height',
		size.height,
	);

	const typeValues: ComboboxValue[] = useMemo(() => {
		return [
			{
				id: 'composition',
				keyHint: null,
				label: '<Composition />',
				leftItem: null,
				onClick: () => onTypeChanged('composition'),
				subMenu: null,
				type: 'item',
				value: 'composition' as CompType,
				quickSwitcherLabel: null,
			},
			{
				id: 'still',
				keyHint: null,
				label: '<Still />',
				leftItem: null,
				onClick: () => onTypeChanged('still'),
				subMenu: null,
				type: 'item',
				value: 'still' as CompType,
				quickSwitcherLabel: null,
			},
		];
	}, [onTypeChanged]);

	const {registerKeybinding} = useKeybinding();

	const {setSelectedModal} = useContext(ModalsContext);
	const [submitting, setSubmitting] = useState(false);

	const valid =
		compNameErrMessage === null &&
		compWidthErrMessage === null &&
		compHeightErrMessage === null &&
		projectInfo !== null;
	const enableSubmit = !submitting && valid;

	const trigger = useCallback(() => {
		setSubmitting(true);
		applyCodemod({
			codemod: {
				type: 'duplicate-composition',
				idToDuplicate: resolved.result.id,
				newDurationInFrames: Number(durationInFrames),
				newFps: Number(selectedFrameRate),
				newHeight: Number(size.height),
				newWidth: Number(size.width),
				newId,
			},
		})
			.then(() => {
				showNotification('Duplicated composition', 2000);
				setSelectedModal(null);
			})
			.catch((err) => {
				showNotification(
					`Could not duplicate composition: ${err.message}`,
					2000,
				);
			});
	}, [
		durationInFrames,
		newId,
		resolved.result.id,
		selectedFrameRate,
		setSelectedModal,
		size.height,
		size.width,
	]);

	useEffect(() => {
		if (!enableSubmit) {
			return;
		}

		const enter = registerKeybinding({
			callback() {
				trigger();
			},
			commandCtrlKey: true,
			key: 'Enter',
			event: 'keydown',
			preventDefault: true,
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
		});
		return () => {
			enter.unregister();
		};
	}, [enableSubmit, registerKeybinding, trigger, valid]);

	return (
		<>
			<NewCompHeader title={'Duplicate ' + resolved.result.id} />
			<form>
				<div style={content}>
					<label>
						<Row align="center">
							<div style={leftLabel}>Type</div>
							<div style={inputArea}>
								<Combobox
									title="Type of composition"
									style={comboBoxStyle}
									values={typeValues}
									selectedId={type}
								/>
							</div>
						</Row>
						<Spacing y={1} />
						<Row align="center">
							<div style={leftLabel}>ID</div>
							<div style={inputArea}>
								<RemotionInput
									value={newId}
									onChange={onNameChange}
									type="text"
									autoFocus
									name="compositionId"
									placeholder="Composition ID"
									status="ok"
									rightAlign={false}
								/>
								{compNameErrMessage ? (
									<>
										<Spacing y={1} block />
										<ValidationMessage
											align="flex-start"
											message={compNameErrMessage}
											type="error"
										/>
									</>
								) : null}
							</div>
						</Row>
					</label>
					<Spacing y={1} />
					<Row align="center">
						<div>
							<div>
								<label>
									<Row align="center">
										<div style={leftLabel}>Width</div>
										<div style={inputArea}>
											<InputDragger
												type="number"
												value={size.width}
												placeholder="Width"
												onTextChange={onWidthChanged}
												name="width"
												step={2}
												min={2}
												required
												status="ok"
												formatter={(w) => `${w}px`}
												max={100000000}
												onValueChange={onWidthDirectlyChanged}
												rightAlign={false}
											/>
											{compWidthErrMessage ? (
												<>
													<Spacing y={1} block />
													<ValidationMessage
														align="flex-start"
														message={compWidthErrMessage}
														type="error"
													/>
												</>
											) : null}
										</div>
									</Row>
								</label>
							</div>
							<div />
							<Spacing y={1} />
							<div />
							<label>
								<Row align="center">
									<div style={leftLabel}>Height</div>
									<div style={inputArea}>
										<InputDragger
											type="number"
											value={size.height}
											onTextChange={onHeightChanged}
											placeholder="Height"
											name="height"
											step={2}
											required
											formatter={(h) => `${h}px`}
											min={2}
											status="ok"
											max={100000000}
											onValueChange={onHeightDirectlyChanged}
											rightAlign={false}
										/>
										{compHeightErrMessage ? (
											<>
												<Spacing y={1} block />
												<ValidationMessage
													align="flex-start"
													message={compHeightErrMessage}
													type="error"
												/>
											</>
										) : null}
									</div>
								</Row>
							</label>
						</div>
						<div>
							<NewCompAspectRatio
								width={Number(size.width)}
								height={Number(size.height)}
								aspectRatioLocked={lockedAspectRatio}
								setAspectRatioLocked={setAspectRatioLocked}
							/>
						</div>
					</Row>
					<div />
					<Spacing y={1} />
					{type === 'composition' ? (
						<NewCompDuration
							durationInFrames={durationInFrames}
							fps={selectedFrameRate}
							setDurationInFrames={setDurationInFrames}
						/>
					) : null}
					<div />
					<br />
					<div />
					{type === 'composition' ? (
						<div>
							<div />
							<label>
								<Row align="center">
									<div style={leftLabel}>Framerate</div>
									<div style={inputArea}>
										<InputDragger
											type="number"
											value={selectedFrameRate}
											onTextChange={onTextFpsChange}
											placeholder="Frame rate (fps)"
											name="fps"
											min={1}
											required
											status="ok"
											max={240}
											step={0.01}
											onValueChange={onFpsChange}
											rightAlign={false}
										/>
									</div>
								</Row>
							</label>
						</div>
					) : null}
				</div>
				<div style={{...content, borderTop: '1px solid black'}}>
					<Row align="center" style={{}}>
						<div style={{color: LIGHT_TEXT, fontSize: 13}}>
							Your root file will be edited.
							<br />
							Back up uncommitted changes before.
						</div>
						<Flex />
						<Button
							onClick={trigger}
							disabled={!enableSubmit}
							style={{
								...buttonStyle,
								backgroundColor: enableSubmit ? BLUE : BLUE_DISABLED,
							}}
						>
							{projectInfo ? `Add to ${projectInfo.relativeRootFile}` : 'Add'}
							<ShortcutHint keyToPress="↵" cmdOrCtrl />
						</Button>
					</Row>
				</div>
			</form>
		</>
	);
};

export const DuplicateComposition: React.FC<{
	compositionId: string;
}> = ({compositionId}) => {
	const {setSelectedModal} = useContext(ModalsContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<ResolveCompositionBeforeModal compositionId={compositionId}>
				<DuplicateCompositionLoaded compositionId={compositionId} />
			</ResolveCompositionBeforeModal>
		</ModalContainer>
	);
};
