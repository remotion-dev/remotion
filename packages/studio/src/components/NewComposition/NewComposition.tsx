import type {RecastCodemod} from '@remotion/studio-shared';
import type {ChangeEventHandler} from 'react';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Internals, type _InternalTypes} from 'remotion';
import {pushUrl} from '../../helpers/url-state';
import {
	validateCompositionDimension,
	validateCompositionName,
} from '../../helpers/validate-new-comp-data';
import {Spacing} from '../layout';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {label, optionRow, rightRow} from '../RenderModal/layout';
import {CodemodFooter} from './CodemodFooter';
import {DismissableModal} from './DismissableModal';
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

const toPascalCase = (value: string) => {
	const words = value.match(/[a-zA-Z0-9]+/g) ?? [];
	const candidate = words
		.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
		.join('');

	if (!candidate) {
		return 'NewComposition';
	}

	if (/^[0-9]/.test(candidate)) {
		return `Composition${candidate}`;
	}

	return candidate;
};

const waitForComposition = (compositionId: string) => {
	return new Promise<void>((resolve) => {
		const started = Date.now();
		const interval = window.setInterval(() => {
			const compositionNames = window.remotion_getCompositionNames?.() ?? [];
			if (
				compositionNames.includes(compositionId) ||
				Date.now() - started > 10000
			) {
				window.clearInterval(interval);
				resolve();
			}
		}, 100);
	});
};

const getUniqueCompositionName = (
	compositions: _InternalTypes['AnyComposition'][],
) => {
	let counter = 1;

	while (true) {
		const name = counter === 1 ? 'NewComposition' : `NewComposition${counter}`;
		const err = validateCompositionName(name, compositions);
		if (!err) {
			return name;
		}

		counter++;
	}
};

const NewCompositionLoaded: React.FC = () => {
	const {compositions} = useContext(Internals.CompositionManager);
	const [newId, setName] = useState(() =>
		getUniqueCompositionName(compositions),
	);
	const [selectedFrameRate, setFrameRate] = useState(30);
	const [size, setSize] = useState(() => ({
		width: 1920,
		height: 1080,
	}));
	const [durationInFrames, setDurationInFrames] = useState(150);

	const onWidthChanged = useCallback((newValue: string) => {
		setSize((s) => {
			return {
				height: s.height,
				width: Number(newValue),
			};
		});
	}, []);

	const onWidthDirectlyChanged = useCallback((newWidth: number) => {
		setSize((s) => {
			return {
				height: s.height,
				width: newWidth,
			};
		});
	}, []);

	const onHeightDirectlyChanged = useCallback((newHeight: number) => {
		setSize((s) => {
			return {
				width: s.width,
				height: newHeight,
			};
		});
	}, []);

	const onHeightChanged = useCallback((newValue: string) => {
		setSize((s) => {
			return {
				width: s.width,
				height: Number(newValue),
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
		setFrameRate(Number(newFps));
	}, []);

	const onFpsChange = useCallback((newFps: number) => {
		setFrameRate(newFps);
	}, []);

	const compNameErrMessage = validateCompositionName(newId, compositions);
	const compWidthErrMessage = validateCompositionDimension('Width', size.width);
	const compHeightErrMessage = validateCompositionDimension(
		'Height',
		size.height,
	);
	const componentName = toPascalCase(newId);

	const valid =
		compNameErrMessage === null &&
		compWidthErrMessage === null &&
		compHeightErrMessage === null;

	const codemod: RecastCodemod = useMemo(() => {
		return {
			type: 'new-composition',
			newDurationInFrames: Number(durationInFrames),
			newFps: Number(selectedFrameRate),
			newHeight: Number(size.height),
			newWidth: Number(size.width),
			newId,
			componentName,
			componentImportPath: `./${componentName}`,
		};
	}, [
		componentName,
		durationInFrames,
		newId,
		selectedFrameRate,
		size.height,
		size.width,
	]);

	const onSuccess = useCallback(() => {
		waitForComposition(newId).then(() => {
			pushUrl(`/${newId}`);
		});
	}, [newId]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback((e) => {
		e.preventDefault();
	}, []);

	return (
		<>
			<ModalHeader title="New composition" />
			<form onSubmit={onSubmit}>
				<div style={content}>
					<div style={optionRow}>
						<div style={label}>ID</div>
						<div style={rightRow}>
							<div>
								<RemotionInput
									value={newId}
									onChange={onNameChange}
									type="text"
									autoFocus
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
					<NewCompDuration
						durationInFrames={durationInFrames}
						setDurationInFrames={setDurationInFrames}
					/>
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
				</div>
				<ModalFooterContainer>
					<CodemodFooter
						loadingNotification="Creating composition..."
						errorNotification="Could not create composition"
						successNotification={`Created ${newId}`}
						genericSubmitLabel="Add to root file"
						submitLabel={({relativeRootPath}) => `Add to ${relativeRootPath}`}
						codemod={codemod}
						stack={null}
						valid={valid}
						onSuccess={onSuccess}
						fallbackToRootFile
					/>
				</ModalFooterContainer>
			</form>
		</>
	);
};

export const NewComposition: React.FC = () => {
	return (
		<DismissableModal>
			<NewCompositionLoaded />
		</DismissableModal>
	);
};
