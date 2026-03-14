type OriginalityFlag = {
  type: "title" | "character" | "setting" | "mechanic" | "lore";
  match: string;
  originalGame: string;
  severity: "mild" | "obvious" | "shameless";
  snark: string;
  encouragement: string;
};

const FAMOUS_GAMES: Record<string, { keywords: string[]; snarks: string[] }> = {
  "Minecraft": {
    keywords: ["craft", "mine", "block", "voxel", "survival craft", "sandbox block", "pickaxe", "creeper"],
    snarks: [
      "Ah yes, the 'totally not Minecraft' approach. Bold strategy.",
      "Block-based survival? Never seen that before! (Said no one ever.)",
      "Notch is somewhere feeling a disturbance in the Force.",
    ],
  },
  "Dark Souls": {
    keywords: ["souls", "die", "bonfire", "estus", "git gud", "difficult", "dark fantasy", "you died", "hollow"],
    snarks: [
      "YOU COPIED. Still counts as unoriginal.",
      "Ah, the 'make it hard and call it artistic' school of design.",
      "FromSoftware's lawyers have entered the chat.",
    ],
  },
  "The Legend of Zelda": {
    keywords: ["zelda", "link", "hyrule", "triforce", "master sword", "princess rescue", "dungeon crawl"],
    snarks: [
      "It's dangerous to go alone! Take this... lawsuit.",
      "Listen! Hey! Your originality meter is at zero.",
      "Nintendo ninjas are being dispatched to your location.",
    ],
  },
  "Pokemon": {
    keywords: ["pokemon", "pocket monster", "catch them all", "creature collect", "monster tame", "evolution battle", "trainer"],
    snarks: [
      "Gotta catch 'em all? More like gotta sue 'em all.",
      "Your creature collector is feeling a bit... derivative.",
      "Professor Oak called. He's disappointed in your choices.",
    ],
  },
  "Fortnite": {
    keywords: ["fortnite", "battle royale", "100 players", "shrinking circle", "last one standing", "drop in"],
    snarks: [
      "Battle royale, you say? How 2018 of you.",
      "The circle is closing in... on your originality.",
      "Do a little dance after copying someone else's idea?",
    ],
  },
  "Among Us": {
    keywords: ["among us", "impostor", "imposter", "sus", "suspicious", "vote out", "emergency meeting", "crewmate"],
    snarks: [
      "That's kinda sus... of you to copy this directly.",
      "Emergency meeting! Someone's stealing game ideas!",
      "Red is sus, but you're more sus for this copy.",
    ],
  },
  "Undertale": {
    keywords: ["undertale", "pacifist", "genocide", "determination", "save everyone", "bullet hell rpg", "monster friend"],
    snarks: [
      "You're filled with DETERMINATION... to copy indie hits.",
      "Toby Fox is typing...",
      "* The originality detector fills you with disappointment.",
    ],
  },
  "Grand Theft Auto": {
    keywords: ["gta", "grand theft", "crime city", "open world crime", "steal cars", "gangster"],
    snarks: [
      "Rockstar Games wants to know your location.",
      "Open world crime? That's never been done! Oh wait...",
      "You've attracted a 5-star wanted level from the originality police.",
    ],
  },
  "Call of Duty": {
    keywords: ["call of duty", "military shooter", "first person shooter war", "modern warfare", "prestige"],
    snarks: [
      "Activision releases this joke yearly. You don't have to.",
      "Press F to pay respects to your creativity.",
      "Another military shooter. The world definitely needed this.",
    ],
  },
  "Stardew Valley": {
    keywords: ["stardew", "farm sim", "farming life", "harvest moon", "pixel farm", "country life sim"],
    snarks: [
      "ConcernedApe made this with one person. What's your excuse?",
      "Farming simulator? Groundbreaking. Literally.",
      "Your grandfather's farm deserved better than a copy.",
    ],
  },
  "Hollow Knight": {
    keywords: ["hollow knight", "metroidvania bug", "soul", "charm", "hollow", "knight bug", "dirtmouth"],
    snarks: [
      "Team Cherry called, they want their aesthetic back.",
      "Another bug-themed metroidvania? How original.",
      "No cost too great... except your dignity.",
    ],
  },
  "Elden Ring": {
    keywords: ["elden ring", "open world souls", "demigod", "tarnished", "rune", "great rune"],
    snarks: [
      "George R.R. Martin and Miyazaki are very disappointed.",
      "Maidenless behavior, copying Elden Ring.",
      "You don't have the right, O you don't have the right.",
    ],
  },
  "Super Mario": {
    keywords: ["mario", "plumber", "mushroom kingdom", "princess peach", "koopa", "goomba", "power-up jump"],
    snarks: [
      "It's-a me, a lawsuit!",
      "Nintendo's legal team has awoken from their slumber.",
      "Jumping on enemies to defeat them. Revolutionary.",
    ],
  },
  "Skyrim": {
    keywords: ["skyrim", "dragonborn", "fus ro dah", "arrow to the knee", "elder scrolls", "nordic fantasy"],
    snarks: [
      "I used to be original like you, then I took a copy to the knee.",
      "Todd Howard smiles and re-releases your game on 47 platforms.",
      "FUS RO COPYRIGHT INFRINGEMENT.",
    ],
  },
  "Celeste": {
    keywords: ["celeste", "climb mountain", "dash platformer", "anxiety", "mental health platform"],
    snarks: [
      "Madeline believed in herself. You could believe in original ideas.",
      "The mountain represents your climb away from originality.",
      "Dash, jump, and copy. The indie platformer trifecta.",
    ],
  },
};

const CHARACTER_ARCHETYPES: Record<string, { keywords: string[]; snarks: string[] }> = {
  "Chosen One": {
    keywords: ["chosen one", "prophecy", "destined", "the one", "savior", "hero of legend"],
    snarks: [
      "A CHOSEN ONE?! Wow, never seen that in... *checks notes* ...every fantasy ever.",
      "The prophecy foretold someone more original would come.",
      "You're the Chosen One to copy the Chosen One trope.",
    ],
  },
  "Brooding Antihero": {
    keywords: ["dark past", "brooding", "lone wolf", "tragic backstory", "seeks revenge", "works alone"],
    snarks: [
      "Edgy loner with a tragic past? How delightfully 2003.",
      "Your character's darkness is only matched by your lack of originality.",
      "They brood because they know they're a copy.",
    ],
  },
  "Quirky Sidekick": {
    keywords: ["comic relief", "loyal sidekick", "bumbling", "clumsy but lovable", "funny companion"],
    snarks: [
      "The funny sidekick! For when you can't write interesting leads.",
      "Jar Jar Binks called, he wants his job back.",
      "Ha ha, they're clumsy! Peak character development.",
    ],
  },
  "Mysterious Mentor": {
    keywords: ["wise mentor", "old master", "mysterious teacher", "sage", "dumbledore", "gandalf type"],
    snarks: [
      "An old wise mentor? Let me guess, they die in act 2?",
      "Gandalf, Dumbledore, and Obi-Wan are forming a support group.",
      "The mentor is mysterious because you haven't thought them through.",
    ],
  },
};

const SETTING_CLICHES: Record<string, { keywords: string[]; snarks: string[] }> = {
  "Post-Apocalyptic": {
    keywords: ["post-apocalyptic", "wasteland", "nuclear", "after the bombs", "survivors", "fallout-like"],
    snarks: [
      "Post-apocalyptic? The only thing dead here is your originality.",
      "War never changes. Neither do your game ideas apparently.",
      "The apocalypse happened and THIS is what survived?",
    ],
  },
  "Medieval Fantasy": {
    keywords: ["medieval fantasy", "kingdom", "dragons", "knights", "swords and sorcery", "castle"],
    snarks: [
      "Medieval fantasy! The 'I don't have ideas' setting since 1974.",
      "Dragons and knights. Tolkien is rolling in his grave.",
      "Let me guess: there's an evil king and a prophecy?",
    ],
  },
  "Cyberpunk": {
    keywords: ["cyberpunk", "neon", "corpo", "hacker", "dystopian future", "chrome", "cyber"],
    snarks: [
      "High tech, low originality. The cyberpunk way.",
      "Neon lights can't illuminate your derivative ideas.",
      "CD Projekt Red already disappointed everyone. Your turn?",
    ],
  },
  "Space Opera": {
    keywords: ["space opera", "galaxy", "starship", "alien races", "galactic empire", "space war"],
    snarks: [
      "In space, no one can hear you copy Star Wars.",
      "A long time ago, in an imagination far, far away...",
      "Mass Effect called, they want their codex back.",
    ],
  },
};

function getRandomSnark(snarks: string[]): string {
  return snarks[Math.floor(Math.random() * snarks.length)];
}

function getRandomEncouragement(): string {
  const encouragements = [
    "But hey, maybe add a unique twist? Make it YOURS.",
    "Consider: what if you flipped this trope on its head?",
    "Pro tip: The best games subvert expectations. Subvert this.",
    "Here's a wild idea: what's YOUR unique take on this?",
    "Remember: inspiration is great, but innovation is better.",
    "What would make YOUR version special? Think about it.",
    "The best 'copies' add something new. What's your addition?",
    "Familiar is fine. But familiar with a twist? That's art.",
    "Ask yourself: what hasn't been done with this concept?",
    "Your game, your rules. Break the mold a little!",
  ];
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}

function checkText(text: string, type: OriginalityFlag["type"]): OriginalityFlag | null {
  const lowerText = text.toLowerCase();

  for (const [game, data] of Object.entries(FAMOUS_GAMES)) {
    for (const keyword of data.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        const severity: OriginalityFlag["severity"] = 
          lowerText.includes(game.toLowerCase()) ? "shameless" :
          data.keywords.filter(k => lowerText.includes(k.toLowerCase())).length > 2 ? "obvious" : "mild";
        
        return {
          type,
          match: keyword,
          originalGame: game,
          severity,
          snark: getRandomSnark(data.snarks),
          encouragement: getRandomEncouragement(),
        };
      }
    }
  }

  for (const [archetype, data] of Object.entries(CHARACTER_ARCHETYPES)) {
    for (const keyword of data.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return {
          type: "character",
          match: keyword,
          originalGame: archetype,
          severity: "mild",
          snark: getRandomSnark(data.snarks),
          encouragement: getRandomEncouragement(),
        };
      }
    }
  }

  for (const [setting, data] of Object.entries(SETTING_CLICHES)) {
    for (const keyword of data.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return {
          type: "setting",
          match: keyword,
          originalGame: setting,
          severity: "mild",
          snark: getRandomSnark(data.snarks),
          encouragement: getRandomEncouragement(),
        };
      }
    }
  }

  return null;
}

export function detectOriginality(input: {
  title?: string;
  tagline?: string;
  characterName?: string;
  characterBackstory?: string;
  characterRole?: string;
  worldSetting?: string;
  worldLore?: string;
  worldMechanics?: string;
}): OriginalityFlag[] {
  const flags: OriginalityFlag[] = [];

  if (input.title) {
    const flag = checkText(input.title, "title");
    if (flag) flags.push(flag);
  }

  if (input.tagline) {
    const flag = checkText(input.tagline, "title");
    if (flag && !flags.some(f => f.originalGame === flag.originalGame)) {
      flags.push(flag);
    }
  }

  if (input.characterName) {
    const flag = checkText(input.characterName, "character");
    if (flag) flags.push(flag);
  }

  if (input.characterBackstory) {
    const flag = checkText(input.characterBackstory, "character");
    if (flag && !flags.some(f => f.originalGame === flag.originalGame)) {
      flags.push(flag);
    }
  }

  if (input.characterRole) {
    const flag = checkText(input.characterRole, "character");
    if (flag && !flags.some(f => f.originalGame === flag.originalGame)) {
      flags.push(flag);
    }
  }

  if (input.worldSetting) {
    const flag = checkText(input.worldSetting, "setting");
    if (flag) flags.push(flag);
  }

  if (input.worldLore) {
    const flag = checkText(input.worldLore, "lore");
    if (flag && !flags.some(f => f.originalGame === flag.originalGame)) {
      flags.push(flag);
    }
  }

  if (input.worldMechanics) {
    const flag = checkText(input.worldMechanics, "mechanic");
    if (flag && !flags.some(f => f.originalGame === flag.originalGame)) {
      flags.push(flag);
    }
  }

  return flags;
}

export function getOverallOriginalityMessage(flagCount: number): { message: string; color: string } {
  if (flagCount === 0) {
    return {
      message: "Surprisingly original! Did you actually have a unique idea? Impressive.",
      color: "text-green-500",
    };
  } else if (flagCount === 1) {
    return {
      message: "Only one familiar element detected. You're trying, at least.",
      color: "text-yellow-500",
    };
  } else if (flagCount <= 3) {
    return {
      message: "Multiple 'inspirations' detected. The air quotes are doing heavy lifting here.",
      color: "text-orange-500",
    };
  } else {
    return {
      message: "This is less a game and more a tribute act. Bold strategy.",
      color: "text-red-500",
    };
  }
}

export type { OriginalityFlag };
