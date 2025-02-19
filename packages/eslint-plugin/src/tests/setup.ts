import {describe, it} from 'vitest';

// @ts-expect-error
global.describe = describe;
// @ts-expect-error
global.it = it;
