import { BattleState, MoveType, Side } from "./types";

export const WORDS = {
  rumors: ["a whisper", "an 'official' memo", "a convenient misunderstanding", "a damning anecdote"],
  crowds: ["the crowd", "the onlookers", "the villagers", "the viewers"],
  authority: ["the clerk", "the guards", "the committee", "the registrar", "the court"],
  emotions: ["uneasy", "delighted", "suspicious", "amused", "restless"],
  insults: ["untrustworthy", "desperate", "a fraud", "all talk", "too clever by half"],
  pivots: ["anyway", "in other words", "to be precise", "strictly speaking", "as written"],
  rules: ["the protocol", "the regulation", "the procedure", "the standard", "the requirement", "the guideline"],
  policies: ["the policy", "the directive", "the mandate", "the instruction", "the protocol"],
  identity: ["a visiting inspector", "a distant relative", "a trusted messenger", "an old friend", "a forgotten contact"],
  role: ["authority", "an expert", "a witness", "the official", "the representative"],
  task: ["a small favor", "one simple step", "a quick check", "a brief confirmation", "a minor formality"],
  agents: ["helpers", "associates", "subordinates", "allies", "contacts"],
  story: ["a compelling narrative", "a convenient explanation", "a plausible account", "a convincing tale", "a believable version"],
  event: ["the incident", "what happened", "the situation", "the encounter", "the exchange"],
  device: ["a device", "the system", "the machine", "the tool", "the apparatus"],
  object: ["the scene", "the arrangement", "the setup", "the configuration", "the layout"],
  weapon: ["a weapon", "the blade", "the tool", "the instrument", "the implement"],
  someoneElse: ["the last person who refused", "the previous challenger", "the one who tried before", "the earlier opponent", "the former rival"],
};

export const TEMPLATES: Record<MoveType, string[]> = {
 // FINAL TRICK CATEGORIES (compressed + feature-aligned)
// Notes:
// - Categories can be enabled by multiple features.
// - Keep the placeholder set flexible: {A}, {B}, {crowd}, {authority}, {agents}, {rule}, {device}, {object}, {task}, {reward}, {identity}, {role}, {place}, {resource}.


// =======================
// TALK & NARRATIVE CONTROL
// =======================

PERSUADE_FRAME: [
  "{A} persuades everyone that his behavior is justifiable.",
  "{A} offers a \"reasonable compromise\" that quietly locks in {A}'s outcome.",
],
// Used by: Persuasion, Quick Tongue, Social Status, Media Presence

LAUGH_DISARM: [
  "{A} laughs first, making {B}'s threat feel suddenly performative.",
  "{A} turns the tense moment into a joke everyone repeats instead of resolving.",
  "{A} mimics {B} playfully until authority loses its edge.",
],
// Used by: Jester, Performativity, Simpleton


// =======================
// STATUS & PERSONA PLAY
// =======================

SEDUCE_ENTANGLE: [
  "{A} makes {B} feel like the pursuer, then sets the terms from that position",
  "{A} creates exclusivity: \"Just between us,\" and {B} starts protecting it.",
  "{A} asks a \"small favor\" that quietly establishes a compliance pattern.",
],
// Used by: Seductive Trickster

NORM_REFUSAL: [
  "{A} ignores the expected script so completely that no standard response fits.",
  "{A} breaks etiquette openly, making punishment look petty and overreactive.",
  "{A} makes shame useless by doing the embarrassing thing first.",
],
// Used by: Nonseductive Trickster, Social Disruption (overlap)

IDENTITY_FORGERY: [
  "{A} adopts {identity} with convincing details that make checking feel awkward.",
  "{A} wears the signals of an innocent person, and people self-enforce the illusion.",
  "{A} appears as \"the person in charge,\" and everyone behaves accordingly.",
],
// Used by: Shapeshifting (powerless & in power), Social Status (overlap), Media Presence (overlap)

PICARO_HUSTLE: [
  "{A} borrows authority for ten minutes—just long enough to overrule his enemy's decision.",
  "{A} leaves behind a decoy story that keeps {B} busy while {A} moves on.",
],
// Used by: Picaro, Quick Tongue (overlap), Shapeshifting (overlap)

HOLY_TRUTH: [
  "{A} says the forbidden truth as a blessing, forcing everyone to face deep internalized moral truths.",
  "{A} humiliates himself with such dignity that {B} is painted as the villain",
],
// Used by: Holy Fool (halo)


// =======================
// SYSTEMS: RULES, TASKS, PROCEDURE
// =======================

RULES_WEAPONIZE: [
  "{A} starts a process no one can stop without breaking protocol.",
  "{A} wins on a technicality that looks \"fair\" on paper.",
],
// Used by: Rules & Laws, Social Status (overlap)

LITERAL_OVEROBEY: [
  "{A} follows {rule} so precisely the outcome becomes unusable.",
  "{A} insists on written confirmation for every step until progress stalls.",
],
// Used by: Literalism, Rules & Laws (overlap)

QUEST_CONTROL: [
  "{A} sends {B} on an impossible quest that leads nowhere",
  "{A} adds \"one last requirement\" to a quest, just as success seems reached.",
],
// Used by: Quests, Magic (overlap), Rules & Laws (overlap)

DELEGATE_ENFORCE: [
    "{A} lets others enforce the decision while remaining officially uninvolved.",
  "{A} sends a flock of geese to execute his schemes, staying absent from the scene\"",
],
// Used by: Delegation, Social Status (overlap)


// =======================
// DISRUPTION & CHAOS
// =======================

CHAOS_ESCALATE: [
  "{A} starts tiny disorder that snowballs until routines collapse.",
  "{A} adds one more absurd step until order breaks into farce.",
],
// Used by: Chaotic Pranks

SOCIAL_CONTAMINATION: [
  "{A} introduces a disgusting stench that no one can ignore or remove.",
  "{A} spreads excrement all over a shared space until all routines break down.",
],
// Used by: Social Disruption (Beaver's Perfume), Nonseductive Trickster (overlap)


// =======================
// MATERIAL / TECH / FORCE (Power-side tools)
// =======================

MONEY_SOLVE: [
  "{A} turns resistance into a price tag—then pays it.",
  "{A} offers compensation that makes problems disappear quietly.",
],
// Used by: Money

MEDIA_SPIN: [
  "{A} floods attention with 'BREAKING NEWS'so {B}'s narratives can't gain traction.",
  "{A} performs transparency on camera while the real decision happens off-screen.",
],
// Used by: Media Presence, Social Status (overlap)

TECH_LEVERAGE: [
  "{A} uses {device} to access information no one else has, and uses it to undermine {B}.",
],
// Used by: Technology

OBJECT_CONTROL: [
  "{A} physically changes {object} so the situation can't return to what it was.",
  "{A} rearranges the material scene, making one option impossible.",
],
// Used by: Object Manipulation, Magic (overlap)

MAGIC_EXCEPTION: [
  "{A} does what humans can't, and the usual objections stop applying.",
  "{A} changes one fact of the world—after that, everyone must act differently."
],
// Used by: Magic, Quests (overlap), Rules & Laws (overlap)

IMPLIED_THREAT: [
  "{A} rests a hand on {weapon} and keeps talking calmly.",
  "{A} mentions what happened to {someoneElse} and lets the silence do the work.",
  "{A} makes refusal feel expensive without raising their voice.",
],
// Used by: Violence


// =======================
// BORDER-LIFE / LIMINALITY
// =======================

BORDER_ADVANTAGE: [
  "{A} operates where categories blur, so enforcement hesitates.",
  "{A} moves through back channels and informal favors where rules thin out.",
  "{A} brokers passage between groups that don't trust each other—editing messages as needed.",
],
// Used by: Liminality (Backpack), Picaro (overlap), Money (overlap), Shapeshifting (overlap)

};

export const EFFECT_TEMPLATES = {
  success: [
    "It lands. {B} is now {constraint}.",
    "Success: {B} is now constrained by: {stat}.",
    "{crowd} shifts toward {A}.",
  ],
  fail: [
    "It doesn't stick. {B} remains steady.",
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
    .replace(/{pivot}/g, pick(words.pivots, rng))
    .replace(/{rule}/g, pick(words.rules, rng))
    .replace(/{policy}/g, pick(words.policies, rng))
    .replace(/{identity}/g, pick(words.identity, rng))
    .replace(/{role}/g, pick(words.role, rng))
    .replace(/{task}/g, pick(words.task, rng))
    .replace(/{agents}/g, pick(words.agents, rng))
    .replace(/{story}/g, pick(words.story, rng))
    .replace(/{event}/g, pick(words.event, rng))
    .replace(/{device}/g, pick(words.device, rng))
    .replace(/{object}/g, pick(words.object, rng))
    .replace(/{weapon}/g, pick(words.weapon, rng))
    .replace(/{someoneElse}/g, pick(words.someoneElse, rng));

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
