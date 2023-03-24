import React, {useCallback} from 'react';
import {Button} from '../../../preview-server/error-overlay/remotion-overlay/Button';
import {Flex} from '../layout';
import {RemTextarea} from '../NewComposition/RemTextarea';
import {ValidationMessage} from '../NewComposition/ValidationMessage';

type State = {
	value: string;
	validJSON: boolean;
};

const parseJSON = (
	str: string
): {
	value: unknown;
	validJSON: boolean;
} => {
	try {
		const parsed = JSON.parse(str);
		return {value: parsed, validJSON: true};
	} catch (e) {
		return {value: null, validJSON: false};
	}
};

const style: React.CSSProperties = {
	fontFamily: 'monospace',
	height: 400,
};

const bottomRow: React.CSSProperties = {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	flexDirection: 'row',
};

export const RenderModalJSONInputPropsEditor: React.FC<{
	value: unknown;
	setValue: React.Dispatch<React.SetStateAction<unknown>>;
}> = ({setValue, value}) => {
	const [localValue, setLocalValue] = React.useState<State>({
		validJSON: true,
		value: JSON.stringify(value, null, 2),
	});

	const onPretty = useCallback(() => {
		if (!localValue.validJSON) {
			return;
		}

		const parsed = JSON.parse(localValue.value);
		setLocalValue({...localValue, value: JSON.stringify(parsed, null, 2)});
	}, [localValue]);

	return (
		<div>
			<RemTextarea
				onChange={(e) => {
					const parsed = parseJSON(e.target.value);
					setLocalValue({value: e.target.value, validJSON: parsed.validJSON});

					if (parsed.validJSON) {
						setValue(parsed.value);
					}
				}}
				value={localValue.value}
				status={localValue.validJSON ? 'ok' : 'error'}
				style={style}
			/>
			<div style={bottomRow}>
				{!localValue.validJSON && (
					<ValidationMessage
						align="flex-start"
						message="JSON is invalid"
						type="error"
					/>
				)}
				<Flex />
				<Button disabled={!localValue.validJSON} onClick={onPretty}>
					Pretty
				</Button>
			</div>
		</div>
	);
};
