/**
 * Remark configuration for blog post validation
 * Replaces custom markdown structure validation with standard tools
 */

export default {
  plugins: [
    // Core remark-lint
    'remark-lint',

    // Basic validation only
    ['remark-lint-heading-style', 'atx'], // Use # style headings
    'remark-lint-no-duplicate-headings',
    ['remark-lint-maximum-line-length', 120],
  ],
  
  settings: {
    bullet: '-',
    emphasis: '*',
    strong: '*',
    listItemIndent: 'one',
    rule: '-',
    ruleSpaces: false,
    fences: true,
    incrementListMarker: false
  }
};
