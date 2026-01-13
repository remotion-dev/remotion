import React from 'react';
import {Checkbox} from '~/components/ui/checkbox';

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	fontFamily: 'GTPlanar',
	paddingBottom: 20,
	paddingTop: 9,
};

const valueLabel: React.CSSProperties = {
	fontVariantNumeric: 'tabular-nums',
};

export const SliderLabel: React.FC<{
	readonly label: string;
	readonly value: number | null;
	readonly toggleable: null | ((newValue: boolean) => void);
	readonly suffix?: string;
}> = ({label, value, toggleable, suffix}) => {
	return (
		<div style={row}>
			<div style={{flex: 1}}>
				{toggleable ? (
					<Checkbox
						id={label}
						checked={Boolean(value)}
						onCheckedChange={toggleable}
					/>
				) : null}{' '}
				<label htmlFor={label}>{label}</label>
			</div>
			<div style={{...valueLabel, opacity: value === null ? 0.5 : 1}}>
				{value !== null ? `${value}${suffix ?? ''}` : 'undefined'}
			</div>
		</div>
	);
};
