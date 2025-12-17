import { BattleState, MoveType, Side } from "./types";
import { MOVE_DEFS, isMoveOnCooldown } from "./moves";

export type PolicyOptions = {
  temperature?: number;
  rng?: () => number;
};

const defaultRng = () => Math.random();

const softmaxSample = (
  scores: number[],
  moves: MoveType[],
  rng: () => number
): MoveType | null => {
  if (!scores.length) return null;
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((e) => e / sum);
  let r = rng();
  for (let i = 0; i < probs.length; i++) {
    if (r < probs[i]) return moves[i];
    r -= probs[i];
  }
  return moves[moves.length - 1];
};

const sideHasConstraint = (
  state: BattleState,
  side: Side,
  constraint: string
) => state.constraints[side].includes(constraint as any);

const hasAnyTrait = (selectedTraitIds: string[], required?: string[]) => {
  if (!required || !required.length) return true;
  return required.some((id) => selectedTraitIds.includes(id));
};

const isBigMove = (move: MoveType) =>
  [
    "PLANT_RUMOR",
    "BRIBE",
    "BUREAUCRACY_TRAP",
    "STATUS_FLEX",
    "DELEGATE",
    "TECH_SURVEIL",
  ].includes(move);

export const chooseMove = (
  side: Side,
  state: BattleState,
  selectedTraitIds: string[],
  options: PolicyOptions = {}
): MoveType | null => {
  const rng = options.rng ?? defaultRng;
  const temperature = options.temperature ?? 1.0;
  const opponent: Side = side === "powerless" ? "powerful" : "powerless";

  const legal: MoveType[] = [];

  for (const def of MOVE_DEFS) {
    if (!def.allowedSides.includes(side)) continue;
    if (!hasAnyTrait(selectedTraitIds, def.requiresAnyTraitIds)) continue;
    if (isMoveOnCooldown(def.id, side, state)) continue;

    if (sideHasConstraint(state, side, "TRAPPED_IN_RULES")) {
      if (
        !["WORDPLAY_REFRAME", "PLAY_DUMB", "ESCAPE_SLIP", "SCHEME_SETUP"].includes(
          def.id
        )
      ) {
        continue;
      }
    }

    legal.push(def.id);
  }

  if (!legal.length) return null;

  const scores: number[] = [];

  const oppCred = state.credibility[opponent];
  const myCrowd = state.crowd[side];
  const oppCrowd = state.crowd[opponent];

  const hasScheme = selectedTraitIds.includes("scheme");
  const hasLaughter = selectedTraitIds.includes("laughter");
  const hasRules = selectedTraitIds.includes("rules_laws");

  const isConstrained =
    state.constraints[side].length > 0 ||
    sideHasConstraint(state, side, "TRAPPED_IN_RULES");

  for (const move of legal) {
    let score = 0;

    const def = MOVE_DEFS.find((d) => d.id === move)!;
    score += def.base * 2;

    if (isConstrained) {
      if (["ESCAPE_SLIP", "WORDPLAY_REFRAME", "PLAY_DUMB"].includes(move)) {
        score += 1.5;
      }
    }

    if (oppCred >= 3 && ["PLANT_RUMOR", "TECH_SURVEIL"].includes(move)) {
      score += 1.2;
    }

    if (myCrowd <= -1 && ["RIDICULE_LAUGH", "STATUS_FLEX"].includes(move)) {
      score += 1.0;
    }

    if (hasScheme && move === "SCHEME_SETUP") {
      score += 1.0;
    }

    if (hasLaughter && move === "RIDICULE_LAUGH") {
      score += 1.0;
    }

    if (hasRules && move === "BUREAUCRACY_TRAP") {
      score += 0.8;
    }

    if (side === "powerless") {
      if (["PLANT_RUMOR", "RIDICULE_LAUGH"].includes(move)) {
        score += 0.3;
      }
    } else {
      if (isBigMove(move)) {
        score += 0.3;
      }
    }

    const noise = (rng() - 0.5) * 0.6;
    scores.push((score + noise) / temperature);
  }

  return softmaxSample(scores, legal, rng);
};


