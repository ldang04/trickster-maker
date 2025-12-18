export type Side = "powerless" | "powerful";

export type MoveType =
  | "PERSUADE_FRAME"
  | "LAUGH_DISARM"
  | "SEDUCE_ENTANGLE"
  | "NORM_REFUSAL"
  | "IDENTITY_FORGERY"
  | "PICARO_HUSTLE"
  | "HOLY_TRUTH"
  | "RULES_WEAPONIZE"
  | "LITERAL_OVEROBEY"
  | "QUEST_CONTROL"
  | "DELEGATE_ENFORCE"
  | "CHAOS_ESCALATE"
  | "SOCIAL_CONTAMINATION"
  | "MONEY_SOLVE"
  | "MEDIA_SPIN"
  | "TECH_LEVERAGE"
  | "OBJECT_CONTROL"
  | "MAGIC_EXCEPTION"
  | "IMPLIED_THREAT"
  | "BORDER_ADVANTAGE";

export type Constraint =
  | "DISCREdited"
  | "CENSORED"
  | "TRAPPED_IN_RULES"
  | "INTIMIDATED"
  | "EXPOSED"
  | "OFF_BALANCE";

export type BattleState = {
  turn: number;
  maxTurns: number;

  momentum: Record<Side, number>; // -5..+5
  credibility: Record<Side, number>; // 0..5
  crowd: Record<Side, number>; // -3..+3

  constraints: Record<Side, Constraint[]>;
  cooldowns: Record<Side, Partial<Record<MoveType, number>>>;

  history: { side: Side; move: MoveType; success: boolean }[];
};

export type ResolveCtx = {
  attacker: Side;
  defender: Side;
  move: MoveType;
  state: BattleState;
};


