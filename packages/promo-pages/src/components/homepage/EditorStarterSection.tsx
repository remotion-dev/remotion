import React from 'react';

import {SectionTitle} from './VideoAppsTitle';
import {BlueButton, ClearButton} from './layout/Button';

const EditorStarterSection: React.FC = () => {
	return (
		<div>
			<SectionTitle>Build your own video editor</SectionTitle>
			<br />
			<div className={'card flex p-0 overflow-hidden'}>
				<div className={'flex-1 flex flex-col lg:flex-row justify-center'}>
					<div
						className={
							'w-full max-w-[500px] aspect-square relative overflow-hidden bg-[#eee]'
						}
					>
						<img
							src={'/img/editor-starter-demo.jpg'}
							alt="Remotion Editor Starter"
							className={
								'absolute left-0 top-0 w-full h-full object-cover object-top rounded-sm rounded-tr-none rounded-br-none'
							}
						/>
					</div>
					<div className={'p-6 flex-1 flex flex-col h-full'}>
						<div className="text-4xl font-bold fontbrand mt-0">
							Editor Starter
						</div>
						<div className="text-muted mt-4 text-base fontbrand">
							Add to existing project or start from scratch. A comprehensive
							template that includes everything you need to create custom video
							editing applications with React and TypeScript.
						</div>
						<div className="h-5" />
						<div className="flex gap-2 items-center">
							<a
								href="https://www.remotion.pro/editor-starter?ref=remotion.dev"
								target="_blank"
								className="no-underline"
							>
								<BlueButton size="sm" loading={false}>
									Start building
								</BlueButton>
							</a>
							<a
								href="https://editor-starter.remotion.dev?ref=remotion.dev"
								target="_blank"
								className="no-underline"
							>
								<ClearButton size="sm" loading={false}>
									Demo
								</ClearButton>
							</a>{' '}
							<a
								href="https://remotion.dev/editor-starter"
								target="_blank"
								className="no-underline"
							>
								<ClearButton size="sm" loading={false}>
									Docs
								</ClearButton>
							</a>
						</div>
						<br />
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditorStarterSection;
