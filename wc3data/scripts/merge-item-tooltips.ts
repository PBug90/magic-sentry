import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ITEM_DATA } from '../src/items.js'
import { emitRecords } from './_emit.js'

// One-off merge of Liquipedia-sourced item tooltips into the consolidated
// ITEM_DATA records. Keeps each item's authoritative name + gold (from our SLK
// data) and layers on description/category/level/cooldown/duration/range/aoe/
// charges/stats. Mirrors the rich shape used for abilities. Re-runnable.
const __dirname = dirname(fileURLToPath(import.meta.url))

interface Enriched {
  // name/gold override the SLK record. Used only where we deliberately follow
  // Liquipedia over our SLK data (e.g. the legacy Claws of Attack +3 -> +4).
  name?: string
  gold?: number
  category?: string
  level?: number
  description?: string
  cooldown?: number
  duration?: number
  range?: number
  aoe?: number[]
  charges?: number
  stats?: { label: string; values: string[] }[]
}

// Scraped from individual Liquipedia item pages (CC-BY-SA 3.0). name/gold are
// intentionally omitted here — they come from ITEM_DATA, which is authoritative.
const ENRICHED: Record<string, Enriched> = {
  // --- Permanent ---
  clsd: {
    category: 'Permanent',
    level: 1,
    description:
      'Provides the Hero with invisibility when worn. An invisible Hero is untargetable by the enemy unless detected. If the Hero moves, attacks, uses an ability, or casts a spell, the invisibility effect is lost. Fade time of 1.5 seconds.',
  },
  rst1: {
    category: 'Permanent',
    level: 1,
    description: 'Increases the Strength of the Hero by 3 when worn.',
    stats: [{ label: 'Strength', values: ['+3'] }],
  },
  rin1: {
    category: 'Permanent',
    level: 1,
    description: 'Increases the Intelligence of the Hero by 3 when worn.',
    stats: [{ label: 'Intelligence', values: ['+3'] }],
  },
  rnsp: {
    category: 'Permanent',
    level: 1,
    description:
      'Provides a +1 bonus to Strength, Agility and Intelligence when equipped by a Hero.',
    stats: [
      { label: 'Strength', values: ['+1'] },
      { label: 'Agility', values: ['+1'] },
      { label: 'Intelligence', values: ['+1'] },
    ],
  },
  rag1: {
    category: 'Permanent',
    level: 1,
    description: 'Increases the Agility of the Hero by 3 when worn.',
    stats: [{ label: 'Agility', values: ['+3'] }],
  },
  gcel: {
    category: 'Permanent',
    level: 2,
    description: 'Increases the attack speed of the Hero by 18% when worn.',
    stats: [{ label: 'Attack Speed', values: ['+18%'] }],
  },
  rde2: {
    category: 'Permanent',
    level: 2,
    description: 'Increases the armor of the Hero by 3 when worn.',
    stats: [{ label: 'Armor', values: ['+3'] }],
  },
  cnob: {
    category: 'Purchasable',
    level: 3,
    description:
      'Provides a +2 bonus to Strength, Agility and Intelligence. Increases the Strength, Agility and Intelligence of the Hero by 2 when worn.',
    stats: [
      { label: 'Strength', values: ['+2'] },
      { label: 'Agility', values: ['+2'] },
      { label: 'Intelligence', values: ['+2'] },
    ],
  },
  penr: {
    category: 'Permanent',
    level: 3,
    description: 'Increases the mana capacity of the Hero by 100 when worn.',
    stats: [{ label: 'Mana', values: ['+100'] }],
  },
  prvt: {
    category: 'Permanent',
    level: 3,
    description: 'Increases the hit points of the Hero by 150 when worn.',
    stats: [{ label: 'Hit Points', values: ['+150'] }],
  },
  rde4: {
    category: 'Permanent',
    level: 3,
    description: 'Increases the armor of the Hero by 5 when worn.',
    stats: [{ label: 'Armor', values: ['+5'] }],
  },
  rlif: {
    category: 'Permanent',
    level: 3,
    description: "Increases the Hero's hit point regeneration by 2 hit points per second.",
    stats: [{ label: 'Hit Point Regeneration', values: ['+2/sec'] }],
  },
  evtl: {
    category: 'Permanent',
    level: 3,
    description:
      'Causes attacks against the wearer to miss 15% of the time. Does not stack with Evasion or Drunken Brawler.',
    stats: [{ label: 'Evasion', values: ['15%'] }],
  },
  afac: {
    category: 'Permanent',
    level: 4,
    description:
      "Nearby units' missile attacks do more damage. Increases nearby ranged units' damage by 7.5%. Does not stack with Trueshot Aura.",
    aoe: [900],
    stats: [{ label: 'Ranged Damage Bonus', values: ['7.5%'] }],
  },
  bgst: {
    category: 'Permanent',
    level: 4,
    description: 'Increases the Strength of the Hero by 6 when worn.',
    stats: [{ label: 'Strength', values: ['+6'] }],
  },
  belv: {
    category: 'Permanent',
    level: 4,
    description: 'Increases the Agility of the Hero by 6 when worn.',
    stats: [{ label: 'Agility', values: ['+6'] }],
  },
  ciri: {
    category: 'Permanent',
    level: 4,
    description: 'Increases the Intelligence of the Hero by 6 when worn.',
    stats: [{ label: 'Intelligence', values: ['+6'] }],
  },
  brac: {
    category: 'Permanent',
    level: 4,
    description: 'Reduces spell damage taken. Does not stack with itself.',
    stats: [{ label: 'Spell Damage Reduction', values: ['33%'] }],
  },
  sbch: {
    category: 'Permanent',
    level: 4,
    description:
      'Grants a melee Hero and friendly nearby melee units life stealing attacks which take 15% of the damage they deal and convert it into life. Does not stack with Vampiric Aura.',
    aoe: [900],
    stats: [{ label: 'Lifesteal', values: ['15%'] }],
  },
  rwiz: {
    category: 'Permanent',
    level: 4,
    description: "Increases the Hero's rate of mana regeneration by 50% when worn.",
    stats: [{ label: 'Mana Regeneration', values: ['50%'] }],
  },
  lhst: {
    category: 'Permanent',
    level: 4,
    description:
      'Grants a Devotion Aura that increases the armor of nearby friendly units. Does not stack with Devotion Aura.',
    aoe: [900],
    stats: [{ label: 'Armor Bonus', values: ['1.5'] }],
  },
  ajen: {
    category: 'Permanent',
    level: 5,
    description:
      'Grants Heroes and allied nearby units increased attack rate and movement speed. Does not stack with Endurance Aura.',
    aoe: [900],
    stats: [
      { label: 'Movement Speed', values: ['7.5%'] },
      { label: 'Attack Rate', values: ['3.5%'] },
    ],
  },
  clfm: {
    category: 'Permanent',
    level: 5,
    description:
      'Engulfs the Hero in fire which deals 10 damage per second to nearby enemy land units. Does not stack with Immolation.',
    aoe: [160],
    stats: [{ label: 'Damage per Second', values: ['10'] }],
  },
  hval: {
    category: 'Permanent',
    level: 5,
    description: 'Increases the Strength and Agility of the Hero by 5 when worn.',
    stats: [
      { label: 'Strength', values: ['+5'] },
      { label: 'Agility', values: ['+5'] },
    ],
  },
  hcun: {
    category: 'Permanent',
    level: 5,
    description: 'Increases the Agility and Intelligence of the Hero by 5 when worn.',
    stats: [
      { label: 'Agility', values: ['+5'] },
      { label: 'Intelligence', values: ['+5'] },
    ],
  },
  kpin: {
    category: 'Permanent',
    level: 5,
    description:
      'Grants the Hero and friendly nearby units a 0.5 bonus to mana regeneration. Does not stack with Brilliance Aura.',
    aoe: [900],
    stats: [{ label: 'Mana Regeneration Bonus', values: ['0.5'] }],
  },
  lgdh: {
    category: 'Permanent',
    level: 5,
    description:
      'Grants the Hero and friendly nearby units increased life regeneration and movement speed. Does not stack with Unholy Aura.',
    aoe: [900],
    stats: [
      { label: 'Movement Speed Bonus', values: ['7.5%'] },
      { label: 'Health Regeneration', values: ['0.35/sec'] },
    ],
  },
  mcou: {
    category: 'Permanent',
    level: 5,
    description: 'Increases the Strength and Intelligence of the Hero by 5 when worn.',
    stats: [
      { label: 'Strength', values: ['+5'] },
      { label: 'Intelligence', values: ['+5'] },
    ],
  },
  ward: {
    category: 'Permanent',
    level: 5,
    description:
      'Increases the attack damage of nearby friendly units by 7.5% when worn. Does not stack with the Kodo Beast’s War Drums Aura.',
    aoe: [900],
    stats: [{ label: 'Damage Bonus', values: ['7.5%'] }],
  },
  spsh: {
    category: 'Permanent',
    level: 6,
    description: 'Blocks a negative spell that an enemy casts on the Hero once every 40 seconds.',
    cooldown: 40,
  },
  rhth: {
    category: 'Permanent',
    level: 6,
    description: 'Increases the hit points of the Hero by 300 when worn.',
    stats: [{ label: 'Hit Points', values: ['+300'] }],
  },
  odef: {
    category: 'Permanent',
    level: 6,
    description:
      "Adds 6 bonus damage to the attack of a Hero when carried. The Hero's attack also becomes ranged when attacking air and will create a Dark Minion when it is the killing blow on an enemy unit. The Dark Minion lasts 80 seconds.",
    duration: 80,
    range: 600,
    stats: [{ label: 'Bonus Damage', values: ['+6'] }],
  },
  pmna: {
    category: 'Permanent',
    level: 6,
    description: 'Increases the mana capacity of the Hero by 250 when worn.',
    stats: [{ label: 'Mana', values: ['+250'] }],
  },
  ssil: {
    category: 'Permanent',
    level: 6,
    description: 'Stops all enemies in a target area from casting spells.',
    cooldown: 20,
    duration: 12,
    range: 700,
    aoe: [225],
  },
  // Ring of the Archmagi: Liquipedia documents a single attribute-bonus version;
  // the four tiers share that text. (Flagged: in-game these scale mana/regen.)
  ram1: {
    category: 'Permanent',
    level: 4,
    description: 'Provides a +3 bonus to Strength, Agility and Intelligence when worn.',
    stats: [
      { label: 'Strength', values: ['+3'] },
      { label: 'Agility', values: ['+3'] },
      { label: 'Intelligence', values: ['+3'] },
    ],
  },
  ram2: {
    category: 'Permanent',
    level: 4,
    description: 'Provides a +3 bonus to Strength, Agility and Intelligence when worn.',
    stats: [
      { label: 'Strength', values: ['+3'] },
      { label: 'Agility', values: ['+3'] },
      { label: 'Intelligence', values: ['+3'] },
    ],
  },
  ram3: {
    category: 'Permanent',
    level: 4,
    description: 'Provides a +3 bonus to Strength, Agility and Intelligence when worn.',
    stats: [
      { label: 'Strength', values: ['+3'] },
      { label: 'Agility', values: ['+3'] },
      { label: 'Intelligence', values: ['+3'] },
    ],
  },
  ram4: {
    category: 'Permanent',
    level: 4,
    description: 'Provides a +3 bonus to Strength, Agility and Intelligence when worn.',
    stats: [
      { label: 'Strength', values: ['+3'] },
      { label: 'Agility', values: ['+3'] },
      { label: 'Intelligence', values: ['+3'] },
    ],
  },

  // --- Charged ---
  crys: {
    category: 'Charged',
    level: 2,
    description:
      "Reveals a targeted area. Invisible units are also revealed by the Crystal Ball's effect. Lasts 10 seconds.",
    duration: 10,
    aoe: [900],
    charges: 3,
  },
  rej3: {
    category: 'Charged',
    level: 2,
    description:
      'Non-combat consumable. Regenerates 200 hit points and 75 mana of the Hero over 30 seconds.',
    duration: 30,
    charges: 1,
    stats: [
      { label: 'Hit Points Restored', values: ['200'] },
      { label: 'Mana Restored', values: ['75'] },
    ],
  },
  wswd: {
    category: 'Charged',
    level: 2,
    description: 'Drops a magic immune Sentry Ward to spy upon an area for 180 seconds.',
    duration: 180,
    range: 500,
    charges: 2,
    stats: [
      { label: 'Sight Range', values: ['1200'] },
      { label: 'Hit Points', values: ['50'] },
    ],
  },
  will: {
    category: 'Charged',
    level: 2,
    description:
      'Creates an illusory double of the targeted unit. The double deals no damage, takes double damage from enemy attacks, and disappears after 60 seconds or when killed.',
    duration: 60,
    charges: 2,
    stats: [{ label: 'Damage Taken Multiplier', values: ['2'] }],
  },
  pghe: {
    category: 'Charged',
    level: 3,
    description: 'Heals 500 hit points when used.',
    cooldown: 40,
    charges: 1,
    stats: [{ label: 'Hit Points Healed', values: ['500'] }],
  },
  pgma: {
    category: 'Charged',
    level: 3,
    description: 'Restores 200 mana when used.',
    cooldown: 40,
    charges: 1,
    stats: [{ label: 'Mana Restored', values: ['200'] }],
  },
  pnvu: {
    category: 'Charged',
    level: 3,
    description:
      'Renders the Hero temporarily invulnerable to damage. While invulnerable the Hero cannot be targeted by most spells or effects.',
    cooldown: 45,
    duration: 15,
    charges: 1,
  },
  sror: {
    category: 'Charged',
    level: 3,
    description: 'Gives friendly nearby units a 25% bonus to damage for 45 seconds.',
    duration: 45,
    aoe: [500],
    charges: 1,
    stats: [{ label: 'Damage Bonus', values: ['25%'] }],
  },
  woms: {
    category: 'Charged',
    level: 3,
    description:
      'Steals 60 mana from a target unit or structure (e.g. a Moon Well) and gives it to the Hero.',
    cooldown: 10,
    charges: 2,
    stats: [{ label: 'Mana Stolen', values: ['60'] }],
  },
  ankh: {
    category: 'Charged',
    level: 4,
    description:
      'Automatically brings the Hero back to life with 500 hit points when the Hero wearing the Ankh dies.',
    charges: 1,
    stats: [
      { label: 'Resurrection Hit Points', values: ['500'] },
      { label: 'Reincarnation Delay', values: ['5s'] },
    ],
  },
  fgsk: {
    category: 'Charged',
    level: 4,
    description:
      'Summons 3 Skeleton Warriors and 3 Skeleton Archers to fight for you. Lasts 120 seconds.',
    cooldown: 20,
    duration: 120,
    charges: 1,
    stats: [
      { label: 'Skeleton Warriors', values: ['3'] },
      { label: 'Skeleton Archers', values: ['3'] },
    ],
  },
  whwd: {
    category: 'Charged',
    level: 4,
    description:
      "Summons an immovable ward that heals 2% of a nearby friendly non-mechanical unit's hit points per second. Wards are spell immune.",
    duration: 25,
    aoe: [450],
    charges: 2,
    stats: [
      { label: 'Healing per Second', values: ['2%'] },
      { label: 'Ward Hit Points', values: ['5'] },
    ],
  },
  hlst: {
    category: 'Charged',
    level: 4,
    description:
      'Increases the life regeneration rate of the Hero by 1 hit point per second when worn. Can be consumed for 500 health.',
    cooldown: 40,
    charges: 1,
    stats: [
      { label: 'Life Regeneration', values: ['1/sec'] },
      { label: 'Consume Heal', values: ['500'] },
    ],
  },
  mnst: {
    category: 'Charged',
    level: 4,
    description:
      'Increases the mana regeneration rate of the Hero by 25% when worn. Can be consumed for 200 mana.',
    cooldown: 40,
    charges: 1,
    stats: [
      { label: 'Mana Regeneration', values: ['25%'] },
      { label: 'Consume Mana', values: ['200'] },
    ],
  },
  wcyc: {
    category: 'Charged',
    level: 4,
    description:
      'Casts Cyclone on a target enemy unit, tossing it into the air so it cannot attack, move or cast spells. Lasts 20 seconds.',
    cooldown: 5,
    duration: 20,
    range: 600,
    charges: 2,
    stats: [{ label: 'Cyclone Duration', values: ['20s', '5.6s on heroes'] }],
  },
  fgbd: {
    category: 'Charged',
    level: 5,
    description: 'Summons a Blue Drake to fight for you. Lasts 180 seconds.',
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  iotw: {
    category: 'Charged',
    level: 5,
    description: 'Summons a Furbolg Tracker to fight for you. Lasts 180 seconds.',
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  pdiv: {
    category: 'Charged',
    level: 5,
    description: 'Turns the Hero invulnerable for 25 seconds.',
    cooldown: 60,
    duration: 25,
    charges: 1,
  },
  pdi2: {
    category: 'Charged',
    level: 5,
    description: 'Turns the Hero invulnerable for 25 seconds.',
    cooldown: 60,
    duration: 25,
    charges: 1,
  },
  pres: {
    category: 'Charged',
    level: 5,
    description: 'Restores lost hit points and mana when used.',
    cooldown: 40,
    charges: 1,
    stats: [
      { label: 'Hit Points Restored', values: ['500'] },
      { label: 'Mana Restored', values: ['200'] },
    ],
  },
  sres: {
    category: 'Charged',
    level: 5,
    description:
      'Restores 150 hit points and 150 mana of friendly non-mechanical units in an area around your Hero.',
    cooldown: 40,
    charges: 1,
    stats: [
      { label: 'Hit Points Restored', values: ['150'] },
      { label: 'Mana Restored', values: ['150'] },
    ],
  },
  fgfh: {
    category: 'Charged',
    level: 5,
    description: 'Summons a Fel Stalker to fight for you. Lasts 180 seconds.',
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  fgrg: {
    category: 'Charged',
    level: 5,
    description: 'Summons a Rock Golem to fight for you. Lasts 180 seconds.',
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  wild: {
    category: 'Charged',
    level: 6,
    description: 'Summons a Furbolg Warrior to fight for you. Lasts 180 seconds.',
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  fgdg: {
    category: 'Charged',
    level: 6,
    description: 'Summons a Doom Guard to fight for you. Lasts 180 seconds.',
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  engr: {
    category: 'Charged',
    level: 6,
    description: 'Summons a Blue Dragonspawn Overseer to fight for you. Lasts 180 seconds.',
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  shar: {
    category: 'Charged',
    level: 6,
    description: 'Summons an Ice Revenant to fight for you. Lasts 180 seconds.',
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  scav: {
    category: 'Charged',
    level: 6,
    description:
      "Kills a target unit instantly, transforming it into gold (75% of the unit's cost). Cannot be used on Heroes, or creeps above level 5.",
    cooldown: 40,
    range: 600,
    charges: 1,
    stats: [
      { label: 'Gold Return', values: ['75%'] },
      { label: 'Max Target Level', values: ['5'] },
    ],
  },
  ccmd: {
    category: 'Charged',
    level: 6,
    description:
      'Permanently transfers control of the targeted non-Hero unit to the user. Cannot be used on Heroes or creeps above level 5.',
    range: 600,
    charges: 1,
    stats: [{ label: 'Max Target Level', values: ['5'] }],
  },

  // --- Artifact ---
  ratf: {
    category: 'Artifact',
    level: 7,
    description: 'Increases the attack damage of the Hero by 15 when worn.',
    stats: [{ label: 'Damage Bonus', values: ['+15'] }],
  },
  infs: {
    category: 'Artifact',
    level: 7,
    description:
      'Calls an Infernal down from the sky, dealing 50 damage and stunning enemy land units in an area. The Infernal lasts 360 seconds.',
    cooldown: 180,
    duration: 360,
    range: 900,
    aoe: [250],
    charges: 1,
    stats: [
      { label: 'Impact Damage', values: ['50'] },
      { label: 'Stun Duration (Hero)', values: ['4 (2)s'] },
    ],
  },
  desc: {
    category: 'Artifact',
    level: 7,
    description: 'Teleports the Hero a short distance.',
    cooldown: 30,
    stats: [
      { label: 'Max Distance', values: ['1000'] },
      { label: 'Min Distance', values: ['200'] },
    ],
  },
  ofro: {
    category: 'Artifact',
    level: 7,
    description:
      "Adds 6 bonus cold damage to the attack of a Hero when carried. The Hero's attacks also become ranged when attacking air and slow the movement and attack rate of the enemy for 3 seconds.",
    duration: 3,
    stats: [{ label: 'Cold Damage Bonus', values: ['+6'] }],
  },
  ckng: {
    category: 'Artifact',
    level: 8,
    description: 'Increases the Strength, Intelligence, and Agility of the Hero by 5 when worn.',
    stats: [
      { label: 'Strength', values: ['+5'] },
      { label: 'Agility', values: ['+5'] },
      { label: 'Intelligence', values: ['+5'] },
    ],
  },
  modt: {
    category: 'Artifact',
    level: 8,
    description:
      'While wearing this mask, a Hero recovers hit points equal to 50% of the attack damage dealt to an enemy unit.',
    stats: [{ label: 'Lifesteal', values: ['50%'] }],
  },
  tkno: {
    category: 'Artifact',
    level: 8,
    description: 'Increases the level of the Hero by 1 when used.',
    charges: 1,
    stats: [{ label: 'Level Bonus', values: ['+1'] }],
  },

  // --- Power Up ---
  rhe3: {
    category: 'Power Up',
    level: 0,
    description: 'Heals 400 hit points to all nearby friendly non-mechanical units.',
    charges: 1,
    stats: [{ label: 'Hit Points Restored', values: ['400'] }],
  },
  rma2: {
    category: 'Power Up',
    level: 0,
    description: 'Restores 300 mana to all nearby friendly units.',
    charges: 1,
    stats: [{ label: 'Mana Restored', values: ['300'] }],
  },
  rhe2: {
    category: 'Power Up',
    level: 0,
    description: 'Heals 250 hit points to all nearby friendly non-mechanical units.',
    charges: 1,
    stats: [{ label: 'Hit Points Restored', values: ['250'] }],
  },
  rhe1: {
    category: 'Power Up',
    level: 0,
    description: 'Heals 125 hit points to all nearby friendly non-mechanical units.',
    charges: 1,
    stats: [{ label: 'Hit Points Restored', values: ['125'] }],
  },
  rman: {
    category: 'Power Up',
    level: 0,
    description: 'Restores 125 mana to all nearby friendly units.',
    charges: 1,
    stats: [{ label: 'Mana Restored', values: ['125'] }],
  },
  rreb: {
    category: 'Power Up',
    level: 0,
    description: 'Places the monster that held this rune under your control.',
    charges: 1,
  },
  rspd: {
    category: 'Power Up',
    level: 0,
    description:
      'Increases the movement speed of all nearby allied units to the maximum (400 for most units). Lasts 10 seconds.',
    duration: 10,
    charges: 1,
    stats: [{ label: 'Movement Speed', values: ['400'] }],
  },
  rwat: {
    category: 'Power Up',
    level: 0,
    description: 'Creates an invulnerable Sentry Ward at this location.',
    charges: 1,
  },
  manh: {
    category: 'Power Up',
    level: 1,
    description: 'Permanently increases the hit points of the Hero by 50 when picked up.',
    stats: [{ label: 'Hit Points', values: ['+50'] }],
  },
  tdex: {
    category: 'Power Up',
    level: 1,
    description: 'Permanently increases the Agility of the Hero by 1 when picked up.',
    stats: [{ label: 'Agility', values: ['+1'] }],
  },
  tint: {
    category: 'Power Up',
    level: 1,
    description: 'Permanently increases the Intelligence of the Hero by 1 when picked up.',
    stats: [{ label: 'Intelligence', values: ['+1'] }],
  },
  tstr: {
    category: 'Power Up',
    level: 1,
    description: 'Permanently increases the Strength of the Hero by 1 when picked up.',
    stats: [{ label: 'Strength', values: ['+1'] }],
  },
  tdx2: {
    category: 'Power Up',
    level: 2,
    description: 'Permanently increases the Agility of the Hero by 2 when picked up.',
    stats: [{ label: 'Agility', values: ['+2'] }],
  },
  tin2: {
    category: 'Power Up',
    level: 2,
    description: 'Permanently increases the Intelligence of the Hero by 2 when picked up.',
    stats: [{ label: 'Intelligence', values: ['+2'] }],
  },
  tpow: {
    category: 'Power Up',
    level: 2,
    description:
      'Permanently increases the Strength, Agility and Intelligence of the Hero by 1 when used.',
    stats: [
      { label: 'Strength', values: ['+1'] },
      { label: 'Agility', values: ['+1'] },
      { label: 'Intelligence', values: ['+1'] },
    ],
  },
  tst2: {
    category: 'Power Up',
    level: 2,
    description: 'Permanently increases the Strength of the Hero by 2 when picked up.',
    stats: [{ label: 'Strength', values: ['+2'] }],
  },

  // --- Purchasable ---
  bspd: {
    category: 'Purchasable',
    level: 3,
    description: 'Increases the movement speed of the Hero by 60 when worn.',
    stats: [{ label: 'Movement Speed Bonus', values: ['60'] }],
  },
  dust: {
    category: 'Purchasable',
    level: 2,
    description: 'Reveals enemy invisible units in an area around the Hero.',
    cooldown: 20,
    duration: 20,
    charges: 2,
  },
  pinv: {
    category: 'Purchasable',
    level: 3,
    description:
      'Temporarily grants the Hero invisibility for 120 seconds. The effect ends if the Hero attacks, uses abilities, or casts spells.',
    duration: 120,
    charges: 1,
  },
  pnvl: {
    category: 'Purchasable',
    level: 3,
    description:
      'Makes the Hero invulnerable to damage for 7 seconds. An invulnerable Hero may not be the target of spells or effects.',
    cooldown: 45,
    duration: 7,
    charges: 1,
  },
  shea: {
    category: 'Purchasable',
    level: 2,
    description: 'Heals 150 hit points to all friendly non-mechanical units around the Hero.',
    cooldown: 25,
    aoe: [600],
    charges: 1,
    stats: [{ label: 'Healing', values: ['150'] }],
  },
  spro: {
    category: 'Purchasable',
    level: 2,
    description:
      'Increases the armor of all friendly units in an area around your Hero by 2 for 30 seconds.',
    duration: 30,
    aoe: [600],
    charges: 1,
    stats: [{ label: 'Armor Bonus', values: ['2'] }],
  },
  stwp: {
    category: 'Purchasable',
    level: 2,
    description:
      'Teleports the Hero and nearby troops to a target friendly town hall. The Hero is invulnerable and uncontrollable during the 5 second channel. Harvesting workers are excluded.',
    charges: 1,
    stats: [{ label: 'Channel Time', values: ['5s'] }],
  },
  stel: {
    category: 'Purchasable',
    level: 2,
    description: 'Teleports the Hero to a target allied land unit or structure.',
    cooldown: 90,
    charges: 2,
    stats: [{ label: 'Channel Time', values: ['3s'] }],
  },
  tret: {
    category: 'Purchasable',
    level: 1,
    description: "Unlearns all of the Hero's spells, allowing the Hero to learn different skills.",
    charges: 1,
  },
  pams: {
    category: 'Purchasable',
    level: 0,
    description: 'Gives the Hero immunity to magical spells for 15 seconds.',
    cooldown: 30,
    duration: 15,
    charges: 1,
  },
  hslv: {
    category: 'Purchasable',
    level: 1,
    description:
      "Regenerates a target unit's hit points by 400 over 40 seconds. The effect is dispelled if the target takes at least 20 damage.",
    duration: 40,
    range: 500,
    charges: 3,
    stats: [{ label: 'Hit Points Regenerated', values: ['400'] }],
  },
  tsct: {
    category: 'Purchasable',
    level: 1,
    description:
      'Creates a Scout Tower at a target location. Requires a Keep. Costs 25 lumber in addition to gold.',
    charges: 1,
    stats: [{ label: 'Lumber Cost', values: ['25'] }],
  },
  plcl: {
    category: 'Purchasable',
    level: 0,
    description:
      "Regenerates the Hero's mana by 100 over 30 seconds. The effect cancels if the Hero takes more than 20 damage.",
    duration: 30,
    charges: 1,
    stats: [{ label: 'Mana Regenerated', values: ['100'] }],
  },
  mcri: {
    category: 'Purchasable',
    level: 1,
    description:
      'Creates a player-controlled critter for scouting. Appears as a normal critter to the enemy and does not draw aggro.',
    charges: 1,
    stats: [{ label: 'Sight Range', values: ['500'] }],
  },
  moon: {
    category: 'Purchasable',
    level: 1,
    description: 'Causes an artificial night that blocks out the sun. Lasts 30 seconds.',
    cooldown: 70,
    duration: 30,
    charges: 1,
  },
  ocor: {
    category: 'Purchasable',
    level: 3,
    description:
      "Adds 5 bonus damage to the attack of a Hero when carried. The Hero's attacks also become ranged when attacking air and reduce the armor of enemy units by 4 for 5 seconds.",
    duration: 5,
    stats: [
      { label: 'Bonus Damage', values: ['5'] },
      { label: 'Armor Reduction', values: ['4'] },
    ],
  },
  oli2: {
    category: 'Purchasable',
    level: 3,
    description:
      "Adds 5 bonus damage to the attack of a Hero when carried. The Hero's attacks also become ranged when attacking air, and have a 30% chance to dispel magic and slow the enemy. Deals 200 bonus damage to summoned units.",
    stats: [
      { label: 'Bonus Damage', values: ['5'] },
      { label: 'Bonus vs Summoned', values: ['200'] },
      { label: 'Purge Chance', values: ['30%'] },
    ],
  },
  olig: {
    category: 'Purchasable',
    level: 3,
    description:
      "Adds 5 bonus damage to the attack of a Hero when carried. The Hero's attacks also become ranged when attacking air, and have a 30% chance to dispel magic and slow the enemy. Deals 200 bonus damage to summoned units.",
    stats: [
      { label: 'Bonus Damage', values: ['5'] },
      { label: 'Bonus vs Summoned', values: ['200'] },
      { label: 'Purge Chance', values: ['30%'] },
    ],
  },
  oslo: {
    category: 'Purchasable',
    level: 3,
    description:
      "Adds 5 bonus damage to the attack of a Hero when carried. The Hero's attack also becomes ranged when attacking air and has a 25% (10% vs heroes) chance to slow an enemy's movement by 55% and attack rate by 25% for 10 (5) seconds.",
    stats: [
      { label: 'Bonus Damage', values: ['5'] },
      { label: 'Proc Chance', values: ['25% (10% vs heroes)'] },
      { label: 'Movement Slow', values: ['55%'] },
      { label: 'Attack Slow', values: ['25%'] },
    ],
  },
  oven: {
    category: 'Purchasable',
    level: 3,
    description:
      "Adds 5 bonus damage to the attack of a Hero when carried. The Hero's attacks also become ranged when attacking air and poison enemy units for 6 seconds.",
    duration: 6,
    stats: [
      { label: 'Bonus Damage', values: ['5'] },
      { label: 'Poison Damage', values: ['8/sec'] },
    ],
  },
  phea: {
    category: 'Purchasable',
    level: 2,
    description: 'Heals 250 hit points when used.',
    cooldown: 20,
    charges: 1,
    stats: [{ label: 'Hit Points Restored', values: ['250'] }],
  },
  pman: {
    category: 'Purchasable',
    level: 2,
    description: 'Restores 125 mana when used.',
    cooldown: 20,
    charges: 1,
    stats: [{ label: 'Mana Restored', values: ['125'] }],
  },
  ritd: {
    category: 'Purchasable',
    level: 1,
    description:
      'Sacrifices a friendly Undead unit to regenerate 200 hit points over 45 seconds to all nearby non-mechanical units.',
    cooldown: 5,
    duration: 45,
    charges: 1,
    stats: [{ label: 'Hit Points Regenerated', values: ['200'] }],
  },
  rnec: {
    category: 'Purchasable',
    level: 1,
    description: 'Raises 2 Skeleton Warriors from a target corpse.',
    cooldown: 24,
    duration: 65,
    range: 600,
    charges: 4,
    stats: [{ label: 'Skeletons Summoned', values: ['2'] }],
  },
  skul: {
    category: 'Purchasable',
    level: 1,
    description: 'Creates an area of Blight at a target location.',
    charges: 1,
  },
  sreg: {
    category: 'Purchasable',
    level: 0,
    description:
      'Regenerates the hit points of all friendly non-mechanical units in an area around your Hero by 225 over 45 seconds.',
    duration: 45,
    aoe: [600],
    charges: 1,
    stats: [{ label: 'Hit Points Regenerated', values: ['225'] }],
  },
  shas: {
    category: 'Purchasable',
    level: 1,
    description:
      'Increases the movement speed of the Hero and nearby allied units to maximum. Lasts 10 seconds.',
    cooldown: 60,
    duration: 10,
    charges: 1,
  },
  spre: {
    category: 'Purchasable',
    description:
      'Teleports a target friendly unit to its highest level town hall. Cannot target crowd-controlled or summoned units.',
    cooldown: 30,
  },
  ssan: {
    category: 'Purchasable',
    level: 0,
    description:
      'Teleports a target unit to your highest tier town hall, stunning it and regenerating 15 hit points per second until fully healed. Cannot target crowd-controlled or summoned units.',
    cooldown: 45,
    stats: [{ label: 'Heal per Second', values: ['15'] }],
  },
  tgrh: {
    category: 'Purchasable',
    level: 3,
    description:
      'Creates a Great Hall at a target location. Human, Night Elf, and Undead players receive their racial equivalent town hall.',
    charges: 1,
    stats: [{ label: 'Lumber Cost', values: ['185'] }],
  },
  wneg: {
    category: 'Purchasable',
    level: 2,
    description:
      'Dispels all magical effects on a single target. Deals 200 damage to summoned units.',
    cooldown: 5,
    charges: 3,
    stats: [{ label: 'Damage to Summoned', values: ['200'] }],
  },

  // --- Miscellaneous ---
  // Our SLK lists this id as the legacy "Claws of Attack +3" (50g); Liquipedia
  // documents no +3, so we follow Liquipedia's lowest claws variant (+4).
  rat3: {
    name: 'Claws of Attack +4',
    gold: 125,
    category: 'Permanent',
    level: 2,
    description: 'Increases the attack damage of the Hero by 4 when worn.',
    stats: [{ label: 'Damage Bonus', values: ['+4'] }],
  },
  rat6: {
    category: 'Miscellaneous',
    level: 2,
    description: 'Increases the attack damage of the Hero by 6 when worn.',
    stats: [{ label: 'Damage Bonus', values: ['+6'] }],
  },
  rat9: {
    category: 'Miscellaneous',
    level: 3,
    description: 'Increases the attack damage of the Hero by 9 when worn.',
    stats: [{ label: 'Damage Bonus', values: ['+9'] }],
  },
  ratc: {
    category: 'Permanent',
    level: 5,
    description: 'Increases the attack damage of the Hero by 12 when worn.',
    stats: [{ label: 'Damage Bonus', values: ['+12'] }],
  },
  gobm: {
    category: 'Miscellaneous',
    level: 0,
    description:
      'Places a hidden land mine at a target point. Enemy units that move near it trigger the mine, dealing area damage.',
    charges: 3,
  },
  tels: {
    category: 'Miscellaneous',
    level: 0,
    description: 'Increases the sight range of the Hero at night.',
    charges: 1,
  },
  rej1: {
    category: 'Miscellaneous',
    level: 1,
    description:
      'Non-combat consumable. Regenerates 100 hit points and 25 mana of the Hero over 30 seconds.',
    duration: 30,
    charges: 1,
    stats: [
      { label: 'Hit Points Restored', values: ['100'] },
      { label: 'Mana Restored', values: ['25'] },
    ],
  },
  nspi: {
    category: 'Miscellaneous',
    level: 0,
    description: 'Renders the Hero invulnerable to magic.',
  },
  ofir: {
    category: 'Miscellaneous',
    level: 3,
    description:
      "Adds 5 bonus fire damage to the attack of a Hero when carried. The Hero's attacks also become ranged when attacking air, and reduce the effectiveness of healing and regeneration on enemy units by 35% for 3 seconds.",
    duration: 3,
    stats: [
      { label: 'Bonus Fire Damage', values: ['+5'] },
      { label: 'Healing Reduction', values: ['35%'] },
    ],
  },
  ofr2: {
    category: 'Miscellaneous',
    level: 3,
    description:
      "Adds 5 bonus fire damage to the attack of a Hero when carried. The Hero's attacks also become ranged when attacking air, and reduce the effectiveness of healing and regeneration on enemy units by 35% for 3 seconds.",
    duration: 3,
    stats: [
      { label: 'Bonus Fire Damage', values: ['+5'] },
      { label: 'Healing Reduction', values: ['35%'] },
    ],
  },
  fgrd: {
    category: 'Miscellaneous',
    level: 5,
    description: 'Summons a Red Drake to fight for you. Lasts 180 seconds.',
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  rde1: {
    category: 'Miscellaneous',
    level: 2,
    description: 'Increases the armor of the Hero by 2 when worn.',
    stats: [{ label: 'Armor', values: ['+2'] }],
  },
  rde3: {
    category: 'Miscellaneous',
    level: 2,
    description: 'Increases the armor of the Hero by 4 when worn.',
    stats: [{ label: 'Armor', values: ['+4'] }],
  },
  sand: {
    category: 'Miscellaneous',
    level: 6,
    description: 'Raises 6 nearby dead units to fight for 40 seconds.',
    cooldown: 40,
    duration: 40,
    range: 400,
    aoe: [900],
    charges: 1,
    stats: [{ label: 'Corpses Raised', values: ['6'] }],
  },
  srrc: {
    category: 'Miscellaneous',
    level: 6,
    description: 'Brings 6 of your nearby dead units back to life.',
    aoe: [900],
    charges: 1,
    stats: [{ label: 'Units Resurrected', values: ['6'] }],
  },
  totw: {
    category: 'Miscellaneous',
    level: 5,
    description: 'Summons a Furbolg to fight for you. Lasts 180 seconds.',
    cooldown: 20,
    duration: 180,
    charges: 3,
  },
  thdm: {
    category: 'Miscellaneous',
    level: 0,
    description:
      'Casts Chain Lightning, hurling a bolt of lightning that jumps between enemy targets, dealing less damage with each jump.',
    cooldown: 9,
    range: 700,
    aoe: [500],
    stats: [
      { label: 'Initial Damage', values: ['100'] },
      { label: 'Jumps', values: ['4'] },
      { label: 'Jump Reduction', values: ['25%'] },
    ],
  },
  texp: {
    category: 'Miscellaneous',
    level: 2,
    description: 'Grants 100 experience points to the Hero when picked up.',
    stats: [{ label: 'Experience', values: ['100'] }],
  },
  tgxp: {
    category: 'Miscellaneous',
    level: 0,
    description: 'Grants 500 experience points to the Hero when used.',
    stats: [{ label: 'Experience', values: ['500'] }],
  },
  wlsd: {
    category: 'Miscellaneous',
    level: 2,
    description:
      'Casts Lightning Shield on a target unit, surrounding it with electricity that deals 20 damage per second to nearby units. Lasts 10 seconds.',
    cooldown: 10,
    duration: 10,
    range: 600,
    aoe: [160],
    charges: 2,
    stats: [{ label: 'Damage per Second', values: ['20'] }],
  },
}

let merged = 0
const missing: string[] = []
for (const [id, e] of Object.entries(ENRICHED)) {
  const rec = (ITEM_DATA as Record<string, any>)[id]
  if (!rec) {
    missing.push(id)
    continue
  }
  const out: Record<string, unknown> = { name: e.name ?? rec.name, gold: e.gold ?? rec.gold }
  if (e.description) out.description = e.description
  if (e.category) out.category = e.category
  if (e.level !== undefined) out.level = e.level
  if (e.cooldown !== undefined) out.cooldown = e.cooldown
  if (e.duration !== undefined) out.duration = e.duration
  if (e.range !== undefined) out.range = e.range
  if (e.aoe) out.aoe = e.aoe
  if (e.charges !== undefined) out.charges = e.charges
  if (e.stats?.length) out.stats = e.stats
  ;(ITEM_DATA as Record<string, any>)[id] = out
  merged++
}

// Drop the legacy `effect` field from any remaining (non-enriched) records.
for (const rec of Object.values(ITEM_DATA as Record<string, any>)) {
  if (rec.effect !== undefined) delete rec.effect
}

emitRecords(
  join(__dirname, '../src/items.ts'),
  `import type { ItemEntry } from './balance.js'\n\n`,
  'ITEM_DATA',
  'ItemEntry',
  ITEM_DATA as Record<string, unknown>,
)
console.log(`item tooltips: ${merged} enriched`)
if (missing.length) console.warn(`unmatched ids: ${missing.join(', ')}`)
