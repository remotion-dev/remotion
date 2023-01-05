import {renderOnServer} from '@remotion/renderer';
import {getCompositionsFromMarkup, TCompMetadata} from 'remotion';
import {Index} from './Video';

const comps = getCompositionsFromMarkup(Index);
const reacSvg = comps.find((c) => c.id === 'svg-test');
renderOnServer(Index, reacSvg as TCompMetadata);
