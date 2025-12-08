import type { Request } from "express";
import type { RouteDefinition } from "../types";
import { generateUsers, generatePosts, generateProducts, generateUser, generatePost, generateProduct } from "../utils/faker";

const users = generateUsers(25);
const posts = generatePosts(40);
const products = generateProducts(30);

export const routes: RouteDefinition[] = [
  // Users
  {
    method: "GET",
    path: "/users",
    status: 200,
    response: (req: Request) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const start = (page - 1) * limit;
      return {
        data: users.slice(start, start + limit),
        total: users.length,
        page,
        limit,
        totalPages: Math.ceil(users.length / limit),
      };
    },
    description: "Get paginated users list",
  },
  {
    method: "GET",
    path: "/users/:id",
    status: 200,
    response: (req: Request) => {
      const id = parseInt(req.params.id);
      const user = users.find((u) => u.id === id);
      if (!user) return { error: "User not found" };
      return { data: user };
    },
    description: "Get user by ID",
  },
  {
    method: "POST",
    path: "/users",
    status: 201,
    response: (req: Request) => {
      const newUser = generateUser(users.length + 1);
      return { data: { ...newUser, ...req.body }, message: "User created" };
    },
    delay: 500,
    description: "Create a new user",
  },
  {
    method: "DELETE",
    path: "/users/:id",
    status: 200,
    response: (req: Request) => {
      return { message: `User ${req.params.id} deleted`, success: true };
    },
    description: "Delete a user",
  },

  // Posts
  {
    method: "GET",
    path: "/posts",
    status: 200,
    response: (req: Request) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const tag = req.query.tag as string | undefined;
      let filtered = posts;
      if (tag) {
        filtered = posts.filter((p) => p.tags.includes(tag));
      }
      const start = (page - 1) * limit;
      return {
        data: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        limit,
      };
    },
    description: "Get paginated posts, filterable by tag",
  },
  {
    method: "GET",
    path: "/posts/:id",
    status: 200,
    response: (req: Request) => {
      const id = parseInt(req.params.id);
      const post = posts.find((p) => p.id === id);
      if (!post) return { error: "Post not found" };
      return { data: post };
    },
    description: "Get post by ID",
  },
  {
    method: "POST",
    path: "/posts",
    status: 201,
    response: (req: Request) => {
      const newPost = generatePost(posts.length + 1);
      return { data: { ...newPost, ...req.body }, message: "Post created" };
    },
    delay: 300,
    description: "Create a new post",
  },

  // Products
  {
    method: "GET",
    path: "/products",
    status: 200,
    response: (req: Request) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string | undefined;
      let filtered = products;
      if (category) {
        filtered = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }
      const start = (page - 1) * limit;
      return {
        data: filtered.slice(start, start + limit),
        total: filtered.length,
        page,
        limit,
      };
    },
    description: "Get paginated products, filterable by category",
  },
  {
    method: "GET",
    path: "/products/:id",
    status: 200,
    response: (req: Request) => {
      const id = parseInt(req.params.id);
      const product = products.find((p) => p.id === id);
      if (!product) return { error: "Product not found" };
      return { data: product };
    },
    description: "Get product by ID",
  },
  {
    method: "POST",
    path: "/products",
    status: 201,
    response: (req: Request) => {
      const newProduct = generateProduct(products.length + 1);
      return { data: { ...newProduct, ...req.body }, message: "Product created" };
    },
    delay: 400,
    description: "Create a new product",
  },

  // Health & Meta
  {
    method: "GET",
    path: "/health",
    status: 200,
    response: { status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() },
    description: "Health check endpoint",
  },
  {
    method: "GET",
    path: "/",
    status: 200,
    response: {
      name: "Mock API Server",
      version: "1.0.0",
      endpoints: ["/users", "/posts", "/products", "/health"],
    },
    description: "API info",
  },
];
