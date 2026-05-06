// ---------------------------------------------------------------------------
// Warcraft III unit and hero reference data
// ---------------------------------------------------------------------------

export interface UnitData {
  name: string
  supply: number
  gold: number
  lumber: number
}

export const UNITS: Record<string, UnitData> = {
  // Human
  hpea: { name: 'Peasant', supply: 1, gold: 75, lumber: 0 },
  hmil: { name: 'Militia', supply: 1, gold: 75, lumber: 0 },
  hfoo: { name: 'Footman', supply: 2, gold: 135, lumber: 0 },
  hrif: { name: 'Rifleman', supply: 3, gold: 205, lumber: 30 },
  hkni: { name: 'Knight', supply: 4, gold: 245, lumber: 60 },
  hmpr: { name: 'Priest', supply: 2, gold: 135, lumber: 10 },
  hsor: { name: 'Sorceress', supply: 2, gold: 155, lumber: 20 },
  hspt: { name: 'Spellbreaker', supply: 3, gold: 215, lumber: 30 },
  hgyr: { name: 'Flying Machine', supply: 1, gold: 90, lumber: 30 },
  hmtm: { name: 'Mortar Team', supply: 3, gold: 180, lumber: 70 },
  hmtt: { name: 'Siege Engine', supply: 3, gold: 195, lumber: 60 },
  hgry: { name: 'Gryphon Rider', supply: 4, gold: 280, lumber: 70 },
  hdhw: { name: 'Dragonhawk Rider', supply: 3, gold: 200, lumber: 30 },
  hwel: { name: 'Water Elemental', supply: 0, gold: 0, lumber: 0 },
  // Orc
  opeo: { name: 'Peon', supply: 1, gold: 75, lumber: 0 },
  ogru: { name: 'Grunt', supply: 3, gold: 200, lumber: 0 },
  ohun: { name: 'Troll Headhunter', supply: 2, gold: 135, lumber: 20 },
  otbk: { name: 'Troll Berserker', supply: 2, gold: 135, lumber: 20 },
  oshm: { name: 'Shaman', supply: 2, gold: 130, lumber: 20 },
  odoc: { name: 'Troll Witch Doctor', supply: 2, gold: 145, lumber: 25 },
  orai: { name: 'Raider', supply: 3, gold: 180, lumber: 40 },
  ospw: { name: 'Spirit Walker', supply: 3, gold: 195, lumber: 35 },
  osw1: { name: 'Spirit Wolf', supply: 0, gold: 0, lumber: 0 },
  otbr: { name: 'Troll Batrider', supply: 2, gold: 160, lumber: 40 },
  ocat: { name: 'Demolisher', supply: 4, gold: 220, lumber: 50 },
  okod: { name: 'Kodo Beast', supply: 4, gold: 255, lumber: 60 },
  owyv: { name: 'Wind Rider', supply: 4, gold: 265, lumber: 40 },
  otau: { name: 'Tauren', supply: 5, gold: 280, lumber: 80 },
  // Undead
  uaco: { name: 'Acolyte', supply: 1, gold: 75, lumber: 0 },
  ushd: { name: 'Shade', supply: 1, gold: 0, lumber: 0 },
  ugho: { name: 'Ghoul', supply: 2, gold: 120, lumber: 0 },
  ugar: { name: 'Gargoyle', supply: 2, gold: 185, lumber: 30 },
  uban: { name: 'Banshee', supply: 2, gold: 155, lumber: 30 },
  unec: { name: 'Necromancer', supply: 2, gold: 145, lumber: 20 },
  ucry: { name: 'Crypt Fiend', supply: 3, gold: 215, lumber: 40 },
  uobs: { name: 'Obsidian Statue', supply: 3, gold: 200, lumber: 35 },
  uabo: { name: 'Abomination', supply: 4, gold: 240, lumber: 70 },
  umtw: { name: 'Meat Wagon', supply: 4, gold: 230, lumber: 50 },
  ubsp: { name: 'Destroyer', supply: 5, gold: 0, lumber: 0 },
  ufro: { name: 'Frost Wyrm', supply: 7, gold: 385, lumber: 120 },
  uskw: { name: 'Skeleton Warrior', supply: 0, gold: 0, lumber: 0 },
  uskm: { name: 'Skeletal Mage', supply: 0, gold: 0, lumber: 0 },
  ucrb: { name: 'Carrion Beetle', supply: 0, gold: 0, lumber: 0 },
  // Night Elf
  ewsp: { name: 'Wisp', supply: 1, gold: 60, lumber: 0 },
  earc: { name: 'Archer', supply: 2, gold: 130, lumber: 10 },
  edot: { name: 'Druid of the Talon', supply: 2, gold: 135, lumber: 20 },
  ehip: { name: 'Hippogryph', supply: 2, gold: 160, lumber: 20 },
  efdr: { name: 'Faerie Dragon', supply: 2, gold: 155, lumber: 25 },
  esen: { name: 'Huntress', supply: 3, gold: 195, lumber: 20 },
  edry: { name: 'Dryad', supply: 3, gold: 145, lumber: 60 },
  ebal: { name: 'Glaive Thrower', supply: 3, gold: 210, lumber: 65 },
  edoc: { name: 'Druid of the Claw', supply: 4, gold: 255, lumber: 80 },
  ehir: { name: 'Hippogryph Rider', supply: 4, gold: 0, lumber: 0 },
  echm: { name: 'Chimaera', supply: 5, gold: 330, lumber: 70 },
  emtg: { name: 'Mountain Giant', supply: 7, gold: 425, lumber: 100 },
  ensw: { name: 'Sentry Ward', supply: 0, gold: 0, lumber: 0 },
  etrt: { name: 'Treant', supply: 0, gold: 0, lumber: 0 },
  // NE buildings that appear as units
  eaow: { name: 'Ancient of War', supply: 0, gold: 0, lumber: 0 },
  eaol: { name: 'Ancient of Lore', supply: 0, gold: 0, lumber: 0 },
  eawn: { name: 'Ancient of Wind', supply: 0, gold: 0, lumber: 0 },
  etol: { name: 'Tree of Life', supply: 0, gold: 0, lumber: 0 },
  etoa: { name: 'Tree of Ages', supply: 0, gold: 0, lumber: 0 },
  etoe: { name: 'Tree of Eternity', supply: 0, gold: 0, lumber: 0 },
  emwl: { name: 'Moon Well', supply: 0, gold: 0, lumber: 0 },
  ehhl: { name: "Hunter's Hall", supply: 0, gold: 0, lumber: 0 },
  eale: { name: 'Altar of Elders', supply: 0, gold: 0, lumber: 0 },
  eawo: { name: 'Ancient of Wonders', supply: 0, gold: 0, lumber: 0 },
  // Neutral — Goblin Laboratory
  ngir: { name: 'Goblin Shredder', supply: 4, gold: 375, lumber: 100 },
  ngsp: { name: 'Goblin Sapper', supply: 2, gold: 215, lumber: 100 },
  nzep: { name: 'Goblin Zeppelin', supply: 1, gold: 240, lumber: 60 },
  // Neutral — Mercenaries
  nass: { name: 'Assassin', supply: 3, gold: 260, lumber: 30 },
  nfgb: { name: 'Bloodfiend', supply: 2, gold: 240, lumber: 0 },
  nbdw: { name: 'Blue Dragonspawn Warrior', supply: 4, gold: 300, lumber: 0 },
  nskf: { name: 'Burning Archer', supply: 2, gold: 225, lumber: 25 },
  ncea: { name: 'Centaur Archer', supply: 2, gold: 150, lumber: 10 },
  ncen: { name: 'Centaur Outrunner', supply: 3, gold: 195, lumber: 0 },
  ndtb: { name: 'Dark Troll Berserker', supply: 3, gold: 245, lumber: 30 },
  ndtp: { name: 'Dark Troll Shadow Priest', supply: 2, gold: 175, lumber: 10 },
  ndrm: { name: 'Draenei Disciple', supply: 2, gold: 195, lumber: 10 },
  nftb: { name: 'Forest Troll Berserker', supply: 3, gold: 245, lumber: 30 },
  nfsh: { name: 'Forest Troll High Priest', supply: 4, gold: 305, lumber: 40 },
  nfsp: { name: 'Forest Troll Shadow Priest', supply: 2, gold: 195, lumber: 10 },
  nrvs: { name: 'Frost Revenant', supply: 3, gold: 255, lumber: 30 },
  nwlg: { name: 'Giant Wolf', supply: 3, gold: 215, lumber: 0 },
  ngnb: { name: 'Gnoll Brute', supply: 2, gold: 140, lumber: 0 },
  ngnw: { name: 'Gnoll Warden', supply: 2, gold: 180, lumber: 20 },
  nhrw: { name: 'Harpy Windwitch', supply: 2, gold: 240, lumber: 30 },
  nits: { name: 'Ice Troll Berserker', supply: 3, gold: 245, lumber: 30 },
  nitp: { name: 'Ice Troll Priest', supply: 2, gold: 175, lumber: 10 },
  nkog: { name: 'Kobold Geomancer', supply: 2, gold: 215, lumber: 30 },
  nkol: { name: 'Kobold Taskmaster', supply: 4, gold: 320, lumber: 50 },
  nkot: { name: 'Kobold Tunneler', supply: 2, gold: 150, lumber: 0 },
  nmbg: { name: "Mur'gul Blood-Gill", supply: 2, gold: 195, lumber: 10 },
  nmsn: { name: "Mur'gul Snarecaster", supply: 3, gold: 265, lumber: 30 },
  ngrk: { name: 'Mud Golem', supply: 2, gold: 145, lumber: 10 },
  nmfs: { name: 'Murloc Flesheater', supply: 2, gold: 140, lumber: 0 },
  nnwr: { name: 'Nerubian Seer', supply: 4, gold: 320, lumber: 50 },
  nnwa: { name: 'Nerubian Warrior', supply: 2, gold: 205, lumber: 0 },
  nomg: { name: 'Ogre Magi', supply: 4, gold: 320, lumber: 50 },
  nogm: { name: 'Ogre Mauler', supply: 4, gold: 300, lumber: 50 },
  nqbh: { name: 'Quillboar Hunter', supply: 2, gold: 215, lumber: 20 },
  nrog: { name: 'Rogue', supply: 2, gold: 150, lumber: 0 },
  nsts: { name: 'Satyr Shadowdancer', supply: 2, gold: 190, lumber: 20 },
  nsog: { name: 'Skeletal Orc Grunt', supply: 4, gold: 300, lumber: 0 },
  nsln: { name: 'Sludge Monstrosity', supply: 4, gold: 320, lumber: 50 },
  nssp: { name: 'Spitting Spider', supply: 2, gold: 235, lumber: 30 },
  nsrh: { name: 'Stormreaver Hermit', supply: 2, gold: 190, lumber: 20 },
  ntkh: { name: 'Tuskarr Healer', supply: 2, gold: 215, lumber: 10 },
  nubw: { name: 'Unbroken Darkweaver', supply: 4, gold: 320, lumber: 50 },
  nvdw: { name: 'Voidwalker', supply: 2, gold: 245, lumber: 30 },
  nowb: { name: 'Wildkin', supply: 3, gold: 195, lumber: 0 },
}

export interface ItemData {
  name: string
  gold: number
}

export const ITEM_BY_ID: Record<string, ItemData> = {
  // Consumables
  phea: { name: 'Potion of Healing', gold: 75 },
  pghe: { name: 'Potion of Greater Healing', gold: 100 },
  pman: { name: 'Potion of Mana', gold: 75 },
  pgma: { name: 'Potion of Greater Mana', gold: 100 },
  pres: { name: 'Potion of Restoration', gold: 350 },
  pinv: { name: 'Potion of Invisibility', gold: 75 },
  pgin: { name: 'Potion of Greater Invisibility', gold: 100 },
  pnvu: { name: 'Potion of Invulnerability', gold: 150 },
  pnvl: { name: 'Potion of Lesser Invulnerability', gold: 100 },
  pspd: { name: 'Potion of Speed', gold: 75 },
  pdiv: { name: 'Potion of Divinity', gold: 250 },
  pomn: { name: 'Potion of Omniscience', gold: 300 },
  pams: { name: 'Anti-magic Potion', gold: 150 },
  vamp: { name: 'Vampiric Potion', gold: 150 },
  hslv: { name: 'Healing Salve', gold: 100 },
  pclr: { name: 'Clarity Potion', gold: 75 },
  plcl: { name: 'Lesser Clarity Potion', gold: 50 },
  rej1: { name: 'Minor Replenishment Potion', gold: 75 },
  rej2: { name: 'Lesser Replenishment Potion', gold: 100 },
  rej3: { name: 'Replenishment Potion', gold: 150 },
  rej4: { name: 'Greater Replenishment Potion', gold: 200 },
  rej5: { name: 'Lesser Scroll of Replenishment', gold: 150 },
  rej6: { name: 'Greater Scroll of Replenishment', gold: 200 },
  // Scrolls / Glyphs
  stwp: { name: 'Scroll of Town Portal', gold: 90 },
  shea: { name: 'Scroll of Healing', gold: 150 },
  sman: { name: 'Scroll of Mana', gold: 150 },
  spro: { name: 'Scroll of Protection', gold: 150 },
  sres: { name: 'Scroll of Restoration', gold: 200 },
  shas: { name: 'Scroll of Speed', gold: 75 },
  sreg: { name: 'Scroll of Regeneration', gold: 150 },
  sand: { name: 'Scroll of Animate Dead', gold: 300 },
  srrc: { name: 'Scroll of Resurrection', gold: 250 },
  sror: { name: 'Scroll of the Beast', gold: 150 },
  scul: { name: 'Scroll of the Unholy Legion', gold: 300 },
  guvi: { name: 'Glyph of Ultravision', gold: 150 },
  gfor: { name: 'Glyph of Fortification', gold: 75 },
  gopr: { name: 'Glyph of Purification', gold: 100 },
  gomn: { name: 'Glyph of Omniscience', gold: 300 },
  // Stat items
  bspd: { name: 'Boots of Speed', gold: 150 },
  rde0: { name: 'Ring of Protection +1', gold: 50 },
  rde1: { name: 'Ring of Protection +2', gold: 75 },
  rde2: { name: 'Ring of Protection +3', gold: 100 },
  rde3: { name: 'Ring of Protection +4', gold: 150 },
  rde4: { name: 'Ring of Protection +5', gold: 200 },
  rat3: { name: 'Claws of Attack +3', gold: 100 },
  rat6: { name: 'Claws of Attack +6', gold: 200 },
  rat9: { name: 'Claws of Attack +9', gold: 300 },
  ratc: { name: 'Claws of Attack +12', gold: 450 },
  ratf: { name: 'Claws of Attack +15', gold: 600 },
  rag1: { name: 'Slippers of Agility +3', gold: 150 },
  rin1: { name: 'Mantle of Intelligence +3', gold: 150 },
  rst1: { name: 'Gauntlets of Ogre Strength +3', gold: 150 },
  ckng: { name: 'Crown of Kings +5', gold: 250 },
  belv: { name: "Boots of Quel'Thalas +6", gold: 300 },
  bgst: { name: 'Belt of Giant Strength +6', gold: 300 },
  ciri: { name: 'Robe of the Magi +6', gold: 300 },
  cnob: { name: 'Circlet of Nobility', gold: 50 },
  rlif: { name: 'Ring of Regeneration', gold: 200 },
  gcel: { name: 'Gloves of Haste', gold: 200 },
  evtl: { name: 'Talisman of Evasion', gold: 250 },
  prvt: { name: 'Periapt of Vitality', gold: 200 },
  manh: { name: 'Manual of Health', gold: 250 },
  pmna: { name: 'Pendant of Mana', gold: 150 },
  penr: { name: 'Pendant of Energy', gold: 350 },
  rhth: { name: "Khadgar's Gem of Health", gold: 150 },
  rwiz: { name: 'Sobi Mask', gold: 100 },
  crys: { name: 'Crystal Ball', gold: 150 },
  gemt: { name: 'Gem of True Seeing', gold: 250 },
  clsd: { name: 'Cloak of Shadows', gold: 200 },
  clfm: { name: 'Cloak of Flames', gold: 250 },
  nspi: { name: 'Necklace of Spell Immunity', gold: 150 },
  hcun: { name: 'Hood of Cunning', gold: 200 },
  mcou: { name: 'Medallion of Courage', gold: 200 },
  hval: { name: 'Helm of Valor', gold: 200 },
  // Orbs
  ofir: { name: 'Orb of Fire', gold: 200 },
  ofro: { name: 'Orb of Frost', gold: 200 },
  olig: { name: 'Orb of Lightning', gold: 200 },
  oli2: { name: 'Orb of Lightning', gold: 200 },
  oven: { name: 'Orb of Venom', gold: 200 },
  odef: { name: 'Orb of Darkness', gold: 200 },
  ocor: { name: 'Orb of Corruption', gold: 200 },
  oslo: { name: 'Orb of Slow', gold: 200 },
  // Artifacts / Unique
  modt: { name: 'Mask of Death', gold: 250 },
  amrc: { name: 'Amulet of Recall', gold: 150 },
  ankh: { name: 'Ankh of Reincarnation', gold: 125 },
  desc: { name: "Kelen's Dagger of Escape", gold: 125 },
  lhst: { name: 'The Lion Horn of Stormwind', gold: 175 },
  afac: { name: "Alleria's Flute of Accuracy", gold: 200 },
  ajen: { name: 'Ancient Janggo of Endurance', gold: 200 },
  lgdh: { name: 'Legion Doom-Horn', gold: 200 },
  sfog: { name: 'Horn of the Clouds', gold: 150 },
  ward: { name: 'Warsong Battle Drums', gold: 150 },
  gsou: { name: 'Soul Gem', gold: 150 },
  // Tomes
  tdex: { name: 'Tome of Agility', gold: 200 },
  tint: { name: 'Tome of Intelligence', gold: 200 },
  tstr: { name: 'Tome of Strength', gold: 200 },
  tkno: { name: 'Tome of Power', gold: 150 },
  texp: { name: 'Tome of Experience', gold: 100 },
  tgxp: { name: 'Tome of Greater Experience', gold: 100 },
  tst2: { name: 'Tome of Strength +2', gold: 300 },
  tin2: { name: 'Tome of Intelligence +2', gold: 300 },
  tdx2: { name: 'Tome of Agility +2', gold: 300 },
  tpow: { name: 'Tome of Knowledge', gold: 150 },
  tret: { name: 'Tome of Retraining', gold: 75 },
  // Wands / Staves / Rods
  will: { name: 'Wand of Illusion', gold: 100 },
  wneg: { name: 'Wand of Negation', gold: 100 },
  wneu: { name: 'Wand of Neutralization', gold: 200 },
  wlsd: { name: 'Wand of Lightning Shield', gold: 150 },
  wcyc: { name: 'Wand of the Wind', gold: 150 },
  rnec: { name: 'Rod of Necromancy', gold: 150 },
  ssil: { name: 'Staff of Silence', gold: 200 },
  kpin: { name: "Khadgar's Pipe of Insight", gold: 100 },
  sneg: { name: 'Staff of Negation', gold: 150 },
  stel: { name: 'Staff of Teleportation', gold: 150 },
  spre: { name: 'Staff of Preservation', gold: 100 },
  ssan: { name: 'Staff of Sanctuary', gold: 100 },
  // Wards / Mines
  wswd: { name: 'Sentry Wards', gold: 150 },
  whwd: { name: 'Healing Wards', gold: 150 },
  gobm: { name: 'Goblin Land Mines', gold: 150 },
  tels: { name: 'Goblin Night Scope', gold: 150 },
  dust: { name: 'Dust of Appearance', gold: 75 },
}

/** Display name keyed by fourcc unit id (e.g. 'hfoo' → 'Footman'). */
export const UNIT_NAME_BY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(UNITS).map(([id, u]) => [id, u.name]),
)

/** Supply cost keyed by fourcc unit id (e.g. 'hfoo' → 2). */
export const UNIT_SUPPLY_BY_ID: Record<string, number> = Object.fromEntries(
  Object.entries(UNITS).map(([id, u]) => [id, u.supply]),
)

/** Gold cost keyed by fourcc unit id (e.g. 'hfoo' → 135). */
export const UNIT_GOLD_BY_ID: Record<string, number> = Object.fromEntries(
  Object.entries(UNITS).map(([id, u]) => [id, u.gold]),
)

/** Lumber cost keyed by fourcc unit id (e.g. 'hfoo' → 0). */
export const UNIT_LUMBER_BY_ID: Record<string, number> = Object.fromEntries(
  Object.entries(UNITS).map(([id, u]) => [id, u.lumber]),
)

// ---------------------------------------------------------------------------
// Upgrade reference data (base cost = level 1 research cost)
// ---------------------------------------------------------------------------

interface UpgradeData {
  name: string
  gold: number
  lumber: number
}

export const UPGRADES_TECH: Record<string, UpgradeData> = {
  // Human
  Rhme: { name: 'Iron Forged Swords', gold: 75, lumber: 0 },
  Rhan: { name: 'Animal War Training', gold: 50, lumber: 25 },
  Rhar: { name: 'Iron Plating', gold: 75, lumber: 50 },
  Rhla: { name: 'Studded Leather Armor', gold: 75, lumber: 25 },
  Rhlh: { name: 'Improved Lumber Harvesting', gold: 125, lumber: 125 },
  Rhac: { name: 'Improved Masonry', gold: 50, lumber: 150 },
  Rhde: { name: 'Defend', gold: 50, lumber: 25 },
  Rhfc: { name: 'Flak Cannons', gold: 175, lumber: 100 },
  Rhfl: { name: 'Flare', gold: 100, lumber: 50 },
  Rhfs: { name: 'Fragmentation Shards', gold: 75, lumber: 25 },
  Rhgb: { name: 'Flying Machine Bombs', gold: 100, lumber: 125 },
  Rhhb: { name: 'Storm Hammers', gold: 100, lumber: 175 },
  Rhpm: { name: 'Backpack', gold: 100, lumber: 50 },
  Rhpt: { name: 'Priest Adept Training', gold: 100, lumber: 150 },
  Rhra: { name: 'Black Gunpowder', gold: 100, lumber: 75 },
  Rhri: { name: 'Long Rifles', gold: 150, lumber: 150 },
  Rhrt: { name: 'Barrage', gold: 50, lumber: 0 },
  Rhsb: { name: 'Sundering Blades', gold: 100, lumber: 50 },
  Rhse: { name: 'Magic Sentry', gold: 150, lumber: 150 },
  Rhss: { name: 'Spell Steal', gold: 100, lumber: 150 },
  Rhst: { name: 'Sorceress Adept Training', gold: 50, lumber: 75 },
  Rhcd: { name: 'Cloud', gold: 75, lumber: 75 },
  // Orc
  Roar: { name: 'Steel Armor', gold: 75, lumber: 0 },
  Robf: { name: 'Burning Oil', gold: 50, lumber: 75 },
  Robk: { name: 'Berserker Upgrade', gold: 75, lumber: 50 },
  Robs: { name: 'Brute Strength', gold: 150, lumber: 75 },
  Roen: { name: 'Ensnare', gold: 75, lumber: 0 },
  Rolf: { name: 'Liquid Fire', gold: 100, lumber: 125 },
  Rome: { name: 'Steel Melee Weapons', gold: 50, lumber: 150 },
  Ropg: { name: 'Pillage', gold: 50, lumber: 0 },
  Ropm: { name: 'Backpack', gold: 50, lumber: 75 },
  Rora: { name: 'Orc Ranged Attack', gold: 75, lumber: 0 },
  Rorb: { name: 'Reinforced Defenses', gold: 75, lumber: 50 },
  Rosp: { name: 'Spiked Barricades', gold: 100, lumber: 50 },
  Rost: { name: 'Shaman Adept Training', gold: 100, lumber: 50 },
  Rotr: { name: 'Troll Regeneration', gold: 75, lumber: 50 },
  Rovs: { name: 'Envenomed Spears', gold: 100, lumber: 50 },
  Rowd: { name: 'Witch Doctor Adept Training', gold: 100, lumber: 50 },
  Rows: { name: 'Pulverize', gold: 100, lumber: 150 },
  Rowt: { name: 'Sprit Walker Adept Training', gold: 100, lumber: 150 },
  // Undead
  Ruac: { name: 'Cannibalism', gold: 100, lumber: 50 },
  Ruar: { name: 'Unholy Armor', gold: 75, lumber: 50 },
  Ruba: { name: 'Banshee Adept Training', gold: 100, lumber: 50 },
  Rubu: { name: 'Burrow', gold: 100, lumber: 150 },
  Rucr: { name: 'Creature Carapace', gold: 75, lumber: 50 },
  Ruex: { name: 'Exhume Corpses', gold: 75, lumber: 25 },
  Rufb: { name: 'Freezing Breath', gold: 75, lumber: 75 },
  Rugf: { name: 'Ghoul Frenzy', gold: 75, lumber: 0 },
  Rume: { name: 'Unholy Strength', gold: 75, lumber: 0 },
  Rune: { name: 'Necromancer Adept Training', gold: 100, lumber: 50 },
  Rupc: { name: 'Disease Cloud', gold: 150, lumber: 150 },
  Rupm: { name: 'Backpack', gold: 50, lumber: 150 },
  Rura: { name: 'Creature Attack', gold: 75, lumber: 0 },
  Rusf: { name: 'Stone Form', gold: 50, lumber: 75 },
  Rusm: { name: 'Skeletal Mastery', gold: 50, lumber: 75 },
  Rusp: { name: 'Destroyer Form', gold: 150, lumber: 150 },
  Ruwb: { name: 'Web', gold: 75, lumber: 50 },
  // Night Elf
  Recb: { name: 'Corrosive Breath', gold: 75, lumber: 75 },
  Redc: { name: 'Druid of the Claw Adept Training', gold: 100, lumber: 50 },
  Redt: { name: 'Druid of the Talon Adept Training', gold: 100, lumber: 50 },
  Reeb: { name: 'Mark of the Claw', gold: 75, lumber: 50 },
  Reec: { name: 'Mark of the Talon', gold: 100, lumber: 150 },
  Rehs: { name: 'Hardened Skin', gold: 100, lumber: 50 },
  Reib: { name: 'Improved Bows', gold: 100, lumber: 150 },
  Rema: { name: 'Moon Armor', gold: 75, lumber: 50 },
  Remg: { name: 'Upgrade Moon Glaive', gold: 100, lumber: 75 },
  Remk: { name: 'Marksmanship', gold: 75, lumber: 50 },
  Renb: { name: "Nature's Blessing", gold: 75, lumber: 100 },
  Repb: { name: 'Vorpal Blades', gold: 75, lumber: 0 },
  Repm: { name: 'Backpack', gold: 100, lumber: 50 },
  Rerh: { name: 'Reinforced Hides', gold: 75, lumber: 50 },
  Rers: { name: 'Resistant Skin', gold: 75, lumber: 75 },
  Resc: { name: 'Sentinel', gold: 50, lumber: 25 },
  Resi: { name: 'Abolish Magic', gold: 50, lumber: 25 },
  Resm: { name: 'Strength of the Moon', gold: 75, lumber: 0 },
  Resw: { name: 'Strength of the Wild', gold: 75, lumber: 0 },
  Reuv: { name: 'Ultravision', gold: 75, lumber: 0 },
  Rews: { name: 'Well Spring', gold: 120, lumber: 80 },
  // Neutral
  Rwdm: { name: 'War Drums Damage Increase', gold: 100, lumber: 50 },
}

export const UPGRADE_NAME_BY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(UPGRADES_TECH).map(([id, u]) => [id, u.name]),
)

export const UPGRADE_GOLD_BY_ID: Record<string, number> = Object.fromEntries(
  Object.entries(UPGRADES_TECH).map(([id, u]) => [id, u.gold]),
)

export const UPGRADE_LUMBER_BY_ID: Record<string, number> = Object.fromEntries(
  Object.entries(UPGRADES_TECH).map(([id, u]) => [id, u.lumber]),
)

export const WORKERS = new Set(['Peasant', 'Peon', 'Wisp', 'Acolyte'])

/** Worker unit ids by fourcc (e.g. 'hpea'). */
export const WORKERS_BY_ID = new Set(['hpea', 'opeo', 'ewsp', 'uaco'])

export const HERO_OBSERVER: Record<string, { icon: string; display: string }> = {
  archmage: { icon: 'Hamg', display: 'Archmage' },
  mountainking: { icon: 'Hmkg', display: 'Mountain King' },
  paladin: { icon: 'Hpal', display: 'Paladin' },
  bloodmage: { icon: 'Hblm', display: 'Blood Mage' },
  blademaster: { icon: 'Obla', display: 'Blademaster' },
  farseer: { icon: 'Ofar', display: 'Far Seer' },
  shadowhunter: { icon: 'Oshd', display: 'Shadow Hunter' },
  taurenchieftain: { icon: 'Otch', display: 'Tauren Chieftain' },
  deathknight: { icon: 'Udea', display: 'Death Knight' },
  dreadlord: { icon: 'Udre', display: 'Dreadlord' },
  lich: { icon: 'Ulic', display: 'Lich' },
  cryptlord: { icon: 'Ucrl', display: 'Crypt Lord' },
  demonhunter: { icon: 'Edem', display: 'Demon Hunter' },
  keeperofthegrove: { icon: 'Ekee', display: 'Keeper of the Grove' },
  priestessofthemoon: { icon: 'Emoo', display: 'Priestess of the Moon' },
  warden: { icon: 'Ewar', display: 'Warden' },
  alchemist: { icon: 'Nalc', display: 'Alchemist' },
  beastmaster: { icon: 'Nbst', display: 'Beastmaster' },
  darkranger: { icon: 'Nbrn', display: 'Dark Ranger' },
  firelord: { icon: 'Nfir', display: 'Fire Lord' },
  seawitch: { icon: 'Nngs', display: 'Naga Sea Witch' },
  pandarenbrewmaster: { icon: 'Npbm', display: 'Pandaren Brewmaster' },
  pitlord: { icon: 'Nplh', display: 'Pit Lord' },
  tinker: { icon: 'Ntin', display: 'Tinker' },
}

/** Cumulative XP required to reach each hero level (index = level - 1). */
export const HERO_XP_THRESHOLDS = [0, 200, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400]

/** Hero observer data keyed by fourcc hero id (e.g. 'Hamg'). */
export const HERO_OBSERVER_BY_ID: Record<string, { display: string }> = Object.fromEntries(
  Object.entries(HERO_OBSERVER).map(([, v]) => [v.icon, { display: v.display }]),
)

/** Hero ability metadata keyed by fourcc ability id (e.g. 'AHbz'). */
export const ABILITY_BY_ID: Record<string, { name: string }> = {
  // Archmage
  AHbz: { name: 'Blizzard' },
  AHab: { name: 'Brilliance Aura' },
  AHmt: { name: 'Mass Teleport' },
  AHwe: { name: 'Summon Water Elemental' },
  // Mountain King
  AHav: { name: 'Avatar' },
  AHbh: { name: 'Bash' },
  AHtb: { name: 'Storm Bolt' },
  AHtc: { name: 'Thunder Clap' },
  // Paladin
  AHad: { name: 'Devotion Aura' },
  AHds: { name: 'Divine Shield' },
  AHhb: { name: 'Holy Light' },
  AHre: { name: 'Resurrection' },
  // Blood Mage
  AHbn: { name: 'Banish' },
  AHfs: { name: 'Flame Strike' },
  AHpx: { name: 'Summon Phoenix' },
  AHdr: { name: 'Siphon Mana' },
  // Demon Hunter
  AEmb: { name: 'Mana Burn' },
  AEim: { name: 'Immolation' },
  AEev: { name: 'Evasion' },
  AEme: { name: 'Metamorphosis' },
  // Keeper of the Grove
  AEer: { name: 'Entangling Roots' },
  AEfn: { name: 'Force of Nature' },
  AEah: { name: 'Thorns Aura' },
  AEtq: { name: 'Tranquility' },
  // Priestess of the Moon
  AEst: { name: 'Scout' },
  AHfa: { name: 'Searing Arrows' },
  AEar: { name: 'Trueshot Aura' },
  AEsf: { name: 'Starfall' },
  // Warden
  AEbl: { name: 'Blink' },
  AEfk: { name: 'Fan of Knives' },
  AEsh: { name: 'Shadow Strike' },
  AEsv: { name: 'Spirit of Vengeance' },
  // Blademaster
  AOww: { name: 'Bladestorm' },
  AOcr: { name: 'Critical Strike' },
  AOmi: { name: 'Mirror Image' },
  AOwk: { name: 'Wind Walk' },
  // Far Seer
  AOcl: { name: 'Chain Lightning' },
  AOeq: { name: 'Earthquake' },
  AOfs: { name: 'Far Sight' },
  AOsf: { name: 'Feral Spirit' },
  // Shadow Hunter
  AOvd: { name: 'Big Bad Voodoo' },
  AOhw: { name: 'Healing Wave' },
  AOhx: { name: 'Hex' },
  AOsw: { name: 'Serpent Ward' },
  // Tauren Chieftain
  AOae: { name: 'Endurance Aura' },
  AOre: { name: 'Reincarnation' },
  AOsh: { name: 'Shockwave' },
  AOws: { name: 'War Stomp' },
  // Death Knight
  AUan: { name: 'Animate Dead' },
  AUdc: { name: 'Death Coil' },
  AUdp: { name: 'Death Pact' },
  AUau: { name: 'Unholy Aura' },
  // Dreadlord
  AUcs: { name: 'Carrion Swarm' },
  AUin: { name: 'Inferno' },
  AUsl: { name: 'Sleep' },
  AUav: { name: 'Vampiric Aura' },
  // Lich
  AUfn: { name: 'Frost Nova' },
  AUfa: { name: 'Frost Armor' },
  AUfu: { name: 'Frost Armor' },
  AUdr: { name: 'Dark Ritual' },
  AUdd: { name: 'Death and Decay' },
  // Crypt Lord
  AUim: { name: 'Impale' },
  AUts: { name: 'Spiked Carapace' },
  AUcb: { name: 'Carrion Beetles' },
  AUls: { name: 'Locust Swarm' },
  // Pandaren Brewmaster
  ANbf: { name: 'Breath of Fire' },
  ANdb: { name: 'Drunken Brawler' },
  ANdh: { name: 'Drunken Haze' },
  ANef: { name: 'Storm, Earth, and Fire' },
  // Dark Ranger
  ANdr: { name: 'Life Drain' },
  ANsi: { name: 'Silence' },
  ANba: { name: 'Black Arrow' },
  ANch: { name: 'Charm' },
  // Naga Sea Witch
  ANms: { name: 'Mana Shield' },
  ANfa: { name: 'Frost Arrows' },
  ANfl: { name: 'Forked Lightning' },
  ANto: { name: 'Tornado' },
  // Pit Lord
  ANrf: { name: 'Rain of Fire' },
  ANca: { name: 'Cleaving Attack' },
  ANht: { name: 'Howl of Terror' },
  ANdo: { name: 'Doom' },
  // Beastmaster
  ANsg: { name: 'Summon Bear' },
  ANsq: { name: 'Summon Quilbeast' },
  ANsw: { name: 'Summon Hawk' },
  ANst: { name: 'Stampede' },
  // Goblin Tinker
  ANeg: { name: 'Engineering Upgrade' },
  ANcs: { name: 'Cluster Rockets' },
  ANc1: { name: 'Cluster Rockets' },
  ANc2: { name: 'Cluster Rockets' },
  ANc3: { name: 'Cluster Rockets' },
  ANsy: { name: 'Pocket Factory' },
  ANs1: { name: 'Pocket Factory' },
  ANs2: { name: 'Pocket Factory' },
  ANs3: { name: 'Pocket Factory' },
  ANrg: { name: 'Robo-Goblin' },
  ANg1: { name: 'Robo-Goblin' },
  ANg2: { name: 'Robo-Goblin' },
  ANg3: { name: 'Robo-Goblin' },
  // Firelord
  ANic: { name: 'Incinerate' },
  ANia: { name: 'Incinerate' },
  ANso: { name: 'Soul Burn' },
  ANlm: { name: 'Summon Lava Spawn' },
  ANvc: { name: 'Volcano' },
  // Goblin Alchemist
  ANhs: { name: 'Healing Spray' },
  ANab: { name: 'Acid Bomb' },
  ANcr: { name: 'Chemical Rage' },
  ANtm: { name: 'Transmute' },
}
