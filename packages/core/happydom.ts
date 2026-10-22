import {GlobalRegistrator} from '@happy-dom/global-registrator';

GlobalRegistrator.register({url: 'http://localhost:3000'});
window.origin = 'http://localhost:3000';
// @ts-expect-error
window.remotion_staticBase = '/static-abcdef';
