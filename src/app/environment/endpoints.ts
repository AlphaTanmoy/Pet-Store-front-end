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
  }
} as const;

export function getApiUrl(service: Microservice, endpointKey: string): string {
  const baseUrl = environment.microservices[service];
  const endpoint = API_ENDPOINTS[service]?.[endpointKey];
  
  if (!endpoint) {
    console.error(`Endpoint '${endpointKey}' not found for service '${service}'`);
    return '';
  }
  
  // Remove any trailing slashes from baseUrl and leading slashes from endpoint
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${cleanBaseUrl}${cleanEndpoint}`;
}

export const api = {
  auth: (endpoint: keyof typeof API_ENDPOINTS[Microservice.AUTH]) => 
    ({ service: Microservice.AUTH, endpoint: API_ENDPOINTS[Microservice.AUTH]?.[endpoint] || '' }),
};
