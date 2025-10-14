import {useCallback, useContext, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {BLUE, LIGHT_TEXT} from '../helpers/colors';
import {ModalsContext} from '../state/modals';
import {Button} from './Button';
import {DismissableModal} from './NewComposition/DismissableModal';
import {RemTextarea} from './NewComposition/RemTextarea';
import {Flex, Spacing} from './layout';

const style: React.CSSProperties = {
	padding: 12,
	width: 500,
};

const label: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 14,
	marginBottom: 10,
};

const textAreaStyle: React.CSSProperties = {
	fontFamily: 'monospace',
	minHeight: 200,
};

const codeSnippet: React.CSSProperties = {
	fontSize: 14,
	color: BLUE,
	fontFamily: 'monospace',
};

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
};

const isValidJSON = (value: string) => {
	try {
		JSON.parse(value);
		return true;
	} catch {
		return false;
	}
};

const Inner: React.FC<{}> = () => {
	const [value, setValue] = useState<string | null>(() => {
		const override = Internals.getInputPropsOverride();
		if (override) {
			return JSON.stringify(override, null, 2);
		}

		return null;
	});

	const {setSelectedModal} = useContext(ModalsContext);

	const valid = useMemo(() => {
		if (!value) return true;

		return isValidJSON(value);
	}, [value]);

	const onChange = useCallback(
		(newValue: string) => {
			if (newValue.trim() === '') {
				setValue(null);
				Internals.setInputPropsOverride(null);
				return;
			}

			setValue(newValue);

			if (!isValidJSON(newValue)) {
				return;
			}

			Internals.setInputPropsOverride(JSON.parse(newValue));
		},
		[setValue],
	);

	const onReset = useCallback(() => {
		onChange('');
	}, [onChange]);

	const onReloadPage = useCallback(() => {
		window.location.reload();
	}, []);

	const onDone = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	return (
		<div style={style}>
			<div style={label}>
				Enter a valid JSON to override the value that{' '}
				<code style={codeSnippet}>getInputProps()</code> returns to preview a
				composition with different props. The Studio must be reloaded to see the
				changes.
			</div>
			<RemTextarea
				onChange={(e) => onChange(e.target.value)}
				value={value ?? ''}
				status={valid ? 'ok' : 'error'}
				style={textAreaStyle}
			/>
			<div style={row}>
				<Button onClick={onReset}>Reset</Button>
				<Spacing x={0.5} />
				<Button onClick={onReloadPage}>Reload page</Button>
				<Flex />
				<Button onClick={onDone}>Done</Button>
			</div>
		</div>
	);
};

export const OverrideInputPropsModal: React.FC = () => {
	return (
		<DismissableModal>
			<Inner />
		</DismissableModal>
	);
};
