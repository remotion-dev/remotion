import {CreateVideoInternals} from 'create-video';
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {IconForTemplate} from '../components/IconForTemplate';
import './font.css';

export const AllTemplates: React.FC = () => {
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
				<AbsoluteFill>
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
								minWidth: 400,
								color: 'white',
								fontFamily: 'GTPlanar',
								fontSize: 56,
								alignItems: 'center',
							}}
						>
							Starter Templates
						</div>
						<div
							style={{
								flex: 1,
								justifyContent: 'center',
								alignItems: 'center',
								display: 'flex',
							}}
						>
							<div
								style={{
									padding: 50,
									color: '#444',
									fontFamily: 'GTPlanar',
									fontSize: 50,
									display: 'grid',
									gridTemplateColumns: 'repeat(6, 1fr)',
								}}
							>
								{CreateVideoInternals.FEATURED_TEMPLATES.map((template) => {
									if (template.cliId === 'next') {
										// Delete duplicate
										return null;
									}

									if (template.cliId === 'google-tts') {
										// Delete duplicate
										return null;
									}

									return (
										<div
											key={template.cliId}
											style={{
												height: 80,
												width: 80,
												margin: 20,
												justifyContent: 'center',
												alignItems: 'center',
												display: 'flex',
											}}
										>
											<IconForTemplate scale={1.6} template={template} />
										</div>
									);
								})}
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
							<div>
								<div style={{}}>Create videos</div>
								<div style={{}}>programmatically</div>
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
				</AbsoluteFill>
			</div>
		</AbsoluteFill>
	);
};
