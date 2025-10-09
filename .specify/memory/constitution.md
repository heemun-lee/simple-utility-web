# Simple Utility Web Constitution

<!--
Sync Impact Report - Version 1.1.0
===========================================
Version Change: 1.0.0 → 1.1.0
Modified Principles:
  - V. Testing Strategy → Enhanced with Playwright MCP requirements

Added Sections:
  - VI. GitHub Pages Deployment (new principle)
  - VII. Playwright-Based UI Testing (new principle)
  - Development Workflow: Enhanced CI/CD and testing requirements

Removed Sections: N/A

Templates Status:
✅ .specify/templates/plan-template.md - Reviewed, compatible with new deployment principles
✅ .specify/templates/spec-template.md - Reviewed, compatible with new testing requirements
✅ .specify/templates/tasks-template.md - Reviewed, compatible with new workflow
⚠️  No command templates found - N/A

Follow-up TODOs:
- Update any existing quickstart documentation to include Playwright test setup
- Document GitHub Pages deployment workflow in project README
===========================================
-->

## Core Principles

### I. Airbnb JavaScript Style Guide Compliance

All JavaScript code MUST adhere to the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

**Non-Negotiable Rules**:
- Use `const` for all variable declarations; use `let` only when reassignment is necessary
- Never use `var` - all code must use block-scoped declarations
- Use object and array literal syntax (`{}`, `[]`) instead of constructors
- Prefer ES6+ features: arrow functions, template literals, destructuring, spread operators
- Use object/array shorthand syntax consistently
- Avoid direct mutations - prefer immutable patterns

**Rationale**: Consistency in code style reduces cognitive load, prevents common bugs (hoisting, scope issues), and ensures the codebase is maintainable by any developer familiar with industry-standard JavaScript practices.

### II. Vanilla JavaScript First

The project MUST remain dependency-free, using only vanilla JavaScript (ES6+) and native browser APIs.

**Requirements**:
- No external JavaScript frameworks or libraries (React, Vue, jQuery, etc.)
- All functionality must be implemented using native DOM APIs
- Browser compatibility: Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Progressive enhancement: Core functionality works without JavaScript, enhanced with it

**Rationale**: Zero dependencies ensure fast loading, maximum portability, no supply chain vulnerabilities, and educational value for understanding fundamental web technologies.

### III. Mobile-First Responsive Design

All UI components and layouts MUST be designed mobile-first with responsive breakpoints.

**Requirements**:
- Mobile breakpoint: < 768px (hamburger menu, touch-optimized)
- Tablet breakpoint: 768px - 1024px
- Desktop breakpoint: > 1024px
- Touch targets MUST be minimum 44x44px on mobile
- All interactive elements must be keyboard accessible

**Rationale**: Mobile traffic dominates web usage. Mobile-first design ensures optimal experience on constrained devices while progressively enhancing for larger screens.

### IV. Performance and Optimization

Page load and interaction performance MUST meet defined thresholds.

**Performance Budgets**:
- Initial page load: < 1s on desktop, < 3s on 3G mobile
- Time to Interactive (TTI): < 2s on desktop, < 5s on mobile
- Page transitions: < 300ms with visual feedback
- Cache hit ratio: > 80% for repeat page visits

**Optimization Requirements**:
- Implement page caching (Map-based for SPA routing)
- Preload critical resources (menu.json, critical CSS)
- Minimize DOM manipulation - batch updates when possible
- Use CSS transforms and opacity for animations (GPU-accelerated)

**Rationale**: Performance directly impacts user experience, SEO, and accessibility. Defined budgets ensure the application remains fast as features are added.

### V. Accessibility and Semantic HTML

All interfaces MUST be accessible and use semantic HTML5 elements.

**Accessibility Requirements**:
- WCAG 2.1 AA compliance (minimum)
- Proper ARIA attributes for dynamic content and custom controls
- Semantic HTML5 elements (`<nav>`, `<main>`, `<article>`, etc.)
- Keyboard navigation support for all interactive elements
- Screen reader compatibility verified

**Testing Requirements**:
- Manual keyboard navigation testing
- Screen reader testing (NVDA/JAWS/VoiceOver)
- Automated accessibility testing tools (axe, Lighthouse)

**Rationale**: Accessibility is a legal requirement in many jurisdictions and a moral imperative. Semantic HTML improves SEO, maintainability, and ensures content is available to all users regardless of ability.

### VI. GitHub Pages Deployment

The project MUST be deployable to GitHub Pages with automated deployment pipeline.

**Deployment Requirements**:
- Static site structure compatible with GitHub Pages
- All paths must be relative or use base path configuration
- No server-side processing - all logic client-side
- `.nojekyll` file present to prevent Jekyll processing
- Production build must be commit-ready in repository

**GitHub Pages Configuration**:
- Deploy from repository root or `/docs` folder
- Custom domain support (optional)
- HTTPS enforcement enabled
- Branch-based deployment (typically `main` or `gh-pages`)

**Rationale**: GitHub Pages provides free, reliable hosting for static sites with built-in CI/CD. Standardizing on this platform ensures consistent deployment and easy rollback capabilities.

### VII. Playwright-Based UI Testing

All UI functionality MUST be validated using Playwright MCP with automated browser testing.

**Testing Requirements**:
- All user interactions must have Playwright test coverage
- Tests must run in multiple browsers (Chromium, Firefox, WebKit)
- Visual regression testing for critical UI components
- Accessibility testing via Playwright's accessibility assertions
- Performance metrics captured during test runs

**Test Execution Workflow**:
1. Write Playwright tests before or during feature implementation
2. Run tests locally until all pass
3. Iteratively fix issues until 100% pass rate achieved
4. Only commit code when all tests pass
5. Re-run tests after any code changes

**Test Organization**:
```
tests/
├── e2e/                    # End-to-end user journey tests
├── visual/                 # Visual regression tests
└── accessibility/          # WCAG compliance tests
```

**Rationale**: Playwright MCP provides real browser automation, ensuring UI works correctly across all target browsers. Mandatory test-passing before commit prevents regression and maintains quality standards.

## Code Quality Standards

### File Organization

**Structure Requirements**:
```
/
├── index.html              # Single entry point
├── css/
│   ├── main.css           # Global styles
│   ├── menu.css           # Component styles
│   └── mobile.css         # Responsive styles
├── js/
│   ├── utils.js           # Utilities (DOM, Storage, Events)
│   ├── router.js          # SPA routing
│   ├── menu.js            # Menu management
│   └── validator.js       # Data validation
├── data/
│   └── menu.json          # Application data
├── pages/                 # Content pages
├── tests/                 # Playwright tests
│   ├── e2e/
│   ├── visual/
│   └── accessibility/
└── .nojekyll              # GitHub Pages configuration
```

**File Naming**:
- Use kebab-case for files: `user-profile.html`, `menu-manager.js`
- Use PascalCase for classes: `class MenuManager`
- Use camelCase for functions and variables: `getUserData()`, `activeMenu`
- Avoid abbreviations except for well-known terms (URL, HTML, API)

### Code Documentation

**Documentation Requirements**:
- JSDoc comments for all public functions and classes
- Inline comments for complex logic (why, not what)
- README.md with setup, usage, and architecture overview
- Each major feature must have a specification in `/specs/`

**Example**:
```javascript
/**
 * Load and validate menu structure from JSON
 * @returns {Promise<Object>} Validated menu data
 * @throws {Error} If menu structure is invalid
 */
async loadMenu() { ... }
```

### Error Handling

**Requirements**:
- All async operations MUST have try-catch blocks
- User-facing errors MUST be displayed in UI with actionable messages
- Technical errors MUST be logged to console with context
- Graceful degradation: Application should function with reduced features on errors

## Development Workflow

### Version Control

**Branch Strategy**:
- `main` branch: Production-ready code only
- Feature branches: `[###-feature-name]` format (e.g., `001-3depth-menu`)
- Bug fix branches: `fix/[description]` format

**Commit Standards**:
- Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`
- Each commit should represent a single logical change
- Commit messages must be descriptive and explain the "why"
- **CRITICAL**: Only commit when all Playwright tests pass

### Testing Strategy

**Testing Levels**:

**1. Playwright E2E Testing** (MANDATORY):
- All user journeys must have automated Playwright tests
- Tests must pass in Chromium, Firefox, and WebKit
- Visual regression tests for critical UI components
- Accessibility assertions for WCAG compliance
- Performance budgets validated in tests

**2. Manual Testing** (REQUIRED for edge cases):
- Cross-browser compatibility verification
- Mobile responsive testing (various viewport sizes)
- Touch interaction testing on actual devices
- Edge case scenarios not covered by automation

**Test-First Approach**:
1. Write Playwright test for feature/fix
2. Verify test fails (red)
3. Implement feature/fix
4. Run test until it passes (green)
5. Refactor with test as safety net
6. **Only commit when ALL tests pass**

**Iterative Testing Workflow**:
```bash
# 1. Write/update Playwright test
# 2. Run test suite
npm run test:playwright

# 3. If failures, fix code and repeat step 2
# 4. When all tests pass, commit
git add .
git commit -m "feat: add feature X (all tests passing)"

# 5. Push triggers GitHub Pages deployment
git push origin main
```

### CI/CD and Deployment

**Continuous Integration**:
- Playwright tests run on every push/PR
- All tests must pass before merge to `main`
- Failed tests block deployment

**Continuous Deployment**:
- `main` branch auto-deploys to GitHub Pages
- Deployment only occurs when tests pass
- Rollback via Git revert if issues found in production

**Pre-Deployment Checklist**:
- [ ] All Playwright tests pass (E2E, visual, accessibility)
- [ ] Manual cross-browser testing complete
- [ ] Performance budgets met (Lighthouse/WebPageTest)
- [ ] README and documentation updated
- [ ] No console errors in production build

### Code Review

**Review Requirements**:
- All code changes require review before merging to `main`
- Reviewer must verify:
  - Airbnb style guide compliance
  - Accessibility requirements met
  - Performance budget not exceeded
  - Documentation updated
  - **All Playwright tests pass**

## Governance

### Amendment Process

**Constitution Changes**:
1. Propose amendment with justification in GitHub issue
2. Discussion period: minimum 7 days
3. Approval: consensus of project maintainers
4. Update version number according to semantic versioning
5. Document change in Sync Impact Report
6. Update all dependent templates and documentation

### Versioning Policy

**Semantic Versioning** (MAJOR.MINOR.PATCH):
- **MAJOR**: Backward-incompatible governance changes (e.g., removing a principle)
- **MINOR**: New principles or sections added
- **PATCH**: Clarifications, wording improvements, non-semantic fixes

### Compliance Review

**Review Triggers**:
- Every feature implementation must include constitution compliance check
- Monthly constitution review to ensure principles are being followed
- Annual constitution update to incorporate lessons learned

**Enforcement**:
- Code reviews MUST verify compliance with all applicable principles
- Non-compliant code MUST be rejected or fixed before merge
- Repeated violations require team discussion and process improvement
- **Playwright test failures block all commits and deployments**

**Version**: 1.1.0 | **Ratified**: 2025-10-08 | **Last Amended**: 2025-10-08
