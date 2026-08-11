import {Card, Triangle} from '@remotion/design';
import type {Template} from 'create-video';
import React, {useCallback, useState} from 'react';
import {cn} from '../cn';
import {useMobileLayout} from '../helpers/mobile-layout';
import {BackButton} from './BackButton';
import {CommandCopyButton} from './CommandCopyButton';
import {MuxVideo} from './homepage/MuxVideo';
import {Tailwind} from './icons/tailwind';

const RESERVED_FOR_SIDEBAR = 350;

const GithubIcon: React.FC = () => {
	return (
		<svg viewBox="0 0 496 512" height="22" width="22">
			<path
				fill="currentColor"
				d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
			/>
		</svg>
	);
};

const StackBlitzIcon: React.FC = () => {
	return (
		<svg viewBox="0 0 28 28" aria-hidden="true" width="24" height="24">
			<path
				fill="currentColor"
				d="M12.747 16.273h-7.46L18.925 1.5l-3.671 10.227h7.46L9.075 26.5l3.671-10.227z"
			/>
		</svg>
	);
};

const PreviewIcon: React.FC = () => {
	return (
		<svg viewBox="0 0 512 512" aria-hidden="true" width="24" height="24">
			<path
				fill="currentColor"
				d="M368 208A160 160 0 1 0 48 208a160 160 0 1 0 320 0zM337.1 371.1C301.7 399.2 256.8 416 208 416C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208c0 48.8-16.8 93.7-44.9 129.1l124 124 17 17L478.1 512l-17-17-124-124zM145.8 116.2l24 14 110.2 64L303.9 208 280 221.8l-110.2 64-24 14V272 144 116.2z"
			/>
		</svg>
	);
};

let copyTimeout: Timer | null = null;

export const TemplateModalContent: React.FC<{
	readonly template: Template;
}> = ({template}) => {
	const [copied, setCopied] = useState<string | false>(false);

	const mobileLayout = useMobileLayout();

	const copyCommand = useCallback(async (command: string) => {
		clearTimeout(copyTimeout!);
		const permissionName = 'clipboard-write' as PermissionName;
		try {
			const result = await navigator.permissions.query({
				name: permissionName,
			});
			if (result.state === 'granted' || result.state === 'prompt') {
				await navigator.clipboard.writeText(command);
				setCopied(command);
			}
		} catch {
			// eslint-disable-next-line no-alert
			alert('Copying is not supported on this device');
		}

		copyTimeout = setTimeout(() => {
			setCopied(false);
		}, 2000);
	}, []);

	const npmCommand = `npx create-video@latest --${template.cliId}`;
	const pnpmCommand = `pnpm create video --${template.cliId}`;
	const bunCommand = `bun create video --${template.cliId}`;

	return (
		<div>
			<BackButton
				link="/templates"
				text="Back to Templates"
				color="currentcolor"
			/>
			<h1 className="mt-0">{template.shortName}</h1>
			<Card className="mb-7 overflow-hidden w-full">
				<div
					className={`mb-0 flex overflow-auto ${mobileLayout ? 'flex-col h-full left-0 top-0' : 'flex-row'} w-full border-b-2 border-black`}
				>
					<div
						className={cn(
							'flex w-full border-black flex-row',
							mobileLayout ? 'border-b-2' : 'border-r-2',
						)}
						style={{
							aspectRatio:
								template.type === 'video'
									? `${template.promoVideo.width} / ${template.promoVideo.height}`
									: undefined,
							flex: 1,
							maxHeight: 500,
						}}
					>
						{template.type === 'video' ? (
							<MuxVideo
								muxId={template.promoVideo.muxId}
								loop
								autoPlay
								muted
								playsInline
								style={{
									aspectRatio: `${template.promoVideo.width} / ${template.promoVideo.height}`,
									width: '100%',
									height: 'auto',
									overflow: 'hidden',
									display: 'block',
								}}
							/>
						) : (
							<img
								src={template.promoBanner.src}
								className="w-full h-auto border border-[var(--ifm-color-emphasis-300)]"
							/>
						)}
					</div>
					<div
						className={`overflow-auto ${mobileLayout ? 'w-full' : ''} p-5 font-brand`}
						style={{
							width: mobileLayout ? '100%' : RESERVED_FOR_SIDEBAR,
						}}
					>
						<div className="flex flex-row items-center pt-1 pb-1 align-middle pr-4">
							<a
								className="text-inherit inline-flex flex-row items-center cursor-pointer select-none"
								onPointerDown={() => copyCommand(npmCommand)}
							>
								<div className="w-6 h-9 mr-3 inline-flex items-center justify-center">
									<CommandCopyButton
										customSvg={
											<svg
												viewBox="0 0 2500 2500"
												xmlns="http://www.w3.org/2000/svg"
												className="h-5"
											>
												<path d="M0 0h2500v2500H0z" fill="#CB0201" />
												<path
													d="M1241.5 268.5h-973v1962.9h972.9V763.5h495v1467.9h495V268.5z"
													fill="white"
												/>
											</svg>
										}
										copied={copied === npmCommand}
									/>
								</div>
								<div className="mr-3">{npmCommand}</div>
							</a>
						</div>
						<div className="flex flex-row items-center pt-1 pb-1 align-middle pr-4">
							<a
								target="_blank"
								className="text-inherit inline-flex flex-row items-center cursor-pointer select-none"
								onPointerDown={() => copyCommand(bunCommand)}
							>
								<div className="w-6 h-9 mr-3 inline-flex items-center justify-center">
									<CommandCopyButton
										customSvg={
											<svg
												id="Bun"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 80 70"
												className="h-5"
											>
												<path
													id="Shadow"
													d="M71.09,20.74c-.16-.17-.33-.34-.5-.5s-.33-.34-.5-.5-.33-.34-.5-.5-.33-.34-.5-.5-.33-.34-.5-.5-.33-.34-.5-.5-.33-.34-.5-.5A26.46,26.46,0,0,1,75.5,35.7c0,16.57-16.82,30.05-37.5,30.05-11.58,0-21.94-4.23-28.83-10.86l.5.5.5.5.5.5.5.5.5.5.5.5.5.5C19.55,65.3,30.14,69.75,42,69.75c20.68,0,37.5-13.48,37.5-30C79.5,32.69,76.46,26,71.09,20.74Z"
												/>
												<g id="Body">
													<path
														id="Background"
														d="M73,35.7c0,15.21-15.67,27.54-35,27.54S3,50.91,3,35.7C3,26.27,9,17.94,18.22,13S33.18,3,38,3s8.94,4.13,19.78,10C67,17.94,73,26.27,73,35.7Z"
														style={{fill: '#fbf0df'}}
													/>
													<path
														id="Bottom_Shadow"
														data-name="Bottom Shadow"
														d="M73,35.7a21.67,21.67,0,0,0-.8-5.78c-2.73,33.3-43.35,34.9-59.32,24.94A40,40,0,0,0,38,63.24C57.3,63.24,73,50.89,73,35.7Z"
														style={{fill: '#f6dece'}}
													/>
													<path
														id="Light_Shine"
														data-name="Light Shine"
														d="M24.53,11.17C29,8.49,34.94,3.46,40.78,3.45A9.29,9.29,0,0,0,38,3c-2.42,0-5,1.25-8.25,3.13-1.13.66-2.3,1.39-3.54,2.15-2.33,1.44-5,3.07-8,4.7C8.69,18.13,3,26.62,3,35.7c0,.4,0,.8,0,1.19C9.06,15.48,20.07,13.85,24.53,11.17Z"
														style={{fill: '#fffefc'}}
													/>
													<path
														id="Top"
														d="M35.12,5.53A16.41,16.41,0,0,1,29.49,18c-.28.25-.06.73.3.59,3.37-1.31,7.92-5.23,6-13.14C35.71,5,35.12,5.12,35.12,5.53Zm2.27,0A16.24,16.24,0,0,1,39,19c-.12.35.31.65.55.36C41.74,16.56,43.65,11,37.93,5,37.64,4.74,37.19,5.14,37.39,5.49Zm2.76-.17A16.42,16.42,0,0,1,47,17.12a.33.33,0,0,0,.65.11c.92-3.49.4-9.44-7.17-12.53C40.08,4.54,39.82,5.08,40.15,5.32ZM21.69,15.76a16.94,16.94,0,0,0,10.47-9c.18-.36.75-.22.66.18-1.73,8-7.52,9.67-11.12,9.45C21.32,16.4,21.33,15.87,21.69,15.76Z"
														style={{fill: '#ccbea7', fillRule: 'evenodd'}}
													/>
													<path
														id="Outline"
														d="M38,65.75C17.32,65.75.5,52.27.5,35.7c0-10,6.18-19.33,16.53-24.92,3-1.6,5.57-3.21,7.86-4.62,1.26-.78,2.45-1.51,3.6-2.19C32,1.89,35,.5,38,.5s5.62,1.2,8.9,3.14c1,.57,2,1.19,3.07,1.87,2.49,1.54,5.3,3.28,9,5.27C69.32,16.37,75.5,25.69,75.5,35.7,75.5,52.27,58.68,65.75,38,65.75ZM38,3c-2.42,0-5,1.25-8.25,3.13-1.13.66-2.3,1.39-3.54,2.15-2.33,1.44-5,3.07-8,4.7C8.69,18.13,3,26.62,3,35.7,3,50.89,18.7,63.25,38,63.25S73,50.89,73,35.7C73,26.62,67.31,18.13,57.78,13,54,11,51.05,9.12,48.66,7.64c-1.09-.67-2.09-1.29-3-1.84C42.63,4,40.42,3,38,3Z"
													/>
												</g>
												<g id="Mouth">
													<g id="Background-2" data-name="Background">
														<path
															d="M45.05,43a8.93,8.93,0,0,1-2.92,4.71,6.81,6.81,0,0,1-4,1.88A6.84,6.84,0,0,1,34,47.71,8.93,8.93,0,0,1,31.12,43a.72.72,0,0,1,.8-.81H44.26A.72.72,0,0,1,45.05,43Z"
															style={{fill: '#b71422'}}
														/>
													</g>
													<g id="Tongue">
														<path
															id="Background-3"
															data-name="Background"
															d="M34,47.79a6.91,6.91,0,0,0,4.12,1.9,6.91,6.91,0,0,0,4.11-1.9,10.63,10.63,0,0,0,1-1.07,6.83,6.83,0,0,0-4.9-2.31,6.15,6.15,0,0,0-5,2.78C33.56,47.4,33.76,47.6,34,47.79Z"
															style={{fill: '#ff6164'}}
														/>
														<path
															id="Outline-2"
															data-name="Outline"
															d="M34.16,47a5.36,5.36,0,0,1,4.19-2.08,6,6,0,0,1,4,1.69c.23-.25.45-.51.66-.77a7,7,0,0,0-4.71-1.93,6.36,6.36,0,0,0-4.89,2.36A9.53,9.53,0,0,0,34.16,47Z"
														/>
													</g>
													<path
														id="Outline-3"
														data-name="Outline"
														d="M38.09,50.19a7.42,7.42,0,0,1-4.45-2,9.52,9.52,0,0,1-3.11-5.05,1.2,1.2,0,0,1,.26-1,1.41,1.41,0,0,1,1.13-.51H44.26a1.44,1.44,0,0,1,1.13.51,1.19,1.19,0,0,1,.25,1h0a9.52,9.52,0,0,1-3.11,5.05A7.42,7.42,0,0,1,38.09,50.19Zm-6.17-7.4c-.16,0-.2.07-.21.09a8.29,8.29,0,0,0,2.73,4.37A6.23,6.23,0,0,0,38.09,49a6.28,6.28,0,0,0,3.65-1.73,8.3,8.3,0,0,0,2.72-4.37.21.21,0,0,0-.2-.09Z"
													/>
												</g>
												<g id="Face">
													<ellipse
														id="Right_Blush"
														data-name="Right Blush"
														cx="53.22"
														cy="40.18"
														rx="5.85"
														ry="3.44"
														style={{fill: '#febbd0'}}
													/>
													<ellipse
														id="Left_Bluch"
														data-name="Left Bluch"
														cx="22.95"
														cy="40.18"
														rx="5.85"
														ry="3.44"
														style={{fill: '#febbd0'}}
													/>
													<path
														id="Eyes"
														d="M25.7,38.8a5.51,5.51,0,1,0-5.5-5.51A5.51,5.51,0,0,0,25.7,38.8Zm24.77,0A5.51,5.51,0,1,0,45,33.29,5.5,5.5,0,0,0,50.47,38.8Z"
														style={{fillRule: 'evenodd'}}
													/>
													<path
														id="Iris"
														d="M24,33.64a2.07,2.07,0,1,0-2.06-2.07A2.07,2.07,0,0,0,24,33.64Zm24.77,0a2.07,2.07,0,1,0-2.06-2.07A2.07,2.07,0,0,0,48.75,33.64Z"
														style={{fill: '#fff', fillRule: 'evenodd'}}
													/>
												</g>
											</svg>
										}
										copied={copied === bunCommand}
									/>
								</div>
								<div className="mr-3">{bunCommand}</div>
							</a>
						</div>
						<div className="flex flex-row items-center pt-1 pb-1 align-middle pr-4">
							<a
								className="text-inherit inline-flex flex-row items-center cursor-pointer select-none"
								onPointerDown={() => copyCommand(pnpmCommand)}
							>
								<div className="w-6 h-9 mr-3 inline-flex items-center justify-center">
									<CommandCopyButton
										customSvg={
											<svg
												version="1.1"
												xmlns="http://www.w3.org/2000/svg"
												preserveAspectRatio="xMidYMid meet"
												viewBox="76.58987244897958 44 164.00775510204068 164"
												width="160.01"
												height="160"
												className="h-5"
											>
												<defs>
													<path
														d="M237.6 95L187.6 95L187.6 45L237.6 45L237.6 95Z"
														id="b45vdTD8hs"
													/>
													<path
														d="M182.59 95L132.59 95L132.59 45L182.59 45L182.59 95Z"
														id="a40WtxIl8d"
													/>
													<path
														d="M127.59 95L77.59 95L77.59 45L127.59 45L127.59 95Z"
														id="h2CN9AEEpe"
													/>
													<path
														d="M237.6 150L187.6 150L187.6 100L237.6 100L237.6 150Z"
														id="dqv5133G8"
													/>
													<path
														d="M182.59 150L132.59 150L132.59 100L182.59 100L182.59 150Z"
														id="b1Lv79ypvm"
													/>
													<path
														d="M182.59 205L132.59 205L132.59 155L182.59 155L182.59 205Z"
														id="hy1IZWwLX"
													/>
													<path
														d="M237.6 205L187.6 205L187.6 155L237.6 155L237.6 205Z"
														id="akQfjxQes"
													/>
													<path
														d="M127.59 205L77.59 205L77.59 155L127.59 155L127.59 205Z"
														id="bdSrwE5pk"
													/>
												</defs>
												<g>
													<g>
														<use
															xlinkHref="#b45vdTD8hs"
															opacity="1"
															fill="#f9ad00"
															fillOpacity="1"
														/>
													</g>
													<g>
														<use
															xlinkHref="#a40WtxIl8d"
															opacity="1"
															fill="#f9ad00"
															fillOpacity="1"
														/>
													</g>
													<g>
														<use
															xlinkHref="#h2CN9AEEpe"
															opacity="1"
															fill="#f9ad00"
															fillOpacity="1"
														/>
													</g>
													<g>
														<use
															xlinkHref="#dqv5133G8"
															opacity="1"
															fill="#f9ad00"
															fillOpacity="1"
														/>
													</g>
													<g>
														<use
															xlinkHref="#b1Lv79ypvm"
															opacity="1"
															fill="currentColor"
															fillOpacity="1"
														/>
													</g>
													<g>
														<use
															xlinkHref="#hy1IZWwLX"
															opacity="1"
															fill="currentColor"
															fillOpacity="1"
														/>
													</g>
													<g>
														<use
															xlinkHref="#akQfjxQes"
															opacity="1"
															fill="currentColor"
															fillOpacity="1"
														/>
													</g>
													<g>
														<use
															xlinkHref="#bdSrwE5pk"
															opacity="1"
															fill="currentColor"
															fillOpacity="1"
														/>
													</g>
												</g>
											</svg>
										}
										copied={copied === pnpmCommand}
									/>
								</div>
								<div className="mr-3">{pnpmCommand}</div>
							</a>
						</div>
						<div className="flex flex-row items-center pt-1 pb-1 align-middle pr-4">
							<a
								target="_blank"
								className="text-inherit inline-flex flex-row items-center cursor-pointer select-none"
								href={`https://github.com/${template.org}/${template.repoName}/generate`}
							>
								<div className="w-6 h-9 mr-3 inline-flex items-center justify-center">
									<GithubIcon />
								</div>{' '}
								Fork template
							</a>
						</div>
						<div className="flex flex-row items-center pt-1 pb-1 align-middle pr-4">
							<a
								target="_blank"
								className="text-inherit inline-flex flex-row items-center cursor-pointer select-none"
								href={`https://github.com/${template.org}/${template.repoName}`}
							>
								<div className="w-6 h-9 mr-3 inline-flex items-center justify-center">
									<GithubIcon />
								</div>{' '}
								View source
							</a>
						</div>
						{template.previewURL && (
							<a
								target="_blank"
								className="text-inherit inline-flex flex-row items-center cursor-pointer select-none"
								href={template.previewURL}
							>
								<div className="flex flex-row items-center pt-1 pb-1 align-middle pr-4">
									<div className="w-6 h-9 mr-3 inline-flex items-center justify-center">
										<PreviewIcon />
									</div>
									{template.previewLabel ?? (
										<>
											See Preview{' '}
											<span className="whitespace-pre text-[var(--light-text-color)]">
												{' '}
												via Remotion Studio
											</span>
										</>
									)}
								</div>
							</a>
						)}
						{template.showStackblitz ? (
							<a
								target="_blank"
								className="text-inherit inline-flex flex-row items-center cursor-pointer select-none"
								href={`https://stackblitz.com/github/${template.org}/${template.repoName}`}
							>
								<div className="flex flex-row items-center pt-1 pb-1 align-middle pr-4">
									<div className="w-6 h-9 mr-3 inline-flex items-center justify-center">
										<StackBlitzIcon />
									</div>
									Try online{' '}
									<span className="whitespace-pre text-[var(--light-text-color)]">
										{' '}
										via StackBlitz
									</span>
								</div>
							</a>
						) : null}
						{template.allowEnableTailwind ? (
							<div className="flex flex-row items-center pt-1 pb-1 align-middle pr-4">
								<div className="w-6 h-9 mr-3 inline-flex items-center justify-center">
									<Tailwind />
								</div>
								Supports Tailwind
							</div>
						) : null}
					</div>
				</div>
				<div
					className={cn(
						'flex flex-row w-full',
						template.contributedBy !== null && mobileLayout
							? 'flex-col'
							: 'flex-row',
					)}
				>
					<div
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={{
							__html: template.longerDescription,
						}}
						className={cn(
							'p-5 font-brand flex-1',
							mobileLayout ? null : 'border-r-2 border-black',
						)}
					/>
					<div
						style={{width: mobileLayout ? '100%' : RESERVED_FOR_SIDEBAR}}
						className={cn(
							mobileLayout && template.contributedBy === null
								? 'hidden'
								: 'flex',
							template.contributedBy !== null && mobileLayout
								? 'border-t-2 border-black w-full py-4 justify-start px-5'
								: 'pl-5 pr-8 justify-end ',
							'items-center  text-brand dark:text-white gap-2',
						)}
					>
						{template.contributedBy ? (
							<div
								className={cn(
									'flex flex-row pt-1 pb-1 pr-4 gap-2 text-text font-brand items-center',
								)}
							>
								<img
									src={`https://github.com/${template.contributedBy}.png`}
									className="w-6 h-6 rounded-full"
								/>
								<div className="text-text leading-tight">
									Thanks to{' '}
									<a
										href={`https://github.com/${template.contributedBy}`}
										target="_blank"
										className="text-inherit underline"
									>
										{template.contributedBy}
									</a>{' '}
									for contributing this template!
								</div>
							</div>
						) : (
							<Triangle className="h-7" />
						)}
					</div>
				</div>
			</Card>
		</div>
	);
};
