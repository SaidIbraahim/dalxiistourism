// Simple in-memory cache service for frequently accessed data
class CacheService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log(`📦 CacheService: Cached data for key "${key}"`);
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      console.log(`📦 CacheService: No cache found for key "${key}"`);
      return null;
    }

    const now = Date.now();
    const isExpired = (now - cached.timestamp) > cached.ttl;

    if (isExpired) {
      console.log(`📦 CacheService: Cache expired for key "${key}"`);
      this.cache.delete(key);
      return null;
    }

    console.log(`📦 CacheService: Cache hit for key "${key}"`);
    return cached.data;
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    const isExpired = (now - cached.timestamp) > cached.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
      console.log(`📦 CacheService: Cleared cache for key "${key}"`);
    } else {
      this.cache.clear();
      console.log(`📦 CacheService: Cleared all cache`);
    }
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const cacheService = new CacheService();
