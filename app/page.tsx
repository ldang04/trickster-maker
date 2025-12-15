'use client';

import rawFeatures from "@/app/features.json";
import { CharacterCanvas } from "@/src/components/character-canvas";
import { PixelCursor } from "@/src/components/pixel-cursor";
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

const categories: Category[] = ["head", "body", "accessory"];

export default function Home() {
  const [selections, setSelections] = useState<Selections>(defaultSelections);
  const [activeTrait, setActiveTrait] = useState<Trait | null>(null);
  const [hoverTrait, setHoverTrait] = useState<Trait | null>(null);

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
    const trait = findTrait(features, side, category, traitId);
    if (trait) setActiveTrait(trait);
  };

  const renderSelectedList = (traits: {
    head: Trait | null;
    body: Trait | null;
    accessory: Trait | null;
  }) => {
    const picked = categories
      .map((c) => traits[c])
      .filter((t): t is Trait => Boolean(t));

    if (!picked.length) return null;

    return (
      <ul className="list-disc space-y-1 pl-4 pr-2 text-sm" style={{ color: '#756550', fontFamily: 'var(--font-varela-round)' }}>
        {picked.map((trait) => (
          <li key={trait.id}>{trait.name}</li>
        ))}
      </ul>
    );
  };

  return (
    <main className="flex min-h-screen flex-col bg-transparent text-slate-900" style={{ cursor: "none" }}>
      <PixelCursor />
      <div className="mx-auto flex w-full max-w-[100vw] flex-col gap-8 px-0 py-0 md:px-0">
        <div className="scalloped-banner relative w-full">
          <div className="scalloped-edge"></div>
          <div className="mx-auto max-w-5xl px-6 pt-5 md:px-10 md:pt-6 pb-10">
            <header className="flex flex-col items-center gap-3 text-center">
       
            <h1
              className="text-3xl font-bold sm:text-5xl"
              style={{ fontFamily: "var(--font-russo-one)", color: '#756550' }}
            >
              Trickster Battle Builder
            </h1>
            <p className="max-w-3xl text-sm" style={{ color: '#756550', fontFamily: 'var(--font-varela-round)' }}>
              This project simulates trickster dynamics across unequal power positions, pitting a powerless trickster against a trickster <i>in power</i>. We were inspired by the characters and stories explored in our Tricksters in World Culture course. <br /> Read our rationale and game interpretation {" "}
              <a
                href="https://docs.google.com/document/d/e/2PACX-1vSt85h3GQmbFCk-iSfjKDl0WJJGGCldVhN4qAKmkyAY1iM7VkCDDSOgUpelZSd-xs70V8y5xZIlL2pQ/pub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline hover:text-indigo-700"
              >
                here
              </a>
              .
            </p>
          </header>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[100vw] flex-col gap-6 px-3 pb-10 md:px-6">
          <div className="flex w-full flex-col items-stretch justify-center gap-6 overflow-x-auto lg:flex-row">
          <div className="w-full shrink-0 lg:w-[240px] xl:w-[280px]">
            <TraitMenu
              side="powerless"
              traitsByCategory={features.powerless}
              selections={selections}
              onSelect={handleSelect}
              onHover={setHoverTrait}
            />
          </div>

          <div className="flex w-full flex-col items-center justify-start gap-6 rounded-2xl border-[4px] bg-[#f9f5b5] p-4 sm:p-5 md:max-w-[640px] lg:flex-[1.02] lg:max-w-[760px]" style={{ borderColor: '#fcdf8d' }}>
            <div className="flex w-full flex-col items-center justify-center gap-6 overflow-x-auto px-2 sm:flex-row sm:gap-8 xl:gap-10">
              <div className="flex flex-col items-center">
                <CharacterCanvas
                  label="Powerless Trickster"
                  outlineSrc={outlineSrc}
                  selectedTraits={selectedTraits.powerless}
                  onTraitClick={setActiveTrait}
                  onTraitHover={setHoverTrait}
                />
              </div>
              <div className="flex flex-col items-center">
                <CharacterCanvas
                  label="Trickster in Power"
                  outlineSrc={outlineSrc}
                  selectedTraits={selectedTraits.powerful}
                  onTraitClick={setActiveTrait}
                  onTraitHover={setHoverTrait}
                />
              </div>
            </div>
            <div className="w-full rounded-xl border-[4px] bg-white/70 px-4 py-3 text-center" style={{ borderColor: '#fcdf8d' }}>
              {hoverTrait ?? activeTrait ? (
                <div className="flex flex-col gap-1 text-sm" style={{ color: '#756550' }}>
                  <div className="text-lg font-semibold" style={{ fontFamily: 'var(--font-russo-one)' }}>
                    {(hoverTrait ?? activeTrait)!.name}
                  </div>
                  <div className="text-xs font-medium" style={{ fontFamily: 'var(--font-varela-round)' }}>
                    Trickster reference:{" "}
                    {(hoverTrait ?? activeTrait)!.story_or_reference ?? "—"}
                  </div>
                  <div className="text-sm" style={{ fontFamily: 'var(--font-varela-round)' }}>
                    {(hoverTrait ?? activeTrait)!.description}
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold" style={{ color: '#756550', fontFamily: 'var(--font-russo-one)' }}>
                  Assemble your tricksters
                </div>
              )}
            </div>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col items-center">
                {renderSelectedList(selectedTraits.powerless)}
              </div>
              <div className="flex flex-col items-center">
                {renderSelectedList(selectedTraits.powerful)}
              </div>
            </div>
          </div>

          <div className="w-full shrink-0 lg:w-[240px] xl:w-[280px]">
            <TraitMenu
              side="powerful"
              traitsByCategory={features.powerful}
              selections={selections}
              onSelect={handleSelect}
              onHover={setHoverTrait}
            />
          </div>
        </div>
        </div>
      </div>
      <footer className="mt-auto flex justify-end px-4 py-2 text-xs" style={{ fontFamily: 'var(--font-varela-round)', color: '#5e79d6' }}>
        Final project by Diem Linh Dang & Aleksandra Ermilova
      </footer>
    </main>
  );
}
