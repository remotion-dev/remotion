import type { HostProvider, ProviderRegistry } from './types.js';

class ProviderRegistryImpl implements ProviderRegistry {
  private providers: HostProvider[] = [];

  register(provider: HostProvider): void {
    // Check for duplicate IDs
    if (this.providers.some((p) => p.id === provider.id)) {
      throw new Error(`Provider with id "${provider.id}" already registered`);
    }
    this.providers.push(provider);
  }

  findProvider(url: string): HostProvider | null {
    for (const provider of this.providers) {
      const match = provider.match(url);
      if (match.matches) {
        return provider;
      }
    }
    return null;
  }

  getProviders(): HostProvider[] {
    return [...this.providers];
  }
}

// Singleton registry instance
export const registry = new ProviderRegistryImpl();

/**
 * Register a provider with the global registry.
 */
export function registerProvider(provider: HostProvider): void {
  registry.register(provider);
}

/**
 * Find a provider that matches the given URL.
 */
export function findProvider(url: string): HostProvider | null {
  return registry.findProvider(url);
}

/**
 * Get all registered providers.
 */
export function getProviders(): HostProvider[] {
  return registry.getProviders();
}
