import { ApiService } from "./ApiService";

export function createServices(config, predefinedApiService, apiMiddleware) {
  const apiService = predefinedApiService || new ApiService(`${config.backendUrl}`, apiMiddleware);

  return {
    config,
    apiService
  };
}
