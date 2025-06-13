import { environment } from './environment';
import { Microservice, MicroserviceKey, ApiEndpoints } from './constants';

const MICROSERVICE_PATHS: Record<Microservice, string> = Object.values(Microservice).reduce((acc, service) => ({
  ...acc,
  [service]: service.toLowerCase()
}), {} as Record<Microservice, string>);

export const API_ENDPOINTS: ApiEndpoints = {
  [Microservice.AUTH]: {
    SEND_OTP: '/sent/otp',
    SIGN_IN: '/signIn',
  },
  [Microservice.CORE]: {
    GET_NAVBAR_LIST: '/navbar/getNavbarListToDisplay',
  }
} as const;

export function getApiUrl(service: Microservice, endpointKey: string): string {
  try {
    console.log(`Getting URL for service: ${service}, endpoint: ${endpointKey}`);
    
    // Get the base URL for the service
    const baseUrl = environment.microservices[service];
    if (!baseUrl) {
      const errorMsg = `Base URL not found for service: ${service}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Get the endpoint path
    const serviceEndpoints = API_ENDPOINTS[service];
    if (!serviceEndpoints) {
      const errorMsg = `No endpoints configured for service: ${service}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    const endpoint = serviceEndpoints[endpointKey];
    if (!endpoint) {
      const errorMsg = `Endpoint '${endpointKey}' not found for service '${service}'`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Remove any trailing slashes from baseUrl and leading slashes from endpoint
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const fullUrl = `${cleanBaseUrl}${cleanEndpoint}`;
    console.log(`Constructed URL: ${fullUrl}`);
    
    return fullUrl;
  } catch (error) {
    console.error('Error constructing API URL:', error);
    throw error; // Re-throw to be handled by the caller
  }
}

export const api = {
  auth: (endpoint: keyof typeof API_ENDPOINTS[Microservice.AUTH]) => 
    ({ service: Microservice.AUTH, endpoint: API_ENDPOINTS[Microservice.AUTH]?.[endpoint] || '' }),
};
