import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {articles} from '../data/articles';
import './font.css';

export const Article: React.FC<{
	readonly articleRelativePath: string;
}> = ({articleRelativePath}) => {
	const article = articles.find((e) => e.relativePath === articleRelativePath);
	if (!article) {
		return null;
	}

	const longestTitle = Math.max(
		...article.title.split(' ').map((p) => p.length),
	);

	const fontSize = longestTitle > 20 ? 70 : 80;

	return (
		<AbsoluteFill
			style={{
				height: '100%',
				width: '100%',
				display: 'flex',
				backgroundColor: '#fff',
				fontSize: 32,
				fontWeight: 700,
				justifyContent: 'center',
				alignItems: 'center',
				padding: 60,
				fontFamily: 'GTPlanar',
			}}
		>
			<div>
				{article.crumb ? (
					<div
						style={{
							flexDirection: 'row',
							display: 'flex',
							paddingLeft: 30,
						}}
					>
						<div
							style={{
								display: 'inline-flex',
								flexDirection: 'row',
								alignItems: 'center',
								padding: '15px 30px',
								translate: '0px 30px',
								backgroundColor: 'white',
							}}
						>
							{article.crumb}
						</div>
					</div>
				) : null}

				<div
					style={{
						display: 'flex',
						flex: 1,
						flexDirection: 'row',
					}}
				>
					<div
						style={{
							backgroundColor: '#0B84F3',
							display: 'flex',
							padding: 50,
							minWidth: 500,
							width: '100%',
						}}
					>
						<div
							style={{
								color: 'white',
								fontFamily: 'GTPlanar',
								fontSize,
							}}
						>
							{article.title}
						</div>
					</div>
				</div>

				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						height: 120,
						backgroundColor: '#222',
						paddingRight: 40,
					}}
				>
					<div
						style={{
							flex: 1,
							fontFamily: 'GTPlanar',
							color: 'white',
							height: '100%',
							display: 'flex',
							alignItems: 'center',
							paddingLeft: 40,
							fontWeight: 300,
							fontSize: 20,
							marginRight: 200,
						}}
					>
						Make videos
						<br />
						programmatically
					</div>
					<div
						style={{
							height: '100%',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Img
							style={{
								height: 60,
							}}
							src="https://www.remotion.dev/img/remotion-white.png"
						/>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
