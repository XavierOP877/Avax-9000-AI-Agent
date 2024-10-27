import { Response } from 'express';

interface TokenData {
  count: number;
  timestamp: number;
}

interface RateLimitOptions {
  interval?: number;
}

export const rateLimit = ({
    interval = 60 * 1000, // 1 minute
}: RateLimitOptions = {}) => {
    const tokenCache = new Map<string, TokenData>();
  
    return {
      check: (res: Response, limit: number, token: string) =>
        new Promise<void>((resolve, reject) => {
          const tokenCount = tokenCache.get(token) || { count: 0, timestamp: Date.now() };
          
          if (tokenCount.count === 0) {
            tokenCache.set(token, { count: 1, timestamp: Date.now() });
            resolve();
          } else {
            const currentTime = Date.now();
            const timeInterval = currentTime - tokenCount.timestamp;
            
            if (timeInterval < interval) {
              if (tokenCount.count >= limit) {
                reject(new Error('Rate limit exceeded'));
              } else {
                tokenCache.set(token, {
                  count: tokenCount.count + 1,
                  timestamp: tokenCount.timestamp
                });
                resolve();
              }
            } else {
              tokenCache.set(token, { count: 1, timestamp: currentTime });
              resolve();
            }
          }
        }),
    };
  };