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
import { useEffect, useMemo, useState } from "react";
import { BattleState } from "@/src/battle/types";
import { chooseMove } from "@/src/battle/policy";
import { resolveMove } from "@/src/battle/resolve";
import { narrateTurn } from "@/src/battle/narration";
import { composeVictoryNarration } from "@/src/battle/victoryNarration";

const features = rawFeatures as FeaturesData;

const defaultSelections: Selections = {
  powerless: { head: null, body: null, accessory: null },
  powerful: { head: null, body: null, accessory: null },
};

type BattleLogEntry = {
  turn: number;
  attacker: Side;
  move: string;
  success: boolean;
  actionLine: string;
  effectLine: string;
};

const initialBattleState: BattleState = {
  turn: 1,
  maxTurns: 20,
  momentum: { powerless: 0, powerful: 0 },
  credibility: { powerless: 3, powerful: 3 },
  crowd: { powerless: 0, powerful: 0 },
  constraints: { powerless: [], powerful: [] },
  cooldowns: { powerless: {}, powerful: {} },
  history: [],
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
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [autoRun, setAutoRun] = useState(false);
  const [winner, setWinner] = useState<Side | "draw" | null>(null);
  const [victoryText, setVictoryText] = useState<string | null>(null);

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

  const getSelectedTraitIds = (side: Side): string[] => {
    const sideSelections = selections[side];
    const ids: string[] = [];
    (["head", "body", "accessory"] as Category[]).forEach((cat) => {
      const id = sideSelections[cat];
      if (id) ids.push(id);
    });
    return ids;
  };

  const hasCompleteBuild = (side: Side) => {
    const sideSelections = selections[side];
    return (
      sideSelections.head !== null &&
      sideSelections.body !== null &&
      sideSelections.accessory !== null
    );
  };

  const startBattle = () => {
    if (!hasCompleteBuild("powerless") || !hasCompleteBuild("powerful")) {
      return;
    }
    setBattleState({ ...initialBattleState });
    setBattleLog([]);
    setWinner(null);
    setVictoryText(null);
    setAutoRun(false);
  };

  const checkWinner = (state: BattleState): Side | "draw" | null => {
    const sides: Side[] = ["powerless", "powerful"];
    for (const side of sides) {
      const hasDiscred = state.constraints[side].includes("DISCREdited");
      if (state.credibility[side] <= 0 && hasDiscred) {
        return side === "powerless" ? "powerful" : "powerless";
      }
      if (state.constraints[side].length >= 3) {
        return side === "powerless" ? "powerful" : "powerless";
      }
    }
    if (state.turn > state.maxTurns) {
      const momPowerless = state.momentum.powerless;
      const momPowerful = state.momentum.powerful;
      if (momPowerless > momPowerful) return "powerless";
      if (momPowerful > momPowerless) return "powerful";
      const crowdPowerless = state.crowd.powerless;
      const crowdPowerful = state.crowd.powerful;
      if (crowdPowerless > crowdPowerful) return "powerless";
      if (crowdPowerful > crowdPowerless) return "powerful";
      return "draw";
    }
    return null;
  };

  const runTurn = () => {
    if (!battleState || winner) return;
    const attacker: Side =
      battleState.turn % 2 === 0 ? "powerless" : "powerful";
    const defender: Side = attacker === "powerless" ? "powerful" : "powerless";

    const attackerTraits = getSelectedTraitIds(attacker);
    const defenderTraits = getSelectedTraitIds(defender);

    const move = chooseMove(attacker, battleState, attackerTraits) ?? "STATUS_FLEX";

    const before: BattleState = JSON.parse(JSON.stringify(battleState));
    const { success, stateAfter } = resolveMove(
      attacker,
      move,
      battleState,
      attackerTraits,
      defenderTraits
    );

    const narration = narrateTurn({
      attacker,
      defender,
      move,
      success,
      stateBefore: before,
      stateAfter,
    });

    const nextWinner = checkWinner(stateAfter);

    setBattleState({ ...stateAfter });
    setBattleLog((prev) => [
      ...prev,
      {
        turn: before.turn,
        attacker,
        move,
        success,
        actionLine: narration.actionLine,
        effectLine: narration.effectLine,
      },
    ]);
    if (nextWinner) {
      setWinner(nextWinner);
      setAutoRun(false);
      const winnerName =
        nextWinner === "powerless"
          ? selectedTraits.powerless.head?.name ?? "Powerless Trickster"
          : nextWinner === "powerful"
          ? selectedTraits.powerful.head?.name ?? "Powerful Trickster"
          : undefined;
      const loserSide =
        nextWinner === "draw"
          ? null
          : nextWinner === "powerless"
          ? "powerful"
          : "powerless";
      const loserName =
        loserSide === "powerless"
          ? selectedTraits.powerless.head?.name ?? "Powerless Trickster"
          : loserSide === "powerful"
          ? selectedTraits.powerful.head?.name ?? "Powerful Trickster"
          : undefined;

      const v = composeVictoryNarration({
        winner: nextWinner,
        state: stateAfter,
        lastMove: move,
        lastAttacker: attacker,
        winnerName,
        loserName,
      });
      setVictoryText(v.text);
    }
  };

  useEffect(() => {
    if (!autoRun || winner || !battleState) return;
    const id = setInterval(() => {
      runTurn();
    }, 800);
    return () => clearInterval(id);
  }, [autoRun, winner, battleState]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        if (!autoRun && battleState && !winner) {
          e.preventDefault();
          runTurn();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [autoRun, battleState, winner, runTurn]);

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
          {!battleState && (
            <div className="w-full shrink-0 lg:w-[240px] xl:w-[280px]">
              <TraitMenu
                side="powerless"
                traitsByCategory={features.powerless}
                selections={selections}
                onSelect={handleSelect}
                onHover={setHoverTrait}
              />
            </div>
          )}

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

            <div className="mt-2 w-full rounded-xl border-[4px] bg-white/80 p-3 space-y-3" style={{ borderColor: '#fcdf8d' }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={startBattle}
                    disabled={!hasCompleteBuild("powerless") || !hasCompleteBuild("powerful")}
                    className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm disabled:opacity-40"
                    style={{
                      fontFamily: 'var(--font-russo-one)',
                      backgroundColor:
                        !hasCompleteBuild("powerless") || !hasCompleteBuild("powerful")
                          ? '#d1d5db'
                          : '#f6b25b',
                    }}
                  >
                    Start Battle
                  </button>
                  <label
                    className="flex items-center gap-1 text-[11px]"
                    style={{ fontFamily: 'var(--font-varela-round)', color: '#756550' }}
                  >
                    <input
                      type="checkbox"
                      checked={autoRun}
                      onChange={(e) => setAutoRun(e.target.checked)}
                      disabled={!battleState || !!winner}
                    />
                    Auto-run
                  </label>
                  {(!hasCompleteBuild("powerless") || !hasCompleteBuild("powerful")) && (
                    <span
                      className="text-[11px]"
                      style={{ fontFamily: 'var(--font-varela-round)', color: '#756550' }}
                    >
                      Choose head, body, and accessory for both tricksters to begin.
                    </span>
                  )}
                </div>
                {battleState && (
                  <div
                    className="flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold"
                    style={{
                      fontFamily: 'var(--font-varela-round)',
                      color: '#ffffff',
                      backgroundColor:
                        battleState.turn % 2 === 0 ? '#3b82f6' : '#ef4444',
                    }}
                  >
                    <span>
                      Turn {battleState.turn} / {battleState.maxTurns}
                    </span>
                    <span>
                      {battleState.turn % 2 === 0
                        ? 'Powerless trickster turn'
                        : 'Trickster in power turn'}
                    </span>
                  </div>
                )}
              </div>

              {battleState && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs" style={{ fontFamily: 'var(--font-varela-round)', color: '#756550' }}>
                  {(["powerless", "powerful"] as Side[]).map((side) => (
                    <div key={side} className="space-y-1 rounded-lg bg-[#fdf8d8] p-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wide">
                        {side === "powerless" ? "Powerless Trickster" : "Trickster in Power"}
                        {winner &&
                          (winner === side
                            ? " — Winner"
                            : winner === "draw"
                              ? " — Draw"
                              : "")}
                      </div>
                      <div>Credibility: {battleState.credibility[side]} / 5</div>
                      <div>Crowd: {battleState.crowd[side]}</div>
                      <div>Momentum: {battleState.momentum[side]}</div>
                      <div className="flex flex-wrap gap-1">
                        {battleState.constraints[side].length ? (
                          battleState.constraints[side].map((c) => (
                            <span
                              key={c}
                              className="rounded-full bg-[#f6b25b]/20 px-2 py-[1px] text-[10px] font-semibold"
                            >
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] italic text-slate-500">
                            No constraints
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full shrink-0 lg:w-[260px] xl:w-[320px]">
            {!battleState ? (
              <TraitMenu
                side="powerful"
                traitsByCategory={features.powerful}
                selections={selections}
                onSelect={handleSelect}
                onHover={setHoverTrait}
              />
            ) : (
              <div className="battle-log-panel flex h-full flex-col gap-2 rounded-2xl border-[4px] bg-[#f9f5b5] p-3" style={{ borderColor: "#fcdf8d" }}>
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ fontFamily: "var(--font-varela-round)", color: "#756550" }}>
                  Battle log
                </div>
                <div className="max-h-64 flex-1 overflow-y-auto rounded-lg bg-[#fdf8d8] p-2">
                  {battleLog.length === 0 ? (
                    <div
                      className="text-xs italic"
                      style={{ fontFamily: "var(--font-varela-round)", color: "#756550" }}
                    >
                      Battle log will appear here once you start.
                    </div>
                  ) : (
                    <ul
                      className="space-y-2 text-xs"
                      style={{ fontFamily: "var(--font-varela-round)", color: "#756550" }}
                    >
                      {battleLog.map((entry, index) => {
                        const isPowerless = entry.attacker === "powerless";
                        return (
                          <li
                            key={`${index}-${entry.turn}-${entry.attacker}-${entry.move}-${entry.success}`}
                            className={`flex ${isPowerless ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
                                isPowerless
                                  ? "bg-[#dbeafe] text-[#1d4ed8]"
                                  : "bg-[#fee2e2] text-[#b91c1c]"
                              }`}
                            >
                              <div className="mb-1 text-[10px] font-semibold">
                                Turn {entry.turn} ·{" "}
                                {isPowerless
                                  ? "Powerless trickster"
                                  : "Trickster in power"}{" "}
                                · {entry.move} {entry.success ? "✓" : "✕"}
                              </div>
                              <div className="mb-1 text-[11px]">
                                {entry.actionLine}
                              </div>
                              <div className="text-[10px] opacity-80">
                                {entry.effectLine}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                {victoryText && (
                  <div
                    className="mt-1 rounded-lg bg-white/90 p-2 text-[11px]"
                    style={{
                      fontFamily: "var(--font-varela-round)",
                      color: "#756550",
                    }}
                  >
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide">
                      {winner === "draw"
                        ? "Battle ends in a draw"
                        : winner === "powerless"
                        ? "Powerless Trickster wins"
                        : "Trickster in Power wins"}
                    </div>
                    <p>{victoryText}</p>
                  </div>
                )}
              </div>
            )}
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
