import {$} from 'bun';

await $`rm -rf packages/**/tsconfig.tsbuildinfo`.nothrow().quiet()
console.log('Cleaned up tsconfig.tsbuildinfo')
await $`rm -f packages/tsconfig.tsbuildinfo`
console.log('Cleaned up root tsconfig.tsbuildinfo')
await $`rm -rf packages/**/dist`.nothrow().quiet()
console.log('Cleaned up dist')
await $`rm -rf packages/**/node_modules`.nothrow().quiet()
console.log('Cleaned up package node_modules')
await $`rm -rf node_modules`
console.log('Cleaned up root node_modules')
await $`rm -rf .cache`
console.log('Cleaned up .cache')
await $`rm -rf packages/**/.turbo`.nothrow().quiet()
console.log('Cleaned up .turbo')
await $`rm -rf .turbo`
console.log('Cleaned up root .turbo')
