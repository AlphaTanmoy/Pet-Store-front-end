import { Microservice } from './constants';

type MicroserviceUrls = {
  [key in Microservice]: string;
};

export const environment = {
  production: false,
  microservices: {
    [Microservice.ADMIN]: 'http://localhost:8081',
    [Microservice.AUTH]: 'http://localhost:8082',
    [Microservice.CORE]: 'http://localhost:8083',
    [Microservice.DOC]: 'http://localhost:8084',
    [Microservice.PAYMENT]: 'http://localhost:8085',
    [Microservice.MANAGEMENT]: 'http://localhost:8086',
    [Microservice.S3]: 'http://localhost:8087',
    [Microservice.KYC]: 'http://localhost:8088',
    [Microservice.SELLER]: 'http://localhost:8089',
    [Microservice.USER]: 'http://localhost:8091'
  } as MicroserviceUrls
};
