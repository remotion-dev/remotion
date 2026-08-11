import {CreateVideoInternals} from 'create-video';
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {IconForTemplate} from '../components/IconForTemplate';
import './font.css';

export const TemplateComp: React.FC<{
	readonly templateId: string;
}> = ({templateId}) => {
	const template = CreateVideoInternals.FEATURED_TEMPLATES.find(
		(t) => t.cliId === templateId,
	);
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
						Starter Template
					</div>
				</div>

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
							color: 'white',
							fontFamily: 'GTPlanar',
							fontSize: 50,
							alignItems: 'center',
						}}
					>
						{template!.cliId === 'next' ||
						template!.cliId === 'next-tailwind' ||
						template!.cliId === 'next-pages-dir' ? null : (
							<>
								<IconForTemplate scale={1.6} template={template!} />{' '}
								<div
									style={{
										width: 25,
										display: 'inline-block',
									}}
								/>
							</>
						)}

						{template!.shortName}
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
						<div>
							<div style={{opacity: 0.7}}>Install this template</div>
							<div>npx create-video@latest --template {template!.cliId}</div>
						</div>
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
