import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  // Always include Home as the implicit base item if not provided
  const allItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/', icon: <Home className="w-3.5 h-3.5" /> },
    ...items
  ];

  return (
    <nav aria-label="Breadcrumb" className={`py-1 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5 text-xs text-stone-500">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <li key={index} className="inline-flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0 select-none" />
              )}

              {isLast ? (
                <span
                  className="font-bold text-[#2C221E] truncate max-w-[200px] sm:max-w-[320px] md:max-w-none"
                  title={item.label}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  to={item.href}
                  className="inline-flex items-center gap-1 hover:text-[#C28E46] transition-colors py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[#C28E46]"
                >
                  {item.icon && <span className="shrink-0 text-stone-400 hover:text-[#C28E46]">{item.icon}</span>}
                  <span className="capitalize">{item.label}</span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 capitalize">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
