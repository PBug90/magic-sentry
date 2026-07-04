import type { UpgradeEntry } from './balance.js'

export const UPGRADE_DATA: Record<string, UpgradeEntry> = {
  Rhme: {
    name: 'Iron Forged Swords',
    gold: 100,
    lumber: 50,
    description:
      'Iron Forged Swords is a Human upgrade researched at the Blacksmith that increases the attack damage of melee/attacking units including Militia, Footmen, Spell Breakers, Knights, Gryphon Riders and Dragonhawk Riders. It has three tiers (Iron, Steel, and Mithril Forged Swords), each requiring a higher-tier town hall and granting a larger damage bonus.',
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+1', '+2', '+3'],
      },
    ],
  },
  Rhra: {
    name: 'Black Gunpowder',
    gold: 100,
    lumber: 50,
    description:
      'Black Gunpowder is a Human upgrade researched at the Blacksmith that increases the ranged attack damage of Riflemen, Mortar Teams, Siege Engines and Flying Machines. It has three tiers (Black, Refined, and Imbued Gunpowder) requiring progressively higher-tier town halls.',
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+1', '+2', '+3'],
      },
    ],
  },
  Rhhb: {
    name: 'Storm Hammers',
    gold: 125,
    lumber: 225,
    description:
      "Storm Hammers is a single-level Human upgrade researched at the Gryphon Aviary that causes Gryphon Riders' hammers to strike through their target and hit the next nearby enemy, dealing damage to both (reduced by 20% against each additional target). It does not work against air units.",
  },
  Rhar: {
    name: 'Iron Plating',
    gold: 125,
    lumber: 75,
    description:
      'Iron Plating is a Human armor upgrade researched at the Blacksmith that increases the armor of Militia, Footmen, Spell Breakers, Knights, Flying Machines, and Siege Engines. It has three levels (Iron, Steel, and Mithril Plating), each providing progressively more armor.',
    stats: [
      {
        label: 'Armor Bonus',
        values: ['+2', '+4', '+6'],
      },
    ],
  },
  Rhgb: {
    name: 'Flying Machine Bombs',
    gold: 150,
    lumber: 100,
    description:
      "Enables the Flying Machine's second attack, allowing it to attack ground units and buildings; without it, Flying Machines can only target air units. It is a single-level upgrade researched at the Castle.",
  },
  Rhac: {
    name: 'Improved Masonry',
    gold: 125,
    lumber: 50,
    description:
      'Improved Masonry is a Human upgrade researched at the Lumber Mill that increases the armor and hit points of all Human buildings. It has three research levels with progressively larger bonuses.',
    stats: [
      {
        label: 'Hit Point Bonus',
        values: ['10%', '20%', '30%'],
      },
      {
        label: 'Armor Bonus',
        values: ['+1', '+2', '+3'],
      },
    ],
  },
  Rhde: {
    name: 'Defend',
    gold: 125,
    lumber: 75,
    description:
      'Defend is a Human upgrade researched at the Blacksmith that gives Footmen a toggleable Defend stance, reducing damage taken from piercing attacks by 50% at the cost of reduced movement speed while active. It makes early Footmen effective against enemy ranged units.',
    stats: [
      {
        label: 'Piercing Damage Reduction',
        values: ['50%'],
      },
    ],
  },
  Rhan: {
    name: 'Animal War Training',
    gold: 125,
    lumber: 125,
    description:
      'Animal War Training is a single-level Human upgrade researched at the Barracks that increases the maximum hit points of Knights, Dragonhawk Riders, and Gryphon Riders by 100.',
    stats: [
      {
        label: 'Hit Point Bonus',
        values: ['+100'],
      },
    ],
  },
  Rhpt: {
    name: 'Priest Adept Training',
    gold: 100,
    lumber: 50,
    description:
      'Priest Adept Training upgrades Priests to Adept level, increasing their maximum mana by 100 and their mana regeneration, and unlocking the Dispel Magic ability. Researched at the Arcane Sanctum.',
  },
  Rhst: {
    name: 'Sorceress Adept Training',
    gold: 100,
    lumber: 50,
    description:
      "Sorceress Adept Training is a single-level Human upgrade researched at the Arcane Sanctum that increases each Sorceress's mana capacity, mana regeneration rate, and hit points, and unlocks the Invisibility spell.",
    stats: [
      {
        label: 'Mana Bonus',
        values: ['+100'],
      },
      {
        label: 'Mana Regeneration Bonus',
        values: ['+0.32'],
      },
      {
        label: 'Hit Point Bonus',
        values: ['+40'],
      },
    ],
  },
  Rhla: {
    name: 'Studded Leather Armor',
    gold: 100,
    lumber: 100,
    description:
      'Studded Leather Armor is a Human upgrade researched at the Blacksmith that increases the armor of Riflemen, Mortar Teams, Dragonhawk Riders and Gryphon Riders. It has three levels (Studded Leather Armor, Reinforced Leather Armor, Dragonhide Armor) that progressively boost armor.',
    stats: [
      {
        label: 'Armor Bonus',
        values: ['+2', '+4', '+6'],
      },
    ],
  },
  Rhri: {
    name: 'Long Rifles',
    gold: 75,
    lumber: 125,
    description:
      "Long Rifles is a Human upgrade that increases the Rifleman's attack range by 200 (from 400 to 600), letting Riflemen attack from a greater distance.",
    stats: [
      {
        label: 'Attack Range Bonus',
        values: ['+200'],
      },
    ],
  },
  Rhlh: {
    name: 'Improved Lumber Harvesting',
    gold: 100,
    lumber: 0,
    description:
      'A Human upgrade researched at the Lumber Mill that increases the amount of lumber Peasants can carry per trip. It has two research levels (Improved and Advanced Lumber Harvesting), each adding +10 lumber to carrying capacity.',
    stats: [
      {
        label: 'Lumber Capacity Bonus',
        values: ['+10', '+20'],
      },
    ],
  },
  Rhse: {
    name: 'Magic Sentry',
    gold: 50,
    lumber: 50,
    description:
      'Magic Sentry is a single-level Human upgrade researched at the Arcane Sanctum that gives the Human defensive towers (Scout, Guard, Cannon and Arcane Towers) true sight, allowing them to detect and reveal nearby invisible units.',
  },
  Rhfl: {
    name: 'Flare',
    gold: 50,
    lumber: 50,
    description:
      'A Human upgrade researched at the Workshop that enables the Flare ability for Mortar Teams. Flare launches a Dwarven flare over a target point, revealing that area (including invisible units) for a short time.',
    stats: [
      {
        label: 'Reveal Duration',
        values: ['15 sec'],
      },
      {
        label: 'Area of Effect',
        values: ['1800'],
      },
      {
        label: 'Cooldown',
        values: ['120 sec'],
      },
    ],
  },
  Rhss: {
    name: 'Spell Steal',
    gold: 75,
    lumber: 75,
    description:
      "Spell Steal is a Spell Breaker autocast ability that steals a positive buff from an enemy unit and transfers it to a nearby friendly unit, or takes a negative buff off a friendly unit and applies it to a nearby enemy unit. It steals only one buff per use and resets the buff's duration to full.",
    stats: [
      {
        label: 'Mana Cost',
        values: ['75'],
      },
      {
        label: 'Cooldown (seconds)',
        values: ['6'],
      },
      {
        label: 'Cast Range',
        values: ['700'],
      },
    ],
  },
  Rhrt: {
    name: 'Barrage',
    gold: 50,
    lumber: 150,
    description:
      'Barrage is a Human upgrade researched at the Workshop that enables Siege Engines to attack air units, firing multiple Dwarven rockets at nearby enemy air units within range.',
  },
  Rhpm: {
    name: 'Backpack',
    gold: 50,
    lumber: 25,
    description:
      "Backpack is a passive upgrade (researched at the Human Town Hall for 50 gold and 25 lumber) that allows certain non-hero ground units to carry items in a 2-slot inventory; the units cannot use the items' bonuses but can transport them to heroes or other units.",
    stats: [
      {
        label: 'Item Slots',
        values: ['2'],
      },
    ],
  },
  Rhfc: {
    name: 'Flak Cannons',
    gold: 100,
    lumber: 150,
    description:
      'Flak Cannons is a Human upgrade researched at the Workshop that gives the Flying Machine an anti-air attack with splash damage, letting it hit multiple air units at once (7 damage within 75 range, 6 within 150, 5 within 325).',
  },
  Rhfs: {
    name: 'Fragmentation Shards',
    gold: 50,
    lumber: 100,
    description:
      'Fragmentation Shards is a single-level Human upgrade researched at the Workshop (requires Castle) that equips the Mortar Team (and, since patch 1.30.0, the Cannon Tower) with fragmentation mortars, increasing the area/splash damage they deal to Unarmored and Medium armored units.',
  },
  Rhcd: {
    name: 'Cloud',
    gold: 50,
    lumber: 100,
    description:
      'Cloud is a Human research upgrade (studied at the Gryphon Aviary, requires Castle) that grants the Dragonhawk Rider the Cloud ability, which creates a small cloud that prevents enemy buildings with ranged attacks inside it from attacking.',
    stats: [
      {
        label: 'Ability Mana Cost',
        values: ['100'],
      },
      {
        label: 'Ability Cooldown (sec)',
        values: ['20'],
      },
      {
        label: 'Ability Area of Effect',
        values: ['300'],
      },
      {
        label: 'Ability Cast Range',
        values: ['1000'],
      },
    ],
  },
  Rhsb: {
    name: 'Sundering Blades',
    gold: 100,
    lumber: 150,
    description:
      'Sundering Blades is a Human Barracks upgrade that gives Knights a passive damage bonus, increasing the damage they deal to enemy units with Medium armor by 10%. It is a single-level upgrade requiring a Castle and Barracks.',
    stats: [
      {
        label: 'Damage Bonus vs Medium Armor',
        values: ['10%'],
      },
    ],
  },
  Rome: {
    name: 'Steel Melee Weapons',
    gold: 100,
    lumber: 75,
    description:
      'Steel Melee Weapons is the first tier of the Orc melee weapon attack upgrade, researched at the War Mill; it increases the melee attack damage of Grunts, Raiders and Tauren. Its higher tiers are Thorium Melee Weapons (requires Stronghold) and Arcanite Melee Weapons (requires Fortress).',
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+1', '+2', '+3'],
      },
    ],
  },
  Rora: {
    name: 'Orc Ranged Attack',
    gold: 100,
    lumber: 100,
    description:
      'The Orc "Steel Ranged Weapons" upgrade (researched at the War Mill) increases the ranged attack damage of Headhunters, Wind Riders, Troll Batriders, and Demolishers. It has three tiers (Steel, Thorium, Arcanite Ranged Weapons) that progressively raise ranged damage.',
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+1', '+2', '+3'],
      },
    ],
  },
  Roar: {
    name: 'Steel Armor',
    gold: 150,
    lumber: 75,
    description:
      'Steel Armor is an Orc upgrade researched at the War Mill that increases the armor of Grunts, Raiders, Troll Batriders, Tauren, Headhunters, Wind Riders and Demolishers. It has three progressive tiers (Steel, Thorium, Arcanite Armor) with escalating building requirements.',
    stats: [
      {
        label: 'Armor Bonus',
        values: ['+2', '+4', '+6'],
      },
    ],
  },
  Rwdm: {
    name: 'War Drums Damage Increase',
    gold: 100,
    lumber: 150,
    description:
      "Increases the damage bonus of the Kodo Beast's War Drums aura, raising the attack damage bonus it grants to nearby friendly units from 10% to 20%. It is a single-level upgrade researched at the Beastiary.",
    stats: [
      {
        label: 'Aura Damage Bonus (before / after)',
        values: ['10%', '20%'],
      },
    ],
  },
  Ropg: {
    name: 'Pillage',
    gold: 75,
    lumber: 25,
    description:
      "Pillage is a passive Orc upgrade (researched at the Barracks/Great Hall tech) that lets Grunts, Peons, and Raiders gain resources when attacking enemy buildings, returning 50% of a building's gold and lumber cost as it takes damage.",
  },
  Robs: {
    name: 'Brute Strength',
    gold: 50,
    lumber: 150,
    description:
      'Brute Strength is a single-level Orc upgrade researched at the Barracks that permanently improves the fighting capabilities of Grunts, granting them +125 hit points and +3 bonus attack damage.',
    stats: [
      {
        label: 'Hit Point Bonus',
        values: ['+125'],
      },
      {
        label: 'Damage Bonus',
        values: ['+3'],
      },
    ],
  },
  Rows: {
    name: 'Pulverize',
    gold: 100,
    lumber: 175,
    description:
      "Pulverize is an Orc upgrade (researched at the War Mill) that gives the Tauren a chance on attack to deal area-of-effect damage to nearby enemy units; researching it increases the Tauren's built-in Pulverize damage.",
    stats: [
      {
        label: 'Activation Chance',
        values: ['25%'],
      },
      {
        label: 'Full Damage (250 radius)',
        values: ['60'],
      },
      {
        label: 'Half Damage (350 radius)',
        values: ['30'],
      },
    ],
  },
  Roen: {
    name: 'Ensnare',
    gold: 50,
    lumber: 75,
    description:
      "Ensnare is an Orc research (at the Beastiary) that unlocks the Raider's Ensnare ability, which traps and immobilizes a target enemy unit for a period of time, making it easier to attack; it also forces flying units to the ground.",
    stats: [
      {
        label: 'Duration (units)',
        values: ['9 seconds'],
      },
      {
        label: 'Duration (heroes)',
        values: ['3 seconds'],
      },
      {
        label: 'Cooldown',
        values: ['15 seconds'],
      },
      {
        label: 'Cast Range',
        values: ['500'],
      },
    ],
  },
  Rovs: {
    name: 'Envenomed Spears',
    gold: 100,
    lumber: 150,
    description:
      'A single-level Orc upgrade (researched at the Beastiary, requires Fortress) that adds a poison orb effect to Wind Rider attacks, dealing 3 damage per second for 25 seconds to targets they hit.',
    stats: [
      {
        label: 'Poison Damage per Second',
        values: ['3'],
      },
      {
        label: 'Poison Duration (seconds)',
        values: ['25'],
      },
    ],
  },
  Rowd: {
    name: 'Witch Doctor Adept Training',
    gold: 100,
    lumber: 50,
    description:
      "Increases Witch Doctors' mana capacity, mana regeneration rate, and hit points, and unlocks the Stasis Trap ability. Researched at the Spirit Lodge for 100 gold and 50 lumber.",
    stats: [
      {
        label: 'Mana Point Bonus',
        values: ['+100'],
      },
      {
        label: 'Mana Regeneration Bonus',
        values: ['+0.32'],
      },
      {
        label: 'Hit Point Bonus',
        values: ['+40'],
      },
    ],
  },
  Rost: {
    name: 'Shaman Adept Training',
    gold: 100,
    lumber: 50,
    description:
      "Shaman Adept Training is an Orc upgrade researched at the Spirit Lodge that increases the Shaman's mana capacity, mana regeneration rate, and hit points, and unlocks the Lightning Shield ability. It is a single-tier upgrade (followed separately by Master Training).",
    stats: [
      {
        label: 'Mana Capacity Bonus',
        values: ['+100'],
      },
      {
        label: 'Mana Regeneration Bonus',
        values: ['+0.32'],
      },
      {
        label: 'Hit Point Bonus',
        values: ['+40'],
      },
    ],
  },
  Rosp: {
    name: 'Spiked Barricades',
    gold: 25,
    lumber: 75,
    description:
      "Spiked Barricades is an Orc upgrade researched at the War Mill that surrounds Orc buildings with spikes, causing them to damage enemy melee units that attack them. Each attack returns 5 damage plus a percentage of the attacker's damage, increasing per research level.",
    stats: [
      {
        label: 'Base Return Damage',
        values: ['5', '5'],
      },
      {
        label: 'Attacker Damage Returned',
        values: ['20%', '50%'],
      },
    ],
  },
  Rotr: {
    name: 'Troll Regeneration',
    gold: 100,
    lumber: 100,
    description:
      'Troll Regeneration is an Orc upgrade researched at the Barracks (requires a Stronghold and War Mill) that increases the hit point regeneration rate of all Troll units (Headhunters/Berserkers, Witch Doctors, and Batriders).',
    stats: [
      {
        label: 'Health Regeneration Rate',
        values: ['1.0 HP/sec'],
      },
    ],
  },
  Rolf: {
    name: 'Liquid Fire',
    gold: 75,
    lumber: 125,
    description:
      "Liquid Fire is an Orc upgrade researched at the Beastiary that gives Batriders an orb-style attack against buildings, flinging volatile liquid that deals damage over time while drastically reducing the structure's repair rate and attack speed.",
    stats: [
      {
        label: 'Damage per Second',
        values: ['8'],
      },
      {
        label: 'Duration',
        values: ['3'],
      },
      {
        label: 'Attack Speed Reduction',
        values: ['60%'],
      },
      {
        label: 'Repair Rate Reduction',
        values: ['75%'],
      },
    ],
  },
  Roch: {
    name: 'orc chaos conversion',
    gold: 0,
    lumber: 0,
  },
  Rowt: {
    name: 'Sprit Walker Adept Training',
    gold: 100,
    lumber: 50,
    description:
      "Adept Training upgrade for the Orc Spirit Walker, researched at the Tauren Totem. It increases the Spirit Walker's mana capacity, mana regeneration rate, and hit points, and unlocks the Disenchant ability.",
    stats: [
      {
        label: 'Mana Point Bonus',
        values: ['+150'],
      },
      {
        label: 'Mana Regeneration Bonus',
        values: ['+0.42'],
      },
      {
        label: 'Hit Point Bonus',
        values: ['+60'],
      },
    ],
  },
  Rorb: {
    name: 'Reinforced Defenses',
    gold: 75,
    lumber: 175,
    description:
      'Reinforced Defenses is an Orc upgrade researched at the War Mill (requires Stronghold) that upgrades Orc Burrows and Watch Towers to have Fortified armor instead of Heavy armor, making them far more resistant to attacks.',
  },
  Robk: {
    name: 'Berserker Upgrade',
    gold: 75,
    lumber: 175,
    description:
      'Berserker Upgrade transforms Troll Headhunters into Troll Berserkers, increasing their hit points and granting the Berserk ability (a self-buff that boosts attack speed at the cost of increased damage taken).',
    stats: [
      {
        label: 'Hit Point Bonus',
        values: ['+100'],
      },
    ],
  },
  Ropm: {
    name: 'Backpack',
    gold: 50,
    lumber: 25,
    description:
      "Backpack is a passive upgrade (researched at the Human Town Hall for 50 gold and 25 lumber) that allows certain non-hero ground units to carry items in a 2-slot inventory; the units cannot use the items' bonuses but can transport them to heroes or other units.",
    stats: [
      {
        label: 'Item Slots',
        values: ['2'],
      },
    ],
  },
  Robf: {
    name: 'Burning Oil',
    gold: 50,
    lumber: 150,
    description:
      "Burning Oil is an Orc upgrade researched at the Barracks (requires a Fortress) that drenches the Demolisher's ammunition in burning oil, causing its attacks to set the ground on fire and deal area-of-effect burn damage to enemy units over time.",
  },
  Rume: {
    name: 'Unholy Strength',
    gold: 125,
    lumber: 50,
    description:
      'Unholy Strength is an Undead upgrade researched at the Graveyard that increases the attack damage of Ghouls, Meat Wagons, Abominations, Skeleton Warriors, and Skeletal Mages. It has three cumulative levels unlocked by advancing tech tiers (Halls of the Dead, then Black Citadel).',
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+1', '+2', '+3'],
      },
    ],
  },
  Rura: {
    name: 'Creature Attack',
    gold: 150,
    lumber: 50,
    description:
      'Creature Attack is an Undead upgrade researched at the Graveyard that increases the attack damage of Crypt Fiends, Gargoyles, Destroyers, and Frost Wyrms across three research levels.',
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+1', '+2', '+3'],
      },
    ],
  },
  Ruar: {
    name: 'Unholy Armor',
    gold: 125,
    lumber: 50,
    description:
      'Unholy Armor is an Undead defensive upgrade researched at the Graveyard that increases the armor of Undead ground units (such as Ghouls and Abominations). It has three research levels, each granting a larger cumulative armor bonus.',
    stats: [
      {
        label: 'Armor Bonus',
        values: ['+2', '+4', '+6'],
      },
    ],
  },
  Ruac: {
    name: 'Cannibalism',
    gold: 50,
    lumber: 0,
    description:
      "Cannibalize is an Undead ability (used by Ghouls and Abominations) that consumes a nearby corpse to restore the unit's hit points over time. The Ghoul version heals 16 hit points per second and takes about 20 seconds to fully consume a corpse.",
    stats: [
      {
        label: 'HP Restored per Second',
        values: ['16'],
      },
      {
        label: 'Consume Duration (seconds)',
        values: ['20'],
      },
    ],
  },
  Rugf: {
    name: 'Ghoul Frenzy',
    gold: 100,
    lumber: 150,
    description:
      "A single-level Undead upgrade researched at the Crypt that permanently increases Ghouls' attack rate by 35% and their movement speed by 60.",
    stats: [
      {
        label: 'Attack Rate Bonus',
        values: ['+35%'],
      },
      {
        label: 'Movement Speed Bonus',
        values: ['+60'],
      },
    ],
  },
  Ruwb: {
    name: 'Web',
    gold: 100,
    lumber: 100,
    description:
      'Undead upgrade researched at the Crypt that grants Crypt Fiends the Web ability, which binds a target enemy air unit in webbing and forces it to the ground so it can be attacked as a ground unit.',
    stats: [
      {
        label: 'Duration (seconds)',
        values: ['12'],
      },
    ],
  },
  Rusf: {
    name: 'Stone Form',
    gold: 75,
    lumber: 150,
    description:
      "Stone Form is an Undead upgrade (researched at the Crypt) that enables the Gargoyle's Stone Form ability, allowing it to transform into an immobile statue that cannot attack but gains a large armor bonus, rapidly regenerates health, and becomes immune to spells.",
    stats: [
      {
        label: 'Armor Bonus',
        values: ['+12'],
      },
      {
        label: 'HP Regeneration (per second)',
        values: ['8'],
      },
      {
        label: 'Cooldown (seconds)',
        values: ['30'],
      },
    ],
  },
  Rune: {
    name: 'Necromancer Adept Training',
    gold: 100,
    lumber: 50,
    description:
      'Necromancer Adept Training is an Undead upgrade researched at the Temple of the Damned that raises the Necromancer to Adept level, increasing its mana capacity, mana regeneration, and hit points, and unlocking the Cripple spell.',
    stats: [
      {
        label: 'Mana Capacity Bonus',
        values: ['+100'],
      },
      {
        label: 'Mana Regeneration Bonus',
        values: ['+0.32'],
      },
      {
        label: 'Hit Point Bonus',
        values: ['+40'],
      },
    ],
  },
  Ruba: {
    name: 'Banshee Adept Training',
    gold: 100,
    lumber: 50,
    description:
      'Banshee Adept Training upgrades the Banshee to Adept level, increasing its mana capacity, mana regeneration rate, and hit points, and unlocking the Anti-magic Shell ability. It is researched at the Temple of the Damned.',
    stats: [
      {
        label: 'Mana Capacity Bonus',
        values: ['+100'],
      },
      {
        label: 'Mana Regeneration Bonus',
        values: ['+0.32'],
      },
      {
        label: 'Hit Point Bonus',
        values: ['+40'],
      },
    ],
  },
  Rufb: {
    name: 'Freezing Breath',
    gold: 150,
    lumber: 225,
    description:
      "Freezing Breath is an Undead upgrade researched at the Boneyard that grants Frost Wyrms the Freezing Breath ability, letting their attack freeze enemy buildings and temporarily halt all of that structure's activity (attacking and production). It is a single-level upgrade valued for assaulting enemy towns and towers.",
    stats: [
      {
        label: 'Duration',
        values: ['5 seconds'],
      },
    ],
  },
  Rusl: {
    name: 'undead skeleton life span',
    gold: 75,
    lumber: 75,
  },
  Rucr: {
    name: 'Creature Carapace',
    gold: 150,
    lumber: 75,
    description:
      'Creature Carapace is an Undead upgrade researched at the Graveyard that increases the armor of Crypt Fiends, Gargoyles, Destroyers, and Frost Wyrms. It has three levels granting progressively larger armor bonuses.',
    stats: [
      {
        label: 'Armor Bonus',
        values: ['+2', '+4', '+6'],
      },
    ],
  },
  Rupc: {
    name: 'Disease Cloud',
    gold: 100,
    lumber: 200,
    description:
      'An Undead upgrade researched at the Slaughterhouse that grants the Abomination the Disease Cloud passive ability, infecting nearby enemy living units so they take damage over time. Infected units suffer 2 damage per second for 75 seconds.',
    stats: [
      {
        label: 'Damage Per Second',
        values: ['2'],
      },
      {
        label: 'Duration (seconds)',
        values: ['75'],
      },
    ],
  },
  Rusm: {
    name: 'Skeletal Mastery',
    gold: 150,
    lumber: 100,
    description:
      "Skeletal Mastery is an Undead upgrade (researched at the Temple of the Damned) that causes one of the two skeletons summoned by the Necromancer's Raise Dead to be a Skeletal Mage instead of a Skeleton Warrior, and increases the duration of raised Skeleton Warriors and Skeletal Mages by 20 seconds.",
    stats: [
      {
        label: 'Skeleton Duration Bonus',
        values: ['+20 sec'],
      },
    ],
  },
  Rubu: {
    name: 'Burrow',
    gold: 75,
    lumber: 75,
    description:
      'Burrow is an Undead upgrade researched at the Crypt that lets Crypt Fiends (and Carrion Beetles/Arachnathids) dig into the ground, becoming invisible and immobile while gaining an enhanced regeneration rate; burrowed units cannot attack.',
  },
  Rusp: {
    name: 'Destroyer Form',
    gold: 75,
    lumber: 150,
    description:
      'Destroyer Form is an Undead upgrade researched at the Slaughterhouse that allows the Obsidian Statue to permanently transform into a Destroyer, a flying anti-caster unit with the Devour Magic and Orb of Annihilation abilities.',
  },
  Ruex: {
    name: 'Exhume Corpses',
    gold: 75,
    lumber: 50,
    description:
      'Exhume Corpses is an Undead upgrade (researched at the Slaughterhouse, requires Halls of the Dead) that lets the Meat Wagon automatically generate a Crypt Fiend corpse inside itself every 15 seconds, providing a passive corpse supply for Necromancers to raise or for other uses.',
    stats: [
      {
        label: 'Corpse Generation Interval',
        values: ['15 seconds'],
      },
    ],
  },
  Rupm: {
    name: 'Backpack',
    gold: 50,
    lumber: 25,
    description:
      "Backpack is a passive upgrade (researched at the Human Town Hall for 50 gold and 25 lumber) that allows certain non-hero ground units to carry items in a 2-slot inventory; the units cannot use the items' bonuses but can transport them to heroes or other units.",
    stats: [
      {
        label: 'Item Slots',
        values: ['2'],
      },
    ],
  },
  Resm: {
    name: 'Strength of the Moon',
    gold: 125,
    lumber: 75,
    description:
      "Strength of the Moon is a Night Elf upgrade researched at the Hunter's Hall that increases the attack damage of Archers, Huntresses, Glaive Throwers, and Hippogryph Riders. It has three levels, each granting a progressively larger damage bonus.",
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+1', '+2', '+3'],
      },
    ],
  },
  Resw: {
    name: 'Strength of the Wild',
    gold: 100,
    lumber: 75,
    description:
      "Strength of the Wild is a Night Elf upgrade researched at the Hunter's Hall that increases the attack damage of the faction's beast units: Druids of the Claw (Bear Form), Druids of the Talon (Storm Crow Form), Dryads, Mountain Giants, Faerie Dragons, Hippogryphs, and Chimaeras. It has three progressive research levels.",
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+1', '+2', '+3'],
      },
    ],
  },
  Rema: {
    name: 'Moon Armor',
    gold: 150,
    lumber: 75,
    description:
      "Moon Armor is a Night Elf upgrade researched at the Hunter's Hall that increases the armor of Archers, Huntresses, and Hippogryph Riders. It has three research levels, each granting a progressively larger armor bonus.",
    stats: [
      {
        label: 'Armor Bonus',
        values: ['+2', '+4', '+6'],
      },
    ],
  },
  Rerh: {
    name: 'Reinforced Hides',
    gold: 150,
    lumber: 50,
    description:
      "A Night Elf upgrade researched at the Hunter's Hall that increases the armor of Night Elf units (Druids of the Claw, Druids of the Talon, Dryads, Mountain Giants, Faerie Dragons, Hippogryphs, and Chimaeras). It has three research levels granting progressively greater armor bonuses.",
    stats: [
      {
        label: 'Armor Bonus',
        values: ['+2', '+4', '+6'],
      },
    ],
  },
  Reuv: {
    name: 'Ultravision',
    gold: 50,
    lumber: 50,
    description:
      "Ultravision is a Night Elf upgrade researched at the Hunter's Hall that lets Night Elf units see as far at night as they do during the day, removing their reduced night sight range.",
  },
  Renb: {
    name: "Nature's Blessing",
    gold: 150,
    lumber: 200,
    description:
      'A single-level Night Elf upgrade researched at the Tree of Life (requires Tree of Ages) that increases the armor and movement speed of all Ancients and Treants.',
    stats: [
      {
        label: 'Ancient Protector Armor Bonus',
        values: ['+2'],
      },
      {
        label: 'Ancient Protector Movement Speed Bonus',
        values: ['+40'],
      },
      {
        label: 'Other Ancients / Treants Armor Bonus',
        values: ['+5'],
      },
      {
        label: 'Treant Movement Speed Bonus',
        values: ['+50'],
      },
    ],
  },
  Resc: {
    name: 'Sentinel',
    gold: 50,
    lumber: 50,
    description:
      "Sentinel is a Night Elf upgrade researched at the Ancient of War (requires Hunter's Hall) that grants Huntresses the Sentinel ability: each Huntress can send her owl companion to a nearby tree to provide vision of the area, including detection of invisible units. Each Huntress can use it only once per game, and the vision lasts until dispelled or the tree is destroyed.",
    stats: [
      {
        label: 'Duration',
        values: ['120'],
      },
    ],
  },
  Remg: {
    name: 'Upgrade Moon Glaive',
    gold: 125,
    lumber: 175,
    description:
      "Moon Glaives is a single-level Night Elf upgrade (researched at the Hunter's Hall) that lets Huntresses' bouncing glaive attacks strike an additional enemy (two bounces total, each bounce dealing 50% less damage) and changes the Huntress's armor type to Heavy.",
  },
  Reib: {
    name: 'Improved Bows',
    gold: 50,
    lumber: 100,
    description:
      'Improved Bows is a Night Elf upgrade researched at the Ancient of War that increases the attack range of Archers and Hippogryph Riders.',
    stats: [
      {
        label: 'Range Bonus',
        values: ['200'],
      },
    ],
  },
  Remk: {
    name: 'Marksmanship',
    gold: 100,
    lumber: 175,
    description:
      "Marksmanship is a single-level Night Elf upgrade (researched at the Hunter's Hall, requiring the Tree of Eternity) that increases the attack damage of Archers and Hippogryph Riders by +4.",
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+4'],
      },
    ],
  },
  Redt: {
    name: 'Druid of the Talon Adept Training',
    gold: 100,
    lumber: 50,
    description:
      "Adept Training for the Druid of the Talon (researched at the Ancient of Wind) increases the unit's maximum mana, mana regeneration rate, and hit points, and unlocks the Storm Crow Form ability, letting it transform into a flying crow.",
    stats: [
      {
        label: 'Mana Bonus',
        values: ['+100'],
      },
      {
        label: 'Mana Regeneration Bonus',
        values: ['+0.32'],
      },
      {
        label: 'Hit Point Bonus',
        values: ['+40'],
      },
    ],
  },
  Redc: {
    name: 'Druid of the Claw Adept Training',
    gold: 100,
    lumber: 50,
    description:
      "Druid of the Claw Adept Training is an Ancient of Lore research that upgrades Druids of the Claw to Adept rank, increasing their Night Elf form's mana capacity, mana regeneration, hit points and attack damage, and unlocking the Rejuvenation spell.",
    stats: [
      {
        label: 'Mana Capacity Bonus',
        values: ['+100'],
      },
      {
        label: 'Mana Regeneration Bonus',
        values: ['+0.32'],
      },
      {
        label: 'Hit Point Bonus',
        values: ['+75'],
      },
      {
        label: 'Damage Dice Bonus',
        values: ['+1'],
      },
    ],
  },
  Resi: {
    name: 'Abolish Magic',
    gold: 50,
    lumber: 50,
    description:
      'Abolish Magic is a Night Elf upgrade researched at the Ancient of Lore that grants the Dryad an autocast dispel ability. It removes positive buffs from enemy units and negative buffs from friendly units, and deals damage to summoned units.',
    stats: [
      {
        label: 'Mana Cost',
        values: ['75'],
      },
      {
        label: 'Damage to Summoned Units',
        values: ['150'],
      },
    ],
  },
  Recb: {
    name: 'Corrosive Breath',
    gold: 125,
    lumber: 225,
    description:
      'A single-level Night Elf upgrade researched at the Chimaera Roost that gives Chimaeras corrosive bile, granting them bonus siege damage effective against enemy buildings.',
  },
  Reht: {
    name: 'nightelf hippogryph taming',
    gold: 75,
    lumber: 75,
    description:
      'Hippogryph Taming is a Night Elf upgrade researched at the Ancient of Wind that lets Hippogryphs pick up Archers to combine into Hippogryph Riders. It was removed in patch 1.30.0, after which the pick-up ability became available by default.',
  },
  Repb: {
    name: 'Vorpal Blades',
    gold: 125,
    lumber: 100,
    description:
      'Vorpal Blades is a Night Elf upgrade researched at the Ancient of War that improves the Glaive Thrower: it increases the speed of the launched glaives, grants bonus attack damage, and allows the glaives to damage trees.',
    stats: [
      {
        label: 'Damage Bonus',
        values: ['+10'],
      },
    ],
  },
  Rers: {
    name: 'Resistant Skin',
    gold: 50,
    lumber: 100,
    description:
      'Resistant Skin is a Night Elf upgrade (researched at the Ancient of Lore) that gives Mountain Giants a hero-like passive: they follow hero targeting rules, become immune to certain spells, and suffer reduced durations from negative/detrimental abilities (e.g. Ensnare lasts 3 seconds instead of 9).',
  },
  Rehs: {
    name: 'Hardened Skin',
    gold: 100,
    lumber: 175,
    description:
      'Hardened Skin is a passive upgrade for the Night Elf Mountain Giant, researched at the Ancient of Lore. It reduces all attacks against the Mountain Giant by 8 damage, though attacks can never be reduced below a minimum of 3 damage.',
    stats: [
      {
        label: 'Damage Reduction',
        values: ['8'],
      },
      {
        label: 'Minimum Damage',
        values: ['3'],
      },
    ],
  },
  Reeb: {
    name: 'Mark of the Claw',
    gold: 25,
    lumber: 100,
    description:
      'Mark of the Claw is a Night Elf upgrade researched at the Ancient of Lore that allows Druids of the Claw to cast Roar while in Bear Form. It is a single-level upgrade costing 25 gold and 100 lumber with a 20-second research time.',
  },
  Reec: {
    name: 'Mark of the Talon',
    gold: 25,
    lumber: 100,
    description:
      'Mark of the Talon is a Night Elf upgrade researched at the Ancient of Wind that allows Druids of the Talon to cast Faerie Fire while in Storm Crow Form.',
  },
  Rews: {
    name: 'Well Spring',
    gold: 75,
    lumber: 150,
    description:
      "Well Spring is a Night Elf upgrade researched at the Hunter's Hall (requires the Tree of Eternity) that increases the amount of mana Moon Wells can store by 100 and their mana regeneration rate by 0.52 per second.",
    stats: [
      {
        label: 'Mana Capacity Bonus',
        values: ['+100'],
      },
      {
        label: 'Mana Regeneration Bonus',
        values: ['+0.52/sec'],
      },
    ],
  },
  Repm: {
    name: 'Backpack',
    gold: 50,
    lumber: 25,
    description:
      "Backpack is a passive upgrade (researched at the Human Town Hall for 50 gold and 25 lumber) that allows certain non-hero ground units to carry items in a 2-slot inventory; the units cannot use the items' bonuses but can transport them to heroes or other units.",
    stats: [
      {
        label: 'Item Slots',
        values: ['2'],
      },
    ],
  },
}
