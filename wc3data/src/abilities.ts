// Warcraft III abilities keyed by fourcc id. One record per ability combining
// its display name with detail (mana/cooldown/range/damage/etc.) where known.
// Text originally from Liquipedia (CC-BY-SA 3.0).
export interface AbilityInfo {
  name: string
  description?: string
  manaCost?: number
  cooldown?: number
  range?: number
  duration?: number
  damage?: number[]
  aoe?: number[]
  stats?: { label: string; values: string[] }[]
}

export const ABILITY_BY_ID: Record<string, AbilityInfo> = {
  AHbz: {
    name: 'Blizzard',
    description: 'Calls down waves of freezing ice shards that damage units in a target area.',
    manaCost: 75,
    cooldown: 6,
    range: 800,
    damage: [30, 40, 50],
    aoe: [200],
    stats: [
      {
        label: 'Max Damage',
        values: ['150', '200', '250'],
      },
      {
        label: 'Buildings Factor',
        values: ['50%'],
      },
      {
        label: 'Number of Waves',
        values: ['6', '8', '10'],
      },
      {
        label: 'Wave Duration',
        values: ['1 second'],
      },
    ],
  },
  AHab: {
    name: 'Brilliance Aura',
    description: 'Gives additional mana regeneration to nearby friendly units.',
    aoe: [900],
    stats: [
      {
        label: 'Regeneration Bonus',
        values: ['0.75', '1.25', '2.00'],
      },
    ],
  },
  AHmt: {
    name: 'Mass Teleport',
    description:
      "Teleports 24 of the player's nearby units, including the Archmage, to a friendly ground unit or structure.",
    manaCost: 100,
    cooldown: 30,
    range: 99999,
    aoe: [800],
    stats: [
      {
        label: 'Casting Delay',
        values: ['3 seconds'],
      },
    ],
  },
  AHwe: {
    name: 'Summon Water Elemental',
    description: "Summons a Water Elemental to attack the Archmage's enemies.",
    manaCost: 125,
    cooldown: 20,
    duration: 60,
  },
  AHav: {
    name: 'Avatar',
    description:
      'Activate Avatar to temporarily give the Mountain King 5 bonus armor, 500 bonus hit points, 20 bonus damage and spell immunity.',
    manaCost: 150,
    cooldown: 180,
    duration: 60,
    stats: [
      {
        label: 'Bonus Armor',
        values: ['5'],
      },
      {
        label: 'Bonus HP',
        values: ['+500 HP'],
      },
      {
        label: 'Bonus damage',
        values: ['20'],
      },
    ],
  },
  AHbh: {
    name: 'Bash',
    description:
      'Gives a chance that an attack will do 25 bonus damage and stun his opponent for 2 seconds.',
    duration: 2,
    stats: [
      {
        label: 'Bonus damage',
        values: ['25', '40', '55'],
      },
      {
        label: 'Bash chance',
        values: ['20', '30', '40%'],
      },
    ],
  },
  AHtb: {
    name: 'Storm Bolt',
    description:
      'A magical hammer that is thrown at an enemy unit, causing damage and stunning the target.',
    manaCost: 75,
    cooldown: 9,
    range: 600,
    duration: 5,
    damage: [100, 200, 310],
  },
  AHtc: {
    name: 'Thunder Clap',
    description:
      'Slams the ground, damaging nearby enemy units. Units are also slowed for the duration listed below.',
    manaCost: 90,
    cooldown: 7,
    duration: 5,
    damage: [60, 110, 150],
    aoe: [300, 325, 350],
    stats: [
      {
        label: 'Movement speed',
        values: ['-50%'],
      },
      {
        label: 'Attack rate',
        values: ['-50%'],
      },
    ],
  },
  AHad: {
    name: 'Devotion Aura',
    description: 'Gives additional armor to nearby friendly units.',
    aoe: [900],
    stats: [
      {
        label: 'Armor Bonus',
        values: ['2', '3.5', '5'],
      },
    ],
  },
  AHds: {
    name: 'Divine Shield',
    description:
      'An impenetrable shield surrounds the Paladin, protecting him from all damage and spells for a set amount of time.',
    manaCost: 25,
    cooldown: 35,
    duration: 15,
  },
  AHhb: {
    name: 'Holy Light',
    description:
      'A holy light that can heal a friendly living unit or damage an enemy undead unit. The damage is half the amount healed.',
    manaCost: 65,
    cooldown: 5.5,
    range: 800,
    stats: [
      {
        label: 'Amount Healed',
        values: ['200', '400', '600'],
      },
      {
        label: 'Damage',
        values: ['100', '200', '300'],
      },
    ],
  },
  AHre: {
    name: 'Resurrection',
    description: 'Brings back to life the corpses of 6 friendly nearby units.',
    manaCost: 150,
    cooldown: 240,
    aoe: [900],
  },
  AHbn: {
    name: 'Banish',
    description:
      'Turns a non-mechanical unit ethereal and slows its movement speed by 50% for a short duration. Ethereal creatures cannot attack, but they can cast spells and will take 66% more damage from Magic attacks and spells.',
    manaCost: 75,
    cooldown: 4,
    duration: 12,
  },
  AHfs: {
    name: 'Flame Strike',
    description: 'Conjures a pillar of fire which damages ground units in a target area over time.',
    manaCost: 125,
    cooldown: 10,
    range: 800,
    aoe: [200],
    stats: [
      {
        label: 'Channel Time',
        values: ['0.8 seconds'],
      },
      {
        label: 'Pillar Damage',
        values: ['135', '240', '330'],
      },
      {
        label: 'Pillar Duration',
        values: ['2.67 seconds'],
      },
      {
        label: 'Fire Damage',
        values: ['24', '36', '48'],
      },
      {
        label: 'Fire Duration',
        values: ['6 seconds'],
      },
      {
        label: 'Buildings Factor',
        values: ['75%'],
      },
    ],
  },
  AHpx: {
    name: 'Summon Phoenix',
    description:
      'Summons a powerful Phoenix. The Phoenix burns with such intensity that it damages itself and nearby enemy units.\nHas Spell Immunity, and Resistant Skin. When a Phoenix dies, it creates an egg that will hatch into a Phoenix.',
    manaCost: 175,
    cooldown: 180,
  },
  AHdr: {
    name: 'Siphon Mana',
    description:
      "Transfers mana between the Blood Mage and a target.\nDrains mana from an enemy, or transfers mana to an ally.\nSiphon Mana can push the Blood Mage's mana over its maximum value, though excess mana drains off rapidly if not used.",
    manaCost: 25,
    cooldown: 8,
    range: 600,
    aoe: [700],
    stats: [
      {
        label: 'Mana Drained',
        values: ['15', '25', '40'],
      },
      {
        label: 'Mana Transferred',
        values: ['30', '50', '80'],
      },
    ],
  },
  AEmb: {
    name: 'Mana Burn',
    description:
      "Sends a bolt of negative energy that burns a target enemy unit's mana. Burned mana combusts, dealing damage to the target equal to the amount of mana burned.",
    manaCost: 50,
    cooldown: 7,
    range: 300,
    stats: [
      {
        label: 'Mana Burn',
        values: ['50', '100', '150'],
      },
    ],
  },
  AEim: {
    name: 'Immolation',
    description:
      'Engulfs the Demon Hunter in flames, causing damage to nearby enemy land units. Drains mana until deactivated.',
    manaCost: 10,
    aoe: [160],
    stats: [
      {
        label: 'Immolation Damage',
        values: ['6', '11', '17 per half second interval'],
      },
      {
        label: 'Mana Drained',
        values: ['7 per second'],
      },
    ],
  },
  AEev: {
    name: 'Evasion',
    description: 'Gives the Demon Hunter a chance to avoid attacks.',
    stats: [
      {
        label: 'Miss Chance',
        values: ['10', '20', '30%'],
      },
    ],
  },
  AEme: {
    name: 'Metamorphosis',
    description:
      'Transforms the Demon Hunter into a powerful demon with a ranged splash attack and 500 bonus hit points.',
    manaCost: 150,
    cooldown: 180,
    duration: 45,
    stats: [
      {
        label: 'HP gain',
        values: ['+500 HP'],
      },
      {
        label: 'Attack Type',
        values: ['Chaos'],
      },
      {
        label: 'Attack Range',
        values: ['600'],
      },
      {
        label: 'Splash Damage Area',
        values: ['50 (Full)', '150 (Half)', '250 (Quarter)'],
      },
    ],
  },
  AEer: {
    name: 'Entangling Roots',
    description:
      'Causes roots to burst from the ground, immobilizing, disarming, and damaging a target enemy unit.',
    manaCost: 75,
    cooldown: 8,
    range: 600,
    duration: 9,
    stats: [
      {
        label: 'Root Damage',
        values: ['15', '20', '30 dmg per second'],
      },
    ],
  },
  AEfn: {
    name: 'Force of Nature',
    description: 'Converts an area of trees into Treants. Treants can attack land units.',
    manaCost: 100,
    cooldown: 20,
    range: 800,
    aoe: [150, 225, 300],
    stats: [
      {
        label: 'Summon Count',
        values: ['2', '3', '4'],
      },
      {
        label: 'Summon Duration',
        values: ['60 s'],
      },
    ],
  },
  AEah: {
    name: 'Thorns Aura',
    description:
      'An aura that gives friendly units around the Keeper of the Grove a damage shield, which wounds enemy melee attackers.',
    aoe: [900],
    stats: [
      {
        label: 'Reflects',
        values: ['15', '30', '45% of melee damage'],
      },
    ],
  },
  AEtq: {
    name: 'Tranquility',
    description:
      'Causes a rain of healing energy to pour down in a large area, healing friendly allied units for 48 hit points per second.',
    manaCost: 125,
    cooldown: 100,
    duration: 12,
    aoe: [900],
    stats: [
      {
        label: 'Regeneration',
        values: ['48 HP/sec'],
      },
    ],
  },
  AEst: {
    name: 'Scout',
    description:
      'Temporarily summons an Owl Scout, which can be used to scout the map. Can see invisible units.',
    manaCost: 50,
    cooldown: 20,
    duration: 60,
    stats: [
      {
        label: 'Sight Range',
        values: ['1000', '1500', '2200'],
      },
      {
        label: 'Speed',
        values: ['300', '350', '400'],
      },
    ],
  },
  AHfa: {
    name: 'Searing Arrows',
  },
  AEar: {
    name: 'Trueshot Aura',
    description:
      'An aura that gives friendly units around the Priestess bonus damage to their ranged attacks.',
    aoe: [900],
    stats: [
      {
        label: 'Damage Bonus',
        values: ['10', '20', '30%'],
      },
    ],
  },
  AEsf: {
    name: 'Starfall',
    description:
      'Calls down waves of falling stars that damage nearby enemy units. Each wave deals 60 damage. The time between waves is 1.5 seconds.',
    manaCost: 150,
    cooldown: 120,
    duration: 30,
    aoe: [1000],
    stats: [
      {
        label: 'Damage per wave',
        values: ['60'],
      },
      {
        label: 'Wave Interval',
        values: ['1.5 second'],
      },
    ],
  },
  AEbl: {
    name: 'Blink',
    description:
      'Short distance teleportation that allows the Warden to move in and out of combat.',
    manaCost: 50,
    cooldown: 10,
    stats: [
      {
        label: 'Maximum Range',
        values: ['1000', '1075', '1150'],
      },
      {
        label: 'Minimum Range',
        values: ['200'],
      },
    ],
  },
  AEfk: {
    name: 'Fan of Knives',
    description: 'The Warden flings a flurry of knives at multiple enemy targets around her.',
    manaCost: 100,
    cooldown: 9,
    aoe: [400, 450, 475],
    stats: [
      {
        label: 'Damage per target',
        values: ['70', '130', '200'],
      },
      {
        label: 'Damage cap',
        values: ['420', '780', '1200'],
      },
      {
        label: 'Unit cap',
        values: ['6', '6', '6'],
      },
    ],
  },
  AEsh: {
    name: 'Shadow Strike',
    description:
      'Hurls a poisoned dagger which deals large initial damage, and then deals damage over time. The poisoned unit has its movement rate slowed for a short duration.',
    manaCost: 75,
    cooldown: 8,
    range: 300,
    duration: 15,
    stats: [
      {
        label: 'Strike damage',
        values: ['75', '150', '225'],
      },
      {
        label: 'Damage over time',
        values: ['10', '30', '45 every 3 sec'],
      },
      {
        label: 'Slow Amount',
        values: ['50%'],
      },
      {
        label: 'Slow Duration',
        values: ['3 seconds'],
      },
    ],
  },
  AEsv: {
    name: 'Spirit of Vengeance',
    description:
      'Creates a powerful avatar that summons invulnerable spirits from friendly corpses to attack your enemies. When the Avatar of Vengeance dies, the spirits vanish.',
    manaCost: 200,
    cooldown: 180,
    duration: 180,
  },
  AOww: {
    name: 'Bladestorm',
    description:
      'Causes a bladestorm of destructive force around the Blademaster, rendering him immune to magic and dealing 140 damage per second to nearby enemy land units.',
    manaCost: 200,
    cooldown: 120,
    duration: 7,
    stats: [
      {
        label: 'Damage',
        values: ['140 per second'],
      },
    ],
  },
  AOcr: {
    name: 'Critical Strike',
    description: 'Gives a 15% chance that the Blademaster will do more damage on his attacks.',
    stats: [
      {
        label: 'Damage Multiplier',
        values: ['2', '3', '4'],
      },
      {
        label: 'Crit Chance',
        values: ['15 %'],
      },
    ],
  },
  AOmi: {
    name: 'Mirror Image',
    description:
      "Confuses the enemy by creating illusions of the Blademaster and dispelling all magic from the Blademaster. Illusions deal 20% of the Blademaster's original damage.",
    manaCost: 80,
    cooldown: 5,
    duration: 60,
    stats: [
      {
        label: 'Number of Illusions',
        values: ['1', '2', '3'],
      },
    ],
  },
  AOwk: {
    name: 'Wind Walk',
    description:
      'Allows the Blademaster to become invisible, and move faster for a set amount of time. When the Blademaster attacks a unit to break invisibility, he will deal bonus damage.',
    manaCost: 75,
    cooldown: 2,
    duration: 20,
    stats: [
      {
        label: 'Movement Speed',
        values: ['10', '40', '70%'],
      },
      {
        label: 'Backstab damage',
        values: ['40', '70', '100'],
      },
    ],
  },
  AOcl: {
    name: 'Chain Lightning',
    description:
      'Hurls a bolt of damaging lightning at a target enemy that jumps to nearby enemies. Each jump deals less damage.',
    manaCost: 110,
    cooldown: 9,
    range: 700,
    aoe: [500],
    stats: [
      {
        label: 'Initial damage',
        values: ['85', '125', '180'],
      },
      {
        label: 'Jumps',
        values: ['4', '6', '8'],
      },
      {
        label: 'Jump Reduction',
        values: ['10%'],
      },
    ],
  },
  AOeq: {
    name: 'Earthquake',
    description:
      'Makes the ground tremble and break, causing 60 damage per second to enemy buildings and slowing enemy units by 75% within area of effect.\nLasts 20 seconds.',
    manaCost: 125,
    cooldown: 90,
    range: 1000,
    duration: 20,
    aoe: [250],
    stats: [
      {
        label: 'Building Damage',
        values: ['60 damage/sec'],
      },
      {
        label: 'Unit Movement',
        values: ['Slowed 75%'],
      },
    ],
  },
  AOfs: {
    name: 'Far Sight',
    description: 'Reveals the area of the map that is cast upon. Also reveals invisible units.',
    cooldown: 30,
    duration: 8,
    aoe: [900, 1800, 2700],
  },
  AOsf: {
    name: 'Feral Spirit',
    description: 'Summons 2 Spirit Wolves to fight enemies for a limited time.',
    manaCost: 85,
    cooldown: 30,
    duration: 60,
  },
  AOvd: {
    name: 'Big Bad Voodoo',
    description:
      'Turns all friendly units invulnerable in an area around the Shadow Hunter. The Shadow Hunter does not turn invulnerable. Lasts 30 seconds.',
    manaCost: 150,
    cooldown: 180,
    duration: 30,
    aoe: [800],
  },
  AOhw: {
    name: 'Healing Wave',
    description:
      'Calls forth a wave of energy that heals a target and bounces to nearby friendlies. Each bounce heals less damage.',
    manaCost: 90,
    cooldown: 9,
    range: 700,
    aoe: [500],
    stats: [
      {
        label: 'Healing',
        values: ['130', '215', '300'],
      },
      {
        label: 'Jumps',
        values: ['3', '4', '5'],
      },
      {
        label: 'Jump Reductions',
        values: ['25%'],
      },
    ],
  },
  AOhx: {
    name: 'Hex',
    description: 'Transforms an enemy unit into a random critter, disabling special abilities.',
    manaCost: 70,
    cooldown: 7,
    range: 800,
    duration: 15,
  },
  AOsw: {
    name: 'Serpent Ward',
    description:
      "Summons an immobile serpentine ward to attack the Shadow Hunter's enemies. The ward has 90/165/200 hit points and is immune to magic. Lasts 40 seconds.",
    manaCost: 30,
    cooldown: 6.5,
    range: 500,
    duration: 40,
  },
  AOae: {
    name: 'Endurance Aura',
    description: 'Increases the movement speed and attack rate of nearby friendly units.',
    aoe: [900],
    stats: [
      {
        label: 'Movement Speed',
        values: ['10', '15', '20 %'],
      },
      {
        label: 'Attack Rate',
        values: ['5', '10', '15 %'],
      },
    ],
  },
  AOre: {
    name: 'Reincarnation',
    description:
      'When killed, the Tauren Chieftain will come back to life. The Tauren Chieftain will return with full mana.',
    cooldown: 240,
    stats: [
      {
        label: 'Delay',
        values: ['5 seconds'],
      },
    ],
  },
  AOsh: {
    name: 'Shockwave',
    description:
      'A wave of force that ripples out from the Hero, causing damage to land units in a line.',
    manaCost: 90,
    cooldown: 8,
    range: 700,
    damage: [75, 130, 200],
    aoe: [150],
    stats: [
      {
        label: 'Distance',
        values: ['800'],
      },
      {
        label: 'Max Damage',
        values: ['900', '1560', '2400'],
      },
    ],
  },
  AOws: {
    name: 'War Stomp',
    description: 'Slams the ground, stunning and damaging nearby enemy units.',
    manaCost: 90,
    cooldown: 7,
    duration: 3,
    damage: [30, 60, 90],
    aoe: [250, 300, 350],
  },
  AUan: {
    name: 'Animate Dead',
    description:
      'Raises 6 dead units in an area to fight for the Death Knight. Animated units have 20px|link=Disease Cloud Disease Cloud.',
    manaCost: 125,
    cooldown: 180,
    range: 400,
    duration: 40,
    aoe: [900],
  },
  AUdc: {
    name: 'Death Coil',
    description:
      'A coil of death that can damage an enemy living unit or heal a friendly Undead unit.',
    manaCost: 75,
    cooldown: 6,
    range: 800,
    stats: [
      {
        label: 'Amount Healed',
        values: ['200', '400', '600'],
      },
      {
        label: 'Damage',
        values: ['100', '200', '300'],
      },
    ],
  },
  AUdp: {
    name: 'Death Pact',
    description:
      'Kills a target friendly Undead unit, giving a percentage of its hit points to the Death Knight.',
    manaCost: 50,
    cooldown: 15,
    range: 800,
    stats: [
      {
        label: 'Hit Points',
        values: ['100', '200', '300 % of HP'],
      },
    ],
  },
  AUau: {
    name: 'Unholy Aura',
    description:
      'Increases the movement speed and life regeneration rate of nearby friendly units.',
    aoe: [900],
    stats: [
      {
        label: 'Movement speed',
        values: ['10', '15', '20 %'],
      },
      {
        label: 'Health regeneration',
        values: ['0.5', '1', '1.5 HP/sec'],
      },
    ],
  },
  AUcs: {
    name: 'Carrion Swarm',
    description: 'Sends a horde of bats to damage enemies.',
    manaCost: 100,
    cooldown: 10,
    range: 700,
    damage: [75, 135, 200],
    aoe: [100],
    stats: [
      {
        label: 'Damage Cap',
        values: ['400', '700', '1200'],
      },
    ],
  },
  AUin: {
    name: 'Inferno',
    description:
      'Calls an Infernal down from the sky, dealing 50 damage and stunning enemy land units for 4 seconds in an area. The Infernal lasts 180 seconds.',
    manaCost: 175,
    cooldown: 180,
    range: 900,
    aoe: [250],
    stats: [
      {
        label: 'Stun Duration (Hero)',
        values: ['4 (2) seconds'],
      },
      {
        label: 'Impact Damage',
        values: ['50'],
      },
      {
        label: 'Impact Delay',
        values: ['1 second'],
      },
      {
        label: 'Summon Duration',
        values: ['180 seconds'],
      },
    ],
  },
  AUsl: {
    name: 'Sleep',
    description:
      'Puts a target enemy unit to sleep. A sleeping unit can be awoken by attacking it.',
    manaCost: 80,
    cooldown: 4,
    range: 800,
    duration: 15,
    stats: [
      {
        label: 'Invulnerability Duration',
        values: ['2 seconds'],
      },
    ],
  },
  AUav: {
    name: 'Vampiric Aura',
    description: 'Nearby friendly melee units gain hit points when they hit a unit.',
    aoe: [900],
    stats: [
      {
        label: 'Lifesteal',
        values: ['20', '35', '50 %'],
      },
    ],
  },
  AUfn: {
    name: 'Frost Nova',
    description:
      'Blasts enemy units around a target enemy unit with a wave of damaging frost that slows movement and attack rate.',
    manaCost: 125,
    cooldown: 8,
    range: 750,
    duration: 4,
    aoe: [200],
    stats: [
      {
        label: 'Target damage',
        values: ['100'],
      },
      {
        label: 'Nova damage',
        values: ['50', '100', '150'],
      },
      {
        label: 'Movement Speed',
        values: ['-50%'],
      },
      {
        label: 'Attack Speed',
        values: ['-25%'],
      },
    ],
  },
  AUfa: {
    name: 'Frost Armor',
  },
  AUfu: {
    name: 'Frost Armor',
    description:
      'Creates a shield of frost around a target friendly unit. The shield adds armor and slows melee units that attack it.',
    manaCost: 40,
    cooldown: 2,
    range: 800,
    stats: [
      {
        label: 'Armor',
        values: ['3', '5', '7'],
      },
      {
        label: 'Armor Duration',
        values: ['45 seconds'],
      },
      {
        label: 'Slow Duration',
        values: ['3', '5', '7 seconds'],
      },
      {
        label: 'Movement Speed',
        values: ['-50%'],
      },
      {
        label: 'Attack Speed',
        values: ['-25%'],
      },
    ],
  },
  AUdr: {
    name: 'Dark Ritual',
    description:
      'Sacrifices a target friendly Undead unit to convert its hit points into mana for the Lich.',
    manaCost: 25,
    cooldown: 20,
    range: 800,
    stats: [
      {
        label: 'Mana',
        values: ['33', '55', '80 % of HP'],
      },
    ],
  },
  AUdd: {
    name: 'Death and Decay',
    description:
      'Damages everything in its area of effect by 4% of its base hit points per second.',
    manaCost: 200,
    cooldown: 150,
    range: 1000,
    duration: 35,
    aoe: [300],
  },
  AUim: {
    name: 'Impale',
    description:
      "Slams the ground with the Crypt Lord's massive claws, shooting spiked tendrils out in a straight line, dealing damage and hurling enemy ground units into the air in their wake, stunning them.",
    manaCost: 90,
    cooldown: 9,
    range: 700,
    duration: 2,
    damage: [60, 105, 150],
    aoe: [125],
    stats: [
      {
        label: 'Wave Distance',
        values: ['600'],
      },
      {
        label: 'Air Duration',
        values: ['1 second'],
      },
    ],
  },
  AUts: {
    name: 'Spiked Carapace',
    description:
      'The Crypt Lord forms barbed layers of chitinous armor that increases its defence and returns damage to enemy melee attackers.',
    stats: [
      {
        label: 'Damage returned',
        values: ['15', '30', '45%'],
      },
      {
        label: 'Bonus Armor',
        values: ['4', '8', '12'],
      },
    ],
  },
  AUcb: {
    name: 'Carrion Beetles',
    description:
      "The Crypt Lord progenerates 2 Carrion Beetles from a target corpse to attack the Crypt Lord's enemies. Beetles are permanent but only 6 can be controlled at a time.",
    manaCost: 50,
    cooldown: 9,
    aoe: [900],
  },
  AUls: {
    name: 'Locust Swarm',
    description:
      'Creates a swarm of angry locusts that bite and tear at nearby enemy units. As they chew the enemy flesh, they convert it into a substance that restores hit points to the Crypt Lord when they return.',
    manaCost: 150,
    cooldown: 180,
    duration: 30,
    aoe: [800],
    stats: [
      {
        label: 'Summon Count',
        values: ['20'],
      },
    ],
  },
  ANbf: {
    name: 'Breath of Fire',
    description:
      'Breathes a cone of fire at enemy units which deals damage. Units that have Drunken Haze on them will ignite and take burn damage over time.',
    manaCost: 75,
    cooldown: 10,
    range: 375,
    duration: 5,
    damage: [80, 130, 180],
    aoe: [175],
    stats: [
      {
        label: 'Max Damage',
        values: ['600', '900', '1200'],
      },
      {
        label: 'Burn Damage',
        values: ['10', '15', '25 per second'],
      },
      {
        label: 'Distance',
        values: ['675'],
      },
    ],
  },
  ANdb: {
    name: 'Drunken Brawler',
    description:
      'Gives a percent chance to avoid attacks and a 10% chance to deal additional damage.',
    stats: [
      {
        label: 'Miss Chance',
        values: ['7', '14', '21%'],
      },
      {
        label: 'Damage Multiplier',
        values: ['2', '3', '4'],
      },
      {
        label: 'Crit Chance',
        values: ['10%'],
      },
    ],
  },
  ANdh: {
    name: 'Drunken Haze',
    description:
      'Drenches a target enemy unit in alcohol, causing its movement speed to be reduced, and have a chance to miss on attacks. When units with Drunken Haze cast on them are hit by Breath of Fire, they will ignite and take burn damage over time.',
    manaCost: 70,
    cooldown: 12,
    range: 550,
    duration: 12,
    aoe: [200],
    stats: [
      {
        label: 'Movement Speed',
        values: ['-15', '30', '50%'],
      },
      {
        label: 'Miss Chance',
        values: ['45', '65', '80%'],
      },
    ],
  },
  ANef: {
    name: 'Storm, Earth, and Fire',
    description:
      'Splits the Pandaren Brewmaster into elements, forming 3 specialized warriors. If any of them survive until the end of their summoned timer, the Brewmaster is reborn.',
    manaCost: 150,
    cooldown: 180,
    duration: 45,
  },
  ANdr: {
    name: 'Life Drain',
    description:
      'Absorbs the life essence of a target enemy unit by taking hit points from it every second and giving them to the Dark Ranger.\nCan be used on friendly units to heal them by taking hit points from Dark Ranger every second and giving them to the selected unit.\nAlso applies the current rank of the Black Arrow debuff to the target.',
    manaCost: 30,
    cooldown: 8,
    range: 600,
    duration: 8,
    aoe: [700],
    stats: [
      {
        label: 'Hit Points Drained',
        values: ['30', '45', '60 per second'],
      },
    ],
  },
  ANsi: {
    name: 'Silence',
    description:
      'Stops all enemies in a target area from casting spells. The area of effect and duration increase with level.',
    manaCost: 75,
    cooldown: 15,
    range: 900,
    duration: 16,
    aoe: [200, 275, 350],
  },
  ANba: {
    name: 'Black Arrow',
    description:
      'Adds extra damage to attacks. Units killed while under the effect of Black Arrow will turn into Dark Minions.',
    manaCost: 6,
    range: 600,
    stats: [
      {
        label: 'Bonus damage',
        values: ['2', '10', '20'],
      },
      {
        label: 'Effect Duration',
        values: ['2 s'],
      },
      {
        label: 'Summon Duration',
        values: ['80 s'],
      },
    ],
  },
  ANch: {
    name: 'Charm',
    description:
      'Takes control of a target enemy unit. Charm cannot be used on Heroes, or creeps above level 5.',
    manaCost: 150,
    cooldown: 45,
    range: 700,
  },
  ANms: {
    name: 'Mana Shield',
    description:
      "Creates a shield that absorbs damage by using the Sea Witch's mana. Blocks 100% of incoming damage.",
    manaCost: 10,
    cooldown: 10,
    stats: [
      {
        label: 'Damage Absorbed',
        values: ['2', '3', '4 per point of mana'],
      },
    ],
  },
  ANfa: {
    name: 'Frost Arrows',
    description:
      "Adds a cold effect to each attack, slowing a target enemy unit's attacks and movement.",
    manaCost: 10,
    range: 600,
    stats: [
      {
        label: 'Bonus Damage',
        values: ['5', '10', '15'],
      },
      {
        label: 'Duration',
        values: ['5 (1.5) s'],
      },
      {
        label: 'Movement Speed',
        values: ['-30', '50', '70%'],
      },
      {
        label: 'Attack Speed',
        values: ['-30', '50', '70%'],
      },
    ],
  },
  ANfl: {
    name: 'Forked Lightning',
    description: 'Calls forth a cone of lightning to damage enemies. Hits a maximum of 3 units.',
    manaCost: 110,
    cooldown: 11,
    range: 600,
    damage: [85, 160, 250],
    stats: [
      {
        label: 'Target Count',
        values: ['3'],
      },
      {
        label: 'Max Distance',
        values: ['900'],
      },
    ],
  },
  ANto: {
    name: 'Tornado',
    description:
      "Summons a fierce controllable Tornado that slows enemy units' movement speed, randomly tosses enemy ground units into the air and damages enemy buildings. The Tornado does 100 damage per second to buildings under it, and 14 damage per second to buildings in its general vicinity. Lasts 20 seconds.",
    manaCost: 125,
    cooldown: 120,
    range: 900,
    duration: 20,
  },
  ANrf: {
    name: 'Rain of Fire',
    description:
      'Calls down waves of fire that damage units in an area. Each wave deals initial damage and then burns enemies for 3 seconds.',
    manaCost: 85,
    cooldown: 8,
    range: 800,
    duration: 3,
    aoe: [200],
    stats: [
      {
        label: 'Wave Damage',
        values: ['25', '30', '35'],
      },
      {
        label: 'Damage Cap',
        values: ['125', '150', '175'],
      },
      {
        label: 'Number of Waves',
        values: ['6', '8', '10'],
      },
      {
        label: 'Burn Damage',
        values: ['5', '10', '15 dmg/sec'],
      },
    ],
  },
  ANca: {
    name: 'Cleaving Attack',
    description:
      'The Pit Lord strikes with such force that he damages multiple enemies with his attack.',
    aoe: [250],
    stats: [
      {
        label: 'Splash Damage',
        values: ['40', '65', '90%'],
      },
    ],
  },
  ANht: {
    name: 'Howl of Terror',
    description:
      'The Pit Lord lets loose a terrifying howl that causes nearby enemy units to shiver in fear, reducing their attack damage.',
    manaCost: 75,
    cooldown: 12,
    duration: 15,
    aoe: [500],
    stats: [
      {
        label: 'Damage Reduction',
        values: ['30', '40', '50%'],
      },
    ],
  },
  ANdo: {
    name: 'Doom',
    description:
      'Marks a target unit for the manifestation of a Doom Guard. The afflicted unit will take 40 damage per second until it dies. Upon its death, a great Doom Guard will spawn from its corpse. Doom cannot be dispelled or canceled.',
    manaCost: 150,
    cooldown: 120,
    range: 650,
    stats: [
      {
        label: 'Damage per Second',
        values: ['40'],
      },
      {
        label: 'Movement Speed',
        values: ['-50%'],
      },
      {
        label: 'Summon Duration',
        values: ['120 seconds'],
      },
    ],
  },
  ANsg: {
    name: 'Summon Bear',
    description: 'Summons a powerful Bear to attack your enemies.',
    manaCost: 100,
    cooldown: 40,
    duration: 70,
  },
  ANsq: {
    name: 'Summon Quilbeast',
    description: 'Summons an angry Quilbeast to attack your enemies.',
    manaCost: 75,
    cooldown: 25,
    duration: 70,
  },
  ANsw: {
    name: 'Summon Hawk',
    description: 'Summons a proud Hawk to spy on your enemies.',
    manaCost: 50,
    cooldown: 70,
    duration: 70,
  },
  ANst: {
    name: 'Stampede',
    description:
      "Calls down hordes of rampaging thunder lizards to explode upon the Beastmaster's enemies. Each exploding lizard does 60 damage.",
    manaCost: 150,
    cooldown: 180,
    range: 300,
    duration: 30,
    damage: [60],
    aoe: [1000],
    stats: [
      {
        label: 'Collision Size',
        values: ['55'],
      },
      {
        label: 'Damage Area',
        values: ['275'],
      },
      {
        label: 'Beasts Per Second',
        values: ['2'],
      },
    ],
  },
  ANeg: {
    name: 'Engineering Upgrade',
    description:
      "Improves other Tinker abilities with each level learned, also gives bonus damage and increases the Tinker's movement speed.",
    stats: [
      {
        label: 'Damage Bonus',
        values: ['2', '4', '6'],
      },
      {
        label: 'Movement Speed',
        values: ['+ 10', '20', '30 %'],
      },
    ],
  },
  ANcs: {
    name: 'Cluster Rockets',
    description:
      'Bombards an area with rockets, stunning enemy units for 1 second and damaging nearby enemy units.',
    manaCost: 70,
    cooldown: 6,
    range: 800,
    duration: 1,
    damage: [11.25, 19.75, 30.5],
    stats: [
      {
        label: 'Damage Interval',
        values: ['0.25'],
      },
      {
        label: 'Missile Count',
        values: ['6', '12', '18'],
      },
      {
        label: 'Max Damage per Unit',
        values: ['45', '79', '122'],
      },
      {
        label: 'Max Damage',
        values: ['800', '1000', '1200'],
      },
      {
        label: 'Area of Effect',
        values: ['Depends on Level of Engineering Upgrade:\n200 / 230 / 260 / 290'],
      },
    ],
  },
  ANsy: {
    name: 'Pocket Factory',
    description:
      'Creates a factory which automatically constructs Clockwerk Goblins. Clockwerk Goblins explode upon death, causing damage to nearby enemy units.',
    manaCost: 125,
    cooldown: 35,
    range: 500,
    duration: 40,
    stats: [
      {
        label: 'Goblin Detonation Damage',
        values: ['30', '60', '80'],
      },
      {
        label: 'Spawn Interval',
        values: ['Depends on the level of Engineering Upgrade:\n4.5 / 4 / 3.5 / 3 seconds'],
      },
      {
        label: 'Summon Duration',
        values: ['12 seconds'],
      },
    ],
  },
  ANrg: {
    name: 'Robo-Goblin',
    description: 'Transforms the Tinker into a Robo-Goblin, a powerful armored form.',
    manaCost: 25,
    cooldown: 1,
    stats: [
      {
        label: 'Morph Duration',
        values: ['1.5 seconds'],
      },
      {
        label: 'Armor Bonus',
        values: ['Depends on Level of Engineering Upgrade:\n1 / 2 / 3 / 4'],
      },
      {
        label: 'Strength Bonus',
        values: ['Depends on Level of Engineering Upgrade:\n5 / 7 / 9 / 11'],
      },
    ],
  },
  ANic: {
    name: 'Incinerate',
  },
  ANia: {
    name: 'Incinerate',
    description:
      'Each attack made is enhanced with living flames that cling to the target. These flames add a small amount of damage on the first attack, twice as much on the second attack, three times as much on the third attack, etc. If the unit dies while under this effect, it is incinerated, causing significant damage to all nearby hostile units.',
    manaCost: 3,
    stats: [
      {
        label: 'Bonus Damage',
        values: ['2', '3', '4'],
      },
      {
        label: 'Effect Duration',
        values: ['4 s'],
      },
      {
        label: 'Incineration Damage',
        values: ['30', '45', '60'],
      },
      {
        label: 'Incineration Area',
        values: ['120 (full damage)', '240 (half damage)'],
      },
    ],
  },
  ANso: {
    name: 'Soul Burn',
    description:
      'Wreaths an enemy unit in magical flames which cause damage over time, prevent the casting of spells, and reduce attack damage by 75%.',
    manaCost: 65,
    cooldown: 12,
    range: 700,
    duration: 16,
    stats: [
      {
        label: 'Total Damage',
        values: ['80', '200', '340'],
      },
      {
        label: 'Damage per Second',
        values: ['5.00', '11.11', '17.00'],
      },
      {
        label: 'Attack Damage',
        values: ['-75%'],
      },
    ],
  },
  ANlm: {
    name: 'Summon Lava Spawn',
    description:
      'Summons a Lava Spawn, a resilient and deadly fire creature. As a Lava Spawn deals damage, it consumes the flesh of its target, eventually splitting into two healthy Lava Spawns.',
    manaCost: 150,
    cooldown: 32,
    duration: 70,
    stats: [
      {
        label: 'Attacks for Split',
        values: ['13'],
      },
      {
        label: 'Targets valid for Split',
        values: ['Enemy, Neutral, Air, Ground, Ward'],
      },
    ],
  },
  ANvc: {
    name: 'Volcano',
    description:
      'Causes the ground to erupt into a massive Volcano. Every 3 seconds, a wave of molten rocks is hurled from the Volcano at nearby ground units and buildings, causing 125 damage to each target and stunning it for 2 seconds. Buildings take 2 times more damage from molten rocks than units do.',
    manaCost: 200,
    cooldown: 180,
    range: 800,
    duration: 15,
    aoe: [500],
    stats: [
      {
        label: 'Full Damage',
        values: ['125'],
      },
      {
        label: 'Stun Duration (Hero)',
        values: ['2 (1) seconds'],
      },
      {
        label: 'Number of Waves',
        values: ['5'],
      },
      {
        label: 'Wave Interval',
        values: ['3 seconds'],
      },
    ],
  },
  ANhs: {
    name: 'Healing Spray',
    description: 'Sprays waves of healing mist that heals units in a target area.',
    manaCost: 75,
    cooldown: 6,
    range: 800,
    aoe: [250],
    stats: [
      {
        label: 'Amount per Wave',
        values: ['30', '45', '60'],
      },
      {
        label: 'Waves',
        values: ['3', '4', '5'],
      },
      {
        label: 'Heal cap per Wave',
        values: ['280', '385', '490'],
      },
    ],
  },
  ANab: {
    name: 'Acid Bomb',
    description:
      'Hurls a flask of acid at a target. The flask breaks upon impact, splashing a powerful acid on nearby hostile units. Decreases armor; deals slightly less damage over time to nearby targets.',
    manaCost: 75,
    cooldown: 12,
    range: 700,
    duration: 15,
    aoe: [200],
    stats: [
      {
        label: 'Armor Penalty',
        values: ['3', '4', '5'],
      },
      {
        label: 'Target Damage',
        values: ['5', '10', '17 per second'],
      },
      {
        label: 'Secondary Damage',
        values: ['3', '6', '11 per second'],
      },
    ],
  },
  ANcr: {
    name: 'Chemical Rage',
    description:
      'The Alchemist causes his Ogre to enter a chemically induced rage, increasing movement rate by 40% and increasing attack rate.',
    manaCost: 25,
    cooldown: 30,
    duration: 15,
    stats: [
      {
        label: 'Attack Rate % Bonus',
        values: ['25', '75', '125'],
      },
      {
        label: 'Movement Speed',
        values: ['40%'],
      },
      {
        label: 'Transform Duration',
        values: ['0.35 seconds'],
      },
    ],
  },
  ANtm: {
    name: 'Transmute',
    description:
      'Kills a target unit instantly, transforming it into gold which is added to your available gold!\nTransmute cannot be used on Heroes, or creeps above level 5.',
    manaCost: 150,
    cooldown: 45,
    range: 650,
    stats: [
      {
        label: 'Gold',
        values: ["100% of target unit's gold cost."],
      },
    ],
  },
  Aadm: {
    name: 'Abolish Magic',
    description:
      'Dispels positive buffs from enemy units, and negative buffs from friendly units. Deals 250 damage to summoned units.',
    manaCost: 50,
    cooldown: 1,
    range: 500,
    stats: [
      {
        label: 'Damage to summons',
        values: ['250'],
      },
    ],
  },
  Aam2: {
    name: 'Anti-magic Shell',
    description:
      'Creates a barrier that stops 300 points of spell or magic damage from affecting a target unit.',
    manaCost: 75,
    range: 500,
    duration: 90,
    stats: [
      {
        label: 'Damage Absorbed',
        values: ['300'],
      },
      {
        label: 'Upgrade required',
        values: ['Banshee Adept Training'],
      },
    ],
  },
  Aast: {
    name: 'Ancestral Spirit',
    description:
      'Raises a fallen non-Hero Tauren from the dead. The Tauren is revived with 100% of its hit points restored.',
    manaCost: 250,
    cooldown: 30,
    range: 350,
    stats: [
      {
        label: 'Hit Points',
        values: ['100%'],
      },
      {
        label: 'Mana Points',
        values: ['25%'],
      },
      {
        label: 'Upgrade required',
        values: ['Spirit Walker Master Training'],
      },
    ],
  },
  Ablo: {
    name: 'Bloodlust',
    description: "Increases a friendly unit's attack rate by 40% and movement speed by 25%.",
    manaCost: 35,
    cooldown: 1,
    range: 600,
    duration: 60,
    stats: [
      {
        label: 'Attack Speed',
        values: ['40%'],
      },
      {
        label: 'Movement Speed',
        values: ['25%'],
      },
      {
        label: 'Upgrade required',
        values: ['Shaman Master Training'],
      },
    ],
  },
  Acmg: {
    name: 'Control Magic',
    description:
      "Give Spell Breakers the ability to take control of enemy summoned units. The spell's cost is relative to the current hit points of the target.",
    manaCost: 40,
    cooldown: 5,
    range: 700,
    stats: [
      {
        label: 'Mana Cost',
        values: ['0.35 per HP of target'],
      },
    ],
  },
  Acri: {
    name: 'Cripple',
    description:
      'Reduces movement speed by 75%, attack rate by 50%, and damage by 50% of a target enemy unit.',
    manaCost: 90,
    cooldown: 10,
    range: 600,
    duration: 60,
    stats: [
      {
        label: 'Movement Speed',
        values: ['-75%'],
      },
      {
        label: 'Attack Speed',
        values: ['-50%'],
      },
      {
        label: 'Damage',
        values: ['-50%'],
      },
      {
        label: 'Upgrade Required',
        values: ['Necromancer Master Training'],
      },
    ],
  },
  Acrs: {
    name: 'Curse',
    description:
      'Curses a target enemy unit, causing it to have a 33% chance to miss on an attack.',
    manaCost: 40,
    cooldown: 1,
    range: 700,
    duration: 60,
    stats: [
      {
        label: 'Miss Chance',
        values: ['33%'],
      },
    ],
  },
  Acyc: {
    name: 'Cyclone',
    description:
      'Tosses a target enemy unit into the air, rendering it unable to move, attack or cast spells, and stopping others from attacking or casting on it.',
    manaCost: 150,
    cooldown: 5,
    range: 600,
    duration: 20,
    stats: [
      {
        label: 'Required upgrade',
        values: ['Druid of the Talon Master Training'],
      },
    ],
  },
  Adcn: {
    name: 'Disenchant',
    description:
      'Removes all buffs from units in a target area. Deals 250 damage to hostile summoned units.',
    manaCost: 100,
    cooldown: 0,
    range: 650,
    aoe: [250],
    stats: [
      {
        label: 'Damage to summons',
        values: ['250'],
      },
      {
        label: 'Upgrade required',
        values: ['Spirit Walker Adept Training'],
      },
    ],
  },
  Adis: {
    name: 'Dispel Magic',
    description:
      'Removes all buffs from units in a target area. Deals 200 damage to summoned units.',
    manaCost: 75,
    cooldown: 5,
    range: 700,
    aoe: [200],
    stats: [
      {
        label: 'Damage to summons',
        values: ['200'],
      },
      {
        label: 'Upgrade required',
        values: ['Priest Adept Training'],
      },
    ],
  },
  Aeye: {
    name: 'Sentry Ward',
    description:
      'Summons an invisible and immovable magic immune ward that provides vision in an area. Can see invisible units. Lasts 600 seconds.',
    manaCost: 50,
    cooldown: 0,
    range: 500,
    duration: 600,
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
  Afae: {
    name: 'Faerie Fire',
    description: "Reduces a target enemy unit's armor by 4 and gives vision of that unit.",
    manaCost: 45,
    cooldown: 1,
    range: 700,
    duration: 70,
    stats: [
      {
        label: 'Armor Reduction',
        values: ['4'],
      },
    ],
  },
  Afbk: {
    name: 'Feedback',
    description:
      'Spell Breaker attacks destroy 20 (4 to Heroes) Mana per hit. The Mana combusts, dealing damage to the attacked unit. Each point so removed causes 1 point of damage to the target. Feedback does not affect spell-immune units.',
    stats: [
      {
        label: 'Mana Burned (Hero)',
        values: ['20 (4)'],
      },
      {
        label: 'Damage',
        values: ['1 per Mana point burned'],
      },
    ],
  },
  Ahea: {
    name: 'Heal',
    description: 'Heals a target friendly non-mechanical wounded unit for 25 hit points.',
    manaCost: 5,
    cooldown: 1.1,
    range: 350,
    stats: [
      {
        label: 'Heal',
        values: ['25 HP'],
      },
    ],
  },
  Ahwd: {
    name: 'Healing Ward',
    description:
      "Summons an immovable ward that heals 2% of a nearby friendly non-mechanical unit's hit points per second. Wards are spell immune.",
    manaCost: 150,
    cooldown: 0,
    range: 500,
    duration: 25,
    aoe: [450],
    stats: [
      {
        label: 'Heal Amount',
        values: ['2% of max HP/sec'],
      },
      {
        label: 'Hit Points',
        values: ['5'],
      },
      {
        label: 'Upgrade required',
        values: ['Witch Doctor Master Training'],
      },
    ],
  },
  Ainf: {
    name: 'Inner Fire',
    description: "Increases a target friendly unit's damage by 10% and armor by 5.",
    manaCost: 35,
    cooldown: 1,
    range: 500,
    duration: 60,
    stats: [
      {
        label: 'Armor Bonus',
        values: ['5'],
      },
      {
        label: 'Damage Bonus',
        values: ['10%'],
      },
      {
        label: 'Upgrade required',
        values: ['Priest Master Training'],
      },
    ],
  },
  Aivs: {
    name: 'Invisibility',
    description:
      'Makes a target unit invisible. If the unit attacks, uses an ability or casts a spell, it will become visible.',
    manaCost: 50,
    range: 400,
    duration: 120,
    stats: [
      {
        label: 'Upgrade required',
        values: ['Sorceress Adept Training'],
      },
    ],
  },
  Alsh: {
    name: 'Lightning Shield',
    description:
      'Forms a shield of electricity around a target unit, dealing 20 damage per second to units around it. Lasts 20 seconds.',
    manaCost: 100,
    cooldown: 3,
    range: 600,
    duration: 20,
    aoe: [160],
    stats: [
      {
        label: 'Damage',
        values: ['20 per second'],
      },
      {
        label: 'Upgrade required',
        values: ['Shaman Adept Training'],
      },
    ],
  },
  Amfl: {
    name: 'Mana Flare',
    description:
      "Causes the Faerie Dragon to channel negative magical energies that damage nearby enemies when they cast spells. Also increases the Faerie Dragon's armor by 12.",
    manaCost: 50,
    cooldown: 20,
    duration: 30,
    aoe: [750],
    stats: [
      {
        label: 'Damage per Mana Point (Hero)',
        values: ['4 (1)'],
      },
      {
        label: 'Max Damage (Hero)',
        values: ['80 (50)'],
      },
      {
        label: 'Splash Radius',
        values: ['200'],
      },
      {
        label: 'Damage Interval',
        values: ['0.75 seconds'],
      },
      {
        label: 'Armor Bonus',
        values: ['12'],
      },
    ],
  },
  Apg2: {
    name: 'Purge',
    description:
      'Removes all buffs from a target unit. Enemy units are also immobilized for 3 seconds and their movement speed is reduced by a factor of 5; they will slowly regain their movement speed over 15 seconds. Deals 400 damage to summoned units.',
    manaCost: 65,
    cooldown: 1,
    range: 700,
    duration: 15,
    stats: [
      {
        label: 'Paralyze duration',
        values: ['3 (1) seconds'],
      },
      {
        label: 'Damage to summons',
        values: ['400'],
      },
    ],
  },
  Aply: {
    name: 'Polymorph',
    description:
      'Turns a target enemy unit into a sheep or flying sheep. The targeted unit retains its hit points, but cannot attack. Cannot be cast on Summoned units.',
    manaCost: 200,
    cooldown: 3,
    range: 500,
    duration: 60,
    stats: [
      {
        label: 'Upgrade required',
        values: ['Sorceress Master Training'],
      },
    ],
  },
  Aps2: {
    name: 'Possession',
    description:
      "Stuns a target unit and the Banshee for 4 seconds, during which the Banshee takes extra damage from attacks. She then displaces the soul of the enemy, giving you permanent control of it, but destroying the caster's body. Possession cannot be used on flying units, Heroes, or creeps above level 5.",
    manaCost: 250,
    range: 350,
    duration: 4.5,
    stats: [
      {
        label: 'Damage Bonus',
        values: ['66%'],
      },
      {
        label: 'Upgrade required',
        values: ['Banshee Master Training'],
      },
    ],
  },
  Apsh: {
    name: 'Phase Shift',
    description:
      'Causes this unit to shift out of existence whenever it takes damage. While out of existence, this creature cannot: attack, move, cast spells, be attacked, or have spells cast upon it.',
    manaCost: 25,
    cooldown: 6.5,
    duration: 1.5,
  },
  Arai: {
    name: 'Raise Dead',
    description: 'Raises 2 Skeletons from a target corpse.',
    manaCost: 75,
    cooldown: 8,
    range: 600,
    duration: 45,
    stats: [
      {
        label: 'Summon Count',
        values: ['2'],
      },
    ],
  },
  Arej: {
    name: 'Rejuvenation',
    description: 'Heals a target friendly unit for 400 hit points over 12 seconds.',
    manaCost: 125,
    cooldown: 1,
    range: 400,
    duration: 12,
    stats: [
      {
        label: 'Hit Points Healed',
        values: ['400'],
      },
      {
        label: 'Required upgrade',
        values: ['Druid of the Claw Adept Training'],
      },
    ],
  },
  Aroa: {
    name: 'Roar',
    description: 'Gives friendly units around the Druid a 25% bonus to damage.',
    manaCost: 100,
    duration: 45,
    aoe: [500],
    stats: [
      {
        label: 'Damage Bonus',
        values: ['25%'],
      },
    ],
  },
  Arpl: {
    name: 'Essence of Blight',
    description: 'Restores 10 hit points to nearby friendly non-mechanical units.',
    manaCost: 10,
    cooldown: 1.5,
    duration: 1,
    aoe: [700],
    stats: [
      {
        label: 'Hit Points Healed',
        values: ['10'],
      },
      {
        label: 'Maximum Targets',
        values: ['6'],
      },
    ],
  },
  Arpm: {
    name: 'Spirit Touch',
    description: 'Restores 2 mana to nearby friendly non-mechanical units.',
    manaCost: 10,
    cooldown: 1.5,
    duration: 1,
    aoe: [700],
    stats: [
      {
        label: 'Mana Restored',
        values: ['2'],
      },
      {
        label: 'Maximum Targets',
        values: ['6'],
      },
    ],
  },
  Aslo: {
    name: 'Slow',
    description: "Slows a target enemy unit's attack rate by 25% and movement speed by 55%.",
    manaCost: 50,
    cooldown: 1,
    range: 700,
    duration: 45,
    stats: [
      {
        label: 'Movement Speed',
        values: ['-55%'],
      },
      {
        label: 'Attack Speed',
        values: ['-25%'],
      },
    ],
  },
  Aspl: {
    name: 'Spirit Link',
    description:
      'Links 4 units together in a chain. All units with Spirit Link on them will live longer, by distributing 50% of the damage they take across other Spirit Linked units.',
    manaCost: 75,
    cooldown: 0,
    range: 750,
    duration: 75,
    stats: [
      {
        label: 'Units linked',
        values: ['4'],
      },
      {
        label: 'Damage distributed',
        values: ['50%'],
      },
    ],
  },
  Aspo: {
    name: 'Slow Poison',
    description:
      'A poison attack that deals 4 damage per second, and slows the target enemies movement by 50% and attack by 25% for 5 seconds (1 second Heroes).',
    duration: 5,
  },
  Asps: {
    name: 'Spell Steal',
    description:
      'Steals a positive buff from an enemy unit and applies it to a nearby friendly unit, or takes a negative buff from a friendly unit and applies it to a nearby enemy unit.',
    manaCost: 75,
    cooldown: 6,
    range: 700,
  },
  Asta: {
    name: 'Stasis Trap Ward',
    description:
      'Summons an invisible and immovable magic immune ward that stuns enemy units around it. The trap activates when an enemy unit approaches. The traps lasts 150 seconds. The stun lasts 4 (2) seconds.',
    manaCost: 100,
    cooldown: 0,
    range: 500,
    duration: 150,
    stats: [
      {
        label: 'Activation Delay',
        values: ['7 seconds'],
      },
      {
        label: 'Detection Radius',
        values: ['175'],
      },
      {
        label: 'Detonation Radius',
        values: ['350'],
      },
      {
        label: 'Stun Duration',
        values: ['4 (2) seconds'],
      },
      {
        label: 'Hit Points',
        values: ['25'],
      },
      {
        label: 'Upgrade required',
        values: ['Witch Doctor Adept Training'],
      },
    ],
  },
  Auhf: {
    name: 'Unholy Frenzy',
    description:
      'Increases the attack rate of a target unit by 75%, but drains 2 hit points per second. Last 45 seconds.',
    manaCost: 50,
    cooldown: 1,
    range: 500,
    duration: 45,
    stats: [
      {
        label: 'Attack Speed',
        values: ['75%'],
      },
      {
        label: 'Damage',
        values: ['2 per second'],
      },
      {
        label: 'Upgrade Required',
        values: ['Necromancer Adept Training'],
      },
    ],
  },
}
