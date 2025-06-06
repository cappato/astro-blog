# Technical Blog Platform

A professional blog platform built with Astro, TypeScript, and modern web technologies.

## Professional Standards

This project maintains strict professional standards:
- No emojis in code, commits, or documentation
- Technical content only
- Professional commit messages and PR descriptions
- Automated validation of content standards

##  Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## Commands

All commands are run from the root of the project:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run test`            | Run test suite                                   |
| `npm run clean:professional` | Remove unprofessional content                 |
| `npm run test:professional` | Validate professional standards               |

## Quality Assurance

### Professional Standards Validation
- Automated tests prevent emojis and casual language
- Pre-commit hooks enforce professional standards
- Content validation ensures technical focus

### Testing
- Unit tests for components and utilities
- Integration tests for blog functionality
- Professional standards validation
- Build verification

## Documentation

Technical documentation is available in the `docs/` directory.

---

**CI/CD Status:** Testing improved workflow reliability - 2024-12-19
