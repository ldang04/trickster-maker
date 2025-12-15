import { Category, Trait } from "@/src/types/trickster";

type CharacterCanvasProps = {
  label: string;
  outlineSrc: string;
  selectedTraits: Partial<Record<Category, Trait | null>>;
  onTraitClick?: (trait: Trait) => void;
  onTraitHover?: (trait: Trait | null) => void;
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
  onTraitClick,
  onTraitHover,
}: CharacterCanvasProps) {
  const orderedCategories: Category[] = ["body", "head", "accessory"];

  const isPowerless = label === "Powerless Trickster";

  return (
    <div
      className="flex flex-col items-center gap-3"
      onMouseLeave={() => onTraitHover?.(null)}
    >
      {isPowerless ? (
        <span 
          className="text-sm font-bold uppercase tracking-wide rounded-xl px-4 py-1" 
          style={{ 
            color: 'white', 
            fontFamily: 'var(--font-varela-round)',
            backgroundColor: '#587ad4',
            border: '3px solid #c1d3f2'
          }}
        >
          {label}
        </span>
      ) : (
        <span 
          className="text-sm font-bold uppercase tracking-wide rounded-xl px-4 py-1" 
          style={{ 
            color: 'white', 
            fontFamily: 'var(--font-varela-round)',
            backgroundColor: '#f37373',
            border: '3px solid #fde3d4'
          }}
        >
          {label}
        </span>
      )}
      <div
        className="relative h-[340px] w-[230px] overflow-hidden rounded-2xl border-[4px] bg-white sm:h-[400px] sm:w-[260px] lg:h-[440px] lg:w-[300px]"
        style={{
          borderColor: '#fcdf8d',
          backgroundImage:
            "linear-gradient(to right, rgba(148, 163, 184, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.2) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <img
          src={outlineSrc}
          alt="Character outline"
          className="absolute inset-0 h-full w-full object-contain scale-[1.15]"
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
              className="absolute left-1/2 top-1/2 h-auto max-h-[460px] w-auto max-w-[300px] object-contain"
              style={{
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
                zIndex,
              }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/file.svg";
              }}
              onClick={() => onTraitClick?.(trait)}
              onMouseEnter={() => onTraitHover?.(trait)}
            />
          );
        })}
      </div>
    </div>
  );
}

