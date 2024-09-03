import React from 'react';
import {LIGHT_TEXT, TEXT_COLOR} from '../helpers/colors';

const FONT_SIZE = 13;

export const InstallablePackageComp: React.FC<{
	readonly isInstalled: boolean;
	readonly pkg: string;
	readonly link: string;
	readonly description: string;
}> = ({isInstalled, pkg, link, description}) => {
	return (
		<div
			style={{
				fontSize: FONT_SIZE,
				lineHeight: 1.2,
				paddingBottom: 4,
				paddingTop: 4,
			}}
		>
			<a
				href={link}
				style={{
					fontSize: FONT_SIZE,
					color: TEXT_COLOR,
					textDecoration: 'none',
				}}
				target="_blank"
			>
				{pkg}
			</a>{' '}
			{isInstalled ? (
				<span style={{opacity: 0.3, fontSize: 'inherit'}}>(installed)</span>
			) : null}
			<br />
			<span style={{color: LIGHT_TEXT, fontSize: FONT_SIZE}}>
				{description}
			</span>
		</div>
	);
};
