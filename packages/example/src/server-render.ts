import {getCompositionsOnServer, renderOnServer} from '@remotion/renderer';
import {TCompMetadata} from 'remotion';
import {Index} from './Video';

const comps = getCompositionsOnServer(Index);
const reacSvg = comps.find((c) => c.id === 'svg-test');
renderOnServer(Index, reacSvg as TCompMetadata);
