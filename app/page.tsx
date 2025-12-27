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
  maxTurns: 6,
  momentum: { powerless: 0, powerful: 0 },
  credibility: { powerless: 4, powerful: 3 }, // Powerless starts with slight advantage
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

  const resetToStart = () => {
    setSelections(defaultSelections);
    setBattleState(null);
    setBattleLog([]);
    setWinner(null);
    setVictoryText(null);
    setAutoRun(false);
    setActiveTrait(null);
    setHoverTrait(null);
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
      // If momentum tied, check crowd
      const crowdPowerless = state.crowd.powerless;
      const crowdPowerful = state.crowd.powerful;
      if (crowdPowerless > crowdPowerful) return "powerless";
      if (crowdPowerful > crowdPowerless) return "powerful";
      // If both tied, give slight advantage to powerless
      return "powerless";
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

    const move = chooseMove(attacker, battleState, attackerTraits) ?? "PERSUADE_FRAME";

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
      const v = composeVictoryNarration({
        winner: nextWinner,
        state: stateAfter,
        lastMove: move,
        lastAttacker: attacker,
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
              style={{ fontFamily: "var(--font-russo-one)", color: "#756550" }}
            >
              Trickster Battle Builder
            </h1>
            <p
              className="max-w-3xl text-sm"
              style={{
                color: "#756550",
                fontFamily: "var(--font-varela-round)",
              }}
            >
              This project simulates trickster dynamics across unequal power
              positions, pitting a powerless trickster against a trickster{" "}
              <i>in power</i>. We were inspired by the characters and stories
              explored in our Tricksters in World Culture course. <br /> Read
              our rationale and game interpretation{" "}
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

        <div className="mx-auto flex w-full max-w-[100vw] flex-col gap-4 px-2 pb-8 md:px-4">
          <div className="flex w-full flex-col items-stretch justify-center gap-4 overflow-x-auto lg:flex-row">
          <div className="w-full shrink-0 lg:w-[240px] xl:w-[260px]">
            <TraitMenu
              side="powerless"
              traitsByCategory={features.powerless}
              selections={selections}
              onSelect={handleSelect}
              onHover={setHoverTrait}
            />
          </div>

            <div className="flex w-full flex-col items-center justify-start gap-4 rounded-2xl border-[4px] bg-[#f9f5b5] p-3 sm:p-4 md:max-w-[560px] lg:flex-[0.9] lg:max-w-[680px]" style={{ borderColor: '#fcdf8d' }}>
            <div className="flex w-full flex-col items-center justify-center gap-4 overflow-x-auto px-1 sm:flex-row sm:gap-6 xl:gap-8">
              <div className="flex flex-col items-center w-full sm:w-auto">
                <CharacterCanvas
                  label="Powerless Trickster"
                  outlineSrc={outlineSrc}
                  selectedTraits={selectedTraits.powerless}
                  onTraitClick={setActiveTrait}
                  onTraitHover={setHoverTrait}
                />
                {battleState && (
                  <div className="mt-2 w-[230px] sm:w-[260px] lg:w-[300px] space-y-1 rounded-lg bg-[#fdf8d8] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-center">
                      Stats
                    </div>
                    <div className="text-[11px]"><span className="font-bold">Credibility:</span> {battleState.credibility.powerless} / 5</div>
                    <div className="text-[11px]"><span className="font-bold">Crowd:</span> {battleState.crowd.powerless}</div>
                    <div className="text-[11px]"><span className="font-bold">Momentum:</span> {battleState.momentum.powerless}</div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {battleState.constraints.powerless.length ? (
                        battleState.constraints.powerless.map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-[#f6b25b]/20 px-1.5 py-[1px] text-[8px] font-semibold"
                          >
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-[8px] italic text-slate-500">
                          No constraints
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center w-full sm:w-auto">
                <CharacterCanvas
                  label="Trickster in Power"
                  outlineSrc={outlineSrc}
                  selectedTraits={selectedTraits.powerful}
                  onTraitClick={setActiveTrait}
                  onTraitHover={setHoverTrait}
                />
                {battleState && (
                  <div className="mt-2 w-[230px] sm:w-[260px] lg:w-[300px] space-y-1 rounded-lg bg-[#fdf8d8] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-center">
                      Stats
                    </div>
                    <div className="text-[11px]"><span className="font-bold">Credibility:</span> {battleState.credibility.powerful} / 5</div>
                    <div className="text-[11px]"><span className="font-bold">Crowd:</span> {battleState.crowd.powerful}</div>
                    <div className="text-[11px]"><span className="font-bold">Momentum:</span> {battleState.momentum.powerful}</div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {battleState.constraints.powerful.length ? (
                        battleState.constraints.powerful.map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-[#f6b25b]/20 px-1.5 py-[1px] text-[8px] font-semibold"
                          >
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-[8px] italic text-slate-500">
                          No constraints
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {!battleState && (
              <div className="mt-0.5 w-full p-2 space-y-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={startBattle}
                      disabled={
                        !hasCompleteBuild("powerless") || !hasCompleteBuild("powerful")
                      }
                      className="rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-40"
                      style={{
                        fontFamily: "var(--font-russo-one)",
                        backgroundColor:
                          !hasCompleteBuild("powerless") || !hasCompleteBuild("powerful")
                            ? "#d1d5db"
                            : "#f6b25b",
                      }}
                    >
                      Start Battle
                    </button>
                  </div>
                  {(!hasCompleteBuild("powerless") ||
                    !hasCompleteBuild("powerful")) && (
                    <span
                      className="text-[11px] text-center"
                      style={{
                        fontFamily: "var(--font-varela-round)",
                        color: "#756550",
                      }}
                    >
                      Choose head, body, and accessory for both tricksters to
                      begin.
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="mt-0.5 w-full rounded-xl bg-white/70 px-4 py-3">
              {battleState ? (
                <div className="space-y-2" style={{ fontFamily: "var(--font-varela-round)", color: "#756550" }}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="text-xs font-bold uppercase tracking-wide">
                      Battle log
                    </div>
                    {battleState && !winner && battleLog.length > 0 && (
                      <div
                        className="flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold"
                        style={{
                          fontFamily: "var(--font-varela-round)",
                          color: "#ffffff",
                          backgroundColor: "#f6b25b",
                        }}
                      >
                        <span>
                          Turn {battleState.turn} / {battleState.maxTurns}
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`rounded-lg`}
                  >
                    {battleLog.length === 0 ? (
                      <div className="space-y-3">
                        <div className="text-center intro-typewriter" style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 'bold', fontSize: '14px', color: '#756550' }}>
                          The powerless and powerful trickster face off in front of onlookers. Only the crowd can decide who wins the battle.
                        </div>
                        <div className="text-center" style={{ fontFamily: "var(--font-russo-one)", fontSize: '16px', color: '#756550' }}>
                          Press space to get trickster move
                        </div>
                      </div>
                    ) : (
                      <ul className="space-y-2 text-xs bg-white rounded p-2">
                        {battleLog.map((entry, index) => {
                          const isPowerless = entry.attacker === "powerless";
                          return (
                            <li
                              key={`${index}-${entry.turn}-${entry.attacker}-${entry.move}-${entry.success}`}
                              className="flex flex-col gap-1"
                            >
                              <div className={`flex ${isPowerless ? "justify-start" : "justify-end"}`}>
                                <div
                                  className={`max-w-[80%] rounded-2xl px-3 py-2 shadow-sm ${
                                    isPowerless
                                      ? "bg-[#dbeafe] text-[#1d4ed8] bubble-slide-left"
                                      : "bg-[#fee2e2] text-[#b91c1c] bubble-slide-right"
                                  }`}
                                >
                                  <div className="mb-1 text-[10px] font-semibold">
                                    Turn {entry.turn} ·{" "}
                                    {isPowerless ? "Powerless trickster" : "Trickster in power"} ·{" "}
                                    {entry.move} {entry.success ? "✓" : "✕"}
                                  </div>
                                  <div className="mb-1 text-[11px]">
                                    {entry.actionLine}
                                  </div>
                                </div>
                              </div>
                              <div className="text-[11px] text-center effect-line-delayed" style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 'bold'}}>
                                {entry.effectLine}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  {battleLog.length > 0 && !winner && (
                    <div className="mt-2 text-center" style={{ fontFamily: "var(--font-russo-one)", fontSize: '16px', color: '#756550' }}>
                      Press space to continue
                    </div>
                  )}
                  {victoryText && (
                    <div
                      className={`mt-2 rounded-lg p-2 text-[11px] ${
                        winner === "draw"
                          ? "bg-blue-100"
                          : winner
                          ? "bg-green-100"
                          : "bg-white/90"
                      }`}
                    >
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-center">
                        {winner === "draw"
                          ? "Battle ends in a draw"
                          : winner === "powerless"
                          ? "Powerless Trickster wins"
                          : "Trickster in Power wins"}
                      </div>
                      <p>{victoryText}</p>
                    </div>
                  )}
                  {winner && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={resetToStart}
                        className="rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                        style={{
                          fontFamily: "var(--font-russo-one)",
                          backgroundColor: "#f6b25b",
                        }}
                      >
                        Play Again
                      </button>
                    </div>
                  )}
                </div>
              ) : (hoverTrait ?? activeTrait) ? (
                <div
                  className="flex flex-col gap-1 text-sm text-center"
                  style={{ color: "#756550" }}
                >
                  <div
                    className="text-lg font-semibold"
                    style={{ fontFamily: "var(--font-russo-one)" }}
                  >
                    {(hoverTrait ?? activeTrait)!.name}
                  </div>
                  <div
                    className="text-xs font-medium"
                    style={{ fontFamily: "var(--font-varela-round)" }}
                  >
                    Trickster reference:{" "}
                    {(hoverTrait ?? activeTrait)!.story_or_reference ?? "—"}
                  </div>
                  <div
                    className="text-sm"
                    style={{ fontFamily: "var(--font-varela-round)" }}
                  >
                    {(hoverTrait ?? activeTrait)!.description}
                  </div>
                </div>
              ) : (
                <div
                  className="text-2xl font-bold text-center"
                  style={{
                    color: "#756550",
                    fontFamily: "var(--font-russo-one)",
                  }}
                >
                  Assemble your tricksters
                </div>
              )}
            </div>
          </div>

          <div className="w-full shrink-0 lg:w-[260px] xl:w-[300px]">
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
