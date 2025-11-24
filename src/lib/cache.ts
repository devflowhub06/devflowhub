// Simple in-memory cache for better performance
class Cache {
  private cache = new Map<string, { value: any; expiry: number }>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, value: any, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cache with automatic key generation
  memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T {
    return ((...args: Parameters<T>) => {
      const key = keyGenerator 
        ? keyGenerator(...args)
        : `${fn.name}_${JSON.stringify(args)}`;
      
      const cached = this.get(key);
      if (cached !== null) {
        return cached;
      }

      const result = fn(...args);
      this.set(key, result);
      return result;
    }) as T;
  }
}

// Global cache instance
export const cache = new Cache();

// Cache decorator for functions
export const cached = (ttl: number = 5 * 60 * 1000) => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const key = `${target.constructor.name}_${propertyKey}_${JSON.stringify(args)}`;
      const cached = cache.get(key);
      
      if (cached !== null) {
        return cached;
      }

      const result = originalMethod.apply(this, args);
      cache.set(key, result, ttl);
      return result;
    };

    return descriptor;
  };
};

// Cache utilities for common operations
export const cacheUtils = {
  // Cache user data
  cacheUser: (userId: string, userData: any) => {
    cache.set(`user_${userId}`, userData, 10 * 60 * 1000); // 10 minutes
  },

  // Cache project data
  cacheProjects: (userId: string, projects: any[]) => {
    cache.set(`projects_${userId}`, projects, 5 * 60 * 1000); // 5 minutes
  },

  // Cache activities
  cacheActivities: (projectId: string, activities: any[]) => {
    cache.set(`activities_${projectId}`, activities, 2 * 60 * 1000); // 2 minutes
  },

  // Invalidate cache
  invalidateUserCache: (userId: string) => {
    cache.delete(`user_${userId}`);
    cache.delete(`projects_${userId}`);
  },

  invalidateProjectCache: (projectId: string) => {
    cache.delete(`activities_${projectId}`);
  },
}; 