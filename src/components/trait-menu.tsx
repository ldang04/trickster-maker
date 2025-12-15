'use client';

import { Category, Selections, Side, Trait } from "@/src/types/trickster";
import { TraitGrid } from "./trait-grid";

type TraitMenuProps = {
  side: Side;
  traitsByCategory: Record<Category, Trait[]>;
  selections: Selections;
  onSelect: (side: Side, category: Category, traitId: string) => void;
  onHover?: (trait: Trait | null) => void;
};

const categories: Category[] = ["head", "body", "accessory"];

export function TraitMenu({
  side,
  traitsByCategory,
  selections,
  onSelect,
  onHover,
}: TraitMenuProps) {
  return (
    <aside
      className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3"
      onMouseLeave={() => onHover?.(null)}
    >
      <header className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase text-slate-500">
            {side === "powerless" ? "Powerless" : "Powerful"}
          </span>
          <h2 className="text-lg font-semibold text-slate-900">
            Trait Menu
          </h2>
        </div>
      </header>
      <div className="flex flex-col gap-6 overflow-y-auto pr-1">
        {categories.map((category) => (
          <TraitGrid
            key={category}
            category={category}
            traits={traitsByCategory[category] ?? []}
            selectedId={selections[side][category]}
            onSelect={(traitId) => onSelect(side, category, traitId)}
            onHover={onHover}
          />
        ))}
      </div>
    </aside>
  );
}

