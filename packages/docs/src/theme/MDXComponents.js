// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
import {Demo} from '../../components/demos';
import {EffectsDemo} from '../../components/effects-demos';
import {ExperimentalBadge} from '../../components/Experimental';
import {InlineStep, Step, TitleStep} from '../../components/InlineStep';
import {Installation} from '../../components/Installation';
import {JumpToVideoLink} from '../../components/JumpToVideoLink';
import {YouTube} from '../../components/YouTube';
import {
	AvailableFrom,
	MinBunVersion,
	MinNodeVersion,
} from '../components/AvailableFrom';
import {CompatibilityTable} from '../components/CompatibilityTable';
import {Credits} from '../components/Credits';
import {Options} from '../components/Options';
import {SuggestedPrompts} from '../components/SuggestedPrompts';
import {TsType} from '../components/TsType';
import RawMarkdownCarrier from './RawMarkdownCarrier/index';

export default {
	...MDXComponents,
	InlineStep,
	ExperimentalBadge,
	Step,
	Demo,
	EffectsDemo,
	AvailableFrom,
	TsType,
	MinNodeVersion,
	MinBunVersion,
	Options,
	Credits,
	YouTube,
	Installation,
	TitleStep,
	JumpToVideoLink,
	RawMarkdownCarrier,
	CompatibilityTable,
	SuggestedPrompts,
};
