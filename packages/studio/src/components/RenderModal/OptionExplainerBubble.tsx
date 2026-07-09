import type {AnyRemotionOption} from '@remotion/renderer';
import type {AvailableOptions} from '@remotion/renderer/client';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {InfoBubble} from './InfoBubble';
import {
	OptionExplainer,
	type OptionExplainerInfoRow,
	type OptionExplainerOption,
} from './OptionExplainer';

export const OptionExplainerBubble: React.FC<{
	readonly id: AvailableOptions;
	readonly extraInfoRows?: readonly OptionExplainerInfoRow[];
	readonly showApiOption?: boolean;
	readonly showCliFlag?: boolean;
}> = ({id, extraInfoRows, showApiOption, showCliFlag}) => {
	const option = BrowserSafeApis.options[id] as AnyRemotionOption<unknown>;

	return (
		<InfoBubble title="Learn more about this option">
			<OptionExplainer
				extraInfoRows={extraInfoRows}
				option={option}
				showApiOption={showApiOption}
				showCliFlag={showCliFlag}
			/>
		</InfoBubble>
	);
};

export const WebRendererOptionExplainerBubble: React.FC<{
	readonly id: AvailableOptions;
	readonly apiName: string;
}> = ({id, apiName}) => {
	return (
		<OptionExplainerBubble
			extraInfoRows={[{label: 'API option', value: apiName}]}
			id={id}
			showApiOption={false}
			showCliFlag={false}
		/>
	);
};

export const WebRendererCustomOptionExplainerBubble: React.FC<{
	readonly apiName: string;
	readonly description: React.ReactNode;
	readonly docLink: string | null;
	readonly name: string;
}> = ({apiName, description, docLink, name}) => {
	const option: OptionExplainerOption = {
		description: () => description,
		docLink,
		name,
		ssrName: null,
	};

	return (
		<InfoBubble title="Learn more about this option">
			<OptionExplainer
				extraInfoRows={[{label: 'API option', value: apiName}]}
				option={option}
				showApiOption={false}
				showCliFlag={false}
			/>
		</InfoBubble>
	);
};
