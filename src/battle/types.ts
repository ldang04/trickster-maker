export type Side = "powerless" | "powerful";

export type MoveType =
  | "PLANT_RUMOR"
  | "BRIBE"
  | "BUREAUCRACY_TRAP"
  | "STATUS_FLEX"
  | "DELEGATE"
  | "TECH_SURVEIL"
  | "OBJECT_TRICK"
  | "WORDPLAY_REFRAME"
  | "PLAY_DUMB"
  | "RIDICULE_LAUGH"
  | "SCHEME_SETUP"
  | "ESCAPE_SLIP";

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


