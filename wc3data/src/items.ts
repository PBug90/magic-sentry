import type { ItemEntry } from './balance.js'

export const ITEM_DATA: Record<string, ItemEntry> = {
  ckng: {
    name: 'Crown of Kings +5',
    gold: 1000,
  },
  modt: {
    name: 'Mask of Death',
    gold: 1000,
  },
  tkno: {
    name: 'Tome of Power',
    gold: 1250,
  },
  ratf: {
    name: 'Claws of Attack +15',
    gold: 800,
  },
  ofro: {
    name: 'Orb of Frost',
    gold: 800,
  },
  infs: {
    name: 'Inferno Stone',
    gold: 800,
  },
  desc: {
    name: "Kelen's Dagger of Escape",
    gold: 800,
  },
  fgdg: {
    name: 'Demonic Figurine',
    gold: 700,
  },
  engr: {
    name: 'Engraved Scale',
    gold: 700,
  },
  shar: {
    name: 'Ice Shard',
    gold: 700,
  },
  ccmd: {
    name: 'Scepter of Mastery',
    gold: 700,
  },
  wild: {
    name: 'Amulet of the Wild',
    gold: 700,
  },
  scav: {
    name: 'Scepter of Avarice',
    gold: 700,
  },
  odef: {
    name: 'Orb of Darkness',
    gold: 600,
    effect: 'Attacks can create Dark Minions.',
  },
  rde4: {
    name: 'Ring of Protection +5',
    gold: 300,
    effect: 'Boosts armor by 5.',
  },
  pmna: {
    name: 'Pendant of Mana',
    gold: 600,
    effect: 'Provides additional mana.',
  },
  rhth: {
    name: "Khadgar's Gem of Health",
    gold: 600,
    effect: 'Increases the hit points of the Hero.',
  },
  ssil: {
    name: 'Staff of Silence',
    gold: 600,
    effect: 'Stops enemy spellcasting.',
  },
  spsh: {
    name: 'Amulet of Spell Shield',
    gold: 600,
    effect: 'Blocks enemy spells.',
  },
  sres: {
    name: 'Scroll of Restoration',
    gold: 550,
  },
  pdi2: {
    name: 'Potion of Divinity (Invulnerability)',
    gold: 550,
  },
  pres: {
    name: 'Potion of Restoration',
    gold: 550,
  },
  iotw: {
    name: 'Idol of the wild',
    gold: 550,
  },
  fgfh: {
    name: 'Spiked Collar',
    gold: 550,
  },
  fgbd: {
    name: 'Blue Drake Egg',
    gold: 550,
  },
  fgrg: {
    name: 'Stone Token',
    gold: 550,
  },
  hcun: {
    name: 'Hood of Cunning',
    gold: 500,
    effect: 'Provides bonuses to Agility and Intelligence.',
  },
  hval: {
    name: 'Helm of Valor',
    gold: 500,
    effect: 'Provides bonuses to Strength and Agility.',
  },
  mcou: {
    name: 'Medallion of Courage',
    gold: 500,
    effect: 'Provides bonuses to Strength and Intelligence.',
  },
  ajen: {
    name: 'Ancient Janggo of Endurance',
    gold: 500,
    effect: 'Nearby units move and attack more swiftly.',
  },
  clfm: {
    name: 'Cloak of Flames',
    gold: 500,
    effect: 'Surrounds the Hero with damaging flames.',
  },
  ratc: {
    name: 'Claws of Attack +12',
    gold: 500,
    effect: 'Boosts attack damage by 12.',
  },
  war2: {
    name: 'Warsong Battle Drums (Kodo)',
    gold: 500,
  },
  kpin: {
    name: "Khadgar's Pipe of Insight",
    gold: 500,
    effect: 'Nearby units regain mana more swiftly.',
  },
  lgdh: {
    name: 'Legion Doom-Horn',
    gold: 500,
    effect: 'Nearby units heal and move more swiftly.',
  },
  ankh: {
    name: 'Ankh of Reincarnation',
    gold: 450,
  },
  whwd: {
    name: 'Healing Wards',
    gold: 450,
  },
  fgsk: {
    name: 'Book of the Dead',
    gold: 450,
  },
  wcyc: {
    name: 'Wand of the Wind',
    gold: 450,
  },
  hlst: {
    name: 'Health Stone',
    gold: 450,
  },
  mnst: {
    name: 'Mana Stone',
    gold: 450,
  },
  belv: {
    name: "Boots of Quel'Thalas +6",
    gold: 400,
    effect: 'Provides a bonus to Agility.',
  },
  bgst: {
    name: 'Belt of Giant Strength +6',
    gold: 400,
    effect: 'Provides a bonus to Strength.',
  },
  ciri: {
    name: 'Robe of the Magi +6',
    gold: 400,
    effect: 'Provides a bonus to Intelligence.',
  },
  lhst: {
    name: 'The Lion Horn of Stormwind',
    gold: 400,
    effect: 'Generates a protective aura around the Hero.',
  },
  afac: {
    name: "Alleria's Flute of Accuracy",
    gold: 400,
    effect: "Nearby units' missile attacks do more damage.",
  },
  sbch: {
    name: 'Scourge Bone Chimes',
    gold: 400,
    effect: 'Nearby units gain some life from damage they deal to enemy units.',
  },
  brac: {
    name: 'Runed Bracers',
    gold: 400,
    effect: 'Reduces Magic damage to Hero.',
  },
  rwiz: {
    name: 'Sobi Mask',
    gold: 400,
    effect: 'Increases mana regeneration rate.',
  },
  pghe: {
    name: 'Potion of Greater Healing',
    gold: 400,
  },
  pgma: {
    name: 'Potion of Greater Mana',
    gold: 400,
  },
  pnvu: {
    name: 'Potion of Invulnerability',
    gold: 400,
  },
  sror: {
    name: 'Scroll of the Beast',
    gold: 400,
  },
  woms: {
    name: 'Wand of Mana Stealing',
    gold: 400,
  },
  crys: {
    name: 'Crystal Ball',
    gold: 150,
  },
  evtl: {
    name: 'Talisman of Evasion',
    gold: 300,
    effect: 'Makes the Hero harder to hit.',
  },
  penr: {
    name: 'Pendant of Energy',
    gold: 300,
    effect: 'Provides additional mana.',
  },
  prvt: {
    name: 'Periapt of Vitality',
    gold: 300,
    effect: 'Increases the hit points of the Hero.',
  },
  rat9: {
    name: 'Claws of Attack +9',
    gold: 300,
  },
  rde3: {
    name: 'Ring of Protection +4',
    gold: 125,
  },
  rlif: {
    name: 'Ring of Regeneration',
    gold: 300,
    effect: 'Provides regeneration.',
  },
  bspd: {
    name: 'Boots of Speed',
    gold: 250,
  },
  rej3: {
    name: 'Replenishment Potion',
    gold: 150,
  },
  will: {
    name: 'Wand of Illusion',
    gold: 150,
  },
  wlsd: {
    name: 'Wand of Lightning Shield',
    gold: 150,
  },
  wswd: {
    name: 'Sentry Wards',
    gold: 150,
  },
  cnob: {
    name: 'Circlet of Nobility',
    gold: 200,
    effect: 'Provides a +2 bonus to Strength, Agility and Intelligence.',
  },
  gcel: {
    name: 'Gloves of Haste',
    gold: 125,
    effect: 'Increases attack speed.',
  },
  rat6: {
    name: 'Claws of Attack +6',
    gold: 125,
  },
  rde2: {
    name: 'Ring of Protection +3',
    gold: 125,
    effect: 'Boosts armor by 3.',
  },
  tdx2: {
    name: 'Tome of Agility +2',
    gold: 300,
  },
  tin2: {
    name: 'Tome of Intelligence +2',
    gold: 300,
  },
  tpow: {
    name: 'Tome of Knowledge',
    gold: 300,
  },
  tst2: {
    name: 'Tome of Strength +2',
    gold: 300,
  },
  pnvl: {
    name: 'Potion of Lesser Invulnerability',
    gold: 150,
  },
  clsd: {
    name: 'Cloak of Shadows',
    gold: 100,
    effect: 'Provides the Shadowmeld ability.',
  },
  rag1: {
    name: 'Slippers of Agility +3',
    gold: 100,
    effect: 'Boosts Agility by 3.',
  },
  rin1: {
    name: 'Mantle of Intelligence +3',
    gold: 100,
    effect: 'Boosts Intelligence by 3.',
  },
  rst1: {
    name: 'Gauntlets of Ogre Strength +3',
    gold: 100,
    effect: 'Boosts Strength by 3.',
  },
  manh: {
    name: 'Manual of Health',
    gold: 200,
  },
  tdex: {
    name: 'Tome of Agility',
    gold: 150,
  },
  tint: {
    name: 'Tome of Intelligence',
    gold: 150,
  },
  tstr: {
    name: 'Tome of Strength',
    gold: 150,
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
  },
  dsum: {
    name: 'Diamond of Summoning',
    gold: 400,
  },
  ofir: {
    name: 'Orb of Fire',
    gold: 250,
  },
  ocor: {
    name: 'Orb of Corruption',
    gold: 375,
  },
  oli2: {
    name: 'Orb of Lightning',
    gold: 375,
  },
  oven: {
    name: 'Orb of Venom',
    gold: 325,
  },
  ram3: {
    name: 'Third Ring of the Archmagi',
    gold: 400,
  },
  tret: {
    name: 'Tome of Retraining',
    gold: 200,
  },
  tgrh: {
    name: 'Tiny Great Hall',
    gold: 600,
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
  },
  stel: {
    name: 'Staff of Teleportation',
    gold: 150,
  },
  stwp: {
    name: 'Scroll of Town Portal',
    gold: 325,
  },
  wneg: {
    name: 'Wand of Negation',
    gold: 120,
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
  },
  sman: {
    name: 'Scroll of Mana',
    gold: 150,
  },
  rej1: {
    name: 'Minor Replenishment Potion',
    gold: 100,
  },
  pspd: {
    name: 'Potion of Speed',
    gold: 75,
  },
  dust: {
    name: 'Dust of Appearance',
    gold: 75,
  },
  ram1: {
    name: 'First Ring of the Archmagi',
    gold: 125,
  },
  pinv: {
    name: 'Potion of Invisibility',
    gold: 100,
  },
  phea: {
    name: 'Potion of Healing',
    gold: 150,
  },
  pman: {
    name: 'Potion of Mana',
    gold: 150,
  },
  spro: {
    name: 'Scroll of Protection',
    gold: 150,
  },
  hslv: {
    name: 'Healing Salve',
    gold: 100,
  },
  moon: {
    name: 'Moonstone',
    gold: 50,
  },
  shas: {
    name: 'Scroll of Speed',
    gold: 70,
  },
  skul: {
    name: 'Sacrificial Skull',
    gold: 50,
  },
  mcri: {
    name: 'Mechanical Critter',
    gold: 50,
  },
  rnec: {
    name: 'Rod of Necromancy',
    gold: 150,
  },
  ritd: {
    name: 'Ritual Dagger',
    gold: 75,
  },
  tsct: {
    name: 'Ivory Tower',
    gold: 40,
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
  },
  oflg: {
    name: 'Orc flag',
    gold: 1000,
  },
  pams: {
    name: 'Anti-magic Potion',
    gold: 100,
  },
  pgin: {
    name: 'Potion of Greater Invisibility',
    gold: 200,
  },
  rat3: {
    name: 'Claws of Attack +3',
    gold: 50,
  },
  rde0: {
    name: 'Ring of Protection +1',
    gold: 50,
  },
  rde1: {
    name: 'Ring of Protection +2',
    gold: 125,
  },
  rnsp: {
    name: 'Ring of Superiority',
    gold: 100,
    effect: 'Provides a +1 bonus to Strength, Agility and Intelligence.',
  },
  soul: {
    name: 'Soul',
    gold: 1000,
  },
  tels: {
    name: 'Goblin Night Scope',
    gold: 200,
  },
  tgxp: {
    name: 'Tome of Greater Experience',
    gold: 1000,
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
    effect: 'Increases combat effectiveness of nearby units.',
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
  },
  rman: {
    name: 'Rune of Mana(Lesser)',
    gold: 100,
  },
  rma2: {
    name: 'Rune of Mana(Greater)',
    gold: 300,
  },
  rres: {
    name: 'Rune of Restoration',
    gold: 250,
  },
  rreb: {
    name: 'Rune of Rebirth',
    gold: 250,
  },
  rhe1: {
    name: 'Rune of Lesser Healing',
    gold: 100,
  },
  rhe2: {
    name: 'Rune of Healing',
    gold: 200,
  },
  rhe3: {
    name: 'Rune of Greater Healing',
    gold: 300,
  },
  rdis: {
    name: 'Rune of Dispel Magic',
    gold: 75,
  },
  texp: {
    name: 'Tome of Experience',
    gold: 500,
  },
  rwat: {
    name: 'Rune of the Watcher',
    gold: 75,
  },
  pclr: {
    name: 'Clarity Potion',
    gold: 160,
  },
  plcl: {
    name: 'Lesser Clarity Potion',
    gold: 70,
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
  },
  tcas: {
    name: 'Tiny Castle',
    gold: 800,
  },
  ssan: {
    name: 'Staff of Sanctuary',
    gold: 200,
  },
  ofr2: {
    name: 'Orb of Fire v2',
    gold: 250,
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
  },
  fgrd: {
    name: 'Red Drake Egg',
    gold: 550,
  },
  totw: {
    name: 'talisman of the wild',
    gold: 550,
  },
  sand: {
    name: 'Scroll of Animate Dead',
    gold: 700,
  },
  srrc: {
    name: 'Scroll of Resurrection',
    gold: 700,
  },
}
