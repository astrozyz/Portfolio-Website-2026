/**
 * ===========================================
 *  PORTFOLIO DATA - Edit this file to update content
 * ===========================================
 *
 *  TO ADD A NEW GAME:
 *  1. Copy any game object below
 *  2. Paste it at the end of the GAMES array
 *  3. Fill in your details
 *  4. Drop a thumbnail PNG into assets/images/game-thumbnails/
 *
 *  TO ADD A NEW VIDEO:
 *  1. Copy any video object below
 *  2. Paste it at the end of the VIDEOS array
 *  3. Fill in your details (youtubeId is the part after v= in the URL)
 *
 * ===========================================
 */

const GAMES = [
  {
    title: "Build a Marble Slide",
    thumbnail: "assets/images/game-thumbnails/build-a-marble-slide.png",
    universeId: 9150975254,
    placeId: 84907238849255,
  },
  {
    title: "Melee Legends",
    thumbnail: "assets/images/game-thumbnails/melee-legends.png",
    universeId: 9991881549,
    placeId: 92239005601484,
  },
  {
    title: "Number Challenge",
    thumbnail: "assets/images/game-thumbnails/eyesight-challenge.png",
    universeId: 9625977424,
    placeId: 91606062090436,
  },
  {
    title: "Escape Quicksand for Brainrots",
    thumbnail: "assets/images/game-thumbnails/escape-quicksand.png",
    universeId: 9557415132,
    placeId: 129315204746120,
  },
  {
    title: "No-Scope Arcade",
    thumbnail: "assets/images/game-thumbnails/noscope-arcade.png",
    universeId: 2382284116,
    placeId: 6407649031,
  },
  {
    title: "Derailed",
    thumbnail: "assets/images/game-thumbnails/derailed.png",
    universeId: 6251164898,
    placeId: 18444521971,
  },
  {
    title: "Infinite Autocorrect",
    thumbnail: "assets/images/game-thumbnails/infinite.png",
    universeId: 1216008237,
    placeId: 3403470694,
  },
  {
    title: "Stunt Simulator",
    thumbnail: "assets/images/game-thumbnails/stunt.png",
    universeId: 5268677200,
    placeId: 15277199491,
  },
];

/**
 * ===========================================
 *  CAREER EXTRA GAMES (counted in totals only)
 * ===========================================
 *  Games you've worked on that are NOT shown as cards above, but whose
 *  visits + live players ARE added to the "Total Visits / Players Online"
 *  banner above the games grid.
 *
 *  TO ADD ONE: paste a new line with the title and universeId. You only
 *  need the universeId (no thumbnail or placeId, since there's no card).
 *  Find a game's universeId by opening its Roblox page and calling:
 *  https://apis.roblox.com/universes/v1/places/<placeId>/universe
 * ===========================================
 */
const CAREER_EXTRA = [
  { title: "Cake Off", universeId: 6052033819 },
  { title: "No-Scope Sniping", universeId: 1760106570 },
  { title: "No-Scope Arcade (original)", universeId: 5147355667 },
  { title: "Pistol 1v1", universeId: 2540872233 },
  { title: "What's The Word", universeId: 1613338202 },
  { title: "Caliber", universeId: 2249804607 },
  { title: "Oakdale Arena", universeId: 7260705807 },
  { title: "Paint Drying Tycoon", universeId: 3799945482 },
];

const VIDEOS = [
  {
    title: "VORTEX-ENGINE",
    description: "A custom-built FPS framework in Roblox, featuring smooth gunplay mechanics and responsive physics systems.",
    youtubeId: "Tjhm8xAXB-k",
  },
  {
    title: "Agar.io Game Framework",
    description: "A complete Agar.io-style game framework built from scratch in Roblox, featuring eating mechanics and multiplayer gameplay.",
    youtubeId: "z9piMxAuCb8",
  },
  {
    title: "RDR2 Dead Eye",
    description: "A recreation of Red Dead Redemption 2's Dead Eye mechanic in Roblox, featuring slow-motion targeting and visual effects.",
    youtubeId: "4u-3SqPh6Yc",
  },
];

/**
 * ===========================================
 *  SITE CONFIG
 * ===========================================
 *  Change the Cloudflare Worker URL after you deploy it.
 *  Leave it empty to disable live stats (will show "—" instead).
 * ===========================================
 */
const SITE_CONFIG = {
  // Your Cloudflare Worker URL for live Roblox stats
  // Example: "https://roblox-stats.your-subdomain.workers.dev"
  workerUrl: "https://mute-cherry-db47.frickmedaddy693.workers.dev",

  // How often to refresh live stats (in milliseconds)
  statsRefreshInterval: 60000, // 60 seconds
};
