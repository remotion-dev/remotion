import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';
import {studioTableOfContents} from './table-of-contents-data';

const renderDescription = (description: string) => {
	return description.split(/(`[^`]+`)/).map((part, index) => {
		if (part.startsWith('`') && part.endsWith('`')) {
			return <code key={index}>{part.slice(1, -1)}</code>;
		}

		return part;
	});
};

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				{studioTableOfContents.map((item) => (
					<TOCItem key={item.link} link={item.link}>
						<strong>{item.label}</strong>
						<div>{renderDescription(item.description)}</div>
					</TOCItem>
				))}
			</Grid>
		</div>
	);
};
