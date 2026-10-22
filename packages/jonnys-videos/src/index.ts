import {registerProresDecoder} from '@mediabunny/prores';
import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';

registerProresDecoder();
registerRoot(RemotionRoot);
