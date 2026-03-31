Learn the fundimentals of Game Development through a simple game-style UI.
Teaches you everything from sprite creation to world building, and teaches you the basics of code through fun puzzles.
Choose from 3 different game engines to learn the code! Currently offers: Game MAker Studio (GML), RPGMaker (JavaScript, RGSS), and Unity (C#). Will be adding more engines in the future!

The Character Creator allows you to add a personality to your sprites, bringing your characters to life! Give them deep backstories, thing Dungeons and Dragons style!
The World Builder allows you to create and craft the world your characters live in! Get as detailed as you can, and you can come back and add more as you go!

The Code Cauldron currently gives you the choice between learning GML (Game Maker Language), RPGMaker (JavaScript) and Unity (C#). I've crafted simple code puzzles for you to solve, 
Learning to code hands-on. I will be adding more choices for game engines in later updates (UnrealEngine, Godot, CryEngine, Roblox Studio <eww, I know, but it's extremely popular).

When you feel you've completed the game, you can "publish" it for other users to check out, you can put it in Dev Hell, or you can banish it to the shadow realm. I will be adding more in-depth
pieces to publishing, I woud like for it to teach you the ins and outs of publishing a game, IE advertising, choosing a platform to release, etc.

Fake Game Foundry is an all-in-one way to learn game development, broken down and simplified. My goal with FGF is to continue to birth a new generation of game developers,
and to show people that it's not incredibly complicated. Yes, building a game is a large task, and it's not mickey-mouse simple; but I aim to break it down to bite-sized
pieces for people to understand that it's fun, and it's doable.

*|		|##***ARCHITECTURE OVERVIEW***|
*|
*|This project is built using a modern, full-stack Typescript architecture, separating the client-side user interface from the server-side API and database operations.|
*|
*|			|##***Frontend Architecture***#|
*|------------------------------------|The frontend is a single-page application (SPA) buit for high performance and rapid development.|
*|			|#**CORE FRAMEWORK**#|
*|---------------------|React|
*|			|#**LANGUAGE**#|
*|---------------------|TypeSript| - for strong type safety and better developer experience.|
*|
*|			|#**BUILD TOOL AND BUNDLER**#|
*|------------------------|Vite| - for extremely fast Hot Module replacement (HMR) and optimized production builds.|
*|
*|			|#**STYLING**#|
*|--------------|Tailwind CSS| - for utility-first, responsive styling.|
*|
*|			|#**UI COMPONENTS**#|
*|
*|------------------ShadCN - for customizable UI components.|
*|
*|			|#**STATE MANAGEMENT/LOGIC**#|
*|
*|------------------------------|Custom React hooks|
*|
*|			|#**SOURCE LOCATION**#|
*|
*|----------------------------|All frontend source code is primarily housed in the 'client/' directory.|
*|
*|
*|			|##***BACKEND ARCHITECTURE***#|
*|
*|------------------------------------------|The backend serves as a robust API to handle business logic, data persistence, and communication with the frontend.|
*|
*|			|**RUNTIME ENVIRONMENT**|
*|
*|------------------------|Node.js|
*|
*|			|**LANGUAGE**|
*|
*|------------------------|TypeScript|
*|
*|			|**DATABASE ORM**
*|
*|------------------------|Drizzle ORM|----For type-safe database queries and schema management.|
*|
*|			|**API/SERVER**|
*|
*|-----------------------|Node.js Web Server (Express)|---Handling requests and serving data to the client.|
*|
*|			|**SOURCE LOCATION**|
*|
*|----------------------|All backend logic, API routes, and database connections are located in the '/server' directory.|
*|
*|				|##***SHARED RESOURCES***##|
*|
*|----------------------|the 'shared/' directory is used to maintain single sources of truth for both the frontend and backend. This includes Typescript interfaces,|
*|----------------------|Validation schemas (e.g. ZOD), and Drizzle database schemas so the client and server stay perfectly in sync.|
*|
*|				|##***DEPLOYMENT AND DEVOPS***##|
*|
*|			|**CONTAINERIZATION**|
*|
*|---------------------|Docker, ('Dockerfile', '.dockerignore')|Is used to containerize the application for consistent environments across development and production.|
*|
*|			|**HOSTING**|
*|
*|---------------------|Configured for deployment on 'Fly.io' (https://fly.io)|





*  FakeGameStudio/
*|----------attached_assets/  # Media, Images sprites and other static assets used in the application.
*|----------client/  ##the React/Vite frontend application (UI components, pages, routing and styling).
*|----------hooks/   # Custom reusable React hooks or project-level Git hooks.
*|----------info/    # Documentation, project notes, or supplementary info.
*|----------refs/    # Project references, configurations, or version control refs.
*|----------script/   # Utility scripts for tasks like database migrations, seeding, or build process.
*|----------server/   # The Node.js backend application (API routes, business logic, and database controllers).
*|----------shared     # TypeScript types, Drizzle schemas, and validation logic shared between client and server.
*|----------Dockerfile/   # Containerization instructions for deploying the app.
*|----------drizzle.config.ts    # Config for the Drizzle ORM (Database connections and schema path).
*|----------fly.toml         # Deployment config for hosting the app on Fly.io.
*|----------tailwind.config.ts    # Config for Tailwind CSS styling.
*|----------vite.config.ts       # Config for the Vite frontend build tool/






***Directory Highlights***
*  client/: Everything the user sees and interacts with lives here. It handles state, UI rendering, and communicating with the backend API.
*  server/: The brain of the operation. It securely handles database operations, processes game data, and serves the frontend.
*  shared/: A crucial folder for full-stack TypeScript apps. By keeping database schemas (like Drizzle) and types here,
  |the frontend and backend remain perfectly in sync, preventing data mismatch bugs.
*  script/: Handy automations and terminal scripts to make logic development and database management smoother.



**And that is Fake Game Foundry. Now go forth and fucking CREATE. BUILD GAMES. MAKE GAMES. YOU CAN BE A GAME DEVELOPER. YOU CAN DO IT. I BELIEVE IN YOU.**
