import type { FakeUser, FakePost, FakeProduct } from "../types";

const FIRST_NAMES = [
  "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace",
  "Hank", "Ivy", "Jack", "Kate", "Liam", "Mia", "Noah", "Olivia",
  "Pete", "Quinn", "Ruby", "Sam", "Tara", "Uma", "Vic", "Wendy",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia",
  "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson",
];

const POST_TITLES = [
  "Getting Started with TypeScript",
  "Understanding Async/Await in JavaScript",
  "Building REST APIs with Express",
  "A Guide to React Hooks",
  "Mastering CSS Grid Layout",
  "Introduction to Docker Containers",
  "GraphQL vs REST: When to Use Which",
  "Testing Best Practices for Node.js",
  "Deploying with GitHub Actions",
  "Database Design Patterns",
  "Microservices Architecture Explained",
  "Web Security Fundamentals",
];

const TAGS = [
  "javascript", "typescript", "react", "node", "css", "html",
  "docker", "graphql", "testing", "devops", "security", "database",
];

const PRODUCT_NAMES = [
  "Wireless Keyboard", "USB-C Hub", "Mechanical Switch Set",
  "Monitor Stand", "Desk Lamp", "Webcam HD", "Noise Cancelling Headphones",
  "Ergonomic Mouse", "Laptop Stand", "Cable Management Kit",
  "Portable SSD 1TB", "Desk Mat XL", "Smart Power Strip",
];

const CATEGORIES = [
  "Electronics", "Accessories", "Office", "Audio", "Storage", "Lighting",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomDate(daysBack: number = 365): string {
  const now = Date.now();
  const past = now - daysBack * 24 * 60 * 60 * 1000;
  return new Date(randomInt(past, now)).toISOString();
}

export function generateUser(id: number): FakeUser {
  const firstName = randomPick(FIRST_NAMES);
  const lastName = randomPick(LAST_NAMES);
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomInt(1, 99)}`;

  return {
    id,
    username,
    email: `${username}@example.com`,
    firstName,
    lastName,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    role: randomPick(["admin", "user", "user", "user", "moderator"]),
    createdAt: randomDate(),
  };
}

export function generatePost(id: number): FakePost {
  return {
    id,
    title: randomPick(POST_TITLES),
    body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`,
    authorId: randomInt(1, 50),
    tags: randomPickN(TAGS, randomInt(1, 4)),
    likes: randomInt(0, 500),
    published: Math.random() > 0.2,
    createdAt: randomDate(180),
  };
}

export function generateProduct(id: number): FakeProduct {
  return {
    id,
    name: randomPick(PRODUCT_NAMES),
    description: `High-quality product designed for professionals and enthusiasts alike. Premium build with attention to detail.`,
    price: parseFloat((Math.random() * 200 + 9.99).toFixed(2)),
    currency: "USD",
    category: randomPick(CATEGORIES),
    inStock: Math.random() > 0.15,
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
    image: `https://picsum.photos/seed/${id}/400/300`,
  };
}

export function generateUsers(count: number): FakeUser[] {
  return Array.from({ length: count }, (_, i) => generateUser(i + 1));
}

export function generatePosts(count: number): FakePost[] {
  return Array.from({ length: count }, (_, i) => generatePost(i + 1));
}

export function generateProducts(count: number): FakeProduct[] {
  return Array.from({ length: count }, (_, i) => generateProduct(i + 1));
}
