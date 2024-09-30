import {ESLintUtils} from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => {
	return `https://github.com/remotion-dev/remotion`;
});

type Options = [];

type MessageIds =
	| 'NoNativeImgTag'
	| 'NoNativeIFrameTag'
	| 'NoNativeAudioTag'
	| 'NoNativeVideoTag';

const NoNativeImgTag =
	"Prefer the <Img /> tag from 'remotion' package, because it will wait until the image is loaded when you are rendering your video.";
const NoNativeIFrameTag =
	"Prefer the <IFrame /> tag from 'remotion' package, because it will wait until the iframe is loaded when you are rendering your video.";
const NoNativeAudioTag =
	"Use the <Audio /> tag from 'remotion' package, because it will synchronize with the Remotion timeline.";
const NoNativeVideoTag =
	"Use the <Video /> tag from 'remotion' package, because it will synchronize with the Remotion timeline.";

export default createRule<Options, MessageIds>({
	name: 'warn-native-media-tag',
	meta: {
		type: 'problem',
		docs: {
			description: NoNativeImgTag,
			recommended: 'warn',
		},
		fixable: undefined,
		schema: [],
		messages: {
			NoNativeImgTag,
			NoNativeIFrameTag,
			NoNativeAudioTag,
			NoNativeVideoTag,
		},
	},
	defaultOptions: [],
	create: (context) => {
		return {
			JSXOpeningElement: (node) => {
				if (node.name.type === 'JSXIdentifier' && node.name.name === 'img') {
					context.report({
						messageId: 'NoNativeImgTag',
						node,
					});
				}
				if (node.name.type === 'JSXIdentifier' && node.name.name === 'iframe') {
					context.report({
						messageId: 'NoNativeIFrameTag',
						node,
					});
				}
				if (node.name.type === 'JSXIdentifier' && node.name.name === 'video') {
					context.report({
						messageId: 'NoNativeVideoTag',
						node,
					});
				}
				if (node.name.type === 'JSXIdentifier' && node.name.name === 'audio') {
					context.report({
						messageId: 'NoNativeAudioTag',
						node,
					});
				}
			},
			TaggedTemplateExpression: (node) => {
				if (node.tag.type !== 'MemberExpression') {
					return;
				}
				if (node.tag.object.type !== 'Identifier') {
					return;
				}
				if (node.tag.object.name !== 'styled') {
					return;
				}
				if (node.tag.property.type !== 'Identifier') {
					return;
				}
				if (node.tag.property.name === 'img') {
					context.report({
						messageId: 'NoNativeImgTag',
						node,
					});
				}
				if (node.tag.property.name === 'iframe') {
					context.report({
						messageId: 'NoNativeIFrameTag',
						node,
					});
				}
				if (node.tag.property.name === 'audio') {
					context.report({
						messageId: 'NoNativeAudioTag',
						node,
					});
				}
				if (node.tag.property.name === 'video') {
					context.report({
						messageId: 'NoNativeVideoTag',
						node,
					});
				}
			},
		};
	},
});
