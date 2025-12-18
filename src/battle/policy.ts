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

const hasUsedMove = (state: BattleState, side: Side, move: MoveType): boolean => {
  return state.history.some((entry) => entry.side === side && entry.move === move);
};

const isBigMove = (move: MoveType) =>
  [
    "MONEY_SOLVE",
    "RULES_WEAPONIZE",
    "DELEGATE_ENFORCE",
    "TECH_LEVERAGE",
    "MAGIC_EXCEPTION",
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

  const isTrapped = sideHasConstraint(state, side, "TRAPPED_IN_RULES");

  for (const def of MOVE_DEFS) {
    if (!def.allowedSides.includes(side)) continue;
    
    // PERSUADE_FRAME requires "persuasion" trait specifically, always
    if (def.id === "PERSUADE_FRAME") {
      if (!selectedTraitIds.includes("persuasion")) {
        continue;
      }
      // PERSUADE_FRAME can only be used once when trapped, then never again
      if (isTrapped && hasUsedMove(state, side, "PERSUADE_FRAME")) {
        continue;
      }
    }
    
    // When trapped, only allow escape moves
    if (isTrapped) {
      if (
        !["PERSUADE_FRAME", "LITERAL_OVEROBEY", "BORDER_ADVANTAGE"].includes(
          def.id
        )
      ) {
        continue;
      }
      // When trapped, LITERAL_OVEROBEY and BORDER_ADVANTAGE are available regardless of traits
      // PERSUADE_FRAME already checked above - requires persuasion
    } else {
      // When not trapped, normal trait requirements apply
      if (!hasAnyTrait(selectedTraitIds, def.requiresAnyTraitIds)) continue;
    }
    
    if (isMoveOnCooldown(def.id, side, state)) continue;
    if (hasUsedMove(state, side, def.id)) continue; // Prevent repeating moves

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
      if (["BORDER_ADVANTAGE", "PERSUADE_FRAME", "LITERAL_OVEROBEY"].includes(move)) {
        score += 1.5;
      }
    }

    if (oppCred >= 3 && ["TECH_LEVERAGE", "MEDIA_SPIN"].includes(move)) {
      score += 1.2;
    }

    if (myCrowd <= -1 && ["LAUGH_DISARM", "PERSUADE_FRAME"].includes(move)) {
      score += 1.0;
    }

    if (hasLaughter && move === "LAUGH_DISARM") {
      score += 1.0;
    }

    if (hasRules && (move === "RULES_WEAPONIZE" || move === "LITERAL_OVEROBEY")) {
      score += 0.8;
    }

    if (side === "powerless") {
      if (["LAUGH_DISARM", "PERSUADE_FRAME"].includes(move)) {
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


