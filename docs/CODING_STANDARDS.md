# Enterprise Engineering & Coding Standards Guide

This document defines the mandatory code formatting, TypeScript strictness rules, React 19 patterns, Express.js controller/service standards, naming conventions, and senior code review checklists for all contributors.

---

## 1. TypeScript Strictness & Type Safety
- **Strict Mode Enabled**: Always compile with `"strict": true` in `tsconfig.json`.
- **Prohibit `any`**: Explicitly forbidden. Use `unknown` with type guards or generics if dynamic types are unavoidable:
  ```ts
  // ❌ BAD
  function parsePayload(data: any): any { ... }

  // ✅ GOOD
  function parsePayload<T>(data: unknown, schema: ZodSchema<T>): T {
    return schema.parse(data);
  }
  ```
- **Explicit Return Types**: All exported functions, API controllers, and custom hooks must declare explicit return types.
- **Enums vs. Union Types**: Prefer string literal unions or standard TypeScript `enum` declarations over numeric enums or `const enum`.

---

## 2. React 19 Frontend Standards

### 2.1 Functional Components & Hooks Discipline
- Write only functional components styled with Tailwind CSS utility classes.
- **No Direct State Mutations**: Always use state setter functions or Zustand immutable updates.
- **Dependency Arrays**: All hooks (`useEffect`, `useCallback`, `useMemo`) must include exhaustive, primitive dependency arrays. Never omit dependencies to suppress linter warnings.

### 2.2 Reusability & Composition
- Keep components focused and under 150 lines.
- Extract complex UI sections into `/src/components/` and shared business logic into `/src/hooks/`.
- Never duplicate UI buttons, modals, or form inputs; extend existing primitives in `/src/components/ui/`.

---

## 3. Backend Express.js & Node.js Standards

### 3.1 Strict Layered Separation
```ts
// ❌ BAD: Business logic and DB queries inside an Express route controller
app.post('/api/v1/orders', async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.body.productId } });
  // ... tax math inside controller ...
});

// ✅ GOOD: Controller validates input and delegates to Service Layer
export async function createOrderController(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedDto = CreateOrderSchema.parse(req.body);
    const order = await OrderService.createOrder(req.user!.id, validatedDto);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}
```
- **Validation**: All incoming requests must be validated using **Zod** before processing.
- **Structured Logging**: Use **Pino** for all logging. Never use `console.log` in production backend code.

---

## 4. Naming Conventions

| Element Type | Convention | Example |
| :--- | :--- | :--- |
| **React Components** | PascalCase | `ProductCard.tsx`, `CountrySwitcherModal.tsx` |
| **Custom Hooks** | camelCase with `use` prefix | `useLocalizationQuery.ts`, `useCurrency.ts` |
| **TypeScript Types / Interfaces** | PascalCase | `ProductVariant`, `ExchangeRateDto` |
| **Constants & Environment Keys** | SCREAMING_SNAKE_CASE | `DATABASE_URL`, `DEFAULT_TAX_PERCENTAGE` |
| **Backend Route Controllers** | camelCase ending in `Controller` | `getLocalizationConfigController` |
| **REST API Paths** | Kebab-case plural nouns | `/api/v1/exchange-rates`, `/api/v1/product-reviews` |

---

## 5. Senior Self-Review & Pull Request Checklist

Before submitting a Pull Request, every engineer must verify:
- [ ] **SOLID & DRY**: Does the code duplicate existing utilities? Is any component or service doing too much?
- [ ] **Type Safety**: Are there zero `any` types or `@ts-ignore` comments?
- [ ] **Security**: Are inputs validated with Zod? Is the route protected by RBAC?
- [ ] **Accessibility (A11y)**: Do all interactive buttons and inputs have accessible labels? Is color contrast WCAG AA compliant?
- [ ] **Performance**: Are database queries free of N+1 loops? Are images responsive and lazy-loaded?
- [ ] **Testing**: Are unit tests (Vitest) added for new utilities, hooks, or backend services?
