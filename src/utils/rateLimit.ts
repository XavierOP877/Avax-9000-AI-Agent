export const rateLimit = ({
    interval = 60 * 1000, // 1 minute
  } = {}) => {
    const tokenCache = new Map();
  
    return {
      check: (res: any, limit: number, token: string) =>
        new Promise<void>((resolve, reject) => {
          const tokenCount = tokenCache.get(token) || [0];
          if (tokenCount[0] === 0) {
            tokenCache.set(token, [1, Date.now()]);
            resolve();
          } else {
            const currentTime = Date.now();
            const timeInterval = currentTime - tokenCount[1];
            if (timeInterval < interval) {
              if (tokenCount[0] >= limit) {
                reject(new Error('Rate limit exceeded'));
              } else {
                tokenCount[0] += 1;
                resolve();
              }
            } else {
              tokenCache.set(token, [1, currentTime]);
              resolve();
            }
          }
        }),
    };
  };