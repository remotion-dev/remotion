import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/rough-notation/box">
					<strong>{'<Box>'}</strong>
					<div>Draw a box around text</div>
				</TOCItem>
				<TOCItem link="/docs/rough-notation/bracket">
					<strong>{'<Bracket>'}</strong>
					<div>Draw brackets beside text</div>
				</TOCItem>
				<TOCItem link="/docs/rough-notation/circle">
					<strong>{'<Circle>'}</strong>
					<div>Circle text</div>
				</TOCItem>
				<TOCItem link="/docs/rough-notation/crossed-off">
					<strong>{'<CrossedOff>'}</strong>
					<div>Cross off text with two strokes</div>
				</TOCItem>
				<TOCItem link="/docs/rough-notation/highlight">
					<strong>{'<Highlight>'}</strong>
					<div>Draw a marker highlight behind text</div>
				</TOCItem>
				<TOCItem link="/docs/rough-notation/strike-through">
					<strong>{'<StrikeThrough>'}</strong>
					<div>Strike through text with one line</div>
				</TOCItem>
				<TOCItem link="/docs/rough-notation/underline">
					<strong>{'<Underline>'}</strong>
					<div>Underline text</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
