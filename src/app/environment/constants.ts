/**
 * Enum representing all available microservices in the application
 */
export enum Microservice {
  ADMIN = 'ADMIN',
  AUTH = 'AUTH',
  CORE = 'CORE',
  DOC = 'DOC',
  PAYMENT = 'PAYMENT',
  MANAGEMENT = 'MANAGEMENT',
  S3 = 'S3',
  KYC = 'KYC',
  SELLER = 'SELLER',
  USER = 'USER'
}

export enum UserRole {
  ROLE_MASTER = 'ROLE_MASTER',
  ROLE_CUSTOMER = 'ROLE_CUSTOMER',
  ROLE_SELLER = 'ROLE_SELLER',
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_DOCTOR = 'ROLE_DOCTOR',
  ROLE_CUSTOMER_CARE = 'ROLE_CUSTOMER_CARE',
  ROLE_RAIDER = 'ROLE_RAIDER'
}

export type MicroserviceKey = keyof typeof Microservice;

export type EndpointMap = Record<string, string>;

export type ApiEndpoints = {
  [key in Microservice]?: EndpointMap;
};
