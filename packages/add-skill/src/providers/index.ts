// Export types
export type { HostProvider, ProviderMatch, ProviderRegistry, RemoteSkill } from './types.js';

// Export registry functions
export { registry, registerProvider, findProvider, getProviders } from './registry.js';

// Export individual providers
export { MintlifyProvider, mintlifyProvider } from './mintlify.js';
export { HuggingFaceProvider, huggingFaceProvider } from './huggingface.js';

// Register all built-in providers
import { registerProvider } from './registry.js';
import { mintlifyProvider } from './mintlify.js';
import { huggingFaceProvider } from './huggingface.js';

registerProvider(mintlifyProvider);
registerProvider(huggingFaceProvider);
