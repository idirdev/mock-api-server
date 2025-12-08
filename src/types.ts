import type { Request, Response, NextFunction } from "express";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RouteDefinition {
  method: HttpMethod;
  path: string;
  status: number;
  response: unknown | ((req: Request) => unknown);
  delay?: number;
  headers?: Record<string, string>;
  description?: string;
}

export interface MockServerConfig {
  port: number;
  prefix: string;
  enableCors: boolean;
  enableLogging: boolean;
  defaultDelay: number;
  routes: RouteDefinition[];
}

export type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export interface FakeUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: "admin" | "user" | "moderator";
  createdAt: string;
}

export interface FakePost {
  id: number;
  title: string;
  body: string;
  authorId: number;
  tags: string[];
  likes: number;
  published: boolean;
  createdAt: string;
}

export interface FakeProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  inStock: boolean;
  rating: number;
  image: string;
}
