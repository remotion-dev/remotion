import React from 'react';
import {RED} from './layout/colors';

export const TitleStep: React.FC<{
	readonly children: React.ReactNode;
	readonly error?: boolean;
}> = ({children, error}) => {
	return (
		<div
			style={{
				backgroundColor: error ? RED : 'var(--ifm-color-primary)',
				height: '1em',
				width: '1em',
				borderRadius: '50%',
				padding: 6,
				fontSize: '0.7em',
				lineHeight: '1',
				display: 'inline-flex',
				color: 'white',
				justifyContent: 'center',
				alignItems: 'center',
				fontWeight: 'bold',
				fontFeatureSettings: '"ss03" on',
				boxSizing: 'content-box',
				marginRight: 8,
			}}
		>
			{children}
		</div>
	);
};

export const InlineStep: React.FC<{
	readonly children: React.ReactNode;
	readonly error?: boolean;
}> = ({children, error}) => {
	return (
		<div
			style={{
				backgroundColor: error ? RED : 'var(--ifm-color-primary)',
				height: 24,
				width: 24,
				display: 'inline-flex',
				color: 'white',
				justifyContent: 'center',
				alignItems: 'center',
				borderRadius: 12,
				fontSize: 13,
				fontWeight: 'bold',
				verticalAlign: 'top',
				fontFeatureSettings: '"ss03" on',
			}}
		>
			{children}
		</div>
	);
};

export const Step: React.FC<{
	readonly children: React.ReactNode;
	readonly error?: boolean;
}> = ({children, error}) => {
	return (
		<a
			id={children!.toString()}
			style={{
				marginRight: 7,
				display: 'inline-block',
				position: 'relative',
				marginTop: 4,
				marginBottom: 4,
				cursor: 'pointer',
				textDecoration: 'none',
			}}
			href={`#${children!.toString()}`}
		>
			<InlineStep error={error}>{children}</InlineStep>{' '}
		</a>
	);
};
