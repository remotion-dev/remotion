import type {ProjectInfo, SimpleDiff} from '@remotion/studio-shared';
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
import {
	BLUE,
	BLUE_DISABLED,
	LIGHT_TEXT,
	SELECTED_GUIDE,
} from '../../helpers/colors';
import {useKeybinding} from '../../helpers/use-keybinding';
import {
	validateCompositionDimension,
	validateCompositionName,
} from '../../helpers/validate-new-comp-data';
import {ModalsContext} from '../../state/modals';
import {Button} from '../Button';
import {Flex, Row, Spacing} from '../layout';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import {showNotification} from '../Notifications/NotificationCenter';
import {label, optionRow, rightRow} from '../RenderModal/layout';
import {
	ResolveCompositionBeforeModal,
	ResolvedCompositionContext,
} from '../RenderModal/ResolveCompositionBeforeModal';
import {applyCodemod, getProjectInfo} from '../RenderQueue/actions';
import type {ComboboxValue} from './ComboBox';
import {Combobox} from './ComboBox';
import {InputDragger} from './InputDragger';
import {NewCompDuration} from './NewCompDuration';
import {RemotionInput} from './RemInput';
import {ValidationMessage} from './ValidationMessage';

const content: React.CSSProperties = {
	padding: 12,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
	minWidth: 500,
};

const comboBoxStyle: React.CSSProperties = {
	width: 190,
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

	const {resolved, unresolved} = context;

	const initialCompType: CompType =
		resolved.result.durationInFrames === 1 ? 'still' : 'composition';

	const hadDimensionsDefined = unresolved.width && unresolved.height;
	const hadFpsDefined = unresolved.fps !== undefined;
	const hadDurationDefined = unresolved.durationInFrames !== undefined;

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
				showNotification(
					`Could not get project info: ${err.message}. Unable to duplicate composition`,
					3000,
				);
			});

		return () => {
			controller.abort();
		};
	}, []);

	const [durationInFrames, setDurationInFrames] = useState('150');

	const onTypeChanged = useCallback((newType: CompType) => {
		setType(newType);
	}, []);

	const onWidthChanged = useCallback((newValue: string) => {
		setSize((s) => {
			const {height} = s;
			const newWidth = Number(newValue);
			return {
				height,
				width: String(newWidth),
			};
		});
	}, []);

	const onWidthDirectlyChanged = useCallback((newWidth: number) => {
		setSize((s) => {
			const {height} = s;

			return {
				height,
				width: String(newWidth),
			};
		});
	}, []);

	const onHeightDirectlyChanged = useCallback((newHeight: number) => {
		setSize((s) => {
			const {width} = s;

			return {
				width,
				height: String(newHeight),
			};
		});
	}, []);

	const onHeightChanged = useCallback((newValue: string) => {
		setSize((s) => {
			const {width} = s;
			const newHeight = Number(newValue);
			return {
				width,
				height: String(newHeight),
			};
		});
	}, []);

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
	const [canApplyCodemod, setCanApplyCodemod] = useState<SimpleDiff | null>(
		null,
	);
	const [submitting, setSubmitting] = useState(false);

	const valid =
		compNameErrMessage === null &&
		compWidthErrMessage === null &&
		compHeightErrMessage === null &&
		projectInfo !== null;
	const enableSubmit = !submitting && valid && canApplyCodemod;

	const getCanApplyCodemod = useCallback(async () => {
		const res = await applyCodemod({
			codemod: {
				type: 'duplicate-composition',
				idToDuplicate: resolved.result.id,
				newDurationInFrames: null,
				newFps: null,
				newHeight: null,
				newId,
				newWidth: null,
				tag: type === 'still' ? 'Still' : 'Composition',
			},
			dryRun: true,
		});

		if (!res.success) {
			throw new Error(res.reason);
		}

		setCanApplyCodemod(res.diff);
	}, [newId, resolved.result.id, type]);

	useEffect(() => {
		getCanApplyCodemod()
			.then(() => undefined)
			.catch((err) => {
				setSelectedModal(null);
				showNotification(`Cannot duplicate composition: ${err.message}`, 3000);
			});
	}, [canApplyCodemod, getCanApplyCodemod, setSelectedModal]);

	const trigger = useCallback(() => {
		setSubmitting(true);
		setSelectedModal(null);
		const notification = showNotification('Duplicating...', null);

		applyCodemod({
			codemod: {
				type: 'duplicate-composition',
				idToDuplicate: resolved.result.id,
				newDurationInFrames: hadDurationDefined
					? Number(durationInFrames)
					: null,
				newFps: hadFpsDefined ? Number(selectedFrameRate) : null,
				newHeight: hadDimensionsDefined ? Number(size.height) : null,
				newWidth: hadDimensionsDefined ? Number(size.width) : null,
				newId,
				tag: type === 'still' ? 'Still' : 'Composition',
			},
			dryRun: false,
		})
			.then(() => {
				notification.replaceContent(`Created "${newId}" composition`, 2000);
			})
			.catch((err) => {
				notification.replaceContent(
					`Could not duplicate composition: ${err.message}`,
					2000,
				);
			});
	}, [
		durationInFrames,
		hadDimensionsDefined,
		hadDurationDefined,
		hadFpsDefined,
		newId,
		resolved.result.id,
		selectedFrameRate,
		setSelectedModal,
		size.height,
		size.width,
		type,
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
					{initialCompType === 'composition' ? (
						// We allow converting from a composition to a still, but
						// not the other way around
						<div style={optionRow}>
							<div style={label}>Type</div>
							<div style={rightRow}>
								<Combobox
									title="Type of composition"
									style={comboBoxStyle}
									values={typeValues}
									selectedId={type}
								/>
							</div>
						</div>
					) : null}

					<div style={optionRow}>
						<div style={label}>ID</div>
						<div style={rightRow}>
							<div>
								<RemotionInput
									value={newId}
									onChange={onNameChange}
									type="text"
									autoFocus
									name="compositionId"
									placeholder="Composition ID"
									status="ok"
									rightAlign
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
						</div>
					</div>

					{hadDimensionsDefined ? (
						<>
							<div style={optionRow}>
								<div style={label}>Width</div>
								<div style={rightRow}>
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
							</div>
							<div style={optionRow}>
								<div style={label}>Height</div>
								<div style={rightRow}>
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
							</div>
						</>
					) : null}
					{type === 'composition' && hadDurationDefined ? (
						<NewCompDuration
							durationInFrames={durationInFrames}
							setDurationInFrames={setDurationInFrames}
						/>
					) : null}
					{type === 'composition' && hadFpsDefined ? (
						<div style={optionRow}>
							<div style={label}>FPS</div>
							<div style={rightRow}>
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
						</div>
					) : null}
				</div>
				<div style={{...content, borderTop: '1px solid black'}}>
					<Row align="center">
						{canApplyCodemod ? (
							<div style={{lineHeight: 1.2}}>
								<span
									style={{color: LIGHT_TEXT, fontSize: 13, lineHeight: 1.2}}
								>
									This will edit your Root file.
								</span>
								<br />
								<span style={{color: BLUE, fontSize: 13, lineHeight: 1.2}}>
									{canApplyCodemod.additions} additions,
								</span>{' '}
								<span
									style={{
										color: SELECTED_GUIDE,
										fontSize: 13,
										lineHeight: 1.2,
									}}
								>
									{canApplyCodemod.deletions} deletions
								</span>
							</div>
						) : null}
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
