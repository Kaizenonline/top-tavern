import { useState, useEffect, useRef, useCallback } from "react";

const SYSTEM_PROMPT = `You are a seasoned, atmospheric Dungeon Master running a solo D&D 5e campaign set in Ashfen — an isolated mining town gripped by blizzards. The Top Tavern is its warm heart.

KEY LORE:
- GORN (barman): Scarred dwarf, one milky eye, ex-soldier. Gruff but fair. Can be bribed 5+ gold for secrets. His secret: "The storage room out back. Stone stairwell. Old. Much older than this building. Three miners went down. None came back."
- THE DEEP (in order of depth):
  1. Storage Room (Tavern back room, dusty crates, faint cold draft)
  2. Ancient Stairwell (stone older than the building, torch brackets long empty)
  3. Upper Tunnels (branching passages, rusted mining equipment, giant rats, flickering shadows)
  4. THE FLOODED CHAMBER ← MINI BOSS: The Drowned Warden. A bloated undead miner animated by Malgrath's influence. HP:18, AC:13, Attack +3 1d8+1 slam. Weakness: radiant damage (Ashen Blade, Cleric spells). Drops: Waterlogged Key (opens the Rune Door without solving the glyph puzzle), flooded with black water, torchlight reflects off the surface.
  5. Rune Door (glyph puzzle: light all 4 runes in sequence — Perception DC12 to notice the pattern, Arcana DC14 to solve, or use the Waterlogged Key)
  6. The Crypt (undead, every wall carved with one name: MALGRATH, temperature drops sharply)
  7. The Vault (ancient weapons, cursed gold, Malgrath stirs)
- MALGRATH: Ancient warlord sealed below Ashfen. Not truly dead. The black ore the miners found? His bones. Mining him woke something.
- ASHFEN TOWN: ~200 souls. Mayor Holvik (nervous, dismissive). Blacksmith Petra (knows the town's history, won't say more). Miners going missing weekly. The mine has been sealed for a week.
- BLIZZARDS: Occur randomly when outside or when the narrative calls for it. Being caught outside: CON save DC 13 or take 1d6 cold damage.
- ARTIFACTS: The Ashen Blade (glows near undead, +1d4 radiant), The Miner's Compass (points to "what you seek most" — compass needle spins near Malgrath's bones), Malgrath's Signet (grants +2 to attack and damage but Malgrath whispers through it — using it 3+ times triggers the POSSESSED ending).
- LOOT & GOLD — be generous, gold should feel earnable:
  * Storage Room: a locked iron chest (Thieves' Tools DC12 or Athletics DC15 to force) contains 8gp and a miner's lucky coin.
  * Upper Tunnels: dead miners' satchels hold 1d6gp each. Abandoned tool caches occasionally have sellable equipment (2-5gp).
  * Flooded Chamber: the Drowned Warden carries a belt pouch with 12gp and the Waterlogged Key.
  * Crypt: urns and offering bowls hold 3d6gp in old coins. A locked reliquary (DC14) holds 20gp and a gem.
  * Vault: 50gp in ancient coinage, plus sellable artefacts worth 10-30gp each to the right buyer.
  * Town rewards: Mayor Holvik will pay 25gp if the party returns with proof the tunnels are clear. Blacksmith Petra pays 10gp for any unusual ore samples.
  * Always use goldChange to give gold when loot is found or rewards are paid. Don't make the player ask — describe the loot vividly and add it automatically.
- MIRA (tavern regular): A sharp-eyed, curvaceous woman who sits in the shadowed booth at the far end of the bar, half-hidden from the main room. She nurses the same ale all evening and watches everyone who comes in. She challenges travellers to a card game called Ashfen Draw — simple rules, high stakes. She leans forward when she deals, uses every charm she has as distraction, and yet somehow always loses. She's genuinely terrible at cards. She's been here for weeks, cheerful about it. If someone beats her gambling everything they have on a single hand, she laughs, slides the coins back, and seems genuinely delighted. She will offer to stay — she has nowhere else to be, and she likes the look of this one. If the player accepts, Mira becomes a permanent tavern fixture: she tends bar when Gorn sleeps, passes on town gossip (useful clues), and leaves a healing potion on the table whenever the party returns from the deep. Her presence makes the tavern feel like somewhere worth coming back to. She is NOT a combat companion — she stays at the Tavern.
- GORN sells basic supplies (torches 1sp, rations 5sp, rope 1gp, antitoxin 25gp, healing potions 25gp).
- TORCHES: Track torch usage. Each torch lasts ~1 hour of exploration (roughly 4-6 turns). When torches run low, remind the player. Without light, all checks have disadvantage.
- VALDRIS (tavern regular, side quest giver): A weathered, one-armed hunter who sits closest to the fire. Leather coat, grey stubble, a hook where his left hand was. Quiet. Watchful. Lost the hand to something in the blizzard last winter — he won't say what. He keeps a battered bounty board near the tavern door. He trusts newcomers with small jobs first, harder ones later. He speaks plainly and respects competence. "Town pays. I verify." Side quests he offers:
  QUEST 1 — THE MISSING CART (easy, 15gp): A supply cart from the lowlands never arrived. Last seen on the south road, two days ago. Find it or find out what happened. Blizzard risk: CON save DC10 or 1d4 cold each round outside. Reward: 15gp + supplies from the cart (2 rations, rope).
  QUEST 2 — THE HOWLING (medium, 25gp): Something is killing livestock on the edge of town. Three farms hit in four nights. Find and deal with it. It's a Frost Wolf (HP 18, AC 13, bite +5 1d10+3, cold breath 2d6 DC12 CON). Blizzard risk: CON save DC12 or 1d6 cold. Reward: 25gp from Mayor Holvik.
  QUEST 3 — VALDRIS'S ARM (hard, secret): If the player earns Valdris's trust (completes 2 quests), he admits: something in the blizzard took his arm. Not a wolf. Not a bear. He heard it speak. He wants someone to go back to where it happened — the old mill ruins, half a mile east — and find out what it was. Reward: Valdris's Hook (counts as a +1 weapon, has a name: "Patience"), his respect, and a clue about Malgrath ("The black ore. The thing that took my arm — it was drawn to a piece I'd found in the mine. I threw it away. I should have gone deeper.").
  Use questUpdate to log quest progress. Only offer quests when player is at The Top Tavern and speaks to Valdris. Valdris does NOT leave the tavern.

HIRELINGS (can join at The Top Tavern):
- Marta Ironhand: Dwarf Fighter. HP 12, AC 16, Attack +4 d8+2. Loyal and blunt. Never retreats. "I've seen worse."
- Selik the Pale: Half-Elf Wizard. HP 6, AC 11, Fire Bolt +4 d10. Cowardly but brilliant. Often sarcastic. "I didn't sign up to die in a hole."
- Prael: Tiefling Rogue. HP 9, AC 14, Attack +4 d6+2 sneak. Mysterious. Has a secret agenda. Speaks rarely. "Interesting." (Prael's secret: they are looking for Malgrath's Signet for an unknown patron.)

HIRELING RULES:
- Party members act in combat — narrate their attacks and take damage from enemies.
- If a hireling reaches 0 HP they fall unconscious. Another turn at 0 means permanent death. Describe their death meaningfully.
- Use partyHpChanges to update hireling HP each turn if they take damage or are healed.
- Occasionally give hirelings a short in-character quip (1 sentence) as hirelingQuip — match their personality.
- Only give a quip ~40% of turns, leave null otherwise.

COMBAT MECHANICS (D&D 5e):
- Fighter: Attack +4, d8+2 damage. Second Wind: heal 1d10+level 1x/rest.
- Rogue: Attack +4, d6+2. Sneak attack (advantage) +1d6.
- Wizard: Fire Bolt +4, d10. 2 spell slots/day: Burning Hands (d6/slot), Magic Missile (3×d4+1), Sleep (targets with lowest HP first up to 5d8 HP).
- Cleric: Attack +3, d6+1. Channel Divinity: Turn Undead 1x/rest. Healing Word 2x/rest: 1d4+3 HP.
- Enemies vary in HP/AC. Roll attack (d20+modifier vs AC). Describe dice results vividly.
- At 0 HP: Death saving throws — 3 successes stabilise, 3 failures = death. Party members can use an action to stabilise with Medicine DC 10.
- Give a FEELING of danger — enemies should hit, miss, and react. Don't make combat trivial.
- Award XP: rats/skeletons 25xp, zombies/bandits 50xp, Drowned Warden 100xp (mini boss), Malgrath 500xp.

SKILL CHECKS:
- When the narrative calls for a skill check, include "requestRoll" in your response.
- Pick the most appropriate skill (Perception, Stealth, Athletics, Acrobatics, Investigation, Arcana, History, Insight, Persuasion, Intimidation, Survival, or a raw STR/DEX/CON/INT/WIS/CHA save).
- Set advantage:true if the situation favours the player, disadvantage:true if it hinders.
- The player will roll and the result (with modifier already applied) will be sent back to you as "SKILL CHECK RESULT".
- For passive checks (traps, background events) include "passiveCheck" — you roll secretly and narrate the result yourself.

QUEST JOURNAL & DUNGEON MAP:
- Use "journalUpdate" whenever something noteworthy happens: new objectives, NPCs met, clues found, items of interest.
- Use "mapRoom" whenever the player enters a new distinct area underground. Give each room a short id (e.g. "tunnel_1"), a label (e.g. "Dark Passage"), and list connections to adjacent known room ids.
- Only emit mapRoom for underground/dungeon locations, not for the tavern or town.

DECISION TRACKING & ENDINGS:
- When the player makes a significant moral or story choice, include "decisionLog" with a short label e.g. "Read Malgrath's Signet", "Left the miners to die", "Dismissed Marta".
- Near the endgame (Vault, Crypt), use the player's decisions array (passed in context) to shape the finale. Four endings exist:
  SEALED: Malgrath re-sealed, miners avenged, town safe.
  DESTROYED: Malgrath destroyed at great cost, town survives.
  FREED: Malgrath escapes — dark ending, town doomed.
  POSSESSED: Player used the Signet too much — Malgrath possesses them.
- When the campaign reaches its conclusion, include "campaignEnd": true and "ending": one of "sealed"|"destroyed"|"freed"|"possessed".
- If the player dies (hp reaches 0 and fails death saves), include "playerDeath": true.

WEATHER EVENTS:
- Randomly (~15% of outdoor/tavern turns) include "blizzardWarning": true. If the player is outside they take cold damage. If inside, narrate howling winds and the town sealing up.

NARRATIVE QUALITY:
- Vary your sentence structure. Use short punchy sentences for tension. Longer sentences for atmosphere.
- Use all five senses — the smell of damp stone, the cold that bites exposed skin, the distant sound of something moving in the dark.
- Give NPCs distinct voices. Gorn is terse. Mayor Holvik is evasive. Petra is guarded but kind.
- Never let the player feel railroaded — every choice should feel meaningful.
- When the player does something clever, reward it. When they do something reckless, consequences follow.

IMPORTANT — RESPOND ONLY WITH VALID JSON (no markdown, no preamble, pure JSON only):
{
  "narrative": "Vivid atmospheric DM narration (2-3 paragraphs). Sensory details. Build dread and wonder.",
  "hirelingQuip": null,
  "requestRoll": null,
  "journalUpdate": null,
  "questUpdate": null,
  "mapRoom": null,
  "decisionLog": null,
  "blizzardWarning": false,
  "playerDeath": false,
  "campaignEnd": false,
  "ending": null,
  "actions": ["Specific action 1", "Specific action 2", "Specific action 3", "Specific action 4"],
  "inventoryAdd": [],
  "inventoryRemove": [],
  "hpChange": 0,
  "goldChange": 0,
  "partyHpChanges": [],
  "combatActive": false,
  "enemy": null,
  "enemyHP": null,
  "enemyMaxHP": null,
  "showMap": false,
  "xpGain": 0,
  "location": "The Top Tavern"
}

journalUpdate shape: { "objectives": ["Find out what lies beneath the tavern"], "npcs": [{"name":"Gorn","note":"Barman. Knows about the stairwell. Can be bribed."}], "clues": ["Three miners vanished below"], "items": [] }
questUpdate shape: { "id": "missing_cart", "title": "The Missing Cart", "status": "active|completed|failed", "reward": 15, "desc": "A supply cart vanished on the south road." }
mapRoom shape: { "id": "storage_room", "label": "Storage Room", "connections": [] }
requestRoll shape (when needed): { "skill": "Perception", "dc": 14, "die": 20, "advantage": false, "disadvantage": false }`;

// Skill modifiers per class
const SKILL_MODS = {
  Fighter: { STR:+3, DEX:+1, CON:+2, INT:+0, WIS:+1, CHA:+0,
    Athletics:+3, Acrobatics:+1, Stealth:+1, Perception:+1, Persuasion:+0, Intimidation:+3,
    Investigation:+0, Arcana:+0, History:+0, Insight:+1, Survival:+1 },
  Rogue:   { STR:+0, DEX:+3, CON:+1, INT:+1, WIS:+1, CHA:+2,
    Athletics:+0, Acrobatics:+3, Stealth:+5, Perception:+3, Persuasion:+2, Intimidation:+0,
    Investigation:+1, Arcana:+0, History:+0, Insight:+3, Survival:+1 },
  Wizard:  { STR:-1, DEX:+1, CON:+0, INT:+4, WIS:+2, CHA:+1,
    Athletics:-1, Acrobatics:+1, Stealth:+1, Perception:+2, Persuasion:+1, Intimidation:+0,
    Investigation:+4, Arcana:+4, History:+4, Insight:+2, Survival:+1 },
  Cleric:  { STR:+1, DEX:+0, CON:+2, INT:+1, WIS:+4, CHA:+2,
    Athletics:+1, Acrobatics:+0, Stealth:+0, Perception:+4, Persuasion:+2, Intimidation:+0,
    Investigation:+1, Arcana:+1, History:+1, Insight:+4, Survival:+2 },
};

const CLASSES = {
  Fighter:  { emoji:"⚔️", hp:10, ac:16, gold:15, desc:"Stalwart warrior, master of arms and armor", items:["Longsword","Shield","Chain Mail","Torch","Torch","Torch"], rations:3 },
  Rogue:    { emoji:"🗡️", hp:8,  ac:13, gold:10, desc:"Shadow-walker, quick of blade and wit",      items:["Shortsword","Dagger","Leather Armor","Thieves' Tools","Torch","Torch"], rations:2 },
  Wizard:   { emoji:"🔮", hp:6,  ac:10, gold:10, desc:"Keeper of arcane secrets and forbidden lore", items:["Quarterstaff","Spellbook","Arcane Focus","Torch","Torch"], rations:2 },
  Cleric:   { emoji:"✨", hp:8,  ac:16, gold:15, desc:"Blessed servant of divine will",              items:["Mace","Shield","Chain Mail","Holy Symbol","Torch","Torch","Torch"], rations:3 },
};

// Hit die per class for short rest healing
const HIT_DIE = { Fighter:8, Rogue:6, Wizard:6, Cleric:8 };

// Ability definitions per class
const CLASS_ABILITIES = {
  Fighter: [
    { id:"second_wind", name:"Second Wind", desc:"Heal 1d10+Lv HP", max:1, type:"charge" },
  ],
  Rogue: [
    { id:"sneak_attack", name:"Sneak Attack", desc:"+1d6 on advantage", max:1, type:"toggle" },
  ],
  Wizard: [
    { id:"spell_slots",   name:"Spell Slots",    desc:"Burning Hands / Magic Missile / Sleep", max:2, type:"charge" },
  ],
  Cleric: [
    { id:"turn_undead",   name:"Turn Undead",   desc:"Channel Divinity vs undead", max:1, type:"charge" },
    { id:"healing_word",  name:"Healing Word",  desc:"Heal 1d4+3 HP",             max:2, type:"charge" },
  ],
};

// Build default ability state from class
function defaultAbilities(cls) {
  const abs = {};
  (CLASS_ABILITIES[cls]||[]).forEach(a => {
    abs[a.id] = a.type === "toggle" ? { active: false } : { current: a.max, max: a.max };
  });
  return abs;
}

const HIRELINGS = {
  marta: { id:"marta", name:"Marta Ironhand", role:"Fighter",  emoji:"⚔️", hp:12, maxHp:12, ac:16, cost:3, personality:"Loyal. Blunt. Never retreats.", quote:"\"I've seen worse.\"",     color:"#4a7a3a" },
  selik: { id:"selik", name:"Selik the Pale",  role:"Wizard",   emoji:"🔮", hp:6,  maxHp:6,  ac:11, cost:4, personality:"Cowardly but brilliant. Sarcastic.", quote:"\"I didn't sign up to die in a hole.\"", color:"#4a5a8a" },
  prael: { id:"prael", name:"Prael",           role:"Rogue",    emoji:"🗡️", hp:9,  maxHp:9,  ac:14, cost:5, personality:"Mysterious. Secret agenda. Speaks rarely.", quote:"\"Interesting.\"", color:"#8a3a5a" },
};

const BACKSTORIES = {
  Fighter: [
    { id:"soldier",    name:"Veteran Soldier",    bonus:"+2 max HP",         desc:"You served in a company for seven years. War taught you to take hits.",         apply: s=>({...s, hp:s.hp+2, maxHp:s.maxHp+2}) },
    { id:"blacksmith", name:"Blacksmith's Son",   bonus:"+3 gold",           desc:"You grew up at the forge. You know the value of good steel — and coin.",         apply: s=>({...s, gold:s.gold+3}) },
    { id:"bodyguard",  name:"Disgraced Bodyguard",bonus:"+1 AC",             desc:"You failed to protect someone important. You will not fail again.",               apply: s=>({...s, ac:s.ac+1}) },
    { id:"gladiator",  name:"Pit Gladiator",      bonus:"Second Wind x2",    desc:"The crowd wanted blood. You learned to outlast anything.",                        apply: s=>({...s, abilities:{...s.abilities, second_wind:{current:2,max:2}}}) },
  ],
  Rogue: [
    { id:"thief",      name:"City Thief",         bonus:"+4 gold",           desc:"You lifted purses before you could read. Old habits.",                            apply: s=>({...s, gold:s.gold+4}) },
    { id:"spy",        name:"Former Spy",         bonus:"+1 to Stealth",     desc:"You worked for someone powerful. You still aren't sure for whom.",               apply: s=>({...s, spyBonus:true}) },
    { id:"assassin",   name:"Reluctant Assassin", bonus:"Sneak Attack +1d6 once", desc:"You did one job. One. You're still paying for it.",                         apply: s=>({...s, abilities:{...s.abilities, sneak_attack:{active:false, bonusCharge:1}}}) },
    { id:"smuggler",   name:"Smuggler",           bonus:"+Rope, +1 ration",  desc:"You know every back road in the lowlands. Most of them, anyway.",               apply: s=>({...s, inventory:[...s.inventory,"Rope (50ft)"], rations:s.rations+1}) },
  ],
  Wizard: [
    { id:"scholar",    name:"Academy Scholar",    bonus:"+1 Spell Slot",     desc:"You studied until the ink ran out. Then you found more ink.",                    apply: s=>({...s, abilities:{...s.abilities, spell_slots:{current:3,max:3}}}) },
    { id:"hedge",      name:"Hedge Witch",        bonus:"+Antitoxin",        desc:"You learned from an old woman in the woods. She knew more than any academy.",   apply: s=>({...s, inventory:[...s.inventory,"Antitoxin"]}) },
    { id:"arcanist",   name:"Forbidden Arcanist", bonus:"+2 gold, dark secret", desc:"You read something you shouldn't have. The knowledge cost you everything.",   apply: s=>({...s, gold:s.gold+2}) },
    { id:"hermit",     name:"Mountain Hermit",    bonus:"+Survival expertise",desc:"You lived alone in high places. The cold does not frighten you.",               apply: s=>({...s, coldResist:true}) },
  ],
  Cleric: [
    { id:"pilgrim",    name:"Wandering Pilgrim",  bonus:"+Healing Word x3",  desc:"The road is your temple. You have healed many strangers.",                       apply: s=>({...s, abilities:{...s.abilities, healing_word:{current:3,max:3}}}) },
    { id:"inquisitor", name:"Former Inquisitor",  bonus:"+1 Turn Undead",    desc:"You hunted darkness for the church. The church hunts you now.",                  apply: s=>({...s, abilities:{...s.abilities, turn_undead:{current:2,max:2}}}) },
    { id:"militia",    name:"Town Militia Cleric",bonus:"+2 max HP, +mace",  desc:"You were healer and soldier both. Small town, big threats.",                    apply: s=>({...s, hp:s.hp+2, maxHp:s.maxHp+2}) },
    { id:"fallen",     name:"Fallen Cleric",      bonus:"+3 gold (sold relics)", desc:"You lost your faith but kept your training. The gods haven't noticed yet.",  apply: s=>({...s, gold:s.gold+3}) },
  ],
};

const WEATHER_FORECASTS = [
  "Clear skies tonight. Cold, but manageable.",
  "Snow by midnight. Roads will be hard.",
  "Blizzard warning — Gorn's nailing the shutters.",
  "Calm now. Don't trust it.",
  "Visibility near zero past the tree line.",
];




// ── Character Portraits (160×200 detailed SVGs) ──────────────────────────────
const PORTRAITS = {
  Fighter: (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#0e0c0a"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#c8982a" stroke-width="2"/>
<!-- Background stone wall -->
<rect x="0" y="120" width="160" height="80" fill="#1a1410"/>
<rect x="0" y="0" width="160" height="120" fill="#100e0c"/>
<line x1="0" y1="80" x2="160" y2="80" stroke="#1e1a14" stroke-width="1"/>
<!-- Torchlight glow -->
<ellipse cx="80" cy="90" rx="50" ry="60" fill="#c8982a" opacity="0.06"/>
<!-- Armour body -->
<rect x="42" y="110" width="76" height="75" rx="4" fill="#4a5a70"/>
<rect x="42" y="110" width="76" height="12" rx="2" fill="#6a7a90"/>
<!-- Pauldrons -->
<ellipse cx="42" cy="110" rx="16" ry="10" fill="#5a6a80"/>
<ellipse cx="118" cy="110" rx="16" ry="10" fill="#5a6a80"/>
<!-- Arms -->
<rect x="20" y="108" width="24" height="52" rx="8" fill="#5a6a80"/>
<rect x="116" y="108" width="24" height="52" rx="8" fill="#5a6a80"/>
<!-- Gauntlets -->
<rect x="18" y="152" width="28" height="18" rx="4" fill="#4a5a70"/>
<rect x="114" y="152" width="28" height="18" rx="4" fill="#4a5a70"/>
<!-- Sword in right hand -->
<rect x="140" y="115" width="6" height="68" rx="2" fill="#d0d8e0"/>
<rect x="134" y="155" width="18" height="5" rx="1" fill="#c8982a"/>
<polygon points="143,115 140,125 146,125" fill="#e0e8f0"/>
<!-- Chest detail -->
<rect x="60" y="122" width="40" height="30" rx="2" fill="#3a4a60"/>
<path d="M70 132 L80 122 L90 132 L80 142 Z" fill="#5a6a80" stroke="#7a8aa0" stroke-width="1"/>
<!-- Neck -->
<rect x="68" y="94" width="24" height="18" rx="3" fill="#c8a878"/>
<!-- Head -->
<ellipse cx="80" cy="70" rx="28" ry="30" fill="#c8a878"/>
<!-- Helmet -->
<path d="M52 64 Q52 38 80 36 Q108 38 108 64" fill="#5a6a80"/>
<rect x="56" y="60" width="48" height="8" fill="#6a7a90"/>
<path d="M68 62 L72 58 L76 62" fill="#4a5a70"/>
<path d="M84 62 L88 58 L92 62" fill="#4a5a70"/>
<!-- Face -->
<ellipse cx="70" cy="70" rx="5" ry="5.5" fill="#e8d8b8"/>
<ellipse cx="90" cy="70" rx="5" ry="5.5" fill="#e8d8b8"/>
<ellipse cx="70" cy="69" rx="3" ry="3.5" fill="#2a1a0a"/>
<ellipse cx="90" cy="69" rx="3" ry="3.5" fill="#2a1a0a"/>
<circle cx="71" cy="68" r="1.2" fill="white" opacity="0.8"/>
<circle cx="91" cy="68" r="1.2" fill="white" opacity="0.8"/>
<rect x="68" y="80" width="24" height="3" rx="1" fill="#a07848"/>
<path d="M72 83 L80 86 L88 83" stroke="#9a6838" stroke-width="1.5" fill="none"/>
<!-- Scar -->
<path d="M62 66 L67 72" stroke="#a07050" stroke-width="1.5" opacity="0.7"/>
<!-- Beard stubble -->
<ellipse cx="80" cy="88" rx="14" ry="8" fill="#a07848" opacity="0.3"/>
</svg>`,

  Rogue: (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#0a0c0e"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#c8982a" stroke-width="2"/>
<rect x="0" y="0" width="160" height="200" fill="#0c0a10"/>
<ellipse cx="80" cy="100" rx="40" ry="60" fill="#8060a0" opacity="0.04"/>
<!-- Dark cloak body -->
<path d="M30 185 L38 110 Q80 100 122 110 L130 185 Z" fill="#1a1a28"/>
<path d="M30 185 L38 110 Q60 105 80 108" fill="#14141e"/>
<!-- Cloak hood shadow -->
<ellipse cx="80" cy="95" rx="46" ry="36" fill="#141420"/>
<!-- Arms with bracers -->
<path d="M18 120 Q30 108 42 118 L40 170 Q28 175 18 165 Z" fill="#1a1a28"/>
<path d="M142 120 Q130 108 118 118 L120 170 Q132 175 142 165 Z" fill="#1a1a28"/>
<rect x="20" y="150" width="22" height="14" rx="3" fill="#3a2a10" stroke="#8a6020" stroke-width="1"/>
<rect x="118" y="150" width="22" height="14" rx="3" fill="#3a2a10" stroke="#8a6020" stroke-width="1"/>
<!-- Daggers -->
<rect x="12" y="130" width="4" height="30" rx="1" fill="#c0c8d0"/>
<polygon points="14,130 12,118 16,118" fill="#d8e0e8"/>
<rect x="10" y="156" width="8" height="3" rx="1" fill="#8a6020"/>
<rect x="144" y="130" width="4" height="30" rx="1" fill="#c0c8d0"/>
<polygon points="146,130 144,118 148,118" fill="#d8e0e8"/>
<rect x="142" y="156" width="8" height="3" rx="1" fill="#8a6020"/>
<!-- Hood -->
<path d="M34 72 Q34 40 80 36 Q126 40 126 72 Q126 90 116 98 Q100 108 80 108 Q60 108 44 98 Q34 90 34 72 Z" fill="#1e1e30"/>
<path d="M38 70 Q38 46 80 42 Q122 46 122 70" fill="#2a2a40"/>
<!-- Shadow inside hood -->
<ellipse cx="80" cy="78" rx="32" ry="28" fill="#0e0e18"/>
<!-- Face emerging from shadow -->
<ellipse cx="80" cy="76" rx="22" ry="24" fill="#b89060"/>
<!-- Eyes — sharp and alert -->
<ellipse cx="70" cy="72" rx="6" ry="5" fill="#0a0a14"/>
<ellipse cx="90" cy="72" rx="6" ry="5" fill="#0a0a14"/>
<ellipse cx="70" cy="72" rx="3.5" ry="3.5" fill="#1a3060"/>
<ellipse cx="90" cy="72" rx="3.5" ry="3.5" fill="#1a3060"/>
<circle cx="72" cy="71" r="1.5" fill="white" opacity="0.9"/>
<circle cx="92" cy="71" r="1.5" fill="white" opacity="0.9"/>
<!-- Eyebrows angled -->
<path d="M64 66 L76 68" stroke="#7a5030" stroke-width="2" stroke-linecap="round"/>
<path d="M84 68 L96 66" stroke="#7a5030" stroke-width="2" stroke-linecap="round"/>
<!-- Mouth — slight smirk -->
<path d="M74 84 Q80 87 86 83" stroke="#9a6040" stroke-width="1.5" fill="none"/>
<!-- Scar across cheek -->
<path d="M88 76 L96 82" stroke="#8a5038" stroke-width="1.5" opacity="0.8"/>
<!-- Thieves guild mark on neck -->
<path d="M77 94 L80 88 L83 94" stroke="#6040a0" stroke-width="1.2" fill="none" opacity="0.6"/>
</svg>`,

  Wizard: (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#08080e"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#c8982a" stroke-width="2"/>
<rect x="0" y="0" width="160" height="200" fill="#0a0812"/>
<!-- Arcane glow -->
<ellipse cx="80" cy="100" rx="55" ry="70" fill="#4030a0" opacity="0.07"/>
<ellipse cx="116" cy="76" rx="18" ry="18" fill="#8060e0" opacity="0.12"/>
<!-- Robe -->
<path d="M28 190 L40 108 Q80 96 120 108 L132 190 Z" fill="#2a2060"/>
<path d="M28 190 L40 108 Q60 102 80 104" fill="#1e1848"/>
<!-- Arcane trim on robe -->
<path d="M40 108 Q80 96 120 108" stroke="#6050b0" stroke-width="1.5" fill="none"/>
<path d="M32 150 Q80 140 128 150" stroke="#4030a0" stroke-width="1" fill="none" opacity="0.6"/>
<path d="M29 170 Q80 162 131 170" stroke="#4030a0" stroke-width="1" fill="none" opacity="0.4"/>
<!-- Rune symbols on robe -->
<text x="64" y="148" fill="#6050c0" font-size="14" font-family="serif" opacity="0.7">✦</text>
<text x="82" y="165" fill="#6050c0" font-size="10" font-family="serif" opacity="0.5">⬡</text>
<!-- Arms -->
<path d="M16 120 Q28 106 42 116 L38 175 Q24 178 14 168 Z" fill="#2a2060"/>
<path d="M144 120 Q132 106 118 116 L122 175 Q136 178 146 168 Z" fill="#2a2060"/>
<!-- Staff in left hand -->
<rect x="10" y="90" width="6" height="100" rx="2" fill="#5a3a20"/>
<ellipse cx="13" cy="90" rx="8" ry="8" fill="#1a1428" stroke="#8060e0" stroke-width="2"/>
<ellipse cx="13" cy="90" rx="4" ry="4" fill="#c0a0f0" opacity="0.9"/>
<line x1="13" y1="82" x2="13" y2="72" stroke="#8060e0" stroke-width="1.5"/>
<circle cx="13" cy="70" r="4" fill="#e0c0ff" opacity="0.8"/>
<!-- Orb glow -->
<circle cx="13" cy="90" r="10" fill="#8060e0" opacity="0.15"/>
<!-- Neck & head -->
<rect x="68" y="94" width="24" height="16" rx="4" fill="#d0c090"/>
<!-- Pointed hat -->
<polygon points="80,14 48,68 112,68" fill="#1e1848"/>
<polygon points="80,14 52,66 80,62" fill="#16143a"/>
<!-- Hat band -->
<rect x="48" y="64" width="64" height="8" rx="2" fill="#4030a0"/>
<text x="62" y="72" fill="#c8982a" font-size="10" font-family="serif" opacity="0.8">✦ ✦ ✦</text>
<!-- Head -->
<ellipse cx="80" cy="86" rx="24" ry="22" fill="#d0c090"/>
<!-- Long beard -->
<path d="M62 96 Q58 115 60 130 Q70 140 80 135 Q90 140 100 130 Q102 115 98 96" fill="#c8b878" opacity="0.7"/>
<path d="M68 96 Q65 112 67 124" stroke="#b0a060" stroke-width="1.5" fill="none"/>
<path d="M80 96 Q80 116 80 130" stroke="#b0a060" stroke-width="1.5" fill="none"/>
<path d="M92 96 Q95 112 93 124" stroke="#b0a060" stroke-width="1.5" fill="none"/>
<!-- Eyes -->
<ellipse cx="70" cy="84" rx="5.5" ry="5" fill="#0e1428"/>
<ellipse cx="90" cy="84" rx="5.5" ry="5" fill="#0e1428"/>
<ellipse cx="70" cy="84" rx="3" ry="3" fill="#4030a0"/>
<ellipse cx="90" cy="84" rx="3" ry="3" fill="#4030a0"/>
<circle cx="71.5" cy="83" r="1.2" fill="white" opacity="0.9"/>
<circle cx="91.5" cy="83" r="1.2" fill="white" opacity="0.9"/>
<!-- Bushy eyebrows -->
<path d="M63 78 Q70 75 77 78" stroke="#c0b070" stroke-width="3" stroke-linecap="round"/>
<path d="M83 78 Q90 75 97 78" stroke="#c0b070" stroke-width="3" stroke-linecap="round"/>
<!-- Nose -->
<path d="M78 88 Q75 94 78 96 Q80 97 82 96 Q85 94 82 88" stroke="#b09060" stroke-width="1" fill="none"/>
<!-- Mouth -->
<path d="M72 100 Q80 104 88 100" stroke="#9a7840" stroke-width="1.5" fill="none"/>
</svg>`,

  Cleric: (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#0c0c0e"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#c8982a" stroke-width="2"/>
<rect x="0" y="0" width="160" height="200" fill="#0c0e0c"/>
<!-- Divine glow -->
<ellipse cx="80" cy="80" rx="50" ry="55" fill="#f0e060" opacity="0.05"/>
<!-- White robe -->
<path d="M30 190 L42 110 Q80 100 118 110 L130 190 Z" fill="#d8d0c0"/>
<path d="M30 190 L42 110 Q60 106 80 108" fill="#c8c0b0"/>
<!-- Holy symbol sash -->
<rect x="68" y="110" width="24" height="68" fill="#c8a030"/>
<rect x="42" y="140" width="76" height="18" fill="#c8a030"/>
<!-- Cross detail on sash -->
<rect x="76" y="116" width="8" height="36" fill="#f0d060"/>
<rect x="60" y="130" width="40" height="8" fill="#f0d060"/>
<!-- Arms in sleeves -->
<path d="M16 115 Q30 106 44 118 L40 175 Q26 180 16 170 Z" fill="#d8d0c0"/>
<path d="M144 115 Q130 106 116 118 L120 175 Q134 180 144 170 Z" fill="#d8d0c0"/>
<!-- Mace in right hand -->
<rect x="136" y="140" width="6" height="50" rx="2" fill="#7a5a30"/>
<ellipse cx="139" cy="138" rx="12" ry="10" fill="#7a7080"/>
<ellipse cx="139" cy="138" rx="8" ry="7" fill="#8a8090"/>
<!-- Holy symbol held left -->
<circle cx="24" cy="140" r="14" fill="none" stroke="#f0d060" stroke-width="2"/>
<rect x="22" y="128" width="4" height="24" fill="#f0d060"/>
<rect x="16" y="138" width="16" height="4" fill="#f0d060"/>
<!-- Head veil/coif -->
<rect x="68" y="94" width="24" height="16" rx="2" fill="#c8a878"/>
<path d="M50 86 Q50 56 80 52 Q110 56 110 86 L108 100 Q90 110 80 110 Q70 110 52 100 Z" fill="#e8e0d0"/>
<path d="M52 86 Q52 60 80 56 Q108 60 108 86" fill="#d8d0c0"/>
<!-- Head -->
<ellipse cx="80" cy="78" rx="24" ry="24" fill="#d0b888"/>
<!-- Eyes -->
<ellipse cx="70" cy="74" rx="5" ry="5" fill="#0a0c08"/>
<ellipse cx="90" cy="74" rx="5" ry="5" fill="#0a0c08"/>
<ellipse cx="70" cy="74" rx="2.8" ry="3" fill="#2a5020"/>
<ellipse cx="90" cy="74" rx="2.8" ry="3" fill="#2a5020"/>
<circle cx="71.5" cy="73" r="1.2" fill="white" opacity="0.9"/>
<circle cx="91.5" cy="73" r="1.2" fill="white" opacity="0.9"/>
<!-- Gentle eyebrows -->
<path d="M64 68 Q70 65 76 68" stroke="#a08040" stroke-width="1.8" stroke-linecap="round"/>
<path d="M84 68 Q90 65 96 68" stroke="#a08040" stroke-width="1.8" stroke-linecap="round"/>
<!-- Serene mouth -->
<path d="M73 86 Q80 90 87 86" stroke="#b08050" stroke-width="1.5" fill="none"/>
<!-- Divine halo faint -->
<circle cx="80" cy="70" r="32" fill="none" stroke="#f0d060" stroke-width="1" opacity="0.25"/>
<circle cx="80" cy="70" r="34" fill="none" stroke="#f0d060" stroke-width="0.5" opacity="0.12"/>
</svg>`,

  Valdris: (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#0e0c0a"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#c8982a" stroke-width="2"/>
<rect x="0" y="0" width="160" height="200" fill="#100e0c"/>
<!-- Firelight warmth -->
<ellipse cx="60" cy="150" rx="50" ry="40" fill="#c8601a" opacity="0.06"/>
<!-- Heavy weathered coat -->
<path d="M24 192 L36 106 Q80 92 124 106 L136 192 Z" fill="#3a2c1e"/>
<path d="M24 192 L36 106 Q56 100 80 102" fill="#2a1e12"/>
<!-- Coat details — worn fur trim -->
<path d="M36 106 Q80 92 124 106" stroke="#5a4020" stroke-width="3" fill="none"/>
<path d="M30 148 Q80 138 130 148" stroke="#5a4020" stroke-width="1.5" fill="none" opacity="0.5"/>
<!-- LEFT arm — full arm with coat sleeve -->
<path d="M14 108 Q26 96 44 108 L42 168 Q28 174 14 164 Z" fill="#3a2c1e"/>
<!-- RIGHT arm — stub/hook arm -->
<path d="M146 108 Q134 96 116 108 L118 158" stroke="#3a2c1e" stroke-width="20" stroke-linecap="round" fill="none"/>
<!-- HOOK - the defining feature -->
<path d="M118 155 Q122 162 128 168 Q134 172 138 166 Q142 160 136 154 Q130 148 124 152" stroke="#9090a0" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M118 155 L116 148" stroke="#7a7a8a" stroke-width="4" stroke-linecap="round"/>
<!-- Hook gleam -->
<path d="M126 152 L130 148" stroke="white" stroke-width="1.5" opacity="0.4"/>
<!-- Neck -->
<rect x="66" y="90" width="28" height="18" rx="3" fill="#b07848"/>
<!-- Head — weathered hunter face -->
<ellipse cx="80" cy="66" rx="28" ry="30" fill="#b07848"/>
<!-- Rougher skin texture -->
<ellipse cx="68" cy="58" rx="8" ry="5" fill="#a06838" opacity="0.3"/>
<ellipse cx="96" cy="62" rx="6" ry="4" fill="#a06838" opacity="0.2"/>
<!-- Short grey-brown hair, receding -->
<path d="M52 56 Q52 34 80 30 Q108 34 108 56" fill="#5a4828"/>
<path d="M52 56 Q50 48 54 40" stroke="#4a3818" stroke-width="3" fill="none"/>
<path d="M108 56 Q110 48 106 40" stroke="#4a3818" stroke-width="3" fill="none"/>
<!-- Grey temples -->
<ellipse cx="54" cy="52" rx="8" ry="6" fill="#8a7860" opacity="0.5"/>
<ellipse cx="106" cy="52" rx="8" ry="6" fill="#8a7860" opacity="0.5"/>
<!-- Deep-set eyes — watchful -->
<rect x="56" y="60" width="18" height="12" rx="3" fill="#0e0c08" opacity="0.4"/>
<rect x="86" y="60" width="18" height="12" rx="3" fill="#0e0c08" opacity="0.4"/>
<ellipse cx="65" cy="66" rx="6" ry="5.5" fill="#0e0c0a"/>
<ellipse cx="95" cy="66" rx="6" ry="5.5" fill="#0e0c0a"/>
<ellipse cx="65" cy="66" rx="3.5" ry="3.5" fill="#3a3020"/>
<ellipse cx="95" cy="66" rx="3.5" ry="3.5" fill="#3a3020"/>
<circle cx="66.5" cy="65" r="1.3" fill="white" opacity="0.8"/>
<circle cx="96.5" cy="65" r="1.3" fill="white" opacity="0.8"/>
<!-- Crow's feet -->
<path d="M71 63 L75 60" stroke="#8a6040" stroke-width="0.8" opacity="0.5"/>
<path d="M72 66 L76 65" stroke="#8a6040" stroke-width="0.8" opacity="0.5"/>
<path d="M89 63 L85 60" stroke="#8a6040" stroke-width="0.8" opacity="0.5"/>
<path d="M88 66 L84 65" stroke="#8a6040" stroke-width="0.8" opacity="0.5"/>
<!-- Heavy brow -->
<path d="M58 59 Q65 55 72 59" stroke="#4a2a10" stroke-width="3" stroke-linecap="round"/>
<path d="M88 59 Q95 55 102 59" stroke="#4a2a10" stroke-width="3" stroke-linecap="round"/>
<!-- Stubble beard -->
<ellipse cx="80" cy="82" rx="18" ry="12" fill="#7a5830" opacity="0.35"/>
<path d="M64 78 L66 84" stroke="#6a4820" stroke-width="0.8" opacity="0.4"/>
<path d="M70 76 L71 84" stroke="#6a4820" stroke-width="0.8" opacity="0.4"/>
<path d="M80 76 L80 86" stroke="#6a4820" stroke-width="0.8" opacity="0.4"/>
<path d="M90 76 L89 84" stroke="#6a4820" stroke-width="0.8" opacity="0.4"/>
<path d="M96 78 L94 84" stroke="#6a4820" stroke-width="0.8" opacity="0.4"/>
<!-- Firm, closed mouth -->
<path d="M68 82 L92 82" stroke="#8a5830" stroke-width="2" fill="none"/>
<!-- Blizzard scar across cheek — the thing that took his arm -->
<path d="M56 70 Q62 75 68 72" stroke="#c07050" stroke-width="2" opacity="0.7"/>
<!-- Collar of coat up high -->
<path d="M52 90 Q66 86 80 88 Q94 86 108 90" stroke="#4a3020" stroke-width="4" fill="none"/>
</svg>`,

  Gorn: (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#0c0a08"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#c8982a" stroke-width="2"/>
<!-- Tavern background -->
<rect x="0" y="120" width="160" height="80" fill="#1a1208"/>
<rect x="0" y="0" width="160" height="120" fill="#140e08"/>
<rect x="0" y="110" width="160" height="15" fill="#2a1a0c" opacity="0.8"/>
<!-- Bar counter edge -->
<rect x="0" y="118" width="160" height="8" fill="#3a2010"/>
<!-- Apron -->
<rect x="45" y="108" width="70" height="80" rx="2" fill="#8a6040"/>
<rect x="52" y="108" width="56" height="12" fill="#7a5030"/>
<!-- Shirt -->
<rect x="32" y="100" width="96" height="90" rx="4" fill="#4a3820"/>
<!-- Arms on counter -->
<path d="M14 130 Q26 108 46 118 L48 148 Q36 155 18 148 Z" fill="#4a3820"/>
<path d="M146 130 Q134 108 114 118 L112 148 Q124 155 142 148 Z" fill="#4a3820"/>
<!-- Thick dwarf forearms -->
<rect x="10" y="146" width="38" height="16" rx="6" fill="#a07848"/>
<rect x="112" y="146" width="38" height="16" rx="6" fill="#a07848"/>
<!-- Tankard in right hand -->
<rect x="116" y="120" width="26" height="32" rx="3" fill="#8a6020"/>
<rect x="116" y="118" width="26" height="6" rx="1" fill="#a07828"/>
<path d="M142 128 Q150 128 150 136 Q150 144 142 144" stroke="#8a6020" stroke-width="3" fill="none"/>
<!-- Liquid in tankard -->
<ellipse cx="129" cy="122" rx="10" ry="3" fill="#c8901a" opacity="0.7"/>
<!-- Neck -->
<rect x="64" y="88" width="32" height="20" rx="4" fill="#b07848"/>
<!-- Head — wide dwarf face -->
<ellipse cx="80" cy="68" rx="34" ry="30" fill="#b07848"/>
<!-- Messy hair -->
<path d="M46 56 Q48 36 80 32 Q112 36 114 56" fill="#4a3020"/>
<path d="M46 56 Q44 44 50 36" stroke="#3a2818" stroke-width="3" fill="none"/>
<path d="M114 56 Q116 44 110 36" stroke="#3a2818" stroke-width="3" fill="none"/>
<!-- One good eye -->
<ellipse cx="66" cy="66" rx="7" ry="6.5" fill="#e8e0d0"/>
<ellipse cx="66" cy="66" rx="4" ry="4" fill="#2a1810"/>
<circle cx="67.5" cy="65" r="1.5" fill="white" opacity="0.9"/>
<!-- Milky eye (injury) -->
<ellipse cx="94" cy="66" rx="7" ry="6.5" fill="#d0d0d0"/>
<ellipse cx="94" cy="66" rx="4" ry="4" fill="#c0c4c0" opacity="0.5"/>
<circle cx="94" cy="66" r="2" fill="white" opacity="0.3"/>
<!-- Scar across milky eye -->
<path d="M88 60 L100 72" stroke="#7a3020" stroke-width="2.5" opacity="0.8"/>
<!-- Heavy brow -->
<path d="M58 58 Q66 54 74 58" stroke="#4a2818" stroke-width="4" stroke-linecap="round"/>
<path d="M86 58 Q94 54 102 58" stroke="#4a2818" stroke-width="4" stroke-linecap="round"/>
<!-- Bulbous nose -->
<ellipse cx="80" cy="76" rx="8" ry="7" fill="#a06838"/>
<circle cx="76" cy="78" r="2" fill="#904828" opacity="0.5"/>
<circle cx="84" cy="78" r="2" fill="#904828" opacity="0.5"/>
<!-- Broad mouth / scowl -->
<path d="M64 86 Q80 82 96 86" stroke="#7a4828" stroke-width="2.5" fill="none"/>
<!-- Grey beard — thick dwarf beard -->
<path d="M46 80 Q44 100 48 120 Q60 136 80 132 Q100 136 112 120 Q116 100 114 80" fill="#8a8070" opacity="0.9"/>
<path d="M50 82 Q52 98 54 112" stroke="#6a6050" stroke-width="2" fill="none"/>
<path d="M70 84 Q68 104 70 120" stroke="#6a6050" stroke-width="2" fill="none"/>
<path d="M80 84 Q80 106 80 124" stroke="#6a6050" stroke-width="2" fill="none"/>
<path d="M90 84 Q92 104 90 120" stroke="#6a6050" stroke-width="2" fill="none"/>
<path d="M110 82 Q108 98 106 112" stroke="#6a6050" stroke-width="2" fill="none"/>
</svg>`,

  Mira: (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#0c080e"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#c8982a" stroke-width="2"/>
<!-- Warm candlelit tavern bg -->
<rect x="0" y="0" width="160" height="200" fill="#100a0c"/>
<ellipse cx="80" cy="100" rx="60" ry="70" fill="#c8982a" opacity="0.05"/>
<!-- Dress / bodice -->
<path d="M28 192 L40 108 Q80 96 120 108 L132 192 Z" fill="#7a2848"/>
<path d="M28 192 L40 108 Q58 103 80 106" fill="#6a1e3a"/>
<!-- Dress trim -->
<path d="M40 108 Q80 96 120 108" stroke="#c8982a" stroke-width="1.5" fill="none"/>
<path d="M34 150 Q80 140 126 150" stroke="#c8982a" stroke-width="1" fill="none" opacity="0.5"/>
<!-- Arms -->
<path d="M16 118 Q28 106 44 118 L42 172 Q28 178 16 168 Z" fill="#c8a878"/>
<path d="M144 118 Q132 106 116 118 L118 172 Q132 178 144 168 Z" fill="#c8a878"/>
<!-- Jewelled bracelet -->
<rect x="16" y="155" width="28" height="7" rx="3" fill="#3a1830" stroke="#c8982a" stroke-width="1"/>
<circle cx="20" cy="158" r="2" fill="#e060a0"/>
<circle cx="28" cy="158" r="2" fill="#c8982a"/>
<circle cx="36" cy="158" r="2" fill="#e060a0"/>
<!-- Right hand resting -->
<ellipse cx="120" cy="170" rx="12" ry="8" fill="#c8a878"/>
<!-- Neck -->
<rect x="66" y="92" width="28" height="18" rx="4" fill="#d4a070"/>
<!-- Necklace -->
<path d="M60 100 Q80 112 100 100" stroke="#c8982a" stroke-width="1.5" fill="none"/>
<circle cx="80" cy="112" r="4" fill="#c8982a"/>
<circle cx="80" cy="112" r="2" fill="#f0d070"/>
<!-- Head -->
<ellipse cx="80" cy="70" rx="28" ry="30" fill="#d4a070"/>
<!-- Dark flowing hair -->
<path d="M52 62 Q48 36 80 30 Q112 36 108 62" fill="#1a0e08"/>
<path d="M52 62 Q44 78 46 100 Q52 116 58 120" fill="#1a0e08"/>
<path d="M108 62 Q116 78 114 100 Q108 116 102 120" fill="#1a0e08"/>
<!-- Hair highlights -->
<path d="M56 50 Q60 40 68 36" stroke="#3a2010" stroke-width="2" opacity="0.6"/>
<path d="M104 50 Q100 40 92 36" stroke="#3a2010" stroke-width="2" opacity="0.6"/>
<!-- Eyes — dark and sharp -->
<ellipse cx="68" cy="66" rx="7" ry="6" fill="#0e0810"/>
<ellipse cx="92" cy="66" rx="7" ry="6" fill="#0e0810"/>
<ellipse cx="68" cy="66" rx="4" ry="4" fill="#1a0e20"/>
<ellipse cx="92" cy="66" rx="4" ry="4" fill="#1a0e20"/>
<circle cx="70" cy="65" r="1.8" fill="white" opacity="0.9"/>
<circle cx="94" cy="65" r="1.8" fill="white" opacity="0.9"/>
<!-- Eyeshadow -->
<ellipse cx="68" cy="63" rx="8" ry="4" fill="#3a1828" opacity="0.4"/>
<ellipse cx="92" cy="63" rx="8" ry="4" fill="#3a1828" opacity="0.4"/>
<!-- Eyebrows — arched -->
<path d="M60 59 Q68 55 76 60" stroke="#2a1408" stroke-width="2.5" stroke-linecap="round"/>
<path d="M84 60 Q92 55 100 59" stroke="#2a1408" stroke-width="2.5" stroke-linecap="round"/>
<!-- Nose -->
<path d="M77 72 Q74 78 77 80 Q80 81 83 80 Q86 78 83 72" stroke="#b08050" stroke-width="1" fill="none"/>
<!-- Full lips — smiling -->
<path d="M68 88 Q76 93 80 91 Q84 93 92 88" stroke="#c04060" stroke-width="2" fill="none"/>
<path d="M70 88 Q80 84 90 88" stroke="#c04060" stroke-width="1.5" fill="none"/>
<!-- Earring -->
<circle cx="52" cy="72" r="4" fill="#1a0e14" stroke="#c8982a" stroke-width="1.5"/>
<circle cx="52" cy="72" r="2" fill="#c8982a"/>
<rect x="51" y="76" width="2" height="8" fill="#c8982a"/>
<circle cx="52" cy="85" r="3" fill="#e060a0"/>
</svg>`,

  Marta: (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#0e0c0a"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#4a7a3a" stroke-width="2"/>
<rect x="0" y="0" width="160" height="200" fill="#100e0c"/>
<!-- Chain mail body -->
<rect x="36" y="108" width="88" height="80" rx="3" fill="#6a7a8a"/>
<!-- Mail texture lines -->
<path d="M36 118 Q80 115 124 118" stroke="#8a9aaa" stroke-width="0.8" fill="none"/>
<path d="M36 128 Q80 125 124 128" stroke="#8a9aaa" stroke-width="0.8" fill="none"/>
<path d="M36 138 Q80 135 124 138" stroke="#8a9aaa" stroke-width="0.8" fill="none"/>
<path d="M36 148 Q80 145 124 148" stroke="#8a9aaa" stroke-width="0.8" fill="none"/>
<!-- Pauldrons -->
<ellipse cx="36" cy="110" rx="20" ry="12" fill="#7a8a9a"/>
<ellipse cx="124" cy="110" rx="20" ry="12" fill="#7a8a9a"/>
<!-- Arms — thick -->
<rect x="10" y="106" width="28" height="60" rx="10" fill="#7a8a9a"/>
<rect x="122" y="106" width="28" height="60" rx="10" fill="#7a8a9a"/>
<rect x="8" y="158" width="32" height="16" rx="5" fill="#5a6a7a"/>
<rect x="120" y="158" width="32" height="16" rx="5" fill="#5a6a7a"/>
<!-- War axe -->
<rect x="134" y="86" width="7" height="90" rx="2" fill="#6a4a20"/>
<path d="M134 92 Q120 78 118 100 Q134 98 134 92 Z" fill="#9090a0"/>
<path d="M141 92 Q155 78 157 100 Q141 98 141 92 Z" fill="#8080a0"/>
<rect x="130" y="108" width="18" height="5" rx="1" fill="#c8982a"/>
<!-- Neck -->
<rect x="66" y="92" width="28" height="18" rx="4" fill="#b07848"/>
<!-- Head — stern face -->
<ellipse cx="80" cy="68" rx="28" ry="28" fill="#b07848"/>
<!-- Dwarf braided hair -->
<path d="M52 58 Q52 34 80 30 Q108 34 108 58" fill="#5a3820"/>
<path d="M52 58 Q48 72 50 88" fill="#5a3820"/>
<path d="M108 58 Q112 72 110 88" fill="#5a3820"/>
<!-- Braids down sides -->
<path d="M52 60 Q46 76 48 92 Q54 100 58 96" stroke="#4a2818" stroke-width="4" fill="none"/>
<path d="M108 60 Q114 76 112 92 Q106 100 102 96" stroke="#4a2818" stroke-width="4" fill="none"/>
<!-- Eyes — determined -->
<ellipse cx="68" cy="66" rx="6" ry="5.5" fill="#0a0c08"/>
<ellipse cx="92" cy="66" rx="6" ry="5.5" fill="#0a0c08"/>
<ellipse cx="68" cy="66" rx="3.2" ry="3" fill="#2a4020"/>
<ellipse cx="92" cy="66" rx="3.2" ry="3" fill="#2a4020"/>
<circle cx="69.5" cy="65" r="1.3" fill="white" opacity="0.9"/>
<circle cx="93.5" cy="65" r="1.3" fill="white" opacity="0.9"/>
<!-- Stern brow -->
<path d="M61 59 Q68 56 75 60" stroke="#3a1a0a" stroke-width="3.5" stroke-linecap="round"/>
<path d="M85 60 Q92 56 99 59" stroke="#3a1a0a" stroke-width="3.5" stroke-linecap="round"/>
<!-- Battle scar -->
<path d="M62 62 L68 70" stroke="#8a4028" stroke-width="2" opacity="0.8"/>
<!-- Flat nose -->
<ellipse cx="80" cy="74" rx="6" ry="5" fill="#a06030"/>
<!-- Firm mouth -->
<path d="M69 82 L91 82" stroke="#8a5030" stroke-width="2.5" fill="none"/>
<!-- Short beard -->
<path d="M56 80 Q56 96 60 104 Q70 112 80 110 Q90 112 100 104 Q104 96 104 80" fill="#7a5030" opacity="0.6"/>
</svg>`,

  Selik: (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#080810"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#4a5a8a" stroke-width="2"/>
<rect x="0" y="0" width="160" height="200" fill="#0a0c14"/>
<ellipse cx="80" cy="100" rx="50" ry="60" fill="#3040a0" opacity="0.06"/>
<!-- Blue mage robes -->
<path d="M30 192 L42 108 Q80 96 118 108 L130 192 Z" fill="#1e2848"/>
<path d="M30 192 L42 108 Q60 103 80 106" fill="#181e38"/>
<!-- Trim details -->
<path d="M42 108 Q80 96 118 108" stroke="#4050a0" stroke-width="1.5" fill="none"/>
<path d="M36 155 Q80 146 124 155" stroke="#3040a0" stroke-width="1" fill="none" opacity="0.5"/>
<!-- Arms — thin, scholarly -->
<path d="M18 116 Q30 104 44 116 L42 172 Q28 177 18 168 Z" fill="#1e2848"/>
<path d="M142 116 Q130 104 116 116 L118 172 Q132 177 142 168 Z" fill="#1e2848"/>
<!-- Spellbook in left hand -->
<rect x="6" y="130" width="34" height="44" rx="3" fill="#1a1020" stroke="#6050c0" stroke-width="1.5"/>
<rect x="8" y="132" width="30" height="40" rx="2" fill="#0e0818"/>
<!-- Rune on book -->
<text x="16" y="158" fill="#8060e0" font-size="16" font-family="serif">✦</text>
<rect x="6" y="150" width="34" height="3" fill="#6050c0" opacity="0.4"/>
<!-- Orb in right hand -->
<circle cx="140" cy="148" r="14" fill="#0e0c1a" stroke="#8060e0" stroke-width="2"/>
<circle cx="140" cy="148" r="8" fill="#2020a0" opacity="0.5"/>
<circle cx="140" cy="148" r="4" fill="#c0a0f0" opacity="0.8"/>
<circle cx="140" cy="148" r="16" fill="#8060e0" opacity="0.08"/>
<!-- Neck -->
<rect x="66" y="90" width="28" height="18" rx="4" fill="#e8d8b0"/>
<!-- Head — pale and angular -->
<ellipse cx="80" cy="66" rx="26" ry="28" fill="#e0d0a8"/>
<!-- Pale complexion highlight -->
<ellipse cx="80" cy="60" rx="16" ry="12" fill="#f0e8c8" opacity="0.3"/>
<!-- Silver hair swept back -->
<path d="M54 56 Q54 34 80 28 Q106 34 106 56" fill="#d0d0e0"/>
<path d="M54 56 Q50 66 52 78" fill="#d0d0e0"/>
<path d="M106 56 Q110 66 108 78" fill="#d0d0e0"/>
<!-- Hair sheen -->
<path d="M60 44 Q70 36 80 34" stroke="white" stroke-width="1.5" opacity="0.4"/>
<!-- Pointed ears (half-elf) -->
<path d="M54 66 L46 58 L52 54 L56 64" fill="#e0d0a8"/>
<path d="M106 66 L114 58 L108 54 L104 64" fill="#e0d0a8"/>
<!-- Eyes — intense blue -->
<ellipse cx="68" cy="64" rx="6.5" ry="6" fill="#0a0c14"/>
<ellipse cx="92" cy="64" rx="6.5" ry="6" fill="#0a0c14"/>
<ellipse cx="68" cy="64" rx="3.5" ry="3.5" fill="#2040c0"/>
<ellipse cx="92" cy="64" rx="3.5" ry="3.5" fill="#2040c0"/>
<circle cx="69.5" cy="63" r="1.5" fill="white" opacity="0.9"/>
<circle cx="93.5" cy="63" r="1.5" fill="white" opacity="0.9"/>
<!-- Nervous narrow eyebrows -->
<path d="M62 57 Q68 54 74 57" stroke="#b0a888" stroke-width="2" stroke-linecap="round"/>
<path d="M86 57 Q92 54 98 57" stroke="#b0a888" stroke-width="2" stroke-linecap="round"/>
<!-- Thin worried mouth -->
<path d="M71 78 Q80 76 89 78" stroke="#a09050" stroke-width="1.5" fill="none"/>
<!-- Sweat bead (nervous) -->
<circle cx="98" cy="60" r="1.5" fill="#c0d0e0" opacity="0.6"/>
</svg>`,

  Prael: (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#0a060c"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#8a3a8a" stroke-width="2"/>
<rect x="0" y="0" width="160" height="200" fill="#0c0810"/>
<ellipse cx="80" cy="100" rx="45" ry="60" fill="#8020a0" opacity="0.05"/>
<!-- Dark leathers -->
<path d="M28 192 L40 108 Q80 94 120 108 L132 192 Z" fill="#1e1020"/>
<path d="M28 192 L40 108 Q58 101 80 104" fill="#180c1a"/>
<!-- Leather straps -->
<path d="M54 112 Q80 108 106 112" stroke="#3a2030" stroke-width="2" fill="none"/>
<path d="M48 132 Q80 126 112 132" stroke="#3a2030" stroke-width="1.5" fill="none"/>
<!-- Throwing knife bandolier -->
<rect x="46" y="118" width="4" height="18" rx="1" fill="#c0c0d0"/>
<rect x="54" y="116" width="4" height="20" rx="1" fill="#c0c0d0"/>
<rect x="62" y="118" width="4" height="18" rx="1" fill="#c0c0d0"/>
<!-- Arms -->
<path d="M14 116 Q26 104 44 116 L42 172 Q28 178 14 168 Z" fill="#1e1020"/>
<path d="M146 116 Q134 104 116 116 L118 172 Q132 178 146 168 Z" fill="#1e1020"/>
<!-- Main dagger -->
<rect x="136" y="108" width="5" height="64" rx="2" fill="#c8c8d8"/>
<polygon points="138.5,108 135,94 142,94" fill="#d8d8e8"/>
<rect x="132" y="126" width="13" height="4" rx="1" fill="#9060a0"/>
<!-- Neck -->
<rect x="66" y="90" width="28" height="18" rx="4" fill="#c07868"/>
<!-- Head — tiefling features -->
<ellipse cx="80" cy="66" rx="26" ry="28" fill="#c07060"/>
<!-- Horns! -->
<path d="M56 46 Q50 28 54 18 Q58 10 64 20 Q66 30 62 42" fill="#8a2020"/>
<path d="M104 46 Q110 28 106 18 Q102 10 96 20 Q94 30 98 42" fill="#8a2020"/>
<!-- Horn highlights -->
<path d="M58 44 Q54 30 56 20" stroke="#b03030" stroke-width="1.5" opacity="0.5"/>
<path d="M102 44 Q106 30 104 20" stroke="#b03030" stroke-width="1.5" opacity="0.5"/>
<!-- Dark hair -->
<path d="M54 54 Q54 34 80 30 Q106 34 106 54" fill="#0e0810"/>
<!-- Eyes — burning red -->
<ellipse cx="68" cy="64" rx="7" ry="6" fill="#0a0608"/>
<ellipse cx="92" cy="64" rx="7" ry="6" fill="#0a0608"/>
<ellipse cx="68" cy="64" rx="4" ry="3.5" fill="#c02010"/>
<ellipse cx="92" cy="64" rx="4" ry="3.5" fill="#c02010"/>
<!-- Slit pupils -->
<rect x="67" y="61" width="2" height="6" rx="1" fill="#080408"/>
<rect x="91" y="61" width="2" height="6" rx="1" fill="#080408"/>
<circle cx="70" cy="63" r="1.2" fill="#ff4020" opacity="0.6"/>
<circle cx="94" cy="63" r="1.2" fill="#ff4020" opacity="0.6"/>
<!-- Sharp brows -->
<path d="M60 57 Q68 52 76 58" stroke="#0a0808" stroke-width="3" stroke-linecap="round"/>
<path d="M84 58 Q92 52 100 57" stroke="#0a0808" stroke-width="3" stroke-linecap="round"/>
<!-- Enigmatic almost-smile -->
<path d="M71 78 Q80 75 89 78" stroke="#8a4038" stroke-width="1.8" fill="none"/>
<!-- Tail peeking from cloak -->
<path d="M118 175 Q130 165 136 155 Q140 148 136 145 Q132 142 128 148 Q124 155 118 165" stroke="#c07060" stroke-width="3" fill="none"/>
</svg>`,

  Rat: (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#0c0a08"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#6a3020" stroke-width="2"/>
<rect x="0" y="0" width="160" height="200" fill="#0e0c0a"/>
<!-- Stone floor -->
<rect x="0" y="150" width="160" height="50" fill="#1a1410"/>
<!-- Giant rat body -->
<ellipse cx="92" cy="130" rx="54" ry="38" fill="#5a4830"/>
<!-- Haunches -->
<ellipse cx="130" cy="148" rx="26" ry="22" fill="#6a5840"/>
<!-- Head -->
<ellipse cx="46" cy="110" rx="34" ry="28" fill="#5a4830"/>
<!-- Snout -->
<ellipse cx="22" cy="116" rx="18" ry="12" fill="#6a5438"/>
<!-- Nose -->
<ellipse cx="10" cy="118" rx="6" ry="5" fill="#c06080"/>
<circle cx="8" cy="116" r="1.5" fill="#0a0808"/>
<circle cx="12" cy="116" r="1.5" fill="#0a0808"/>
<!-- Whiskers -->
<line x1="10" y1="114" x2="-8" y2="106" stroke="#d0c0a0" stroke-width="1.2" opacity="0.8"/>
<line x1="10" y1="116" x2="-8" y2="116" stroke="#d0c0a0" stroke-width="1.2" opacity="0.8"/>
<line x1="10" y1="118" x2="-8" y2="126" stroke="#d0c0a0" stroke-width="1.2" opacity="0.8"/>
<line x1="10" y1="114" x2="28" y2="100" stroke="#d0c0a0" stroke-width="1" opacity="0.6"/>
<!-- Eyes — beady red -->
<circle cx="36" cy="100" r="7" fill="#0a0808"/>
<circle cx="36" cy="100" r="4" fill="#c02010"/>
<circle cx="37.5" cy="99" r="1.5" fill="white" opacity="0.7"/>
<!-- Ears -->
<ellipse cx="50" cy="82" rx="14" ry="18" fill="#c06068" opacity="0.7"/>
<ellipse cx="50" cy="82" rx="9" ry="12" fill="#a05058" opacity="0.5"/>
<!-- Fur texture -->
<path d="M30 110 Q50 100 70 108" stroke="#4a3820" stroke-width="1.5" fill="none" opacity="0.5"/>
<path d="M60 118 Q90 110 120 118" stroke="#4a3820" stroke-width="1.5" fill="none" opacity="0.5"/>
<path d="M60 128 Q90 122 130 126" stroke="#4a3820" stroke-width="1.5" fill="none" opacity="0.5"/>
<!-- Claws (front) -->
<path d="M30 145 L22 155 L26 158 L32 150" fill="#1a1410"/>
<path d="M40 148 L34 160 L38 162 L44 152" fill="#1a1410"/>
<path d="M50 149 L46 162 L50 163 L54 152" fill="#1a1410"/>
<!-- Tail -->
<path d="M138 155 Q155 140 158 120 Q160 100 152 88" stroke="#5a3828" stroke-width="5" fill="none"/>
<path d="M152 88 Q150 78 148 70" stroke="#5a3828" stroke-width="4" fill="none"/>
<!-- Torn ear detail -->
<path d="M50 72 L46 66 L54 68" stroke="#c06068" stroke-width="1.5" fill="none"/>
</svg>`,

  Skeleton: (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#0a0c0a"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#6a3020" stroke-width="2"/>
<rect x="0" y="0" width="160" height="200" fill="#0c0e0c"/>
<!-- Crypt background -->
<rect x="0" y="140" width="160" height="60" fill="#0e0c08"/>
<!-- Ribcage -->
<ellipse cx="80" cy="122" rx="30" ry="34" fill="none" stroke="#c8c0a8" stroke-width="2"/>
<path d="M56 112 Q50 118 52 126 Q58 132 66 128" stroke="#c8c0a8" stroke-width="2" fill="none"/>
<path d="M56 120 Q48 126 50 134 Q56 140 66 136" stroke="#c8c0a8" stroke-width="2" fill="none"/>
<path d="M56 128 Q48 134 50 142" stroke="#c8c0a8" stroke-width="2" fill="none"/>
<path d="M104 112 Q110 118 108 126 Q102 132 94 128" stroke="#c8c0a8" stroke-width="2" fill="none"/>
<path d="M104 120 Q112 126 110 134 Q104 140 94 136" stroke="#c8c0a8" stroke-width="2" fill="none"/>
<path d="M104 128 Q112 134 110 142" stroke="#c8c0a8" stroke-width="2" fill="none"/>
<rect x="76" y="90" width="8" height="66" fill="#c8c0a8"/>
<!-- Collar bones -->
<path d="M56 96 Q80 90 104 96" stroke="#c8c0a8" stroke-width="3" fill="none"/>
<!-- Shoulder blades -->
<ellipse cx="48" cy="102" rx="14" ry="10" fill="none" stroke="#c8c0a8" stroke-width="1.5"/>
<ellipse cx="112" cy="102" rx="14" ry="10" fill="none" stroke="#c8c0a8" stroke-width="1.5"/>
<!-- Arms — bone arms -->
<rect x="24" y="98" width="10" height="50" rx="4" fill="none" stroke="#c8c0a8" stroke-width="2"/>
<ellipse cx="29" cy="148" rx="8" ry="6" fill="none" stroke="#c8c0a8" stroke-width="1.5"/>
<rect x="22" y="152" width="7" height="30" rx="3" fill="none" stroke="#c8c0a8" stroke-width="1.8"/>
<rect x="31" y="152" width="7" height="30" rx="3" fill="none" stroke="#c8c0a8" stroke-width="1.8"/>
<rect x="116" y="98" width="10" height="50" rx="4" fill="none" stroke="#c8c0a8" stroke-width="2"/>
<ellipse cx="121" cy="148" rx="8" ry="6" fill="none" stroke="#c8c0a8" stroke-width="1.5"/>
<rect x="114" y="152" width="7" height="30" rx="3" fill="none" stroke="#c8c0a8" stroke-width="1.8"/>
<rect x="123" y="152" width="7" height="30" rx="3" fill="none" stroke="#c8c0a8" stroke-width="1.8"/>
<!-- Rusty sword in right hand -->
<rect x="128" y="120" width="6" height="62" rx="2" fill="#8a6040" opacity="0.7"/>
<polygon points="131,120 127,106 135,106" fill="#a07050" opacity="0.8"/>
<rect x="122" y="150" width="18" height="5" rx="1" fill="#7a5030"/>
<!-- Skull -->
<ellipse cx="80" cy="58" rx="30" ry="32" fill="#d0c8a8"/>
<!-- Skull texture -->
<path d="M52 52 Q56 44 60 52" stroke="#b8b090" stroke-width="1" fill="none" opacity="0.4"/>
<path d="M100 52 Q104 44 108 52" stroke="#b8b090" stroke-width="1" fill="none" opacity="0.4"/>
<!-- Eye sockets — large and black -->
<ellipse cx="64" cy="54" rx="12" ry="13" fill="#0a0808"/>
<ellipse cx="96" cy="54" rx="12" ry="13" fill="#0a0808"/>
<!-- Eerie glow in sockets -->
<ellipse cx="64" cy="54" rx="5" ry="5" fill="#c8a020" opacity="0.6"/>
<ellipse cx="96" cy="54" rx="5" ry="5" fill="#c8a020" opacity="0.6"/>
<!-- Nose cavity -->
<path d="M76 68 L80 74 L84 68 Q80 64 76 68 Z" fill="#0a0808"/>
<!-- Teeth — jagged -->
<rect x="63" y="80" width="5" height="8" rx="1" fill="#d8d0b0"/>
<rect x="70" y="80" width="5" height="10" rx="1" fill="#d8d0b0"/>
<rect x="77" y="80" width="5" height="9" rx="1" fill="#d8d0b0"/>
<rect x="84" y="80" width="5" height="10" rx="1" fill="#d8d0b0"/>
<rect x="91" y="80" width="5" height="8" rx="1" fill="#d8d0b0"/>
<!-- Crack in skull -->
<path d="M82 26 L78 48" stroke="#b0a888" stroke-width="1.5" opacity="0.4"/>
</svg>`,

  Zombie: (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#0a0e0a"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#6a3020" stroke-width="2"/>
<rect x="0" y="0" width="160" height="200" fill="#0c100c"/>
<!-- Zombie body — shambling torso -->
<rect x="36" y="106" width="88" height="80" rx="4" fill="#4a5e38"/>
<!-- Tattered shirt -->
<path d="M36 106 Q60 100 80 104 Q100 100 124 106" stroke="#3a4e28" stroke-width="2" fill="none"/>
<!-- Decay patches -->
<ellipse cx="60" cy="130" rx="12" ry="8" fill="#2a3a18" opacity="0.7"/>
<ellipse cx="100" cy="145" rx="10" ry="7" fill="#2a3a18" opacity="0.6"/>
<!-- Outstretched arms -->
<path d="M8 98 Q22 86 42 106 L40 160 Q24 166 10 158 Z" fill="#4a5e38" style="transform-origin:42px 106px;transform:rotate(-25deg)"/>
<path d="M152 98 Q138 86 118 106 L120 160 Q136 166 150 158 Z" fill="#4a5e38" style="transform-origin:118px 106px;transform:rotate(25deg)"/>
<!-- Decomposing hands -->
<ellipse cx="12" cy="86" rx="14" ry="10" fill="#3a4e28"/>
<path d="M4 82 L0 70" stroke="#3a4e28" stroke-width="4" stroke-linecap="round"/>
<path d="M8 80 L6 68" stroke="#3a4e28" stroke-width="4" stroke-linecap="round"/>
<path d="M14 79 L14 66" stroke="#3a4e28" stroke-width="4" stroke-linecap="round"/>
<path d="M20 80 L22 68" stroke="#3a4e28" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="148" cy="86" rx="14" ry="10" fill="#3a4e28"/>
<path d="M156 82 L160 70" stroke="#3a4e28" stroke-width="4" stroke-linecap="round"/>
<path d="M152 80 L154 68" stroke="#3a4e28" stroke-width="4" stroke-linecap="round"/>
<path d="M146 79 L146 66" stroke="#3a4e28" stroke-width="4" stroke-linecap="round"/>
<path d="M140 80 L138 68" stroke="#3a4e28" stroke-width="4" stroke-linecap="round"/>
<!-- Neck rotted -->
<rect x="66" y="92" width="28" height="16" rx="3" fill="#5a6e48"/>
<path d="M68 96 Q80 100 92 96" stroke="#3a4e28" stroke-width="1.5" fill="none" opacity="0.5"/>
<!-- Head — bloated -->
<ellipse cx="80" cy="66" rx="32" ry="30" fill="#6a7a50"/>
<!-- Decay texture -->
<ellipse cx="58" cy="60" rx="10" ry="7" fill="#4a5a30" opacity="0.5"/>
<ellipse cx="102" cy="72" rx="8" ry="6" fill="#4a5a30" opacity="0.4"/>
<!-- Eyes — blank white with red -->
<ellipse cx="66" cy="64" rx="8" ry="7" fill="#d0d8c0"/>
<ellipse cx="94" cy="64" rx="8" ry="7" fill="#d0d8c0"/>
<ellipse cx="66" cy="64" rx="5" ry="5" fill="#c02010" opacity="0.6"/>
<ellipse cx="94" cy="64" rx="5" ry="5" fill="#c02010" opacity="0.6"/>
<circle cx="64" cy="62" r="1.5" fill="white" opacity="0.4"/>
<!-- Sagging jaw -->
<path d="M54 80 Q60 96 80 98 Q100 96 106 80" fill="#5a6a40"/>
<path d="M60 88 Q70 94 80 92 Q90 94 100 88" stroke="#3a4a28" stroke-width="1" fill="none" opacity="0.4"/>
<!-- Exposed teeth -->
<rect x="66" y="82" width="5" height="7" rx="1" fill="#d0c8a8"/>
<rect x="73" y="80" width="5" height="9" rx="1" fill="#d0c8a8"/>
<rect x="82" y="80" width="5" height="9" rx="1" fill="#d0c8a8"/>
<rect x="89" y="82" width="5" height="7" rx="1" fill="#d0c8a8"/>
<!-- Missing chunk from head -->
<path d="M100 44 L112 36 L116 48 L106 54 Z" fill="#0c100c"/>
<!-- Wound drips -->
<path d="M102 54 L104 66" stroke="#a03020" stroke-width="2" opacity="0.6"/>
</svg>`,

  "Drowned Warden": (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#04060a"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#8a3a8a" stroke-width="2.5"/>
<rect x="0" y="0" width="160" height="200" fill="#060810"/>
<!-- Water/deep glow -->
<ellipse cx="80" cy="130" rx="70" ry="60" fill="#102040" opacity="0.4"/>
<ellipse cx="80" cy="100" rx="45" ry="60" fill="#0a2030" opacity="0.5"/>
<!-- ☠ MINI BOSS label -->
<rect x="20" y="8" width="120" height="18" rx="3" fill="#200820"/>
<text x="80" y="22" text-anchor="middle" fill="#c060c0" font-size="11" font-family="serif" letter-spacing="3">☠ MINI BOSS ☠</text>
<!-- Waterlogged body -->
<rect x="32" y="106" width="96" height="80" rx="4" fill="#1e3830"/>
<!-- Barnacle growth on armour -->
<circle cx="52" cy="120" r="4" fill="#1a2a20"/>
<circle cx="58" cy="132" r="3" fill="#1a2a20"/>
<circle cx="104" cy="126" r="4" fill="#1a2a20"/>
<circle cx="98" cy="140" r="3" fill="#1a2a20"/>
<!-- Rusted chain mail -->
<rect x="32" y="106" width="96" height="16" rx="2" fill="#2a4840"/>
<path d="M32 116 Q80 112 128 116" stroke="#3a6858" stroke-width="1.5" fill="none"/>
<!-- Arms — bloated -->
<rect x="8" y="102" width="26" height="60" rx="10" fill="#1e3830"/>
<rect x="126" y="102" width="26" height="60" rx="10" fill="#1e3830"/>
<rect x="6" y="154" width="30" height="18" rx="6" fill="#162c28"/>
<rect x="124" y="154" width="30" height="18" rx="6" fill="#162c28"/>
<!-- Bloated clawed hands -->
<path d="M8 158 L0 146" stroke="#162c28" stroke-width="5" stroke-linecap="round"/>
<path d="M14 156 L8 143" stroke="#162c28" stroke-width="5" stroke-linecap="round"/>
<path d="M20 155 L16 142" stroke="#162c28" stroke-width="5" stroke-linecap="round"/>
<path d="M152 158 L160 146" stroke="#162c28" stroke-width="5" stroke-linecap="round"/>
<path d="M146 156 L152 143" stroke="#162c28" stroke-width="5" stroke-linecap="round"/>
<path d="M140 155 L144 142" stroke="#162c28" stroke-width="5" stroke-linecap="round"/>
<!-- Neck -->
<rect x="62" y="90" width="36" height="18" rx="4" fill="#2a4838"/>
<!-- Head — bloated drowned miner -->
<ellipse cx="80" cy="66" rx="36" ry="34" fill="#2e4c3a"/>
<!-- Waterlogged swelling -->
<ellipse cx="62" cy="60" rx="14" ry="10" fill="#243e30" opacity="0.7"/>
<ellipse cx="100" cy="70" rx="12" ry="9" fill="#243e30" opacity="0.6"/>
<!-- Mining helmet — half-crushed -->
<path d="M44 54 Q44 28 80 24 Q116 28 116 54" fill="#3a4840"/>
<rect x="44" y="50" width="72" height="10" rx="2" fill="#4a5850"/>
<!-- Cracked helmet lamp -->
<ellipse cx="80" cy="46" rx="12" ry="9" fill="#1a2820" stroke="#3a5848" stroke-width="1.5"/>
<ellipse cx="80" cy="46" rx="6" ry="5" fill="#10e080" opacity="0.4"/>
<!-- Eyes — eerie green glow -->
<ellipse cx="65" cy="64" rx="10" ry="9" fill="#0a0e08"/>
<ellipse cx="95" cy="64" rx="10" ry="9" fill="#0a0e08"/>
<ellipse cx="65" cy="64" rx="6" ry="6" fill="#10e080" opacity="0.8"/>
<ellipse cx="95" cy="64" rx="6" ry="6" fill="#10e080" opacity="0.8"/>
<circle cx="65" cy="64" r="8" fill="#10e080" opacity="0.1"/>
<circle cx="95" cy="64" r="8" fill="#10e080" opacity="0.1"/>
<!-- Gaping mouth -->
<path d="M60 80 Q80 90 100 80 Q100 92 80 96 Q60 92 60 80 Z" fill="#0a0e08"/>
<rect x="66" y="80" width="5" height="8" rx="1" fill="#c8b890"/>
<rect x="74" y="78" width="5" height="10" rx="1" fill="#c8b890"/>
<rect x="81" y="78" width="5" height="10" rx="1" fill="#c8b890"/>
<rect x="89" y="80" width="5" height="8" rx="1" fill="#c8b890"/>
<!-- Black water drips from mouth -->
<path d="M80 96 L78 110" stroke="#0a1820" stroke-width="2.5" opacity="0.8"/>
<path d="M70 90 L68 102" stroke="#0a1820" stroke-width="2" opacity="0.5"/>
<!-- Water surface around feet -->
<ellipse cx="80" cy="190" rx="70" ry="12" fill="#102030" opacity="0.6"/>
<path d="M10 185 Q40 178 80 182 Q120 178 150 185" stroke="#1a3040" stroke-width="2" fill="none"/>
</svg>`,

  Malgrath: (w=160,h=200) => `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#040208"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#c8982a" stroke-width="3"/>
<rect x="0" y="0" width="160" height="200" fill="#060408"/>
<!-- Dark aura -->
<ellipse cx="80" cy="100" rx="70" ry="90" fill="#200808" opacity="0.6"/>
<ellipse cx="80" cy="80" rx="50" ry="60" fill="#400808" opacity="0.2"/>
<!-- MALGRATH label -->
<rect x="15" y="8" width="130" height="20" rx="3" fill="#200808"/>
<text x="80" y="23" text-anchor="middle" fill="#c04020" font-size="12" font-family="serif" letter-spacing="4">MALGRATH</text>
<!-- Black plate armour -->
<rect x="28" y="104" width="104" height="82" rx="4" fill="#100808"/>
<rect x="28" y="104" width="104" height="16" rx="2" fill="#1a0c0c"/>
<!-- Dark energy runes on armour -->
<text x="46" y="138" fill="#c04020" font-size="16" font-family="serif" opacity="0.6">𝔐</text>
<text x="84" y="152" fill="#c04020" font-size="12" font-family="serif" opacity="0.5">⁕</text>
<text x="100" y="136" fill="#c04020" font-size="14" font-family="serif" opacity="0.5">⚔</text>
<!-- Pauldrons with spikes -->
<ellipse cx="28" cy="108" rx="22" ry="14" fill="#1a0c0c"/>
<polygon points="16,98 20,88 24,98" fill="#0a0608"/>
<polygon points="24,96 28,86 32,96" fill="#0a0608"/>
<ellipse cx="132" cy="108" rx="22" ry="14" fill="#1a0c0c"/>
<polygon points="128,98 132,88 136,98" fill="#0a0608"/>
<polygon points="136,96 140,86 144,96" fill="#0a0608"/>
<!-- Arms — armoured -->
<rect x="4" y="104" width="26" height="58" rx="8" fill="#100808"/>
<rect x="130" y="104" width="26" height="58" rx="8" fill="#100808"/>
<rect x="2" y="154" width="30" height="18" rx="5" fill="#0c0608"/>
<rect x="128" y="154" width="30" height="18" rx="5" fill="#0c0608"/>
<!-- Massive black sword -->
<rect x="136" y="60" width="10" height="110" rx="3" fill="#0e0c14" stroke="#4030a0" stroke-width="1.5"/>
<polygon points="141,60 136,36 146,36" fill="#1a1428" stroke="#6050c0" stroke-width="1"/>
<rect x="128" y="105" width="26" height="7" rx="2" fill="#3020a0"/>
<!-- Sword dark glow -->
<rect x="136" y="60" width="10" height="110" rx="3" fill="#8060e0" opacity="0.08"/>
<!-- Cape/cloak -->
<path d="M28 108 Q16 130 12 160 Q14 185 28 190" stroke="#0c0408" stroke-width="20" fill="none" stroke-linecap="round"/>
<path d="M132 108 Q144 130 148 160 Q146 185 132 190" stroke="#0c0408" stroke-width="20" fill="none" stroke-linecap="round"/>
<!-- Neck -->
<rect x="64" y="88" width="32" height="18" rx="4" fill="#100808"/>
<!-- Head — warlord skull face -->
<ellipse cx="80" cy="62" rx="32" ry="34" fill="#0e0808"/>
<!-- Helmet with visor -->
<path d="M48 52 Q48 20 80 16 Q112 20 112 52" fill="#100c0c"/>
<rect x="48" y="48" width="64" height="12" rx="2" fill="#1a1010"/>
<!-- Crown of bone/dark metal -->
<rect x="58" y="14" width="44" height="8" rx="2" fill="#1a1010"/>
<rect x="66" y="8" width="5" height="14" rx="1" fill="#0e0c0c"/>
<rect x="75" y="6" width="5" height="18" rx="1" fill="#c8982a" opacity="0.7"/>
<rect x="84" y="8" width="5" height="14" rx="1" fill="#0e0c0c"/>
<!-- Red eyes — burning -->
<ellipse cx="64" cy="58" rx="10" ry="9" fill="#0a0408"/>
<ellipse cx="96" cy="58" rx="10" ry="9" fill="#0a0408"/>
<ellipse cx="64" cy="58" rx="6" ry="6" fill="#e02010" opacity="0.9"/>
<ellipse cx="96" cy="58" rx="6" ry="6" fill="#e02010" opacity="0.9"/>
<!-- Burning glow -->
<circle cx="64" cy="58" r="12" fill="#e02010" opacity="0.12"/>
<circle cx="96" cy="58" r="12" fill="#e02010" opacity="0.12"/>
<circle cx="66" cy="56" r="2" fill="#ff6040" opacity="0.7"/>
<circle cx="98" cy="56" r="2" fill="#ff6040" opacity="0.7"/>
<!-- Dark smoke wisps -->
<path d="M60 30 Q56 20 58 12" stroke="#200808" stroke-width="3" opacity="0.5"/>
<path d="M80 26 Q78 14 80 6" stroke="#200808" stroke-width="3" opacity="0.4"/>
<path d="M100 30 Q104 20 102 12" stroke="#200808" stroke-width="3" opacity="0.5"/>
<!-- Malgrath rune on forehead -->
<path d="M76 44 L80 38 L84 44 L80 48 Z" stroke="#c8982a" stroke-width="1.5" fill="none" opacity="0.6"/>
</svg>`,
};

function getPortrait(name, w=160, h=200) {
  if (!name) return null;
  const n = name.toLowerCase();
  const key = Object.keys(PORTRAITS).find(k => n.includes(k.toLowerCase()));
  if (!key) {
    const svg = `<svg viewBox="0 0 160 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
<rect width="160" height="200" fill="#14100a"/>
<rect x="1" y="1" width="158" height="198" fill="none" stroke="#8a3020" stroke-width="2"/>
<ellipse cx="80" cy="80" rx="34" ry="36" fill="#6a4030"/>
<rect x="46" y="108" width="68" height="72" rx="4" fill="#4a3020"/>
<rect x="22" y="104" width="26" height="52" rx="8" fill="#4a3020"/>
<rect x="112" y="104" width="26" height="52" rx="8" fill="#4a3020"/>
<ellipse cx="66" cy="76" rx="8" ry="8" fill="#0a0808"/>
<ellipse cx="94" cy="76" rx="8" ry="8" fill="#0a0808"/>
<ellipse cx="66" cy="76" rx="5" ry="5" fill="#c02010" opacity="0.8"/>
<ellipse cx="94" cy="76" rx="5" ry="5" fill="#c02010" opacity="0.8"/>
<circle cx="68" cy="74" r="2" fill="white" opacity="0.6"/>
<circle cx="96" cy="74" r="2" fill="white" opacity="0.6"/>
<path d="M63 90 L68 86 L80 92 L92 86 L97 90" stroke="#5a2010" stroke-width="2" fill="none"/>
<text x="80" y="180" text-anchor="middle" fill="#8a3020" font-size="12" font-family="serif">${name}</text>
</svg>`;
    return svg;
  }
  return PORTRAITS[key](w, h);
}

function Portrait({ name, size=160, height=200, border="#c8982a" }) {
  const svg = getPortrait(name, size, height);
  if (!svg) return null;
  return (
    <div style={{width:size, height:height, flexShrink:0, border:`2px solid ${border}`, borderRadius:"3px", overflow:"hidden", lineHeight:0}}
      dangerouslySetInnerHTML={{__html: svg}}/>
  );
}
function getPortrait(name, w=80, h=80) {
  if (!name) return null;
  const n = name.toLowerCase();
  const key = Object.keys(PORTRAITS).find(k => n.includes(k.toLowerCase()));
  if (!key) {
    // Generic enemy portrait
    const svg = `<svg viewBox="0 0 80 80" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#14100a"/><rect x="0" y="0" width="80" height="80" fill="none" stroke="#8a3020" stroke-width="1.5"/><ellipse cx="40" cy="28" rx="14" ry="14" fill="#6a4030"/><rect x="26" y="40" width="28" height="28" rx="2" fill="#4a3020"/><rect x="16" y="40" width="12" height="22" rx="2" fill="#4a3020"/><rect x="52" y="40" width="12" height="22" rx="2" fill="#4a3020"/><ellipse cx="34" cy="26" rx="3" ry="3.5" fill="#200000"/><ellipse cx="46" cy="26" rx="3" ry="3.5" fill="#200000"/><circle cx="34" cy="26" r="1.5" fill="#c02010" opacity="0.8"/><circle cx="46" cy="26" r="1.5" fill="#c02010" opacity="0.8"/><path d="M33 33 L36 30 L40 34 L44 30 L47 33" stroke="#5a2010" stroke-width="1.5" fill="none"/></svg>`;
    return svg;
  }
  return PORTRAITS[key](w, h);
}

function Portrait({ name, size=80, border="#c8982a" }) {
  const svg = getPortrait(name, size, size);
  if (!svg) return null;
  return (
    <div style={{width:size, height:size, flexShrink:0, border:`2px solid ${border}`, borderRadius:"3px", overflow:"hidden", lineHeight:0}}
      dangerouslySetInnerHTML={{__html: svg}}/>
  );
}


function CardGame({ stateRef, miraRef, gameState, miraWon, setMiraWon, setGameState, setLog, setShowCardGame }) {
  const SUITS  = ["♠","♥","♦","♣"];
  const RANKS  = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const VALUES = {"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":10,"Q":10,"K":10,"A":11};
  const [phase,   setPhase]   = useState("intro");   // intro|bet|deal|reveal|result
  const [bet,     setBet]     = useState(0);
  const [allIn,   setAllIn]   = useState(false);
  const [playerCards, setPC]  = useState([]);
  const [miraCards,   setMC]  = useState([]);
  const [miraDistracted, setMD] = useState(false);
  const [msg,     setMsg]     = useState("");
  const [won,     setWon]     = useState(null);

  const gold = gameState?.gold ?? stateRef.current?.gold ?? 0;

  const makeCard = () => ({ rank: RANKS[Math.floor(Math.random()*13)], suit: SUITS[Math.floor(Math.random()*4)] });
  const handVal  = cards => cards.reduce((s,c) => s + VALUES[c.rank], 0);

  const deal = () => {
    if (bet <= 0) return;
    const pc = [makeCard(), makeCard(), makeCard()];
    // Mira is "distracted" ~60% of the time — she draws weaker
    const distracted = Math.random() < 0.60;
    setMD(distracted);
    const mc = distracted
      ? [makeCard(), ...[makeCard(),makeCard()].sort((a,b)=>VALUES[a.rank]-VALUES[b.rank]).slice(0,1), makeCard()].slice(0,3).map(c => distracted && Math.random()<0.4 ? {...c, rank:RANKS[Math.floor(Math.random()*6)]} : c)
      : [makeCard(), makeCard(), makeCard()];
    setPC(pc); setMC(mc); setPhase("reveal");
    const pv = handVal(pc);
    const mv = handVal(mc);
    setTimeout(() => {
      if (pv >= mv) {
        setWon(true);
        setMsg(pv === mv ? "A tie — Mira laughs and calls it a push." : `You win! (${pv} vs ${mv})`);
      } else {
        setWon(false);
        setMsg(`Mira wins. (${mv} vs ${pv})`);
      }
      setPhase("result");
    }, 1800);
  };

  const CardFace = ({card, faceDown=false, delay=0}) => (
    <div style={{
      width:"52px", height:"74px", background: faceDown?"#1a0a2a":"#f8f0e8",
      border:`2px solid ${faceDown?"#5a3060":"#8a6040"}`, borderRadius:"6px",
      display:"flex", flexDirection:"column", justifyContent:"space-between",
      padding:"4px 5px", flexShrink:0,
      boxShadow: faceDown?"none":"0 2px 8px #00000066",
      animation: !faceDown ? `resultPop 0.3s ${delay}s ease-out both` : "none",
      transition:"all .3s"}}>
      {faceDown ? (
        <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"#8a5090",fontSize:"22px"}}>✦</div>
      ) : (
        <>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:"13px",fontWeight:700,
            color: card.suit==="♥"||card.suit==="♦" ? "#c02020" : "#1a1a1a",lineHeight:1}}>
            {card.rank}
          </div>
          <div style={{textAlign:"center",fontSize:"22px",lineHeight:1,
            color: card.suit==="♥"||card.suit==="♦" ? "#c02020" : "#1a1a1a"}}>{card.suit}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:"13px",fontWeight:700,alignSelf:"flex-end",
            color: card.suit==="♥"||card.suit==="♦" ? "#c02020" : "#1a1a1a",lineHeight:1,transform:"rotate(180deg)"}}>
            {card.rank}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div style={{background:"#0a0610",border:"2px solid #8a50a0",padding:"24px",maxWidth:480,width:"100%",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
      {/* Header */}
      <div style={{textAlign:"center",marginBottom:"4px"}}>
        <div style={{fontFamily:"'Cinzel',serif",color:"#c090d0",fontSize:"16px",letterSpacing:"4px"}}>🃏 ASHFEN DRAW</div>
        <div style={{color:"#7a5080",fontSize:"13px",fontStyle:"italic",marginTop:"4px"}}>
          {miraWon ? "Mira smiles warmly from behind the bar." : "A shadowed booth. A woman with dark eyes deals the cards."}
        </div>
      </div>

      {phase === "intro" && (
        <div style={{marginTop:"20px"}}>
          <div style={{background:"#120810",border:"1px solid #3a1850",padding:"16px",marginBottom:"16px",fontSize:"14px",color:"#c0a0c8",lineHeight:1.8,fontStyle:"italic"}}>
            She looks up as you approach, chin resting in one hand, a lazy smile crossing her face. The booth is warm, candlelit. She shuffles the worn deck with practised ease — or tries to; two cards tumble to the table. She laughs and picks them up.<br/><br/>
            "Ashfen Draw. Three cards each. Highest total wins. Simple as that." She leans forward slightly. "Care to make it interesting?"
          </div>
          <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
            <button onClick={()=>setPhase("bet")} style={{background:"transparent",border:"2px solid #8a50a0",color:"#c090d0",fontFamily:"'Cinzel',serif",fontSize:"13px",letterSpacing:"3px",padding:"10px 28px",cursor:"pointer"}}
              onMouseEnter={e=>{e.target.style.background="#8a50a0";e.target.style.color="#0a0610";}}
              onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#c090d0";}}>
              SIT DOWN
            </button>
            <button onClick={()=>setShowCardGame(false)} style={{background:"transparent",border:"1px solid #2a1830",color:"#5a3060",fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"2px",padding:"10px 20px",cursor:"pointer"}}>
              WALK AWAY
            </button>
          </div>
        </div>
      )}

      {phase === "bet" && (
        <div style={{marginTop:"20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",background:"#14100a",border:"1px solid #2a1c0c",marginBottom:"16px"}}>
            <span style={{color:"#8b6030",fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"3px"}}>YOUR GOLD</span>
            <span style={{color:"#c8982a",fontFamily:"'Cinzel',serif",fontSize:"18px",fontWeight:700}}>{gold}gp</span>
          </div>
          <div style={{color:"#7a5080",fontSize:"13px",fontStyle:"italic",marginBottom:"14px",textAlign:"center"}}>
            "Name your stake. I've got all night."
          </div>
          {/* Bet buttons */}
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap",justifyContent:"center",marginBottom:"12px"}}>
            {[1,2,5,10].filter(v=>v<=gold).map(v=>(
              <button key={v} onClick={()=>{setBet(v);setAllIn(false);}}
                style={{background: bet===v&&!allIn?"#2a1840":"transparent",border:`1px solid ${bet===v&&!allIn?"#8a50a0":"#3a1850"}`,
                  color: bet===v&&!allIn?"#c090d0":"#6a4080",
                  fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"2px",padding:"6px 14px",cursor:"pointer"}}>
                {v}gp
              </button>
            ))}
            {gold > 0 && (
              <button onClick={()=>{setBet(gold);setAllIn(true);}}
                style={{background:allIn?"#2a0818":"transparent",border:`2px solid ${allIn?"#e060a0":"#5a1840"}`,
                  color:allIn?"#e090c0":"#8a3060",
                  fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"2px",padding:"6px 14px",cursor:"pointer",
                  animation:allIn?"pulse 1.5s infinite":"none"}}>
                ALL IN ({gold}gp)
              </button>
            )}
          </div>
          {bet > 0 && (
            <div style={{textAlign:"center",color:"#c090d0",fontSize:"13px",marginBottom:"14px",fontStyle:"italic"}}>
              Staking {bet}gp{allIn?" — everything you have":""}
            </div>
          )}
          <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
            <button onClick={deal} disabled={bet<=0}
              style={{background:"transparent",border:`2px solid ${bet>0?"#8a50a0":"#3a1850"}`,
                color:bet>0?"#c090d0":"#3a1850",fontFamily:"'Cinzel',serif",fontSize:"13px",letterSpacing:"3px",padding:"10px 28px",cursor:bet>0?"pointer":"not-allowed"}}
              onMouseEnter={e=>{ if(bet>0){e.target.style.background="#8a50a0";e.target.style.color="#0a0610";}}}
              onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color=bet>0?"#c090d0":"#3a1850";}}>
              DEAL
            </button>
            <button onClick={()=>setPhase("intro")} style={{background:"transparent",border:"1px solid #2a1830",color:"#5a3060",fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"2px",padding:"10px 20px",cursor:"pointer"}}>
              BACK
            </button>
          </div>
        </div>
      )}

      {(phase === "reveal" || phase === "result") && (
        <div style={{marginTop:"20px"}}>
          {/* Mira's distraction */}
          {miraDistracted && phase==="reveal" && (
            <div style={{textAlign:"center",color:"#e090c0",fontSize:"13px",fontStyle:"italic",marginBottom:"12px",animation:"pulse 1s infinite"}}>
              Mira leans forward as she deals, chin tilted, eyes holding yours a beat too long…
            </div>
          )}

          {/* Your hand */}
          <div style={{marginBottom:"16px"}}>
            <div style={{fontFamily:"'Cinzel',serif",color:"#4ade80",fontSize:"11px",letterSpacing:"3px",marginBottom:"8px"}}>YOUR HAND {phase==="result"?`— ${handVal(playerCards)} pts`:""}</div>
            <div style={{display:"flex",gap:"8px",justifyContent:"center"}}>
              {playerCards.map((c,i)=><CardFace key={i} card={c} delay={i*0.15}/>)}
            </div>
          </div>

          {/* Mira's hand */}
          <div style={{marginBottom:"20px"}}>
            <div style={{fontFamily:"'Cinzel',serif",color:"#c090d0",fontSize:"11px",letterSpacing:"3px",marginBottom:"8px"}}>
              MIRA'S HAND {phase==="result"?`— ${handVal(miraCards)} pts`:"— face down"}
            </div>
            <div style={{display:"flex",gap:"8px",justifyContent:"center"}}>
              {miraCards.map((c,i)=>(
                <CardFace key={i} card={c} faceDown={phase!=="result"} delay={i*0.15+0.5}/>
              ))}
            </div>
          </div>

          {/* Revealing spinner */}
          {phase === "reveal" && (
            <div style={{textAlign:"center",color:"#7a5080",fontSize:"13px",fontStyle:"italic"}}>
              She flips her cards…
            </div>
          )}

          {/* Result */}
          {phase === "result" && (
            <div style={{textAlign:"center"}}>
              <div style={{
                fontFamily:"'Cinzel',serif",
                color: won?"#4ade80":"#ef4444",
                fontSize:"20px",fontWeight:700,letterSpacing:"4px",
                marginBottom:"8px",
                animation:"resultPop 0.4s ease-out"}}>
                {won ? "YOU WIN" : "MIRA WINS"}
              </div>
              <div style={{color:"#9a7090",fontSize:"13px",fontStyle:"italic",marginBottom:"16px"}}>{msg}</div>

              {/* All-in win — Mira stays */}
              {won && allIn && !miraWon && (
                <div style={{background:"#120810",border:"2px solid #c090d0",padding:"16px",marginBottom:"16px",textAlign:"left",fontSize:"14px",color:"#c0a0c8",lineHeight:1.9,fontStyle:"italic"}}>
                  She stares at the cards for a long moment, then laughs — a real laugh, warm and surprised. She slides the pile of coins back toward you.<br/><br/>
                  "Well. That's the first time." She looks at you with something new in her eyes. "I've got nowhere to be, and I like the look of you. This tavern needs someone who can pour a decent drink." A pause. "Unless you'd rather I left."
                </div>
              )}

              <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap"}}>
                {won && allIn && !miraWon && (
                  <button onClick={()=>{
                    if (miraWon) return;
                    setMiraWon(true); miraRef.current=true;
                    setGameState(prev=>({...prev, gold:(prev?.gold||0)+bet}));
                    setLog(prev=>[...prev,{type:"quip",text:"Mira settles behind the bar like she's always been there. She slides you a look and a full tankard. Welcome home.",speaker:"Mira",id:Date.now()}]);
                    setShowCardGame(false);
                  }}
                    style={{background:"transparent",border:"2px solid #c090d0",color:"#c090d0",fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"3px",padding:"10px 24px",cursor:"pointer"}}
                    onMouseEnter={e=>{e.target.style.background="#c090d0";e.target.style.color="#0a0610";}}
                    onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#c090d0";}}>
                    ASK HER TO STAY
                  </button>
                )}
                {won && (
                  <button onClick={()=>{
                    setGameState(prev=>({...prev, gold:Math.max(0,(prev?.gold||0)+bet)}));
                    setLog(prev=>[...prev,{type:"player",text:`Won ${bet}gp from Mira at Ashfen Draw.`,id:Date.now()}]);
                    setBet(0); setAllIn(false); setWon(null); setPhase("bet");
                  }}
                    style={{background:"transparent",border:"1px solid #4a8040",color:"#6ab060",fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"2px",padding:"10px 20px",cursor:"pointer"}}>
                    PLAY AGAIN (+{bet}gp)
                  </button>
                )}
                {!won && (
                  <button onClick={()=>{
                    setGameState(prev=>({...prev, gold:Math.max(0,(prev?.gold||0)-bet)}));
                    setLog(prev=>[...prev,{type:"player",text:`Lost ${bet}gp to Mira at Ashfen Draw.`,id:Date.now()}]);
                    setBet(0); setAllIn(false); setWon(null); setPhase("bet");
                  }}
                    style={{background:"transparent",border:"1px solid #5a1a1a",color:"#8a4040",fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"2px",padding:"10px 20px",cursor:"pointer"}}>
                    TRY AGAIN (-{bet}gp)
                  </button>
                )}
                <button onClick={()=>setShowCardGame(false)}
                  style={{background:"transparent",border:"1px solid #2a1830",color:"#5a3060",fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"2px",padding:"10px 16px",cursor:"pointer"}}>
                  LEAVE TABLE
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BestiaryEntry({ name, data }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      style={{background: expanded?"#160e06":"#120e08",
        border:`1px solid ${expanded?"#4a2c10":"#2a1c0c"}`,
        padding:"14px 16px",display:"flex",gap:"12px",alignItems:"flex-start",
        cursor:"pointer",transition:"all .2s"}}
      onClick={()=>setExpanded(e=>!e)}
      title={expanded?"Click to collapse":"Click to read full description"}>
      <Portrait name={name} size={64} height={80} border={expanded?"#8a5020":"#3a2010"}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"5px"}}>
          <span style={{fontFamily:"'Cinzel',serif",color: expanded?"#e8c078":"#e8d9b5",fontSize:"15px",fontWeight:600}}>{name}</span>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <span style={{background:"#1a0808",border:"1px solid #3a1010",color:"#ef6060",fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"2px",padding:"2px 8px"}}>×{data.count} slain</span>
            <span style={{color:"#5a3510",fontSize:"13px"}}>{expanded?"▲":"▼"}</span>
          </div>
        </div>
        <div style={{color:"#8a7050",fontSize:"13px",fontStyle:"italic",lineHeight:1.7,
          maxHeight:expanded?"400px":"2.8em",overflow:"hidden",transition:"max-height .3s ease"}}>
          {data.desc?.replace(/[^\w\s.,!?;:'"()\-]/g," ") || "Encountered in the dark."}
        </div>
        {expanded && <div style={{color:"#4a3020",fontSize:"11px",marginTop:"6px",fontFamily:"'Cinzel',serif",letterSpacing:"1px"}}>▲ COLLAPSE</div>}
      </div>
    </div>
  );
}

function Section({ title, color, empty, children }) {
  if (empty) return null;
  return (
    <div style={{marginBottom:"20px"}}>
      <div style={{fontFamily:"'Cinzel',serif",color,fontSize:"11px",letterSpacing:"3px",marginBottom:"10px",borderBottom:`1px solid ${color}44`,paddingBottom:"5px"}}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Audio Engine (High Quality) ───────────────────────────────────────────────
function useAudio() {
  const ctx        = useRef(null);
  const masterGain = useRef(null);
  const ambNodes   = useRef([]);
  const moodRef    = useRef("tavern");

  const getCtx = () => {
    if (!ctx.current) {
      ctx.current = new (window.AudioContext || window.webkitAudioContext)();
      masterGain.current = ctx.current.createGain();
      masterGain.current.gain.value = 0.35;
      masterGain.current.connect(ctx.current.destination);
    }
    if (ctx.current.state === "suspended") ctx.current.resume();
    return ctx.current;
  };

  const setVolume = (v) => {
    if (masterGain.current) masterGain.current.gain.linearRampToValueAtTime(v, (ctx.current?.currentTime||0)+0.8);
  };

  const stopAmbient = () => {
    ambNodes.current.forEach(n => { try { n.stop?.(); } catch(e){} });
    ambNodes.current = [];
  };

  // ── Shared utilities ──────────────────────────────────────────────────────
  const makeNoise = (ac, dur=3, channels=1) => {
    const len = ac.sampleRate * dur;
    const buf = ac.createBuffer(channels, len, ac.sampleRate);
    for (let c=0; c<channels; c++) {
      const d = buf.getChannelData(c);
      let last = 0;
      for (let i=0; i<len; i++) {
        // Pink-ish noise: mix white with smoothed last sample
        const w = Math.random()*2-1;
        last = last*0.98 + w*0.02;
        d[i] = w*0.7 + last*0.3;
      }
    }
    return buf;
  };

  const makeReverb = (ac, seconds=1.5, decay=2) => {
    const len = ac.sampleRate * seconds;
    const buf = ac.createBuffer(2, len, ac.sampleRate);
    for (let c=0; c<2; c++) {
      const d = buf.getChannelData(c);
      for (let i=0; i<len; i++) d[i] = (Math.random()*2-1)*Math.pow(1-i/len, decay);
    }
    const conv = ac.createConvolver();
    conv.buffer = buf;
    return conv;
  };

  const loopNoise = (ac, buf, dest) => {
    const src = ac.createBufferSource();
    src.buffer = buf; src.loop = true; src.start();
    src.connect(dest);
    return src;
  };

  // ── TAVERN — warm, crackling, alive ──────────────────────────────────────
  const playTavern = (ac) => {
    const nodes = [];
    const rev = makeReverb(ac, 0.8, 3);
    rev.connect(masterGain.current);
    const revGain = ac.createGain(); revGain.gain.value = 0.3; revGain.connect(rev);
    const dryGain = ac.createGain(); dryGain.gain.value = 0.7; dryGain.connect(masterGain.current);

    // Fire — three layered noise bands with LFOs
    const fireBuf = makeNoise(ac, 4);
    [
      { freq:320, q:1.2, vol:0.10 },
      { freq:700, q:0.8, vol:0.07 },
      { freq:1800,q:1.5, vol:0.04 },
    ].forEach(({freq,q,vol},i) => {
      const src = loopNoise(ac, fireBuf, ac.createGain());
      const bp  = ac.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=freq; bp.Q.value=q;
      const g   = ac.createGain(); g.gain.value=vol;
      // Flicker LFO
      const lfo  = ac.createOscillator(); lfo.type="sine"; lfo.frequency.value = 2+i*1.3+Math.random();
      const lfoG = ac.createGain(); lfoG.gain.value = vol*0.6;
      lfo.connect(lfoG); lfoG.connect(g.gain);
      src.connect(bp); bp.connect(g); g.connect(dryGain); g.connect(revGain);
      lfo.start();
      nodes.push(src, lfo);
    });

    // Crowd murmur — very low rumble + occasional peaks
    const murBuf = makeNoise(ac, 6);
    const murSrc = loopNoise(ac, murBuf, ac.createGain());
    const lp1 = ac.createBiquadFilter(); lp1.type="lowpass"; lp1.frequency.value=280;
    const lp2 = ac.createBiquadFilter(); lp2.type="lowpass"; lp2.frequency.value=180;
    const mg  = ac.createGain(); mg.gain.value=0.055;
    murSrc.connect(lp1); lp1.connect(lp2); lp2.connect(mg); mg.connect(dryGain);
    nodes.push(murSrc);

    // Howling blizzard wind (outside) — two sine sweeps
    [55,73].forEach(baseFreq => {
      const w  = ac.createOscillator(); w.type="sine"; w.frequency.value=baseFreq;
      const wg = ac.createGain(); wg.gain.value=0.018;
      // Slow sweep
      w.frequency.linearRampToValueAtTime(baseFreq+22, ac.currentTime+14);
      w.frequency.linearRampToValueAtTime(baseFreq-8,  ac.currentTime+28);
      w.frequency.linearRampToValueAtTime(baseFreq+14, ac.currentTime+42);
      w.connect(wg); wg.connect(masterGain.current); w.start();
      nodes.push(w);
    });

    // Occasional wood creak — short tonal burst every 8-20s
    const creak = () => {
      if (moodRef.current !== "tavern") return;
      const o = ac.createOscillator(); o.type="sine"; o.frequency.value=160+Math.random()*80;
      o.frequency.linearRampToValueAtTime(80+Math.random()*40, ac.currentTime+0.5);
      const g = ac.createGain(); g.gain.setValueAtTime(0.04, ac.currentTime);
      g.gain.linearRampToValueAtTime(0, ac.currentTime+0.5);
      o.connect(g); g.connect(masterGain.current);
      o.start(); o.stop(ac.currentTime+0.5);
      setTimeout(creak, 8000+Math.random()*12000);
    };
    setTimeout(creak, 3000+Math.random()*8000);

    return nodes;
  };

  // ── DUNGEON — eerie, echoing, damp ───────────────────────────────────────
  const playDungeon = (ac, isDeep=false) => {
    const nodes = [];
    const rev = makeReverb(ac, isDeep?4:2.5, isDeep?1.5:2.5);
    rev.connect(masterGain.current);
    const revG = ac.createGain(); revG.gain.value = isDeep?0.5:0.35; revG.connect(rev);
    const dryG = ac.createGain(); dryG.gain.value = 0.6; dryG.connect(masterGain.current);

    // Sub-bass hum — layered fundamentals
    const hums = isDeep ? [28,42,56] : [36,54];
    hums.forEach((f,i) => {
      const o  = ac.createOscillator(); o.type = i===0?"sine":"triangle"; o.frequency.value=f;
      const g  = ac.createGain(); g.gain.value = isDeep ? 0.055 : 0.04;
      // Subtle wobble
      const vib  = ac.createOscillator(); vib.type="sine"; vib.frequency.value=0.12+i*0.07;
      const vibG = ac.createGain(); vibG.gain.value = f*0.006;
      vib.connect(vibG); vibG.connect(o.frequency);
      o.connect(g); g.connect(dryG); g.connect(revG);
      o.start(); vib.start();
      nodes.push(o, vib);
    });

    // Cave wind — shaped noise through resonant filters
    const windBuf = makeNoise(ac, 5);
    [{ freq:120,q:4,v:0.04 },{ freq:340,q:6,v:0.025 }].forEach(({freq,q,v}) => {
      const src = loopNoise(ac, windBuf, ac.createGain());
      const bp  = ac.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=freq; bp.Q.value=q;
      const g   = ac.createGain(); g.gain.value=v;
      src.connect(bp); bp.connect(g); g.connect(dryG); g.connect(revG);
      nodes.push(src);
    });

    // Drips — carefully pitched for realism
    const drip = () => {
      if (moodRef.current !== "dungeon" && moodRef.current !== "deep") return;
      const baseFreq = 900 + Math.random()*600;
      // Two-oscillator drip: attack ping + resonant tail
      const o1 = ac.createOscillator(); o1.type="sine"; o1.frequency.value=baseFreq;
      const o2 = ac.createOscillator(); o2.type="sine"; o2.frequency.value=baseFreq*0.62;
      const g1 = ac.createGain(); const g2 = ac.createGain();
      g1.gain.setValueAtTime(0.09, ac.currentTime);
      g1.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime+0.12);
      g2.gain.setValueAtTime(0.03, ac.currentTime+0.02);
      g2.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime+0.7);
      o1.connect(g1); g1.connect(revG); g1.connect(dryG);
      o2.connect(g2); g2.connect(revG);
      o1.start(); o1.stop(ac.currentTime+0.15);
      o2.start(); o2.stop(ac.currentTime+0.75);
      const interval = isDeep ? 800+Math.random()*2500 : 1800+Math.random()*5000;
      setTimeout(drip, interval);
    };
    setTimeout(drip, 400+Math.random()*1500);

    // Deep: distant groan of stone settling
    if (isDeep) {
      const groan = () => {
        if (moodRef.current !== "deep") return;
        const o = ac.createOscillator(); o.type="sawtooth";
        o.frequency.value = 28+Math.random()*16;
        o.frequency.linearRampToValueAtTime(18+Math.random()*10, ac.currentTime+2.5);
        const g = ac.createGain(); g.gain.setValueAtTime(0.06, ac.currentTime);
        g.gain.linearRampToValueAtTime(0.0, ac.currentTime+2.5);
        const lp = ac.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=80;
        o.connect(lp); lp.connect(g); g.connect(revG);
        o.start(); o.stop(ac.currentTime+2.6);
        setTimeout(groan, 12000+Math.random()*20000);
      };
      setTimeout(groan, 5000+Math.random()*8000);
    }

    return nodes;
  };

  // ── COMBAT — tense, driving, urgent ──────────────────────────────────────
  const playCombat = (ac) => {
    const nodes = [];
    const rev = makeReverb(ac, 0.4, 3);
    rev.connect(masterGain.current);
    const revG = ac.createGain(); revG.gain.value=0.2; revG.connect(rev);

    // Tension drone — 5th interval
    [[55,0.06],[82.4,0.04],[110,0.025]].forEach(([f,v]) => {
      const o  = ac.createOscillator(); o.type="sawtooth"; o.frequency.value=f;
      const lp = ac.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=400;
      const g  = ac.createGain(); g.gain.value=v;
      o.connect(lp); lp.connect(g); g.connect(masterGain.current); g.connect(revG);
      o.start(); nodes.push(o);
    });

    // Rhythmic pulse — like a heartbeat / war drum
    let beatTime = ac.currentTime + 0.2;
    const beatInterval = 0.52;
    const beatCount = 64; // enough for any combat
    for (let i=0; i<beatCount; i++) {
      const t = beatTime + i * beatInterval;
      // Kick-like thud
      const o1 = ac.createOscillator(); o1.type="sine"; o1.frequency.setValueAtTime(90, t);
      o1.frequency.exponentialRampToValueAtTime(28, t+0.18);
      const g1 = ac.createGain(); g1.gain.setValueAtTime(0, t-0.001);
      g1.gain.linearRampToValueAtTime(0.2, t+0.01);
      g1.gain.exponentialRampToValueAtTime(0.001, t+0.22);
      o1.connect(g1); g1.connect(masterGain.current); o1.start(t); o1.stop(t+0.24);
      // Snare on off-beats
      if (i%2===1) {
        const nb = makeNoise(ac, 0.1);
        const ns = ac.createBufferSource(); ns.buffer=nb;
        const hp = ac.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=2400;
        const g2 = ac.createGain(); g2.gain.setValueAtTime(0.065, t);
        g2.gain.exponentialRampToValueAtTime(0.0001, t+0.09);
        ns.connect(hp); hp.connect(g2); g2.connect(masterGain.current);
        ns.start(t); ns.stop(t+0.1);
      }
    }

    // High tension string shimmer
    [440,554,659].forEach((f,i) => {
      const o  = ac.createOscillator(); o.type="sawtooth"; o.frequency.value=f;
      const lp = ac.createBiquadFilter(); lp.type="bandpass"; lp.frequency.value=f*1.05; lp.Q.value=3;
      // Tremolo
      const trem  = ac.createOscillator(); trem.type="sine"; trem.frequency.value=6+i;
      const tremG = ac.createGain(); tremG.gain.value=0.018;
      trem.connect(tremG);
      const g = ac.createGain(); g.gain.value=0.018;
      tremG.connect(g.gain);
      o.connect(lp); lp.connect(g); g.connect(masterGain.current); g.connect(revG);
      o.start(); trem.start();
      nodes.push(o, trem);
    });

    return nodes;
  };

  // ── SFX ───────────────────────────────────────────────────────────────────
  const sfx = {
    hit: (ac) => {
      // Body hit: low thud + metallic clang
      const o1 = ac.createOscillator(); o1.type="square"; o1.frequency.value=140;
      o1.frequency.exponentialRampToValueAtTime(38, ac.currentTime+0.2);
      const g1 = ac.createGain(); g1.gain.setValueAtTime(0.22, ac.currentTime);
      g1.gain.exponentialRampToValueAtTime(0.001, ac.currentTime+0.2);
      const lp = ac.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=800;
      o1.connect(lp); lp.connect(g1); g1.connect(masterGain.current); o1.start(); o1.stop(ac.currentTime+0.22);
      // Metal clang
      const o2 = ac.createOscillator(); o2.type="sine"; o2.frequency.value=1200+Math.random()*400;
      const g2 = ac.createGain(); g2.gain.setValueAtTime(0.07, ac.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.001, ac.currentTime+0.3);
      o2.connect(g2); g2.connect(masterGain.current); o2.start(); o2.stop(ac.currentTime+0.3);
    },
    miss: (ac) => {
      // Whoosh: swept highpass noise
      const nb = makeNoise(ac, 0.3); const ns = ac.createBufferSource(); ns.buffer=nb;
      const hp = ac.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=1800;
      hp.frequency.linearRampToValueAtTime(3800, ac.currentTime+0.15);
      const g = ac.createGain(); g.gain.setValueAtTime(0.1, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime+0.25);
      ns.connect(hp); hp.connect(g); g.connect(masterGain.current); ns.start(); ns.stop(ac.currentTime+0.3);
    },
    critical: (ac) => {
      // Heavy crunch + reverberant boom
      const rev = makeReverb(ac, 0.8, 2.5); rev.connect(masterGain.current);
      const boom = ac.createOscillator(); boom.type="sawtooth"; boom.frequency.value=50;
      boom.frequency.exponentialRampToValueAtTime(22, ac.currentTime+0.7);
      const gb = ac.createGain(); gb.gain.setValueAtTime(0.35, ac.currentTime);
      gb.gain.exponentialRampToValueAtTime(0.001, ac.currentTime+0.7);
      const lp = ac.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=300;
      boom.connect(lp); lp.connect(gb); gb.connect(masterGain.current); gb.connect(rev);
      boom.start(); boom.stop(ac.currentTime+0.75);
      // High ping
      [1800,2400].forEach((f,i) => {
        const o = ac.createOscillator(); o.type="sine"; o.frequency.value=f;
        const g = ac.createGain(); g.gain.setValueAtTime(0.08, ac.currentTime+i*0.06);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime+i*0.06+0.5);
        o.connect(g); g.connect(masterGain.current); g.connect(rev);
        o.start(ac.currentTime+i*0.06); o.stop(ac.currentTime+i*0.06+0.55);
      });
    },
    death: (ac) => {
      const rev = makeReverb(ac, 2.5, 1.5); rev.connect(masterGain.current);
      [220, 165, 110, 82].forEach((f,i) => {
        const t = ac.currentTime + i*0.3;
        const o = ac.createOscillator(); o.type="sine"; o.frequency.value=f;
        const g = ac.createGain(); g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t+1.2);
        o.connect(g); g.connect(masterGain.current); g.connect(rev);
        o.start(t); o.stop(t+1.3);
      });
    },
    levelUp: (ac) => {
      const rev = makeReverb(ac, 1.2, 2); rev.connect(masterGain.current);
      [[523,0],[659,0.1],[784,0.2],[1047,0.3],[1319,0.45]].forEach(([f,t]) => {
        const o = ac.createOscillator(); o.type="sine"; o.frequency.value=f;
        const g = ac.createGain(); g.gain.setValueAtTime(0.13, ac.currentTime+t);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime+t+0.5);
        o.connect(g); g.connect(masterGain.current); g.connect(rev);
        o.start(ac.currentTime+t); o.stop(ac.currentTime+t+0.55);
      });
    },
    diceRoll: (ac) => {
      // Rattling dice: 4 quick impacts with slight pitch variation
      [0, 0.07, 0.15, 0.21].forEach((t,i) => {
        const nb = makeNoise(ac, 0.1); const ns = ac.createBufferSource(); ns.buffer=nb;
        const bp = ac.createBiquadFilter(); bp.type="bandpass";
        bp.frequency.value = 1200+Math.random()*800; bp.Q.value=2.5+Math.random()*2;
        const g = ac.createGain(); g.gain.setValueAtTime(0.08-i*0.01, ac.currentTime+t);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime+t+0.08);
        ns.connect(bp); bp.connect(g); g.connect(masterGain.current);
        ns.start(ac.currentTime+t); ns.stop(ac.currentTime+t+0.09);
      });
    },
  };

  const playMood = useCallback((mood) => {
    const ac = getCtx();
    if (moodRef.current === mood && ambNodes.current.length > 0) return;
    // Fade out old
    if (masterGain.current && ambNodes.current.length > 0) {
      const fadeGain = ac.createGain();
      fadeGain.gain.setValueAtTime(masterGain.current.gain.value, ac.currentTime);
      fadeGain.gain.linearRampToValueAtTime(0, ac.currentTime+1.5);
      ambNodes.current.forEach(n => { try { n.stop(ac.currentTime+1.6); } catch(e){} });
    }
    stopAmbient();
    moodRef.current = mood;
    setTimeout(() => {
      const ac2 = getCtx();
      if      (mood==="tavern")  ambNodes.current = playTavern(ac2);
      else if (mood==="dungeon") ambNodes.current = playDungeon(ac2, false);
      else if (mood==="deep")    ambNodes.current = playDungeon(ac2, true);
      else if (mood==="combat")  ambNodes.current = playCombat(ac2);
    }, ambNodes.current.length > 0 ? 1600 : 0);
  }, []);

  const playSfx = useCallback((name) => {
    try { sfx[name]?.(getCtx()); } catch(e) {}
  }, []);

  const stop = useCallback(() => { stopAmbient(); }, []);

  return { playMood, playSfx, setVolume, stop, moodRef };
}

function mergeNpcs(existing, incoming) {
  const map = {};
  existing.forEach(n => { map[n.name] = n; });
  incoming.forEach(n => { map[n.name] = { ...map[n.name], ...n }; });
  return Object.values(map);
}

export default function App() {
  const [screen,      setScreen]      = useState("intro");
  const [charName,    setCharName]    = useState("");
  const [charClass,   setCharClass]   = useState(null);
  const [gameState,   setGameState]   = useState(null);
  const [messages,    setMessages]    = useState([]);
  const [log,         setLog]         = useState([]);
  const [actions,     setActions]     = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [voiceOn,     setVoiceOn]     = useState(true);
  const [combat,      setCombat]      = useState(null);
  const [location,    setLocation]    = useState("The Top Tavern");
  const [showMap,     setShowMap]     = useState(false);
  const [diceType,    setDiceType]    = useState(20);
  const [diceResult,  setDiceResult]  = useState(null);
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceHistory, setDiceHistory] = useState([]);
  const [fontSize,     setFontSize]    = useState("md");   // sm | md | lg
  const [sidebarOpen,  setSidebarOpen] = useState(false);  // mobile drawer
  const undoSnapshot = useRef(null);                       // for undo
  const [party,        setParty]       = useState([]);     // hired companions
  const [showRecruit,  setShowRecruit] = useState(false);  // recruit modal
  const [pendingRoll,  setPendingRoll] = useState(null);   // { skill, dc, die, advantage, disadvantage }
  const [advMode,      setAdvMode]     = useState("normal"); // "normal" | "advantage" | "disadvantage"
  const [journal,      setJournal]     = useState({ objectives:[], npcs:[], clues:[], items:[] });
  const [dungeonMap,   setDungeonMap]  = useState({ rooms:{}, currentRoom:null });
  const [showJournal,  setShowJournal] = useState(false);
  const [mapTab,       setMapTab]      = useState("tavern");
  const [showShop,     setShowShop]    = useState(false);
  const [showCardGame, setShowCardGame]= useState(false);
  const [miraWon,      setMiraWon]     = useState(false);
  const [quests,       setQuests]      = useState([]);
  const [showQuests,   setShowQuests]  = useState(false);
  const [charBackstory,setCharBackstory]=useState(null);
  const [introPhase,   setIntroPhase]   = useState(0); // 0=hidden 1=title 2=subtitle 3=quote 4=buttons
  const [bestiary,     setBestiary]    = useState({});
  const [npcRep,       setNpcRep]      = useState({ gorn:0, valdris:0, mira:0, holvik:0 });
  const [weather,      setWeather]     = useState(null);
  const [showBestiary, setShowBestiary]= useState(false);
  const [confirmModal,  setConfirmModal]  = useState(null);
  const [toasts,        setToasts]        = useState([]);
  const [atBottom,      setAtBottom]      = useState(true);
  const [ambientVol,   setAmbientVol]  = useState(0.4);
  const [ambientOn,    setAmbientOn]   = useState(false);
  const [voiceRate,    setVoiceRate]   = useState(0.85);  // 0.6=slow 0.85=med 1.1=fast
  const [voicePitch,   setVoicePitch]  = useState(0.72);  // 0.5=deep 0.72=med 1.0=high
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [levelUpFlash, setLevelUpFlash] = useState(false);
  const audio = useAudio();
  const [decisions,    setDecisions]   = useState([]);     // key story choices
  const [blizzard,     setBlizzard]    = useState(false);  // blizzard warning
  const [deathRecap,   setDeathRecap]  = useState(null);
  const [victoryData,  setVictoryData] = useState(null);
  const [showLastChapter, setShowLastChapter] = useState(false);
  const [legacyModal,  setLegacyModal] = useState(null); // {item, desc, flavour}
  const gameStartTime  = useRef(Date.now());
  const [turnCount,    setTurnCount]   = useState(0);
  const [enemiesKilled,setEnemiesKilled]=useState(0);
  const decisionsRef   = useRef([]);
  const turnCountRef   = useRef(0);
  const enemiesRef     = useRef(0);
  const miraRef        = useRef(false);
  const questsRef      = useRef([]);
  const bestiaryRef    = useRef({});
  const npcRepRef      = useRef({ gorn:0, valdris:0, mira:0, holvik:0 });
  const [slots,       setSlots]       = useState([null, null, null]); // 3 save slots
  const [activeSlot,  setActiveSlot]  = useState(null); // 0,1,2

  const [saveStatus, setSaveStatus] = useState("");

  const msgsRef        = useRef([]);
  const stateRef       = useRef(null);
  const combatRef      = useRef(null);
  const voiceRef       = useRef(true);
  const logEndRef      = useRef(null);
  const activeSlotRef  = useRef(null);
  const partyRef       = useRef([]);
  const journalRef     = useRef({ objectives:[], npcs:[], clues:[], items:[] });
  const dungeonMapRef  = useRef({ rooms:{}, currentRoom:null });

  useEffect(() => { msgsRef.current      = messages;    }, [messages]);
  useEffect(() => { stateRef.current     = gameState;   }, [gameState]);
  useEffect(() => { combatRef.current    = combat;      }, [combat]);
  useEffect(() => { voiceRef.current     = voiceOn;     }, [voiceOn]);
  useEffect(() => { activeSlotRef.current = activeSlot; }, [activeSlot]);
  useEffect(() => { partyRef.current     = party;       }, [party]);
  useEffect(() => { journalRef.current    = journal;     }, [journal]);
  useEffect(() => { dungeonMapRef.current = dungeonMap;  }, [dungeonMap]);
  useEffect(() => { decisionsRef.current  = decisions;    }, [decisions]);
  useEffect(() => { turnCountRef.current  = turnCount;    }, [turnCount]);
  useEffect(() => { enemiesRef.current    = enemiesKilled;}, [enemiesKilled]);
  useEffect(() => { miraRef.current       = miraWon;      }, [miraWon]);
  useEffect(() => { questsRef.current     = quests;       }, [quests]);
  useEffect(() => { bestiaryRef.current   = bestiary;     }, [bestiary]);
  useEffect(() => { npcRepRef.current     = npcRep;       }, [npcRep]);
  useEffect(() => {
    if (screen !== "intro") return;
    if (introPhase !== 0) return;
    const timers = [
      setTimeout(()=>setIntroPhase(1),  200),
      setTimeout(()=>setIntroPhase(2), 1000),
      setTimeout(()=>setIntroPhase(3), 1800),
      setTimeout(()=>setIntroPhase(4), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [screen, introPhase]);

  useEffect(() => {
    // Only auto-scroll if we were already at the bottom — don't yank user away
    if (atBottom) {
      logEndRef.current?.scrollIntoView({ behavior:"smooth" });
    }
  }, [log]);

  useEffect(() => {
    const handler = (e) => {
      if (screen !== "game") return;
      if (e.key === "Escape") {
        setShowMap(false); setShowJournal(false); setShowQuests(false);
        setShowBestiary(false); setShowRecruit(false); setShowShop(false);
        setShowCardGame(false); setConfirmModal(null); setSidebarOpen(false);
      }
      if (!loading && actions.length && ["1","2","3","4"].includes(e.key)) {
        // Don't fire hotkeys when the user is typing in an input field
        const tag = e.target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        const idx = parseInt(e.key)-1;
        if (actions[idx]) { doAction(actions[idx]); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, loading, actions, callDM]);

  // Switch ambient mood on location / combat change
  useEffect(() => {
    if (!ambientOn) return;
    if (combat) { audio.playMood("combat"); return; }
    if (location === "The Top Tavern") { audio.playMood("tavern"); return; }
    const deep = ["crypt","vault","flooded","rune","deep"].some(k => location.toLowerCase().includes(k));
    audio.playMood(deep ? "deep" : "dungeon");
  }, [location, combat, ambientOn]);

  // Load slot summaries on mount
  useEffect(() => {
    (async () => {
      const loaded = await Promise.all([0,1,2].map(async (i) => {
        try {
          const _v = localStorage.getItem(`dnd-save-${i}`);
          if (_v) {
            const d = JSON.parse(_v);
            if (d.gameState) return { index:i, name:d.gameState.name, charClass:d.gameState.class, level:d.gameState.level, savedAt:d.savedAt, full:d };
          }
        } catch(e) {}
        return null;
      }));
      setSlots(loaded);
    })();
  }, []);

  const saveGame = async (state, msgs, logEntries, acts, cmb, loc) => {
    const slot = activeSlotRef.current ?? 0;
    try {
      localStorage.setItem(`dnd-save-${slot}`, JSON.stringify({
        gameState: state, messages: msgs, log: logEntries,
        actions: acts, combat: cmb, location: loc,
        party: partyRef.current,
        journal: journalRef.current,
        dungeonMap: dungeonMapRef.current,
        decisions: decisionsRef.current,
        turnCount: turnCountRef.current,
        enemiesKilled: enemiesRef.current,
        miraWon: miraRef.current,
        quests: questsRef.current,
        bestiary: bestiaryRef.current,
        npcRep: npcRepRef.current,
        blizzard: blizzard,
        weather: weather,
        savedAt: Date.now()
      }));
      setSaveStatus("SAVED");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch(e) { console.error("Save failed:", e); }
  };

  const newGame = async () => {
    const slot = activeSlotRef.current;
    if (slot !== null) {
      try { localStorage.removeItem(`dnd-save-${slot}`); } catch(e) {}
    }
    // Reset ALL game state so nothing bleeds into the next run
    setGameState(null); setMessages([]); setLog([]); setActions([]);
    setCombat(null); setLocation("The Top Tavern"); setActiveSlot(null);
    setDecisions([]); decisionsRef.current = [];
    setTurnCount(0);  turnCountRef.current = 0;
    setEnemiesKilled(0); enemiesRef.current = 0;
    setBestiary({}); bestiaryRef.current = {};
    setNpcRep({ gorn:0, valdris:0, mira:0, holvik:0 }); npcRepRef.current = { gorn:0, valdris:0, mira:0, holvik:0 };
    setQuests([]); questsRef.current = [];
    setMiraWon(false); miraRef.current = false;
    setParty([]); partyRef.current = [];
    setBlizzard(false);
    setJournal({ objectives:[], npcs:[], clues:[], items:[] });
    setDungeonMap({ rooms:{}, currentRoom:null });
    setWeather(null);
    setCharBackstory(null);
    setIntroPhase(0);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setScreen("intro");
    // Refresh slot summaries
    const loaded = await Promise.all([0,1,2].map(async (i) => {
      try {
        const _v = localStorage.getItem(`dnd-save-${i}`);
        if (_v) { const d = JSON.parse(_v); if (d.gameState) return { index:i, name:d.gameState.name, charClass:d.gameState.class, level:d.gameState.level, savedAt:d.savedAt, full:d }; }
      } catch(e) {}
      return null;
    }));
    setSlots(loaded);
  };

  const speakRaw = useCallback((text, onDone) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[^\w\s.,!?;:'"()\-]/g," ");
    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = voiceRate; utt.pitch = voicePitch; utt.volume = 1;
    if (onDone) utt.onend = onDone;
    const pickVoice = () => {
      const vs = window.speechSynthesis.getVoices();
      const v = vs.find(v => v.name==="Daniel") ||
                vs.find(v => v.name.includes("UK English Male")) ||
                vs.find(v => v.lang==="en-GB" && !v.name.toLowerCase().includes("female")) ||
                vs.find(v => v.lang.startsWith("en") && !v.name.toLowerCase().includes("female") && !v.name.toLowerCase().includes("zira")) ||
                vs[0];
      if (v) utt.voice = v;
      window.speechSynthesis.speak(utt);
    };
    if (window.speechSynthesis.getVoices().length) pickVoice();
    else window.speechSynthesis.addEventListener("voiceschanged", pickVoice, {once:true});
  }, [voiceRate, voicePitch]);

  const speakWithActions = useCallback((narrative, acts) => {
    if (!voiceRef.current) return;
    const actText = acts?.length ? " Your options are: " + acts.map((a,i)=>`${i+1}. ${a}`).join(". ") + "." : "";
    speakRaw(narrative + actText);
  }, [speakRaw]);

  const replayEntry = useCallback((narrative, acts) => {
    const actText = acts?.length ? " Your options are: " + acts.map((a,i)=>`${i+1}. ${a}`).join(". ") + "." : "";
    speakRaw(narrative + actText);
  }, [speakRaw]);

  const callDM = useCallback(async (input) => {
    setLoading(true);
    const s  = stateRef.current;
    const cb = combatRef.current;
    const partyCtx = partyRef.current.length
      ? " Party: " + partyRef.current.map(m => `${m.name}(HP ${m.hp}/${m.maxHp})`).join(", ")
      : "";
    const abilityCtx = s?.abilities ? " Abilities: " + Object.entries(s.abilities).map(([id,ab]) =>
      "current" in ab ? `${id}(${ab.current}/${ab.max})` : `${id}(${ab.active?"ON":"OFF"})`
    ).join(", ") : "";
    const questCtx = questsRef.current.length
      ? " Quests: " + questsRef.current.map(q=>`${q.title}(${q.status})`).join(", ")
      : "";
    const decisionsCtx = decisionsRef.current.length
      ? ` Decisions made: [${decisionsRef.current.join("; ")}]`
      : "";
    const ctx = s
      ? ` [CHAR STATE: ${s.name} the ${s.class}, HP ${s.hp}/${s.maxHp}, AC ${s.ac}, Gold ${s.gold}gp, Level ${s.level}, XP ${s.xp}, Rations ${s.rations||0}, Inventory: ${s.inventory.join(", ")}${abilityCtx}${partyCtx}${questCtx}${cb ? `, IN COMBAT: ${cb.enemy} HP=${cb.hp}/${cb.maxHp}` : ""}${decisionsCtx}]`
      : "";
    const msgs = [...msgsRef.current, { role:"user", content: input + ctx }];
    try {
      const res  = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1500, system:SYSTEM_PROMPT, messages:msgs })
      });
      const data = await res.json();
      const raw  = (data.content||[]).map(b => b.text||"").join("");
      let p;
      try { p = JSON.parse(raw.replace(/```(?:json)?\n?|```/g,"").trim()); }
      catch {
        // Preserve combat state on parse failure — don't end combat mid-fight
        const prevCb = combatRef.current;
        p = { narrative: raw||"The dungeon master pauses...", actions:["Look around","Speak to someone","Check inventory","Wait"],
              inventoryAdd:[], inventoryRemove:[], hpChange:0, goldChange:0,
              combatActive: !!prevCb, enemy: prevCb?.enemy||null, enemyHP: prevCb?.hp||null, enemyMaxHP: prevCb?.maxHp||null,
              showMap:false, xpGain:0, location: location };
      }
      // Compute new state synchronously so we can save it all at once
      const prev = stateRef.current;
      let inv = [...(prev?.inventory||[])];
      if (p.inventoryAdd?.length)    inv = [...inv, ...p.inventoryAdd];
      if (p.inventoryRemove?.length) inv = inv.filter(i => !p.inventoryRemove.includes(i));
      let hp    = Math.max(0, Math.min(prev?.maxHp||10, (prev?.hp||10) + (p.hpChange||0)));
      let gold  = Math.max(0, (prev?.gold||0) + (p.goldChange||0));
      let xp    = (prev?.xp||0) + (p.xpGain||0);
      let level = prev?.level||1, maxHp = prev?.maxHp||10;
      const thresh = [300,900,2700,6500,14000];
      if (level < 6 && xp >= thresh[level-1]) { level++; maxHp += 5; hp = Math.min(maxHp, hp+5); }
      const newState  = { ...prev, hp, gold, xp, level, maxHp, inventory:inv, rations: prev?.rations??0, abilities: prev?.abilities??defaultAbilities(prev?.class||"Fighter"), day: prev?.day||1 };
      const newCombat = p.combatActive ? { enemy:p.enemy||"Enemy", hp:Math.max(1, p.enemyHP||10), maxHp:Math.max(1, p.enemyMaxHP||10), miniBoss: p.enemy?.toLowerCase().includes("warden") || p.enemy?.toLowerCase().includes("boss") } : null;
      const newLoc    = p.location || location;

      // ── SFX ───────────────────────────────────────────────────────────────
      if (p.hpChange < -5)                             audio.playSfx("critical");
      else if (p.hpChange < 0)                         audio.playSfx("hit");
      else if (p.combatActive && p.hpChange === 0)     audio.playSfx("miss");
      if (hp === 0)                                     audio.playSfx("death");
      if (level > (prev?.level||1)) { audio.playSfx("levelUp"); setLevelUpFlash(true); setTimeout(()=>setLevelUpFlash(false), 800); }

      // ── Track turns and enemy kills ────────────────────────────────────────
      setTurnCount(t => t + 1);
      if (!p.combatActive && combatRef.current) {
        // Only count as kill if the narrative suggests defeat, not flee
        const narrativeLower = (p.narrative||'').toLowerCase();
        const isKill = narrativeLower.includes('dead') || narrativeLower.includes('slay') || narrativeLower.includes('slain') || narrativeLower.includes('kill') || narrativeLower.includes('defeat') || narrativeLower.includes('falls') || narrativeLower.includes('collapses') || narrativeLower.includes('body');
        if (isKill) setEnemiesKilled(e => e + 1);
        // Add to bestiary
        const enemyName = combatRef.current.enemy;
        if (enemyName) {
          setBestiary(prev => {
            const existing = prev[enemyName] || { count:0, desc:"" };
            return { ...prev, [enemyName]: { count: existing.count+1, desc: existing.desc || (p.narrative ? p.narrative.substring(0, p.narrative.lastIndexOf(" ", 200) || 200) : "") } };
          });
        }
      }

      // ── Rotate weather forecast occasionally ──────────────────────────────
      if (Math.random() < 0.15) {
        setWeather(WEATHER_FORECASTS[Math.floor(Math.random()*WEATHER_FORECASTS.length)]);
      }

      // ── Passive NPC reputation from narrative keywords ─────────────────────
      const narr = (p.narrative||"").toLowerCase();
      setNpcRep(prev => {
        const r = {...prev};
        if (narr.includes("gorn") && (narr.includes("thank") || narr.includes("nod") || narr.includes("smile"))) r.gorn = Math.min(3, r.gorn+1);
        if (narr.includes("valdris") && p.questUpdate?.status==="completed") r.valdris = Math.min(3, r.valdris+1);
        if (narr.includes("holvik") && (narr.includes("grateful") || narr.includes("reward"))) r.holvik = Math.min(3, r.holvik+1);
        if (miraRef.current && (narr.includes('mira') && (narr.includes('smile') || narr.includes('laugh') || narr.includes('wink') || narr.includes('nod')))) r.mira = Math.min(3, r.mira+1);
        return r;
      });

      // ── Decision log ──────────────────────────────────────────────────────
      if (p.decisionLog) {
        setDecisions(prev => {
          const next = [...prev, p.decisionLog];
          decisionsRef.current = next;
          return next;
        });
      }

      // ── Blizzard warning ──────────────────────────────────────────────────
      if (p.blizzardWarning) {
        setBlizzard(true);
        setTimeout(() => setBlizzard(false), 8000);
      }

      // ── Player death ───────────────────────────────────────────────────────
      if (p.playerDeath || hp === 0) {
        const playMins = Math.round((Date.now() - gameStartTime.current) / 60000);
        const recap = {
          name:     prev?.name,
          charClass: prev?.class,
          level:    level,
          turns:    turnCountRef.current,
          gold:     gold,
          enemies:  enemiesRef.current,
          decisions: [...decisionsRef.current],
          party:    partyRef.current,
          cause:    p.narrative?.split(".")[0] || "fell in the darkness",
          playTime: playMins,
          lastEntries: [], // will be filled from log after state update
        };
        setDeathRecap(recap);
        audio.stop();
        return;
      }

      // ── Campaign victory ───────────────────────────────────────────────────
      if (p.campaignEnd) {
        const playMins2 = Math.round((Date.now() - gameStartTime.current) / 60000);
        setVictoryData({
          name:     prev?.name,
          charClass: prev?.class,
          level,
          playTime: playMins2,
          ending:   p.ending || "sealed",
          turns:    turnCountRef.current,
          gold,
          enemies:  enemiesRef.current,
          decisions: [...decisionsRef.current],
          party:    partyRef.current,
          narrative: p.narrative,
        });
        audio.stop();
      }

      // Apply party HP changes
      if (p.partyHpChanges?.length) {
        setParty(prev => prev.map(m => {
          const change = p.partyHpChanges.find(c => c.name === m.name);
          if (!change) return m;
          const newHp = Math.max(0, Math.min(m.maxHp, m.hp + (change.change||0)));
          return { ...m, hp: newHp, dead: newHp === 0 && change.change < 0 ? true : m.dead };
        }));
      }

      const entries = [];
      entries.push({ type:"dm", text:p.narrative, actions:p.actions||[], id:Date.now() });
      if (p.hirelingQuip) {
        // Try to match the quip to a party member by checking their name in the quip text
        const speaker = partyRef.current.find(m =>
          p.hirelingQuip.toLowerCase().includes(m.name.split(" ")[0].toLowerCase())
        ) || partyRef.current[0];
        entries.push({ type:"quip", text:p.hirelingQuip, speaker: speaker?.name || "Companion", id:Date.now()+1 });
      }
      const newMsgs = [...msgs, { role:"assistant", content:raw }];

      // Handle quest updates from DM
      if (p.questUpdate) {
        setQuests(prev => {
          const existing = prev.find(q => q.id === p.questUpdate.id);
          if (existing) return prev.map(q => q.id === p.questUpdate.id ? {...q, ...p.questUpdate} : q);
          return [...prev, p.questUpdate];
        });
        // Auto-award gold on completion
        if (p.questUpdate.status === "completed" && p.questUpdate.reward) {
          setGameState(prev => ({ ...prev, gold: Math.max(0, (prev?.gold||0) + p.questUpdate.reward) }));
        }
      }

      // Update quest journal
      if (p.journalUpdate) {
        setJournal(prev => {
          const j = {
            objectives: [...new Set([...prev.objectives, ...(p.journalUpdate.objectives||[])])],
            npcs:  mergeNpcs(prev.npcs, p.journalUpdate.npcs||[]),
            clues: [...new Set([...prev.clues,  ...(p.journalUpdate.clues||[])])],
            items: [...new Set([...prev.items,  ...(p.journalUpdate.items||[])])],
          };
          journalRef.current = j;
          return j;
        });
      }
      // Update dungeon map
      if (p.mapRoom) {
        setDungeonMap(prev => {
          const rooms = { ...prev.rooms };
          if (!rooms[p.mapRoom.id]) {
            // Auto-assign position for new rooms in a rough grid
            const count = Object.keys(rooms).length;
            const cols  = 3;
            rooms[p.mapRoom.id] = {
              label: p.mapRoom.label,
              connections: p.mapRoom.connections || [],
              x: (count % cols) * 160 + 40,
              y: Math.floor(count / cols) * 100 + 40,
            };
          }
          const updated = { rooms, currentRoom: p.mapRoom.id };
          dungeonMapRef.current = updated;
          return updated;
        });
      }

      setGameState(newState);
      setCombat(newCombat);
      const prevLocation = location;
      if (p.location) setLocation(newLoc);
      // Mira leaves a healing potion when party returns to tavern from elsewhere
      if (newLoc === "The Top Tavern" && prevLocation !== "The Top Tavern" && miraRef.current) {
        setGameState(prev => ({ ...prev, inventory:[...(prev?.inventory||[]), "Healing Potion (from Mira)"] }));
        setLog(prev => [...prev, { type:"quip", text:"Mira catches your eye and nods toward the table. There's a fresh healing potion waiting.", speaker:"Mira", id:Date.now()+2 }]);
      }
      if (p.showMap)  setShowMap(true);
      setActions(p.actions||[]);
      setMessages(newMsgs);
      // If DM requested a roll, enter pending mode — player must roll before acting
      if (p.requestRoll) {
        setPendingRoll(p.requestRoll);
        setAdvMode(p.requestRoll.advantage ? "advantage" : p.requestRoll.disadvantage ? "disadvantage" : "normal");
      }
      setLog(prev => {
        const newLog = [...prev, ...entries];
        saveGame(newState, newMsgs, newLog, p.actions||[], newCombat, newLoc);
        return newLog;
      });
      setTimeout(() => speakWithActions(p.narrative, p.actions||[]), 200);
    } catch(e) {
      console.error(e);
      setLog(prev => [...prev, { type:"error", text:"The connection to the dungeon master flickers in the dark...", id:Date.now() }]);
    }
    setLoading(false);
  }, [speakWithActions, location, blizzard, weather]);

  const doAction = useCallback((action) => {
    if (loading) return;
    // Save undo snapshot before committing
    undoSnapshot.current = {
      gameState:  stateRef.current,
      messages:   msgsRef.current,
      log:        log,
      actions:    actions,
      combat:     combatRef.current,
      party:      partyRef.current,
      journal:    journalRef.current,
      dungeonMap: dungeonMapRef.current,
    };
    setLog(prev => [...prev, { type:"player", text:action, id:Date.now() }]);
    callDM(action);
  }, [loading, callDM, log, actions]);

  const doCustom = useCallback(() => {
    if (!customInput.trim() || loading) return;
    const a = customInput.trim();
    setCustomInput("");
    doAction(a);
  }, [customInput, loading, doAction]);

  const undoAction = useCallback(() => {
    const snap = undoSnapshot.current;
    if (!snap || loading) return;
    setGameState(snap.gameState);
    setMessages(snap.messages);
    setLog(snap.log);
    setActions(snap.actions);
    setCombat(snap.combat);
    if (snap.party     !== undefined) { setParty(snap.party);           partyRef.current      = snap.party; }
    if (snap.journal   !== undefined) { setJournal(snap.journal);       journalRef.current    = snap.journal; }
    if (snap.dungeonMap !== undefined){ setDungeonMap(snap.dungeonMap); dungeonMapRef.current = snap.dungeonMap; }
    undoSnapshot.current = null;
  }, [loading]);

  const exportLog = useCallback(() => {
    const lines = log.map(e => {
      if (e.type === "dm")     return `\n[DUNGEON MASTER]\n${e.text}\n`;
      if (e.type === "player") return `\n> ${e.text}\n`;
      return "";
    }).join("");
    const s = stateRef.current;
    const header = `THE TOP TAVERN — Adventure Log\n${s?.name} the ${s?.class}, Level ${s?.level}\n${"─".repeat(40)}\n`;
    const blob = new Blob([header + lines], { type:"text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${s?.name || "adventure"}-log.txt`; a.click();
    URL.revokeObjectURL(url);
  }, [log]);

  const rollDice = useCallback(() => {
    if (diceRolling) return;
    setDiceRolling(true);
    setDiceResult(null);
    audio.playSfx("diceRoll");
    setTimeout(() => {
      const die    = pendingRoll ? pendingRoll.die : diceType;
      const roll1  = Math.floor(Math.random() * die) + 1;
      const roll2  = Math.floor(Math.random() * die) + 1; // for adv/disadv
      const mode   = pendingRoll ? advMode : "normal";
      let rawRoll  = roll1;
      if (mode === "advantage")    rawRoll = Math.max(roll1, roll2);
      if (mode === "disadvantage") rawRoll = Math.min(roll1, roll2);

      // Apply skill modifier if pending
      let modifier = 0;
      let modLabel = "";
      if (pendingRoll) {
        const mods = SKILL_MODS[stateRef.current?.class] || {};
        modifier   = mods[pendingRoll.skill] ?? 0;
        modLabel   = modifier >= 0 ? `+${modifier}` : `${modifier}`;
      }
      const finalResult = rawRoll + modifier;

      setDiceResult(finalResult);
      setDiceRolling(false);
      setDiceHistory(prev => [{ type:die, result:finalResult, rawRoll, modifier, id:Date.now() }, ...prev].slice(0, 5));

      // If this was a requested check, auto-submit result to DM
      if (pendingRoll) {
        const pr      = pendingRoll;
        const success = finalResult >= pr.dc;
        const advNote = mode === "advantage" ? ` (advantage: rolled ${roll1} & ${roll2}, took ${rawRoll})` :
                        mode === "disadvantage" ? ` (disadvantage: rolled ${roll1} & ${roll2}, took ${rawRoll})` : "";
        const msg = `SKILL CHECK RESULT — ${pr.skill} check: rolled ${rawRoll}${modLabel} = ${finalResult} vs DC ${pr.dc}${advNote}. ${success ? "SUCCESS" : "FAILURE"}.`;
        setPendingRoll(null);
        setAdvMode("normal");
        setTimeout(() => doAction(msg), 300);
      }
    }, 700);
  }, [diceType, diceRolling, pendingRoll, advMode, doAction]);

  const openConfirm = useCallback((title, msg, confirmLabel, onConfirm, onCancel) => {
    setConfirmModal({ title, msg, confirmLabel, onConfirm: onConfirm||null, onCancel: onCancel||null });
  }, []);

  const showToast = useCallback((msg, dur=3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev=>[...prev,{id,msg}]);
    setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)), dur);
  }, []);

  const startGame = useCallback((slotIndex) => {
    if (!charName.trim() || !charClass) return;
    const slot = slotIndex ?? slots.findIndex(s => s === null);
    const assignedSlot = slot === -1 ? 0 : slot;
    setActiveSlot(assignedSlot);
    activeSlotRef.current = assignedSlot;
    const cls = CLASSES[charClass];
    let s = { name:charName.trim(), class:charClass, hp:cls.hp, maxHp:cls.hp, ac:cls.ac, gold:cls.gold, level:1, xp:0, inventory:[...cls.items], rations:cls.rations, abilities:defaultAbilities(charClass), day:1 };
    // Apply backstory bonus if selected
    if (charBackstory) {
      const backstories = BACKSTORIES[charClass] || [];
      const bs = backstories.find(b => b.id === charBackstory);
      if (bs) s = bs.apply(s);
    }
    setGameState(s); setMessages([]); setLog([]); setCombat(null); setScreen("game"); gameStartTime.current = Date.now();
    setTimeout(() => {
      stateRef.current = s; msgsRef.current = [];
      callDM(`START CAMPAIGN. ${s.name} the ${s.class} shoves open the heavy tavern door and steps out of the blizzard into The Top Tavern for the first time. HP:${s.hp}, AC:${s.ac}, Gold:${s.gold}gp. Inventory:${s.inventory.join(",")}. Open with a vivid, immersive scene — the sights, sounds, smells of the tavern; rough miners, suspicious eyes, the fire, the cold behind them. Introduce the world. Then give action options.`);
    }, 80);
  }, [charName, charClass, callDM, slots]);

  const loadSlot = useCallback((slot) => {
    const data = slot.full;
    setActiveSlot(slot.index);
    activeSlotRef.current = slot.index;
    setGameState(data.gameState);
    setMessages(data.messages || []);
    setLog(data.log || []);
    setActions(data.actions || []);
    setCombat(data.combat || null);
    setLocation(data.location || "The Top Tavern");
    setParty(data.party || []);
    partyRef.current = data.party || [];
    setJournal(data.journal || { objectives:[], npcs:[], clues:[], items:[] });
    journalRef.current = data.journal || { objectives:[], npcs:[], clues:[], items:[] };
    setDungeonMap(data.dungeonMap || { rooms:{}, currentRoom:null });
    dungeonMapRef.current = data.dungeonMap || { rooms:{}, currentRoom:null };
    const savedDecisions = data.decisions || [];
    setDecisions(savedDecisions);
    decisionsRef.current = savedDecisions;
    setTurnCount(data.turnCount || 0);
    turnCountRef.current = data.turnCount || 0;
    setEnemiesKilled(data.enemiesKilled || 0);
    enemiesRef.current = data.enemiesKilled || 0;
    setMiraWon(data.miraWon || false);
    miraRef.current = data.miraWon || false;
    setQuests(data.quests || []);
    questsRef.current = data.quests || [];
    setBestiary(data.bestiary || {});
    bestiaryRef.current = data.bestiary || {};
    setNpcRep(data.npcRep || { gorn:0, valdris:0, mira:0, holvik:0 });
    npcRepRef.current = data.npcRep || { gorn:0, valdris:0, mira:0, holvik:0 };
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setBlizzard(data.blizzard || false);
    setWeather(data.weather || null);
    gameStartTime.current = Date.now(); // reset play timer on load
    setScreen("game");
  }, []);

  const shortRest = useCallback(() => {
    const s = stateRef.current;
    if (!s || combatRef.current) return;
    if ((s.rations||0) < 1) { showToast("No rations left — buy some from Gorn."); return; }
    const roll   = Math.floor(Math.random() * HIT_DIE[s.class||"Fighter"]) + 1;
    const healed = Math.min(s.maxHp - s.hp, roll);
    const newHp  = s.hp + healed;
    const newRat = (s.rations||0) - 1;
    setGameState(prev => ({ ...prev, hp: newHp, rations: newRat }));
    setLog(prev => [...prev, { type:"player", text:`Short Rest — rolled d${HIT_DIE[s.class]} and healed ${healed} HP (${newHp}/${s.maxHp}). Rations remaining: ${newRat}.`, id:Date.now() }]);
  }, [combat]);

  const longRest = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    if (location !== "The Top Tavern") { showToast("Long rest only available at The Top Tavern."); return; }
    if ((s.rations||0) < 2) { showToast("Long rest needs 2 rations."); return; }
    const wages   = partyRef.current.filter(m=>!m.dead).reduce((sum, m) => sum + (HIRELINGS[m.id]?.cost||0), 0);
    const newRat  = (s.rations||0) - 2;
    const newGold = Math.max(0, (s.gold||0) - wages);
    const freshAbs = defaultAbilities(s.class);
    setGameState(prev => ({ ...prev, hp: prev.maxHp, rations: newRat, gold: newGold, abilities: freshAbs, day: (prev?.day||1) + 1 }));
    // Restore party HP on long rest
    setParty(prev => prev.filter(m => !m.dead).map(m => ({ ...m, hp: m.maxHp })));
    const wageNote = wages > 0 ? ` Paid ${wages}gp in wages (${partyRef.current.map(m=>m.name).join(", ")}).` : "";
    setLog(prev => [...prev, { type:"player", text:`Long Rest — fully restored to ${s.maxHp}/${s.maxHp} HP. All abilities recharged. Rations remaining: ${newRat}.${wageNote}`, id:Date.now() }]);
  }, [location]);

  const useAbility = useCallback((abilityId) => {
    const s = stateRef.current;
    if (!s) return;
    const abs = s.abilities || {};
    const ab  = abs[abilityId];
    if (!ab) return;
    // Charge ability — spend one charge then send action to DM
    if ("current" in ab) {
      if (ab.current <= 0) { showToast("No charges remaining — rest to recharge."); return; }
      const newAbs = { ...abs, [abilityId]: { ...ab, current: ab.current - 1 } };
      setGameState(prev => ({ ...prev, abilities: newAbs }));
      const abDef = (CLASS_ABILITIES[s.class]||[]).find(a => a.id === abilityId);
      doAction(`Use ${abDef?.name || abilityId}: ${abDef?.desc || ""}`);
    }
    // Toggle ability
    if ("active" in ab) {
      const newAbs = { ...abs, [abilityId]: { active: !ab.active } };
      setGameState(prev => ({ ...prev, abilities: newAbs }));
    }
  }, [doAction]);

  const fastTravel = useCallback(() => {
    if (combat || loading) return;
    doAction("The party carefully retraces their steps, heading back up through the tunnels to The Top Tavern.");
  }, [combat, loading, doAction]);

  const hpColor  = (hp,max) => !max||!hp ? "#4a4a4a" : hp/max > 0.6 ? "#4ade80" : hp/max > 0.3 ? "#facc15" : "#ef4444";
  const hpPct    = (hp,max) => !max ? 0 : Math.round((Math.max(0,hp)/max)*100);

  // ── Tavern Map SVG ──────────────────────────────────────────────────────────
  const TavernMap = () => (
    <svg viewBox="0 0 440 340" style={{width:"100%",maxWidth:480,display:"block"}}>
      <rect width="440" height="340" fill="#0d0905"/>
      <rect x="6" y="6" width="428" height="328" fill="none" stroke="#c8982a" strokeWidth="2.5"/>
      <rect x="6" y="6" width="428" height="328" fill="none" stroke="#c8982a44" strokeWidth="8"/>
      {/* Outer walls detail */}
      <rect x="20" y="20" width="180" height="42" fill="#2a1608" stroke="#c8982a" strokeWidth="1.5" rx="2"/>
      <text x="110" y="45" fill="#c8982a" fontSize="13" textAnchor="middle" fontFamily="Georgia,serif" fontStyle="italic">— Bar —</text>
      <text x="110" y="32" fill="#8b6030" fontSize="10" textAnchor="middle" fontFamily="Georgia,serif">Gorn the Barman</text>
      {/* Fireplace */}
      <rect x="192" y="8" width="56" height="32" fill="#1a0805" stroke="#ff6622" strokeWidth="1.5" rx="2"/>
      <rect x="196" y="12" width="48" height="24" fill="#2a1005" rx="1"/>
      <text x="220" y="30" fill="#ff9933" fontSize="16" textAnchor="middle">🔥</text>
      {/* Tables */}
      {[[90,130,"Miners"],[220,130,"Locals"],[90,240,"Corner"],[220,240,"Center"],[350,130,"Back"]].map(([x,y,lbl],i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx="32" ry="22" fill="#1e1005" stroke="#7a5025" strokeWidth="1.2"/>
          <text x={x} y={y+5} fill="#7a5025" fontSize="10" textAnchor="middle" fontFamily="Georgia,serif">{lbl}</text>
          {[[-38,0],[38,0],[0,-28],[0,28]].map(([dx,dy],j)=>(
            <circle key={j} cx={x+dx} cy={y+dy} r="7" fill="#140c05" stroke="#5a3515" strokeWidth="1"/>
          ))}
        </g>
      ))}
      {/* Back Storage Room */}
      <rect x="318" y="14" width="114" height="140" fill="#08060a" stroke="#c8982a" strokeWidth="1.5" strokeDasharray="6,3"/>
      <text x="375" y="60" fill="#c8982a" fontSize="12" textAnchor="middle" fontFamily="Georgia,serif">Storage</text>
      <text x="375" y="78" fill="#c8982a" fontSize="12" textAnchor="middle" fontFamily="Georgia,serif">Room</text>
      {/* Stairwell */}
      <rect x="348" y="100" width="54" height="44" fill="#0a0508" stroke="#ff4444" strokeWidth="1.5" rx="2"/>
      <text x="375" y="118" fill="#ff4444" fontSize="11" textAnchor="middle" fontFamily="Georgia,serif">Stairwell</text>
      <text x="375" y="134" fill="#ff4444" fontSize="18" textAnchor="middle">▼</text>
      {/* Stairs to deep label */}
      <text x="375" y="168" fill="#ff444499" fontSize="9" textAnchor="middle" fontFamily="Georgia,serif">ancient steps...</text>
      {/* Main door */}
      <rect x="192" y="322" width="56" height="16" fill="#3a2010" stroke="#c8982a" strokeWidth="1.2" rx="1"/>
      <text x="220" y="334" fill="#c8982a" fontSize="9" textAnchor="middle" fontFamily="Georgia,serif">DOOR (BLIZZARD)</text>
      {/* YOU marker */}
      <circle cx="220" cy="220" r="11" fill="#ef4444" opacity="0.85"/>
      <text x="220" y="225" fill="white" fontSize="10" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="bold">YOU</text>
      {/* Compass */}
      <text x="420" y="320" fill="#8b6030" fontSize="9" textAnchor="end" fontFamily="Georgia,serif">N ↑</text>
      {/* Legend */}
      <rect x="14" y="296" width="170" height="36" fill="#0d0905" stroke="#5a3515" strokeWidth="0.5" rx="2"/>
      <circle cx="26" cy="308" r="6" fill="#ef4444" opacity="0.85"/>
      <text x="36" y="313" fill="#8b6030" fontSize="10" fontFamily="Georgia,serif">You   </text>
      <rect x="80" y="302" width="12" height="10" fill="#08060a" stroke="#ff4444" strokeWidth="1" rx="1"/>
      <text x="96" y="313" fill="#8b6030" fontSize="10" fontFamily="Georgia,serif">Secret stair</text>
    </svg>
  );

  // ── INTRO ───────────────────────────────────────────────────────────────────
  if (screen === "intro") {
    const filledSlots = slots.filter(Boolean);
    return (
    <div style={{minHeight:"100vh",position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",fontFamily:"'Crimson Text',Georgia,serif",overflow:"hidden"}}>
      <style>{FONTS}</style>

      {/* Full-bleed tavern exterior — The Top Pub, Rosebery Tasmania, dark fantasy, no electricity */}
      <div style={{position:"absolute",inset:0,zIndex:0}}>
        <svg viewBox="0 0 900 580" preserveAspectRatio="xMidYMid slice" style={{width:"100%",height:"100%",display:"block"}} xmlns="http://www.w3.org/2000/svg">
          <rect width="900" height="580" fill="#030408"/>
          <rect x="0" y="0" width="900" height="340" fill="#04050c"/>
          <ellipse cx="150"  cy="55"  rx="200" ry="75"  fill="#060810" opacity="0.95"/>
          <ellipse cx="420"  cy="38"  rx="260" ry="80"  fill="#050710" opacity="0.95"/>
          <ellipse cx="700"  cy="50"  rx="240" ry="70"  fill="#060810" opacity="0.95"/>
          <ellipse cx="280"  cy="110" rx="200" ry="60"  fill="#07091a" opacity="0.8"/>
          <ellipse cx="560"  cy="100" rx="280" ry="65"  fill="#060810" opacity="0.8"/>
          <ellipse cx="760" cy="55" rx="100" ry="60" fill="#181e2a" opacity="0.18"/>
          <ellipse cx="760" cy="55" rx="45"  ry="30" fill="#2a3545" opacity="0.10"/>
          <polygon points="0,290 80,165 180,235 290,145 390,205 490,135 590,195 690,125 790,178 900,155 900,290" fill="#060809" opacity="1"/>
          <polygon points="0,308 60,228 160,275 250,208 350,260 450,192 550,245 650,190 750,238 850,200 900,220 900,308" fill="#050708"/>
          <polygon points="0,325 50,278 130,305 210,268 320,308 415,260 515,300 615,255 715,294 810,260 900,280 900,325" fill="#040606"/>
          <polygon points="30,328  38,294 46,328"  fill="#030505"/>
          <polygon points="50,325  60,285 70,325"  fill="#030505"/>
          <polygon points="72,327  82,292 92,327"  fill="#030505"/>
          <polygon points="808,328 818,294 828,328" fill="#030505"/>
          <polygon points="830,325 840,285 850,325" fill="#030505"/>
          <polygon points="852,327 862,292 872,327" fill="#030505"/>
          <rect x="0" y="462" width="900" height="118" fill="#0c0a09"/>
          <rect x="0" y="462" width="900" height="16" fill="#0b0908"/>
          <rect x="0" y="479" width="900" height="14" fill="#0a0807"/>
          <rect x="0" y="494" width="900" height="16" fill="#0b0908"/>
          <rect x="0" y="511" width="900" height="14" fill="#0a0807"/>
          <rect x="0" y="526" width="900" height="16" fill="#0b0908"/>
          <rect x="0" y="543" width="900" height="37" fill="#0a0807"/>
          <line x1="42"  y1="462" x2="40"  y2="580" stroke="#080706" strokeWidth="1" opacity="0.8"/>
          <line x1="90"  y1="462" x2="88"  y2="580" stroke="#080706" strokeWidth="1" opacity="0.8"/>
          <line x1="136" y1="462" x2="134" y2="580" stroke="#080706" strokeWidth="1" opacity="0.8"/>
          <line x1="180" y1="462" x2="178" y2="580" stroke="#080706" strokeWidth="1" opacity="0.8"/>
          <line x1="224" y1="462" x2="222" y2="580" stroke="#080706" strokeWidth="1" opacity="0.8"/>
          <line x1="662" y1="462" x2="660" y2="580" stroke="#080706" strokeWidth="1" opacity="0.8"/>
          <line x1="706" y1="462" x2="704" y2="580" stroke="#080706" strokeWidth="1" opacity="0.8"/>
          <line x1="750" y1="462" x2="748" y2="580" stroke="#080706" strokeWidth="1" opacity="0.8"/>
          <line x1="796" y1="462" x2="794" y2="580" stroke="#080706" strokeWidth="1" opacity="0.8"/>
          <line x1="840" y1="462" x2="838" y2="580" stroke="#080706" strokeWidth="1" opacity="0.8"/>
          <ellipse cx="100" cy="466" rx="80"  ry="8"  fill="#c8d4dc" opacity="0.12"/>
          <ellipse cx="800" cy="468" rx="90"  ry="8"  fill="#c8d4dc" opacity="0.10"/>
          <rect x="0"   y="285" width="160" height="180" fill="#070605"/>
          <rect x="740" y="285" width="160" height="180" fill="#070605"/>
          <rect x="76" y="304" width="36" height="26" rx="1" fill="#0c0904"/>
          <rect x="78" y="306" width="32" height="22" fill="#1a1005" opacity="0.4"/>
          <polygon points="155,204 745,204 745,270 155,270" fill="#080706"/>
          <polygon points="155,204 745,204 750,199 160,199" fill="#0a0908"/>
          <rect x="155" y="199" width="590" height="7" fill="#0c0a08"/>
          <rect x="155" y="199" width="590" height="2" fill="#c8d4dc" opacity="0.08"/>
          <rect x="155" y="266" width="590" height="7" fill="#b8c8d4" opacity="0.35"/>
          <rect x="155" y="269" width="590" height="4" fill="#d0e0ec" opacity="0.22"/>
          <rect x="155" y="270" width="590" height="110" fill="#080706"/>
          <line x1="155" y1="282" x2="745" y2="282" stroke="#0a0806" strokeWidth="1" opacity="0.6"/>
          <line x1="155" y1="294" x2="745" y2="294" stroke="#0a0806" strokeWidth="1" opacity="0.6"/>
          <line x1="155" y1="306" x2="745" y2="306" stroke="#0a0806" strokeWidth="1" opacity="0.6"/>
          <line x1="155" y1="318" x2="745" y2="318" stroke="#0a0806" strokeWidth="1" opacity="0.6"/>
          <line x1="155" y1="330" x2="745" y2="330" stroke="#0a0806" strokeWidth="1" opacity="0.6"/>
          <line x1="155" y1="342" x2="745" y2="342" stroke="#0a0806" strokeWidth="1" opacity="0.6"/>
          <line x1="155" y1="354" x2="745" y2="354" stroke="#0a0806" strokeWidth="1" opacity="0.6"/>
          <line x1="155" y1="366" x2="745" y2="366" stroke="#0a0806" strokeWidth="1" opacity="0.6"/>
          <rect x="178" y="282" width="72" height="80" rx="2" fill="#0a0806"/>
          <rect x="180" y="284" width="68" height="76" fill="#1c1005" opacity="0.6"/>
          <line x1="214" y1="284" x2="214" y2="360" stroke="#120c04" strokeWidth="1.5"/>
          <line x1="180" y1="322" x2="248" y2="322" stroke="#120c04" strokeWidth="1.5"/>
          <rect x="180" y="284" width="68" height="76" fill="#c87808" opacity="0.06"/>
          <rect x="302" y="282" width="72" height="80" rx="2" fill="#090705"/>
          <rect x="304" y="284" width="68" height="76" fill="#0c0804"/>
          <line x1="338" y1="284" x2="338" y2="362" stroke="#100a04" strokeWidth="1.5"/>
          <line x1="304" y1="323" x2="372" y2="323" stroke="#100a04" strokeWidth="1.5"/>
          <rect x="426" y="282" width="72" height="80" rx="2" fill="#0a0806"/>
          <rect x="428" y="284" width="68" height="76" fill="#201205" opacity="0.7"/>
          <line x1="462" y1="284" x2="462" y2="362" stroke="#120c04" strokeWidth="1.5"/>
          <line x1="428" y1="323" x2="496" y2="323" stroke="#120c04" strokeWidth="1.5"/>
          <rect x="428" y="284" width="68" height="76" fill="#c87808" opacity="0.09"/>
          <ellipse cx="455" cy="308" rx="9" ry="10" fill="#100804" opacity="0.8"/>
          <rect x="448" y="317" width="18" height="22" rx="3" fill="#100804" opacity="0.7"/>
          <rect x="550" y="282" width="72" height="80" rx="2" fill="#090705"/>
          <rect x="552" y="284" width="68" height="76" fill="#0c0804"/>
          <line x1="586" y1="284" x2="586" y2="362" stroke="#100a04" strokeWidth="1.5"/>
          <line x1="552" y1="323" x2="620" y2="323" stroke="#100a04" strokeWidth="1.5"/>
          <rect x="674" y="282" width="72" height="80" rx="2" fill="#0a0806"/>
          <rect x="676" y="284" width="68" height="76" fill="#1a1004" opacity="0.6"/>
          <line x1="710" y1="284" x2="710" y2="362" stroke="#120c04" strokeWidth="1.5"/>
          <line x1="676" y1="323" x2="744" y2="323" stroke="#120c04" strokeWidth="1.5"/>
          <rect x="676" y="284" width="68" height="76" fill="#c87808" opacity="0.07"/>
          <rect x="155" y="442" width="590" height="24" fill="#0c0a07"/>
          <rect x="155" y="442" width="88"  height="24" fill="#0d0b08" stroke="#141008" strokeWidth="1.5"/>
          <rect x="245" y="442" width="62"  height="24" fill="#0b0907" stroke="#141008" strokeWidth="1.5"/>
          <rect x="309" y="442" width="96"  height="24" fill="#0e0c09" stroke="#141008" strokeWidth="1.5"/>
          <rect x="407" y="442" width="72"  height="24" fill="#0c0a07" stroke="#141008" strokeWidth="1.5"/>
          <rect x="481" y="442" width="84"  height="24" fill="#0e0c09" stroke="#141008" strokeWidth="1.5"/>
          <rect x="567" y="442" width="68"  height="24" fill="#0b0907" stroke="#141008" strokeWidth="1.5"/>
          <rect x="637" y="442" width="106" height="24" fill="#0d0b08" stroke="#141008" strokeWidth="1.5"/>
          <rect x="155" y="454" width="74"  height="12" fill="#0a0807" stroke="#100c06" strokeWidth="1"/>
          <rect x="231" y="454" width="96"  height="12" fill="#090706" stroke="#100c06" strokeWidth="1"/>
          <rect x="329" y="454" width="60"  height="12" fill="#0b0908" stroke="#100c06" strokeWidth="1"/>
          <rect x="391" y="454" width="82"  height="12" fill="#0a0807" stroke="#100c06" strokeWidth="1"/>
          <rect x="475" y="454" width="54"  height="12" fill="#090706" stroke="#100c06" strokeWidth="1"/>
          <rect x="531" y="454" width="78"  height="12" fill="#0b0908" stroke="#100c06" strokeWidth="1"/>
          <rect x="611" y="454" width="132" height="12" fill="#0a0807" stroke="#100c06" strokeWidth="1"/>
          <path d="M175 449 L178 445 L181 449 L184 445 L187 449" stroke="#9b2a1a" strokeWidth="1.3" fill="none" opacity="0.75"/>
          <ellipse cx="181" cy="448" rx="8" ry="4" fill="#8b0000" opacity="0.18"/>
          <line x1="262" y1="444" x2="262" y2="454" stroke="#9b1a1a" strokeWidth="1.2" opacity="0.65"/>
          <line x1="266" y1="444" x2="266" y2="454" stroke="#9b1a1a" strokeWidth="1.2" opacity="0.65"/>
          <line x1="260" y1="448" x2="268" y2="448" stroke="#9b1a1a" strokeWidth="1"   opacity="0.65"/>
          <ellipse cx="264" cy="449" rx="7" ry="4" fill="#8b0000" opacity="0.14"/>
          <path d="M346 444 L350 450 L354 444 M348 450 L348 455" stroke="#b03020" strokeWidth="1.4" fill="none" opacity="0.75"/>
          <path d="M343 447 L357 447" stroke="#b03020" strokeWidth="0.9" opacity="0.65"/>
          <ellipse cx="350" cy="449" rx="9" ry="5" fill="#8b0000" opacity="0.2"/>
          <path d="M425 445 L425 455 M422 449 L428 449 M422 445 L425 445 M425 455 L428 455" stroke="#9b1a1a" strokeWidth="1.1" fill="none" opacity="0.6"/>
          <text x="500" y="454" fill="#7b1010" fontSize="7" fontFamily="Georgia,serif" letterSpacing="2" opacity="0.5">ᛗᚨᛚᚷᚱᚨᚦ</text>
          <path d="M618 445 L622 455 M622 445 L618 455" stroke="#9b1a1a" strokeWidth="1.3" opacity="0.6"/>
          <ellipse cx="620" cy="450" rx="6" ry="4" fill="#8b0000" opacity="0.14"/>
          <rect x="155" y="442" width="590" height="26" fill="#8b0000" opacity="0.07"/>
          <path d="M290 466 L285 483 L292 499 L287 518 L293 538 L289 560" stroke="#070504" strokeWidth="4" fill="none"/>
          <path d="M290 466 L285 483 L292 499 L287 518 L293 538 L289 560" stroke="#c01818" strokeWidth="1.4" fill="none" opacity="0.85"/>
          <ellipse cx="289" cy="498" rx="14" ry="45" fill="#8b0000" opacity="0.3"/>
          <ellipse cx="289" cy="498" rx="7"  ry="28" fill="#c81818" opacity="0.2"/>
          <path d="M292 492 L312 502 L332 497 L348 507" stroke="#070504" strokeWidth="2" fill="none"/>
          <path d="M292 492 L312 502 L332 497 L348 507" stroke="#a01010" strokeWidth="0.9" fill="none" opacity="0.65"/>
          <ellipse cx="320" cy="500" rx="22" ry="8" fill="#8b0000" opacity="0.16"/>
          <path d="M582 466 L577 480 L583 497 L578 516 L584 533 L579 560" stroke="#070504" strokeWidth="4.5" fill="none"/>
          <path d="M582 466 L577 480 L583 497 L578 516 L584 533 L579 560" stroke="#c01818" strokeWidth="1.6" fill="none" opacity="0.9"/>
          <ellipse cx="580" cy="502" rx="16" ry="48" fill="#8b0000" opacity="0.34"/>
          <ellipse cx="580" cy="502" rx="8"  ry="32" fill="#c81818" opacity="0.22"/>
          <path d="M579 491 L598 499 L624 492 L645 500" stroke="#070504" strokeWidth="2" fill="none"/>
          <path d="M579 491 L598 499 L624 492 L645 500" stroke="#a01010" strokeWidth="0.9" fill="none" opacity="0.6"/>
          <path d="M197 467 L200 485 L196 505 L199 528 L196 552" stroke="#8b1010" strokeWidth="0.9" fill="none" opacity="0.7"/>
          <ellipse cx="197" cy="500" rx="5" ry="32" fill="#8b0000" opacity="0.16"/>
          <path d="M452 466 L455 480 L450 494 L453 512 L450 530" stroke="#8b1010" strokeWidth="1.1" fill="none" opacity="0.65"/>
          <ellipse cx="452" cy="494" rx="6" ry="25" fill="#8b0000" opacity="0.16"/>
          <ellipse cx="290" cy="466" rx="35" ry="9"  fill="#8b0000" opacity="0.22" style={{animation:"pulse 3s infinite"}}/>
          <ellipse cx="290" cy="462" rx="20" ry="5"  fill="#9b1010" opacity="0.14"/>
          <ellipse cx="582" cy="466" rx="38" ry="10" fill="#8b0000" opacity="0.24" style={{animation:"pulse 4s infinite"}}/>
          <ellipse cx="582" cy="461" rx="22" ry="5"  fill="#9b1010" opacity="0.16"/>
          <ellipse cx="450" cy="466" rx="25" ry="7"  fill="#8b0000" opacity="0.16"/>
          <ellipse cx="450" cy="468" rx="260" ry="7" fill="#8b0000" opacity="0.1"/>
          <circle cx="450" cy="508" r="74" fill="none" stroke="#6b0f0f" strokeWidth="1.4" opacity="0.5"/>
          <circle cx="450" cy="508" r="63" fill="none" stroke="#560c0c" strokeWidth="0.9" opacity="0.4"/>
          <line x1="450" y1="434" x2="416" y2="563" stroke="#6b0f0f" strokeWidth="0.8" opacity="0.38"/>
          <line x1="450" y1="434" x2="514" y2="558" stroke="#6b0f0f" strokeWidth="0.8" opacity="0.38"/>
          <line x1="386" y1="479" x2="514" y2="479" stroke="#6b0f0f" strokeWidth="0.8" opacity="0.38"/>
          <line x1="386" y1="479" x2="485" y2="560" stroke="#6b0f0f" strokeWidth="0.8" opacity="0.38"/>
          <line x1="514" y1="479" x2="415" y2="560" stroke="#6b0f0f" strokeWidth="0.8" opacity="0.38"/>
          <circle cx="450" cy="508" r="28" fill="none" stroke="#500a0a" strokeWidth="1" opacity="0.35"/>
          <circle cx="450" cy="508" r="74" fill="#8b0000" opacity="0.1"/>
          <circle cx="450" cy="508" r="40" fill="#8b0000" opacity="0.1"/>
          <circle cx="450" cy="508" r="20" fill="#a01010" opacity="0.1"/>
          <text x="450" y="437" fill="#7b1010" fontSize="9" textAnchor="middle" fontFamily="Georgia,serif" opacity="0.45">ᛗ</text>
          <text x="513" y="467" fill="#7b1010" fontSize="9" textAnchor="middle" fontFamily="Georgia,serif" opacity="0.38">ᚨ</text>
          <text x="525" y="524" fill="#7b1010" fontSize="9" textAnchor="middle" fontFamily="Georgia,serif" opacity="0.4">ᛚ</text>
          <text x="480" y="575" fill="#7b1010" fontSize="9" textAnchor="middle" fontFamily="Georgia,serif" opacity="0.35">ᚷ</text>
          <text x="420" y="575" fill="#7b1010" fontSize="9" textAnchor="middle" fontFamily="Georgia,serif" opacity="0.35">ᚱ</text>
          <text x="375" y="524" fill="#7b1010" fontSize="9" textAnchor="middle" fontFamily="Georgia,serif" opacity="0.4">ᚨ</text>
          <text x="387" y="467" fill="#7b1010" fontSize="9" textAnchor="middle" fontFamily="Georgia,serif" opacity="0.38">ᚦ</text>
          <rect x="155" y="378" width="590" height="16" fill="#0c0a07" stroke="#141008" strokeWidth="1"/>
          <rect x="155" y="380" width="590" height="64" fill="#080605"/>
          <rect x="168" y="380" width="10" height="64" fill="#0e0c08"/>
          <rect x="286" y="380" width="10" height="64" fill="#0e0c08"/>
          <rect x="404" y="380" width="10" height="64" fill="#0e0c08"/>
          <rect x="522" y="380" width="10" height="64" fill="#0e0c08"/>
          <rect x="640" y="380" width="10" height="64" fill="#0e0c08"/>
          <rect x="726" y="380" width="10" height="64" fill="#0e0c08"/>
          <rect x="155" y="373" width="590" height="6" fill="#b8c8d4" opacity="0.3"/>
          <rect x="175" y="393" width="100" height="50" rx="2" fill="#090705" stroke="#141008" strokeWidth="2"/>
          <rect x="177" y="395" width="96"  height="46" fill="#120b03" opacity="0.9"/>
          <line x1="225" y1="395" x2="225" y2="441" stroke="#100a04" strokeWidth="1.5"/>
          <line x1="177" y1="418" x2="273" y2="418" stroke="#100a04" strokeWidth="1.5"/>
          <rect x="177" y="395" width="96"  height="46" fill="#c87808" opacity="0.08"/>
          <ellipse cx="202" cy="408" rx="9" ry="9" fill="#0c0702" opacity="0.9"/>
          <rect x="195" y="416" width="16" height="18" rx="3" fill="#0c0702" opacity="0.85"/>
          <rect x="620" y="393" width="100" height="50" rx="2" fill="#090705" stroke="#141008" strokeWidth="2"/>
          <rect x="622" y="395" width="96"  height="46" fill="#120b03" opacity="0.9"/>
          <line x1="670" y1="395" x2="670" y2="441" stroke="#100a04" strokeWidth="1.5"/>
          <line x1="622" y1="418" x2="718" y2="418" stroke="#100a04" strokeWidth="1.5"/>
          <rect x="622" y="395" width="96"  height="46" fill="#c87808" opacity="0.06"/>
          <rect x="366" y="390" width="80" height="54" rx="2" fill="#0a0806" stroke="#161008" strokeWidth="2.5"/>
          <rect x="370" y="394" width="72" height="46" rx="1" fill="#0e0a06"/>
          <rect x="374" y="398" width="30" height="17" rx="1" fill="#0c0804" stroke="#141008" strokeWidth="1"/>
          <rect x="408" y="398" width="30" height="17" rx="1" fill="#0c0804" stroke="#141008" strokeWidth="1"/>
          <rect x="374" y="420" width="30" height="15" rx="1" fill="#0c0804" stroke="#141008" strokeWidth="1"/>
          <rect x="408" y="420" width="30" height="15" rx="1" fill="#0c0804" stroke="#141008" strokeWidth="1"/>
          <circle cx="401" cy="413" r="4" fill="#2a1808"/>
          <circle cx="401" cy="413" r="2.5" fill="#3a2010"/>
          <rect x="370" y="440" width="72" height="3" fill="#e07808" opacity="0.22"/>
          <rect x="348" y="400" width="7"  height="34" rx="2" fill="#2a1808"/>
          <rect x="344" y="396" width="15" height="10" rx="2" fill="#201408"/>
          <ellipse cx="351" cy="396" rx="8" ry="6"  fill="#b83808" opacity="0.8" style={{animation:"pulse 1.8s infinite"}}/>
          <ellipse cx="351" cy="393" rx="6" ry="7"  fill="#d06010" opacity="0.75"/>
          <ellipse cx="351" cy="390" rx="4" ry="6"  fill="#e88018" opacity="0.7" style={{animation:"pulse 0.9s infinite"}}/>
          <ellipse cx="351" cy="387" rx="2.5" ry="5" fill="#f8c030" opacity="0.65" style={{animation:"pulse 1.1s infinite"}}/>
          <ellipse cx="351" cy="400" rx="45" ry="40" fill="#c87808" opacity="0.22"/>
          <ellipse cx="351" cy="420" rx="70" ry="50" fill="#c87808" opacity="0.12"/>
          <ellipse cx="351" cy="450" rx="90" ry="40" fill="#c87808" opacity="0.07"/>
          <ellipse cx="340" cy="475" rx="50" ry="18" fill="#c87808" opacity="0.12"/>
          <rect x="460" y="400" width="7"  height="34" rx="2" fill="#2a1808"/>
          <rect x="456" y="396" width="15" height="10" rx="2" fill="#201408"/>
          <ellipse cx="463" cy="396" rx="8" ry="6"  fill="#b83808" opacity="0.8" style={{animation:"pulse 2.1s infinite"}}/>
          <ellipse cx="463" cy="393" rx="6" ry="7"  fill="#d06010" opacity="0.75"/>
          <ellipse cx="463" cy="390" rx="4" ry="6"  fill="#e88018" opacity="0.7" style={{animation:"pulse 1.0s infinite"}}/>
          <ellipse cx="463" cy="387" rx="2.5" ry="5" fill="#f8c030" opacity="0.65" style={{animation:"pulse 1.3s infinite"}}/>
          <ellipse cx="463" cy="400" rx="45" ry="40" fill="#c87808" opacity="0.22"/>
          <ellipse cx="463" cy="420" rx="70" ry="50" fill="#c87808" opacity="0.12"/>
          <ellipse cx="463" cy="450" rx="90" ry="40" fill="#c87808" opacity="0.07"/>
          <ellipse cx="475" cy="475" rx="50" ry="18" fill="#c87808" opacity="0.12"/>
          <rect x="340" y="442" width="136" height="26" fill="#c87808" opacity="0.06"/>
          <line x1="340" y1="252" x2="340" y2="278" stroke="#2a1808" strokeWidth="3"/>
          <line x1="340" y1="252" x2="430" y2="252" stroke="#2a1808" strokeWidth="3"/>
          <line x1="430" y1="252" x2="430" y2="278" stroke="#2a1808" strokeWidth="3"/>
          <rect x="300" y="222" width="260" height="56" rx="3" fill="#130f08" stroke="#4a3010" strokeWidth="1.5"/>
          <rect x="303" y="225" width="254" height="50" rx="2" fill="#0f0b06"/>
          <rect x="305" y="227" width="250" height="46" rx="1" fill="none" stroke="#3a2408" strokeWidth="1"/>
          <text x="430" y="248" fill="#a87828" fontSize="13" textAnchor="middle" fontFamily="Georgia,serif" letterSpacing="3" fontWeight="bold" opacity="0.8">THE TOP TAVERN</text>
          <text x="430" y="264" fill="#604818" fontSize="9"  textAnchor="middle" fontFamily="Georgia,serif" letterSpacing="4" opacity="0.6">EST. IN DARKNESS</text>
          <rect x="96" y="342" width="6" height="123" fill="#0e0d0a"/>
          <path d="M99 342 Q99 312 130 307 L136 307" stroke="#0e0d0a" strokeWidth="5" fill="none"/>
          <rect x="128" y="297" width="26" height="32" rx="3" fill="#0e0c08" stroke="#1a1810" strokeWidth="1.5"/>
          <rect x="130" y="299" width="22" height="28" rx="1" fill="#100e08"/>
          <ellipse cx="141" cy="308" rx="5" ry="4" fill="#c08010" opacity="0.7"/>
          <ellipse cx="141" cy="306" rx="3" ry="4" fill="#e0a020" opacity="0.6"/>
          <ellipse cx="141" cy="360" rx="28" ry="22" fill="#c08010" opacity="0.08"/>
          <ellipse cx="141" cy="420" rx="40" ry="30" fill="#c08010" opacity="0.05"/>
          <rect x="93" y="462" width="12" height="8" rx="2" fill="#0e0d0a"/>
          <ellipse cx="640" cy="448" rx="12" ry="11" fill="#080604"/>
          <rect x="630" y="457" width="22" height="34" rx="5" fill="#090704"/>
          <rect x="622" y="465" width="10" height="20" rx="4" fill="#090704"/>
          <path d="M650 465 L658 473" stroke="#090704" strokeWidth="6" strokeLinecap="round"/>
          <line x1="656" y1="450" x2="660" y2="494" stroke="#0e0c08" strokeWidth="2.5"/>
          <circle cx="42"  cy="46"  r="1.4" fill="white" opacity="0.45"/>
          <circle cx="115" cy="30"  r="1.0" fill="white" opacity="0.38"/>
          <circle cx="188" cy="64"  r="1.8" fill="white" opacity="0.32"/>
          <circle cx="252" cy="37"  r="1.2" fill="white" opacity="0.42"/>
          <circle cx="318" cy="57"  r="1.6" fill="white" opacity="0.35"/>
          <circle cx="456" cy="50"  r="1.4" fill="white" opacity="0.38"/>
          <circle cx="524" cy="34"  r="2.0" fill="white" opacity="0.30"/>
          <circle cx="593" cy="62"  r="1.2" fill="white" opacity="0.40"/>
          <circle cx="724" cy="44"  r="1.0" fill="white" opacity="0.45"/>
          <circle cx="793" cy="30"  r="1.4" fill="white" opacity="0.38"/>
          <circle cx="80"  cy="122" r="1.6" fill="white" opacity="0.35"/>
          <circle cx="148" cy="98"  r="1.2" fill="white" opacity="0.42"/>
          <circle cx="298" cy="108" r="1.4" fill="white" opacity="0.36"/>
          <circle cx="519" cy="100" r="2.0" fill="white" opacity="0.25"/>
          <circle cx="718" cy="94"  r="1.8" fill="white" opacity="0.30"/>
          <circle cx="57"  cy="198" r="2.0" fill="white" opacity="0.25"/>
          <circle cx="212" cy="213" r="1.4" fill="white" opacity="0.32"/>
          <circle cx="358" cy="224" r="1.8" fill="white" opacity="0.27"/>
          <circle cx="506" cy="178" r="1.0" fill="white" opacity="0.42"/>
          <circle cx="638" cy="193" r="2.0" fill="white" opacity="0.25"/>
          <circle cx="768" cy="208" r="1.6" fill="white" opacity="0.32"/>
          <rect x="178" y="282" width="72"  height="3" fill="#b8c8d4" opacity="0.25"/>
          <rect x="426" y="282" width="72"  height="3" fill="#b8c8d4" opacity="0.25"/>
          <rect x="674" y="282" width="72"  height="3" fill="#b8c8d4" opacity="0.25"/>
          <rect x="177" y="393" width="96"  height="3" fill="#b8c8d4" opacity="0.2"/>
          <rect x="622" y="393" width="96"  height="3" fill="#b8c8d4" opacity="0.2"/>
          <rect x="0"   y="0"   width="80"  height="580" fill="#000000" opacity="0.6"/>
          <rect x="820" y="0"   width="80"  height="580" fill="#000000" opacity="0.6"/>
          <rect x="0"   y="0"   width="900" height="60"  fill="#000000" opacity="0.65"/>
          <rect x="0"   y="540" width="900" height="40"  fill="#000000" opacity="0.75"/>
          <rect x="0"   y="0"   width="900" height="20"  fill="#060a18" opacity="0.5"/>
        </svg>
      </div>

      {/* Foreground UI — animated intro sequence */}
      {(()=>{
        const vis = (phase) => ({
          opacity: introPhase >= phase ? 1 : 0,
          transform: introPhase >= phase ? "translateY(0)" : "translateY(12px)",
          transition: "opacity .9s ease-out, transform .9s ease-out",
        });
        return (
        <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:580,
          background:"rgba(0,0,0,0.62)",backdropFilter:"blur(2px)",
          padding:"36px 40px",
          borderTop:"1px solid rgba(200,152,42,0.18)",
          borderBottom:"1px solid rgba(200,152,42,0.18)"}}>

          {/* Decorators */}
          <div style={{color:"#c8982a",fontSize:"16px",letterSpacing:"10px",marginBottom:"16px",opacity: introPhase>=1 ? 0.7:0, transition:"opacity 1s ease-out"}}>— ✦ ✦ ✦ —</div>

          {/* Title — typewriter via clip-path reveal */}
          <h1 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(30px,7vw,58px)",fontWeight:900,
            color:"#c8982a",letterSpacing:"5px",lineHeight:1.1,marginBottom:"8px",
            textShadow:"0 2px 24px rgba(200,152,42,0.4)",
            ...vis(1)}}>
            THE TOP TAVERN
          </h1>

          {/* Subtitle */}
          <div style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(11px,2vw,14px)",color:"#7a5828",letterSpacing:"8px",marginBottom:"6px",...vis(2)}}>
            A SOLO D&amp;D ADVENTURE
          </div>
          <div style={{color:"#5a3820",fontSize:"11px",letterSpacing:"6px",marginBottom:"24px",...vis(2)}}>
            EST. IN DARKNESS
          </div>

          <div style={{width:"50px",height:"1px",background:"#3a2810",margin:"0 auto 22px",opacity: introPhase>=2?1:0,transition:"opacity 1s ease-out"}}/>

          {/* Quote */}
          <p style={{color:"#c9aa7a",fontSize:"15px",lineHeight:1.95,marginBottom:"14px",fontStyle:"italic",
            borderLeft:"2px solid #4a2c10",paddingLeft:"18px",textAlign:"left",
            ...vis(3)}}>
            "The wind howls outside. The blizzard has sealed the mountain road for three days.
            Miners drink in uneasy silence. No one mentions the men who went missing last week.
            Something stirs beneath the town."
          </p>
          <p style={{color:"#6a5030",fontSize:"13px",lineHeight:1.7,marginBottom:"30px",...vis(3)}}>
            An immersive solo campaign powered by an AI Dungeon Master.
          </p>

          {/* Buttons — only appear after full intro */}
          <div style={{display:"flex",gap:"14px",justifyContent:"center",flexWrap:"wrap",
            marginBottom: filledSlots.length ? "24px" : "0",
            ...vis(4)}}>
            <button onClick={()=>setScreen("create")}
              style={{background:"rgba(0,0,0,0.6)",border:"2px solid #c8982a",color:"#c8982a",fontFamily:"'Cinzel',serif",fontSize:"14px",letterSpacing:"4px",padding:"14px 36px",cursor:"pointer",transition:"all .25s"}}
              onMouseEnter={e=>{e.target.style.background="#c8982a";e.target.style.color="#0d0a08";}}
              onMouseLeave={e=>{e.target.style.background="rgba(0,0,0,0.6)";e.target.style.color="#c8982a";}}>
              ✦ NEW GAME
            </button>
            {filledSlots.length > 0 && (
              <button onClick={()=>setScreen("load")}
                style={{background:"rgba(0,0,0,0.6)",border:"2px solid #7a5828",color:"#c9aa7a",fontFamily:"'Cinzel',serif",fontSize:"14px",letterSpacing:"4px",padding:"14px 36px",cursor:"pointer",transition:"all .25s"}}
                onMouseEnter={e=>{e.target.style.background="#7a5828";e.target.style.color="#0d0a08";}}
                onMouseLeave={e=>{e.target.style.background="rgba(0,0,0,0.6)";e.target.style.color="#c9aa7a";}}>
                ↩ LOAD GAME
              </button>
            )}
            <button onClick={()=>setShowMap(true)}
              style={{background:"rgba(0,0,0,0.6)",border:"1px solid #3a2510",color:"#5a4028",fontFamily:"'Cinzel',serif",fontSize:"13px",letterSpacing:"3px",padding:"14px 28px",cursor:"pointer",transition:"all .25s"}}
              onMouseEnter={e=>{e.target.style.borderColor="#c8982a";e.target.style.color="#c8982a";}}
              onMouseLeave={e=>{e.target.style.borderColor="#3a2510";e.target.style.color="#5a4028";}}>
              VIEW MAP
            </button>
          </div>

          {/* Credit */}
          <div style={{color:"#2a1c0c",fontSize:"10px",letterSpacing:"3px",fontFamily:"'Cinzel',serif",marginTop:"16px",opacity: introPhase>=4?0.6:0,transition:"opacity 1.5s ease-out"}}>
            BUILT WITH CLAUDE · ANTHROPIC
          </div>
        </div>
        );
      })()}
      {showMap && (
        <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:"20px"}} onClick={()=>setShowMap(false)}>
          <div style={{background:"#0d0905",border:"2px solid #c8982a",padding:"20px",maxWidth:520,width:"100%"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"14px",letterSpacing:"4px",textAlign:"center",marginBottom:"14px"}}>THE TOP TAVERN — GROUND FLOOR</div>
            <TavernMap/>
            <button onClick={()=>setShowMap(false)} style={{display:"block",margin:"14px auto 0",background:"transparent",border:"1px solid #5a3510",color:"#7a5828",fontFamily:"'Cinzel',serif",fontSize:"12px",padding:"8px 24px",cursor:"pointer",letterSpacing:"2px"}}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );}

  // ── LOAD GAME ───────────────────────────────────────────────────────────────
  if (screen === "load") return (
    <div style={{minHeight:"100vh",background:"#0d0a08",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",fontFamily:"'Crimson Text',Georgia,serif"}}>
      <style>{FONTS}</style>
      <div style={{maxWidth:560,width:"100%"}}>
        <button onClick={()=>{setScreen("intro");setIntroPhase(0);}} style={{background:"none",border:"none",color:"#5a3510",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"3px",marginBottom:"30px",padding:0}}>
          ← BACK
        </button>
        <h2 style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"clamp(20px,4vw,30px)",fontWeight:700,letterSpacing:"4px",marginBottom:"8px",textAlign:"center"}}>
          LOAD ADVENTURE
        </h2>
        <div style={{width:"60px",height:"1px",background:"#5a3510",margin:"0 auto 32px"}}/>
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          {[0,1,2].map(i => {
            const slot = slots[i];
            return (
              <div key={i} style={{background: slot ? "#120e08" : "#0d0a08", border:`1px solid ${slot?"#3a2810":"#1a1408"}`, padding:"20px 24px", display:"flex", alignItems:"center", gap:"20px", opacity: slot ? 1 : 0.4}}>
                <div style={{fontFamily:"'Cinzel',serif",color:"#5a3510",fontSize:"22px",fontWeight:700,minWidth:28}}>
                  {i+1}
                </div>
                <div style={{flex:1}}>
                  {slot ? (
                    <>
                      <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"17px",fontWeight:600,marginBottom:"3px"}}>
                        {CLASSES[slot.charClass]?.emoji} {slot.name}
                      </div>
                      <div style={{color:"#7a5828",fontSize:"13px",fontStyle:"italic",marginBottom:"6px"}}>
                        {slot.charClass} · Level {slot.level} · Day {slot.full?.gameState?.day||1} · {slot.savedAt ? new Date(slot.savedAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : ""}
                      </div>
                      {/* HP bar */}
                      {slot.full?.gameState && (() => {
                        const gs = slot.full.gameState;
                        const hp = gs.hp||0, maxHp = gs.maxHp||1;
                        const hpPct = Math.round((hp/maxHp)*100);
                        const hpC = hp/maxHp > 0.6 ? "#4ade80" : hp/maxHp > 0.3 ? "#facc15" : "#ef4444";
                        return (
                          <div style={{marginBottom:"6px"}}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
                              <span style={{color:"#5a3510",fontSize:"10px",fontFamily:"'Cinzel',serif",letterSpacing:"2px"}}>HP</span>
                              <span style={{color:hpC,fontSize:"11px",fontFamily:"'Cinzel',serif",fontWeight:700}}>{hp}/{maxHp}</span>
                            </div>
                            <div style={{background:"#1a1008",height:"4px",borderRadius:"2px",overflow:"hidden"}}>
                              <div style={{width:`${hpPct}%`,height:"100%",background:hpC,borderRadius:"2px"}}/>
                            </div>
                          </div>
                        );
                      })()}
                      {/* Location */}
                      {slot.full?.location && (
                        <div style={{color:"#4a3820",fontSize:"11px",fontStyle:"italic",fontFamily:"'Cinzel',serif",letterSpacing:"1px"}}>
                          📍 {slot.full.location}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{color:"#3a2810",fontSize:"14px",fontStyle:"italic",fontFamily:"'Cinzel',serif",letterSpacing:"2px"}}>— EMPTY SLOT —</div>
                  )}
                </div>
                <div style={{display:"flex",gap:"8px"}}>
                  {slot && (
                    <>
                      <button onClick={()=>loadSlot(slot)}
                        style={{background:"transparent",border:"1px solid #c8982a",color:"#c8982a",fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"3px",padding:"7px 16px",cursor:"pointer",transition:"all .15s"}}
                        onMouseEnter={e=>{e.target.style.background="#c8982a";e.target.style.color="#0d0a08";}}
                        onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#c8982a";}}>
                        LOAD
                      </button>
                      <button onClick={()=>{
                        openConfirm(`Delete Save?`, `Delete "${slot.name}"? This cannot be undone.`, "DELETE", async () => {
                          try { localStorage.removeItem(`dnd-save-${i}`); } catch(e){}
                          const updated = [...slots]; updated[i] = null; setSlots(updated);
                        });
                      }}
                        style={{background:"transparent",border:"1px solid #3a1010",color:"#6b2020",fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"2px",padding:"7px 12px",cursor:"pointer",transition:"all .15s"}}
                        onMouseEnter={e=>{e.target.style.borderColor="#8b3030";e.target.style.color="#ef4444";}}
                        onMouseLeave={e=>{e.target.style.borderColor="#3a1010";e.target.style.color="#6b2020";}}>
                        ✕
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{textAlign:"center",marginTop:"28px"}}>
          <button onClick={()=>setScreen("create")}
            style={{background:"transparent",border:"1px solid #3a2810",color:"#7a5828",fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"3px",padding:"10px 28px",cursor:"pointer"}}
            onMouseEnter={e=>{e.target.style.borderColor="#c8982a";e.target.style.color="#c8982a";}}
            onMouseLeave={e=>{e.target.style.borderColor="#3a2810";e.target.style.color="#7a5828";}}>
            + NEW CHARACTER
          </button>
        </div>
      </div>
    </div>
  );

  // ── CHARACTER CREATION ──────────────────────────────────────────────────────
  if (screen === "create") {
    // Class tint colours — each class has its own atmospheric palette
    const CLASS_TINTS = {
      Fighter: { bg:"#0e1218", border:"#2a3848", activeBg:"#141e28", activeBorder:"#5a8ab0", glow:"rgba(90,138,176,0.15)" },
      Rogue:   { bg:"#100e12", border:"#281e30", activeBg:"#1a1420", activeBorder:"#7a5090", glow:"rgba(122,80,144,0.15)" },
      Wizard:  { bg:"#0c0c18", border:"#1e1e40", activeBg:"#121228", activeBorder:"#5050c0", glow:"rgba(80,80,192,0.15)" },
      Cleric:  { bg:"#120e08", border:"#2a2010", activeBg:"#1e1608", activeBorder:"#c8982a", glow:"rgba(200,152,42,0.15)" },
    };
    const ready = !!(charName.trim() && charClass && !slots.every(Boolean));
    return (
    <div style={{minHeight:"100vh",position:"relative",fontFamily:"'Crimson Text',Georgia,serif",overflow:"hidden"}}>
      <style>{FONTS}{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes enterPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,152,42,0.4)}50%{box-shadow:0 0 0 8px rgba(200,152,42,0)}}
        @keyframes nameUnderline{from{width:0}to{width:100%}}
      `}</style>

      {/* Tavern exterior as dark muted background */}
      <div style={{position:"absolute",inset:0,zIndex:0,filter:"brightness(0.28) saturate(0.6)"}}>
        <svg viewBox="0 0 900 580" preserveAspectRatio="xMidYMid slice" style={{width:"100%",height:"100%"}} xmlns="http://www.w3.org/2000/svg">
          <rect width="900" height="580" fill="#030408"/>
          <rect x="0" y="0" width="900" height="340" fill="#04050c"/>
          <ellipse cx="420" cy="38" rx="260" ry="80" fill="#050710" opacity="0.95"/>
          <ellipse cx="700" cy="50" rx="240" ry="70" fill="#060810" opacity="0.95"/>
          <polygon points="0,290 80,165 180,235 290,145 390,205 490,135 590,195 690,125 790,178 900,155 900,290" fill="#060809"/>
          <polygon points="0,325 50,278 130,305 210,268 320,308 415,260 515,300 615,255 715,294 810,260 900,280 900,325" fill="#040606"/>
          <rect x="0" y="462" width="900" height="118" fill="#0c0a09"/>
          <rect x="155" y="204" width="590" height="258" fill="#080706"/>
          <rect x="155" y="199" width="590" height="7" fill="#0c0a08"/>
          <rect x="155" y="266" width="590" height="7" fill="#b8c8d4" opacity="0.35"/>
          <rect x="155" y="378" width="590" height="85" fill="#080605"/>
          <rect x="366" y="390" width="80" height="54" rx="2" fill="#0a0806"/>
          <rect x="348" y="400" width="7" height="34" rx="2" fill="#2a1808"/>
          <ellipse cx="351" cy="393" rx="6" ry="7" fill="#d06010" opacity="0.75"/>
          <ellipse cx="351" cy="390" rx="4" ry="6" fill="#e88018" opacity="0.7"/>
          <ellipse cx="351" cy="400" rx="45" ry="40" fill="#c87808" opacity="0.22"/>
          <rect x="460" y="400" width="7" height="34" rx="2" fill="#2a1808"/>
          <ellipse cx="463" cy="393" rx="6" ry="7" fill="#d06010" opacity="0.75"/>
          <ellipse cx="463" cy="390" rx="4" ry="6" fill="#e88018" opacity="0.7"/>
          <ellipse cx="463" cy="400" rx="45" ry="40" fill="#c87808" opacity="0.22"/>
          <circle cx="450" cy="508" r="74" fill="none" stroke="#6b0f0f" strokeWidth="1.4" opacity="0.5"/>
          <line x1="450" y1="434" x2="416" y2="563" stroke="#6b0f0f" strokeWidth="0.8" opacity="0.38"/>
          <line x1="450" y1="434" x2="514" y2="558" stroke="#6b0f0f" strokeWidth="0.8" opacity="0.38"/>
          <line x1="386" y1="479" x2="514" y2="479" stroke="#6b0f0f" strokeWidth="0.8" opacity="0.38"/>
          <line x1="386" y1="479" x2="485" y2="560" stroke="#6b0f0f" strokeWidth="0.8" opacity="0.38"/>
          <line x1="514" y1="479" x2="415" y2="560" stroke="#6b0f0f" strokeWidth="0.8" opacity="0.38"/>
          <rect x="0" y="0" width="900" height="580" fill="#000000" opacity="0.35"/>
        </svg>
      </div>

      {/* Content */}
      <div style={{position:"relative",zIndex:1,minHeight:"100vh",padding:"28px 20px",maxWidth:760,margin:"0 auto"}}>

        {/* Back button */}
        <button onClick={()=>setScreen("intro")}
          style={{background:"rgba(0,0,0,0.5)",border:"1px solid #3a2810",color:"#8b6030",cursor:"pointer",
            fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"3px",marginBottom:"24px",
            padding:"6px 14px",display:"inline-flex",alignItems:"center",gap:"6px"}}
          onMouseEnter={e=>{e.target.style.borderColor="#c8982a";e.target.style.color="#c8982a";}}
          onMouseLeave={e=>{e.target.style.borderColor="#3a2810";e.target.style.color="#8b6030";}}>
          ← BACK
        </button>

        {/* Title */}
        <div style={{textAlign:"center",marginBottom:"28px"}}>
          <div style={{color:"#c8982a",fontSize:"11px",letterSpacing:"8px",fontFamily:"'Cinzel',serif",marginBottom:"8px",opacity:0.7}}>— ✦ —</div>
          <h2 style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"clamp(22px,4vw,36px)",fontWeight:900,letterSpacing:"5px",marginBottom:"4px",textShadow:"0 0 20px rgba(200,152,42,0.3)"}}>
            CREATE YOUR CHARACTER
          </h2>
          <div style={{color:"#6a5030",fontSize:"13px",fontStyle:"italic",fontFamily:"'Crimson Text',Georgia,serif"}}>Who ventures into the darkness tonight?</div>
        </div>

        {/* Name input */}
        <div style={{marginBottom:"28px"}}>
          <label style={{display:"block",fontFamily:"'Cinzel',serif",color:"#8b6030",fontSize:"12px",letterSpacing:"4px",marginBottom:"10px"}}>ADVENTURER'S NAME</label>
          <div style={{position:"relative"}}>
            <input value={charName} onChange={e=>setCharName(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&charClass&&startGame()}
              placeholder="What do they call you?" maxLength={28}
              style={{width:"100%",background:"rgba(14,10,6,0.85)",border:"1px solid #3a2810",
                borderBottom:`2px solid ${charName.trim()?"#c8982a":"#3a2810"}`,
                color:"#f0e4c0",fontFamily:"'Crimson Text',Georgia,serif",fontSize:"22px",
                padding:"12px 16px",outline:"none",boxSizing:"border-box",
                transition:"border-color .3s"}}/>
            {charName.trim() && <div style={{position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",color:"#c8982a",fontSize:"18px"}}>✦</div>}
          </div>
        </div>

        {/* Class selection */}
        <div style={{marginBottom:"28px"}}>
          <label style={{display:"block",fontFamily:"'Cinzel',serif",color:"#8b6030",fontSize:"12px",letterSpacing:"4px",marginBottom:"14px"}}>CHOOSE YOUR CLASS</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:"12px"}}>
            {Object.entries(CLASSES).map(([cls,data])=>{
              const tint = CLASS_TINTS[cls];
              const active = charClass===cls;
              return (
                <div key={cls} onClick={()=>setCharClass(cls)}
                  style={{background: active?tint.activeBg:tint.bg,
                    border: `${active?2:1}px solid ${active?tint.activeBorder:tint.border}`,
                    padding:"0", cursor:"pointer", transition:"all .25s", position:"relative",
                    boxShadow: active?`0 0 20px ${tint.glow}, inset 0 0 30px ${tint.glow}`:"none",
                    overflow:"hidden"}}>

                  {/* Portrait strip on left */}
                  <div style={{display:"flex",gap:"0",alignItems:"stretch"}}>
                    <div style={{flexShrink:0,borderRight:`1px solid ${active?tint.activeBorder:tint.border}`,
                      background:active?`${tint.activeBg}`:"rgba(0,0,0,0.3)"}}>
                      <Portrait name={cls} size={120} height={150} border="none"/>
                    </div>

                    {/* Class info */}
                    <div style={{flex:1,padding:"16px 18px",minWidth:0}}>
                      {active && <div style={{position:"absolute",top:"10px",right:"12px",color:tint.activeBorder,fontSize:"16px",animation:"pulse 2s infinite"}}>✦</div>}
                      <div style={{fontFamily:"'Cinzel',serif",color:active?tint.activeBorder:"#9a8060",
                        fontSize:"19px",fontWeight:700,marginBottom:"4px",letterSpacing:"1px"}}>
                        {data.emoji} {cls}
                      </div>
                      <div style={{color:active?"#a09060":"#6a5838",fontSize:"13px",fontStyle:"italic",marginBottom:"12px",lineHeight:1.5}}>
                        {data.desc}
                      </div>
                      <div style={{display:"flex",gap:"16px",marginBottom:"10px"}}>
                        {[["HP",data.hp],["AC",data.ac],["Gold",data.gold+"gp"]].map(([l,v])=>(
                          <div key={l} style={{textAlign:"center"}}>
                            <div style={{color:active?tint.activeBorder:"#5a3510",fontSize:"10px",fontFamily:"'Cinzel',serif",letterSpacing:"2px"}}>{l}</div>
                            <div style={{color:active?"#f0d890":"#c9aa7a",fontSize:"18px",fontWeight:700,fontFamily:"'Cinzel',serif"}}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{fontSize:"11px",color:active?"#6a5838":"#3a2818",lineHeight:1.6,borderTop:`1px solid ${active?tint.border:"#1e1408"}`,paddingTop:"8px"}}>
                        {data.items.slice(0,4).join(" · ")}{data.items.length>4?" …":""} · 🍖×{data.rations}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Backstory — slides in once class chosen */}
        {charClass && (
          <div style={{marginBottom:"28px",animation:"fadeSlideIn .4s ease-out"}}>
            <label style={{display:"block",fontFamily:"'Cinzel',serif",color:"#8b6030",fontSize:"12px",letterSpacing:"4px",marginBottom:"14px"}}>
              BACKSTORY <span style={{color:"#4a5030",fontSize:"10px",letterSpacing:"2px"}}>— CHOOSE ONE FOR A BONUS</span>
            </label>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {(BACKSTORIES[charClass]||[]).map((bs,bi)=>{
                const sel = charBackstory===bs.id;
                return (
                  <div key={bs.id} onClick={()=>setCharBackstory(p=>p===bs.id?null:bs.id)}
                    style={{background:sel?"#141a08":"#0c0e0a",
                      border:`${sel?2:1}px solid ${sel?"#4ade80":"#1e2810"}`,
                      padding:"12px 16px", cursor:"pointer",
                      display:"flex", justifyContent:"space-between", alignItems:"center", gap:"16px",
                      transition:"all .2s",
                      boxShadow:sel?"0 0 12px rgba(74,222,128,0.12)":"none"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"3px"}}>
                        {sel && <span style={{color:"#4ade80",fontSize:"14px"}}>✓</span>}
                        <span style={{fontFamily:"'Cinzel',serif",color:sel?"#4ade80":"#c9aa7a",fontSize:"14px",fontWeight:600}}>{bs.name}</span>
                      </div>
                      <div style={{color:sel?"#7a9060":"#6a5838",fontSize:"13px",fontStyle:"italic"}}>{bs.desc}</div>
                    </div>
                    <div style={{flexShrink:0,background:sel?"#1a2a10":"#141008",
                      border:`1px solid ${sel?"#4ade80":"#2a3010"}`,
                      padding:"5px 12px",color:sel?"#4ade80":"#5a7030",
                      fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"1px",
                      whiteSpace:"nowrap"}}>
                      {bs.bonus}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Character summary preview */}
        {ready && (
          <div style={{background:"rgba(14,10,6,0.8)",border:"1px solid #3a2810",padding:"14px 20px",marginBottom:"24px",
            display:"flex",alignItems:"center",gap:"14px",animation:"fadeSlideIn .3s ease-out",
            borderLeft:"3px solid #c8982a"}}>
            <Portrait name={charClass} size={48} height={60} border="#3a2810"/>
            <div>
              <div style={{color:"#c8982a",fontFamily:"'Cinzel',serif",fontSize:"13px",letterSpacing:"2px",marginBottom:"2px"}}>READY TO ENTER</div>
              <div style={{color:"#f0e4c0",fontSize:"16px",fontFamily:"'Cinzel',serif"}}>
                <span style={{fontWeight:700}}>{charName}</span>
                <span style={{color:"#8b6030",fontSize:"14px"}}> · {charClass}{charBackstory?" · "+(BACKSTORIES[charClass]?.find(b=>b.id===charBackstory)?.name||""):"" }</span>
              </div>
            </div>
          </div>
        )}

        {/* All slots full warning */}
        {slots.every(Boolean) && (
          <div style={{marginBottom:"20px",padding:"12px 16px",background:"rgba(26,8,8,0.9)",border:"1px solid #5a1a1a",color:"#c08080",fontSize:"14px",fontStyle:"italic",textAlign:"center"}}>
            All 3 save slots are full. Choose a slot to overwrite:
            <div style={{display:"flex",gap:"10px",justifyContent:"center",marginTop:"10px"}}>
              {slots.map((slot,i)=>(
                <button key={i} onClick={()=>startGame(i)}
                  style={{background:"transparent",border:"1px solid #5a3510",color:"#c9aa7a",fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"2px",padding:"6px 14px",cursor:"pointer"}}>
                  Slot {i+1}: {slot?.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Enter button */}
        <div style={{textAlign:"center",paddingBottom:"40px"}}>
          <button onClick={()=>startGame()} disabled={!ready}
            style={{background: ready?"rgba(200,152,42,0.08)":"transparent",
              border: `2px solid ${ready?"#c8982a":"#2a1c0c"}`,
              color: ready?"#c8982a":"#3a2810",
              fontFamily:"'Cinzel',serif",fontSize:"15px",letterSpacing:"6px",
              padding:"16px 56px",cursor:ready?"pointer":"not-allowed",
              transition:"all .3s",
              boxShadow: ready?"0 0 0 0 rgba(200,152,42,0.4)":"none",
              animation: ready?"enterPulse 2.5s infinite":"none"}}
            onMouseEnter={e=>{ if(ready){e.target.style.background="#c8982a";e.target.style.color="#0d0a08";e.target.style.boxShadow="0 4px 24px rgba(200,152,42,0.4)";}}}
            onMouseLeave={e=>{ if(ready){e.target.style.background="rgba(200,152,42,0.08)";e.target.style.color="#c8982a";e.target.style.boxShadow="none";}}}>
            ✦ ENTER THE TAVERN ✦
          </button>
          {!charName.trim() && <div style={{color:"#3a2810",fontSize:"12px",fontFamily:"'Cinzel',serif",letterSpacing:"2px",marginTop:"12px"}}>Enter your name above</div>}
          {charName.trim() && !charClass && <div style={{color:"#3a2810",fontSize:"12px",fontFamily:"'Cinzel',serif",letterSpacing:"2px",marginTop:"12px"}}>Choose your class</div>}
        </div>
      </div>
    </div>
  );}

  // ── GAME ────────────────────────────────────────────────────────────────────
  const s = gameState;
  return (
    <div className={`font-${fontSize}`} style={{height:"100vh",background:"#0d0a08",fontFamily:"'Crimson Text',Georgia,serif",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{FONTS}{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes flicker{0%,100%{opacity:1}33%{opacity:.7}66%{opacity:.9}}
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes levelFlash{0%{opacity:0}20%{opacity:1}100%{opacity:0}}
        @keyframes diceRoll{0%{transform:rotate(0deg) scale(1)}20%{transform:rotate(72deg) scale(1.25)}40%{transform:rotate(200deg) scale(0.85)}60%{transform:rotate(400deg) scale(1.15)}80%{transform:rotate(640deg) scale(0.95)}100%{transform:rotate(720deg) scale(1)}}
        @keyframes resultPop{0%{transform:scale(0.3);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
        @keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        .dm-text{animation:none}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#0d0905}
        ::-webkit-scrollbar-thumb{background:#3a2010;border-radius:3px}
        input:focus{border-color:#c8982a !important; outline:none !important; box-shadow:0 0 0 1px rgba(200,152,42,0.2);}
        .font-sm .narrative-text{font-size:13px !important}
        .font-md .narrative-text{font-size:16px !important}
        .font-lg .narrative-text{font-size:20px !important}
        @media(max-width:640px){
          .sidebar-toggle{display:block !important}
          .game-sidebar{position:fixed !important;left:0;top:0;height:100vh;z-index:200;transform:translateX(-100%);transition:transform .25s;box-shadow:4px 0 20px #00000088}
          .game-sidebar.open{transform:translateX(0) !important;animation:slideIn .25s ease-out}
          .sidebar-overlay{display:block !important}
        }
      `}</style>

      {/* ── HEADER TIER 1: brand / location / status ── */}
      <div style={{background:"#0c0a07",borderBottom:"1px solid #1e1408",padding:"6px 14px",display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
        <button onClick={()=>setSidebarOpen(o=>!o)} className="sidebar-toggle"
          style={{display:"none",background:"transparent",border:"1px solid #3a2810",color:"#c8982a",fontFamily:"'Cinzel',serif",fontSize:"14px",padding:"3px 8px",cursor:"pointer",lineHeight:1}}>☰</button>
        <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"15px",fontWeight:700,letterSpacing:"3px",whiteSpace:"nowrap",textShadow:"0 0 14px rgba(200,152,42,0.25)"}}>THE TOP TAVERN</div>
        <div style={{width:"1px",height:"18px",background:"#2a1c0c",flexShrink:0}}/>
        <div style={{color:"#a08050",fontSize:"14px",fontStyle:"italic",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Crimson Text',Georgia,serif"}}>{location}</div>
        {combat&&<div style={{background:"#1e0606",border:"1px solid #7a1010",borderRadius:"2px",padding:"2px 10px",color:"#ff5555",fontSize:"11px",fontFamily:"'Cinzel',serif",letterSpacing:"2px",animation:"pulse 1.5s infinite",flexShrink:0}}>⚔ COMBAT</div>}
        {saveStatus&&<div style={{color:"#4ade80",fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"3px",flexShrink:0,animation:"fadeSlideIn .3s ease-out"}}>✦ SAVED</div>}
        <button onClick={()=>openConfirm("Start New Game?","Your current progress will be permanently lost.","START NEW",newGame)}
          style={{background:"transparent",border:"1px solid #3a1010",color:"#6b2020",fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"2px",padding:"3px 10px",cursor:"pointer",flexShrink:0}}
          onMouseEnter={e=>{e.target.style.borderColor="#8b3030";e.target.style.color="#ef4444";}}
          onMouseLeave={e=>{e.target.style.borderColor="#3a1010";e.target.style.color="#6b2020";}}>NEW</button>
      </div>

      {/* ── HEADER TIER 2: toolbar ── */}
      {(()=>{
        const atTavern = location==="The Top Tavern";
        const TB = ({onClick,children,active=false,col="#c8982a",tip=""})=>(
          <button onClick={onClick} title={tip}
            style={{background:active?`${col}18`:"transparent",border:`1px solid ${active?col:"#222010"}`,
              color:active?col:"#6a5030",fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"1px",
              padding:"4px 9px",cursor:"pointer",flexShrink:0,whiteSpace:"nowrap",transition:"all .15s",borderRadius:"2px"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=col;e.currentTarget.style.color=col;e.currentTarget.style.background=`${col}14`;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=active?col:"#222010";e.currentTarget.style.color=active?col:"#6a5030";e.currentTarget.style.background=active?`${col}18`:"transparent";}}>
            {children}
          </button>
        );
        const Sep=()=><div style={{width:"1px",height:"14px",background:"#1a1208",flexShrink:0,margin:"0 2px"}}/>;
        return(
          <div style={{background:"#08070a",borderBottom:"1px solid #141010",padding:"3px 12px",display:"flex",alignItems:"center",gap:"3px",flexShrink:0,overflowX:"auto"}}>
            <TB onClick={()=>setShowMap(true)} tip="View maps">🗺 MAP</TB>
            <TB onClick={()=>setShowJournal(true)} active={!!(journal.objectives.length||journal.clues.length)} tip="Adventure journal">📖 JOURNAL</TB>
            <TB onClick={()=>setShowQuests(true)} active={quests.filter(q=>q.status==="active").length>0} col="#6ab050" tip="Quest board">📋 QUESTS{quests.filter(q=>q.status==="active").length>0?` (${quests.filter(q=>q.status==="active").length})`:""}</TB>
            <TB onClick={()=>setShowBestiary(true)} active={Object.keys(bestiary).length>0} col="#9070d0" tip="Bestiary">📜 BESTIARY</TB>
            <Sep/>
            {atTavern&&<TB onClick={()=>setShowRecruit(true)} col="#4ade80" tip="Hire companions">⚔ RECRUIT</TB>}
            {atTavern&&<TB onClick={()=>setShowShop(true)} col="#c8c050" tip="Gorn's shop">🪙 SHOP</TB>}
            {atTavern&&!miraWon&&<TB onClick={()=>setShowCardGame(true)} col="#c090d0" tip="Mira's card game">🃏 CARDS</TB>}
            {!atTavern&&!combat&&<TB onClick={fastTravel} col="#8aba50" tip="Return to tavern">🏠 TAVERN</TB>}
            <Sep/>
            <TB onClick={exportLog} tip="Download adventure log">📥 LOG</TB>
            <TB onClick={undoAction} tip="Undo last action">↩ UNDO</TB>
            <TB onClick={()=>setFontSize(f=>f==="sm"?"md":f==="md"?"lg":"sm")} active={fontSize!=="md"} tip={`Font: ${fontSize}`}>{fontSize==="sm"?"A−":fontSize==="lg"?"A+":"A"}</TB>
            <Sep/>
            <TB onClick={()=>setVoiceOn(v=>!v)} active={voiceOn} col="#c8982a" tip="Toggle narrator voice">{voiceOn?"🔊 VOICE":"🔇 VOICE"}</TB>
            {voiceOn&&<TB onClick={()=>setShowVoiceSettings(v=>!v)} active={showVoiceSettings} col="#c8982a" tip="Voice settings">⚙</TB>}
            <TB onClick={()=>{const n=!ambientOn;setAmbientOn(n);if(n){audio.setVolume(ambientVol);audio.playMood(combat?"combat":atTavern?"tavern":"dungeon");}else audio.stop();}}
              active={ambientOn} col="#4ade80" tip="Toggle ambient sound">
              {ambientOn?`🎵 ${combat?"COMBAT":atTavern?"TAVERN":"DEEP"}`:"🔕 MUSIC"}
            </TB>
            {ambientOn&&<input type="range" min="0" max="1" step="0.05" value={ambientVol}
              onChange={e=>{const v=parseFloat(e.target.value);setAmbientVol(v);audio.setVolume(v);}}
              style={{width:"52px",accentColor:"#c8982a",flexShrink:0,cursor:"pointer"}}/>}
          </div>
        );
      })()}

      {/* ── Voice Settings Panel — inline below toolbar ── */}
      {showVoiceSettings && voiceOn && (
        <div style={{background:"#0a0808",borderBottom:"1px solid #1a1208",padding:"8px 14px",display:"flex",alignItems:"center",gap:"16px",flexShrink:0,flexWrap:"wrap"}}>
          <div style={{fontFamily:"'Cinzel',serif",color:"#5a3510",fontSize:"10px",letterSpacing:"3px",flexShrink:0}}>NARRATOR</div>
          <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
            <span style={{color:"#4a3018",fontSize:"10px",fontFamily:"'Cinzel',serif",letterSpacing:"2px"}}>SPEED</span>
            {[["SLOW",0.6],["MED",0.85],["FAST",1.1]].map(([l,v])=>(
              <button key={l} onClick={()=>setVoiceRate(v)}
                style={{background:voiceRate===v?"#2a1c08":"transparent",border:`1px solid ${voiceRate===v?"#c8982a":"#2a1c0c"}`,
                  color:voiceRate===v?"#c8982a":"#5a3510",fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"2px",
                  padding:"3px 8px",cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
            <span style={{color:"#4a3018",fontSize:"10px",fontFamily:"'Cinzel',serif",letterSpacing:"2px"}}>PITCH</span>
            {[["DEEP",0.5],["MED",0.72],["HIGH",1.0]].map(([l,v])=>(
              <button key={l} onClick={()=>setVoicePitch(v)}
                style={{background:voicePitch===v?"#2a1c08":"transparent",border:`1px solid ${voicePitch===v?"#c8982a":"#2a1c0c"}`,
                  color:voicePitch===v?"#c8982a":"#5a3510",fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"2px",
                  padding:"3px 8px",cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          <button onClick={()=>{const t="The darkness stirs. Malgrath awakens below.";speakRaw(t);}}
            style={{background:"transparent",border:"1px solid #2a1c0c",color:"#5a3510",fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"2px",padding:"3px 10px",cursor:"pointer",flexShrink:0}}>
            ▶ TEST
          </button>
        </div>
      )}

      {/* ── Level-up flash overlay ── */}
      {levelUpFlash && (
        <div style={{position:"fixed",inset:0,background:"rgba(200,152,42,0.12)",pointerEvents:"none",zIndex:999,animation:"levelFlash .8s ease-out"}}/>
      )}

      {/* ── Status Bar ─────────────────────────────────────────────── */}
      {(() => {
        // Time of day — cycles every 5 turns (approx)
        const TIMES = ["🌅 Dawn","☀️ Day","🌆 Dusk","🌙 Night","🌑 Midnight"];
        const timeIdx = Math.floor((turnCount % 20) / 4);
        const timeLabel = TIMES[timeIdx];
        // Depth — based on location keywords
        const loc = location.toLowerCase();
        const depth = loc.includes("vault") ? 7 : loc.includes("crypt") ? 6 : loc.includes("rune") ? 5 :
                      loc.includes("flooded") ? 4 : loc.includes("tunnel") ? 3 : loc.includes("stairwell") ? 2 :
                      loc.includes("storage") ? 1 : 0;
        const depthLabel = depth === 0 ? null : `↓ Depth ${depth}`;
        // Torches remaining in inventory
        const torchCount = (s?.inventory||[]).filter(i => i.toLowerCase().startsWith("torch")).length;
        const torchColor = torchCount === 0 ? "#ef4444" : torchCount <= 1 ? "#facc15" : "#c8982a";
        return (
          <div style={{background:"#09080b",borderBottom:"1px solid #151010",padding:"4px 14px",display:"flex",alignItems:"center",gap:"10px",flexShrink:0,overflowX:"auto"}}>
            {/* DAY — large and prominent */}
            <div style={{display:"flex",alignItems:"center",gap:"4px",flexShrink:0}}>
              <span style={{color:"#5a3818",fontSize:"9px",fontFamily:"'Cinzel',serif",letterSpacing:"2px",textTransform:"uppercase"}}>Day</span>
              <span style={{color:"#e8a030",fontSize:"16px",fontFamily:"'Cinzel',serif",fontWeight:800,lineHeight:1}}>{s?.day||1}</span>
            </div>
            <div style={{width:"1px",height:"12px",background:"#1e1408",flexShrink:0}}/>
            {/* HP with inline mini-bar */}
            <div style={{display:"flex",alignItems:"center",gap:"6px",flexShrink:0}}>
              <span style={{color:hpColor(s?.hp,s?.maxHp),fontSize:"13px",fontFamily:"'Cinzel',serif",fontWeight:700}}>{s?.hp}<span style={{color:"#3a2810",fontSize:"11px"}}>/{s?.maxHp}</span></span>
              <div style={{width:"38px",height:"5px",background:"#1a0e08",borderRadius:"3px",overflow:"hidden"}}>
                <div style={{width:`${hpPct(s?.hp,s?.maxHp)}%`,height:"100%",background:hpColor(s?.hp,s?.maxHp),transition:"width .5s",borderRadius:"3px"}}/>
              </div>
            </div>
            <div style={{width:"1px",height:"12px",background:"#1e1408",flexShrink:0}}/>
            {/* Gold — amber glow */}
            <div style={{display:"flex",alignItems:"center",gap:"3px",flexShrink:0}}>
              <span style={{color:"#c8982a",fontSize:"14px",fontFamily:"'Cinzel',serif",fontWeight:700,textShadow:"0 0 8px rgba(200,152,42,0.3)"}}>{s?.gold||0}</span>
              <span style={{color:"#6a4820",fontSize:"9px",fontFamily:"'Cinzel',serif"}}>GP</span>
            </div>
            <div style={{width:"1px",height:"12px",background:"#1e1408",flexShrink:0}}/>
            {/* Time of day */}
            <div style={{color:"#4a4028",fontSize:"11px",flexShrink:0,whiteSpace:"nowrap"}}>{timeLabel}</div>
            {/* Depth — colour-coded */}
            {depth>0&&<>
              <div style={{width:"1px",height:"12px",background:"#1e1408",flexShrink:0}}/>
              <div style={{color:depth>=5?"#ef4444":depth>=3?"#facc15":"#7a5828",fontSize:"11px",fontFamily:"'Cinzel',serif",flexShrink:0}}>↓{depth}</div>
            </>}
            <div style={{width:"1px",height:"12px",background:"#1e1408",flexShrink:0}}/>
            {/* Torch counter — pulses red when critical underground */}
            <div style={{display:"flex",alignItems:"center",gap:"3px",flexShrink:0}}>
              <span style={{fontSize:"12px"}}>🔦</span>
              <span style={{color:torchColor,fontSize:"12px",fontFamily:"'Cinzel',serif",fontWeight:700,
                animation:torchCount<=1&&depth>0?"pulse .8s infinite":"none"}}>
                {torchCount===0?"DARK":`×${torchCount}`}
              </span>
            </div>
            {/* Enemies slain */}
            {enemiesKilled>0&&<>
              <div style={{width:"1px",height:"12px",background:"#1e1408",flexShrink:0}}/>
              <span style={{color:"#5a2818",fontSize:"10px",fontFamily:"'Cinzel',serif",flexShrink:0}}>☠ {enemiesKilled}</span>
            </>}
            {/* Active blizzard */}
            {blizzard&&<>
              <div style={{width:"1px",height:"12px",background:"#1e1408",flexShrink:0}}/>
              <span style={{color:"#88aac8",fontSize:"10px",fontFamily:"'Cinzel',serif",flexShrink:0,animation:"pulse 1.5s infinite"}}>❄ BLIZZARD</span>
            </>}
            {/* Weather forecast — truncated, tooltip on hover */}
            {weather&&!blizzard&&<>
              <div style={{width:"1px",height:"12px",background:"#1e1408",flexShrink:0}}/>
              <span style={{color:"#405870",fontSize:"10px",flexShrink:0,cursor:"default",maxWidth:"80px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={weather}>
                🌨 {weather.split(" ").slice(0,3).join(" ")}
              </span>
            </>}
            {/* Mira indicator */}
            {miraWon&&<>
              <div style={{width:"1px",height:"12px",background:"#1e1408",flexShrink:0}}/>
              <span style={{color:"#6a3868",fontSize:"11px",flexShrink:0}} title="Mira is at the tavern">💜</span>
            </>}
            {/* Combat round badge — right side */}
            {combat&&<div style={{marginLeft:"auto",background:"#160404",border:"1px solid #4a1010",padding:"2px 10px",color:"#ff5555",fontSize:"10px",fontFamily:"'Cinzel',serif",letterSpacing:"1px",flexShrink:0}}>⚔ IN COMBAT</div>}
          </div>
        );
      })()}

      {/* Main layout */}
      <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>

        {/* Mobile overlay — closes sidebar on tap outside */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)}
            style={{display:"none",position:"fixed",inset:0,background:"#00000077",zIndex:199}}/>
        )}

        {/* Sidebar */}
        <div className={`game-sidebar${sidebarOpen?" open":""}`}
          style={{width:"360px",minWidth:"320px",background:"#100c08",borderRight:"1px solid #1e1408",display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden",position:"relative"}}>

          {/* TOP: Character stats */}
          <div style={{flexShrink:0,padding:"14px 14px 10px",borderBottom:"1px solid #1e1408"}}>

            {/* Player portrait + identity */}
            <div style={{display:"flex",gap:"10px",alignItems:"flex-start",marginBottom:"12px"}}>
              <Portrait name={s?.class} size={76} height={96} border="#3a2810"/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"11px",letterSpacing:"3px",marginBottom:"5px",borderBottom:"1px solid #2a1c0c",paddingBottom:"4px"}}>CHARACTER</div>
                <div style={{color:"#f0e4c0",fontSize:"18px",fontWeight:700,marginBottom:"1px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s?.name}</div>
                <div style={{color:"#b08840",fontSize:"13px",fontStyle:"italic"}}>
                  <span style={{fontSize:"15px",marginRight:"4px"}}>{CLASSES[s?.class]?.emoji}</span>{s?.class} · Lv {s?.level}
                </div>
              </div>
            </div>
            {/* HP */}
            <div style={{marginBottom:"10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                <span style={{color:"#c8982a",fontSize:"13px",fontFamily:"'Cinzel',serif",letterSpacing:"2px"}}>HP</span>
                <span style={{color:hpColor(s?.hp,s?.maxHp),fontSize:"17px",fontWeight:700,fontFamily:"'Cinzel',serif"}}>{s?.hp}/{s?.maxHp}</span>
              </div>
              <div style={{background:"#1a1008",height:"8px",borderRadius:"4px",overflow:"hidden"}}>
                <div style={{width:`${hpPct(s?.hp,s?.maxHp)}%`,height:"100%",background:hpColor(s?.hp,s?.maxHp),transition:"width .5s",borderRadius:"4px"}}/>
              </div>
            </div>
            {/* Stats grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px",marginBottom:"10px"}}>
              {[["AC",s?.ac],["GOLD",s?.gold+"gp"],["XP",s?.xp],["LVL",s?.level]].map(([l,v])=>(
                <div key={l} style={{background:"#14100a",border:"1px solid #2a1c0c",padding:"7px 8px",textAlign:"center"}}>
                  <div style={{color:"#c8982a",fontSize:"11px",fontFamily:"'Cinzel',serif",letterSpacing:"2px",marginBottom:"2px"}}>{l}</div>
                  <div style={{color:"#f0d890",fontSize:"17px",fontFamily:"'Cinzel',serif",fontWeight:700}}>{v}</div>
                </div>
              ))}
            </div>
            {/* XP bar */}
            {(() => {
              const thresh = [300,900,2700,6500,14000];
              const pr  = s?.level > 1 ? thresh[s.level-2] : 0;
              const nx  = thresh[Math.min((s?.level||1)-1,4)];
              const pct = Math.min(100, Math.round((((s?.xp||0)-pr)/(nx-pr))*100));
              return (
                <div>
                  <div style={{color:"#c8982a",fontSize:"11px",fontFamily:"'Cinzel',serif",letterSpacing:"2px",marginBottom:"3px"}}>XP TO NEXT LV</div>
                  <div style={{background:"#1a1008",height:"5px",borderRadius:"3px",overflow:"hidden"}}>
                    <div style={{width:`${pct}%`,height:"100%",background:"#c8982a",transition:"width .5s",borderRadius:"3px"}}/>
                  </div>
                </div>
              );
            })()}

            {/* Combat tracker — only when active */}
            {combat && (
              <div style={{background: combat.miniBoss?"#1a0a1a":"#1a0808",border:`1px solid ${combat.miniBoss?"#8a3a8a":"#5a1a1a"}`,padding:"10px",marginTop:"10px"}}>
                {combat.miniBoss && (
                  <div style={{fontFamily:"'Cinzel',serif",color:"#c060c0",fontSize:"9px",letterSpacing:"3px",marginBottom:"6px",animation:"pulse 2s infinite"}}>
                    ☠ MINI BOSS
                  </div>
                )}
                <div style={{marginBottom:"10px"}}>
                  <Portrait name={combat.enemy} size={240} height={180} border={combat.miniBoss?"#8a3a8a":"#5a1a1a"}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Cinzel',serif",color: combat.miniBoss?"#c060c0":"#ef4444",fontSize:"12px",letterSpacing:"3px",marginBottom:"4px"}}>⚔ ENEMY</div>
                  <div style={{color:"#f0e0d0",fontSize:"17px",fontWeight:700,marginBottom:"8px",lineHeight:1.2}}>{combat.enemy}</div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                    <span style={{color: combat.miniBoss?"#c060c0":"#ef4444",fontSize:"13px",fontFamily:"'Cinzel',serif",letterSpacing:"1px"}}>HP</span>
                    <span style={{color: combat.miniBoss?"#e080e0":"#ff6060",fontSize:"17px",fontFamily:"'Cinzel',serif",fontWeight:700}}>{combat.hp}/{combat.maxHp}</span>
                  </div>
                  <div style={{background:"#0a0505",height:"8px",borderRadius:"4px",overflow:"hidden"}}>
                    <div style={{width:`${Math.round((combat.hp/combat.maxHp)*100)}%`,height:"100%",background: combat.miniBoss?"#a050a0":"#ef4444",transition:"width .5s",borderRadius:"4px"}}/>
                  </div>
                </div>
              </div>
            )}

            {/* Mira — tavern companion */}
            {miraWon && location === "The Top Tavern" && (
              <div style={{marginTop:"8px",padding:"8px",background:"#10080e",border:"1px solid #5a3060",borderRadius:"2px",display:"flex",gap:"8px",alignItems:"center"}}>
                <Portrait name="Mira" size={80} height={100} border="#5a3060"/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:"#c090d0",fontSize:"14px",fontFamily:"'Cinzel',serif",letterSpacing:"1px",fontWeight:600}}>Mira</span>
                    <span style={{color:"#8a5080",fontSize:"11px",fontStyle:"italic"}}>at the bar</span>
                  </div>
                  <div style={{color:"#9a7090",fontSize:"12px",marginTop:"2px",fontStyle:"italic"}}>Left a potion for you</div>
                </div>
              </div>
            )}
            {/* NPC Reputation */}
            {Object.values(npcRep).some(v=>v!==0) && (
              <div style={{marginTop:"8px",padding:"8px",background:"#0e0c0a",border:"1px solid #1e1808",borderRadius:"2px"}}>
                <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"11px",letterSpacing:"2px",marginBottom:"6px"}}>REPUTATION</div>
                {Object.entries(npcRep).filter(([,v])=>v!==0).map(([name,val])=>{
                  const npcCols = {gorn:"#c8982a",valdris:"#5ab050",mira:"#c090d0",holvik:"#5090c0"};
                  const color = npcCols[name] || (val>0?"#4ade80":"#ef4444");
                  const dots = Array.from({length:3}).map((_,i)=>(
                    <span key={i} style={{fontSize:"14px",color: i<Math.abs(val)?color:"#1e1808",marginRight:"3px",lineHeight:1}}>●</span>
                  ));
                  return (
                    <div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"3px"}}>
                      <span style={{color:"#8b7050",fontSize:"12px",textTransform:"capitalize"}}>{name}</span>
                      <span>{dots}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PARTY — hired companions */}
            {party.length > 0 && (
              <div style={{marginTop:"10px"}}>
                <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"11px",letterSpacing:"3px",marginBottom:"6px"}}>PARTY</div>
                {party.map(m => {
                  const hpPct = Math.round((m.hp/m.maxHp)*100);
                  const col   = m.hp/m.maxHp > 0.6 ? "#4ade80" : m.hp/m.maxHp > 0.3 ? "#facc15" : "#ef4444";
                  const hDef  = HIRELINGS[m.id];
                  return (
                    <div key={m.id} style={{marginBottom:"8px",padding:"8px",background: m.dead?"#0a0505":"#0e0c08",border:`1px solid ${m.dead?"#3a1010":"#2a1c0c"}`,opacity:m.dead?0.5:1,display:"flex",gap:"8px",alignItems:"center"}}>
                      <Portrait name={m.name} size={80} height={100} border={m.dead?"#3a1010":hDef?.color||"#2a1c0c"}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"3px"}}>
                          <span style={{color: m.dead?"#5a2020":hDef?.color||"#c9aa7a",fontSize:"13px",fontFamily:"'Cinzel',serif",letterSpacing:"1px",fontWeight:600}}>
                            {m.name.split(" ")[0]}{m.dead?" †":""}
                          </span>
                          <span style={{color: m.dead?"#5a2020":col,fontSize:"12px",fontFamily:"'Cinzel',serif",fontWeight:700}}>{m.hp}/{m.maxHp}</span>
                        </div>
                        {!m.dead && (
                          <div style={{background:"#0a0806",height:"5px",borderRadius:"2px",overflow:"hidden"}}>
                            <div style={{width:`${hpPct}%`,height:"100%",background:col,transition:"width .5s",borderRadius:"2px"}}/>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ABILITIES — per class charge / toggle buttons */}
          {(CLASS_ABILITIES[s?.class]||[]).length > 0 && (
            <div style={{flexShrink:0, padding:"12px 16px", borderBottom:"1px solid #1e1408"}}>
              <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"15px",letterSpacing:"3px",marginBottom:"10px"}}>
                ABILITIES
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {(CLASS_ABILITIES[s?.class]||[]).map(ab => {
                  const state = s?.abilities?.[ab.id];
                  const isToggle  = ab.type === "toggle";
                  const isActive  = isToggle ? state?.active : false;
                  const charges   = !isToggle ? (state?.current ?? ab.max) : null;
                  const maxCharge = ab.max;
                  const depleted  = !isToggle && charges <= 0;
                  return (
                    <div key={ab.id}>
                      <button onClick={() => useAbility(ab.id)}
                        style={{width:"100%", textAlign:"left", background: isActive?"#1a2a0a": depleted?"#0a0806":"#14100a",
                          border:`1px solid ${isActive?"#4ade80":depleted?"#2a1c0c":"#3a2810"}`,
                          color: isActive?"#4ade80": depleted?"#5a4028":"#e8d090",
                          fontFamily:"'Crimson Text',Georgia,serif", fontSize:"15px",
                          padding:"10px 12px", cursor: depleted&&!isToggle?"not-allowed":"pointer",
                          transition:"all .2s"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
                          <span style={{fontFamily:"'Cinzel',serif",fontSize:"13px",letterSpacing:"1px",color: isActive?"#4ade80":depleted?"#5a4028":"#c8982a"}}>
                            {ab.name}
                          </span>
                          {isToggle ? (
                            <span style={{fontSize:"13px",letterSpacing:"2px",fontFamily:"'Cinzel',serif"}}>
                              {isActive?"● ON":"○ OFF"}
                            </span>
                          ) : (
                            <span style={{display:"flex",gap:"4px"}}>
                              {Array.from({length:maxCharge}).map((_,i)=>(
                                <span key={i} style={{width:"10px",height:"10px",borderRadius:"50%",display:"inline-block",
                                  background: i < charges ? "#c8982a" : "#1e1408",
                                  border:"1px solid #3a2810"}}/>
                              ))}
                            </span>
                          )}
                        </div>
                        <div style={{color: depleted?"#4a3820":"#a09060",fontSize:"13px",lineHeight:1.4}}>{ab.desc}</div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* REST BUTTONS */}
          <div style={{flexShrink:0, padding:"8px 14px", borderBottom:"1px solid #1e1408", display:"flex", gap:"6px"}}>
            <button onClick={shortRest} disabled={!!combat || (s?.rations||0) < 1}
              title={`Short Rest — costs 1 ration, heals d${HIT_DIE[s?.class||"Fighter"]} HP`}
              style={{flex:1, background:"transparent", border:`1px solid ${!combat&&(s?.rations||0)>=1?"#3a5020":"#1e1408"}`,
                color: !combat&&(s?.rations||0)>=1 ? "#6b9050":"#2a2010",
                fontFamily:"'Cinzel',serif", fontSize:"10px", letterSpacing:"2px", padding:"6px 4px",
                cursor: !combat&&(s?.rations||0)>=1?"pointer":"not-allowed", transition:"all .2s"}}
              onMouseEnter={e=>{ if(!combat&&(s?.rations||0)>=1){e.target.style.background="#1a2a0a";e.target.style.color="#4ade80";}}}
              onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color=!combat&&(s?.rations||0)>=1?"#6b9050":"#2a2010";}}>
              ⏱ SHORT <span style={{opacity:.55,fontSize:"9px",marginLeft:"3px"}}>-1🍖</span>
            </button>
            <button onClick={longRest} disabled={!!combat || location!=="The Top Tavern" || (s?.rations||0) < 2}
              title="Long Rest — costs 2 rations, full heal + recharge (Tavern only)"
              style={{flex:1, background:"transparent", border:`1px solid ${!combat&&location==="The Top Tavern"&&(s?.rations||0)>=2?"#5a3510":"#1e1408"}`,
                color: !combat&&location==="The Top Tavern"&&(s?.rations||0)>=2 ? "#c8982a":"#2a2010",
                fontFamily:"'Cinzel',serif", fontSize:"10px", letterSpacing:"2px", padding:"6px 4px",
                cursor: !combat&&location==="The Top Tavern"&&(s?.rations||0)>=2?"pointer":"not-allowed", transition:"all .2s"}}
              onMouseEnter={e=>{ if(!combat&&location==="The Top Tavern"&&(s?.rations||0)>=2){e.target.style.background="#1e1408";e.target.style.color="#e8c070";}}}
              onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color=!combat&&location==="The Top Tavern"&&(s?.rations||0)>=2?"#c8982a":"#2a2010";}}>
              🌙 LONG <span style={{opacity:.55,fontSize:"9px",marginLeft:"3px"}}>-2🍖</span>
            </button>
          </div>

          {/* BOTTOM: Inventory — always visible, scrolls internally if needed */}
          <div style={{flex:1,overflowY:"auto",padding:"12px 16px",minHeight:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px",borderBottom:"1px solid #3a2c1c",paddingBottom:"6px"}}>
              <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"15px",letterSpacing:"3px"}}>INVENTORY</div>
              <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                <span style={{fontSize:"18px"}}>🍖</span>
                <span style={{color:(s?.rations||0)>0?"#f0d890":"#7a4020",fontFamily:"'Cinzel',serif",fontSize:"16px",fontWeight:700}}>{s?.rations||0}</span>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
              {(s?.inventory||[]).length === 0 && (
                <div style={{color:"#5a3820",fontSize:"14px",fontStyle:"italic"}}>Empty</div>
              )}
              {(s?.inventory||[]).map((item,i)=>{
                const isPotion = item.toLowerCase().includes("potion");
                const isTorch  = item.toLowerCase().startsWith("torch");
                const isFood   = item.toLowerCase().includes("ration");
                const isUsable = isPotion || isTorch;
                return (
                  <div key={i} onClick={()=>{
                    if (!isUsable) return;
                    if (isPotion) {
                      const s = stateRef.current;
                      if (s && s.hp >= s.maxHp) { showToast("Already at full health!"); return; }
                      const heal = Math.floor(Math.random()*4)+1 + Math.floor(Math.random()*4)+1 + 2;
                      const itemName = item; // capture before state update
                      setGameState(prev => {
                        const idx = (prev?.inventory||[]).findIndex(it=>it===itemName);
                        const newInv = [...(prev?.inventory||[])];
                        if (idx >= 0) newInv.splice(idx,1);
                        return { ...prev, hp: Math.min(prev.maxHp, (prev.hp||0)+heal), inventory: newInv };
                      });
                      setLog(prev=>[...prev,{type:"player",text:`Drank a Healing Potion — restored ${heal} HP.`,id:Date.now()}]);
                    }
                    if (isTorch) {
                      const itemName = item;
                      setGameState(prev => {
                        const idx = (prev?.inventory||[]).findIndex(it=>it===itemName);
                        const newInv = [...(prev?.inventory||[])];
                        if (idx >= 0) newInv.splice(idx,1);
                        return { ...prev, inventory: newInv };
                      });
                      setLog(prev=>[...prev,{type:"player",text:"Lit a torch. The darkness retreats.",id:Date.now()}]);
                    }
                  }}
                    title={isPotion?"Click to drink (2d4+2 HP)":isTorch?"Click to light":""}
                    style={{color: isPotion?"#50d090":isTorch?"#e8b040":isFood?"#c8a060":"#e8d090",
                      fontSize:"15px",lineHeight:1.6,paddingLeft:"10px",borderLeft:`2px solid ${isPotion?"#207050":isTorch?"#805010":"#3a2c10"}`,
                      marginBottom:"1px",cursor:isUsable?"pointer":"default",
                      display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span>{item}</span>
                    {isUsable && <span style={{fontSize:"11px",opacity:.6,fontFamily:"'Cinzel',serif",letterSpacing:"1px",paddingRight:"4px"}}>{isPotion?"USE":"LIT"}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* DICE TRAY — fixed at bottom of sidebar */}
          <div style={{flexShrink:0,borderTop:"1px solid #2a1c0c",padding:"12px 14px 14px",background:"#0d0a08"}}>

            {/* Pending roll banner */}
            {pendingRoll && (
              <div style={{background:"#1a1205",border:"1px solid #c8982a",padding:"8px 10px",marginBottom:"10px",animation:"pulse 2s infinite"}}>
                <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"10px",letterSpacing:"3px",marginBottom:"4px"}}>
                  ✦ ROLL REQUIRED
                </div>
                <div style={{color:"#e8d9b5",fontSize:"13px",marginBottom:"4px"}}>
                  {pendingRoll.skill} — DC {pendingRoll.dc}
                </div>
                {(() => {
                  const mod = SKILL_MODS[s?.class]?.[pendingRoll.skill] ?? 0;
                  return <div style={{color:"#8b6030",fontSize:"11px"}}>Your modifier: {mod >= 0 ? `+${mod}` : mod}</div>;
                })()}
                {/* Adv / Disadv toggle */}
                <div style={{display:"flex",gap:"4px",marginTop:"6px"}}>
                  {["normal","advantage","disadvantage"].map(m => (
                    <button key={m} onClick={()=>setAdvMode(m)}
                      style={{flex:1, background: advMode===m ? "#2a1c08":"transparent",
                        border:`1px solid ${advMode===m?"#c8982a":"#3a2810"}`,
                        color: advMode===m?"#c8982a":"#5a3510",
                        fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"1px",padding:"3px 2px",cursor:"pointer"}}>
                      {m==="normal"?"NORM":m==="advantage"?"ADV":"DIS"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{fontFamily:"'Cinzel',serif",color: pendingRoll?"#c8982a":"#8b6030",fontSize:"12px",letterSpacing:"3px",marginBottom:"8px",borderBottom:"1px solid #2a1c0c",paddingBottom:"5px"}}>
              {pendingRoll ? `d${pendingRoll.die} — ${pendingRoll.skill}` : "DICE TRAY"}
            </div>

            {/* Die type selector — locked to pending die if active */}
            {!pendingRoll && (
              <div style={{display:"flex",gap:"4px",marginBottom:"12px",flexWrap:"wrap"}}>
                {[4,6,8,10,12,20].map(d => (
                  <button key={d} onClick={()=>{ setDiceType(d); setDiceResult(null); }}
                    style={{flex:"1 1 auto",background: diceType===d ? "#2a1c0c" : "transparent",
                      border:`1px solid ${diceType===d?"#c8982a":"#2a1c0c"}`,
                      color: diceType===d ? "#c8982a" : "#5a3510",
                      fontFamily:"'Cinzel',serif",fontSize:"10px",padding:"4px 2px",
                      cursor:"pointer",letterSpacing:"1px",transition:"all .15s"}}
                    onMouseEnter={e=>{ if(diceType!==d){e.target.style.borderColor="#5a3510";e.target.style.color="#8b6030";}}}
                    onMouseLeave={e=>{ if(diceType!==d){e.target.style.borderColor="#2a1c0c";e.target.style.color="#5a3510";}}}>
                    d{d}
                  </button>
                ))}
              </div>
            )}

            {/* Main die button */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
              <button onClick={rollDice} disabled={diceRolling}
                style={{background:"none",border:"none",cursor:diceRolling?"not-allowed":"pointer",padding:0,lineHeight:0}}>
                <svg viewBox="0 0 80 80" width="80" height="80"
                  style={{
                    animation: diceRolling ? "diceRoll 0.7s ease-in-out" : pendingRoll ? "pulse 1.5s infinite" : "none",
                    filter: diceRolling ? "drop-shadow(0 0 8px #c8982a)" : pendingRoll ? "drop-shadow(0 0 6px #c8982a88)" : "none",
                    transition:"filter .2s"}}>
                  <polygon points="40,4 74,24 74,56 40,76 6,56 6,24"
                    fill={diceRolling?"#2a1c08": pendingRoll?"#1e1508":"#14100a"} stroke="#c8982a" strokeWidth="1.8"/>
                  <polygon points="40,14 64,28 64,52 40,66 16,52 16,28"
                    fill="none" stroke="#5a3510" strokeWidth="0.8"/>
                  <line x1="40" y1="14" x2="40" y2="66" stroke="#2a1c0c" strokeWidth="0.6"/>
                  <line x1="16" y1="28" x2="64" y2="52" stroke="#2a1c0c" strokeWidth="0.6"/>
                  <line x1="64" y1="28" x2="16" y2="52" stroke="#2a1c0c" strokeWidth="0.6"/>
                  <text x="40" y="46" textAnchor="middle" dominantBaseline="middle"
                    fill={diceResult === (pendingRoll?.die||diceType) ? "#ffdd88" : diceResult === 1 ? "#ef4444" : "#c8982a"}
                    fontSize={diceResult ? "22" : pendingRoll ? "12" : "14"}
                    fontFamily="Cinzel,Georgia,serif" fontWeight="bold"
                    style={{animation: diceResult && !diceRolling ? "resultPop 0.3s ease-out" : "none"}}>
                    {diceRolling ? "?" : diceResult ?? (pendingRoll ? `d${pendingRoll.die}` : `d${diceType}`)}
                  </text>
                </svg>
              </button>

              {/* Result label */}
              <div style={{textAlign:"center",minHeight:"18px"}}>
                {diceResult && !diceRolling && (
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"2px",
                    color: diceResult===(pendingRoll?.die||diceType) ? "#ffdd88" : diceResult===1 ? "#ef4444" : "#8b6030"}}>
                    {diceResult===(pendingRoll?.die||diceType) ? "✦ CRITICAL!" : diceResult===1 ? "✦ FUMBLE" : `rolled ${diceResult}`}
                  </div>
                )}
              </div>

              {/* Roll history */}
              {diceHistory.length > 0 && (
                <div style={{display:"flex",gap:"4px",flexWrap:"wrap",justifyContent:"center"}}>
                  {diceHistory.map((h,i) => (
                    <div key={h.id} style={{
                      fontFamily:"'Cinzel',serif",fontSize:"10px",padding:"2px 5px",
                      background:"#100c08",border:"1px solid #1e1408",
                      color: i===0 ? "#8b6030" : "#3a2810",
                      borderColor: i===0 ? "#2a1c0c" : "#1a1208",
                      title: h.modifier ? `Raw: ${h.rawRoll} Mod: ${h.modifier>=0?"+":""}${h.modifier}` : ""}}>
                      d{h.type}:{h.result}{h.modifier ? `(${h.modifier>=0?"+":""}${h.modifier})` : ""}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden"}}>

          {/* Narrative Log */}
          <div style={{flex:1,position:"relative",minHeight:0}}>
          <div id="log-scroll" onScroll={e=>{const el=e.currentTarget;setAtBottom(el.scrollHeight-el.scrollTop-el.clientHeight<40);}}
            style={{height:"100%",overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:"14px"}}>
            {log.length === 0 && (
              <div style={{color:"#3a2810",fontSize:"16px",fontStyle:"italic",textAlign:"center",marginTop:"60px",animation:"pulse 2s infinite"}}>
                Entering the tavern...
              </div>
            )}
            {log.map(entry => (
              <div key={entry.id} style={{
                background: entry.type==="dm" ? "#120e08" : entry.type==="player" ? "#0c1006" : entry.type==="quip" ? "#0e0d10" : "#1a0808",
                border: `1px solid ${entry.type==="dm" ? "#2a1c0c" : entry.type==="player" ? "#1a280a" : entry.type==="quip" ? "#2a2030" : "#3a1010"}`,
                padding: entry.type==="player" ? "10px 16px" : "16px 18px",
                borderLeft: `${entry.type==="dm"?"4px":"2px"} solid ${entry.type==="dm" ? "#c8982a" : entry.type==="player" ? "#4ade80" : entry.type==="quip" ? "#6a5080" : "#ef4444"}`,
                animation:"fadeSlideIn .35s ease-out"
              }}>
                {entry.type === "player" && (
                  <div style={{fontFamily:"'Cinzel',serif",color:"#3a8a50",fontSize:"10px",letterSpacing:"2px",marginBottom:"4px",opacity:0.8}}>
                    ▶ {s?.name?.toUpperCase()}
                  </div>
                )}
                {entry.type === "dm" && (
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px"}}>
                    <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"11px",letterSpacing:"3px"}}>
                      ✦ DUNGEON MASTER
                    </div>
                    <button
                      onClick={()=>replayEntry(entry.text, entry.actions)}
                      style={{background:"#1e1405",border:"1px solid #5a3510",color:"#c8982a",
                        fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"2px",
                        padding:"3px 0",cursor:"pointer",transition:"background .15s,color .15s",
                        lineHeight:1.6,width:"58px",textAlign:"center",flexShrink:0}}
                      onMouseEnter={e=>{e.target.style.background="#c8982a";e.target.style.color="#0d0a08";}}
                      onMouseLeave={e=>{e.target.style.background="#1e1405";e.target.style.color="#c8982a";}}>
                      ▶ PLAY
                    </button>
                  </div>
                )}
                {entry.type === "error" && (
                  <div style={{fontFamily:"'Cinzel',serif",color:"#ef4444",fontSize:"11px",letterSpacing:"3px",marginBottom:"6px"}}>
                    ⚠ WARNING
                  </div>
                )}
                {entry.type === "quip" && (
                  <div style={{display:"flex",gap:"10px",alignItems:"flex-start",marginBottom:"8px"}}>
                    <Portrait name={entry.speaker} size={56} height={70} border="#3a2850"/>
                    <div style={{fontFamily:"'Cinzel',serif",color:"#b090c8",fontSize:"12px",letterSpacing:"2px",paddingTop:"4px"}}>
                      💬 {entry.speaker?.toUpperCase()}
                    </div>
                  </div>
                )}
                <div className="narrative-text" style={{
                  color: entry.type==="player" ? "#88b888" : entry.type==="error" ? "#c08080" : entry.type==="quip" ? "#b8a8c8" : "#dccf9a",
                  fontSize: entry.type==="player" ? "14px" : "16px",
                  lineHeight: entry.type==="player" ? 1.6 : 1.85,
                  whiteSpace:"pre-wrap",
                  fontStyle: entry.type==="quip" ? "italic" : "normal",
                  opacity: entry.type==="player" ? 0.85 : 1
                }}>
                  {entry.type==="dm"
                    ? (()=>{const ps=entry.text.split("\n\n");return ps.map((para,pi)=>(
                        <p key={pi} style={{marginBottom:pi<ps.length-1?"14px":0}}>{para}</p>
                      ));})()
                    : entry.text}
                </div>
              </div>
            ))}
            {loading && (()=>{
              const phrases=["The shadows shift…","Something stirs below…","The DM rolls in the dark…","The torchlight flickers…","Fate turns on a knife's edge…"];
              const phrase=phrases[Math.floor(Date.now()/4000)%phrases.length];
              return(
              <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"14px 18px",background:"#0e0c08",border:"1px solid #1e1408",borderLeft:"4px solid #c8982a",animation:"fadeSlideIn .3s ease-out"}}>
                <div style={{display:"flex",gap:"5px"}}>
                  {[0,.35,.7].map(d=><div key={d} style={{width:"10px",height:"10px",borderRadius:"50%",background:"#c8982a",animation:`pulse 1.2s ${d}s infinite`}}/>)}
                </div>
                <span style={{color:"#7a6030",fontSize:"14px",fontStyle:"italic"}}>{phrase}</span>
              </div>);
            })()}
            <div ref={logEndRef}/>
          </div>
          {/* Scroll to bottom button */}
          {!atBottom&&(
            <button onClick={()=>{logEndRef.current?.scrollIntoView({behavior:"smooth"});setAtBottom(true);}}
              style={{position:"absolute",bottom:"12px",right:"16px",background:"#1e1405",border:"1px solid #c8982a",
                color:"#c8982a",fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"2px",
                padding:"6px 12px",cursor:"pointer",zIndex:10,borderRadius:"2px",
                boxShadow:"0 2px 8px rgba(0,0,0,0.6)"}}>↓ LATEST</button>
          )}
          </div>

          {/* Action Buttons — 2×2 grid */}
          {actions.length > 0 && !loading && (
            <div style={{padding:"10px 14px",background:"#0e0c08",borderTop:"1px solid #1a1208"}}>
              {/* Combat quick-attack CTA */}
              {combat&&<button onClick={()=>{doAction(`I attack the ${combat.enemy}`);setSidebarOpen(false);}}
                style={{width:"100%",marginBottom:"8px",background:"#1a0808",border:"2px solid #8b1a1a",color:"#ff6060",
                  fontFamily:"'Cinzel',serif",fontSize:"13px",letterSpacing:"3px",padding:"10px",cursor:"pointer",
                  transition:"all .15s",borderRadius:"2px"}}
                onMouseEnter={e=>{e.target.style.background="#2a0808";e.target.style.borderColor="#ef4444";}}
                onMouseLeave={e=>{e.target.style.background="#1a0808";e.target.style.borderColor="#8b1a1a";}}>
                ⚔ ATTACK {combat.enemy}
              </button>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                {actions.slice(0,4).map((action,i)=>(
                  <button key={i} onClick={()=>{ doAction(action); setSidebarOpen(false); }}
                    style={{background:"#141008",border:"1px solid #2a1c0a",color:"#c9aa7a",
                      fontFamily:"'Crimson Text',Georgia,serif",fontSize:"14px",padding:"13px 14px",
                      cursor:"pointer",lineHeight:1.5,textAlign:"left",transition:"all .18s",
                      borderRadius:"2px",transform:"translateY(0)"}}
                    onMouseEnter={e=>{const t=e.currentTarget;t.style.background="#1e1608";t.style.borderColor="#c8982a";t.style.color="#f0e0b0";t.style.transform="translateY(-2px)";t.style.boxShadow="0 4px 12px rgba(0,0,0,0.4)";}}
                    onMouseLeave={e=>{const t=e.currentTarget;t.style.background="#141008";t.style.borderColor="#2a1c0a";t.style.color="#c9aa7a";t.style.transform="translateY(0)";t.style.boxShadow="none";}}>
                    <div style={{color:"#c8982a",fontFamily:"'Cinzel',serif",fontSize:"13px",fontWeight:700,marginBottom:"3px"}}>{i+1}</div>
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Input */}
          <div style={{padding:"12px 20px",background:"#0d0905",borderTop:"1px solid #1a1208",display:"flex",gap:"10px"}}>
            <input
              value={customInput}
              onChange={e=>setCustomInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&doCustom()}
              placeholder={combat?"How do you fight back…":location==="The Top Tavern"?"Ask someone, or take an action…":"What do you do in the darkness…"}
              disabled={loading}
              style={{flex:1,background:"#14100a",border:"1px solid #2a1c0c",borderBottom:"2px solid #3a2810",
                color:"#c9aa7a",fontFamily:"'Crimson Text',Georgia,serif",fontSize:"15px",padding:"10px 14px",
                outline:"none",opacity:loading?.5:1}}
            />
            <button onClick={doCustom} disabled={loading||!customInput.trim()}
              style={{background:"transparent",border:"1px solid #c8982a",color:"#c8982a",
                fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"3px",padding:"10px 20px",
                cursor:loading||!customInput.trim()?"not-allowed":"pointer",
                opacity:loading||!customInput.trim()?0.4:1,transition:"all .2s",whiteSpace:"nowrap"}}
              onMouseEnter={e=>{if(!loading&&customInput.trim()){e.target.style.background="#c8982a";e.target.style.color="#0d0a08";}}}
              onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#c8982a";}}>
              DO IT
            </button>
          </div>
        </div>
      </div>

      {/* ── Bestiary Modal ────────────────────────────────────────── */}
      {showBestiary && (
        <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:"20px"}} onClick={()=>setShowBestiary(false)}>
          <div style={{background:"#0d0905",border:"2px solid #c8982a",padding:"24px",maxWidth:500,width:"100%",maxHeight:"88vh",overflowY:"auto",position:"relative"}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setShowBestiary(false)} title="Close"
              style={{position:"absolute",top:"12px",right:"14px",background:"transparent",border:"none",
                color:"#5a3510",fontSize:"20px",cursor:"pointer",lineHeight:1,padding:"2px 6px",zIndex:10}}
              onMouseEnter={e=>{e.target.style.color="#9070d0";}}
              onMouseLeave={e=>{e.target.style.color="#5a3510";}}>×</button>
            <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"15px",letterSpacing:"4px",textAlign:"center",marginBottom:"20px"}}>📜 BESTIARY</div>
            {Object.keys(bestiary).length === 0 ? (
              <div style={{textAlign:"center",padding:"30px",color:"#3a2810",fontStyle:"italic",fontFamily:"'Cinzel',serif",letterSpacing:"2px",fontSize:"13px"}}>
                — no creatures encountered yet —<br/>
                <span style={{fontSize:"12px",display:"block",marginTop:"8px"}}>Entries appear as you defeat enemies</span>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {Object.entries(bestiary).map(([name,data])=>(
                  <BestiaryEntry key={name} name={name} data={data}/>
                ))}
              </div>
            )}
            <button onClick={()=>setShowBestiary(false)} style={{display:"block",margin:"16px auto 0",background:"transparent",border:"1px solid #5a3510",color:"#7a5828",fontFamily:"'Cinzel',serif",fontSize:"12px",padding:"8px 24px",cursor:"pointer",letterSpacing:"2px"}}>
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* ── Quest Board Modal ─────────────────────────────────────── */}
      {showQuests && (
        <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:"20px"}} onClick={()=>setShowQuests(false)}>
          <div style={{background:"#0d0905",border:"2px solid #c8982a",padding:"0",maxWidth:540,width:"100%",maxHeight:"90vh",overflowY:"auto",position:"relative"}} onClick={e=>e.stopPropagation()}>

            {/* Header with Valdris portrait — enlarged */}
            <button onClick={()=>setShowQuests(false)} title="Close"
              style={{position:"absolute",top:"12px",right:"14px",background:"transparent",border:"none",
                color:"#5a3510",fontSize:"20px",cursor:"pointer",lineHeight:1,padding:"2px 6px",zIndex:10}}
              onMouseEnter={e=>{e.target.style.color="#c8982a";}}
              onMouseLeave={e=>{e.target.style.color="#5a3510";}}>×</button>
            <div style={{display:"flex",gap:"0",borderBottom:"2px solid #2a1c0c"}}>
              <div style={{flexShrink:0}}>
                <Portrait name="Valdris" size={140} height={175} border="#2a1c0c"/>
              </div>
              <div style={{flex:1,padding:"20px 22px",display:"flex",flexDirection:"column",justifyContent:"center",gap:"6px"}}>
                <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"17px",letterSpacing:"4px"}}>📋 BOUNTY BOARD</div>
                <div style={{fontFamily:"'Cinzel',serif",color:"#8b7050",fontSize:"12px",letterSpacing:"3px"}}>VALDRIS — HUNTER, VETERAN</div>
                <div style={{width:"40px",height:"1px",background:"#3a2810"}}/>
                <div style={{color:"#c9aa7a",fontSize:"15px",lineHeight:1.7,fontStyle:"italic"}}>
                  "Town pays. I verify. Don't come back without proof."
                </div>
                <div style={{color:"#5a4028",fontSize:"12px",fontStyle:"italic"}}>One arm. No mercy.</div>
              </div>
            </div>

            <div style={{padding:"20px"}}>
              {/* Available quests from Valdris */}
              <div style={{marginBottom:"20px"}}>
                <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"13px",letterSpacing:"3px",marginBottom:"12px",borderBottom:"1px solid #2a1c0c",paddingBottom:"5px"}}>
                  AVAILABLE CONTRACTS
                </div>
                {[
                  { id:"missing_cart", title:"The Missing Cart", diff:"Easy", reward:15, icon:"🛒",
                    desc:"A supply cart from the lowlands never arrived. Last seen on the south road, two days past. Find it or find what happened to it.",
                    risk:"CON save DC 10 vs blizzard cold", locked: false },
                  { id:"the_howling", title:"The Howling", diff:"Medium", reward:25, icon:"🐺",
                    desc:"Something is killing livestock at the edge of town. Three farms hit in four nights. Track it and end it.",
                    risk:"CON save DC 12 vs blizzard cold", locked: quests.filter(q=>q.status==="completed").length < 1 },
                  { id:"valdris_arm", title:"???", diff:"Hard", reward:"???", icon:"🪝",
                    desc: quests.filter(q=>q.status==="completed").length >= 2
                      ? "Valdris tells you where he lost his arm. The old mill ruins, half a mile east. Something spoke to him out there. Something drawn to the black ore."
                      : "Valdris glances at his hook. Looks away. \"Earn my trust first.\"",
                    risk:"Unknown", locked: quests.filter(q=>q.status==="completed").length < 2 },
                ].map(quest => {
                  const tracked = quests.find(q => q.id === quest.id);
                  const status  = tracked?.status || "available";
                  const diffColor = quest.diff==="Easy"?"#4a7a30":quest.diff==="Medium"?"#c8982a":"#8a3020";
                  return (
                    <div key={quest.id} style={{background: quest.locked?"#0c0a08":"#120e08",
                      border:`1px solid ${status==="completed"?"#2a4a20":status==="active"?"#c8982a":quest.locked?"#1a1408":"#2a1c0c"}`,
                      padding:"14px 16px", marginBottom:"10px", opacity: quest.locked?0.5:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
                        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                          <span style={{fontSize:"18px"}}>{quest.icon}</span>
                          <span style={{fontFamily:"'Cinzel',serif",color: quest.locked?"#5a4028":status==="completed"?"#4ade80":"#e8d9b5",fontSize:"15px",fontWeight:600}}>
                            {quest.title}
                          </span>
                        </div>
                        <div style={{display:"flex",gap:"8px",alignItems:"center",flexShrink:0}}>
                          <span style={{color:diffColor,fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"2px"}}>{quest.diff}</span>
                          {status==="completed" && <span style={{color:"#4ade80",fontSize:"12px"}}>✓ DONE</span>}
                          {status==="active"    && <span style={{color:"#c8982a",fontSize:"11px",fontFamily:"'Cinzel',serif",animation:"pulse 2s infinite"}}>● ACTIVE</span>}
                        </div>
                      </div>
                      <div style={{color:"#a09060",fontSize:"14px",lineHeight:1.6,marginBottom:"8px",fontStyle:"italic"}}>{quest.desc}</div>
                      {!quest.locked && status!=="completed" && (
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"8px",paddingTop:"8px",borderTop:"1px solid #1e1808"}}>
                          <div>
                            <span style={{color:"#6a4028",fontSize:"12px",fontFamily:"'Cinzel',serif",letterSpacing:"1px"}}>REWARD: </span>
                            <span style={{color:"#c8982a",fontSize:"14px",fontFamily:"'Cinzel',serif",fontWeight:700}}>{typeof quest.reward==="number"?`${quest.reward}gp`:quest.reward}</span>
                          </div>
                          <div style={{color:"#5a3510",fontSize:"11px",fontStyle:"italic"}}>⚠ {quest.risk}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Completed quests */}
              {quests.filter(q=>q.status==="completed").length > 0 && (
                <div>
                  <div style={{fontFamily:"'Cinzel',serif",color:"#4a6a30",fontSize:"12px",letterSpacing:"3px",marginBottom:"10px",borderBottom:"1px solid #1e2a10",paddingBottom:"5px"}}>
                    COMPLETED
                  </div>
                  {quests.filter(q=>q.status==="completed").map(q=>(
                    <div key={q.id} style={{display:"flex",gap:"10px",alignItems:"center",marginBottom:"6px",color:"#4a6a30",fontSize:"13px"}}>
                      <span>✓</span><span style={{fontStyle:"italic"}}>{q.title}</span>
                      {q.reward&&<span style={{marginLeft:"auto",color:"#4a7a30",fontFamily:"'Cinzel',serif",fontSize:"12px"}}>+{q.reward}gp</span>}
                    </div>
                  ))}
                </div>
              )}

              <div style={{color:"#5a3510",fontSize:"12px",fontStyle:"italic",textAlign:"center",marginTop:"16px",paddingTop:"12px",borderTop:"1px solid #1e1408"}}>
                Speak to Valdris at The Top Tavern to accept a contract
              </div>
            </div>

            <button onClick={()=>setShowQuests(false)} style={{display:"block",margin:"0 auto 16px",background:"transparent",border:"1px solid #5a3510",color:"#7a5828",fontFamily:"'Cinzel',serif",fontSize:"12px",padding:"8px 24px",cursor:"pointer",letterSpacing:"2px"}}>
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Journal Modal */}
      {showJournal && (
        <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:"20px"}} onClick={()=>setShowJournal(false)}>
          <div style={{background:"#0d0905",border:"2px solid #c8982a",padding:"24px",maxWidth:540,width:"100%",maxHeight:"88vh",overflowY:"auto",position:"relative"}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setShowJournal(false)} title="Close"
              style={{position:"absolute",top:"12px",right:"14px",background:"transparent",border:"none",
                color:"#5a3510",fontSize:"20px",cursor:"pointer",lineHeight:1,padding:"2px 6px",zIndex:10}}
              onMouseEnter={e=>{e.target.style.color="#c8982a";}}
              onMouseLeave={e=>{e.target.style.color="#5a3510";}}>×</button>
            <div style={{textAlign:"center",marginBottom:"20px"}}>
              <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"16px",letterSpacing:"4px",marginBottom:"8px"}}>📖 QUEST JOURNAL</div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",justifyContent:"center"}}>
                <div style={{flex:1,height:"1px",background:"linear-gradient(to right,transparent,#3a2810)"}}/>
                <span style={{color:"#5a3510",fontSize:"12px"}}>✦</span>
                <div style={{flex:1,height:"1px",background:"linear-gradient(to left,transparent,#3a2810)"}}/>
              </div>
            </div>

            {/* Objectives */}
            <Section title="OBJECTIVES" color="#c8982a" empty={journal.objectives.length===0}>
              {journal.objectives.map((o,i)=>(
                <div key={i} style={{display:"flex",gap:"8px",marginBottom:"6px",alignItems:"flex-start",animation:"fadeSlideIn .3s ease-out"}}>
                  <span style={{color:"#c8982a",marginTop:"2px",flexShrink:0}}>◆</span>
                  <span style={{color:"#d8c898",fontSize:"14px",lineHeight:1.6}}>{o}</span>
                </div>
              ))}
            </Section>

            {/* Clues */}
            <Section title="CLUES DISCOVERED" color="#8b9a50" empty={journal.clues.length===0}>
              {journal.clues.map((c,i)=>(
                <div key={i} style={{display:"flex",gap:"8px",marginBottom:"5px",alignItems:"flex-start"}}>
                  <span style={{color:"#8b9a50",marginTop:"2px",flexShrink:0}}>◇</span>
                  <span style={{color:"#c9d898",fontSize:"13px",lineHeight:1.6,fontStyle:"italic"}}>{c}</span>
                </div>
              ))}
            </Section>

            {/* NPCs */}
            <Section title="PEOPLE MET" color="#8a6a9a" empty={journal.npcs.length===0}>
              {journal.npcs.map((n,i)=>(
                <div key={i} style={{marginBottom:"8px",paddingLeft:"10px",borderLeft:"2px solid #3a2850"}}>
                  <div style={{color:"#c8a8d8",fontSize:"13px",fontFamily:"'Cinzel',serif",letterSpacing:"1px",marginBottom:"2px"}}>{n.name}</div>
                  <div style={{color:"#8a7890",fontSize:"12px",fontStyle:"italic"}}>{n.note}</div>
                </div>
              ))}
            </Section>

            {/* Items of interest */}
            {journal.items.length > 0 && (
              <Section title="ITEMS OF INTEREST" color="#a08040" empty={false}>
                {journal.items.map((it,i)=>(
                  <div key={i} style={{color:"#c8a860",fontSize:"13px",marginBottom:"4px"}}>• {it}</div>
                ))}
              </Section>
            )}

            {journal.objectives.length===0 && journal.clues.length===0 && journal.npcs.length===0 && (
              <div style={{textAlign:"center",padding:"30px",color:"#3a2810",fontStyle:"italic",fontFamily:"'Cinzel',serif",letterSpacing:"2px",fontSize:"13px"}}>
                — your journal is empty —<br/>
                <span style={{fontSize:"12px",display:"block",marginTop:"8px"}}>Clues, objectives and NPCs appear as you explore</span>
              </div>
            )}

            <button onClick={()=>setShowJournal(false)} style={{display:"block",margin:"14px auto 0",background:"transparent",border:"1px solid #5a3510",color:"#7a5828",fontFamily:"'Cinzel',serif",fontSize:"12px",padding:"8px 24px",cursor:"pointer",letterSpacing:"2px"}}>
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* ── Ashfen Draw — Mira's Card Game ─────────────────────────── */}
      {showCardGame && (
        <div style={{position:"fixed",inset:0,background:"#000000dd",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px"}} onClick={()=>setShowCardGame(false)}>
          <CardGame stateRef={stateRef} miraRef={miraRef} gameState={gameState} miraWon={miraWon} setMiraWon={setMiraWon} setGameState={setGameState} setLog={setLog} setShowCardGame={setShowCardGame}/>
        </div>
      )}
      {showShop && (() => {
        const SHOP_ITEMS = [
          { id:"torch",    name:"Torch",            cost:1,  unit:"sp", costGold:0.1, desc:"Burns for ~1 hour. Essential underground.", inv:"Torch" },
          { id:"rations",  name:"Rations (1 day)",  cost:5,  unit:"sp", costGold:0.5, desc:"Dried meat and hardtack. Needed to rest.", isRation:true },
          { id:"rope",     name:"Rope (50ft)",       cost:1,  unit:"gp", costGold:1,   desc:"Hempen rope. Many uses in the deep.", inv:"Rope (50ft)" },
          { id:"antitoxin",name:"Antitoxin",         cost:25, unit:"gp", costGold:25,  desc:"Advantage on CON saves vs poison for 1 hour.", inv:"Antitoxin" },
          { id:"potion",   name:"Healing Potion",    cost:25, unit:"gp", costGold:25,  desc:"Restore 2d4+2 HP. Rare in Ashfen — Gorn has 2 left.", inv:"Healing Potion" },
        ];
        const gold = stateRef.current?.gold || 0;
        return (
          <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:"20px"}} onClick={()=>setShowShop(false)}>
            <div style={{background:"#0d0905",border:"2px solid #c8982a",padding:"24px",maxWidth:460,width:"100%",maxHeight:"88vh",overflowY:"auto",position:"relative"}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setShowShop(false)} title="Close"
                style={{position:"absolute",top:"12px",right:"14px",background:"transparent",border:"none",
                  color:"#5a3510",fontSize:"20px",cursor:"pointer",lineHeight:1,padding:"2px 6px",zIndex:10}}
                onMouseEnter={e=>{e.target.style.color="#c8982a";}}
                onMouseLeave={e=>{e.target.style.color="#5a3510";}}>×</button>
              <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"15px",letterSpacing:"4px",textAlign:"center",marginBottom:"4px"}}>🪙 GORN'S SUPPLIES</div>
              <div style={{color:"#5a4028",fontSize:"13px",fontStyle:"italic",textAlign:"center",marginBottom:"20px"}}>"Don't ask where I got it. You got gold?"</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",padding:"8px 12px",background:"#14100a",border:"1px solid #2a1c0c"}}>
                <span style={{color:"#8b6030",fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"3px"}}>YOUR GOLD</span>
                <span style={{color:"#c8982a",fontFamily:"'Cinzel',serif",fontSize:"18px",fontWeight:700}}>{gold}gp</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {SHOP_ITEMS.map(item => {
                  const canAfford = gold >= item.costGold;
                  return (
                    <div key={item.id} style={{background:"#120e08",border:`1px solid ${canAfford?"#2a1c0c":"#1a1208"}`,padding:"12px 16px",display:"flex",alignItems:"center",gap:"12px",opacity:canAfford?1:0.5}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
                          <span style={{fontFamily:"'Cinzel',serif",color:canAfford?"#c9aa7a":"#5a4028",fontSize:"14px",fontWeight:600}}>{item.name}</span>
                          <span style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"14px"}}>{item.cost}{item.unit}</span>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"8px"}}>
                          <div style={{color:"#6a5030",fontSize:"12px",fontStyle:"italic"}}>{item.desc}</div>
                          {item.id==="potion" && <div style={{color:"#4a3020",fontSize:"10px",fontFamily:"'Cinzel',serif",letterSpacing:"1px",flexShrink:0}}>RARE</div>}
                        </div>
                      </div>
                      <button
                        disabled={!canAfford}
                        onClick={()=>{
                          if (!canAfford) { showToast(`Not enough gold — need ${item.cost}${item.unit}`); return; }
                          setGameState(prev => {
                            const newGold = Math.max(0, (prev?.gold||0) - item.costGold);
                            const newInv  = item.isRation ? prev.inventory : [...(prev?.inventory||[]), item.inv];
                            const newRat  = item.isRation ? (prev?.rations||0) + 1 : prev?.rations||0;
                            return { ...prev, gold: newGold, inventory: newInv, rations: newRat };
                          });
                          audio.playSfx('diceRoll'); // coin clink approximation
                          setLog(prev => [...prev, { type:"player", text:`Purchased ${item.name} from Gorn for ${item.cost}${item.unit}.`, id:Date.now() }]);
                        }}
                        style={{background:"transparent",border:`1px solid ${canAfford?"#5a3510":"#2a1c0c"}`,
                          color:canAfford?"#c8982a":"#3a2810",fontFamily:"'Cinzel',serif",
                          fontSize:"11px",letterSpacing:"2px",padding:"6px 14px",cursor:canAfford?"pointer":"not-allowed",
                          whiteSpace:"nowrap",transition:"all .15s"}}
                        onMouseEnter={e=>{ if(canAfford){e.target.style.background="#c8982a";e.target.style.color="#0d0a08";}}}
                        onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color=canAfford?"#c8982a":"#3a2810";}}>
                        BUY
                      </button>
                    </div>
                  );
                })}
              </div>
              <button onClick={()=>setShowShop(false)} style={{display:"block",margin:"16px auto 0",background:"transparent",border:"1px solid #5a3510",color:"#7a5828",fontFamily:"'Cinzel',serif",fontSize:"12px",padding:"8px 24px",cursor:"pointer",letterSpacing:"2px"}}>
                LEAVE
              </button>
            </div>
          </div>
        );
      })()}

      {/* Recruit Modal */}
      {showRecruit && (
        <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:"20px"}} onClick={()=>setShowRecruit(false)}>
          <div style={{background:"#0d0905",border:"2px solid #c8982a",padding:"24px",maxWidth:520,width:"100%",maxHeight:"90vh",overflowY:"auto",position:"relative"}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setShowRecruit(false)} title="Close"
              style={{position:"absolute",top:"12px",right:"14px",background:"transparent",border:"none",
                color:"#5a3510",fontSize:"20px",cursor:"pointer",lineHeight:1,padding:"2px 6px",zIndex:10}}
              onMouseEnter={e=>{e.target.style.color="#4ade80";}}
              onMouseLeave={e=>{e.target.style.color="#5a3510";}}>×</button>
            <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"15px",letterSpacing:"4px",textAlign:"center",marginBottom:"6px"}}>HIRE COMPANIONS</div>
            <div style={{color:"#5a4028",fontSize:"13px",fontStyle:"italic",textAlign:"center",marginBottom:"20px"}}>Available at The Top Tavern</div>
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {Object.values(HIRELINGS).map(h => {
                const inParty  = party.some(m => m.id === h.id);
                const isDead   = party.find(m => m.id === h.id)?.dead;
                return (
                  <div key={h.id}
                    style={{background:"#120e08",border:`1px solid ${inParty?"#c8982a":"#2a1c0c"}`,
                      padding:"16px",display:"flex",gap:"14px",alignItems:"flex-start",
                      opacity:isDead?0.4:1,transition:"all .2s",cursor:"default"}}
                    onMouseEnter={e=>{if(!isDead)e.currentTarget.style.background="#160e08";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="#120e08";}}>
                    <Portrait name={h.name} size={60} height={75} border={inParty?"#c8982a":isDead?"#3a1010":"#2a1c0c"}/>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"'Cinzel',serif",color: inParty?"#c8982a":"#e8d9b5",fontSize:"16px",fontWeight:600,marginBottom:"2px"}}>{h.name}</div>
                      <div style={{color:"#7a5828",fontSize:"13px",fontStyle:"italic",marginBottom:"8px"}}>{h.role} · {h.cost}gp/day</div>
                      <div style={{display:"flex",gap:"14px",marginBottom:"8px"}}>
                        {[["HP",`${h.hp}/${h.maxHp}`],["AC",h.ac]].map(([l,v])=>(
                          <div key={l} style={{textAlign:"center"}}>
                            <div style={{color:"#5a3510",fontSize:"10px",fontFamily:"'Cinzel',serif",letterSpacing:"2px"}}>{l}</div>
                            <div style={{color:"#c9aa7a",fontSize:"15px",fontFamily:"'Cinzel',serif",fontWeight:600}}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{color:"#7a6040",fontSize:"13px",fontStyle:"italic",marginBottom:"4px"}}>{h.personality}</div>
                      <div style={{color:"#c8982a",fontSize:"13px",fontStyle:"italic",opacity:.7}}>{h.quote}</div>
                    </div>
                    <div>
                      {isDead ? (
                        <div style={{color:"#5a2020",fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"2px"}}>FALLEN</div>
                      ) : inParty ? (
                        <button onClick={()=>{ setParty(prev=>prev.filter(m=>m.id!==h.id)); }}
                          style={{background:"transparent",border:"1px solid #5a1a1a",color:"#8b3030",fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"2px",padding:"6px 12px",cursor:"pointer"}}
                          onMouseEnter={e=>{e.target.style.color="#ef4444";e.target.style.borderColor="#8b3030";}}
                          onMouseLeave={e=>{e.target.style.color="#8b3030";e.target.style.borderColor="#5a1a1a";}}>
                          DISMISS
                        </button>
                      ) : (
                        <button onClick={()=>{
                          if ((stateRef.current?.gold||0) < h.cost) { showToast(`Not enough gold — ${h.name} costs ${h.cost}gp/day`); return; }
                          setParty(prev=>[...prev, { ...h, hp:h.maxHp, dead:false }]);
                          setLog(prev=>[...prev,{type:"quip",text:`${h.name} grips their weapon and nods. ${h.quote}`,speaker:h.name,id:Date.now()}]);
                        }}
                          style={{background:"transparent",border:"1px solid #3a5020",color:"#6b9050",fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"2px",padding:"6px 12px",cursor:"pointer"}}
                          onMouseEnter={e=>{e.target.style.background="#1a2a0a";e.target.style.color="#4ade80";}}
                          onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#6b9050";}}>
                          HIRE
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{color:"#5a3510",fontSize:"12px",fontStyle:"italic",textAlign:"center",marginTop:"16px"}}>
              Wages deducted automatically on Long Rest
            </div>
            <button onClick={()=>setShowRecruit(false)} style={{display:"block",margin:"14px auto 0",background:"transparent",border:"1px solid #5a3510",color:"#7a5828",fontFamily:"'Cinzel',serif",fontSize:"12px",padding:"8px 24px",cursor:"pointer",letterSpacing:"2px"}}>
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMap && (
        <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:"20px"}} onClick={()=>setShowMap(false)}>
          <div style={{background:"#0d0905",border:"2px solid #c8982a",padding:"20px",maxWidth:520,width:"100%",position:"relative",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            {/* Tab bar */}
            <div style={{display:"flex",gap:"8px",marginBottom:"16px",justifyContent:"center"}}>
              {["tavern","town","dungeon"].map(tab=>(
                <button key={tab} onClick={()=>setMapTab(tab)}
                  style={{background: mapTab===tab?"#2a1c0c":"transparent",
                    border:`1px solid ${mapTab===tab?"#c8982a":"#3a2810"}`,
                    color: mapTab===tab?"#c8982a":"#7a5828",
                    fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"3px",padding:"6px 16px",cursor:"pointer"}}>
                  {tab==="tavern"?"THE TAVERN":tab==="town"?"ASHFEN":"THE DEEP"}
                </button>
              ))}
            </div>

            {mapTab === "town" && <>
              <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"14px",letterSpacing:"4px",textAlign:"center",marginBottom:"16px"}}>
                ASHFEN — TOWN MAP
              </div>
              <svg viewBox="0 0 440 340" style={{width:"100%",maxWidth:480,display:"block"}}>
                <rect width="440" height="340" fill="#0a0c08"/>
                <rect x="2" y="2" width="436" height="336" fill="none" stroke="#c8982a" strokeWidth="1.5"/>
                {/* Snowy ground */}
                <rect x="2" y="2" width="436" height="336" fill="#0c100a"/>
                {/* Main road — horizontal */}
                <rect x="0" y="155" width="440" height="30" fill="#1a1e14"/>
                {/* Main road — vertical */}
                <rect x="200" y="0" width="30" height="340" fill="#1a1e14"/>
                {/* Road markings */}
                <line x1="0" y1="170" x2="440" y2="170" stroke="#2a2e20" strokeWidth="1" strokeDasharray="20,10"/>
                <line x1="215" y1="0" x2="215" y2="340" stroke="#2a2e20" strokeWidth="1" strokeDasharray="20,10"/>
                {/* THE TOP TAVERN */}
                <rect x="20" y="60" width="80" height="60" rx="3" fill="#1e1408" stroke="#c8982a" strokeWidth="2"/>
                <rect x="22" y="62" width="76" height="56" fill="#14100a"/>
                <text x="60" y="88" fill="#c8982a" fontSize="9" textAnchor="middle" fontFamily="Cinzel,serif" letterSpacing="1">TOP</text>
                <text x="60" y="100" fill="#c8982a" fontSize="9" textAnchor="middle" fontFamily="Cinzel,serif" letterSpacing="1">TAVERN</text>
                <text x="60" y="112" fill="#c8982a" fontSize="14" textAnchor="middle">🍺</text>
                {/* YOU marker — pulsing via CSS */}
                <circle cx="60" cy="150" r="12" fill="#ef4444" opacity="0.2"
                  style={{animation:"pulse 2s infinite",transformOrigin:"60px 150px"}}/>
                <circle cx="60" cy="150" r="7" fill="#ef4444" opacity="0.9"/>
                <text x="60" y="154" fill="white" fontSize="8" textAnchor="middle" fontFamily="Cinzel,serif">YOU</text>
                {/* BLACKSMITH */}
                <rect x="260" y="60" width="80" height="60" rx="3" fill="#1a1410" stroke="#8a6020" strokeWidth="1.5"/>
                <text x="300" y="88" fill="#c8982a" fontSize="9" textAnchor="middle" fontFamily="Cinzel,serif" letterSpacing="1">PETRA'S</text>
                <text x="300" y="100" fill="#c8982a" fontSize="9" textAnchor="middle" fontFamily="Cinzel,serif">SMITHY</text>
                <text x="300" y="112" fill="#c8982a" fontSize="13" textAnchor="middle">⚒</text>
                {/* MAYOR'S HALL */}
                <rect x="260" y="200" width="100" height="70" rx="3" fill="#14100e" stroke="#8a6040" strokeWidth="1.5"/>
                <text x="310" y="228" fill="#c9aa7a" fontSize="9" textAnchor="middle" fontFamily="Cinzel,serif">MAYOR</text>
                <text x="310" y="240" fill="#c9aa7a" fontSize="9" textAnchor="middle" fontFamily="Cinzel,serif">HOLVIK'S HALL</text>
                <text x="310" y="255" fill="#c9aa7a" fontSize="13" textAnchor="middle">🏛</text>
                {/* SEALED MINE */}
                <rect x="20" y="220" width="80" height="60" rx="3" fill="#0e0e0c" stroke="#5a3020" strokeWidth="1.5" strokeDasharray="4,3"/>
                <text x="60" y="248" fill="#8a5028" fontSize="9" textAnchor="middle" fontFamily="Cinzel,serif">SEALED</text>
                <text x="60" y="260" fill="#8a5028" fontSize="9" textAnchor="middle" fontFamily="Cinzel,serif">MINE ⚠</text>
                <text x="60" y="272" fill="#8a5028" fontSize="12" textAnchor="middle">⛏</text>
                {/* SOUTH ROAD sign */}
                <rect x="150" y="302" width="80" height="20" rx="2" fill="#141a10" stroke="#3a4a28" strokeWidth="1"/>
                <text x="190" y="316" fill="#6a8050" fontSize="9" textAnchor="middle" fontFamily="Cinzel,serif">↓ SOUTH ROAD</text>
                {/* BLIZZARD direction */}
                <text x="390" y="30" fill="#6888a8" fontSize="9" textAnchor="end" fontFamily="Cinzel,serif" opacity="0.6">❄ N ↑</text>
                {/* Houses scattered */}
                {[[140,60],[140,80],[140,100],[380,80],[380,100],[380,200],[380,220],[140,220],[140,240]].map(([x,y],i)=>(
                  <rect key={i} x={x} y={y} width="36" height="26" rx="2" fill="#0e0e0c" stroke="#2a3020" strokeWidth="1"/>
                ))}
                <text x="160" y="200" fill="#4a6038" fontSize="9" textAnchor="middle" fontFamily="Cinzel,serif" opacity="0.6">HOMES</text>
                <text x="390" y="165" fill="#4a6038" fontSize="9" textAnchor="middle" fontFamily="Cinzel,serif" opacity="0.6">FARMS →</text>
              </svg>
            </>}

            {mapTab === "tavern" && <>
              <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"14px",letterSpacing:"4px",textAlign:"center",marginBottom:"16px"}}>
                THE TOP TAVERN — ASHFEN
              </div>
              <TavernMap/>
              <div style={{marginTop:"14px",padding:"10px 14px",background:"#100c08",border:"1px solid #1e1408",fontSize:"13px",color:"#7a5828",lineHeight:1.7,fontStyle:"italic"}}>
                "Three miners went down that stairwell last month. None came back."<br/>— Gorn, barman
              </div>
            </>}

            {mapTab === "dungeon" && <>
              <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"14px",letterSpacing:"4px",textAlign:"center",marginBottom:"16px"}}>
                THE DEEP — EXPLORED AREAS
              </div>
              {Object.keys(dungeonMap.rooms).length === 0 ? (
                <div style={{textAlign:"center",padding:"40px 20px",color:"#3a2810",fontSize:"14px",fontStyle:"italic",fontFamily:"'Cinzel',serif",letterSpacing:"2px"}}>
                  — uncharted darkness —<br/>
                  <span style={{fontSize:"12px",marginTop:"8px",display:"block"}}>Rooms appear as you explore the depths</span>
                </div>
              ) : (
                <div style={{background:"#070505",border:"1px solid #1a1208",overflow:"auto",position:"relative"}}>
                  <svg width="100%" viewBox={`0 0 ${Math.max(520, ...Object.values(dungeonMap.rooms).map(r=>r.x+140))} ${Math.max(200, ...Object.values(dungeonMap.rooms).map(r=>r.y+80))}`} style={{display:"block"}}>
                    {/* Draw connections */}
                    {Object.values(dungeonMap.rooms).map(room =>
                      (room.connections||[]).filter(cid=>dungeonMap.rooms[cid]).map(cid=>{
                        const target = dungeonMap.rooms[cid];
                        return <line key={`${room.label}-${cid}`}
                          x1={room.x+60} y1={room.y+18} x2={target.x+60} y2={target.y+18}
                          stroke="#3a2810" strokeWidth="2" strokeDasharray="4,3"/>;
                      })
                    )}
                    {/* Draw rooms */}
                    {Object.entries(dungeonMap.rooms).map(([id, room]) => {
                      const isCurrent = dungeonMap.currentRoom === id;
                      return (
                        <g key={id}>
                          <rect x={room.x} y={room.y} width="120" height="36" rx="2"
                            fill={isCurrent?"#2a1c08":"#100c08"}
                            stroke={isCurrent?"#c8982a":"#3a2810"} strokeWidth={isCurrent?1.5:1}/>
                          <text x={room.x+60} y={room.y+15} textAnchor="middle"
                            fill={isCurrent?"#c8982a":"#7a5828"} fontSize="10"
                            fontFamily="Cinzel,Georgia,serif">{room.label}</text>
                          {isCurrent && (
                            <circle cx={room.x+110} cy={room.y+10} r="5" fill="#ef4444" opacity="0.9"
                              style={{animation:"pulse 1.5s infinite"}}/>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </>}

            <button onClick={()=>setShowMap(false)} title="Close"
              style={{position:"absolute",top:"12px",right:"14px",background:"transparent",border:"none",
                color:"#5a3510",fontSize:"20px",cursor:"pointer",lineHeight:1,padding:"2px 6px",zIndex:10}}
              onMouseEnter={e=>{e.target.style.color="#c8982a";}}
              onMouseLeave={e=>{e.target.style.color="#5a3510";}}>×</button>
            <button onClick={()=>setShowMap(false)} style={{display:"block",margin:"14px auto 0",background:"transparent",border:"1px solid #5a3510",color:"#7a5828",fontFamily:"'Cinzel',serif",fontSize:"12px",padding:"8px 24px",cursor:"pointer",letterSpacing:"2px"}}>
              CLOSE MAP
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm Modal ─────────────────────────────────────────────── */}
      {confirmModal && (
        <div style={{position:"fixed",inset:0,background:"#000000d0",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:"20px"}}
          onClick={()=>{confirmModal.onCancel?.();setConfirmModal(null);}}>
          <div style={{background:"#0d0905",border:"2px solid #c8982a",padding:"28px 32px",maxWidth:400,width:"100%",textAlign:"center"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"'Cinzel',serif",color:"#c8982a",fontSize:"16px",letterSpacing:"3px",marginBottom:"10px"}}>{confirmModal.title}</div>
            <div style={{color:"#a09060",fontSize:"15px",lineHeight:1.7,marginBottom:"24px",fontStyle:"italic"}}>{confirmModal.msg}</div>
            <div style={{display:"flex",gap:"12px",justifyContent:"center"}}>
              <button onClick={()=>{confirmModal.onConfirm?.();setConfirmModal(null);}}
                style={{background:"transparent",border:"2px solid #c8982a",color:"#c8982a",fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"3px",padding:"10px 28px",cursor:"pointer",transition:"all .2s"}}
                onMouseEnter={e=>{e.target.style.background="#c8982a";e.target.style.color="#0d0a08";}}
                onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#c8982a";}}>
                {confirmModal.confirmLabel||"CONFIRM"}
              </button>
              <button onClick={()=>{confirmModal.onCancel?.();setConfirmModal(null);}}
                style={{background:"transparent",border:"1px solid #3a2810",color:"#7a5828",fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"2px",padding:"10px 20px",cursor:"pointer"}}
                onMouseEnter={e=>{e.target.style.borderColor="#7a5828";e.target.style.color="#c9aa7a";}}
                onMouseLeave={e=>{e.target.style.borderColor="#3a2810";e.target.style.color="#7a5828";}}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notifications ─────────────────────────────────────────── */}
      <div style={{position:"fixed",bottom:"80px",left:"50%",transform:"translateX(-50%)",zIndex:1999,display:"flex",flexDirection:"column",gap:"8px",pointerEvents:"none"}}>
        {toasts.map(t=>(
          <div key={t.id} style={{background:"#1a1408",border:"1px solid #c8982a",color:"#c9aa7a",
            fontFamily:"'Crimson Text',Georgia,serif",fontSize:"14px",padding:"10px 20px",
            borderRadius:"3px",boxShadow:"0 4px 16px rgba(0,0,0,0.6)",animation:"fadeSlideIn .3s ease-out",
            whiteSpace:"nowrap"}}>
            {t.msg}
          </div>
        ))}
      </div>

            {/* ── Legacy Item Modal (New Game+) ───────────────────────────── */}
      {legacyModal && (
        <div style={{position:"fixed",inset:0,background:"#000000f0",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2100,padding:"20px"}}>
          <div style={{background:"#0d0a06",border:`2px solid ${legacyModal.endingColor||"#c8982a"}`,padding:"32px",maxWidth:440,width:"100%",textAlign:"center",position:"relative",animation:"fadeSlideIn .5s ease-out"}}>
            {/* Glow */}
            <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 0%, ${legacyModal.endingColor||"#c8982a"}18, transparent 70%)`,pointerEvents:"none"}}/>
            <div style={{fontFamily:"'Cinzel',serif",color:legacyModal.endingColor||"#c8982a",fontSize:"11px",letterSpacing:"5px",marginBottom:"12px",opacity:0.8}}>— NEW GAME+ —</div>
            <div style={{fontFamily:"'Cinzel',serif",color:legacyModal.endingColor||"#c8982a",fontSize:"11px",letterSpacing:"5px",marginBottom:"16px"}}>LEGACY ITEM ACQUIRED</div>
            <div style={{width:"50px",height:"1px",background:legacyModal.endingColor||"#c8982a",margin:"0 auto 20px",opacity:0.4}}/>
            <div style={{fontFamily:"'Cinzel',serif",color:"#f0e4c0",fontSize:"20px",fontWeight:700,marginBottom:"8px",letterSpacing:"2px"}}>
              {legacyModal.item}
            </div>
            <div style={{color:"#8a7050",fontSize:"14px",fontStyle:"italic",marginBottom:"16px",lineHeight:1.6}}>
              {legacyModal.desc}
            </div>
            <div style={{background:"#14100a",border:`1px solid ${legacyModal.endingColor||"#c8982a"}33`,padding:"14px",marginBottom:"24px"}}>
              <div style={{color:"#c0a878",fontSize:"14px",fontStyle:"italic",lineHeight:1.7}}>
                "{legacyModal.flavour}"
              </div>
            </div>
            <button onClick={()=>setLegacyModal(null)}
              style={{background:`${legacyModal.endingColor||"#c8982a"}18`,border:`2px solid ${legacyModal.endingColor||"#c8982a"}`,
                color:legacyModal.endingColor||"#c8982a",fontFamily:"'Cinzel',serif",fontSize:"13px",letterSpacing:"4px",
                padding:"12px 36px",cursor:"pointer",transition:"all .3s",animation:"enterPulse 2.5s infinite"}}
              onMouseEnter={e=>{e.target.style.background=legacyModal.endingColor||"#c8982a";e.target.style.color="#0d0a08";}}
              onMouseLeave={e=>{e.target.style.background=`${legacyModal.endingColor||"#c8982a"}18`;e.target.style.color=legacyModal.endingColor||"#c8982a";}}>
              ✦ BEGIN YOUR NEXT LEGEND ✦
            </button>
          </div>
        </div>
      )}

            {/* ── Blizzard Warning Overlay ─────────────────────────────────── */}
      {blizzard && (
        <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:500}}>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,#a8c8e844 0%,transparent 40%)",animation:"pulse 2s infinite"}}/>
          <div style={{position:"absolute",top:"80px",left:"50%",transform:"translateX(-50%)",
            background:"#0a1a2a",border:"2px solid #a8c8e8",padding:"12px 28px",
            fontFamily:"'Cinzel',serif",color:"#a8c8e8",fontSize:"13px",letterSpacing:"4px",
            textAlign:"center",whiteSpace:"nowrap",boxShadow:"0 0 30px #a8c8e844"}}>
            ❄ BLIZZARD WARNING ❄
            <div style={{fontSize:"11px",letterSpacing:"2px",marginTop:"4px",color:"#6898b8"}}>
              The storm is closing in on Ashfen
            </div>
          </div>
        </div>
      )}

      {/* ── Death Recap Screen ──────────────────────────────────────── */}
      {deathRecap && (
        <div style={{position:"fixed",inset:0,background:"#000000f8",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px",overflowY:"auto"}}>
          {/* Falling red mote particles */}
          <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
            {Array.from({length:22}).map((_,i)=>(
              <div key={i} style={{
                position:"absolute",
                left:`${(i*17+7)%97}%`,
                top:"-10px",
                width: i%3===0?"4px":"2px",
                height: i%3===0?"4px":"2px",
                borderRadius:"50%",
                background: i%4===0?"#8b0000":i%4===1?"#c01818":"#6b0000",
                opacity: 0.3 + (i%5)*0.12,
                animation:`fall ${4+i%6}s ${(i*0.4)%4}s linear infinite`,
              }}/>
            ))}
          </div>
          <style>{`@keyframes fall{0%{transform:translateY(-10px) rotate(0deg);opacity:0.4}100%{transform:translateY(110vh) rotate(360deg);opacity:0}}`}</style>

          <div style={{maxWidth:560,width:"100%",textAlign:"center",fontFamily:"'Crimson Text',Georgia,serif",position:"relative",zIndex:1}}>

            {/* Portrait — faded and dramatic */}
            <div style={{display:"flex",justifyContent:"center",marginBottom:"20px"}}>
              <div style={{opacity:0.35,filter:"grayscale(80%) sepia(30%)",borderRadius:"3px",overflow:"hidden",border:"2px solid #3a1010"}}>
                <Portrait name={deathRecap.charClass} size={100} height={125} border="none"/>
              </div>
            </div>

            <div style={{color:"#ef4444",fontFamily:"'Cinzel',serif",fontSize:"clamp(26px,5vw,40px)",fontWeight:900,letterSpacing:"6px",marginBottom:"6px",textShadow:"0 0 30px rgba(239,68,68,0.4)"}}>
              YOU HAVE FALLEN
            </div>
            <div style={{fontFamily:"'Cinzel',serif",color:"#5a1a1a",fontSize:"12px",letterSpacing:"5px",marginBottom:"8px"}}>
              {deathRecap.name} the {deathRecap.charClass} · Level {deathRecap.level}
            </div>
            <div style={{width:"60px",height:"1px",background:"#5a1a1a",margin:"0 auto 20px"}}/>
            <div style={{color:"#8b5050",fontSize:"16px",fontStyle:"italic",marginBottom:"24px",lineHeight:1.7,maxWidth:400,margin:"0 auto 24px"}}>
              {deathRecap.cause}
            </div>

            {/* Stats grid — includes play time */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px",marginBottom:"20px"}}>
              {[
                ["Turns", deathRecap.turns],
                ["Gold", deathRecap.gold+"gp"],
                ["Slain", deathRecap.enemies],
                ["Time", deathRecap.playTime ? deathRecap.playTime+"m" : "—"],
              ].map(([l,v])=>(
                <div key={l} style={{background:"#120808",border:"1px solid #2a1010",padding:"10px 6px"}}>
                  <div style={{color:"#5a2020",fontSize:"9px",fontFamily:"'Cinzel',serif",letterSpacing:"2px",marginBottom:"3px"}}>{l}</div>
                  <div style={{color:"#c08080",fontSize:"18px",fontFamily:"'Cinzel',serif",fontWeight:700}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Last chapter toggle */}
            {!showLastChapter ? (
              <button onClick={()=>setShowLastChapter(true)}
                style={{background:"#0d0808",border:"1px solid #2a1010",color:"#8b5050",fontFamily:"'Cinzel',serif",
                  fontSize:"11px",letterSpacing:"3px",padding:"8px 20px",cursor:"pointer",marginBottom:"16px",
                  display:"block",margin:"0 auto 16px",transition:"all .2s"}}
                onMouseEnter={e=>{e.target.style.borderColor="#c8982a";e.target.style.color="#c8982a";}}
                onMouseLeave={e=>{e.target.style.borderColor="#2a1010";e.target.style.color="#8b5050";}}>
                📖 READ YOUR FINAL MOMENTS
              </button>
            ) : (
              <div style={{background:"#0d0808",border:"1px solid #2a1010",padding:"16px",marginBottom:"16px",textAlign:"left",animation:"fadeSlideIn .4s ease-out"}}>
                <div style={{color:"#5a2020",fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"3px",marginBottom:"12px"}}>FINAL CHAPTER</div>
                {log.filter(e=>e.type==="dm").slice(-5).map((e,i)=>(
                  <div key={i} style={{color:"#8a6858",fontSize:"13px",lineHeight:1.7,marginBottom:"10px",fontStyle:"italic",borderLeft:"2px solid #3a1010",paddingLeft:"10px"}}>
                    {e.text?.substring(0,200)}{e.text?.length>200?"…":""}
                  </div>
                ))}
                <button onClick={()=>setShowLastChapter(false)} style={{color:"#3a2010",fontSize:"11px",fontFamily:"'Cinzel',serif",letterSpacing:"2px",background:"none",border:"none",cursor:"pointer",marginTop:"4px"}}>▲ CLOSE</button>
              </div>
            )}

            {/* Decisions */}
            {deathRecap.decisions.length > 0 && (
              <div style={{background:"#0d0808",border:"1px solid #2a1010",padding:"14px",marginBottom:"16px",textAlign:"left"}}>
                <div style={{color:"#5a2020",fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"3px",marginBottom:"8px"}}>CHOICES MADE</div>
                {deathRecap.decisions.map((d,i)=>(
                  <div key={i} style={{color:"#8a6060",fontSize:"13px",marginBottom:"3px"}}>◆ {d}</div>
                ))}
              </div>
            )}

            {/* Companions */}
            {deathRecap.party?.filter(m=>!m.dead).length > 0 && (
              <div style={{background:"#0a0d08",border:"1px solid #1a2a10",padding:"14px",marginBottom:"16px",textAlign:"left"}}>
                <div style={{color:"#3a5020",fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"3px",marginBottom:"8px"}}>COMPANIONS</div>
                {deathRecap.party.map(m=>(
                  <div key={m.id} style={{color:"#6a8050",fontSize:"13px",marginBottom:"3px",fontStyle:"italic"}}>
                    {HIRELINGS[m.id]?.emoji} {m.name} — {m.dead?"also fell in the darkness.":"survived and fled back to Ashfen."}
                  </div>
                ))}
              </div>
            )}

            <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={()=>{ setDeathRecap(null); setShowLastChapter(false); newGame(); }}
                style={{background:"transparent",border:"2px solid #c8982a",color:"#c8982a",fontFamily:"'Cinzel',serif",fontSize:"13px",letterSpacing:"4px",padding:"12px 32px",cursor:"pointer",transition:"all .2s"}}
                onMouseEnter={e=>{e.target.style.background="#c8982a";e.target.style.color="#0d0a08";}}
                onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#c8982a";}}>
                ✦ NEW ADVENTURE
              </button>
              <button onClick={()=>{ setDeathRecap(null); setShowLastChapter(false); }}
                style={{background:"transparent",border:"1px solid #3a2810",color:"#7a5828",fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"3px",padding:"12px 24px",cursor:"pointer"}}>
                CONTINUE STORY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Victory / Campaign End Screen ───────────────────────────── */}
      {victoryData && (()=>{
        const ENDINGS = {
          sealed:    { title:"MALGRATH SEALED",    sub:"The ancient evil is bound once more. Ashfen breathes again.", color:"#4ade80",  dark:false },
          destroyed: { title:"MALGRATH DESTROYED", sub:"The warlord is no more — but the cost was steep.",           color:"#c8982a",  dark:false },
          freed:     { title:"MALGRATH WALKS FREE",sub:"The darkness spreads. Ashfen will not survive the winter.",  color:"#ef4444",  dark:true  },
          possessed: { title:"THE SIGNET CLAIMS YOU",sub:"Malgrath does not die. He inherits.",                      color:"#8a3a8a",  dark:true  },
        };
        const e = ENDINGS[victoryData.ending] || ENDINGS.sealed;
        const particleCol = e.dark ? ["#8b0000","#6b0000","#4a0000"] : ["#c8982a","#e8c060","#f0d880"];
        const legacyItems = {
          sealed:    { item:"Miner's Compass (Legacy)",  flavour:"It points to what you seek most. It brought you back from the deep once. It will again.",   desc:"A battered brass compass. The needle still spins near black ore." },
          destroyed: { item:"Ashen Blade (Legacy)",      flavour:"The blade that slew a warlord. It remembers the dark below Ashfen.",                          desc:"It glows faintly in the presence of the undead. +1d4 radiant." },
          freed:     { item:"Bone Shard of Ashfen",      flavour:"A piece of the town that was. A reminder of what you failed to stop.",                        desc:"Cold to the touch. It hums with a sound like distant screaming." },
          possessed: { item:"Malgrath's Signet (Legacy)",flavour:"He is still in there. Quiet now. But listening.",                                              desc:"The ring burns your finger. But you can't bring yourself to remove it." },
        };
        const legacy = legacyItems[victoryData.ending] || legacyItems.sealed;

        const shareText = `I just completed The Top Tavern!

${e.title}
${e.sub}

${victoryData.name} the ${victoryData.charClass} — Level ${victoryData.level}
Turns: ${victoryData.turns} · Enemies slain: ${victoryData.enemies}

Key choices:
${victoryData.decisions.slice(0,3).map(d=>"• "+d).join("\n")}`;

        return (
        <div style={{position:"fixed",inset:0,background:"#000000f8",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px",overflowY:"auto"}}>
          {/* Particles */}
          <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
            {Array.from({length:28}).map((_,i)=>(
              <div key={i} style={{
                position:"absolute",
                left:`${(i*13+5)%96}%`,
                top:"-8px",
                width: i%4===0?"5px":i%3===0?"3px":"2px",
                height: i%4===0?"5px":i%3===0?"3px":"2px",
                borderRadius:"50%",
                background: particleCol[i%particleCol.length],
                opacity: 0.25 + (i%5)*0.13,
                animation:`fall ${4+i%7}s ${(i*0.35)%5}s linear infinite`,
              }}/>
            ))}
          </div>

          <div style={{maxWidth:600,width:"100%",textAlign:"center",fontFamily:"'Crimson Text',Georgia,serif",position:"relative",zIndex:1,padding:"20px 0"}}>

            {/* Portrait — faded, dramatic */}
            <div style={{display:"flex",justifyContent:"center",marginBottom:"20px"}}>
              <div style={{opacity:0.4,filter:`sepia(40%) hue-rotate(${e.dark?"-10deg":"20deg"})`,borderRadius:"3px",overflow:"hidden",border:`2px solid ${e.color}44`}}>
                <Portrait name={victoryData.charClass} size={100} height={125} border="none"/>
              </div>
            </div>

            <div style={{color:e.color,fontFamily:"'Cinzel',serif",fontSize:"clamp(20px,4vw,32px)",fontWeight:900,letterSpacing:"5px",marginBottom:"6px",textShadow:`0 0 30px ${e.color}55`}}>
              {e.title}
            </div>
            <div style={{fontFamily:"'Cinzel',serif",color:"#5a4028",fontSize:"11px",letterSpacing:"5px",marginBottom:"8px"}}>
              {victoryData.name} the {victoryData.charClass} · Level {victoryData.level}
            </div>
            <div style={{width:"60px",height:"1px",background:e.color+"55",margin:"0 auto 16px"}}/>
            <div style={{color:"#c9aa7a",fontSize:"16px",fontStyle:"italic",marginBottom:"24px",lineHeight:1.7,maxWidth:440,margin:"0 auto 24px"}}>
              {e.sub}
            </div>

            {/* Final chapter — full last DM narrative */}
            {victoryData.narrative && (
              <div style={{background:"#120e08",border:`1px solid ${e.color}33`,padding:"18px",marginBottom:"20px",textAlign:"left",borderLeft:`3px solid ${e.color}88`}}>
                <div style={{color:"#5a3510",fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"3px",marginBottom:"10px"}}>FINAL CHAPTER</div>
                <div style={{fontSize:"15px",color:"#c0a878",lineHeight:1.85,fontStyle:"italic"}}>
                  {victoryData.narrative}
                </div>
              </div>
            )}

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px",marginBottom:"20px"}}>
              {[["Turns",victoryData.turns],["Gold",victoryData.gold+"gp"],["Slain",victoryData.enemies],["Time",victoryData.playTime ? victoryData.playTime+"m":"—"]].map(([l,v])=>(
                <div key={l} style={{background:"#14100a",border:`1px solid ${e.color}22`,padding:"10px 6px"}}>
                  <div style={{color:"#5a3510",fontSize:"9px",fontFamily:"'Cinzel',serif",letterSpacing:"2px",marginBottom:"3px"}}>{l}</div>
                  <div style={{color:e.color,fontSize:"18px",fontFamily:"'Cinzel',serif",fontWeight:700}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Decisions */}
            {victoryData.decisions.length > 0 && (
              <div style={{background:"#0d0a08",border:"1px solid #2a1c0c",padding:"14px",marginBottom:"16px",textAlign:"left"}}>
                <div style={{color:"#c8982a",fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"3px",marginBottom:"8px"}}>DEFINING CHOICES</div>
                {victoryData.decisions.map((d,i)=>(
                  <div key={i} style={{color:"#a09060",fontSize:"13px",marginBottom:"3px"}}>◆ {d}</div>
                ))}
              </div>
            )}

            {/* Companions */}
            {victoryData.party?.length > 0 && (
              <div style={{background:"#0a0d08",border:"1px solid #1a2a10",padding:"14px",marginBottom:"16px",textAlign:"left"}}>
                <div style={{color:"#4a7a30",fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"3px",marginBottom:"8px"}}>COMPANIONS' FATE</div>
                {victoryData.party.map(m=>{
                  const ep = { marta:{alive:"Marta Ironhand returned to her forge. She never spoke of the deep.",dead:"Marta fell in the darkness, as she always knew she would."},selik:{alive:"Selik the Pale left Ashfen that night, richer and wiser. He never looked back.",dead:"Selik, who had always feared dying in a hole, was right."},prael:{alive:"Prael vanished before dawn, taking something from the Vault. Their agenda, fulfilled.",dead:"Prael's secret died with them. Some things are never known."} }[m.id];
                  return ep ? <div key={m.id} style={{color:"#6a9050",fontSize:"13px",marginBottom:"4px",fontStyle:"italic"}}>{HIRELINGS[m.id]?.emoji} {ep[m.dead?"dead":"alive"]}</div> : null;
                })}
              </div>
            )}

            {/* Action buttons */}
            <div style={{display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap",marginBottom:"12px"}}>
              <button onClick={()=>{ setVictoryData(null); setLegacyModal({...legacy, endingColor:e.color}); newGame(); }}
                style={{background:`${e.color}14`,border:`2px solid ${e.color}`,color:e.color,fontFamily:"'Cinzel',serif",fontSize:"13px",letterSpacing:"4px",padding:"12px 28px",cursor:"pointer",transition:"all .2s"}}
                onMouseEnter={el=>{el.target.style.background=e.color;el.target.style.color="#0d0a08";}}
                onMouseLeave={el=>{el.target.style.background=`${e.color}14`;el.target.style.color=e.color;}}>
                ✦ NEW GAME+
              </button>
              <button onClick={()=>{ setVictoryData(null); newGame(); }}
                style={{background:"transparent",border:"1px solid #3a2810",color:"#c9aa7a",fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"3px",padding:"12px 20px",cursor:"pointer"}}>
                NEW GAME
              </button>
              <button onClick={()=>setVictoryData(null)}
                style={{background:"transparent",border:"1px solid #2a1c0c",color:"#7a5828",fontFamily:"'Cinzel',serif",fontSize:"12px",letterSpacing:"3px",padding:"12px 20px",cursor:"pointer"}}>
                LINGER
              </button>
            </div>

            {/* Share button */}
            <button onClick={()=>{
                navigator.clipboard?.writeText(shareText).then(()=>showToast("Adventure summary copied to clipboard!")).catch(()=>showToast("Copy failed — try selecting the text manually"));
              }}
              style={{background:"transparent",border:"1px solid #2a3018",color:"#4a6030",fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"2px",padding:"7px 18px",cursor:"pointer",transition:"all .2s"}}
              onMouseEnter={e=>{e.target.style.borderColor="#4ade80";e.target.style.color="#4ade80";}}
              onMouseLeave={e=>{e.target.style.borderColor="#2a3018";e.target.style.color="#4a6030";}}>
              📋 COPY ADVENTURE SUMMARY
            </button>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
