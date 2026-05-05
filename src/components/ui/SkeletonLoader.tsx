"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "chart" | "table-row";
  count?: number;
}

export function Skeleton({ className = "", variant = "text" }: SkeletonProps) {
  const baseClass = "skeleton";

  switch (variant) {
    case "card":
      return (
        <div className={`glass-panel p-5 ${className}`}>
          <div className={`${baseClass} h-3 w-24 mb-3`} />
          <div className={`${baseClass} h-8 w-32 mb-2`} />
          <div className={`${baseClass} h-2 w-full mt-4`} />
        </div>
      );
    case "chart":
      return (
        <div className={`glass-panel p-5 ${className}`}>
          <div className={`${baseClass} h-4 w-40 mb-4`} />
          <div className={`${baseClass} h-64`} />
        </div>
      );
    case "table-row":
      return (
        <div className={`flex gap-4 py-3 px-4 ${className}`}>
          <div className={`${baseClass} h-4 w-20`} />
          <div className={`${baseClass} h-4 w-32`} />
          <div className={`${baseClass} h-4 w-24`} />
          <div className={`${baseClass} h-4 w-16`} />
          <div className={`${baseClass} h-4 w-16`} />
        </div>
      );
    default:
      return <div className={`${baseClass} h-4 ${className}`} />;
  }
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 8 }: { rows?: number }) {
  return (
    <div className="glass-panel overflow-hidden">
      <div
        className="flex gap-4 py-3 px-4 border-b"
        style={{ borderColor: "#1e293b" }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-3 w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="table-row" />
      ))}
    </div>
  );
}
