import React from "react";
import { Grid } from "../../components/TableOfContents/Grid";
import { TOCItem } from "../../components/TableOfContents/TOCItem";

export const TableOfContents: React.FC = () => {
	return (
		<div>
			<Grid>
				<TOCItem link="/docs/layout-utils/measure-text">
					<strong>measureText()</strong>
					<div>Get dimensions of text</div>
				</TOCItem>
				<TOCItem link="/docs/layout-utils/fill-text-box">
					<strong>fillTextBox()</strong>
					<div>Find line breaks and overflows in a text box</div>
				</TOCItem>
				<TOCItem link="/docs/layout-utils/fit-text">
					<strong>fitText()</strong>
					<div>Get font size to fit text in a box</div>
				</TOCItem>
				<TOCItem link="/docs/layout-utils/fit-text-on-n-lines">
					<strong>fitTextOnNLines()</strong>
					<div>Get font size to fit text on n lines</div>
				</TOCItem>
			</Grid>
		</div>
	);
};
