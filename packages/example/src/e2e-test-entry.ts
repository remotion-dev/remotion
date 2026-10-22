import {registerProresDecoder} from '@mediabunny/prores';
import {registerRoot} from 'remotion';
import {E2eTestRoot} from './E2eTestRoot';

registerProresDecoder();
registerRoot(E2eTestRoot);
