import {Card} from '@remotion/design';
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
		<div>
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
					className="text-sm mt-2.5 text-gray-500 mb-2.5"
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
				<p className="text-center mb-[50px]">
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
								<Card className="p-3.5 flex flex-col relative cursor-pointer text-[var(--text-color)] no-underline h-full">
									<Item
										label={template.homePageLabel}
										description={template.description}
									>
										<IconForTemplate scale={0.7} template={template} />
									</Item>
								</Card>
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
						<Card className="p-3.5 flex flex-col relative cursor-pointer text-[var(--text-color)] no-underline h-full">
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
						</Card>
					</a>
					<a
						key={'mapbox-globe'}
						className="no-underline"
						href={`https://www.remotion.pro/mapbox-globe`}
					>
						<Card className="p-3.5 flex flex-col relative cursor-pointer text-[var(--text-color)] no-underline h-full">
							<Item
								label={'Mapbox Globe'}
								description={'A rotateable and zoomeable 3D Globe'}
							>
								<svg
									style={{height: 0.7 * 36, overflow: 'visible'}}
									viewBox="0 0 512 512"
								>
									<path
										fill="currentcolor"
										d="M256 464c7.4 0 27-7.2 47.6-48.4c8.8-17.7 16.4-39.2 22-63.6H186.4c5.6 24.4 13.2 45.9 22 63.6C229 456.8 248.6 464 256 464zM178.5 304h155c1.6-15.3 2.5-31.4 2.5-48s-.9-32.7-2.5-48h-155c-1.6 15.3-2.5 31.4-2.5 48s.9 32.7 2.5 48zm7.9-144H325.6c-5.6-24.4-13.2-45.9-22-63.6C283 55.2 263.4 48 256 48s-27 7.2-47.6 48.4c-8.8 17.7-16.4 39.2-22 63.6zm195.3 48c1.5 15.5 2.2 31.6 2.2 48s-.8 32.5-2.2 48h76.7c3.6-15.4 5.6-31.5 5.6-48s-1.9-32.6-5.6-48H381.8zm58.8-48c-21.4-41.1-56.1-74.1-98.4-93.4c14.1 25.6 25.3 57.5 32.6 93.4h65.9zm-303.3 0c7.3-35.9 18.5-67.7 32.6-93.4c-42.3 19.3-77 52.3-98.4 93.4h65.9zM53.6 208c-3.6 15.4-5.6 31.5-5.6 48s1.9 32.6 5.6 48h76.7c-1.5-15.5-2.2-31.6-2.2-48s.8-32.5 2.2-48H53.6zM342.1 445.4c42.3-19.3 77-52.3 98.4-93.4H374.7c-7.3 35.9-18.5 67.7-32.6 93.4zm-172.2 0c-14.1-25.6-25.3-57.5-32.6-93.4H71.4c21.4 41.1 56.1 74.1 98.4 93.4zM256 512A256 256 0 1 1 256 0a256 256 0 1 1 0 512z"
									/>
								</svg>
							</Item>
						</Card>
					</a>
					<a
						key={'watercolor-map'}
						className="no-underline"
						href={`https://www.remotion.pro/watercolor-map`}
					>
						<Card className="p-3.5 flex flex-col relative cursor-pointer text-[var(--text-color)] no-underline h-full">
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
						</Card>
					</a>
					<a
						key={'timeline'}
						className="no-underline"
						href={`https://www.remotion.pro/timeline`}
					>
						<Card className="p-3.5 flex flex-col relative cursor-pointer text-[var(--text-color)] no-underline h-full">
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
						</Card>
					</a>
				</div>

				<br />
				<p className="text-center text-gray-500">
					{"Couldn't"} find what you need? Check out the list of{' '}
					<a href={'/docs/resources'}>Resources</a>.
				</p>
			</div>
			<br />
		</>
	);
};
