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
        <h3 className="text-sm font-semibold capitalize text-slate-800">
          {category}
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {traits.map((trait) => {
          const isSelected = trait.id === selectedId;
          const baseClasses =
            "group flex flex-col items-center gap-1 rounded-md border bg-white p-2 text-center shadow-sm transition";
          return (
            <button
              key={trait.id}
              onClick={() => onSelect(trait.id)}
              className={
                baseClasses +
                " " +
                (isSelected
                  ? "border-indigo-500 ring-2 ring-indigo-200"
                  : "border-slate-200 hover:border-indigo-200 hover:shadow")
              }
              type="button"
              onMouseEnter={() => onHover?.(trait)}
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded">
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
                <span className="text-[10px] font-semibold text-slate-900">
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

