export class DataCache<T> {
  key: string;
  limit: number;

  constructor(key: string, limit: number) {
    this.key = key;
    this.limit = limit;
  }

  static from<T>(key: string, limit: number): DataCache<T> {
    return new DataCache(key, limit);
  }

  async fetchOrCompute(fetcher: () => Promise<T>): Promise<T> {
    const cachedData = JSON.parse(localStorage.getItem(`data_cache_${this.key}`));
    const cachedDataTimestamp = Number(localStorage.getItem(`data_cache_${this.key}_timestamp`));

    if (cachedData && Date.now() - cachedDataTimestamp < this.limit) {
      return cachedData as T;
    } else {
      const data = await fetcher();

      localStorage.setItem(`data_cache_${this.key}`, JSON.stringify(data));
      localStorage.setItem(`data_cache_${this.key}_timestamp`, String(Date.now()));

      return data;
    }
  }
}
