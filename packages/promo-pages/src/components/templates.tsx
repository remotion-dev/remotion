import {Button} from '@remotion/design';
import {CreateVideoInternals} from 'create-video';
import React from 'react';
import {IconForTemplate} from './homepage/IconForTemplate';
import {EditorIcon} from './icons/editor';
import {SkiaIcon} from './icons/skia';
import {TimelineIcon} from './icons/timeline';

const Item: React.FC<{
	readonly label: string;
	readonly description: string;
	readonly children: React.ReactNode;
}> = ({children, label, description}) => {
	return (
		<div className="h-full w-full flex-1">
			<div className="flex flex-row items-center">
				<div className="flex mr-2.5 h-[30px] w-[30px] justify-center items-center">
					{children}
				</div>
				<div className="font-bold">{label}</div>
			</div>
			<div>
				<p
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{
						__html: description,
					}}
					className="text-sm mt-2.5 text-gray-500 dark:text-gray-200 mb-2.5"
				/>
			</div>
		</div>
	);
};

export const Templates: React.FC = () => {
	return (
		<>
			<div className="max-w-[1000px] mx-auto px-5 bg-[var(--background)]">
				<h1 className="text-4xl  md:text-7xl lg:text-8xl font-black leading-none mt-[75px] text-center mb-10">
					Find the right
					<br />
					template
				</h1>
				<p className="text-center mb-[50px] font-brand">
					Jumpstart your project with a template that fits your usecase.
				</p>
				<h3>Free templates</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[15px]">
					{CreateVideoInternals.FEATURED_TEMPLATES.map((template) => {
						return (
							<a
								key={template.cliId}
								href={`/templates/${template.cliId}`}
								className="no-underline"
							>
								<Button
									depth={0.5}
									className="justify-start text-left p-3.5 flex flex-col relative cursor-pointer text-[var(--text-color)] no-underline h-full w-full items-start"
								>
									<Item
										label={template.homePageLabel}
										description={template.description}
									>
										<IconForTemplate scale={0.7} template={template} />
									</Item>
								</Button>
							</a>
						);
					})}
				</div>
				<br />
				<br />
				<h3>Paid templates</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[15px]">
					<a
						key={'editor-starter'}
						className="no-underline"
						href={`https://www.remotion.pro/editor-starter`}
					>
						<Button
							depth={0.5}
							className="text-left p-3.5 flex flex-col relative cursor-pointer text-[var(--text-color)] no-underline h-full w-full items-start"
						>
							<Item
								label={'Editor Starter'}
								description={'A boilerplate for starting your own video editor'}
							>
								<EditorIcon
									style={{
										height: 0.7 * 32,
										overflow: 'visible',
									}}
								/>
							</Item>
						</Button>
					</a>

					<a
						key={'watercolor-map'}
						className="no-underline"
						href={`https://www.remotion.pro/watercolor-map`}
					>
						<Button
							depth={0.5}
							className="text-left p-3.5 flex flex-col relative cursor-pointer text-[var(--text-color)] no-underline h-full w-full items-start"
						>
							<Item
								label={'Watercolor Map'}
								description={'A beautiful 2D map for travel videos'}
							>
								<SkiaIcon
									style={{
										height: 0.7 * 32,
										overflow: 'visible',
									}}
								/>
							</Item>
						</Button>
					</a>
					<a
						key={'timeline'}
						className="no-underline"
						href={`https://www.remotion.pro/timeline`}
					>
						<Button
							depth={0.5}
							className="text-left p-3.5 flex flex-col relative cursor-pointer text-[var(--text-color)] no-underline h-full w-full items-start"
						>
							<Item
								label={'<Timeline />'}
								description={
									'A copy pasteable component for timeline-based editing'
								}
							>
								<TimelineIcon
									style={{
										height: 0.7 * 32,
									}}
								/>
							</Item>
						</Button>
					</a>
				</div>

				<br />
				<p className="text-center text-gray-500 font-brand text-sm">
					{"Couldn't"} find what you need? Find more in the list of{' '}
					<a href={'/docs/resources'}>Resources</a>.
				</p>
			</div>
			<br />
		</>
	);
};
