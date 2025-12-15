'use client';

import { Category, Trait } from "@/src/types/trickster";
import { memo } from "react";

type TraitGridProps = {
  category: Category;
  traits: Trait[];
  selectedId: string | null;
  onSelect: (traitId: string) => void;
  onHover?: (trait: Trait | null) => void;
};

const fallbackSrc = "/file.svg";

function TraitGridComponent({
  category,
  traits,
  selectedId,
  onSelect,
  onHover,
}: TraitGridProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold capitalize text-slate-800" style={{ fontFamily: 'var(--font-varela-round)' }}>
          {category}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {traits.map((trait) => {
          const isSelected = trait.id === selectedId;
          const baseClasses =
          "group flex flex-col items-center gap-1 rounded-lg bg-white p-1.5 text-center transition border-2";
          return (
            <button
              key={trait.id}
              onClick={() => onSelect(trait.id)}
              className={baseClasses}
              style={{
                borderColor: isSelected ? '#a2e2da' : 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#a2e2da';
                onHover?.(trait);
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'transparent';
                }
                onHover?.(null);
              }}
              type="button"
            >
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded">
                <img
                  src={trait.image}
                  alt={trait.name}
                  className="h-full w-full object-contain transition group-hover:scale-[1.02]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackSrc;
                  }}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-semibold" style={{ color: '#756550', fontFamily: 'var(--font-russo-one)' }}>
                  {trait.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export const TraitGrid = memo(TraitGridComponent);

