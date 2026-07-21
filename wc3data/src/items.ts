import type { ItemEntry } from './balance.js'

export const ITEM_DATA: Record<string, ItemEntry> = {
  ckng: {
    name: 'Crown of Kings +5',
    gold: 1000,
    description: 'Increases the Strength, Intelligence, and Agility of the Hero by 5 when worn.',
    category: 'Artifact',
    level: 8,
    stats: [
      {
        label: 'Strength',
        values: ['+5'],
      },
      {
        label: 'Agility',
        values: ['+5'],
      },
      {
        label: 'Intelligence',
        values: ['+5'],
      },
    ],
  },
  modt: {
    name: 'Mask of Death',
    gold: 1000,
    description:
      'While wearing this mask, a Hero recovers hit points equal to 50% of the attack damage dealt to an enemy unit.',
    category: 'Artifact',
    level: 8,
    stats: [
      {
        label: 'Lifesteal',
        values: ['50%'],
      },
    ],
  },
  tkno: {
    name: 'Tome of Power',
    gold: 1250,
    description: 'Increases the level of the Hero by 1 when used.',
    category: 'Artifact',
    level: 8,
    charges: 1,
    stats: [
      {
        label: 'Level Bonus',
        values: ['+1'],
      },
    ],
  },
  ratf: {
    name: 'Claws of Attack +15',
    gold: 800,
    description: 'Increases the attack damage of the Hero by 15 when worn.',
    category: 'Artifact',
    level: 7,
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+15'],
      },
    ],
  },
  ofro: {
    name: 'Orb of Frost',
    gold: 800,
    description:
      "Adds 6 bonus cold damage to the attack of a Hero when carried. The Hero's attacks also become ranged when attacking air and slow the movement and attack rate of the enemy for 3 seconds.",
    category: 'Artifact',
    level: 7,
    duration: 3,
    stats: [
      {
        label: 'Cold Damage Bonus',
        values: ['+6'],
      },
    ],
  },
  infs: {
    name: 'Inferno Stone',
    gold: 800,
    description:
      'Calls an Infernal down from the sky, dealing 50 damage and stunning enemy land units in an area. The Infernal lasts 360 seconds.',
    category: 'Artifact',
    level: 7,
    cooldown: 180,
    duration: 360,
    range: 900,
    aoe: [250],
    charges: 1,
    stats: [
      {
        label: 'Impact Damage',
        values: ['50'],
      },
      {
        label: 'Stun Duration (Hero)',
        values: ['4 (2)s'],
      },
    ],
  },
  desc: {
    name: "Kelen's Dagger of Escape",
    gold: 800,
    description: 'Teleports the Hero a short distance.',
    category: 'Artifact',
    level: 7,
    cooldown: 30,
    stats: [
      {
        label: 'Max Distance',
        values: ['1000'],
      },
      {
        label: 'Min Distance',
        values: ['200'],
      },
    ],
  },
  fgdg: {
    name: 'Demonic Figurine',
    gold: 700,
    description: 'Summons a Doom Guard to fight for you. Lasts 180 seconds.',
    category: 'Charged',
    level: 6,
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  engr: {
    name: 'Engraved Scale',
    gold: 700,
    description: 'Summons a Blue Dragonspawn Overseer to fight for you. Lasts 180 seconds.',
    category: 'Charged',
    level: 6,
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  shar: {
    name: 'Ice Shard',
    gold: 700,
    description: 'Summons an Ice Revenant to fight for you. Lasts 180 seconds.',
    category: 'Charged',
    level: 6,
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  ccmd: {
    name: 'Scepter of Mastery',
    gold: 700,
    description:
      'Permanently transfers control of the targeted non-Hero unit to the user. Cannot be used on Heroes or creeps above level 5.',
    category: 'Charged',
    level: 6,
    range: 600,
    charges: 1,
    stats: [
      {
        label: 'Max Target Level',
        values: ['5'],
      },
    ],
  },
  wild: {
    name: 'Amulet of the Wild',
    gold: 700,
    description: 'Summons a Furbolg Warrior to fight for you. Lasts 180 seconds.',
    category: 'Charged',
    level: 6,
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  scav: {
    name: 'Scepter of Avarice',
    gold: 700,
    description:
      "Kills a target unit instantly, transforming it into gold (75% of the unit's cost). Cannot be used on Heroes, or creeps above level 5.",
    category: 'Charged',
    level: 6,
    cooldown: 40,
    range: 600,
    charges: 1,
    stats: [
      {
        label: 'Gold Return',
        values: ['75%'],
      },
      {
        label: 'Max Target Level',
        values: ['5'],
      },
    ],
  },
  odef: {
    name: 'Orb of Darkness',
    gold: 600,
    description:
      "Adds 6 bonus damage to the attack of a Hero when carried. The Hero's attack also becomes ranged when attacking air and will create a Dark Minion when it is the killing blow on an enemy unit. The Dark Minion lasts 80 seconds.",
    category: 'Permanent',
    level: 6,
    duration: 80,
    range: 600,
    stats: [
      {
        label: 'Bonus Damage',
        values: ['+6'],
      },
    ],
  },
  rde4: {
    name: 'Ring of Protection +5',
    gold: 300,
    description: 'Increases the armor of the Hero by 5 when worn.',
    category: 'Permanent',
    level: 3,
    stats: [
      {
        label: 'Armor',
        values: ['+5'],
      },
    ],
  },
  pmna: {
    name: 'Pendant of Mana',
    gold: 600,
    description: 'Increases the mana capacity of the Hero by 250 when worn.',
    category: 'Permanent',
    level: 6,
    stats: [
      {
        label: 'Mana',
        values: ['+250'],
      },
    ],
  },
  rhth: {
    name: "Khadgar's Gem of Health",
    gold: 600,
    description: 'Increases the hit points of the Hero by 300 when worn.',
    category: 'Permanent',
    level: 6,
    stats: [
      {
        label: 'Hit Points',
        values: ['+300'],
      },
    ],
  },
  ssil: {
    name: 'Staff of Silence',
    gold: 600,
    description: 'Stops all enemies in a target area from casting spells.',
    category: 'Permanent',
    level: 6,
    cooldown: 20,
    duration: 12,
    range: 700,
    aoe: [225],
  },
  spsh: {
    name: 'Amulet of Spell Shield',
    gold: 600,
    description: 'Blocks a negative spell that an enemy casts on the Hero once every 40 seconds.',
    category: 'Permanent',
    level: 6,
    cooldown: 40,
  },
  sres: {
    name: 'Scroll of Restoration',
    gold: 550,
    description:
      'Restores 150 hit points and 150 mana of friendly non-mechanical units in an area around your Hero.',
    category: 'Charged',
    level: 5,
    cooldown: 40,
    charges: 1,
    stats: [
      {
        label: 'Hit Points Restored',
        values: ['150'],
      },
      {
        label: 'Mana Restored',
        values: ['150'],
      },
    ],
  },
  pdi2: {
    name: 'Potion of Divinity (Invulnerability)',
    gold: 550,
    description: 'Turns the Hero invulnerable for 25 seconds.',
    category: 'Charged',
    level: 5,
    cooldown: 60,
    duration: 25,
    charges: 1,
  },
  pres: {
    name: 'Potion of Restoration',
    gold: 550,
    description: 'Restores lost hit points and mana when used.',
    category: 'Charged',
    level: 5,
    cooldown: 40,
    charges: 1,
    stats: [
      {
        label: 'Hit Points Restored',
        values: ['500'],
      },
      {
        label: 'Mana Restored',
        values: ['200'],
      },
    ],
  },
  iotw: {
    name: 'Idol of the wild',
    gold: 550,
    description: 'Summons a Furbolg Tracker to fight for you. Lasts 180 seconds.',
    category: 'Charged',
    level: 5,
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  fgfh: {
    name: 'Spiked Collar',
    gold: 550,
    description: 'Summons a Fel Stalker to fight for you. Lasts 180 seconds.',
    category: 'Charged',
    level: 5,
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  fgbd: {
    name: 'Blue Drake Egg',
    gold: 550,
    description: 'Summons a Blue Drake to fight for you. Lasts 180 seconds.',
    category: 'Charged',
    level: 5,
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  fgrg: {
    name: 'Stone Token',
    gold: 550,
    description: 'Summons a Rock Golem to fight for you. Lasts 180 seconds.',
    category: 'Charged',
    level: 5,
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  hcun: {
    name: 'Hood of Cunning',
    gold: 500,
    description: 'Increases the Agility and Intelligence of the Hero by 5 when worn.',
    category: 'Permanent',
    level: 5,
    stats: [
      {
        label: 'Agility',
        values: ['+5'],
      },
      {
        label: 'Intelligence',
        values: ['+5'],
      },
    ],
  },
  hval: {
    name: 'Helm of Valor',
    gold: 500,
    description: 'Increases the Strength and Agility of the Hero by 5 when worn.',
    category: 'Permanent',
    level: 5,
    stats: [
      {
        label: 'Strength',
        values: ['+5'],
      },
      {
        label: 'Agility',
        values: ['+5'],
      },
    ],
  },
  mcou: {
    name: 'Medallion of Courage',
    gold: 500,
    description: 'Increases the Strength and Intelligence of the Hero by 5 when worn.',
    category: 'Permanent',
    level: 5,
    stats: [
      {
        label: 'Strength',
        values: ['+5'],
      },
      {
        label: 'Intelligence',
        values: ['+5'],
      },
    ],
  },
  ajen: {
    name: 'Ancient Janggo of Endurance',
    gold: 500,
    description:
      'Grants Heroes and allied nearby units increased attack rate and movement speed. Does not stack with Endurance Aura.',
    category: 'Permanent',
    level: 5,
    aoe: [900],
    stats: [
      {
        label: 'Movement Speed',
        values: ['7.5%'],
      },
      {
        label: 'Attack Rate',
        values: ['3.5%'],
      },
    ],
  },
  clfm: {
    name: 'Cloak of Flames',
    gold: 500,
    description:
      'Engulfs the Hero in fire which deals 10 damage per second to nearby enemy land units. Does not stack with Immolation.',
    category: 'Permanent',
    level: 5,
    aoe: [160],
    stats: [
      {
        label: 'Damage per Second',
        values: ['10'],
      },
    ],
  },
  ratc: {
    name: 'Claws of Attack +12',
    gold: 500,
    description: 'Increases the attack damage of the Hero by 12 when worn.',
    category: 'Permanent',
    level: 5,
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+12'],
      },
    ],
  },
  war2: {
    name: 'Warsong Battle Drums (Kodo)',
    gold: 500,
  },
  kpin: {
    name: "Khadgar's Pipe of Insight",
    gold: 500,
    description:
      'Grants the Hero and friendly nearby units a 0.5 bonus to mana regeneration. Does not stack with Brilliance Aura.',
    category: 'Permanent',
    level: 5,
    aoe: [900],
    stats: [
      {
        label: 'Mana Regeneration Bonus',
        values: ['0.5'],
      },
    ],
  },
  lgdh: {
    name: 'Legion Doom-Horn',
    gold: 500,
    description:
      'Grants the Hero and friendly nearby units increased life regeneration and movement speed. Does not stack with Unholy Aura.',
    category: 'Permanent',
    level: 5,
    aoe: [900],
    stats: [
      {
        label: 'Movement Speed Bonus',
        values: ['7.5%'],
      },
      {
        label: 'Health Regeneration',
        values: ['0.35/sec'],
      },
    ],
  },
  ankh: {
    name: 'Ankh of Reincarnation',
    gold: 450,
    description:
      'Automatically brings the Hero back to life with 500 hit points when the Hero wearing the Ankh dies.',
    category: 'Charged',
    level: 4,
    charges: 1,
    stats: [
      {
        label: 'Resurrection Hit Points',
        values: ['500'],
      },
      {
        label: 'Reincarnation Delay',
        values: ['5s'],
      },
    ],
  },
  whwd: {
    name: 'Healing Wards',
    gold: 450,
    description:
      "Summons an immovable ward that heals 2% of a nearby friendly non-mechanical unit's hit points per second. Wards are spell immune.",
    category: 'Charged',
    level: 4,
    duration: 25,
    aoe: [450],
    charges: 2,
    stats: [
      {
        label: 'Healing per Second',
        values: ['2%'],
      },
      {
        label: 'Ward Hit Points',
        values: ['5'],
      },
    ],
  },
  fgsk: {
    name: 'Book of the Dead',
    gold: 450,
    description:
      'Summons 3 Skeleton Warriors and 3 Skeleton Archers to fight for you. Lasts 120 seconds.',
    category: 'Charged',
    level: 4,
    cooldown: 20,
    duration: 120,
    charges: 1,
    stats: [
      {
        label: 'Skeleton Warriors',
        values: ['3'],
      },
      {
        label: 'Skeleton Archers',
        values: ['3'],
      },
    ],
  },
  wcyc: {
    name: 'Wand of the Wind',
    gold: 450,
    description:
      'Casts Cyclone on a target enemy unit, tossing it into the air so it cannot attack, move or cast spells. Lasts 20 seconds.',
    category: 'Charged',
    level: 4,
    cooldown: 5,
    duration: 20,
    range: 600,
    charges: 2,
    stats: [
      {
        label: 'Cyclone Duration',
        values: ['20s', '5.6s on heroes'],
      },
    ],
  },
  hlst: {
    name: 'Health Stone',
    gold: 450,
    description:
      'Increases the life regeneration rate of the Hero by 1 hit point per second when worn. Can be consumed for 500 health.',
    category: 'Charged',
    level: 4,
    cooldown: 40,
    charges: 1,
    stats: [
      {
        label: 'Life Regeneration',
        values: ['1/sec'],
      },
      {
        label: 'Consume Heal',
        values: ['500'],
      },
    ],
  },
  mnst: {
    name: 'Mana Stone',
    gold: 450,
    description:
      'Increases the mana regeneration rate of the Hero by 25% when worn. Can be consumed for 200 mana.',
    category: 'Charged',
    level: 4,
    cooldown: 40,
    charges: 1,
    stats: [
      {
        label: 'Mana Regeneration',
        values: ['25%'],
      },
      {
        label: 'Consume Mana',
        values: ['200'],
      },
    ],
  },
  belv: {
    name: "Boots of Quel'Thalas +6",
    gold: 400,
    description: 'Increases the Agility of the Hero by 6 when worn.',
    category: 'Permanent',
    level: 4,
    stats: [
      {
        label: 'Agility',
        values: ['+6'],
      },
    ],
  },
  bgst: {
    name: 'Belt of Giant Strength +6',
    gold: 400,
    description: 'Increases the Strength of the Hero by 6 when worn.',
    category: 'Permanent',
    level: 4,
    stats: [
      {
        label: 'Strength',
        values: ['+6'],
      },
    ],
  },
  ciri: {
    name: 'Robe of the Magi +6',
    gold: 400,
    description: 'Increases the Intelligence of the Hero by 6 when worn.',
    category: 'Permanent',
    level: 4,
    stats: [
      {
        label: 'Intelligence',
        values: ['+6'],
      },
    ],
  },
  lhst: {
    name: 'The Lion Horn of Stormwind',
    gold: 400,
    description:
      'Grants a Devotion Aura that increases the armor of nearby friendly units. Does not stack with Devotion Aura.',
    category: 'Permanent',
    level: 4,
    aoe: [900],
    stats: [
      {
        label: 'Armor Bonus',
        values: ['1.5'],
      },
    ],
  },
  afac: {
    name: "Alleria's Flute of Accuracy",
    gold: 400,
    description:
      "Nearby units' missile attacks do more damage. Increases nearby ranged units' damage by 7.5%. Does not stack with Trueshot Aura.",
    category: 'Permanent',
    level: 4,
    aoe: [900],
    stats: [
      {
        label: 'Ranged Damage Bonus',
        values: ['7.5%'],
      },
    ],
  },
  sbch: {
    name: 'Scourge Bone Chimes',
    gold: 400,
    description:
      'Grants a melee Hero and friendly nearby melee units life stealing attacks which take 15% of the damage they deal and convert it into life. Does not stack with Vampiric Aura.',
    category: 'Permanent',
    level: 4,
    aoe: [900],
    stats: [
      {
        label: 'Lifesteal',
        values: ['15%'],
      },
    ],
  },
  brac: {
    name: 'Runed Bracers',
    gold: 400,
    description: 'Reduces spell damage taken. Does not stack with itself.',
    category: 'Permanent',
    level: 4,
    stats: [
      {
        label: 'Spell Damage Reduction',
        values: ['33%'],
      },
    ],
  },
  rwiz: {
    name: 'Sobi Mask',
    gold: 400,
    description: "Increases the Hero's rate of mana regeneration by 50% when worn.",
    category: 'Permanent',
    level: 4,
    stats: [
      {
        label: 'Mana Regeneration',
        values: ['50%'],
      },
    ],
  },
  pghe: {
    name: 'Potion of Greater Healing',
    gold: 400,
    description: 'Heals 500 hit points when used.',
    category: 'Charged',
    level: 3,
    cooldown: 40,
    charges: 1,
    stats: [
      {
        label: 'Hit Points Healed',
        values: ['500'],
      },
    ],
  },
  pgma: {
    name: 'Potion of Greater Mana',
    gold: 400,
    description: 'Restores 200 mana when used.',
    category: 'Charged',
    level: 3,
    cooldown: 40,
    charges: 1,
    stats: [
      {
        label: 'Mana Restored',
        values: ['200'],
      },
    ],
  },
  pnvu: {
    name: 'Potion of Invulnerability',
    gold: 400,
    description:
      'Renders the Hero temporarily invulnerable to damage. While invulnerable the Hero cannot be targeted by most spells or effects.',
    category: 'Charged',
    level: 3,
    cooldown: 45,
    duration: 15,
    charges: 1,
  },
  sror: {
    name: 'Scroll of the Beast',
    gold: 400,
    description: 'Gives friendly nearby units a 25% bonus to damage for 45 seconds.',
    category: 'Charged',
    level: 3,
    duration: 45,
    aoe: [500],
    charges: 1,
    stats: [
      {
        label: 'Damage Bonus',
        values: ['25%'],
      },
    ],
  },
  woms: {
    name: 'Wand of Mana Stealing',
    gold: 400,
    description:
      'Steals 60 mana from a target unit or structure (e.g. a Moon Well) and gives it to the Hero.',
    category: 'Charged',
    level: 3,
    cooldown: 10,
    charges: 2,
    stats: [
      {
        label: 'Mana Stolen',
        values: ['60'],
      },
    ],
  },
  crys: {
    name: 'Crystal Ball',
    gold: 150,
    description:
      "Reveals a targeted area. Invisible units are also revealed by the Crystal Ball's effect. Lasts 10 seconds.",
    category: 'Charged',
    level: 2,
    duration: 10,
    aoe: [900],
    charges: 3,
  },
  evtl: {
    name: 'Talisman of Evasion',
    gold: 300,
    description:
      'Causes attacks against the wearer to miss 15% of the time. Does not stack with Evasion or Drunken Brawler.',
    category: 'Permanent',
    level: 3,
    stats: [
      {
        label: 'Evasion',
        values: ['15%'],
      },
    ],
  },
  penr: {
    name: 'Pendant of Energy',
    gold: 300,
    description: 'Increases the mana capacity of the Hero by 100 when worn.',
    category: 'Permanent',
    level: 3,
    stats: [
      {
        label: 'Mana',
        values: ['+100'],
      },
    ],
  },
  prvt: {
    name: 'Periapt of Vitality',
    gold: 300,
    description: 'Increases the hit points of the Hero by 150 when worn.',
    category: 'Permanent',
    level: 3,
    stats: [
      {
        label: 'Hit Points',
        values: ['+150'],
      },
    ],
  },
  rat9: {
    name: 'Claws of Attack +9',
    gold: 300,
    description: 'Increases the attack damage of the Hero by 9 when worn.',
    category: 'Miscellaneous',
    level: 3,
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+9'],
      },
    ],
  },
  rde3: {
    name: 'Ring of Protection +4',
    gold: 125,
    description: 'Increases the armor of the Hero by 4 when worn.',
    category: 'Miscellaneous',
    level: 2,
    stats: [
      {
        label: 'Armor',
        values: ['+4'],
      },
    ],
  },
  rlif: {
    name: 'Ring of Regeneration',
    gold: 300,
    description: "Increases the Hero's hit point regeneration by 2 hit points per second.",
    category: 'Permanent',
    level: 3,
    stats: [
      {
        label: 'Hit Point Regeneration',
        values: ['+2/sec'],
      },
    ],
  },
  bspd: {
    name: 'Boots of Speed',
    gold: 250,
    description: 'Increases the movement speed of the Hero by 60 when worn.',
    category: 'Purchasable',
    level: 3,
    stats: [
      {
        label: 'Movement Speed Bonus',
        values: ['60'],
      },
    ],
  },
  rej3: {
    name: 'Replenishment Potion',
    gold: 150,
    description:
      'Non-combat consumable. Regenerates 200 hit points and 75 mana of the Hero over 30 seconds.',
    category: 'Charged',
    level: 2,
    duration: 30,
    charges: 1,
    stats: [
      {
        label: 'Hit Points Restored',
        values: ['200'],
      },
      {
        label: 'Mana Restored',
        values: ['75'],
      },
    ],
  },
  will: {
    name: 'Wand of Illusion',
    gold: 150,
    description:
      'Creates an illusory double of the targeted unit. The double deals no damage, takes double damage from enemy attacks, and disappears after 60 seconds or when killed.',
    category: 'Charged',
    level: 2,
    duration: 60,
    charges: 2,
    stats: [
      {
        label: 'Damage Taken Multiplier',
        values: ['2'],
      },
    ],
  },
  wlsd: {
    name: 'Wand of Lightning Shield',
    gold: 150,
    description:
      'Casts Lightning Shield on a target unit, surrounding it with electricity that deals 20 damage per second to nearby units. Lasts 10 seconds.',
    category: 'Miscellaneous',
    level: 2,
    cooldown: 10,
    duration: 10,
    range: 600,
    aoe: [160],
    charges: 2,
    stats: [
      {
        label: 'Damage per Second',
        values: ['20'],
      },
    ],
  },
  wswd: {
    name: 'Sentry Wards',
    gold: 150,
    description: 'Drops a magic immune Sentry Ward to spy upon an area for 180 seconds.',
    category: 'Charged',
    level: 2,
    duration: 180,
    range: 500,
    charges: 2,
    stats: [
      {
        label: 'Sight Range',
        values: ['1200'],
      },
      {
        label: 'Hit Points',
        values: ['50'],
      },
    ],
  },
  cnob: {
    name: 'Circlet of Nobility',
    gold: 200,
    description:
      'Provides a +2 bonus to Strength, Agility and Intelligence. Increases the Strength, Agility and Intelligence of the Hero by 2 when worn.',
    category: 'Purchasable',
    level: 3,
    stats: [
      {
        label: 'Strength',
        values: ['+2'],
      },
      {
        label: 'Agility',
        values: ['+2'],
      },
      {
        label: 'Intelligence',
        values: ['+2'],
      },
    ],
  },
  gcel: {
    name: 'Gloves of Haste',
    gold: 125,
    description: 'Increases the attack speed of the Hero by 18% when worn.',
    category: 'Permanent',
    level: 2,
    stats: [
      {
        label: 'Attack Speed',
        values: ['+18%'],
      },
    ],
  },
  rat6: {
    name: 'Claws of Attack +5',
    gold: 125,
    description: 'Increases the attack damage of the Hero by 5 when worn.',
    category: 'Miscellaneous',
    level: 2,
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+5'],
      },
    ],
  },
  rde2: {
    name: 'Ring of Protection +3',
    gold: 125,
    description: 'Increases the armor of the Hero by 3 when worn.',
    category: 'Permanent',
    level: 2,
    stats: [
      {
        label: 'Armor',
        values: ['+3'],
      },
    ],
  },
  tdx2: {
    name: 'Tome of Agility +2',
    gold: 300,
    description: 'Permanently increases the Agility of the Hero by 2 when picked up.',
    category: 'Power Up',
    level: 2,
    stats: [
      {
        label: 'Agility',
        values: ['+2'],
      },
    ],
  },
  tin2: {
    name: 'Tome of Intelligence +2',
    gold: 300,
    description: 'Permanently increases the Intelligence of the Hero by 2 when picked up.',
    category: 'Power Up',
    level: 2,
    stats: [
      {
        label: 'Intelligence',
        values: ['+2'],
      },
    ],
  },
  tpow: {
    name: 'Tome of Knowledge',
    gold: 300,
    description:
      'Permanently increases the Strength, Agility and Intelligence of the Hero by 1 when used.',
    category: 'Power Up',
    level: 2,
    stats: [
      {
        label: 'Strength',
        values: ['+1'],
      },
      {
        label: 'Agility',
        values: ['+1'],
      },
      {
        label: 'Intelligence',
        values: ['+1'],
      },
    ],
  },
  tst2: {
    name: 'Tome of Strength +2',
    gold: 300,
    description: 'Permanently increases the Strength of the Hero by 2 when picked up.',
    category: 'Power Up',
    level: 2,
    stats: [
      {
        label: 'Strength',
        values: ['+2'],
      },
    ],
  },
  pnvl: {
    name: 'Potion of Lesser Invulnerability',
    gold: 150,
    description:
      'Makes the Hero invulnerable to damage for 7 seconds. An invulnerable Hero may not be the target of spells or effects.',
    category: 'Purchasable',
    level: 3,
    cooldown: 45,
    duration: 7,
    charges: 1,
  },
  clsd: {
    name: 'Cloak of Shadows',
    gold: 100,
    description:
      'Provides the Hero with invisibility when worn. An invisible Hero is untargetable by the enemy unless detected. If the Hero moves, attacks, uses an ability, or casts a spell, the invisibility effect is lost. Fade time of 1.5 seconds.',
    category: 'Permanent',
    level: 1,
  },
  rag1: {
    name: 'Slippers of Agility +3',
    gold: 100,
    description: 'Increases the Agility of the Hero by 3 when worn.',
    category: 'Permanent',
    level: 1,
    stats: [
      {
        label: 'Agility',
        values: ['+3'],
      },
    ],
  },
  rin1: {
    name: 'Mantle of Intelligence +3',
    gold: 100,
    description: 'Increases the Intelligence of the Hero by 3 when worn.',
    category: 'Permanent',
    level: 1,
    stats: [
      {
        label: 'Intelligence',
        values: ['+3'],
      },
    ],
  },
  rst1: {
    name: 'Gauntlets of Ogre Strength +3',
    gold: 100,
    description: 'Increases the Strength of the Hero by 3 when worn.',
    category: 'Permanent',
    level: 1,
    stats: [
      {
        label: 'Strength',
        values: ['+3'],
      },
    ],
  },
  manh: {
    name: 'Manual of Health',
    gold: 200,
    description: 'Permanently increases the hit points of the Hero by 50 when picked up.',
    category: 'Power Up',
    level: 1,
    stats: [
      {
        label: 'Hit Points',
        values: ['+50'],
      },
    ],
  },
  tdex: {
    name: 'Tome of Agility',
    gold: 150,
    description: 'Permanently increases the Agility of the Hero by 1 when picked up.',
    category: 'Power Up',
    level: 1,
    stats: [
      {
        label: 'Agility',
        values: ['+1'],
      },
    ],
  },
  tint: {
    name: 'Tome of Intelligence',
    gold: 150,
    description: 'Permanently increases the Intelligence of the Hero by 1 when picked up.',
    category: 'Power Up',
    level: 1,
    stats: [
      {
        label: 'Intelligence',
        values: ['+1'],
      },
    ],
  },
  tstr: {
    name: 'Tome of Strength',
    gold: 150,
    description: 'Permanently increases the Strength of the Hero by 1 when picked up.',
    category: 'Power Up',
    level: 1,
    stats: [
      {
        label: 'Strength',
        values: ['+1'],
      },
    ],
  },
  pomn: {
    name: 'Potion of Omniscience',
    gold: 400,
  },
  wshs: {
    name: 'Wand of Shadowsight',
    gold: 150,
  },
  rej6: {
    name: 'Greater Scroll of Replenishment',
    gold: 500,
  },
  rej5: {
    name: 'Lesser Scroll of Replenishment',
    gold: 400,
  },
  rej4: {
    name: 'Greater Replenishment Potion',
    gold: 450,
  },
  ram4: {
    name: 'Fourth Ring of the Archmagi',
    gold: 750,
    description: 'Provides a +3 bonus to Strength, Agility and Intelligence when worn.',
    category: 'Permanent',
    level: 4,
    stats: [
      {
        label: 'Strength',
        values: ['+3'],
      },
      {
        label: 'Agility',
        values: ['+3'],
      },
      {
        label: 'Intelligence',
        values: ['+3'],
      },
    ],
  },
  dsum: {
    name: 'Diamond of Summoning',
    gold: 400,
  },
  ofir: {
    name: 'Orb of Fire',
    gold: 250,
    description:
      "Adds 5 bonus fire damage to the attack of a Hero when carried. The Hero's attacks also become ranged when attacking air, and reduce the effectiveness of healing and regeneration on enemy units by 35% for 3 seconds.",
    category: 'Miscellaneous',
    level: 3,
    duration: 3,
    stats: [
      {
        label: 'Bonus Fire Damage',
        values: ['+5'],
      },
      {
        label: 'Healing Reduction',
        values: ['35%'],
      },
    ],
  },
  ocor: {
    name: 'Orb of Corruption',
    gold: 375,
    description:
      "Adds 5 bonus damage to the attack of a Hero when carried. The Hero's attacks also become ranged when attacking air and reduce the armor of enemy units by 4 for 5 seconds.",
    category: 'Purchasable',
    level: 3,
    duration: 5,
    stats: [
      {
        label: 'Bonus Damage',
        values: ['5'],
      },
      {
        label: 'Armor Reduction',
        values: ['4'],
      },
    ],
  },
  oli2: {
    name: 'Orb of Lightning',
    gold: 375,
    description:
      "Adds 5 bonus damage to the attack of a Hero when carried. The Hero's attacks also become ranged when attacking air, and have a 30% chance to dispel magic and slow the enemy. Deals 200 bonus damage to summoned units.",
    category: 'Purchasable',
    level: 3,
    stats: [
      {
        label: 'Bonus Damage',
        values: ['5'],
      },
      {
        label: 'Bonus vs Summoned',
        values: ['200'],
      },
      {
        label: 'Purge Chance',
        values: ['30%'],
      },
    ],
  },
  oven: {
    name: 'Orb of Venom',
    gold: 325,
    description:
      "Adds 5 bonus damage to the attack of a Hero when carried. The Hero's attacks also become ranged when attacking air and poison enemy units for 6 seconds.",
    category: 'Purchasable',
    level: 3,
    duration: 6,
    stats: [
      {
        label: 'Bonus Damage',
        values: ['5'],
      },
      {
        label: 'Poison Damage',
        values: ['8/sec'],
      },
    ],
  },
  ram3: {
    name: 'Third Ring of the Archmagi',
    gold: 400,
    description: 'Provides a +3 bonus to Strength, Agility and Intelligence when worn.',
    category: 'Permanent',
    level: 4,
    stats: [
      {
        label: 'Strength',
        values: ['+3'],
      },
      {
        label: 'Agility',
        values: ['+3'],
      },
      {
        label: 'Intelligence',
        values: ['+3'],
      },
    ],
  },
  tret: {
    name: 'Tome of Retraining',
    gold: 200,
    description: "Unlearns all of the Hero's spells, allowing the Hero to learn different skills.",
    category: 'Purchasable',
    level: 1,
    charges: 1,
  },
  tgrh: {
    name: 'Tiny Great Hall',
    gold: 600,
    description:
      'Creates a Great Hall at a target location. Human, Night Elf, and Undead players receive their racial equivalent town hall.',
    category: 'Purchasable',
    level: 3,
    charges: 1,
    stats: [
      {
        label: 'Lumber Cost',
        values: ['185'],
      },
    ],
  },
  rej2: {
    name: 'Lesser Replenishment Potion',
    gold: 150,
  },
  gemt: {
    name: 'Gem of True Seeing',
    gold: 200,
  },
  ram2: {
    name: 'Second Ring of the Archmagi',
    gold: 300,
    description: 'Provides a +3 bonus to Strength, Agility and Intelligence when worn.',
    category: 'Permanent',
    level: 4,
    stats: [
      {
        label: 'Strength',
        values: ['+3'],
      },
      {
        label: 'Agility',
        values: ['+3'],
      },
      {
        label: 'Intelligence',
        values: ['+3'],
      },
    ],
  },
  stel: {
    name: 'Staff of Teleportation',
    gold: 150,
    description: 'Teleports the Hero to a target allied land unit or structure.',
    category: 'Purchasable',
    level: 2,
    cooldown: 90,
    charges: 2,
    stats: [
      {
        label: 'Channel Time',
        values: ['3s'],
      },
    ],
  },
  stwp: {
    name: 'Scroll of Town Portal',
    gold: 325,
    description:
      'Teleports the Hero and nearby troops to a target friendly town hall. The Hero is invulnerable and uncontrollable during the 5 second channel. Harvesting workers are excluded.',
    category: 'Purchasable',
    level: 2,
    charges: 1,
    stats: [
      {
        label: 'Channel Time',
        values: ['5s'],
      },
    ],
  },
  wneg: {
    name: 'Wand of Negation',
    gold: 120,
    description:
      'Dispels all magical effects on a single target. Deals 200 damage to summoned units.',
    category: 'Purchasable',
    level: 2,
    cooldown: 5,
    charges: 3,
    stats: [
      {
        label: 'Damage to Summoned',
        values: ['200'],
      },
    ],
  },
  sneg: {
    name: 'Staff of Negation',
    gold: 200,
  },
  wneu: {
    name: 'Wand of Neutralization',
    gold: 150,
  },
  shea: {
    name: 'Scroll of Healing',
    gold: 250,
    description: 'Heals 150 hit points to all friendly non-mechanical units around the Hero.',
    category: 'Purchasable',
    level: 2,
    cooldown: 25,
    aoe: [600],
    charges: 1,
    stats: [
      {
        label: 'Healing',
        values: ['150'],
      },
    ],
  },
  sman: {
    name: 'Scroll of Mana',
    gold: 150,
  },
  rej1: {
    name: 'Minor Replenishment Potion',
    gold: 100,
    description:
      'Non-combat consumable. Regenerates 100 hit points and 25 mana of the Hero over 30 seconds.',
    category: 'Miscellaneous',
    level: 1,
    duration: 30,
    charges: 1,
    stats: [
      {
        label: 'Hit Points Restored',
        values: ['100'],
      },
      {
        label: 'Mana Restored',
        values: ['25'],
      },
    ],
  },
  pspd: {
    name: 'Potion of Speed',
    gold: 75,
  },
  dust: {
    name: 'Dust of Appearance',
    gold: 75,
    description: 'Reveals enemy invisible units in an area around the Hero.',
    category: 'Purchasable',
    level: 2,
    cooldown: 20,
    duration: 20,
    charges: 2,
  },
  ram1: {
    name: 'First Ring of the Archmagi',
    gold: 125,
    description: 'Provides a +3 bonus to Strength, Agility and Intelligence when worn.',
    category: 'Permanent',
    level: 4,
    stats: [
      {
        label: 'Strength',
        values: ['+3'],
      },
      {
        label: 'Agility',
        values: ['+3'],
      },
      {
        label: 'Intelligence',
        values: ['+3'],
      },
    ],
  },
  pinv: {
    name: 'Potion of Invisibility',
    gold: 100,
    description:
      'Temporarily grants the Hero invisibility for 120 seconds. The effect ends if the Hero attacks, uses abilities, or casts spells.',
    category: 'Purchasable',
    level: 3,
    duration: 120,
    charges: 1,
  },
  phea: {
    name: 'Potion of Healing',
    gold: 150,
    description: 'Heals 250 hit points when used.',
    category: 'Purchasable',
    level: 2,
    cooldown: 20,
    charges: 1,
    stats: [
      {
        label: 'Hit Points Restored',
        values: ['250'],
      },
    ],
  },
  pman: {
    name: 'Potion of Mana',
    gold: 150,
    description: 'Restores 125 mana when used.',
    category: 'Purchasable',
    level: 2,
    cooldown: 20,
    charges: 1,
    stats: [
      {
        label: 'Mana Restored',
        values: ['125'],
      },
    ],
  },
  spro: {
    name: 'Scroll of Protection',
    gold: 150,
    description:
      'Increases the armor of all friendly units in an area around your Hero by 2 for 30 seconds.',
    category: 'Purchasable',
    level: 2,
    duration: 30,
    aoe: [600],
    charges: 1,
    stats: [
      {
        label: 'Armor Bonus',
        values: ['2'],
      },
    ],
  },
  hslv: {
    name: 'Healing Salve',
    gold: 100,
    description:
      "Regenerates a target unit's hit points by 400 over 40 seconds. The effect is dispelled if the target takes at least 20 damage.",
    category: 'Purchasable',
    level: 1,
    duration: 40,
    range: 500,
    charges: 3,
    stats: [
      {
        label: 'Hit Points Regenerated',
        values: ['400'],
      },
    ],
  },
  moon: {
    name: 'Moonstone',
    gold: 50,
    description: 'Causes an artificial night that blocks out the sun. Lasts 30 seconds.',
    category: 'Purchasable',
    level: 1,
    cooldown: 70,
    duration: 30,
    charges: 1,
  },
  shas: {
    name: 'Scroll of Speed',
    gold: 70,
    description:
      'Increases the movement speed of the Hero and nearby allied units to maximum. Lasts 10 seconds.',
    category: 'Purchasable',
    level: 1,
    cooldown: 60,
    duration: 10,
    charges: 1,
  },
  skul: {
    name: 'Sacrificial Skull',
    gold: 50,
    description: 'Creates an area of Blight at a target location.',
    category: 'Purchasable',
    level: 1,
    charges: 1,
  },
  mcri: {
    name: 'Mechanical Critter',
    gold: 50,
    description:
      'Creates a player-controlled critter for scouting. Appears as a normal critter to the enemy and does not draw aggro.',
    category: 'Purchasable',
    level: 1,
    charges: 1,
    stats: [
      {
        label: 'Sight Range',
        values: ['500'],
      },
    ],
  },
  rnec: {
    name: 'Rod of Necromancy',
    gold: 150,
    description: 'Raises 2 Skeleton Warriors from a target corpse.',
    category: 'Purchasable',
    level: 1,
    cooldown: 24,
    duration: 65,
    range: 600,
    charges: 4,
    stats: [
      {
        label: 'Skeletons Summoned',
        values: ['2'],
      },
    ],
  },
  ritd: {
    name: 'Ritual Dagger',
    gold: 75,
    description:
      'Sacrifices a friendly Undead unit to regenerate 200 hit points over 45 seconds to all nearby non-mechanical units.',
    category: 'Purchasable',
    level: 1,
    cooldown: 5,
    duration: 45,
    charges: 1,
    stats: [
      {
        label: 'Hit Points Regenerated',
        values: ['200'],
      },
    ],
  },
  tsct: {
    name: 'Ivory Tower',
    gold: 40,
    description:
      'Creates a Scout Tower at a target location. Requires a Keep. Costs 25 lumber in addition to gold.',
    category: 'Purchasable',
    level: 1,
    charges: 1,
    stats: [
      {
        label: 'Lumber Cost',
        values: ['25'],
      },
    ],
  },
  azhr: {
    name: 'Heart of Aszune',
    gold: 200,
  },
  bzbe: {
    name: 'Empty Vial',
    gold: 200,
  },
  bzbf: {
    name: 'Full Vial',
    gold: 200,
  },
  ches: {
    name: 'Cheese',
    gold: 250,
  },
  cnhn: {
    name: 'Horn of Cenarius',
    gold: 200,
  },
  glsk: {
    name: "Guldan's Skull",
    gold: 200,
  },
  gopr: {
    name: 'Glyph of Purification',
    gold: 250,
  },
  k3m1: {
    name: 'Key of 3 Moons - 1',
    gold: 200,
  },
  k3m2: {
    name: 'Key of 3 Moons - 2',
    gold: 200,
  },
  k3m3: {
    name: 'Key of 3 Moons - 3',
    gold: 200,
  },
  ktrm: {
    name: "Urn of Kel'Thuzad",
    gold: 200,
  },
  kybl: {
    name: 'bloody key',
    gold: 200,
  },
  kygh: {
    name: 'ghost key',
    gold: 200,
  },
  kymn: {
    name: 'moon key',
    gold: 200,
  },
  kysn: {
    name: 'sun key',
    gold: 200,
  },
  ledg: {
    name: "Gerard's Lost Ledger",
    gold: 200,
  },
  phlt: {
    name: 'Phat Lewt',
    gold: 500,
  },
  sehr: {
    name: "Searinox's Heart",
    gold: 200,
  },
  engs: {
    name: 'Enchanted Gemstone',
    gold: 200,
  },
  sorf: {
    name: 'Shadow Orb Fragment',
    gold: 200,
  },
  gmfr: {
    name: 'Gem Fragment',
    gold: 200,
  },
  jpnt: {
    name: 'note to jaina proudmoore',
    gold: 200,
  },
  shwd: {
    name: 'shimmerweed',
    gold: 200,
  },
  skrt: {
    name: 'Skeletal Artifact',
    gold: 250,
  },
  thle: {
    name: 'thunder lizard egg',
    gold: 200,
  },
  sclp: {
    name: 'secret level powerup',
    gold: 75,
  },
  wtlg: {
    name: "Wirt's Leg",
    gold: 200,
  },
  wolg: {
    name: "Wirt's Other Leg",
    gold: 200,
  },
  mgtk: {
    name: "Magtheridon's Keys",
    gold: 200,
  },
  mort: {
    name: "Mogrin's Report",
    gold: 200,
  },
  dphe: {
    name: 'Thunder Hawk Egg',
    gold: 200,
  },
  dkfw: {
    name: 'Keg of Thunderwater',
    gold: 200,
  },
  dthb: {
    name: 'Thunderbloom Bulb',
    gold: 200,
  },
  fgun: {
    name: 'Flare Gun',
    gold: 125,
  },
  lure: {
    name: 'Monster Lure',
    gold: 200,
  },
  olig: {
    name: 'Orb of Lightning',
    gold: 450,
    description:
      "Adds 5 bonus damage to the attack of a Hero when carried. The Hero's attacks also become ranged when attacking air, and have a 30% chance to dispel magic and slow the enemy. Deals 200 bonus damage to summoned units.",
    category: 'Purchasable',
    level: 3,
    stats: [
      {
        label: 'Bonus Damage',
        values: ['5'],
      },
      {
        label: 'Bonus vs Summoned',
        values: ['200'],
      },
      {
        label: 'Purge Chance',
        values: ['30%'],
      },
    ],
  },
  amrc: {
    name: 'Amulet of Recall',
    gold: 250,
  },
  flag: {
    name: 'human flag',
    gold: 1000,
  },
  gobm: {
    name: 'Goblin Land Mines',
    gold: 225,
    description:
      'Places a hidden land mine at a target point. Enemy units that move near it trigger the mine, dealing area damage.',
    category: 'Miscellaneous',
    level: 0,
    charges: 3,
  },
  gsou: {
    name: 'Soul Gem',
    gold: 1000,
  },
  nflg: {
    name: 'NightElf flag',
    gold: 1000,
  },
  nspi: {
    name: 'Necklace of Spell Immunity',
    gold: 1000,
    description: 'Renders the Hero invulnerable to magic.',
    category: 'Miscellaneous',
    level: 0,
  },
  oflg: {
    name: 'Orc flag',
    gold: 1000,
  },
  pams: {
    name: 'Anti-magic Potion',
    gold: 100,
    description: 'Gives the Hero immunity to magical spells for 15 seconds.',
    category: 'Purchasable',
    level: 0,
    cooldown: 30,
    duration: 15,
    charges: 1,
  },
  pgin: {
    name: 'Potion of Greater Invisibility',
    gold: 200,
  },
  rat3: {
    name: 'Claws of Attack +4',
    gold: 125,
    description: 'Increases the attack damage of the Hero by 4 when worn.',
    category: 'Permanent',
    level: 2,
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+4'],
      },
    ],
  },
  rde0: {
    name: 'Ring of Protection +1',
    gold: 50,
  },
  rde1: {
    name: 'Ring of Protection +2',
    gold: 125,
    description: 'Increases the armor of the Hero by 2 when worn.',
    category: 'Miscellaneous',
    level: 2,
    stats: [
      {
        label: 'Armor',
        values: ['+2'],
      },
    ],
  },
  rnsp: {
    name: 'Ring of Superiority',
    gold: 100,
    description:
      'Provides a +1 bonus to Strength, Agility and Intelligence when equipped by a Hero.',
    category: 'Permanent',
    level: 1,
    stats: [
      {
        label: 'Strength',
        values: ['+1'],
      },
      {
        label: 'Agility',
        values: ['+1'],
      },
      {
        label: 'Intelligence',
        values: ['+1'],
      },
    ],
  },
  soul: {
    name: 'Soul',
    gold: 1000,
  },
  tels: {
    name: 'Goblin Night Scope',
    gold: 200,
    description: 'Increases the sight range of the Hero at night.',
    category: 'Miscellaneous',
    level: 0,
    charges: 1,
  },
  tgxp: {
    name: 'Tome of Greater Experience',
    gold: 1000,
    description: 'Grants 500 experience points to the Hero when used.',
    category: 'Miscellaneous',
    level: 0,
    stats: [
      {
        label: 'Experience',
        values: ['500'],
      },
    ],
  },
  uflg: {
    name: 'Undead flag',
    gold: 1000,
  },
  anfg: {
    name: 'Ancient Figurine',
    gold: 150,
  },
  brag: {
    name: 'Bracer of Agility',
    gold: 50,
  },
  drph: {
    name: 'Druid Pouch',
    gold: 50,
  },
  iwbr: {
    name: 'Ironwood Branch',
    gold: 50,
  },
  jdrn: {
    name: 'Jade Ring',
    gold: 50,
  },
  lnrn: {
    name: "Lion's Ring",
    gold: 50,
  },
  mlst: {
    name: 'Maul of Strength',
    gold: 50,
  },
  oslo: {
    name: 'Orb of Slow',
    gold: 325,
    description:
      "Adds 5 bonus damage to the attack of a Hero when carried. The Hero's attack also becomes ranged when attacking air and has a 25% (10% vs heroes) chance to slow an enemy's movement by 55% and attack rate by 25% for 10 (5) seconds.",
    category: 'Purchasable',
    level: 3,
    stats: [
      {
        label: 'Bonus Damage',
        values: ['5'],
      },
      {
        label: 'Proc Chance',
        values: ['25% (10% vs heroes)'],
      },
      {
        label: 'Movement Slow',
        values: ['55%'],
      },
      {
        label: 'Attack Slow',
        values: ['25%'],
      },
    ],
  },
  sbok: {
    name: 'Spell Book',
    gold: 325,
  },
  sksh: {
    name: 'Skull Shield',
    gold: 200,
  },
  sprn: {
    name: 'Spider Ring',
    gold: 50,
  },
  tmmt: {
    name: 'Totem of Might',
    gold: 50,
  },
  vddl: {
    name: 'Voodoo Doll',
    gold: 50,
  },
  spre: {
    name: 'Staff of Preservation',
    gold: 150,
    description:
      'Teleports a target friendly unit to its highest level town hall. Cannot target crowd-controlled or summoned units.',
    category: 'Purchasable',
    cooldown: 30,
  },
  sfog: {
    name: 'Horn of the Clouds',
    gold: 200,
  },
  sor1: {
    name: 'Shadow Orb +1',
    gold: 50,
  },
  sor2: {
    name: 'Shadow Orb +2',
    gold: 100,
  },
  sor3: {
    name: 'Shadow Orb +3',
    gold: 200,
  },
  sor4: {
    name: 'Shadow Orb +4',
    gold: 300,
  },
  sor5: {
    name: 'Shadow Orb +5',
    gold: 350,
  },
  sor6: {
    name: 'Shadow Orb +6',
    gold: 400,
  },
  sor7: {
    name: 'Shadow Orb +7',
    gold: 550,
  },
  sor8: {
    name: 'Shadow Orb +8',
    gold: 700,
  },
  sor9: {
    name: 'Shadow Orb +9',
    gold: 900,
  },
  sora: {
    name: 'Shadow Orb +10',
    gold: 1250,
  },
  fwss: {
    name: 'Frostwyrm Skull Shield',
    gold: 750,
  },
  shtm: {
    name: 'Shamanic Totem',
    gold: 600,
  },
  esaz: {
    name: 'Essence of Aszune',
    gold: 600,
  },
  btst: {
    name: 'orcish battle standard',
    gold: 1000,
  },
  tbsm: {
    name: 'Tiny Blacksmith',
    gold: 200,
  },
  tfar: {
    name: 'Tiny Farm',
    gold: 75,
  },
  tlum: {
    name: 'Tiny Lumber Mill',
    gold: 150,
  },
  tbar: {
    name: 'Tiny Barracks',
    gold: 160,
  },
  tbak: {
    name: 'Tiny Altar of Kings',
    gold: 180,
  },
  gldo: {
    name: "Orb of Kil'jaeden",
    gold: 450,
  },
  stre: {
    name: 'Staff of Reanimation',
    gold: 200,
  },
  horl: {
    name: 'Holy Relic',
    gold: 950,
  },
  hbth: {
    name: 'Helm of Battlethirst',
    gold: 4200,
  },
  blba: {
    name: 'Bladebane Armor',
    gold: 3500,
  },
  rugt: {
    name: 'Runed Gauntlets',
    gold: 725,
  },
  frhg: {
    name: 'Firehand Gauntlets',
    gold: 3500,
  },
  gvsm: {
    name: 'Gloves of Spell Mastery',
    gold: 1400,
  },
  crdt: {
    name: 'Crown of the Deathlord',
    gold: 6400,
  },
  arsc: {
    name: 'Arcane Scroll',
    gold: 1000,
  },
  scul: {
    name: 'Scroll of the Unholy Legion',
    gold: 950,
  },
  tmsc: {
    name: 'Tome of Sacrifices',
    gold: 1250,
  },
  dtsb: {
    name: "Drek'thar's Spellbook",
    gold: 3350,
  },
  grsl: {
    name: 'Grimoire of Souls',
    gold: 1350,
  },
  arsh: {
    name: 'Arcanite Shield',
    gold: 3500,
  },
  shdt: {
    name: 'Shield of the Deathlord',
    gold: 9000,
  },
  shhn: {
    name: 'Shield of Honor',
    gold: 3350,
  },
  shen: {
    name: 'Enchanted Shield',
    gold: 650,
  },
  thdm: {
    name: 'Thunderlizard Diamond',
    gold: 1190,
    description:
      'Casts Chain Lightning, hurling a bolt of lightning that jumps between enemy targets, dealing less damage with each jump.',
    category: 'Miscellaneous',
    level: 0,
    cooldown: 9,
    range: 700,
    aoe: [500],
    stats: [
      {
        label: 'Initial Damage',
        values: ['100'],
      },
      {
        label: 'Jumps',
        values: ['4'],
      },
      {
        label: 'Jump Reduction',
        values: ['25%'],
      },
    ],
  },
  stpg: {
    name: 'Stuffed Penguin',
    gold: 450,
  },
  shrs: {
    name: 'Shimmerglaze Roast',
    gold: 150,
  },
  bfhr: {
    name: "Bloodfeather's Heart",
    gold: 2500,
  },
  cosl: {
    name: 'Celestial Orb of Souls',
    gold: 10000,
  },
  shcw: {
    name: 'Shaman Claws',
    gold: 950,
  },
  srbd: {
    name: 'Searing Blade',
    gold: 1650,
  },
  frgd: {
    name: 'Frostguard',
    gold: 1400,
  },
  envl: {
    name: 'Enchanted Vial',
    gold: 450,
  },
  rump: {
    name: 'Rusty Mining Pick',
    gold: 300,
  },
  srtl: {
    name: 'Serathil',
    gold: 5500,
  },
  stwa: {
    name: 'Sturdy War Axe',
    gold: 600,
  },
  klmm: {
    name: 'Killmaim',
    gold: 7500,
  },
  rots: {
    name: 'Rod of the Sea',
    gold: 1000,
  },
  axas: {
    name: 'Ancestral Staff',
    gold: 3000,
  },
  mnsf: {
    name: 'Mindstaff',
    gold: 1800,
  },
  schl: {
    name: 'Scepter of Healing',
    gold: 4200,
  },
  asbl: {
    name: "Assassin's Blade",
    gold: 2000,
  },
  kgal: {
    name: 'Keg of Ale',
    gold: 850,
  },
  ward: {
    name: 'Warsong Battle Drums',
    gold: 500,
    description:
      'Increases the attack damage of nearby friendly units by 7.5% when worn. Does not stack with the Kodo Beast’s War Drums Aura.',
    category: 'Permanent',
    level: 5,
    aoe: [900],
    stats: [
      {
        label: 'Damage Bonus',
        values: ['7.5%'],
      },
    ],
  },
  gold: {
    name: 'Chest of Gold',
    gold: 150,
  },
  lmbr: {
    name: 'Bundle of Lumber',
    gold: 150,
  },
  gfor: {
    name: 'Glyph of Fortification',
    gold: 200,
  },
  guvi: {
    name: 'Glyph of Ultravision',
    gold: 125,
  },
  rspl: {
    name: 'Rune of Spirit Link',
    gold: 150,
  },
  rre1: {
    name: 'Rune of Lesser Resurrection',
    gold: 100,
  },
  rre2: {
    name: 'Rune of Greater Resurrection',
    gold: 300,
  },
  gomn: {
    name: 'Glyph of Omniscience',
    gold: 300,
  },
  rsps: {
    name: 'Rune of Shielding',
    gold: 300,
  },
  rspd: {
    name: 'Rune of Speed',
    gold: 200,
    description:
      'Increases the movement speed of all nearby allied units to the maximum (400 for most units). Lasts 10 seconds.',
    category: 'Power Up',
    level: 0,
    duration: 10,
    charges: 1,
    stats: [
      {
        label: 'Movement Speed',
        values: ['400'],
      },
    ],
  },
  rman: {
    name: 'Rune of Mana(Lesser)',
    gold: 100,
    description: 'Restores 125 mana to all nearby friendly units.',
    category: 'Power Up',
    level: 0,
    charges: 1,
    stats: [
      {
        label: 'Mana Restored',
        values: ['125'],
      },
    ],
  },
  rma2: {
    name: 'Rune of Mana(Greater)',
    gold: 300,
    description: 'Restores 300 mana to all nearby friendly units.',
    category: 'Power Up',
    level: 0,
    charges: 1,
    stats: [
      {
        label: 'Mana Restored',
        values: ['300'],
      },
    ],
  },
  rres: {
    name: 'Rune of Restoration',
    gold: 250,
  },
  rreb: {
    name: 'Rune of Rebirth',
    gold: 250,
    description: 'Places the monster that held this rune under your control.',
    category: 'Power Up',
    level: 0,
    charges: 1,
  },
  rhe1: {
    name: 'Rune of Lesser Healing',
    gold: 100,
    description: 'Heals 125 hit points to all nearby friendly non-mechanical units.',
    category: 'Power Up',
    level: 0,
    charges: 1,
    stats: [
      {
        label: 'Hit Points Restored',
        values: ['125'],
      },
    ],
  },
  rhe2: {
    name: 'Rune of Healing',
    gold: 200,
    description: 'Heals 250 hit points to all nearby friendly non-mechanical units.',
    category: 'Power Up',
    level: 0,
    charges: 1,
    stats: [
      {
        label: 'Hit Points Restored',
        values: ['250'],
      },
    ],
  },
  rhe3: {
    name: 'Rune of Greater Healing',
    gold: 300,
    description: 'Heals 400 hit points to all nearby friendly non-mechanical units.',
    category: 'Power Up',
    level: 0,
    charges: 1,
    stats: [
      {
        label: 'Hit Points Restored',
        values: ['400'],
      },
    ],
  },
  rdis: {
    name: 'Rune of Dispel Magic',
    gold: 75,
  },
  texp: {
    name: 'Tome of Experience',
    gold: 500,
    description: 'Grants 100 experience points to the Hero when picked up.',
    category: 'Miscellaneous',
    level: 2,
    stats: [
      {
        label: 'Experience',
        values: ['100'],
      },
    ],
  },
  rwat: {
    name: 'Rune of the Watcher',
    gold: 75,
    description: 'Creates an invulnerable Sentry Ward at this location.',
    category: 'Power Up',
    level: 0,
    charges: 1,
  },
  pclr: {
    name: 'Clarity Potion',
    gold: 160,
  },
  plcl: {
    name: 'Lesser Clarity Potion',
    gold: 70,
    description:
      "Regenerates the Hero's mana by 100 over 30 seconds. The effect cancels if the Hero takes more than 20 damage.",
    category: 'Purchasable',
    level: 0,
    duration: 30,
    charges: 1,
    stats: [
      {
        label: 'Mana Regenerated',
        values: ['100'],
      },
    ],
  },
  silk: {
    name: 'Spider Silk',
    gold: 50,
  },
  vamp: {
    name: 'Vampiric Potion',
    gold: 150,
  },
  sreg: {
    name: 'Scroll of Regeneration',
    gold: 100,
    description:
      'Regenerates the hit points of all friendly non-mechanical units in an area around your Hero by 225 over 45 seconds.',
    category: 'Purchasable',
    level: 0,
    duration: 45,
    aoe: [600],
    charges: 1,
    stats: [
      {
        label: 'Hit Points Regenerated',
        values: ['225'],
      },
    ],
  },
  tcas: {
    name: 'Tiny Castle',
    gold: 800,
  },
  ssan: {
    name: 'Staff of Sanctuary',
    gold: 200,
    description:
      'Teleports a target unit to your highest tier town hall, stunning it and regenerating 15 hit points per second until fully healed. Cannot target crowd-controlled or summoned units.',
    category: 'Purchasable',
    level: 0,
    cooldown: 45,
    stats: [
      {
        label: 'Heal per Second',
        values: ['15'],
      },
    ],
  },
  ofr2: {
    name: 'Orb of Fire v2',
    gold: 250,
    description:
      "Adds 5 bonus fire damage to the attack of a Hero when carried. The Hero's attacks also become ranged when attacking air, and reduce the effectiveness of healing and regeneration on enemy units by 35% for 3 seconds.",
    category: 'Miscellaneous',
    level: 3,
    duration: 3,
    stats: [
      {
        label: 'Bonus Fire Damage',
        values: ['+5'],
      },
      {
        label: 'Healing Reduction',
        values: ['35%'],
      },
    ],
  },
  sxpl: {
    name: 'Seed of Expulsion',
    gold: 200,
  },
  vpur: {
    name: 'Vine of Purification',
    gold: 200,
  },
  pdiv: {
    name: 'Potion of Divinity',
    gold: 550,
    description: 'Turns the Hero invulnerable for 25 seconds.',
    category: 'Charged',
    level: 5,
    cooldown: 60,
    duration: 25,
    charges: 1,
  },
  fgrd: {
    name: 'Red Drake Egg',
    gold: 550,
    description: 'Summons a Red Drake to fight for you. Lasts 180 seconds.',
    category: 'Miscellaneous',
    level: 5,
    cooldown: 20,
    duration: 180,
    charges: 1,
  },
  totw: {
    name: 'talisman of the wild',
    gold: 550,
    description: 'Summons a Furbolg to fight for you. Lasts 180 seconds.',
    category: 'Miscellaneous',
    level: 5,
    cooldown: 20,
    duration: 180,
    charges: 3,
  },
  sand: {
    name: 'Scroll of Animate Dead',
    gold: 700,
    description: 'Raises 6 nearby dead units to fight for 40 seconds.',
    category: 'Miscellaneous',
    level: 6,
    cooldown: 40,
    duration: 40,
    range: 400,
    aoe: [900],
    charges: 1,
    stats: [
      {
        label: 'Corpses Raised',
        values: ['6'],
      },
    ],
  },
  srrc: {
    name: 'Scroll of Resurrection',
    gold: 700,
    description: 'Brings 6 of your nearby dead units back to life.',
    category: 'Miscellaneous',
    level: 6,
    aoe: [900],
    charges: 1,
    stats: [
      {
        label: 'Units Resurrected',
        values: ['6'],
      },
    ],
  },
}
