import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Code, Play, CheckCircle, XCircle, Lightbulb, 
  ArrowRight, Trophy, BookOpen, Zap, RefreshCw,
  Gamepad2
} from "lucide-react";
import { StepIntro, useStepIntro } from "@/components/step-intro";
import { AnimatePresence } from "framer-motion";

interface CodeCauldronProps {
  projectId: number;
  onComplete: () => void;
  onBack: () => void;
}

type GameEngine = "gml" | "unity" | "rpgmaker";

interface CodeLesson {
  id: string;
  title: string;
  concept: string;
  description: string;
  realWorldUse: string;
  starterCode: string;
  solution: string;
  hints: string[];
  snark: string;
  encouragement: string;
}

interface EngineInfo {
  id: GameEngine;
  name: string;
  fullName: string;
  color: string;
  description: string;
  language: string;
}

const ENGINES: EngineInfo[] = [
  {
    id: "gml",
    name: "GML",
    fullName: "Game Maker Studio",
    color: "bg-green-500",
    description: "Perfect for 2D games. Used by Undertale, Hotline Miami, and Hyper Light Drifter.",
    language: "GML (Game Maker Language)",
  },
  {
    id: "unity",
    name: "Unity",
    fullName: "Unity Engine",
    color: "bg-gray-700",
    description: "Industry standard for indie and AA games. Used by Hollow Knight, Cuphead, and Ori.",
    language: "C#",
  },
  {
    id: "rpgmaker",
    name: "RPG Maker",
    fullName: "RPG Maker",
    color: "bg-blue-500",
    description: "The classic choice for story-driven RPGs. Used by To the Moon and Lisa.",
    language: "JavaScript/Ruby",
  },
];

const LESSONS_BY_ENGINE: Record<GameEngine, CodeLesson[]> = {
  gml: [
    {
      id: "variables",
      title: "The Variable Vault",
      concept: "Variables & Data Types",
      description: "In Game Maker, variables store everything from player HP to score. No type declarations needed!",
      realWorldUse: "Undertale uses variables for determination, HP, and the genocide counter.",
      starterCode: `// GML - Create Event for obj_player
// Store the player's starting health
player_hp = ___

// Store the player's name (it's a string!)
player_name = ___

// Is the player alive? (true or false)
is_alive = ___

// Show in debug
show_debug_message(player_hp);
show_debug_message(player_name);`,
      solution: `player_hp = 100
player_name = "Hero"
is_alive = true`,
      hints: [
        "GML doesn't need 'var' or 'let' - just write the variable name",
        "Strings use double quotes: \"Hero\"",
        "Booleans are lowercase: true or false",
      ],
      snark: "You've stored data in memory! Your Game Maker project is now 0.001% complete.",
      encouragement: "Toby Fox started Undertale with variables just like these!",
    },
    {
      id: "conditionals",
      title: "The Decision Dungeon",
      concept: "If/Else Statements",
      description: "Game Maker uses familiar if/else syntax. Perfect for checking collisions, health, and game states.",
      realWorldUse: "Every enemy AI, every dialogue branch, every power-up check uses conditionals.",
      starterCode: `// GML - Step Event
// Check if player health is critical
var status = "OK";

if (player_hp ___ 30) {
    status = "DANGER";
    // Flash the screen red!
    ___
} else {
    status = "OK";
}

show_debug_message(status);`,
      solution: `if (player_hp < 30) {
    status = "DANGER";
    instance_create_layer(x, y, "Effects", obj_warning);
}`,
      hints: [
        "Use < to check if health is less than 30",
        "You could create a warning effect or change a color",
        "instance_create_layer() spawns objects in GML 2.3+",
      ],
      snark: "Your game can now make decisions! It's smarter than most AAA AI already.",
      encouragement: "Hotline Miami's entire combat system is built on conditionals like these!",
    },
    {
      id: "loops",
      title: "The Loop Lair",
      concept: "Loops & Iteration",
      description: "Need to spawn a wave of enemies? Check all bullets? Loops repeat code efficiently.",
      realWorldUse: "Bullet hell games use loops to spawn hundreds of projectiles per frame.",
      starterCode: `// GML - Spawn 5 enemies in a row
var enemy_count = 5;
var start_x = 100;

for (var i = 0; i < ___; i++) {
    instance_create_layer(
        start_x + (i * 64),
        200,
        "Enemies",
        obj_enemy
    );
}`,
      solution: `for (var i = 0; i < enemy_count; i++) {
    instance_create_layer(
        start_x + (i * 64),
        200,
        "Enemies",
        obj_enemy
    );
}`,
      hints: [
        "The loop should run 'enemy_count' times",
        "i starts at 0 and goes up to (but not including) enemy_count",
        "Each enemy is spaced 64 pixels apart",
      ],
      snark: "You've spawned multiple enemies! Your game is now officially 'hard'.",
      encouragement: "Nuclear Throne spawns entire enemy waves using loops just like this!",
    },
    {
      id: "functions",
      title: "The Script Shrine",
      concept: "Scripts & Functions",
      description: "GML scripts let you write reusable code. Define once, use everywhere!",
      realWorldUse: "Damage calculation, inventory management, save/load - all handled by scripts.",
      starterCode: `// GML Script: scr_calculate_damage
/// @param base_damage
/// @param is_critical

function scr_calculate_damage(base_damage, is_critical) {
    if (___) {
        return base_damage * 2;
    }
    return ___;
}

// Usage: var dmg = scr_calculate_damage(50, true);`,
      solution: `function scr_calculate_damage(base_damage, is_critical) {
    if (is_critical) {
        return base_damage * 2;
    }
    return base_damage;
}`,
      hints: [
        "Check if is_critical is true",
        "Critical hits deal double damage",
        "Return the base_damage if not critical",
      ],
      snark: "You've written a reusable function! Copy-paste coders everywhere are crying.",
      encouragement: "Every polished Game Maker game has dozens of helper scripts like this!",
    },
    {
      id: "objects",
      title: "The Object Obelisk",
      concept: "Objects & Instances",
      description: "In Game Maker, everything is an object. Players, enemies, bullets - all objects with events.",
      realWorldUse: "Objects are the building blocks. obj_player, obj_enemy, obj_coin - the game IS objects.",
      starterCode: `// GML - obj_player Create Event
// Set up player properties
hp = 100;
max_hp = 100;
speed = 4;
inventory = ___; // empty array/list

// Method to take damage
take_damage = function(amount) {
    hp = hp - ___;
    if (hp <= 0) {
        instance_destroy();
    }
}`,
      solution: `inventory = [];

take_damage = function(amount) {
    hp = hp - amount;
    if (hp <= 0) {
        instance_destroy();
    }
}`,
      hints: [
        "Empty arrays in GML 2.3+ use []",
        "Subtract the 'amount' parameter from hp",
        "instance_destroy() removes the object",
      ],
      snark: "You've created a game object! It even has a death function. Very optimistic.",
      encouragement: "Every Game Maker hit starts with a player object just like this!",
    },
    {
      id: "debugging",
      title: "The Debugging Dungeon",
      concept: "Finding & Fixing Bugs",
      description: "90% of game dev is debugging. Open the Output window (Windows > Output) and use show_debug_message() to trace your code. Set breakpoints by clicking the gutter!",
      realWorldUse: "Every shipped game spent more time debugging than coding. Undertale's dev logs would fill books.",
      starterCode: `// GML - This code has a bug! Find and fix it.
// Open the Output window to see debug messages!

var player_hp = 100;
var damage = 25;

// Step 1: Log the starting HP (convert number to string)
show_debug_message("HP before: " + ___(player_hp));

// Step 2: The subtraction is wrong - fix it!
// Currently: player_hp = damage; (WRONG - sets HP to 25!)
// Should be: player_hp = player_hp ___ damage;
player_hp = player_hp - damage;

// Step 3: Log the result to verify
show_debug_message("HP after: " + string(player_hp));
// If correct, output shows: HP before: 100, HP after: 75`,
      solution: `show_debug_message("HP before: " + string(player_hp));
player_hp = player_hp - damage;
show_debug_message("HP after: " + string(player_hp));`,
      hints: [
        "string() converts numbers to text for debug messages",
        "Use - to subtract damage from HP",
        "Pro tip: In GML, click the line number gutter to add breakpoints!",
      ],
      snark: "You found a bug! In the real world, this would be 3am and you'd be crying.",
      encouragement: "Debugging is a superpower. The best devs are the best debuggers!",
    },
  ],
  unity: [
    {
      id: "variables",
      title: "The Variable Vault",
      concept: "Variables & Data Types",
      description: "C# is strongly typed. You must declare what kind of data each variable holds.",
      realWorldUse: "Hollow Knight tracks HP, soul meter, geo, and hundreds of game flags with typed variables.",
      starterCode: `// Unity C# - PlayerController.cs
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    // Declare player health (whole number)
    public ___ playerHealth = 100;
    
    // Declare player name (text)
    public ___ playerName = "Hero";
    
    // Is the player alive? (true/false)
    public ___ isAlive = true;
    
    void Start()
    {
        Debug.Log(playerHealth);
    }
}`,
      solution: `public int playerHealth = 100;
public string playerName = "Hero";
public bool isAlive = true;`,
      hints: [
        "Whole numbers use 'int'",
        "Text uses 'string'",
        "True/false values use 'bool'",
      ],
      snark: "You've learned C# types! You're now officially overqualified for most game jams.",
      encouragement: "Team Cherry built all of Hollow Knight's systems with typed variables like these!",
    },
    {
      id: "conditionals",
      title: "The Decision Dungeon",
      concept: "If/Else Statements",
      description: "Unity uses standard C# conditionals. Perfect for game state management.",
      realWorldUse: "Cuphead checks boss phases, player inputs, and parry timing with conditionals.",
      starterCode: `// Unity C# - Check player status
void Update()
{
    string status = "OK";
    
    if (playerHealth ___ 30)
    {
        status = "DANGER";
        // Trigger low health warning
        ___
    }
    else
    {
        status = "OK";
    }
    
    Debug.Log(status);
}`,
      solution: `if (playerHealth < 30)
{
    status = "DANGER";
    lowHealthWarning.SetActive(true);
}`,
      hints: [
        "Use < to compare values",
        "You might enable a UI element or play a sound",
        "SetActive(true) enables GameObjects",
      ],
      snark: "Your Unity game can think! It's already smarter than most mobile clickers.",
      encouragement: "Every Unity game from Ori to Subnautica uses conditionals constantly!",
    },
    {
      id: "loops",
      title: "The Loop Lair",
      concept: "Loops & Iteration",
      description: "C# loops are powerful. Use them for spawning, updating, and managing collections.",
      realWorldUse: "Vampire Survivors spawns hundreds of enemies using efficient loops.",
      starterCode: `// Unity C# - Spawn enemy wave
public GameObject enemyPrefab;
public int enemyCount = 5;

void SpawnWave()
{
    for (int i = 0; i < ___; i++)
    {
        Vector3 spawnPos = new Vector3(
            i * 2f,
            0,
            0
        );
        ___(enemyPrefab, spawnPos, Quaternion.identity);
    }
}`,
      solution: `for (int i = 0; i < enemyCount; i++)
{
    Vector3 spawnPos = new Vector3(i * 2f, 0, 0);
    Instantiate(enemyPrefab, spawnPos, Quaternion.identity);
}`,
      hints: [
        "Loop should run 'enemyCount' times",
        "Instantiate() creates copies of prefabs",
        "Quaternion.identity means no rotation",
      ],
      snark: "You can spawn enemies! Your game is now 'roguelike' material.",
      encouragement: "Every wave-based game uses spawning loops exactly like this!",
    },
    {
      id: "functions",
      title: "The Method Manor",
      concept: "Methods & Functions",
      description: "C# methods organize your code into reusable, testable chunks.",
      realWorldUse: "Ori and the Blind Forest has methods for movement, combat, abilities, and more.",
      starterCode: `// Unity C# - Damage calculation
public int CalculateDamage(int baseDamage, bool isCritical)
{
    if (___)
    {
        return baseDamage ___ 2;
    }
    return ___;
}

// Usage: int damage = CalculateDamage(50, true);`,
      solution: `public int CalculateDamage(int baseDamage, bool isCritical)
{
    if (isCritical)
    {
        return baseDamage * 2;
    }
    return baseDamage;
}`,
      hints: [
        "Check if isCritical is true",
        "Use * for multiplication",
        "Return baseDamage for non-critical hits",
      ],
      snark: "You've written a method! Object-oriented programming unlocked.",
      encouragement: "Clean, reusable methods are what separate hobby projects from shipped games!",
    },
    {
      id: "classes",
      title: "The Class Castle",
      concept: "Classes & Components",
      description: "Unity is component-based. Every behavior is a class attached to GameObjects.",
      realWorldUse: "Every Unity game uses MonoBehaviour classes - it's the foundation of the engine.",
      starterCode: `// Unity C# - Player component
public class Player : MonoBehaviour
{
    public int health = 100;
    public List<string> inventory = new ___();
    
    public void TakeDamage(int amount)
    {
        health = health - ___;
        
        if (health <= 0)
        {
            ___();
        }
    }
    
    void Die()
    {
        Destroy(gameObject);
    }
}`,
      solution: `public List<string> inventory = new List<string>();

public void TakeDamage(int amount)
{
    health = health - amount;
    
    if (health <= 0)
    {
        Die();
    }
}`,
      hints: [
        "new List<string>() creates an empty list",
        "Subtract 'amount' from health",
        "Call the Die() method when health is 0 or less",
      ],
      snark: "You've made a Unity component! You're basically a game developer now.",
      encouragement: "This exact pattern is used in every Unity game ever made!",
    },
    {
      id: "debugging",
      title: "The Debugging Dungeon",
      concept: "Finding & Fixing Bugs",
      description: "Open Console (Window > General > Console). NullReferenceException means you're accessing something that doesn't exist. Always null-check, then fix the root cause!",
      realWorldUse: "Hollow Knight devs fixed thousands of null refs. The Console window is open 100% of dev time.",
      starterCode: `// Unity C# - This crashes with NullReferenceException!
// The Console shows: "Object reference not set"

public class EnemySpawner : MonoBehaviour
{
    // This must be assigned in the Inspector!
    [SerializeField] private GameObject enemyPrefab;
    
    void Start()
    {
        // Step 1: Add a null check (use == to compare)
        if (enemyPrefab ___ null)
        {
            // Step 2: Log an error explaining what's wrong
            Debug.LogError("Assign enemyPrefab in the ___!");
            return; // Exit to prevent crash
        }
        
        // Only runs if prefab exists
        Instantiate(enemyPrefab, transform.position, Quaternion.identity);
        Debug.Log("Enemy spawned successfully!");
    }
}
// Fix: Drag a prefab onto the Inspector field!`,
      solution: `if (enemyPrefab == null)
{
    Debug.LogError("Assign enemyPrefab in the Inspector!");
    return;
}`,
      hints: [
        "Use == to check if enemyPrefab equals null",
        "The [SerializeField] field needs an asset dragged onto it in the Inspector",
        "Debug.LogError makes red text - use it for critical issues!",
      ],
      snark: "You've defeated the NullReferenceException! The most common Unity boss.",
      encouragement: "In real Unity dev, you'll add null checks everywhere. It's the professional way!",
    },
  ],
  rpgmaker: [
    {
      id: "variables",
      title: "The Variable Vault",
      concept: "Game Variables & Switches",
      description: "RPG Maker uses built-in variable and switch systems, plus JavaScript for advanced logic.",
      realWorldUse: "To the Moon tracks story progress, items, and emotional beats with variables.",
      starterCode: `// RPG Maker MV/MZ - JavaScript Plugin
// Access game variables and switches

// Set variable 1 to player's starting gold
$gameVariables.setValue(1, ___);

// Set variable 2 to player's name
$gameVariables.setValue(2, ___);

// Set switch 1 to whether player has key item
$gameSwitches.setValue(1, ___);

console.log($gameVariables.value(1));`,
      solution: `$gameVariables.setValue(1, 100);
$gameVariables.setValue(2, "Hero");
$gameSwitches.setValue(1, true);`,
      hints: [
        "Variables can hold numbers or strings",
        "Switches are just true/false flags",
        "Use setValue(id, value) to set them",
      ],
      snark: "You've mastered RPG Maker's variable system! The event editor weeps with joy.",
      encouragement: "Every RPG Maker hit uses variables and switches for everything!",
    },
    {
      id: "conditionals",
      title: "The Decision Dungeon",
      concept: "Conditional Branches",
      description: "RPG Maker's bread and butter. Check conditions to branch dialogue, events, and gameplay.",
      realWorldUse: "Lisa: The Painful uses conditionals for its brutal choice-based narrative.",
      starterCode: `// RPG Maker MV/MZ - JavaScript
// Check if player has enough gold for an item

var playerGold = $gameParty.gold();
var itemCost = 100;
var message = "";

if (playerGold ___ itemCost) {
    message = "You can afford it!";
    $gameParty.loseGold(___);
} else {
    message = "Not enough gold...";
}

$gameMessage.add(message);`,
      solution: `if (playerGold >= itemCost) {
    message = "You can afford it!";
    $gameParty.loseGold(itemCost);
}`,
      hints: [
        "Use >= to check if gold is enough",
        "loseGold() takes the cost amount",
        "This is just like the shop system!",
      ],
      snark: "Your NPCs can now judge the player's wallet! Classic RPG move.",
      encouragement: "Every shop, every quest, every choice uses conditionals like this!",
    },
    {
      id: "loops",
      title: "The Loop Lair",
      concept: "Loops & Party Management",
      description: "Use loops to process party members, inventory, or spawn multiple events.",
      realWorldUse: "Any game with party management loops through members for stats, buffs, and healing.",
      starterCode: `// RPG Maker MV/MZ - Heal all party members
var partyMembers = $gameParty.members();

for (var i = 0; i < ___; i++) {
    var member = partyMembers[i];
    // Heal to full HP
    member.setHp(___);
}

console.log("All party members healed!");`,
      solution: `for (var i = 0; i < partyMembers.length; i++) {
    var member = partyMembers[i];
    member.setHp(member.mhp);
}`,
      hints: [
        "partyMembers.length gives the count",
        "member.mhp is their max HP",
        "setHp() changes their current HP",
      ],
      snark: "A full party heal! You're basically making a save point.",
      encouragement: "Party management loops are core to every JRPG system!",
    },
    {
      id: "functions",
      title: "The Plugin Palace",
      concept: "Plugin Functions",
      description: "RPG Maker plugins use JavaScript functions to extend the engine.",
      realWorldUse: "Popular plugins add crafting, day/night cycles, and custom battle systems.",
      starterCode: `// RPG Maker MV/MZ - Custom Plugin Function
// Calculate damage with critical hit support

function calculateDamage(baseDamage, isCritical) {
    if (___) {
        return baseDamage * ___;
    }
    return baseDamage;
}

// Usage in damage formula: calculateDamage(a.atk * 4 - b.def * 2, Math.random() < 0.1)`,
      solution: `function calculateDamage(baseDamage, isCritical) {
    if (isCritical) {
        return baseDamage * 2;
    }
    return baseDamage;
}`,
      hints: [
        "Check if isCritical is true",
        "Critical hits usually do 2x damage",
        "This can be used in skill formulas!",
      ],
      snark: "You're writing plugins now! The RPG Maker forums will worship you.",
      encouragement: "Custom functions let you go beyond the default RPG Maker limits!",
    },
    {
      id: "objects",
      title: "The Data Domain",
      concept: "Game Objects & Data",
      description: "Access and modify game data objects: actors, items, skills, and more.",
      realWorldUse: "Custom systems read and modify the database to create unique mechanics.",
      starterCode: `// RPG Maker MV/MZ - Custom Item System
// Create a consumable item effect

var item = {
    name: ___,
    healAmount: ___,
    description: "Restores some HP",
    
    use: function(target) {
        var newHp = target.hp + this.___;
        target.setHp(Math.min(newHp, target.mhp));
        return true;
    }
};

console.log(item.name + " created!");`,
      solution: `var item = {
    name: "Potion",
    healAmount: 50,
    
    use: function(target) {
        var newHp = target.hp + this.healAmount;
        target.setHp(Math.min(newHp, target.mhp));
        return true;
    }
};`,
      hints: [
        "Name is a string like \"Potion\"",
        "healAmount is a number",
        "Use this.healAmount to access the property",
      ],
      snark: "You've created a custom item! The database trembles before you.",
      encouragement: "Understanding data objects unlocks unlimited customization potential!",
    },
    {
      id: "debugging",
      title: "The Debugging Dungeon",
      concept: "Finding & Fixing Bugs",
      description: "During playtest, press F8 to open Developer Tools (Console tab). console.log() prints values so you can see what's actually happening in your game!",
      realWorldUse: "Every RPG Maker plugin (Yanfly, VisuStella, etc.) was debugged with F8. It's essential.",
      starterCode: `// RPG Maker MV/MZ - Debug a broken healing skill
// Press F8 during playtest to see console output!

var actor = $gameParty.leader();
var healAmount = 50;

// Step 1: Log current HP (property is 'hp')
console.log("Current HP: " + actor.___);
console.log("Max HP: " + actor.mhp);

// Step 2: Check if we need healing (compare hp to mhp)
if (actor.___ < actor.mhp) {
    var newHp = actor.hp + healAmount;
    actor.setHp(Math.min(newHp, actor.mhp));
    console.log("Healed! New HP: " + actor.hp);
} else {
    console.log("Already at full HP!");
}
// F8 Console shows all your log messages!`,
      solution: `console.log("Current HP: " + actor.hp);
if (actor.hp < actor.mhp) {`,
      hints: [
        "actor.hp = current HP, actor.mhp = maximum HP",
        "Press F8 during playtest to open DevTools Console",
        "console.log() is your best friend for seeing actual values!",
      ],
      snark: "You've mastered F8 debugging! You're now an official RPG Maker wizard.",
      encouragement: "The best plugin developers debug more than they code. You're on the right path!",
    },
  ],
};

export function CodeCauldron({ projectId, onComplete, onBack }: CodeCauldronProps) {
  const { showIntro, dismissIntro } = useStepIntro("code-cauldron-intro");
  const [selectedEngine, setSelectedEngine] = useState<GameEngine | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [userCode, setUserCode] = useState("");
  const [output, setOutput] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const lessons = selectedEngine ? LESSONS_BY_ENGINE[selectedEngine] : [];
  const currentLesson = lessons[currentLessonIndex];
  const progress = lessons.length > 0 ? (completedLessons.size / lessons.length) * 100 : 0;

  const selectEngine = (engine: GameEngine) => {
    setSelectedEngine(engine);
    setCurrentLessonIndex(0);
    setUserCode(LESSONS_BY_ENGINE[engine][0].starterCode);
    setOutput("");
    setIsCorrect(null);
    setShowHint(0);
    setCompletedLessons(new Set());
  };

  const runCode = () => {
    if (!currentLesson) return;
    
    try {
      const hasBlankSpaces = userCode.includes("___");
      if (hasBlankSpaces) {
        setOutput("Fill in all the ___ blanks before running!");
        setIsCorrect(false);
        return;
      }

      // 1. Strip out all code comments so they don't break the comparison
      const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

      // 2. Normalize the code (remove all spaces, match quotes, make lowercase)
      const normalize = (code: string) => {
        return stripComments(code)
          .replace(/\s+/g, '')
          .replace(/'/g, '"')
          .toLowerCase();
      };

      const normalizedUserCode = normalize(userCode);
      const normalizedSolution = normalize(currentLesson.solution);

      // 3. Check if the user's cleaned code contains the exact cleaned solution
      if (normalizedUserCode.includes(normalizedSolution)) {
        setIsCorrect(true);
        setOutput(`Output: Success!\n\n${currentLesson.snark}\n\n${currentLesson.encouragement}`);
        setCompletedLessons(new Set(Array.from(completedLessons).concat(currentLesson.id)));
      } else {
        setIsCorrect(false);
        setOutput("Hmm, that doesn't look quite right. Check the hints or try again!");
      }
    } catch (err) {
      setIsCorrect(false);
      setOutput(`Error: ${err instanceof Error ? err.message : "Something went wrong"}`);
    }
  };

  const nextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      const nextIndex = currentLessonIndex + 1;
      setCurrentLessonIndex(nextIndex);
      setUserCode(lessons[nextIndex].starterCode);
      setOutput("");
      setIsCorrect(null);
      setShowHint(0);
    }
  };

  const resetCode = () => {
    if (!currentLesson) return;
    setUserCode(currentLesson.starterCode);
    setOutput("");
    setIsCorrect(null);
  };

  const showNextHint = () => {
    if (currentLesson && showHint < currentLesson.hints.length) {
      setShowHint(showHint + 1);
    }
  };

  const allComplete = lessons.length > 0 && completedLessons.size === lessons.length;

  if (showIntro) {
    return (
      <AnimatePresence>
        <StepIntro
          icon={Code}
          title="Welcome to Code Cauldron"
          tagline="Where real code meets fake games"
          description={[
            "Surprise! This isn't just a fake game studio simulator. You're actually going to learn real programming.",
            "Every game engine has its own language. Game Maker uses GML. Unity uses C#. RPG Maker uses JavaScript. These aren't made-up - they're the actual languages used by real indie developers making real games you can buy on Steam.",
            "The lessons ahead will teach you variables, conditionals, loops, functions, objects, and debugging. Yes, debugging. Because 90% of game dev is asking 'why doesn't this work?' at 3am."
          ]}
          tips={[
            "Pick a game engine. Each has its own syntax but the CONCEPTS are universal.",
            "Fill in the blanks (___) in the code. It's like Mad Libs but for programmers.",
            "Use the hints if you're stuck. No shame in learning.",
            "Complete all 6 lessons to unlock the final step. You've got this!"
          ]}
          buttonText="Let's Learn to Code"
          onContinue={dismissIntro}
        />
      </AnimatePresence>
    );
  }

  if (!selectedEngine) {
    return (
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold flex items-center justify-center gap-3 mb-3">
            <Code className="h-8 w-8 text-primary" />
            Code Cauldron
          </h2>
          <p className="text-muted-foreground text-lg mb-2">
            Time to learn some REAL code! Pick your weapon of choice.
          </p>
          <p className="text-sm text-muted-foreground">
            Each engine has its own language and style. Choose wisely... or don't. We won't judge.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {ENGINES.map((engine) => (
            <Card 
              key={engine.id} 
              className="hover-elevate cursor-pointer transition-all"
              onClick={() => selectEngine(engine.id)}
              data-testid={`card-engine-${engine.id}`}
            >
              <CardHeader className="text-center pb-3">
                <div className={`${engine.color} w-16 h-16 rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                  <Gamepad2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle>{engine.fullName}</CardTitle>
                <Badge variant="secondary" className="mx-auto">
                  {engine.language}
                </Badge>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">{engine.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button variant="outline" onClick={onBack} data-testid="button-back">
            Back to World Anvil
          </Button>
          <Button variant="ghost" onClick={onComplete} data-testid="button-skip-engine">
            Skip (I'll code later)
          </Button>
        </div>
      </div>
    );
  }

  const engineInfo = ENGINES.find(e => e.id === selectedEngine)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Code className="h-6 w-6 text-primary" />
              Code Cauldron
            </h2>
            <Badge className={`${engineInfo.color} text-white`}>
              {engineInfo.fullName}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Learning {engineInfo.language} • 
            <button 
              className="text-primary underline hover:text-primary/80 ml-1"
              onClick={() => setSelectedEngine(null)}
              data-testid="button-change-engine"
            >
              Change Engine
            </button>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="font-bold">{completedLessons.size}/{lessons.length} lessons</p>
          </div>
          <Progress value={progress} className="w-32" />
        </div>
      </div>

      <Tabs value={currentLesson?.id} className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          {lessons.map((lesson, index) => (
            <TabsTrigger
              key={lesson.id}
              value={lesson.id}
              onClick={() => {
                setCurrentLessonIndex(index);
                setUserCode(lesson.starterCode);
                setOutput("");
                setIsCorrect(null);
                setShowHint(0);
              }}
              className="gap-2"
              data-testid={`tab-lesson-${lesson.id}`}
            >
              {completedLessons.has(lesson.id) ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <span className="text-muted-foreground">{index + 1}</span>
              )}
              <span className="hidden sm:inline">{lesson.concept}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {currentLesson && (
          <TabsContent value={currentLesson.id} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {currentLesson.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Learning: <Badge variant="secondary">{currentLesson.concept}</Badge>
                    </CardDescription>
                  </div>
                  {completedLessons.has(currentLesson.id) && (
                    <Badge className="bg-green-500 gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">The Lesson</h4>
                  <p className="text-sm text-muted-foreground">{currentLesson.description}</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Real Game Dev Use
                  </h4>
                  <p className="text-sm">{currentLesson.realWorldUse}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between gap-2">
                    <span>Your Code</span>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetCode}
                        data-testid="button-reset-code"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={showNextHint}
                        disabled={showHint >= currentLesson.hints.length}
                        data-testid="button-hint"
                      >
                        <Lightbulb className="h-4 w-4 mr-1" />
                        Hint ({showHint}/{currentLesson.hints.length})
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="w-full h-64 p-4 font-mono text-sm bg-muted rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    spellCheck={false}
                    data-testid="textarea-code"
                  />
                  {showHint > 0 && (
                    <div className="space-y-2">
                      {currentLesson.hints.slice(0, showHint).map((hint, i) => (
                        <Alert key={i} className="py-2">
                          <Lightbulb className="h-4 w-4" />
                          <AlertDescription className="text-sm">{hint}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                  <Button 
                    onClick={runCode} 
                    className="w-full gap-2"
                    data-testid="button-run-code"
                  >
                    <Play className="h-4 w-4" />
                    Run Code
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Output
                    {isCorrect !== null && (
                      isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className={`min-h-64 p-4 font-mono text-sm rounded-lg whitespace-pre-wrap ${
                      isCorrect === true ? "bg-green-500/10 border border-green-500/30" :
                      isCorrect === false ? "bg-red-500/10 border border-red-500/30" :
                      "bg-muted"
                    }`}
                    data-testid="output-console"
                  >
                    {output || "Click 'Run Code' to see output..."}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      <div className="flex items-center justify-between gap-4 flex-wrap pt-4 border-t">
        <Button variant="outline" onClick={onBack} data-testid="button-back">
          Back to World Anvil
        </Button>
        
        {allComplete ? (
          <Button onClick={onComplete} className="gap-2" data-testid="button-complete-coding">
            <Trophy className="h-4 w-4" />
            Proceed to Fate Switchboard
          </Button>
        ) : (
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Complete all lessons to proceed (or skip if you're a rebel)
            </p>
            {currentLessonIndex < lessons.length - 1 && currentLesson && completedLessons.has(currentLesson.id) && (
              <Button onClick={nextLesson} variant="outline" className="gap-2" data-testid="button-next-lesson">
                Next Lesson
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              onClick={onComplete}
              data-testid="button-skip-coding"
            >
              Skip (I fear education)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
