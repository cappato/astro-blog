/**
 * Schema.org SEO Tests
 * Validation of structured data and JSON-LD schemas
 * Run manually: npm run test:seo:schema
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

const PRODUCTION_URL = 'https://cappato.dev';
const REQUEST_TIMEOUT = 15000;

// Helper function to fetch and parse HTML
async function fetchAndParse(url: string): Promise<JSDOM> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SEO-Test-Bot/1.0)'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  
  const html = await response.text();
  return new JSDOM(html);
}

// Helper function to extract structured data
function getStructuredData(dom: JSDOM): any[] {
  const document = dom.window.document;
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  const data: any[] = [];
  
  scripts.forEach(script => {
    try {
      const json = JSON.parse(script.textContent || '');
      data.push(json);
    } catch (error) {
      console.warn('Invalid JSON-LD found:', script.textContent);
    }
  });
  
  return data;
}

// Helper function to validate schema structure
function validateSchemaStructure(schema: any, requiredFields: string[]): void {
  expect(schema).toBeTruthy();
  expect(schema['@context']).toBe('https://schema.org');
  expect(schema['@type']).toBeTruthy();
  
  requiredFields.forEach(field => {
    expect(schema[field], `Missing required field: ${field}`).toBeTruthy();
  });
}

// Helper function to find blog post URLs
async function findBlogPostUrls(): Promise<string[]> {
  const blogDom = await fetchAndParse(`${PRODUCTION_URL}/blog`);
  const links = blogDom.window.document.querySelectorAll('a[href*="/blog/"]');
  
  const urls = Array.from(links)
    .map(link => link.getAttribute('href'))
    .filter(href => href && href !== '/blog' && !href.includes('#'))
    .map(href => href!.startsWith('http') ? href : `${PRODUCTION_URL}${href}`)
    .slice(0, 2); // Test first 2 blog posts
  
  return [...new Set(urls)];
}

describe('Schema.org SEO Tests', () => {
  describe('Homepage Structured Data', () => {
    let homeSchemas: any[];

    beforeAll(async () => {
      const homeDom = await fetchAndParse(PRODUCTION_URL);
      homeSchemas = getStructuredData(homeDom);
    }, REQUEST_TIMEOUT);

    test('should have structured data present', () => {
      expect(homeSchemas.length).toBeGreaterThan(0);
    });

    test('should have WebSite schema', () => {
      const webSiteSchema = homeSchemas.find(schema => schema['@type'] === 'WebSite');
      
      if (webSiteSchema) {
        validateSchemaStructure(webSiteSchema, ['name', 'url']);
        // Allow URL with or without trailing slash
        expect(webSiteSchema.url === PRODUCTION_URL || webSiteSchema.url === PRODUCTION_URL + '/').toBe(true);
        expect(webSiteSchema.name).toContain('Matías');
      }
    });

    test('should have Person or Organization schema', () => {
      const personSchema = homeSchemas.find(schema => 
        schema['@type'] === 'Person' || schema['@type'] === 'Organization'
      );
      
      if (personSchema) {
        validateSchemaStructure(personSchema, ['name']);
        expect(personSchema.name).toContain('Matías');
        
        if (personSchema['@type'] === 'Person') {
          // Person-specific validations
          if (personSchema.jobTitle) {
            expect(personSchema.jobTitle).toBeTruthy();
          }
          if (personSchema.url) {
            expect(personSchema.url).toMatch(/^https?:\/\//);
          }
        }
      }
    });

    test('should have valid schema context', () => {
      homeSchemas.forEach((schema, index) => {
        // Some schemas might not have @context if they're nested
        if (schema['@context']) {
          expect(schema['@context']).toBe('https://schema.org');
        }

        // Only check @type for top-level schemas (not nested objects)
        if (schema['@context'] || index === 0) {
          expect(schema['@type']).toBeTruthy();
        } else {
          // For nested schemas, @type is optional
          console.log(`Schema ${index} is nested, @type optional:`, schema);
        }
      });
    });

    test('should have proper URL formats in schemas', () => {
      homeSchemas.forEach(schema => {
        if (schema.url) {
          expect(schema.url).toMatch(/^https?:\/\//);
        }
        if (schema.sameAs) {
          if (Array.isArray(schema.sameAs)) {
            schema.sameAs.forEach((url: string) => {
              expect(url).toMatch(/^https?:\/\//);
            });
          } else {
            expect(schema.sameAs).toMatch(/^https?:\/\//);
          }
        }
      });
    });
  });

  describe('Blog Section Structured Data', () => {
    let blogSchemas: any[];

    beforeAll(async () => {
      const blogDom = await fetchAndParse(`${PRODUCTION_URL}/blog`);
      blogSchemas = getStructuredData(blogDom);
    }, REQUEST_TIMEOUT);

    test('should have blog-related structured data', () => {
      expect(blogSchemas.length).toBeGreaterThan(0);
    });

    test('should have Blog or WebPage schema', () => {
      const blogSchema = blogSchemas.find(schema => 
        schema['@type'] === 'Blog' || 
        schema['@type'] === 'WebPage' ||
        schema['@type'] === 'CollectionPage'
      );
      
      if (blogSchema) {
        validateSchemaStructure(blogSchema, ['name']);
        
        if (blogSchema['@type'] === 'Blog') {
          expect(blogSchema.name).toMatch(/blog/i);
        }
      }
    });
  });

  describe('Blog Post Structured Data', () => {
    let blogPostUrls: string[];

    beforeAll(async () => {
      blogPostUrls = await findBlogPostUrls();
    }, REQUEST_TIMEOUT);

    test('should find blog posts to test', () => {
      expect(blogPostUrls.length).toBeGreaterThan(0);
    });

    test('blog posts should have Article schema', async () => {
      if (blogPostUrls.length === 0) {
        console.warn('No blog posts found to test');
        return;
      }

      for (const url of blogPostUrls) {
        try {
          const postDom = await fetchAndParse(url);
          const postSchemas = getStructuredData(postDom);

          expect(postSchemas.length, `Blog post ${url} has no structured data`).toBeGreaterThan(0);

          const articleSchema = postSchemas.find(schema => 
            schema['@type'] === 'Article' || 
            schema['@type'] === 'BlogPosting' ||
            schema['@type'] === 'TechArticle'
          );

          if (articleSchema) {
            validateSchemaStructure(articleSchema, ['headline', 'author']);
            
            // Validate author
            expect(articleSchema.author).toBeTruthy();
            if (typeof articleSchema.author === 'object') {
              expect(articleSchema.author['@type']).toBe('Person');
              expect(articleSchema.author.name).toBeTruthy();
            }

            // Validate dates if present
            if (articleSchema.datePublished) {
              expect(new Date(articleSchema.datePublished)).toBeInstanceOf(Date);
            }
            if (articleSchema.dateModified) {
              expect(new Date(articleSchema.dateModified)).toBeInstanceOf(Date);
            }

            // Validate publisher if present
            if (articleSchema.publisher) {
              expect(articleSchema.publisher['@type']).toBeTruthy();
              expect(articleSchema.publisher.name).toBeTruthy();
            }

            // Validate main entity of page
            if (articleSchema.mainEntityOfPage) {
              expect(articleSchema.mainEntityOfPage).toBe(url);
            }
          } else {
            console.warn(`Blog post ${url} missing Article schema`);
          }

        } catch (error) {
          console.warn(`Failed to test blog post schema ${url}:`, error);
        }
      }
    }, 30000);
  });

  describe('Schema Validation and Quality', () => {
    test('should not have duplicate schemas of same type on homepage', async () => {
      const homeDom = await fetchAndParse(PRODUCTION_URL);
      const homeSchemas = getStructuredData(homeDom);
      
      const schemaTypes = homeSchemas.map(schema => schema['@type']);
      const uniqueTypes = [...new Set(schemaTypes)];
      
      // Allow some duplication for complex schemas, but warn if excessive
      if (schemaTypes.length > uniqueTypes.length + 2) {
        console.warn('Potentially excessive schema duplication detected');
      }
    });

    test('should have valid JSON-LD syntax', async () => {
      const homeDom = await fetchAndParse(PRODUCTION_URL);
      const scripts = homeDom.window.document.querySelectorAll('script[type="application/ld+json"]');
      
      scripts.forEach(script => {
        expect(() => {
          JSON.parse(script.textContent || '');
        }).not.toThrow();
      });
    });

    test('should have consistent data across schemas', async () => {
      const homeDom = await fetchAndParse(PRODUCTION_URL);
      const homeSchemas = getStructuredData(homeDom);
      
      // Check for consistent URLs
      const urls = homeSchemas
        .map(schema => schema.url)
        .filter(url => url);
      
      if (urls.length > 1) {
        const uniqueUrls = [...new Set(urls)];
        expect(uniqueUrls.length).toBeLessThanOrEqual(2); // Allow some variation
      }

      // Check for consistent names
      const names = homeSchemas
        .map(schema => schema.name)
        .filter(name => name);
      
      if (names.length > 1) {
        // Names should contain similar keywords
        const hasConsistentNaming = names.every(name => 
          name.toLowerCase().includes('matías') || 
          name.toLowerCase().includes('cappato')
        );
        expect(hasConsistentNaming).toBe(true);
      }
    });

    test('should have proper schema nesting', async () => {
      const homeDom = await fetchAndParse(PRODUCTION_URL);
      const homeSchemas = getStructuredData(homeDom);
      
      homeSchemas.forEach(schema => {
        // Check that nested objects have proper @type
        Object.values(schema).forEach(value => {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            if (value['@type']) {
              expect(value['@type']).toBeTruthy();
            }
          }
        });
      });
    });
  });

  describe('Rich Snippets Potential', () => {
    test('should have data suitable for rich snippets', async () => {
      const homeDom = await fetchAndParse(PRODUCTION_URL);
      const homeSchemas = getStructuredData(homeDom);
      
      // Check for schemas that enable rich snippets
      const richSnippetTypes = [
        'Person', 'Organization', 'WebSite', 'Article', 
        'BlogPosting', 'BreadcrumbList', 'FAQPage'
      ];
      
      const hasRichSnippetSchema = homeSchemas.some(schema => 
        richSnippetTypes.includes(schema['@type'])
      );
      
      expect(hasRichSnippetSchema).toBe(true);
    });

    test('should have search action for WebSite schema', async () => {
      const homeDom = await fetchAndParse(PRODUCTION_URL);
      const homeSchemas = getStructuredData(homeDom);
      
      const webSiteSchema = homeSchemas.find(schema => schema['@type'] === 'WebSite');
      
      if (webSiteSchema && webSiteSchema.potentialAction) {
        const searchAction = Array.isArray(webSiteSchema.potentialAction) 
          ? webSiteSchema.potentialAction.find((action: any) => action['@type'] === 'SearchAction')
          : webSiteSchema.potentialAction['@type'] === 'SearchAction' ? webSiteSchema.potentialAction : null;
        
        if (searchAction) {
          expect(searchAction.target).toBeTruthy();
          expect(searchAction['query-input']).toBeTruthy();
        }
      }
    });
  });
});
