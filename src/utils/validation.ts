export const isValidPrivateKey = (key: string): boolean => {
    const normalizedKey = key.startsWith('0x') ? key.slice(2) : key;
    return /^[0-9a-fA-F]{64}$/.test(normalizedKey);
  };
  
  export const isValidAddress = (address: string): boolean => {
    return /^0x[0-9a-fA-F]{40}$/.test(address);
  };
  