import {Button} from '@remotion/design';
import React, {useCallback, useState} from 'react';
import {ClipboardIcon} from '~/components/icons/ClipboardIcon';

export const CopyPromptButton: React.FC<{
	readonly prompt: string;
}> = ({prompt}) => {
	const [copied, setCopied] = useState(false);

	const onCopy = useCallback(() => {
		navigator.clipboard.writeText(prompt);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [prompt]);

	return (
		<Button
			className="font-brand rounded-full flex items-center "
			onClick={onCopy}
			style={{width: 160}}
			depth={0.6}
		>
			<div className="flex items-center flex-row flex-1 w-[130px]">
				<ClipboardIcon size={20} />
				<div className="w-2" />
				<div style={{fontSize: 14, flex: 1, textAlign: 'center'}}>
					{copied ? 'Copied prompt!' : 'Copy prompt'}
				</div>
			</div>
		</Button>
	);
};
