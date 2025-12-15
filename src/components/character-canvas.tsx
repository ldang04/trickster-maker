import { Category, Trait } from "@/src/types/trickster";

type CharacterCanvasProps = {
  label: string;
  outlineSrc: string;
  selectedTraits: Partial<Record<Category, Trait | null>>;
  onHover?: (trait: Trait | null) => void;
};

const defaultZ: Record<Category, number> = {
  body: 1,
  head: 2,
  accessory: 3,
};

export function CharacterCanvas({
  label,
  outlineSrc,
  selectedTraits,
  onHover,
}: CharacterCanvasProps) {
  const orderedCategories: Category[] = ["body", "head", "accessory"];

  return (
    <div
      className="flex flex-col items-center gap-3"
      onMouseLeave={() => onHover?.(null)}
    >
      <span className="text-sm font-semibold uppercase tracking-wide text-slate-700">
        {label}
      </span>
      <div
        className="relative h-[480px] w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148, 163, 184, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.2) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <img
          src={outlineSrc}
          alt="Character outline"
          className="absolute inset-0 h-full w-full object-contain"
        />
        {orderedCategories.map((category) => {
          const trait = selectedTraits[category];
          if (!trait) return null;

          const { x, y, scale, rotate = 0, z } = trait.transform;
          const zIndex = typeof z === "number" ? z : defaultZ[category];

          return (
            <img
              key={trait.id}
              src={trait.image}
              alt={trait.name}
              className="absolute left-1/2 top-1/2 h-auto max-h-[460px] w-auto max-w-[300px] object-contain drop-shadow"
              style={{
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
                zIndex,
              }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/file.svg";
              }}
              onMouseEnter={() => onHover?.(trait)}
              onMouseLeave={() => onHover?.(null)}
            />
          );
        })}
      </div>
    </div>
  );
}

