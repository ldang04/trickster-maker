import { BattleState, MoveType, Side } from "./types";
import { MOVE_DEFS, tickCooldowns } from "./moves";

export type ResolveOptions = {
  rng?: () => number;
};

const defaultRng = () => Math.random();

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const computeSuccessProbability = (
  attacker: Side,
  defender: Side,
  move: MoveType,
  state: BattleState,
  rng: () => number,
  attackerTraitIds: string[],
  defenderTraitIds: string[]
) => {
  const def = MOVE_DEFS.find((m) => m.id === move)!;
  let p = def.base;

  // Give powerless trickster a slight advantage on success probability
  if (attacker === "powerless") {
    p += 0.05;
  }

  if (
    (move === "WORDPLAY_REFRAME" || move === "ESCAPE_SLIP") &&
    attackerTraitIds.includes("quick_tongue")
  ) {
    p += 0.1;
  }
  if (move === "BUREAUCRACY_TRAP" && attackerTraitIds.includes("literalism")) {
    p += 0.1;
  }
  if (move === "RIDICULE_LAUGH" && attackerTraitIds.includes("laughter")) {
    p += 0.1;
  }
  if (move === "SCHEME_SETUP" && attackerTraitIds.includes("scheme")) {
    p += 0.1;
  }

  const momentumDiff = state.momentum[attacker] - state.momentum[defender];
  p += momentumDiff * 0.03;

  const crowdDiff = state.crowd[attacker] - state.crowd[defender];
  p += crowdDiff * 0.04;

  if (defenderTraitIds.includes("rules_laws") && move === "BUREAUCRACY_TRAP") {
    p -= 0.1;
  }
  if (defenderTraitIds.includes("media_presence") && move === "PLANT_RUMOR") {
    p -= 0.1;
  }

  const noise = (rng() - 0.5) * 0.2;
  p += noise;

  return clamp(p, 0.05, 0.95);
};

export const resolveMove = (
  attacker: Side,
  move: MoveType,
  state: BattleState,
  attackerTraitIds: string[],
  defenderTraitIds: string[],
  options: ResolveOptions = {}
): { success: boolean; stateAfter: BattleState } => {
  const rng = options.rng ?? defaultRng;
  const defender: Side = attacker === "powerless" ? "powerful" : "powerless";
  const def = MOVE_DEFS.find((m) => m.id === move);
  if (!def) {
    return { success: false, stateAfter: state };
  }

  const p = computeSuccessProbability(
    attacker,
    defender,
    move,
    state,
    rng,
    attackerTraitIds,
    defenderTraitIds
  );

  const roll = rng();
  const success = roll < p;

  const ctx = { attacker, defender, move, state };

  if (success) {
    def.apply(ctx);
  } else if (def.onFail) {
    def.onFail(ctx);
  }

  if (def.cooldownTurns && def.cooldownTurns > 0) {
    const current = state.cooldowns[attacker][move] ?? 0;
    state.cooldowns[attacker][move] = Math.max(
      current,
      def.cooldownTurns + 1 // include this turn
    );
  }

  state.history.push({ side: attacker, move, success });

  tickCooldowns(state);
  state.turn += 1;

  return { success, stateAfter: state };
};


