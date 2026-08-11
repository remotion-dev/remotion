import {bundleInstaller} from './src/admin/bundle-installer';
import {bundleRenderLogic} from './src/admin/bundle-renderLogic';

await bundleRenderLogic();
await bundleInstaller();
