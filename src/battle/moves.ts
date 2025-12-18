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

/**
 * MOVE IDs below are FULLY ALIGNED to the final compressed category list:
 * PERSUADE_FRAME, LAUGH_DISARM,
 * SEDUCE_ENTANGLE, NORM_REFUSAL, IDENTITY_FORGERY, PICARO_HUSTLE, HOLY_TRUTH,
 * RULES_WEAPONIZE, LITERAL_OVEROBEY, QUEST_CONTROL, DELEGATE_ENFORCE,
 * CHAOS_ESCALATE, SOCIAL_CONTAMINATION,
 * MONEY_SOLVE, MEDIA_SPIN,
 * TECH_LEVERAGE, OBJECT_CONTROL, MAGIC_EXCEPTION, IMPLIED_THREAT,
 * BORDER_ADVANTAGE
 */
export const MOVE_DEFS: MoveDef[] = [
  // =======================
  // TALK & NARRATIVE CONTROL
  // =======================

  {
    id: "PERSUADE_FRAME",
    allowedSides: ["powerful", "powerless"],
    requiresAnyTraitIds: ["persuasion", "quick_tongue", "social_status", "media_presence"],
    base: 0.6,
    apply: ({ state, attacker, defender }) => {
      // Frame-setting: small cred nudge + momentum, slight crowd lift
      adjustCred(state, defender, -0.5);
      adjustMomentum(state, attacker, 1);
      adjustCrowd(state, attacker, 1);
    },
  },

  {
    id: "LAUGH_DISARM",
    allowedSides: ["powerless"],
    requiresAnyTraitIds: ["laughter", "jester", "performativity", "simpleton"],
    base: 0.6,
    cooldownTurns: 1,
    apply: ({ state, attacker, defender }) => {
      // Laughter makes threats land softer + shakes defender's composure
      removeConstraint(state, attacker, ["INTIMIDATED"]);
      addConstraint(state, defender, "OFF_BALANCE");
      adjustCrowd(state, attacker, 1);
    },
  },

  // =======================
  // STATUS & PERSONA PLAY
  // =======================

  {
    id: "SEDUCE_ENTANGLE",
    allowedSides: ["powerless"],
    requiresAnyTraitIds: ["seductive_trickstar"],
    base: 0.6,
    cooldownTurns: 2,
    apply: ({ state, attacker, defender }) => {
      // Soft entanglement: composure drop + crowd gain
      addConstraint(state, defender, "OFF_BALANCE");
      adjustCrowd(state, attacker, 1);
      adjustCred(state, defender, -0.5);
    },
  },

  {
    id: "NORM_REFUSAL",
    allowedSides: ["powerless"],
    requiresAnyTraitIds: ["nonseductive_trickstar"],
    base: 0.6,
    cooldownTurns: 2,
    apply: ({ state, attacker, defender }) => {
      // Refuses the social script: destabilizes the interaction
      addConstraint(state, defender, "OFF_BALANCE");
      adjustMomentum(state, attacker, 1);
    },
  },

  {
    id: "IDENTITY_FORGERY",
    allowedSides: ["powerful", "powerless"],
    requiresAnyTraitIds: ["shapeshifting_fox", "shapeshifting_power"],
    base: 0.6,
    cooldownTurns: 2,
    apply: ({ state, attacker, defender }) => {
      // Successful mask: clear exposure/censorship pressure, throw defender off
      removeConstraint(state, attacker, ["EXPOSED", "CENSORED"]);
      addConstraint(state, defender, "OFF_BALANCE");
      adjustMomentum(state, attacker, 1);
    },
    onFail: ({ state, attacker }) => {
      // Cover blown
      addConstraint(state, attacker, "EXPOSED");
      adjustMomentum(state, attacker, -1);
    },
  },

  {
    id: "PICARO_HUSTLE",
    allowedSides: ["powerless"],
    requiresAnyTraitIds: ["picaro"],
    base: 0.6,
    cooldownTurns: 1,
    apply: ({ state, attacker, defender }) => {
      // Fast hustle: momentum + minor credibility nick
      adjustMomentum(state, attacker, 1);
      adjustCred(state, defender, -0.5);
    },
  },

  {
    id: "HOLY_TRUTH",
    allowedSides: ["powerless"],
    requiresAnyTraitIds: ["holy_fool"],
    base: 0.6,
    cooldownTurns: 3,
    apply: ({ state, attacker, defender }) => {
      // Truth-bomb: hits cred + resists censorship
      removeConstraint(state, attacker, ["CENSORED"]);
      adjustCred(state, defender, -1);
      adjustCrowd(state, attacker, 1);
    },
  },

  // =======================
  // SYSTEMS: RULES, TASKS, PROCEDURE
  // =======================

  {
    id: "RULES_WEAPONIZE",
    allowedSides: ["powerful"],
    requiresAnyTraitIds: ["rules_laws"],
    base: 0.55,
    cooldownTurns: 2,
    apply: ({ state, attacker, defender }) => {
      addConstraint(state, defender, "TRAPPED_IN_RULES");
      adjustCred(state, defender, -0.5);
      adjustMomentum(state, attacker, 1);
    },
  },

  {
    id: "LITERAL_OVEROBEY",
    allowedSides: ["powerful", "powerless"],
    requiresAnyTraitIds: ["literalism"],
    base: 0.55,
    cooldownTurns: 2,
    apply: ({ state, attacker, defender }) => {
      // If already trapped, literalism converts into a sharper hit; otherwise it creates the trap.
      if (state.constraints[defender].includes("TRAPPED_IN_RULES")) {
        adjustCred(state, defender, -1);
        addConstraint(state, defender, "OFF_BALANCE");
      } else {
        addConstraint(state, defender, "TRAPPED_IN_RULES");
      }
      adjustMomentum(state, attacker, 1);
    },
  },

  {
    id: "QUEST_CONTROL",
    allowedSides: ["powerful"],
    requiresAnyTraitIds: ["quests"],
    base: 0.6,
    cooldownTurns: 2,
    apply: ({ state, attacker, defender }) => {
      // Quest as control: binds defender into obligations (modeled as trap + off-balance)
      addConstraint(state, defender, "TRAPPED_IN_RULES");
      addConstraint(state, defender, "OFF_BALANCE");
      adjustMomentum(state, attacker, 1);
    },
  },

  {
    id: "DELEGATE_ENFORCE",
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

  // =======================
  // DISRUPTION & CHAOS
  // =======================

  {
    id: "CHAOS_ESCALATE",
    allowedSides: ["powerless"],
    requiresAnyTraitIds: ["chaotic_pranks"],
    base: 0.6,
    cooldownTurns: 1,
    apply: ({ state, defender }) => {
      addConstraint(state, defender, "OFF_BALANCE");
      adjustMomentum(state, defender, -1);
    },
  },

  {
    id: "SOCIAL_CONTAMINATION",
    allowedSides: ["powerless"],
    requiresAnyTraitIds: ["social_disruption"],
    base: 0.55,
    cooldownTurns: 3,
    apply: ({ state, attacker, defender }) => {
      // Persistent nuisance: slow, ugly pressure
      adjustCrowd(state, defender, -1);
      adjustCred(state, defender, -0.5);
      adjustMomentum(state, attacker, 1);
    },
  },

  // =======================
  // RESOURCES / VISIBILITY / TECH / FORCE
  // =======================

  {
    id: "MONEY_SOLVE",
    allowedSides: ["powerful"],
    requiresAnyTraitIds: ["money"],
    base: 0.6,
    cooldownTurns: 2,
    apply: ({ state, attacker, defender }) => {
      // Money as friction-removal: clear a self constraint OR apply soft pressure
      if (state.constraints[attacker].length) {
        state.constraints[attacker] = state.constraints[attacker].slice(1);
        adjustMomentum(state, attacker, 1);
      } else {
        adjustCred(state, defender, -0.5);
        adjustMomentum(state, attacker, 1);
      }
    },
  },

  {
    id: "MEDIA_SPIN",
    allowedSides: ["powerful"],
    requiresAnyTraitIds: ["media_presence"],
    base: 0.6,
    cooldownTurns: 2,
    apply: ({ state, attacker, defender }) => {
      adjustCrowd(state, defender, -1);
      addConstraint(state, defender, "DISCREdited");
      adjustMomentum(state, attacker, 1);
    },
  },

  {
    id: "TECH_LEVERAGE",
    allowedSides: ["powerful"],
    requiresAnyTraitIds: ["technology"],
    base: 0.6,
    cooldownTurns: 2,
    apply: ({ state, attacker, defender }) => {
      addConstraint(state, defender, "EXPOSED");
      adjustCred(state, defender, -0.5);
      adjustMomentum(state, attacker, 1);
    },
  },

  {
    id: "OBJECT_CONTROL",
    allowedSides: ["powerful", "powerless"],
    requiresAnyTraitIds: ["object_manipulation"],
    base: 0.6,
    cooldownTurns: 1,
    apply: ({ state, defender }) => {
      addConstraint(state, defender, "OFF_BALANCE");
    },
  },

  {
    id: "MAGIC_EXCEPTION",
    allowedSides: ["powerful"],
    requiresAnyTraitIds: ["magic"],
    base: 0.65,
    cooldownTurns: 3,
    apply: ({ state, attacker, defender }) => {
      // Beyond-human capacity: strong shove without needing procedural hooks
      addConstraint(state, defender, "OFF_BALANCE");
      adjustCred(state, defender, -1);
      adjustMomentum(state, attacker, 1);
    },
  },

  {
    id: "IMPLIED_THREAT",
    allowedSides: ["powerful"],
    requiresAnyTraitIds: ["violence"],
    base: 0.6,
    cooldownTurns: 2,
    apply: ({ state, attacker, defender }) => {
      // Pressure through fear: crowd chills, defender loses momentum
      addConstraint(state, defender, "INTIMIDATED");
      adjustCrowd(state, defender, -1);
      adjustMomentum(state, defender, -1);
      adjustMomentum(state, attacker, 1);
    },
  },

  // =======================
  // BORDER-LIFE / LIMINALITY
  // =======================

  {
    id: "BORDER_ADVANTAGE",
    allowedSides: ["powerful", "powerless"],
    requiresAnyTraitIds: ["liminality"],
    base: 0.6,
    cooldownTurns: 2,
    apply: ({ state, attacker, defender }) => {
      // Border-life: escape pressure + destabilize the other side
      removeConstraint(state, attacker, ["TRAPPED_IN_RULES", "CENSORED"]);
      addConstraint(state, defender, "OFF_BALANCE");
      adjustMomentum(state, attacker, 1);
    },
    onFail: ({ state, attacker }) => {
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
