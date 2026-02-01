import { describe, it, expect } from 'vitest';
import { getRouteSummary } from '../src/router';
import {
  generateUser,
  generatePost,
  generateProduct,
  generateUsers,
  generatePosts,
  generateProducts,
} from '../src/utils/faker';
import type { RouteDefinition } from '../src/types';

describe('generateUser', () => {
  it('should generate a user with the given id', () => {
    const user = generateUser(1);
    expect(user.id).toBe(1);
  });

  it('should have required fields', () => {
    const user = generateUser(5);
    expect(user.id).toBe(5);
    expect(typeof user.username).toBe('string');
    expect(user.email).toContain('@example.com');
    expect(typeof user.firstName).toBe('string');
    expect(typeof user.lastName).toBe('string');
    expect(typeof user.avatar).toBe('string');
    expect(['admin', 'user', 'moderator']).toContain(user.role);
    expect(typeof user.createdAt).toBe('string');
  });

  it('should generate a valid ISO date string for createdAt', () => {
    const user = generateUser(1);
    const date = new Date(user.createdAt);
    expect(date.toString()).not.toBe('Invalid Date');
  });

  it('should generate email based on username', () => {
    const user = generateUser(1);
    expect(user.email).toBe(`${user.username}@example.com`);
  });
});

describe('generatePost', () => {
  it('should generate a post with the given id', () => {
    const post = generatePost(1);
    expect(post.id).toBe(1);
  });

  it('should have required fields', () => {
    const post = generatePost(10);
    expect(post.id).toBe(10);
    expect(typeof post.title).toBe('string');
    expect(typeof post.body).toBe('string');
    expect(typeof post.authorId).toBe('number');
    expect(Array.isArray(post.tags)).toBe(true);
    expect(post.tags.length).toBeGreaterThan(0);
    expect(typeof post.likes).toBe('number');
    expect(typeof post.published).toBe('boolean');
    expect(typeof post.createdAt).toBe('string');
  });

  it('should have tags that are strings', () => {
    const post = generatePost(1);
    for (const tag of post.tags) {
      expect(typeof tag).toBe('string');
    }
  });
});

describe('generateProduct', () => {
  it('should generate a product with the given id', () => {
    const product = generateProduct(1);
    expect(product.id).toBe(1);
  });

  it('should have required fields', () => {
    const product = generateProduct(7);
    expect(product.id).toBe(7);
    expect(typeof product.name).toBe('string');
    expect(typeof product.description).toBe('string');
    expect(typeof product.price).toBe('number');
    expect(product.price).toBeGreaterThan(0);
    expect(product.currency).toBe('USD');
    expect(typeof product.category).toBe('string');
    expect(typeof product.inStock).toBe('boolean');
    expect(typeof product.rating).toBe('number');
    expect(product.rating).toBeGreaterThanOrEqual(3);
    expect(product.rating).toBeLessThanOrEqual(5);
    expect(typeof product.image).toBe('string');
  });
});

describe('generateUsers', () => {
  it('should generate the specified number of users', () => {
    const users = generateUsers(5);
    expect(users).toHaveLength(5);
  });

  it('should assign sequential IDs starting from 1', () => {
    const users = generateUsers(3);
    expect(users[0].id).toBe(1);
    expect(users[1].id).toBe(2);
    expect(users[2].id).toBe(3);
  });
});

describe('generatePosts', () => {
  it('should generate the specified number of posts', () => {
    const posts = generatePosts(10);
    expect(posts).toHaveLength(10);
  });

  it('should assign sequential IDs starting from 1', () => {
    const posts = generatePosts(3);
    expect(posts[0].id).toBe(1);
    expect(posts[1].id).toBe(2);
    expect(posts[2].id).toBe(3);
  });
});

describe('generateProducts', () => {
  it('should generate the specified number of products', () => {
    const products = generateProducts(8);
    expect(products).toHaveLength(8);
  });

  it('should assign sequential IDs starting from 1', () => {
    const products = generateProducts(3);
    expect(products[0].id).toBe(1);
    expect(products[1].id).toBe(2);
    expect(products[2].id).toBe(3);
  });
});

describe('getRouteSummary', () => {
  const testRoutes: RouteDefinition[] = [
    {
      method: 'GET',
      path: '/users',
      status: 200,
      response: { data: [] },
      description: 'Get users',
    },
    {
      method: 'POST',
      path: '/users',
      status: 201,
      response: { data: {} },
      delay: 500,
      description: 'Create user',
    },
    {
      method: 'DELETE',
      path: '/users/:id',
      status: 200,
      response: { success: true },
    },
  ];

  it('should return a summary for each route', () => {
    const summary = getRouteSummary(testRoutes);
    expect(summary).toHaveLength(3);
  });

  it('should include method, path, status, and description', () => {
    const summary = getRouteSummary(testRoutes);
    expect(summary[0].method).toBe('GET');
    expect(summary[0].path).toBe('/users');
    expect(summary[0].status).toBe(200);
    expect(summary[0].description).toBe('Get users');
  });

  it('should include delay defaulting to 0', () => {
    const summary = getRouteSummary(testRoutes);
    expect(summary[0].delay).toBe(0);
    expect(summary[1].delay).toBe(500);
  });

  it('should prepend prefix to paths', () => {
    const summary = getRouteSummary(testRoutes, '/api/v1');
    expect(summary[0].path).toBe('/api/v1/users');
    expect(summary[2].path).toBe('/api/v1/users/:id');
  });

  it('should handle routes without description', () => {
    const summary = getRouteSummary(testRoutes);
    expect(summary[2].description).toBe('');
  });
});
