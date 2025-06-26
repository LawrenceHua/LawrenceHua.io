// Centralized geolocation manager to prevent duplicate API calls
class GeolocationManager {
  private static instance: GeolocationManager;
  private cache: any = null;
  private cacheExpiry: number = 0;
  private pendingRequest: Promise<any> | null = null;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  static getInstance(): GeolocationManager {
    if (!GeolocationManager.instance) {
      GeolocationManager.instance = new GeolocationManager();
    }
    return GeolocationManager.instance;
  }

  async getGeolocation(): Promise<any> {
    // Return cached data if still valid
    if (this.cache && Date.now() < this.cacheExpiry) {
      console.log("🌍 Using cached geolocation data");
      return this.cache;
    }

    // If there's already a pending request, wait for it
    if (this.pendingRequest) {
      console.log("🌍 Waiting for existing geolocation request");
      return this.pendingRequest;
    }

    // Create new request
    console.log("🌍 Fetching fresh geolocation data");
    this.pendingRequest = this.fetchGeolocation();

    try {
      const result = await this.pendingRequest;
      
      // Cache the result
      this.cache = result;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      
      // Clear pending request
      this.pendingRequest = null;
      
      return result;
    } catch (error) {
      // Clear pending request on error
      this.pendingRequest = null;
      throw error;
    }
  }

  private async fetchGeolocation(): Promise<any> {
    try {
      const response = await fetch('/api/geolocation');
      if (response.ok) {
        const data = await response.json();
        console.log("🌍 Geolocation data fetched successfully:", {
          city: data.city,
          country: data.country_name,
          cached: false
        });
        return data;
      } else {
        throw new Error(`Geolocation API responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error("🌍 Geolocation fetch failed:", error);
      // Return default data on error
      return {
        country_name: "Unknown",
        region: "Unknown", 
        city: "Unknown",
        latitude: null,
        longitude: null,
        timezone: "Unknown",
        ip: "Unknown",
        rate_limited: false,
        fresh: false,
        error: true
      };
    }
  }

  // Method to clear cache if needed
  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
    this.pendingRequest = null;
    console.log("🌍 Geolocation cache cleared");
  }
}

// Export singleton instance
export const geolocationManager = GeolocationManager.getInstance(); 