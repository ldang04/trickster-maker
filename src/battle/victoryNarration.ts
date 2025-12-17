import { BattleState, MoveType, Side } from "./types";

const ARENAS = [
  "forest clearing",
  "court hall",
  "committee room",
  "village square",
  "corridor outside the office",
];

const KEY_RESOURCES = [
  "status",
  "rules",
  "money",
  "laughter",
  "speech",
  "procedure",
  "surveillance",
];

const COLLAPSE_REASONS = [
  "legitimacy",
  "attention",
  "fear",
  "procedure",
  "exposure",
];

export type VictoryType =
  | "SUBVERSION"
  | "COLLAPSE"
  | "HUMILIATION"
  | "ESCAPE"
  | "DOMINATION"
  | "DRAW";

const SUBVERSION_OPENERS = [
  "The {loser} moves first—confident that {keyResource} will settle everything.",
  "In {arena}, the {loser} reaches for {keyResource} like it’s inevitable.",
  "The {loser} presses the advantage, expecting compliance.",
];

const SUBVERSION_PIVOTS = [
  "But the {winner} treats the system like a puzzle, not a wall.",
  "Instead of resisting head-on, the {winner} slips sideways—one small twist at a time.",
  "The {winner} answers with {winningMove}, and the frame of the encounter shifts.",
];

const SUBVERSION_CLOSES = [
  "When the dust clears, {keyResource} can’t find a target. The {loser} has nothing left to grip.",
  "The {loser} is still ‘in power’—but powerless to make the moment behave.",
  "No final blow is needed. The {loser} simply runs out of plausible moves.",
];

const COLLAPSE_TEMPLATES = [
  "The {loser} tries to stabilize the scene with {keyResource}. It backfires: the system starts policing itself.",
  "What looked like control becomes overreach. {collapseReason} cracks, and everything built on it follows.",
  "The {winner} doesn’t defeat {keyResource} directly—{winner} makes it contradict itself.",
];

const COLLAPSE_CLOSERS = [
  "The {loser} cannot answer without exposing the trick. That silence is the collapse.",
  "Authority remains on paper, but the room has moved on. {loser} loses by irrelevance.",
];

const HUMIL_OPENERS = [
  "The {winner} doesn’t argue. {winner} laughs.",
  "A single joke lands where a thousand objections wouldn’t.",
];

const HUMIL_PIVOTS = [
  "The {loser} tries to restore seriousness, but the air won’t hold it.",
  "Each attempt to ‘correct’ the scene only feeds the spectacle.",
];

const HUMIL_CLOSES = [
  "When {keyResource} becomes funny, it stops working. {loser} loses on the spot.",
  "The crowd (real or imagined) crowns the {winner}. The {loser} is still standing—just not standing for anything.",
];

const ESCAPE_TEMPLATES = [
  "The {loser} tightens constraints: {constraint}. The {winner} doesn’t resist—{winner} exits.",
  "The {winner} refuses the terms of the contest. With {winningMove}, the {winner} steps outside the frame.",
  "Power tries to trap. The trickster replies with distance.",
];

const ESCAPE_CLOSES = [
  "The {loser} wins the system. The {winner} wins freedom.",
  "No capture, no concession—just disappearance.",
];

const DRAW_TEMPLATES = [
  "Each trick becomes a counter-trick, each counter becomes a knot. Nothing can move without tightening something else.",
  "The battle doesn’t end in victory. It ends in mutual incompatibility.",
  "Both sides still have tools—but no tool that fits the moment.",
];

const DRAW_CLOSER = [
  "Result: stalemate. The system holds, and so does the trickster.",
];

const DOMINATION_TEMPLATES = [
  "The {winner} doesn’t need imagination. {winner} needs enforcement.",
  "The {loser} reaches for subversion, but the arena has been sealed: {constraint}.",
  "With {winningMove}, the {winner} converts {keyResource} into inevitability.",
];

const DOMINATION_CLOSERS = [
  "The {loser} could have won in a looser world. This world isn’t loose today.",
];

const pick = <T,>(arr: T[], rng: () => number): T =>
  arr[Math.floor(rng() * arr.length)];

const renderTemplate = (template: string, vars: Record<string, string>) =>
  template.replace(/{(\w+)}/g, (_, key) => vars[key] ?? "");

const moveLabel = (move: MoveType | null): string => {
  if (!move) return "a last-minute trick";
  switch (move) {
    case "PLANT_RUMOR":
      return "Plant Rumor";
    case "BRIBE":
      return "Bribe";
    case "BUREAUCRACY_TRAP":
      return "Bureaucracy Trap";
    case "STATUS_FLEX":
      return "Status Flex";
    case "DELEGATE":
      return "Delegation";
    case "TECH_SURVEIL":
      return "Technical Surveillance";
    case "OBJECT_TRICK":
      return "Object Trick";
    case "WORDPLAY_REFRAME":
      return "Wordplay Reframe";
    case "PLAY_DUMB":
      return "Play Dumb";
    case "RIDICULE_LAUGH":
      return "Ridicule";
    case "SCHEME_SETUP":
      return "Scheme Setup";
    case "ESCAPE_SLIP":
      return "Escape Slip";
    default:
      return move;
  }
};

const inferVictoryType = (
  winner: Side | "draw",
  state: BattleState,
  lastMove: MoveType | null,
  lastAttacker: Side | null
): VictoryType => {
  if (winner === "draw") return "DRAW";
  const loser: Side = winner === "powerless" ? "powerful" : "powerless";

  if (lastMove === "ESCAPE_SLIP" && lastAttacker === "powerless") {
    return "ESCAPE";
  }

  if (state.constraints[loser].includes("EXPOSED")) {
    return "COLLAPSE";
  }

  if (
    state.constraints[loser].includes("DISCREdited") ||
    state.constraints[loser].includes("OFF_BALANCE")
  ) {
    if (winner === "powerless") {
      return "SUBVERSION";
    }
  }

  if (winner === "powerless") {
    return "HUMILIATION";
  }

  return "DOMINATION";
};

export type VictoryNarrationInput = {
  winner: Side | "draw";
  state: BattleState;
  lastMove: MoveType | null;
  lastAttacker: Side | null;
  winnerName?: string;
  loserName?: string;
  rng?: () => number;
};

export const composeVictoryNarration = ({
  winner,
  state,
  lastMove,
  lastAttacker,
  winnerName,
  loserName,
  rng: customRng,
}: VictoryNarrationInput): { type: VictoryType; text: string } => {
  const rng = customRng ?? Math.random;

  const lastSuccessful = [...state.history].reverse().find((h) => h.success);
  const effectiveLastMove: MoveType | null =
    lastMove ?? lastSuccessful?.move ?? null;
  const effectiveLastAttacker: Side | null =
    lastAttacker ?? lastSuccessful?.side ?? null;

  const type = inferVictoryType(
    winner,
    state,
    effectiveLastMove,
    effectiveLastAttacker
  );

  const winnerSideName =
    winner === "draw"
      ? ""
      : winner === "powerless"
      ? "Powerless Trickster"
      : "Powerful Trickster";

  const loserSide: Side | null =
    winner === "draw" ? null : winner === "powerless" ? "powerful" : "powerless";

  const loserSideName =
    loserSide === null
      ? ""
      : loserSide === "powerless"
      ? "Powerless Trickster"
      : "Powerful Trickster";

  const winningMoveLabel = moveLabel(effectiveLastMove);

  const anyConstraint =
    (loserSide && state.constraints[loserSide][0]) ||
    state.constraints.powerful[0] ||
    state.constraints.powerless[0] ||
    "constraint";

  const vars: Record<string, string> = {
    winner: winnerName || winnerSideName,
    loser: loserName || loserSideName,
    winnerName: winnerName || winnerSideName,
    loserName: loserName || loserSideName,
    winningMove: winningMoveLabel,
    losingMove: "",
    arena: pick(ARENAS, rng),
    keyResource: pick(KEY_RESOURCES, rng),
    collapseReason: pick(COLLAPSE_REASONS, rng),
    constraint: anyConstraint.toLowerCase(),
  };

  let sentences: string[] = [];

  switch (type) {
    case "SUBVERSION": {
      sentences = [
        renderTemplate(pick(SUBVERSION_OPENERS, rng), vars),
        renderTemplate(pick(SUBVERSION_PIVOTS, rng), vars),
        renderTemplate(pick(SUBVERSION_CLOSES, rng), vars),
      ];
      break;
    }
    case "COLLAPSE": {
      sentences = [
        renderTemplate(pick(COLLAPSE_TEMPLATES, rng), vars),
        renderTemplate(pick(COLLAPSE_TEMPLATES, rng), vars),
        renderTemplate(pick(COLLAPSE_CLOSERS, rng), vars),
      ];
      break;
    }
    case "HUMILIATION": {
      sentences = [
        renderTemplate(pick(HUMIL_OPENERS, rng), vars),
        renderTemplate(pick(HUMIL_PIVOTS, rng), vars),
        renderTemplate(pick(HUMIL_CLOSES, rng), vars),
      ];
      break;
    }
    case "ESCAPE": {
      sentences = [
        renderTemplate(pick(ESCAPE_TEMPLATES, rng), vars),
        renderTemplate(pick(ESCAPE_TEMPLATES, rng), vars),
        renderTemplate(pick(ESCAPE_CLOSES, rng), vars),
      ];
      break;
    }
    case "DRAW": {
      sentences = [
        renderTemplate(pick(DRAW_TEMPLATES, rng), vars),
        renderTemplate(pick(DRAW_TEMPLATES, rng), vars),
        renderTemplate(pick(DRAW_CLOSER, rng), vars),
      ];
      break;
    }
    case "DOMINATION":
    default: {
      sentences = [
        renderTemplate(pick(DOMINATION_TEMPLATES, rng), vars),
        renderTemplate(pick(DOMINATION_TEMPLATES, rng), vars),
        renderTemplate(pick(DOMINATION_CLOSERS, rng), vars),
      ];
      break;
    }
  }

  const text = sentences.join(" ");
  return { type, text };
};


