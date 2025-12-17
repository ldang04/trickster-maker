import { BattleState, Constraint, MoveType, ResolveCtx, Side } from "./types";

export type MoveDef = {
  id: MoveType;
  allowedSides: Side[];
  requiresAnyTraitIds?: string[];
  base: number; // 0..1
  apply: (ctx: ResolveCtx) => void;
  onFail?: (ctx: ResolveCtx) => void;
  cooldownTurns?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const addConstraint = (state: BattleState, side: Side, c: Constraint) => {
  if (!state.constraints[side].includes(c)) {
    state.constraints[side] = [...state.constraints[side], c];
  }
};

const removeConstraint = (state: BattleState, side: Side, toRemove: Constraint[]) => {
  state.constraints[side] = state.constraints[side].filter(
    (c) => !toRemove.includes(c)
  );
};

const adjustCred = (state: BattleState, side: Side, delta: number) => {
  state.credibility[side] = clamp(state.credibility[side] + delta, 0, 5);
};

const adjustCrowd = (state: BattleState, side: Side, delta: number) => {
  state.crowd[side] = clamp(state.crowd[side] + delta, -3, 3);
};

const adjustMomentum = (state: BattleState, side: Side, delta: number) => {
  state.momentum[side] = clamp(state.momentum[side] + delta, -5, 5);
};

export const MOVE_DEFS: MoveDef[] = [
  {
    id: "PLANT_RUMOR",
    allowedSides: ["powerful", "powerless"],
    requiresAnyTraitIds: [
      "social_status",
      "media_presence",
      "quick_tongue",
      "inflated_status",
    ],
    base: 0.6,
    apply: ({ state, attacker, defender }) => {
      adjustCred(state, defender, -1);
      addConstraint(state, defender, "DISCREdited");
      adjustMomentum(state, attacker, 1);
    },
  },
  {
    id: "BRIBE",
    allowedSides: ["powerful"],
    requiresAnyTraitIds: ["money"],
    base: 0.7,
    cooldownTurns: 2,
    apply: ({ state, attacker, defender }) => {
      if (state.constraints[attacker].length) {
        state.constraints[attacker] = state.constraints[attacker].slice(1);
      } else {
        addConstraint(state, defender, "CENSORED");
        adjustCred(state, defender, -1);
      }
    },
  },
  {
    id: "BUREAUCRACY_TRAP",
    allowedSides: ["powerful", "powerless"],
    requiresAnyTraitIds: ["rules_laws", "literalism"],
    base: 0.55,
    cooldownTurns: 2,
    apply: ({ state, defender }) => {
      addConstraint(state, defender, "TRAPPED_IN_RULES");
      adjustMomentum(state, defender, -1);
    },
  },
  {
    id: "STATUS_FLEX",
    allowedSides: ["powerful", "powerless"],
    requiresAnyTraitIds: ["social_status", "inflated_status", "media_presence"],
    base: 0.65,
    apply: ({ state, attacker }) => {
      adjustCrowd(state, attacker, 1);
      adjustMomentum(state, attacker, 1);
    },
  },
  {
    id: "DELEGATE",
    allowedSides: ["powerful"],
    requiresAnyTraitIds: ["delegation"],
    base: 0.6,
    cooldownTurns: 2,
    apply: ({ state, defender }) => {
      addConstraint(state, defender, "EXPOSED");
      addConstraint(state, defender, "OFF_BALANCE");
      adjustCred(state, defender, -1);
    },
  },
  {
    id: "TECH_SURVEIL",
    allowedSides: ["powerful"],
    requiresAnyTraitIds: ["technology"],
    base: 0.6,
    cooldownTurns: 2,
    apply: ({ state, attacker, defender }) => {
      addConstraint(state, defender, "EXPOSED");
      adjustCrowd(state, defender, -1);
      adjustMomentum(state, attacker, 1);
    },
  },
  {
    id: "OBJECT_TRICK",
    allowedSides: ["powerful", "powerless"],
    requiresAnyTraitIds: ["object_manipulation"],
    base: 0.6,
    cooldownTurns: 1,
    apply: ({ state, defender }) => {
      addConstraint(state, defender, "OFF_BALANCE");
    },
  },
  {
    id: "WORDPLAY_REFRAME",
    allowedSides: ["powerful", "powerless"],
    requiresAnyTraitIds: ["quick_tongue", "literalism", "persuasion"],
    base: 0.6,
    apply: ({ state, attacker, defender }) => {
      // Prefer clearing censoring / trapping constraints from self
      removeConstraint(state, attacker, ["CENSORED", "TRAPPED_IN_RULES"]);
      // Light credibility nudge against defender
      adjustCred(state, defender, -0.5);
    },
  },
  {
    id: "PLAY_DUMB",
    allowedSides: ["powerless"],
    requiresAnyTraitIds: ["simpleton"],
    base: 0.55,
    apply: ({ state, attacker }) => {
      removeConstraint(state, attacker, ["EXPOSED", "INTIMIDATED"]);
    },
  },
  {
    id: "RIDICULE_LAUGH",
    allowedSides: ["powerless"],
    requiresAnyTraitIds: ["laughter", "jester"],
    base: 0.6,
    cooldownTurns: 1,
    apply: ({ state, attacker, defender }) => {
      adjustCrowd(state, defender, -1);
      adjustCrowd(state, attacker, 1);
      addConstraint(state, defender, "OFF_BALANCE");
    },
  },
  {
    id: "SCHEME_SETUP",
    allowedSides: ["powerless"],
    requiresAnyTraitIds: ["scheme"],
    base: 0.7,
    cooldownTurns: 1,
    apply: ({ state, attacker }) => {
      // Represent a future bonus as momentum bump
      adjustMomentum(state, attacker, 1);
    },
  },
  {
    id: "ESCAPE_SLIP",
    allowedSides: ["powerful", "powerless"],
    requiresAnyTraitIds: ["liminality"],
    base: 0.6,
    cooldownTurns: 2,
    apply: ({ state, attacker }) => {
      removeConstraint(state, attacker, ["TRAPPED_IN_RULES", "CENSORED"]);
      adjustMomentum(state, attacker, 1);
    },
    onFail: ({ state, attacker }) => {
      // Failed escape costs a bit of momentum
      adjustMomentum(state, attacker, -1);
    },
  },
];

export const isMoveOnCooldown = (
  move: MoveType,
  side: Side,
  state: BattleState
): boolean => {
  const turnsLeft = state.cooldowns[side]?.[move];
  return typeof turnsLeft === "number" && turnsLeft > 0;
};

export const tickCooldowns = (state: BattleState) => {
  (["powerless", "powerful"] as Side[]).forEach((side) => {
    const cd = state.cooldowns[side];
    const next: Partial<Record<MoveType, number>> = {};
    Object.entries(cd).forEach(([id, turns]) => {
      const t = typeof turns === "number" ? turns - 1 : 0;
      if (t > 0) {
        next[id as MoveType] = t;
      }
    });
    state.cooldowns[side] = next;
  });
};


