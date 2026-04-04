export const SWORDS = [
  {
    file: "Bakufu_mesh.glb",
    name: "Bakufu Shades",
    element: "Electro",
    rarity: 4,
    lore: "A style of blade found in Inazuma. Its unique curvature channels the thunder of the Shogun herself, striking with the weight of divine judgment.",
    stats: { atk: 41, substat: "EM +12" },
  },
  {
    file: "Boreas_mesh.glb",
    name: "Boreas",
    element: "Anemo",
    rarity: 4,
    lore: "Named after the god of the north wind. Legends say it was forged in a storm that lasted seven days, and the wind never truly left the blade.",
    stats: { atk: 44, substat: "ATK +6%" },
  },
  {
    file: "Cool_steel_mesh.glb",
    name: "Cool Steel",
    element: "Hydro",
    rarity: 3,
    lore: "A sword that has seen a hundred battles and remembers every one. Its edge is as cold and clear as a mountain stream.",
    stats: { atk: 39, substat: "ATK +7.7%" },
  },
  {
    file: "Dull_bladel_mesh.glb",
    name: "Dull Blade",
    element: "None",
    rarity: 1,
    lore: "Every legend starts somewhere. This is where most of them begin — a battered blade with nothing to prove and everything to earn.",
    stats: { atk: 23, substat: "—" },
  },
  {
    file: "Freedom_sworn_mesh.glb",
    name: "Freedom-Sworn",
    element: "Anemo",
    rarity: 5,
    lore: "A sword sworn to the forces of freedom and rebellion. It resonates with those who fight not for glory, but for a world without chains.",
    stats: { atk: 46, substat: "EM +43" },
  },
  {
    file: "Katana_mesh.glb",
    name: "Katana",
    element: "Pyro",
    rarity: 4,
    lore: "Forged in the tradition of Inazuman swordsmiths who spent their lives perfecting a single stroke. The blade knows only one direction: forward.",
    stats: { atk: 41, substat: "ATK +12%" },
  },
  {
    file: "Lions_roar_mesh.glb",
    name: "Lion's Roar",
    element: "Pyro",
    rarity: 4,
    lore: "The roar of the lion is a declaration of dominance. Demons flee from its sound. Elemental creatures crumble before it.",
    stats: { atk: 42, substat: "ATK +9%" },
  },
  {
    file: "Mistsplitter_mesh.glb",
    name: "Mistsplitter Reforged",
    element: "Cryo",
    rarity: 5,
    lore: "Reforged from the shards of a blade that once cut through the boundary between worlds. Some say it still remembers what lies beyond.",
    stats: { atk: 48, substat: "CRIT DMG +9.6%" },
  },
  {
    file: "Narukami_mesh.glb",
    name: "Narukami",
    element: "Electro",
    rarity: 5,
    lore: "Blessed by the Electro Archon herself. Every strike calls down the fury of heaven. Every parry disperses the storm.",
    stats: { atk: 46, substat: "CRIT Rate +7.2%" },
  },
  {
    file: "Prototype_mesh.glb",
    name: "Prototype Rancour",
    element: "Geo",
    rarity: 4,
    lore: "An experimental prototype that refused to be tamed. Its raw power terrifies even its wielder. No two strikes land the same way twice.",
    stats: { atk: 44, substat: "PHYS DMG +7.5%" },
  },
];

export const ELEMENT_COLORS = {
  Electro: "#cc88ff",
  Anemo: "#44ffcc",
  Hydro: "#44aaff",
  Pyro: "#ff6633",
  Cryo: "#aaddff",
  Geo: "#ffcc44",
  None: "#888888",
};

export const ELEMENT_ICONS = {
  Electro: "⚡",
  Anemo: "🌪",
  Hydro: "💧",
  Pyro: "🔥",
  Cryo: "❄",
  Geo: "⚙",
  None: "—",
};

// Each sword sits at a fixed world Z position.
// Camera starts at z=0 and travels forward (negative Z).
// Swords are spaced 30 units apart — enough room for approach + orbit + pass.
export const SWORD_POSITIONS = SWORDS.map((_, i) => ({
  x: 0,
  y: 0,
  z: -(i * 30 + 25), // -25, -55, -85, -115 ...
}));

// Total camera path length
export const CAMERA_PATH_LENGTH = SWORDS.length * 30 + 40;
