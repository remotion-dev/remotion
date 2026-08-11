import {useColorMode} from '@docusaurus/theme-common';
// @ts-expect-error
import LinkItem from '@theme/Footer/LinkItem';
import React, {useEffect, useState} from 'react';

const footerTitle: React.CSSProperties = {
	fontFamily: 'GTPlanar',
};

const ColumnLinkItem = ({item}) => {
	return item.html ? (
		<li
			// Developer provided the HTML, so assume it's safe.
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={{__html: item.html}}
			className="footer__item"
		/>
	) : (
		<li key={item.href ?? item.to} className="footer__item">
			<LinkItem item={item} />
		</li>
	);
};

const Column = ({column}) => {
	return (
		<div className="footer__col remotion-footer__column">
			<div style={footerTitle} className="footer__title">
				{column.title}
			</div>
			<ul className="footer__items clean-list">
				{column.items.map((item, i) => (
					// eslint-disable-next-line react/no-array-index-key
					<ColumnLinkItem key={i} item={item} />
				))}
			</ul>
		</div>
	);
};

export default ({columns}) => {
	const {colorMode} = useColorMode();
	const [src, setSrc] = useState('/img/new-logo.png');

	useEffect(() => {
		if (colorMode === 'dark') {
			setSrc('/img/remotion-white.png');
		} else {
			setSrc('/img/new-logo.png');
		}
	}, [colorMode]);

	return (
		<div className="footer__links remotion-footer__links">
			<div className="remotion-footer__brand">
				<img
					key={colorMode}
					src={src}
					alt="Remotion"
					className="remotion-footer__logo"
				/>
				<p className="remotion-footer__copyright">
					© Copyright {new Date().getFullYear()} Remotion AG. <br /> Website
					created with Docusaurus.
				</p>
			</div>
			<div className="remotion-footer__categories">
				{columns.map((column, i) => (
					// eslint-disable-next-line react/no-array-index-key
					<Column key={i} column={column} />
				))}
			</div>
		</div>
	);
};
