const ProductSkeleton = () => (
  <div className="bg-card rounded-lg overflow-hidden border border-border animate-pulse">
    <div className="aspect-square bg-secondary shimmer" style={{ backgroundImage: "linear-gradient(90deg, transparent, hsl(var(--muted)), transparent)", backgroundSize: "200% 100%" }} />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-secondary rounded w-1/3" />
      <div className="h-4 bg-secondary rounded w-3/4" />
      <div className="h-3 bg-secondary rounded w-1/4" />
      <div className="flex justify-between items-center">
        <div className="h-5 bg-secondary rounded w-1/3" />
        <div className="h-8 w-8 bg-secondary rounded-lg" />
      </div>
    </div>
  </div>
);

export default ProductSkeleton;
