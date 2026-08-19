import React from 'react';

interface Props {
  count?: number;
  className?: string;
}

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#E6DFC6] shadow-xs animate-pulse flex flex-col">
      {/* Image Skeleton */}
      <div className="relative aspect-[3/4] bg-stone-200/80 overflow-hidden">
        {/* Shimmer sweep effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        
        {/* Skeleton Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <div className="h-5 w-20 bg-stone-300/80 rounded-md" />
        </div>
        <div className="absolute top-3 right-3 h-6 w-6 bg-stone-300/80 rounded-full" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Category & Rating */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 bg-stone-200 rounded-sm" />
            <div className="h-3 w-12 bg-stone-200 rounded-sm" />
          </div>

          {/* Title */}
          <div className="h-5 w-3/4 bg-stone-300/80 rounded-md" />

          {/* Subtitle */}
          <div className="h-3.5 w-1/2 bg-stone-200 rounded-sm" />
        </div>

        {/* Footer info: Shades & Prices */}
        <div className="pt-2 border-t border-[#F3EFE6] space-y-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-10 bg-stone-200 rounded-sm" />
            <div className="h-3.5 w-3.5 rounded-full bg-stone-300/80" />
            <div className="h-3.5 w-3.5 rounded-full bg-stone-300/80" />
            <div className="h-3.5 w-3.5 rounded-full bg-stone-300/80" />
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <div className="h-5 w-20 bg-stone-300/80 rounded-md" />
              <div className="h-3.5 w-12 bg-stone-200 rounded-sm" />
            </div>
            <div className="h-4 w-12 bg-stone-200 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<Props> = ({ count = 6, className = '' }) => {
  return (
    <div className={`grid gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
};
