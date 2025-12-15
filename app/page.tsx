'use client';

import rawFeatures from "@/app/features.json";
import { CharacterCanvas } from "@/src/components/character-canvas";
import { TraitMenu } from "@/src/components/trait-menu";
import {
  Category,
  FeaturesData,
  Selections,
  Side,
  Trait,
} from "@/src/types/trickster";
import { useMemo, useState } from "react";

const features = rawFeatures as FeaturesData;

const defaultSelections: Selections = {
  powerless: { head: null, body: null, accessory: null },
  powerful: { head: null, body: null, accessory: null },
};

const outlineSrc = "/images/outline.png";

function findTrait(
  data: FeaturesData,
  side: Side,
  category: Category,
  id: string | null
): Trait | null {
  if (!id) return null;
  return data[side][category]?.find((trait) => trait.id === id) ?? null;
}

export default function Home() {
  const [selections, setSelections] = useState<Selections>(defaultSelections);
  const [hoveredTrait, setHoveredTrait] = useState<Trait | null>(null);

  const selectedTraits = useMemo(
    () => ({
      powerless: {
        head: findTrait(features, "powerless", "head", selections.powerless.head),
        body: findTrait(features, "powerless", "body", selections.powerless.body),
        accessory: findTrait(
          features,
          "powerless",
          "accessory",
          selections.powerless.accessory
        ),
      },
      powerful: {
        head: findTrait(features, "powerful", "head", selections.powerful.head),
        body: findTrait(features, "powerful", "body", selections.powerful.body),
        accessory: findTrait(
          features,
          "powerful",
          "accessory",
          selections.powerful.accessory
        ),
      },
    }),
    [selections]
  );

  const handleSelect = (side: Side, category: Category, traitId: string) => {
    setSelections((prev) => ({
      ...prev,
      [side]: {
        ...prev[side],
        [category]: traitId,
      },
    }));
  };

  return (
    <main className="min-h-screen bg-transparent text-slate-900">
      <div className="mx-auto flex w-full max-w-[100vw] flex-col gap-8 px-3 py-10 md:px-6">
        <header className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">
            Tricksters in World Culture • Final Project
          </p>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
           Trickster Battle Builder
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            This project simulates trickster dynamics across unequal power positions, pitting a power<i>less</i> trickster against a trickster <i>in power</i>. We were inspired by trickster stories explored in our course. Read our full project rationale <a href="https://docs.google.com/document/d/e/2PACX-1vSt85h3GQmbFCk-iSfjKDl0WJJGGCldVhN4qAKmkyAY1iM7VkCDDSOgUpelZSd-xs70V8y5xZIlL2pQ/pub" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-700">here</a>. 
          </p>
        </header>

        <div className="flex w-full flex-col items-stretch justify-center gap-6 overflow-x-auto lg:flex-row">
          <div className="w-full shrink-0 lg:w-[240px] xl:w-[280px]">
            <TraitMenu
              side="powerless"
              traitsByCategory={features.powerless}
              selections={selections}
              onSelect={handleSelect}
            onHover={setHoveredTrait}
            />
          </div>

          <div className="flex w-full flex-col items-center justify-start gap-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 md:max-w-[640px] lg:flex-[1.02] lg:max-w-[760px]">
            <div className="flex w-full flex-col items-center justify-center gap-6 overflow-x-auto px-2 sm:flex-row sm:gap-8 xl:gap-10">
              <CharacterCanvas
                label="Powerless Trickster"
                outlineSrc={outlineSrc}
                selectedTraits={selectedTraits.powerless}
                onHover={setHoveredTrait}
              />
              <CharacterCanvas
                label="Powerful Trickster"
                outlineSrc={outlineSrc}
                selectedTraits={selectedTraits.powerful}
                onHover={setHoveredTrait}
              />
            </div>
            <div className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-center">
              {hoveredTrait ? (
                <div className="flex flex-col gap-1 text-sm text-slate-800">
                  <div className="text-base font-semibold text-slate-900">
                    {hoveredTrait.name}
                  </div>
                  <div className="text-xs font-medium text-slate-600">
                    Trickster reference:{" "}
                    {hoveredTrait.story_or_reference ?? "—"}
                  </div>
                  <div className="text-sm text-slate-700">
                    {hoveredTrait.description}
                  </div>
                </div>
              ) : (
                <div className="text-lg font-bold text-slate-500">
                  Assemble your tricksters
                </div>
              )}
            </div>
          </div>

          <div className="w-full shrink-0 lg:w-[240px] xl:w-[280px]">
            <TraitMenu
              side="powerful"
              traitsByCategory={features.powerful}
              selections={selections}
              onSelect={handleSelect}
            onHover={setHoveredTrait}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
