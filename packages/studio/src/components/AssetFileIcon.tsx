import type {ComponentType, SVGProps} from 'react';
import type {AssetFileType} from '../helpers/get-preview-file-type';
import {AudioFileIcon} from '../icons/audio';
import {FileIcon} from '../icons/file';
import {FontFileIcon} from '../icons/font';
import {PicIcon} from '../icons/frame';
import {JsonFileIcon} from '../icons/json';
import {VideoFileIcon} from '../icons/video';

type AssetFileIconProps = SVGProps<SVGSVGElement> & {
	readonly color: string;
};

const iconByFileType: Record<
	AssetFileType,
	ComponentType<AssetFileIconProps>
> = {
	audio: AudioFileIcon,
	font: FontFileIcon,
	image: PicIcon,
	json: JsonFileIcon,
	other: FileIcon,
	txt: FileIcon,
	video: VideoFileIcon,
};

export const AssetFileIcon = ({
	fileType,
	...props
}: AssetFileIconProps & {readonly fileType: AssetFileType}) => {
	const Icon = iconByFileType[fileType];
	return <Icon {...props} />;
};
