# Product Arrangement & Drag-and-Drop Reordering Documentation

This document explains the technical architecture, database schema changes, backend API endpoints, state management, and UI logic for the **Custom Product Arrangement & Drag-and-Drop Reordering** feature in **Mayura Heritage Crafts**.

---

## 1. Overview & Goal

The Product Arrangement feature gives store administrators full control over the sequence in which products appear on the public storefront (`/products`) and within specific category pages.

### Key Capabilities:
- **Global & Category-Specific Reordering**: Admins can view products globally or filter by specific category tabs (`Golu Dolls`, `Spiritual Decor`, `Idols`) and arrange products within each view.
- **Drag-and-Drop & Arrow Controls**: Admins can drag product rows using a vertical drag handle (`⋮⋮`) or use **Move Up (▲)** and **Move Down (▼)** buttons.
- **Bulk Batch Saving**: Order updates are held in transient local state and persisted to the PostgreSQL database in a single bulk transaction upon clicking **"Save Order Changes"**.
- **Storefront Synchronization**: The public product listing respects the custom rank numbers (`displayOrder`), showing products in the exact sequence set by the admin.

---

## 2. Database Schema & Prisma Configuration

### Prisma Schema (`backend/prisma/schema.prisma`)
A `displayOrder` integer field with default value `0` was added to the `Product` model:

```prisma
model Product {
  id                    String   @id @default(uuid())
  name                  String
  description           String
  price                 Float?
  originalPrice         Float?
  category              String
  subCategory           String?
  images                String[] @default([])
  featured              Boolean  @default(false)
  rating                Float    @default(0)
  reviews               Int      @default(0)
  inStock               Boolean  @default(true)
  tags                  String[] @default([])
  hasCustomShipping     Boolean  @default(false)
  shippingChargeIndia   Float?
  shippingChargeForeign Float?
  displayOrder          Int      @default(0)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### PostgreSQL Migration (`backend/prisma/migrations/20260807233000_add_product_display_order/migration.sql`)
```sql
-- AlterTable safely without altering or deleting existing data
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;
```

---

## 3. Database Connection Pooling Architecture (`backend/src/lib/prisma.ts`)

Supabase uses two ports:
1. **Port 6543 (PgBouncer Pooler)**: Caches query structures for high-concurrency web traffic.
2. **Port 5432 (Direct Connection / `DIRECT_URL`)**: Direct connection to PostgreSQL without PgBouncer caching issues.

To ensure Prisma queries instantly reflect schema alterations without `P2022 ColumnNotFound` errors, the Prisma adapter is initialized using `DIRECT_URL`:

```typescript
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mayura_heritage?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
```

---

## 4. Backend API Endpoints (`backend/src/routes/products.ts`)

### A. Public Product List (`GET /api/products`)
Orders products primarily by `displayOrder asc`, falling back to `createdAt desc`:

```typescript
const products = await prisma.product.findMany({
  where,
  orderBy: [
    { displayOrder: 'asc' },
    { createdAt: 'desc' },
  ],
});
```

### B. Batch Reorder Endpoint (`PUT /api/products/reorder`)
Updates multiple product rank positions in a single atomic transaction (`prisma.$transaction`):

```typescript
router.put('/reorder', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items } = req.body; // Expects Array<{ id: string, displayOrder: number }>

    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'items must be an array of { id, displayOrder }' });
      return;
    }

    const updates = items.map((item) =>
      prisma.product.update({
        where: { id: item.id },
        data: { displayOrder: parseInt(String(item.displayOrder)) || 0 },
      })
    );

    await prisma.$transaction(updates);

    res.json({ message: 'Products reordered successfully' });
  } catch (error) {
    console.error('Reorder products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## 5. Frontend API Helper (`frontend/src/lib/api.ts`)

Added the `reorderProducts` API call:

```typescript
export async function reorderProducts(items: { id: string; displayOrder: number }[]) {
  const res = await fetch(`${API_BASE}/products/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ items }),
  });
  return handleResponse<{ message: string }>(res);
}
```

---

## 6. Admin Panel UI & Drag-and-Drop Implementation (`frontend/src/pages/admin/AdminProducts.tsx`)

### Drag and Drop Event Handling
HTML5 Drag-and-Drop events (`onDragStart`, `onDragOver`, `onDragLeave`, `onDrop`) are attached to table rows:

```typescript
const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

const handleDrop = (fromIdx: number, toIdx: number) => {
  if (fromIdx === toIdx) return;
  const itemToMove = filtered[fromIdx];
  const targetItem = filtered[toIdx];

  setProducts((prev) => {
    const idx1 = prev.findIndex((p) => p.id === itemToMove.id);
    const idx2 = prev.findIndex((p) => p.id === targetItem.id);
    if (idx1 === -1 || idx2 === -1) return prev;

    const next = [...prev];
    const [removed] = next.splice(idx1, 1);
    next.splice(idx2, 0, removed);

    // Re-assign displayOrder sequence numbers (1, 2, 3...)
    return next.map((p, i) => ({ ...p, displayOrder: i + 1 }));
  });
  setHasOrderChanges(true);
};
```

### Drag & Drop Table Row JSX:
```tsx
<div
  key={product.id}
  draggable
  onDragStart={(e) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }}
  onDragOver={(e) => {
    e.preventDefault();
    setDragOverIndex(index);
  }}
  onDragLeave={() => setDragOverIndex(null)}
  onDrop={(e) => {
    e.preventDefault();
    if (draggedIndex !== null) {
      handleDrop(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }}
  className={`flex flex-col md:grid md:grid-cols-[140px_auto_1fr_100px_100px_80px_100px] gap-2 md:gap-4 md:items-center px-5 py-3.5 transition-all ${
    draggedIndex === index ? "opacity-30 bg-primary/10" : "hover:bg-white/[0.02]"
  } ${
    dragOverIndex === index && draggedIndex !== index ? "border-t-2 border-primary bg-primary/10" : ""
  }`}
>
  <div className="flex items-center gap-1.5 shrink-0">
    {/* Drag handle icon */}
    <div className="p-1 text-cream/30 hover:text-cream rounded cursor-grab active:cursor-grabbing" title="Click and drag to reorder">
      <GripVertical className="w-4 h-4" />
    </div>
    {/* Move up / down arrow buttons */}
    <div className="flex flex-col gap-0.5">
      <button type="button" onClick={() => moveUp(index)} disabled={index === 0}>
        <ArrowUp className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => moveDown(index)} disabled={index === filtered.length - 1}>
        <ArrowDown className="w-3.5 h-3.5" />
      </button>
    </div>
    {/* Rank Badge */}
    <span className="text-xs font-mono font-bold text-amber-400/90 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
      #{index + 1}
    </span>
  </div>
```

---

## 7. Storefront Enhancements (`frontend/src/pages/Products.tsx`)

### A. Unified URL Parameter Batch Updater
To prevent asynchronous `setSearchParams` state overrides when clearing subcategories or changing categories:

```typescript
const updateParams = useCallback((updates: Record<string, string>) => {
  const next = new URLSearchParams(searchParams);
  Object.entries(updates).forEach(([key, value]) => {
    if (!value || value === "all" || value === "false") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  });
  setSearchParams(next);
}, [searchParams, setSearchParams]);
```

### B. Custom Sort Dropdown Component
Replaced native HTML `<select>` with a custom animated popover sort menu using `framer-motion`:

```tsx
<div className="relative z-30">
  <button
    type="button"
    onClick={() => setIsSortOpen(!isSortOpen)}
    className="flex items-center gap-2 text-sm bg-secondary/80 hover:bg-secondary border border-border/60 text-foreground px-3.5 py-2 rounded-xl transition-all font-medium"
  >
    <SlidersHorizontal className="w-4 h-4 text-primary" />
    <span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Sort By"}</span>
    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isSortOpen ? "rotate-180 text-primary" : ""}`} />
  </button>

  <AnimatePresence>
    {isSortOpen && (
      <>
        <div className="fixed inset-0 z-20" onClick={() => setIsSortOpen(false)} />
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          className="absolute right-0 mt-2 w-48 bg-card border border-border/80 rounded-xl shadow-xl z-30 overflow-hidden py-1.5"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setSortBy(opt.value);
                setIsSortOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-sm text-left transition-colors ${
                sortBy === opt.value ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span>{opt.label}</span>
              {sortBy === opt.value && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </motion.div>
      </>
    )}
  </AnimatePresence>
</div>
```

### C. Desktop Sidebar Scrollability
Added independent vertical scrollability to the sticky desktop filter sidebar:

```html
<div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 scrollbar-none">
```

---

## 8. Summary of Files Created/Modified

| File Path | Description |
| :--- | :--- |
| `backend/prisma/schema.prisma` | Added `displayOrder Int @default(0)` to `Product` model. |
| `backend/prisma/migrations/20260807233000_add_product_display_order/migration.sql` | SQL migration script for `displayOrder`. |
| `backend/src/lib/prisma.ts` | Configured direct `pg` connection pool with `DIRECT_URL`. |
| `backend/src/routes/products.ts` | Added `displayOrder` sorting and `PUT /api/products/reorder` endpoint. |
| `frontend/src/lib/api.ts` | Added `reorderProducts` API request function. |
| `frontend/src/pages/admin/AdminProducts.tsx` | Implemented Category Tabs, HTML5 Drag-and-Drop, Move Up/Down buttons, position rank badges, and bulk save trigger. |
| `frontend/src/pages/Products.tsx` | Implemented custom animated sort dropdown, unified parameter batch updater, and desktop sidebar scrollability. |
| `documentation/product_arrangement_and_reordering.md` | Created technical documentation for the feature. |
