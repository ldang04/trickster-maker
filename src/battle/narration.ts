import { BattleState, MoveType, Side } from "./types";

export const WORDS = {
  rumors: ["a whisper", "an ‘official’ memo", "a convenient misunderstanding", "a damning anecdote"],
  crowds: ["the crowd", "the onlookers", "the forest-chorus", "the villagers", "the witnesses"],
  authority: ["the clerk", "the guards", "the committee", "the registrar", "the court"],
  emotions: ["uneasy", "delighted", "suspicious", "amused", "restless"],
  insults: ["untrustworthy", "desperate", "a fraud", "all talk", "too clever by half"],
  pivots: ["anyway", "in other words", "to be precise", "strictly speaking", "as written"],
};

export const TEMPLATES: Record<MoveType, string[]> = {
  PLANT_RUMOR: [
    "{A} drops {rumor} about {B}—quietly, so it spreads loudly.",
    "{A} feeds {authority} a story that makes {B} seem {insult}.",
    "{A} nudges {crowd} toward doubt: “Have you noticed {B} always…?”",
  ],
  BRIBE: [
    "{A} slides a coin across the table. Doors open that weren’t there a moment ago.",
    "{A} pays for silence—then for obedience.",
    "{A} buys a shortcut through the rules and calls it ‘efficiency.’",
  ],
  BUREAUCRACY_TRAP: [
    "{A} buries {B} under forms, stamps, and deadlines that contradict each other.",
    "{A} quotes the rules back at {B} until movement becomes paperwork.",
    "{A} invokes procedure. Suddenly, everything requires approval.",
  ],
  STATUS_FLEX: [
    "{A} flashes status like a seal—{crowd} straightens and stops asking questions.",
    "{A} speaks with the calm of someone who expects to be believed.",
    "{A} doesn’t argue—{A} presumes, and the room follows.",
  ],
  DELEGATE: [
    "{A} whistles. Others move on {A}’s behalf—hands clean, consequences messy.",
    "{A} sends messengers to do the dirty work at a distance.",
    "{A} doesn’t attack directly; {A} appoints the attack.",
  ],
  TECH_SURVEIL: [
    "{A} deploys a gadget that turns suspicion into ‘evidence.’",
    "{A} watches from afar—then acts as if the facts were always obvious.",
    "{A} makes the unseen visible, but only on {A}’s terms.",
  ],
  OBJECT_TRICK: [
    "{A} alters the world itself—objects obey where people might resist.",
    "{A} shifts a key detail in the physical scene. The rules of the moment change.",
    "{A} moves the pieces without touching the players.",
  ],
  WORDPLAY_REFRAME: [
    "{A} answers the question {B} meant, not the one {B} asked.",
    "{A} repeats {B}’s claim—slightly wrong—until it collapses under its own logic.",
    "{A} turns one sentence into three meanings and walks through the gap.",
  ],
  PLAY_DUMB: [
    "{A} blinks innocently. ‘Oh—that’s what you meant?’",
    "{A} misunderstands so sincerely the accusation loses its grip.",
    "{A} becomes harmless on purpose, and the threat slides off.",
  ],
  RIDICULE_LAUGH: [
    "{A} makes {B} look serious in the funniest possible way. {crowd} laughs.",
    "{A} turns fear into comedy—authority wobbles when everyone is giggling.",
    "{A} punctures the moment with laughter, and certainty deflates.",
  ],
  SCHEME_SETUP: [
    "{A} makes a small move now that will matter later—and {B} doesn’t notice.",
    "{A} sets a trap that looks like a coincidence.",
    "{A} plays for position, not impact. Yet.",
  ],
  ESCAPE_SLIP: [
    "{A} slips sideways out of the frame—present, but ungrabbable.",
    "{A} exits through a loophole disguised as a smile.",
    "{A} belongs nowhere for a moment, and the net can’t hold.",
  ],
};

export const EFFECT_TEMPLATES = {
  success: [
    "It lands. {B} is now {constraint}.",
    "Success: {B} takes a hit to {stat}.",
    "{crowd} shifts toward {A}.",
  ],
  fail: [
    "It doesn’t stick. {B} remains steady.",
    "The attempt backfires—{A} looks worse for trying.",
    "{crowd} hesitates. No one commits.",
  ],
  partial: [
    "Halfway effective: it creates doubt, but not control.",
    "It works—just not enough. For now.",
    "{B} staggers, but stays in the fight.",
  ],
};

const pick = <T,>(arr: T[], rng: () => number): T =>
  arr[Math.floor(rng() * arr.length)];

const formatDelta = (label: string, before: number, after: number) => {
  const d = after - before;
  if (d === 0) return null;
  const sign = d > 0 ? "+" : "";
  return `${label} ${sign}${d}`;
};

export type NarrateArgs = {
  attacker: Side;
  defender: Side;
  move: MoveType;
  success: boolean;
  stateBefore: BattleState;
  stateAfter: BattleState;
  rng?: () => number;
};

export const narrateTurn = ({
  attacker,
  defender,
  move,
  success,
  stateBefore,
  stateAfter,
  rng: customRng,
}: NarrateArgs): { actionLine: string; effectLine: string } => {
  const rng = customRng ?? Math.random;
  const words = WORDS;
  const template = pick(TEMPLATES[move], rng);

  const actionLine = template
    .replace(/{A}/g, attacker === "powerless" ? "The powerless trickster" : "The trickster in power")
    .replace(/{B}/g, defender === "powerless" ? "the powerless trickster" : "the trickster in power")
    .replace(/{crowd}/g, pick(words.crowds, rng))
    .replace(/{authority}/g, pick(words.authority, rng))
    .replace(/{rumor}/g, pick(words.rumors, rng))
    .replace(/{insult}/g, pick(words.insults, rng))
    .replace(/{pivot}/g, pick(words.pivots, rng));

  const constraintsBefore = stateBefore.constraints[defender];
  const constraintsAfter = stateAfter.constraints[defender];
  const newConstraint =
    constraintsAfter.find((c) => !constraintsBefore.includes(c)) ?? null;

  const credBefore = stateBefore.credibility;
  const credAfter = stateAfter.credibility;
  const crowdBefore = stateBefore.crowd;
  const crowdAfter = stateAfter.crowd;
  const momBefore = stateBefore.momentum;
  const momAfter = stateAfter.momentum;

  const credDeltaAtt = formatDelta(
    "credibility",
    credBefore[attacker],
    credAfter[attacker]
  );
  const credDeltaDef = formatDelta(
    "credibility",
    credBefore[defender],
    credAfter[defender]
  );
  const crowdDeltaAtt = formatDelta(
    "crowd",
    crowdBefore[attacker],
    crowdAfter[attacker]
  );
  const crowdDeltaDef = formatDelta(
    "crowd",
    crowdBefore[defender],
    crowdAfter[defender]
  );
  const momDeltaAtt = formatDelta(
    "momentum",
    momBefore[attacker],
    momAfter[attacker]
  );

  const deltas = [
    credDeltaAtt && `${attacker} ${credDeltaAtt}`,
    credDeltaDef && `${defender} ${credDeltaDef}`,
    crowdDeltaAtt && `${attacker} ${crowdDeltaAtt}`,
    crowdDeltaDef && `${defender} ${crowdDeltaDef}`,
    momDeltaAtt && `${attacker} ${momDeltaAtt}`,
  ].filter(Boolean);

  const bucket = success ? "success" : "fail";
  const effectTemplate = pick(EFFECT_TEMPLATES[bucket], rng);

  let effectLine = effectTemplate
    .replace(/{A}/g, attacker)
    .replace(/{B}/g, defender)
    .replace(/{crowd}/g, pick(words.crowds, rng))
    .replace(/{stat}/g, newConstraint ?? "standing")
    .replace(/{constraint}/g, newConstraint ?? "unsettled");

  if (deltas.length) {
    effectLine += ` (${deltas.join(", ")})`;
  }

  return { actionLine, effectLine };
};


