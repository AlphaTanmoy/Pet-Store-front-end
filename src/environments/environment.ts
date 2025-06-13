import { Microservice } from '../app/environment/constants';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Base API URL for backward compatibility
  
  // Microservices configuration
  microservices: {
    [Microservice.ADMIN]: 'http://localhost:8081',
    [Microservice.AUTH]: 'http://localhost:8082',
    [Microservice.CORE]: 'http://localhost:8083',
    [Microservice.DOC]: 'http://localhost:8080/doc',
    [Microservice.PAYMENT]: 'http://localhost:8080/payment',
    [Microservice.MANAGEMENT]: 'http://localhost:8080/management',
    [Microservice.S3]: 'http://localhost:8080/s3',
    [Microservice.KYC]: 'http://localhost:8080/kyc',
    [Microservice.SELLER]: 'http://localhost:8080/seller',
    [Microservice.USER]: 'http://localhost:8080/user',
  }
};
