import type {ReactNode, SVGProps} from 'react';
import React from 'react';
import {AbsoluteFill} from 'remotion';

const IconCell: React.FC<{
	readonly children: ReactNode;
	readonly label: string;
}> = ({children, label}) => {
	return (
		<div
			style={{
				alignItems: 'center',
				color: '#ffffff',
				display: 'flex',
				flex: 1,
				flexDirection: 'column',
				gap: 20,
				justifyContent: 'center',
				minWidth: 0,
			}}
		>
			<div
				style={{
					alignItems: 'center',
					display: 'flex',
					height: 48,
					justifyContent: 'center',
					width: 48,
				}}
			>
				{children}
			</div>
			<div
				style={{
					color: '#a6a6a6',
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 14,
					lineHeight: 1.2,
					textAlign: 'center',
					whiteSpace: 'nowrap',
				}}
			>
				{label}
			</div>
		</div>
	);
};

const Icon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
	<svg width={28} height={28} aria-hidden="true" {...props} />
);

const MinusIcon = () => (
	<Icon viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"
		/>
	</Icon>
);

const ProposedMinusIcon = () => (
	<Icon viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M0 256c0-8.8 7.2-16 16-16l416 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 272c-8.8 0-16-7.2-16-16z"
		/>
	</Icon>
);

const PlusIcon = () => (
	<Icon viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"
		/>
	</Icon>
);

const ProposedPlusIcon = () => (
	<Icon viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M240 48c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 192-192 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0 0 192c0 8.8 7.2 16 16 16s16-7.2 16-16l0-192 192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-192 0 0-192z"
		/>
	</Icon>
);

const JumpToStartIcon = () => (
	<Icon viewBox="0 0 512 512">
		<path
			fill="currentColor"
			d="M0 415.1V96.03c0-17.67 14.33-31.1 31.1-31.1C49.67 64.03 64 78.36 64 96.03v131.8l171.5-156.5C256.1 54.28 288 68.66 288 96.03v131.9l171.5-156.5C480.1 54.28 512 68.66 512 96.03v319.9c0 27.37-31.88 41.74-52.5 24.62L288 285.2v130.7c0 27.37-31.88 41.74-52.5 24.62L64 285.2v130.7c0 17.67-14.33 31.1-31.1 31.1C14.33 447.1 0 433.6 0 415.1z"
		/>
	</Icon>
);

const StepBackIcon = () => (
	<Icon viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M64 468V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12v176.4l195.5-181C352.1 22.3 384 36.6 384 64v384c0 27.4-31.9 41.7-52.5 24.6L136 292.7V468c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12z"
		/>
	</Icon>
);

const PlayIcon = () => (
	<Icon viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
		/>
	</Icon>
);

const PauseIcon = () => (
	<Icon viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"
		/>
	</Icon>
);

const StepForwardIcon = () => (
	<Icon viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M384 44v424c0 6.6-5.4 12-12 12h-48c-6.6 0-12-5.4-12-12V291.6l-195.5 181C95.9 489.7 64 475.4 64 448V64c0-27.4 31.9-41.7 52.5-24.6L312 219.3V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12z"
		/>
	</Icon>
);

const LoopIcon = () => (
	<Icon viewBox="0 0 512 512">
		<path
			fill="currentColor"
			d="M493.544 181.463c11.956 22.605 18.655 48.4 18.452 75.75C511.339 345.365 438.56 416 350.404 416H192v47.495c0 22.475-26.177 32.268-40.971 17.475l-80-80c-9.372-9.373-9.372-24.569 0-33.941l80-80C166.138 271.92 192 282.686 192 304v48h158.875c52.812 0 96.575-42.182 97.12-94.992.155-15.045-3.17-29.312-9.218-42.046-4.362-9.185-2.421-20.124 4.8-27.284 4.745-4.706 8.641-8.555 11.876-11.786 11.368-11.352 30.579-8.631 38.091 5.571zM64.005 254.992c.545-52.81 44.308-94.992 97.12-94.992H320v47.505c0 22.374 26.121 32.312 40.971 17.465l80-80c9.372-9.373 9.372-24.569 0-33.941l-80-80C346.014 16.077 320 26.256 320 48.545V96H161.596C73.44 96 .661 166.635.005 254.788c-.204 27.35 6.495 53.145 18.452 75.75 7.512 14.202 26.723 16.923 38.091 5.57 3.235-3.231 7.13-7.08 11.876-11.786 7.22-7.16 9.162-18.098 4.8-27.284-6.049-12.735-9.374-27.001-9.219-42.046z"
		/>
	</Icon>
);

const ProposedLoopIcon = () => (
	<Icon viewBox="0 0 512 512">
		<path
			fill="currentColor"
			d="M384 150.3l0-108.7 64 53.3 0 2-64 53.3zM352 23.5l0 56.5-160 0C86 80 0 166 0 272 0 280.8 7.2 288 16 288s16-7.2 16-16c0-88.4 71.6-160 160-160l160 0 0 56.5c0 13 10.5 23.5 23.5 23.5 5.5 0 10.8-1.9 15-5.4l78-65c7.3-6.1 11.5-15.1 11.5-24.6l0-2c0-9.5-4.2-18.5-11.5-24.6l-78-65c-4.2-3.5-9.5-5.4-15-5.4-13 0-23.5 10.5-23.5 23.5zM128 415.9c0 0 0 .1 0 .1s0 .1 0 .1l0 54.3-64-53.3 0-2 64-53.3 0 54.3zM160 400l0-56.5c0-13-10.5-23.5-23.5-23.5-5.5 0-10.8 1.9-15 5.4l-78 65C36.2 396.5 32 405.5 32 415l0 2c0 9.5 4.2 18.5 11.5 24.6l78 65c4.2 3.5 9.5 5.4 15 5.4 13 0 23.5-10.5 23.5-23.5l0-56.5 160 0c106 0 192-86 192-192 0-8.8-7.2-16-16-16s-16 7.2-16 16c0 88.4-71.6 160-160 160l-160 0z"
		/>
	</Icon>
);

const VolumeOnIcon = () => (
	<Icon viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z"
		/>
	</Icon>
);

const ProposedVolumeBase = () => (
	<g transform="translate(32 0)">
		<path
			fill="currentColor"
			d="M112 320l-64 0c-8.8 0-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16l64 0c8.5 0 16.6-3.4 22.6-9.4L252.7 64.6c.4-.4.9-.6 1.4-.6 1.1 0 1.9.9 1.9 1.9l0 380.1c0 1.1-.9 1.9-1.9 1.9-.5 0-1-.2-1.4-.6L134.6 329.4c-6-6-14.1-9.4-22.6-9.4zm0-160l-64 0c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48l64 0 118.1 118.1c6.4 6.4 15 9.9 24 9.9 18.7 0 33.9-15.2 33.9-33.9l0-380.1c0-18.7-15.2-33.9-33.9-33.9-9 0-17.6 3.6-24 9.9L112 160zm243.2 22.4c-5.3 7.1-3.9 17.1 3.2 22.4 15.6 11.7 25.6 30.3 25.6 51.2s-10 39.5-25.6 51.2c-7.1 5.3-8.5 15.3-3.2 22.4s15.3 8.5 22.4 3.2C400.9 315.3 416 287.4 416 256s-15.1-59.3-38.4-76.8c-7.1-5.3-17.1-3.9-22.4 3.2zm87-74.5c-6.8-5.6-16.9-4.7-22.5 2.1s-4.7 16.9 2.1 22.5C457.4 161.9 480 206.3 480 256s-22.6 94.1-58.2 123.4c-6.8 5.6-7.8 15.7-2.1 22.5s15.7 7.8 22.5 2.2C484.8 368.9 512 315.6 512 256s-27.2-112.9-69.8-148.1z"
		/>
	</g>
);

const ProposedVolumeOnIcon = () => (
	<Icon viewBox="0 0 576 512">
		<ProposedVolumeBase />
	</Icon>
);

const VolumeOffIcon = () => (
	<Icon viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"
		/>
	</Icon>
);

const ProposedVolumeOffIcon = () => (
	<Icon viewBox="0 0 576 512" fill="none">
		<ProposedVolumeBase />
		<path
			d="M16-16L560 528"
			stroke="currentColor"
			strokeLinecap="round"
			strokeWidth="32"
		/>
	</Icon>
);

const InPointIcon = () => (
	<Icon viewBox="0 0 256 256" fill="none">
		<path
			d="M158 25H99V230.5H158"
			stroke="currentColor"
			strokeWidth="42"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Icon>
);

const ProposedInPointIcon = () => (
	<Icon viewBox="0 0 192 512">
		<path
			fill="currentColor"
			d="M0 88C0 57.1 25.1 32 56 32l64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L56 80c-4.4 0-8 3.6-8 8l0 336c0 4.4 3.6 8 8 8l64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0c-30.9 0-56-25.1-56-56L0 88z"
		/>
	</Icon>
);

const OutPointIcon = () => (
	<Icon viewBox="0 0 256 256" fill="none">
		<path
			d="M98 25H157V230.5H98"
			stroke="currentColor"
			strokeWidth="42"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Icon>
);

const ProposedOutPointIcon = () => (
	<Icon viewBox="0 0 192 512">
		<path
			fill="currentColor"
			d="M192 88c0-30.9-25.1-56-56-56L72 32C58.7 32 48 42.7 48 56S58.7 80 72 80l64 0c4.4 0 8 3.6 8 8l0 336c0 4.4-3.6 8-8 8l-64 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l64 0c30.9 0 56-25.1 56-56l0-336z"
		/>
	</Icon>
);

const CheckerboardIcon = () => (
	<Icon viewBox="0 0 512 512">
		<path
			fill="currentColor"
			d="M480 0H32A32 32 0 0 0 0 32v448a32 32 0 0 0 32 32h448a32 32 0 0 0 32-32V32a32 32 0 0 0-32-32zm-32 256H256v192H64V256h192V64h192z"
		/>
	</Icon>
);

const ProposedCheckerboardIcon = () => (
	<Icon viewBox="0 0 512 512" fill="none">
		<path
			d="M256 48H440C453.3 48 464 58.7 464 72V256H256V48ZM48 256H256V464H72C58.7 464 48 453.3 48 440V256Z"
			fill="currentColor"
		/>
		<rect
			x="48"
			y="48"
			width="416"
			height="416"
			rx="24"
			stroke="currentColor"
			strokeWidth="32"
		/>
		<path d="M256 48V464M48 256H464" stroke="currentColor" strokeWidth="32" />
	</Icon>
);

const OutlineIcon = () => (
	<Icon viewBox="0 0 512 512">
		<path
			fill="currentColor"
			d="M32 119.4C12.9 108.4 0 87.7 0 64 0 28.7 28.7 0 64 0 87.7 0 108.4 12.9 119.4 32l273.1 0c11.1-19.1 31.7-32 55.4-32 35.3 0 64 28.7 64 64 0 23.7-12.9 44.4-32 55.4l0 273.1c19.1 11.1 32 31.7 32 55.4 0 35.3-28.7 64-64 64-23.7 0-44.4-12.9-55.4-32l-273.1 0c-11.1 19.1-31.7 32-55.4 32-35.3 0-64-28.7-64-64 0-23.7 12.9-44.4 32-55.4l0-273.1zm64 0l0 273.1c9.7 5.6 17.8 13.7 23.4 23.4l273.1 0c5.6-9.7 13.7-17.8 23.4-23.4l0-273.1c-9.7-5.6-17.8-13.7-23.4-23.4L119.4 96c-5.6 9.7-13.7 17.8-23.4 23.4z"
		/>
	</Icon>
);

const ProposedOutlineIcon = () => (
	<Icon viewBox="0 0 512 512" fill="none">
		<path d="M64 64H448V448H64V64Z" stroke="currentColor" strokeWidth="36" />
		<rect
			x="16"
			y="16"
			width="96"
			height="96"
			rx="24"
			fill="#181818"
			stroke="currentColor"
			strokeWidth="32"
		/>
		<rect
			x="400"
			y="16"
			width="96"
			height="96"
			rx="24"
			fill="#181818"
			stroke="currentColor"
			strokeWidth="32"
		/>
		<rect
			x="16"
			y="400"
			width="96"
			height="96"
			rx="24"
			fill="#181818"
			stroke="currentColor"
			strokeWidth="32"
		/>
		<rect
			x="400"
			y="400"
			width="96"
			height="96"
			rx="24"
			fill="#181818"
			stroke="currentColor"
			strokeWidth="32"
		/>
	</Icon>
);

const MagnetIcon = () => (
	<Icon viewBox="0 0 512 512">
		<path
			fill="currentColor"
			transform="rotate(180 256 256)"
			d="M32 176v112c0 123.7 100.3 224 224 224s224-100.3 224-224V176H352v112c0 53-43 96-96 96s-96-43-96-96V176H32zm0-48h128V32c0-17.7-14.3-32-32-32H64C46.3 0 32 14.3 32 32v96zm320 0h128V32c0-17.7-14.3-32-32-32h-64c-17.7 0-32 14.3-32 32v96z"
		/>
	</Icon>
);

const ProposedMagnetIcon = () => (
	<Icon viewBox="0 0 448 512" style={{translate: '0 1px'}}>
		<path
			fill="currentColor"
			transform="rotate(180 224 256)"
			d="M48 64c-8.8 0-16 7.2-16 16l0 80 80 0 0-80c0-8.8-7.2-16-16-16L48 64zM32 288c0 106 86 192 192 192s192-86 192-192l0-96-80 0 0 96c0 61.9-50.1 112-112 112S112 349.9 112 288l0-96-80 0 0 96zM416 160l0-80c0-8.8-7.2-16-16-16l-48 0c-8.8 0-16 7.2-16 16l0 80 80 0zM0 80C0 53.5 21.5 32 48 32l48 0c26.5 0 48 21.5 48 48l0 208c0 44.2 35.8 80 80 80s80-35.8 80-80l0-208c0-26.5 21.5-48 48-48l48 0c26.5 0 48 21.5 48 48l0 208c0 123.7-100.3 224-224 224S0 411.7 0 288L0 80z"
		/>
	</Icon>
);

const FullscreenIcon = () => (
	<Icon viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M0 180V56c0-13.3 10.7-24 24-24h124c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H64v84c0 6.6-5.4 12-12 12H12c-6.6 0-12-5.4-12-12zM288 44v40c0 6.6 5.4 12 12 12h84v84c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12V56c0-13.3-10.7-24-24-24H300c-6.6 0-12 5.4-12 12zm148 276h-40c-6.6 0-12 5.4-12 12v84h-84c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h124c13.3 0 24-10.7 24-24V332c0-6.6-5.4-12-12-12zM160 468v-40c0-6.6-5.4-12-12-12H64v-84c0-6.6-5.4-12-12-12H12c-6.6 0-12 5.4-12 12v124c0 13.3 10.7 24 24 24h124c6.6 0 12-5.4 12-12z"
		/>
	</Icon>
);

const ProposedFullscreenIcon = () => (
	<Icon viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M136 32c13.3 0 24 10.7 24 24s-10.7 24-24 24l-88 0 0 88c0 13.3-10.7 24-24 24S0 181.3 0 168L0 56C0 42.7 10.7 32 24 32l112 0zM0 344c0-13.3 10.7-24 24-24s24 10.7 24 24l0 88 88 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 480c-13.3 0-24-10.7-24-24L0 344zM424 32c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-88-88 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l112 0zM400 344c0-13.3 10.7-24 24-24s24 10.7 24 24l0 112c0 13.3-10.7 24-24 24l-112 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l88 0 0-88z"
		/>
	</Icon>
);

const RenderIcon = () => (
	<Icon viewBox="0 0 512 512">
		<path
			fill="currentColor"
			d="M188.9 372l-50.4-50.4c18.6-42.6 61.7-137.7 95.1-187C304.6 30.1 409 24.6 475.7 36.3c11.7 66.7 6.2 171.1-98.4 242-49.4 33.5-145.5 75.6-188.4 93.7zm-79.9-62.8c-5.2 11.9-2.5 25.7 6.7 34.9l50.7 50.7c9.1 9.1 22.7 11.9 34.5 6.9c6.5-2.7 14.3-6 23-9.8L224 496c0 5.5 2.9 10.7 7.6 13.6s10.6 3.2 15.6.7l101.5-50.7c21.7-10.8 35.4-33 35.4-57.2V312.1c4-2.5 7.7-4.9 11.3-7.3C516.1 222.9 520.1 100.9 506.7 28.1c-2.1-11.6-11.2-20.6-22.8-22.8C411.1-8.1 289.1-4.1 207.2 116.7c-2.4 3.6-4.9 7.3-7.3 11.3l-90.2 0c-24.2 0-46.4 13.7-57.2 35.4L1.7 264.8c-2.5 5-2.2 10.8.7 15.6s8.1 7.6 13.6 7.6H118.5c-3.6 8-6.8 15.2-9.4 21.2zM256 470.1l0-92.5c30.3-13.7 65.4-30.3 96-47v71.7c0 12.1-6.8 23.2-17.7 28.6L256 470.1zM109.7 160h71.5c-16.9 30.7-34 65.8-48.1 96H41.9L81 177.7c5.4-10.8 16.5-17.7 28.6-17.7zM392 144a24 24 0 1 1-48 0 24 24 0 1 1 48 0zM368 88a56 56 0 1 0 0 112 56 56 0 1 0 0-112z"
		/>
	</Icon>
);

const CaretDownIcon = () => (
	<Icon viewBox="0 0 320 512">
		<path
			fill="currentColor"
			d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"
		/>
	</Icon>
);

const ProposedCaretDownIcon = () => (
	<Icon viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M235.3 411.3c-6.2 6.2-16.4 6.2-22.6 0l-208-208c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L224 377.4 420.7 180.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6l-208 208z"
		/>
	</Icon>
);

const EllipsisIcon = () => (
	<Icon viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1-112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"
		/>
	</Icon>
);

const ProposedEllipsisIcon = () => (
	<Icon viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M448 256a48 48 0 1 1-96 0 48 48 0 1 1 96 0zm-176 0a48 48 0 1 1-96 0 48 48 0 1 1 96 0zM48 304a48 48 0 1 1 0-96 48 48 0 1 1 0 96z"
		/>
	</Icon>
);

const SidebarLeftIcon = () => (
	<Icon viewBox="0 0 16 16" fill="none">
		<rect
			x="0.5"
			y="0.5"
			width="15"
			height="15"
			rx="2.5"
			stroke="currentColor"
		/>
		<path d="M5.5 1V15" stroke="currentColor" />
	</Icon>
);

const SidebarRightIcon = () => (
	<Icon viewBox="0 0 16 16" fill="none">
		<rect
			x="0.5"
			y="0.5"
			width="15"
			height="15"
			rx="2.5"
			stroke="currentColor"
		/>
		<path d="M10.5 1V15" stroke="currentColor" />
	</Icon>
);

const UndoIcon = () => (
	<Icon viewBox="0 0 640 640">
		<path
			fill="currentColor"
			d="M88 256L232 256C241.7 256 250.5 250.2 254.2 241.2C257.9 232.2 255.9 221.9 249 215L202.3 168.3C277.6 109.7 386.6 115 455.8 184.2C530.8 259.2 530.8 380.7 455.8 455.7C380.8 530.7 259.3 530.7 184.3 455.7C174.1 445.5 165.3 434.4 157.9 422.7C148.4 407.8 128.6 403.4 113.7 412.9C98.8 422.4 94.4 442.2 103.9 457.1C113.7 472.7 125.4 487.5 139 501C239 601 401 601 501 501C601 401 601 239 501 139C406.8 44.7 257.3 39.3 156.7 122.8L105 71C98.1 64.2 87.8 62.1 78.8 65.8C69.8 69.5 64 78.3 64 88L64 232C64 245.3 74.7 256 88 256z"
		/>
	</Icon>
);

const ProposedUndoIcon = () => (
	<Icon viewBox="0 0 512 512">
		<path
			fill="currentColor"
			d="M16 0c8.8 0 16 7.2 16 16l0 103.8 37-39.1C117.6 29.2 185.2 0 256 0 397.4 0 512 114.6 512 256S397.4 512 256 512c-98.3 0-183.6-55.4-226.5-136.5-4.1-7.8-1.1-17.5 6.7-21.6s17.5-1.1 21.6 6.7C95.4 431.6 170.1 480 256 480 379.7 480 480 379.7 480 256S379.7 32 256 32c-62 0-121.2 25.5-163.8 70.6L53.1 144 160 144c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 176c-8.8 0-16-7.2-16-16L0 16C0 7.2 7.2 0 16 0z"
		/>
	</Icon>
);

const RedoIcon = () => (
	<Icon viewBox="0 0 640 640">
		<path
			fill="currentColor"
			d="M552 256L408 256C398.3 256 389.5 250.2 385.8 241.2C382.1 232.2 384.1 221.9 391 215L437.7 168.3C362.4 109.7 253.4 115 184.2 184.2C109.2 259.2 109.2 380.7 184.2 455.7C259.2 530.7 380.7 530.7 455.7 455.7C463.9 447.5 471.2 438.8 477.6 429.6C487.7 415.1 507.7 411.6 522.2 421.7C536.7 431.8 540.2 451.8 530.1 466.3C521.6 478.5 511.9 490.1 501 501C401 601 238.9 601 139 501C39.1 401 39 239 139 139C233.3 44.7 382.7 39.4 483.3 122.8L535 71C541.9 64.1 552.2 62.1 561.2 65.8C570.2 69.5 576 78.3 576 88L576 232C576 245.3 565.3 256 552 256z"
		/>
	</Icon>
);

const ProposedRedoIcon = () => (
	<Icon viewBox="0 0 512 512">
		<path
			fill="currentColor"
			d="M496 0c-8.8 0-16 7.2-16 16l0 103.8-37-39.1C394.4 29.2 326.8 0 256 0 114.6 0 0 114.6 0 256S114.6 512 256 512c98.3 0 183.6-55.4 226.5-136.5 4.1-7.8 1.1-17.5-6.7-21.6s-17.5-1.1-21.6 6.7C416.6 431.6 341.9 480 256 480 132.3 480 32 379.7 32 256S132.3 32 256 32c62 0 121.2 25.5 163.8 70.6L458.9 144 352 144c-8.8 0-16 7.2-16 16s7.2 16 16 16l144 0c8.8 0 16-7.2 16-16l0-144c0-8.8-7.2-16-16-16z"
		/>
	</Icon>
);

const RenderGeneralIcon = () => (
	<Icon viewBox="0 0 384 512">
		<path
			fill="currentColor"
			d="M0 64C0 28.65 28.65 0 64 0h156.1c12.7 0 25 5.057 34 14.06L369.9 129.9c9 9 14.1 21.3 14.1 34V448c0 35.3-28.7 64-64 64H64c-35.35 0-64-28.7-64-64V64zm352 128H240c-26.5 0-48-21.5-48-48V32H64c-17.67 0-32 14.33-32 32v384c0 17.7 14.33 32 32 32h256c17.7 0 32-14.3 32-32V192zm-4.7-39.4L231.4 36.69c-2-2.07-4.6-3.51-7.4-4.21V144c0 8.8 7.2 16 16 16h111.5c-.7-2.8-2.1-5.4-4.2-7.4z"
		/>
	</Icon>
);

const RenderDataIcon = () => (
	<Icon viewBox="0 0 448 512">
		<path
			fill="currentColor"
			d="M224 512C100.3 512 0 476.2 0 432V80C0 35.82 100.3 0 224 0C347.7 0 448 35.82 448 80V432C448 476.2 347.7 512 224 512zM416 80.45C415.7 79.69 414.4 77.27 409.8 73.31C402.4 67.11 389.9 60.09 371.6 53.57C335.4 40.62 283.2 32 224 32C164.8 32 112.6 40.62 76.37 53.57C58.1 60.09 45.59 67.11 38.25 73.31C33.55 77.27 32.29 79.69 32 80.45V182.1C46.47 192.7 69.9 202.8 100.9 210.4C135.5 218.9 177.1 224 224 224C270 224 312.5 218.9 347.1 210.4C378.1 202.8 401.5 192.7 416 182.1V80.45zM416 219.5C398.8 228.4 377.9 235.8 354.8 241.5C317.3 250.7 272.2 256 224 256C175.8 256 130.7 250.7 93.22 241.5C70.11 235.8 49.18 228.4 32 219.5V310.1C46.47 320.7 69.9 330.8 100.9 338.4C135.5 346.9 177.1 352 224 352C270 352 312.5 346.9 347.1 338.4C378.1 330.8 401.5 320.7 416 310.1V219.5zM38.25 438.7C45.59 444.9 58.1 451.9 76.37 458.4C112.6 471.4 164.8 480 224 480C283.2 480 335.4 471.4 371.6 458.4C389.9 451.9 402.4 444.9 409.8 438.7C414.4 434.7 415.7 432.3 416 431.6V347.5C398.8 356.4 377.9 363.8 354.8 369.5C317.3 378.7 272.2 384 224 384C175.8 384 130.7 378.7 93.22 369.5C70.11 363.8 49.18 356.4 32 347.5V431.6C32.29 432.3 33.55 434.7 38.25 438.7z"
		/>
	</Icon>
);

const ProposedRenderInputPropsIcon = () => (
	<Icon viewBox="0 0 576 512">
		<path
			fill="currentColor"
			d="M144 32c-44.2 0-80 35.8-80 80l0 53.5c0 12.7-5.1 24.9-14.1 33.9L4.7 244.7c-3 3-4.7 7.1-4.7 11.3s1.7 8.3 4.7 11.3l45.3 45.3c9 9 14.1 21.2 14.1 33.9L64 400c0 44.2 35.8 80 80 80l64 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-64 0c-26.5 0-48-21.5-48-48l0-53.5c0-21.2-8.4-41.6-23.4-56.6L38.6 256 72.6 222.1c15-15 23.4-35.4 23.4-56.6L96 112c0-26.5 21.5-48 48-48l64 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-64 0zm288 0l-64 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l64 0c26.5 0 48 21.5 48 48l0 53.5c0 21.2 8.4 41.6 23.4 56.6l33.9 33.9-33.9 33.9c-15 15-23.4 35.4-23.4 56.6l0 53.5c0 26.5-21.5 48-48 48l-64 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l64 0c44.2 0 80-35.8 80-80l0-53.5c0-12.7 5.1-24.9 14.1-33.9l45.3-45.3c3-3 4.7-7.1 4.7-11.3s-1.7-8.3-4.7-11.3l-45.3-45.3c-9-9-14.1-21.2-14.1-33.9l0-53.5c0-44.2-35.8-80-80-80z"
		/>
	</Icon>
);

const RenderPictureIcon = () => (
	<Icon viewBox="0 0 512 512">
		<path
			fill="currentColor"
			d="M324.9 157.8c-11.38-17.38-39.89-17.31-51.23-.063L200.5 268.5l-16.4-22.6c-11.4-16.8-38.2-16-49.7 0l-64.52 89.16c-6.797 9.406-7.75 21.72-2.547 32C72.53 377.5 83.05 384 94.75 384h322.5c11.41 0 21.8-6.281 27.14-16.38a30.922 30.922 0 0 0-1.516-31.56L324.9 157.8zM95.8 352l62.39-87.38 29.91 41.34c3.1 4.24 8.3 7.24 13.3 6.64 5.25-.125 10.12-2.781 13.02-7.188l83.83-129.9L415 352H95.8zM447.1 32h-384C28.65 32-.01 60.65-.01 96v320c0 35.35 28.65 64 63.1 64h384c35.35 0 64-28.65 64-64V96c.01-35.35-27.79-64-63.99-64zM480 416c0 17.64-14.36 32-32 32H64c-17.64 0-32-14.36-32-32V96c0-17.64 14.36-32 32-32h384c17.64 0 32 14.36 32 32v320zM144 192c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48zm0-64c8.822 0 15.1 7.178 15.1 16s-6.3 16-15.1 16-16-7.2-16-16 7.2-16 16-16z"
		/>
	</Icon>
);

const RenderAudioIcon = () => (
	<Icon viewBox="0 0 512 512">
		<path
			fill="currentColor"
			d="M243 32.32C105.5 39.15 0 157.8 0 295.5v120.4C0 451.3 28.63 480 64 480h32c17.62 0 32-14.38 32-32V288c0-17.62-14.38-32-32-32H64c-10.79 0-20.8 2.9-29.72 7.7 14.2-106.8 100.5-193.9 210.4-199.4 120.5-5.965 221.7 83.92 234 199.9-9.08-5.1-19.48-8.2-30.68-8.2h-32c-17.62 0-32 14.38-32 32v160c0 17.62 14.38 32 32 32h32c35.38 0 64-28.75 64-64.13V287.9c0-145.4-122-262.88-269-255.58zM64 288h32v160H64c-17.62 0-32-14.5-32-32.13v-95.75C32 302.5 46.38 288 64 288zm416 127.9c0 17.6-14.4 32.1-32 32.1h-32V288h32c17.62 0 32 14.5 32 32.13v95.77z"
		/>
	</Icon>
);

const RenderGifIcon = () => (
	<Icon viewBox="0 0 576 512">
		<path
			fill="currentColor"
			d="M512 32H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h448c35.35 0 64-28.65 64-64V96c0-35.35-28.7-64-64-64zm32 384c0 17.64-14.36 32-32 32H64c-17.64 0-32-14.36-32-32V96c0-17.64 14.36-32 32-32h448c17.64 0 32 14.36 32 32v320zm-80-256h-96c-8.8 0-16 7.2-16 16v160c0 8.844 7.156 16 16 16s16-7.156 16-16v-64h56c8.844 0 16-7.156 16-16s-7.156-16-16-16h-56v-48h80c8.8 0 16-7.2 16-16s-7.2-16-16-16zm-160 0c-8.8 0-16 7.2-16 16v160c0 8.844 7.156 16 16 16s16-7.156 16-16V176c0-8.8-7.2-16-16-16zm-64 80h-64c-8.8 0-16 7.2-16 16s7.156 16 16 16h48v33.45c-24.83 19.91-69.13 18.16-91.48-4.203-24.95-24.95-24.95-65.55 0-90.5 25.03-25 64.19-25 89.22 0 6.25 6.25 16.38 6.25 22.62 0s6.25-16.38 0-22.62c-37.69-37.72-96.78-37.72-134.5 0-37.42 37.42-37.42 98.33 0 135.8C127.8 341.8 153.5 352 180.6 352c27.06 0 52.84-10.25 70.7-28.12 3-2.98 4.7-7.08 4.7-11.28V256c0-8.8-7.2-16-16-16z"
		/>
	</Icon>
);

const RenderEncodingIcon = () => (
	<Icon viewBox="0 0 512 512">
		<path
			fill="currentColor"
			d="M448 32H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h384c35.35 0 64-28.65 64-64V96C512 60.65 483.3 32 448 32zM384 64v176H128V64H384zM32 96c0-17.64 14.36-32 32-32h32v80H32V96zM32 176h64v64H32V176zM32 272h64v64H32V272zM64 448c-17.64 0-32-14.36-32-32v-48h64V448H64zM128 448V272h256V448H128zM480 416c0 17.64-14.36 32-32 32h-32v-80h64V416zM480 336h-64v-64h64V336zM480 240h-64v-64h64V240zM480 144h-64V64h32c17.64 0 32 14.36 32 32V144z"
		/>
	</Icon>
);

const RenderOtherIcon = () => (
	<Icon viewBox="0 0 512 512">
		<path
			fill="currentColor"
			d="M168 255.1c0-47.7 39.4-88 88-88s88 40.3 88 88c0 49.5-39.4 88.9-88 88.9s-88-39.4-88-88.9zm88-56c-30.9 0-56 26-56 56 0 31.8 25.1 56 56 56s56-24.2 56-56c0-30-25.1-56-56-56zM65.67 230.6l-40.33-36.8c-11.12-10.1-13.68-26.6-6.16-39.6l30.24-52.4c7.52-13.02 23.09-19.05 37.42-14.48l51.96 16.58c13.4-10.34 28.2-18.94 44-25.47l11.7-53.27C197.7 10.47 210.7 0 225.8 0h60.4c15.1 0 28.1 10.47 31.3 25.16l11.7 53.27c14.9 6.53 30.6 15.13 44 25.47l52-16.58c14.3-4.57 29.9 1.46 37.4 14.48l30.2 52.4c7.5 13 5 29.5-6.1 39.6l-40.4 36.8c1.1 8.3 1.7 16.8 1.7 24.5 0 9.5-.6 18-1.7 26.3l40.4 36.8c11.1 10.1 13.6 26.6 6.1 39.6l-30.2 52.4c-7.5 13-23.1 19-37.4 14.5l-52-16.6c-13.4 10.3-29.1 18.9-44 25.5l-11.7 53.2c-3.2 14.7-16.2 25.2-31.3 25.2h-60.4c-15.1 0-28.1-10.5-31.3-25.2l-11.7-53.2c-15.8-6.6-30.6-15.2-44-25.5l-51.96 16.6c-14.33 4.5-29.9-1.5-37.42-14.5l-30.24-52.4c-7.52-13-4.96-29.5 6.16-39.6l40.33-36.8c-1.1-8.3-1.67-16.8-1.67-26.3 0-7.7.57-16.2 1.67-24.5zm92.73-101.4-13.3 10.3-67.97-21.7-30.24 52.4 52.69 48-2.19 16.6c-.92 6.9-1.39 14-1.39 20.3 0 8.1.47 15.2 1.39 22.1l2.19 16.6-52.69 48 30.24 52.4 67.97-21.7 13.3 10.3c11.1 8.6 23.5 15.8 36.6 20.3l15.5 7.3 15.3 69.6h60.4l15.3-69.6 14.6-7.3c14-4.5 26.4-11.7 37.5-20.3l13.3-10.3 68 21.7 30.2-52.4-52.7-48 2.2-16.6c.9-6.9 1.4-14 1.4-21.2 0-7.2-.5-14.3-1.4-21.2l-2.2-16.6 52.7-48-30.2-52.4-68 21.7-13.3-10.3c-11.1-8.6-23.5-15.8-37.5-21.2l-14.6-6.4L286.2 32h-60.4l-15.3 69.6L195 108c-13.1 5.4-25.5 12.6-36.6 21.2z"
		/>
	</Icon>
);

const RenderLicenseIcon = () => (
	<Icon viewBox="0 0 576 512">
		<path
			fill="currentColor"
			d="M192 32l128 0 0 96c0 35.3 28.7 64 64 64l96 0 0 256c0 17.7-14.3 32-32 32l-192 0 0 32 192 0c35.3 0 64-28.7 64-64l0-261.5c0-17-6.7-33.3-18.7-45.3L370.7 18.7C358.7 6.7 342.5 0 325.5 0L192 0c-35.3 0-64 28.7-64 64l0 80c10.9 0 21.6 1 32 2.9L160 64c0-17.7 14.3-32 32-32zM352 45.3L466.7 160 384 160c-17.7 0-32-14.3-32-32l0-82.7zM32 320a96 96 0 1 1 192 0 96 96 0 1 1-192 0zM176 438.7l0 66.3-40.1-22.9c-4.9-2.8-11-2.8-15.9 0L80 505 80 438.7c14.8 6 31 9.3 48 9.3s33.2-3.3 48-9.3zm32-18.8c29.3-23.5 48-59.5 48-99.9 0-70.7-57.3-128-128-128S0 249.3 0 320c0 40.4 18.7 76.5 48 99.9l0 101.8c0 12.3 10 22.3 22.3 22.3 3.9 0 7.7-1 11.1-2.9l46.6-26.6 46.6 26.6c3.4 1.9 7.2 2.9 11.1 2.9 12.3 0 22.3-10 22.3-22.3l0-101.8zM128 344a24 24 0 1 1 0-48 24 24 0 1 1 0 48zm0-80a56 56 0 1 0 0 112 56 56 0 1 0 0-112z"
		/>
	</Icon>
);

const IconRow: React.FC<{
	readonly checkerboardIcon: ReactNode;
	readonly dropdownIcon: ReactNode;
	readonly fullscreenIcon: ReactNode;
	readonly inPointIcon: ReactNode;
	readonly label: string;
	readonly loopIcon: ReactNode;
	readonly moreIcon: ReactNode;
	readonly outPointIcon: ReactNode;
	readonly outlineIcon: ReactNode;
	readonly redoIcon: ReactNode;
	readonly renderAudioIcon: ReactNode;
	readonly renderEncodingIcon: ReactNode;
	readonly renderEnvironmentIcon: ReactNode;
	readonly renderGeneralIcon: ReactNode;
	readonly renderGifIcon: ReactNode;
	readonly renderInputPropsIcon: ReactNode;
	readonly renderLicenseIcon: ReactNode;
	readonly renderOtherIcon: ReactNode;
	readonly renderPictureIcon: ReactNode;
	readonly sidebarLeftIcon: ReactNode;
	readonly sidebarRightIcon: ReactNode;
	readonly snappingIcon: ReactNode;
	readonly undoIcon: ReactNode;
	readonly volumeOffIcon: ReactNode;
	readonly volumeOnIcon: ReactNode;
	readonly zoomInIcon: ReactNode;
	readonly zoomOutIcon: ReactNode;
}> = ({
	checkerboardIcon,
	dropdownIcon,
	fullscreenIcon,
	inPointIcon,
	label,
	loopIcon,
	moreIcon,
	outPointIcon,
	outlineIcon,
	redoIcon,
	renderAudioIcon,
	renderEncodingIcon,
	renderEnvironmentIcon,
	renderGeneralIcon,
	renderGifIcon,
	renderInputPropsIcon,
	renderLicenseIcon,
	renderOtherIcon,
	renderPictureIcon,
	sidebarLeftIcon,
	sidebarRightIcon,
	snappingIcon,
	undoIcon,
	volumeOffIcon,
	volumeOnIcon,
	zoomInIcon,
	zoomOutIcon,
}) => {
	return (
		<div
			style={{
				alignItems: 'stretch',
				display: 'flex',
				flex: 1,
				width: '100%',
			}}
		>
			<div
				style={{
					alignItems: 'center',
					color: '#707070',
					display: 'flex',
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 14,
					fontWeight: 600,
					justifyContent: 'flex-start',
					letterSpacing: 0.6,
					textTransform: 'uppercase',
					width: 68,
				}}
			>
				{label}
			</div>
			<div
				style={{
					alignItems: 'stretch',
					display: 'flex',
					flex: 1,
				}}
			>
				<IconCell label="Zoom out">{zoomOutIcon}</IconCell>
				<IconCell label="Zoom in">{zoomInIcon}</IconCell>
				<IconCell label="Jump start">
					<JumpToStartIcon />
				</IconCell>
				<IconCell label="Step back">
					<StepBackIcon />
				</IconCell>
				<IconCell label="Play">
					<PlayIcon />
				</IconCell>
				<IconCell label="Pause">
					<PauseIcon />
				</IconCell>
				<IconCell label="Step forward">
					<StepForwardIcon />
				</IconCell>
				<IconCell label="Loop">{loopIcon}</IconCell>
				<IconCell label="Volume on">{volumeOnIcon}</IconCell>
				<IconCell label="Volume off">{volumeOffIcon}</IconCell>
				<IconCell label="In point">{inPointIcon}</IconCell>
				<IconCell label="Out point">{outPointIcon}</IconCell>
				<IconCell label="Checkerboard">{checkerboardIcon}</IconCell>
				<IconCell label="Outlines">{outlineIcon}</IconCell>
				<IconCell label="Snapping">{snappingIcon}</IconCell>
				<IconCell label="Fullscreen">{fullscreenIcon}</IconCell>
				<IconCell label="Render">
					<RenderIcon />
				</IconCell>
				<IconCell label="Dropdown">{dropdownIcon}</IconCell>
				<IconCell label="More">{moreIcon}</IconCell>
				<IconCell label="Sidebar left">{sidebarLeftIcon}</IconCell>
				<IconCell label="Sidebar right">{sidebarRightIcon}</IconCell>
				<IconCell label="Undo">{undoIcon}</IconCell>
				<IconCell label="Redo">{redoIcon}</IconCell>
				<IconCell label="General">{renderGeneralIcon}</IconCell>
				<IconCell label="Input props">{renderInputPropsIcon}</IconCell>
				<IconCell label="Picture">{renderPictureIcon}</IconCell>
				<IconCell label="Audio">{renderAudioIcon}</IconCell>
				<IconCell label="GIF">{renderGifIcon}</IconCell>
				<IconCell label="Encoding">{renderEncodingIcon}</IconCell>
				<IconCell label="Environment">{renderEnvironmentIcon}</IconCell>
				<IconCell label="Other">{renderOtherIcon}</IconCell>
				<IconCell label="License">{renderLicenseIcon}</IconCell>
			</div>
		</div>
	);
};

export const PreviewToolbarIcons: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#181818',
				padding: '24px 48px',
			}}
		>
			<IconRow
				checkerboardIcon={<CheckerboardIcon />}
				dropdownIcon={<CaretDownIcon />}
				fullscreenIcon={<FullscreenIcon />}
				inPointIcon={<InPointIcon />}
				label="Before"
				loopIcon={<LoopIcon />}
				moreIcon={<EllipsisIcon />}
				outPointIcon={<OutPointIcon />}
				outlineIcon={<OutlineIcon />}
				redoIcon={<RedoIcon />}
				renderAudioIcon={<RenderAudioIcon />}
				renderEncodingIcon={<RenderEncodingIcon />}
				renderEnvironmentIcon={<RenderDataIcon />}
				renderGeneralIcon={<RenderGeneralIcon />}
				renderGifIcon={<RenderGifIcon />}
				renderInputPropsIcon={<RenderDataIcon />}
				renderLicenseIcon={<RenderLicenseIcon />}
				renderOtherIcon={<RenderOtherIcon />}
				renderPictureIcon={<RenderPictureIcon />}
				sidebarLeftIcon={<SidebarLeftIcon />}
				sidebarRightIcon={<SidebarRightIcon />}
				snappingIcon={<MagnetIcon />}
				undoIcon={<UndoIcon />}
				volumeOffIcon={<VolumeOffIcon />}
				volumeOnIcon={<VolumeOnIcon />}
				zoomInIcon={<PlusIcon />}
				zoomOutIcon={<MinusIcon />}
			/>
			<div style={{height: 1, backgroundColor: '#303030'}} />
			<IconRow
				checkerboardIcon={<ProposedCheckerboardIcon />}
				dropdownIcon={<ProposedCaretDownIcon />}
				fullscreenIcon={<ProposedFullscreenIcon />}
				inPointIcon={<ProposedInPointIcon />}
				label="After"
				loopIcon={<ProposedLoopIcon />}
				moreIcon={<ProposedEllipsisIcon />}
				outPointIcon={<ProposedOutPointIcon />}
				outlineIcon={<ProposedOutlineIcon />}
				redoIcon={<ProposedRedoIcon />}
				renderAudioIcon={<RenderAudioIcon />}
				renderEncodingIcon={<RenderEncodingIcon />}
				renderEnvironmentIcon={<RenderDataIcon />}
				renderGeneralIcon={<RenderGeneralIcon />}
				renderGifIcon={<RenderGifIcon />}
				renderInputPropsIcon={<ProposedRenderInputPropsIcon />}
				renderLicenseIcon={<RenderLicenseIcon />}
				renderOtherIcon={<RenderOtherIcon />}
				renderPictureIcon={<RenderPictureIcon />}
				sidebarLeftIcon={<SidebarLeftIcon />}
				sidebarRightIcon={<SidebarRightIcon />}
				snappingIcon={<ProposedMagnetIcon />}
				undoIcon={<ProposedUndoIcon />}
				volumeOffIcon={<ProposedVolumeOffIcon />}
				volumeOnIcon={<ProposedVolumeOnIcon />}
				zoomInIcon={<ProposedPlusIcon />}
				zoomOutIcon={<ProposedMinusIcon />}
			/>
		</AbsoluteFill>
	);
};
