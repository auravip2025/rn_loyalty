/**
 * rewardImages — maps reward/offer names to bundled local image assets.
 *
 * React Native requires static require() calls (evaluated at bundle time),
 * so all assets are pre-loaded here and selected at runtime via keyword
 * matching on the reward name. The matcher is intentionally broad so new
 * rewards get a sensible image without a code change.
 *
 * Usage:
 *   import { getRewardImage } from '../../utils/rewardImages';
 *   const img = getRewardImage(item.name);          // returns require() or null
 *   <Image source={img ?? { uri: fallbackUrl }} />
 */

import { ImageSourcePropType } from 'react-native';

// ── Static asset map (all require() calls must be literals) ───────────────────
const IMAGES: Record<string, ImageSourcePropType> = {
  latte:         require('../assets/images/latte.png'),
  juice:         require('../assets/images/juice.png'),
  juice2:        require('../assets/images/juice2.png'),
  iceMilo:       require('../assets/images/ice milo.png'),
  cake1:         require('../assets/images/cake 1.png'),
  cake2:         require('../assets/images/cake 2.png'),
  donuts:        require('../assets/images/donuts.png'),
  biryani:       require('../assets/images/biryani.png'),
  saloon:        require('../assets/images/saloon.png'),
  mobileCovers:  require('../assets/images/mobile covers.png'),
  movie:         require('../assets/images/movie.png'),
  travel:        require('../assets/images/travel.png'),
};

// ── Keyword → asset key mapping ───────────────────────────────────────────────
// Each entry is [keyword (lowercase), asset key]. First match wins.
const KEYWORD_MAP: [string, keyof typeof IMAGES][] = [
  // Coffee / drinks
  ['cappucc',  'latte'],
  ['cappucin', 'latte'],
  ['latte',    'latte'],
  ['espresso', 'latte'],
  ['flat white','latte'],
  ['coffee',   'latte'],
  ['americano','latte'],
  ['mocha',    'latte'],
  // Juices / smoothies
  ['juice',    'juice'],
  ['smoothie', 'juice'],
  ['fresh',    'juice2'],
  // Milo / chocolate drinks
  ['milo',     'iceMilo'],
  ['iced milo','iceMilo'],
  ['chocolate drink', 'iceMilo'],
  ['teh',      'iceMilo'],
  // Cakes / pastries
  ['cake',     'cake1'],
  ['pastry',   'cake2'],
  ['dessert',  'cake1'],
  ['cupcake',  'cake2'],
  ['muffin',   'cake2'],
  // Donuts
  ['donut',    'donuts'],
  ['doughnut', 'donuts'],
  // Food / biryani
  ['biryani',  'biryani'],
  ['nasi',     'biryani'],
  ['rice',     'biryani'],
  ['meal',     'biryani'],
  ['food',     'biryani'],
  // Salon / beauty
  ['salon',    'saloon'],
  ['saloon',   'saloon'],
  ['hair',     'saloon'],
  ['beauty',   'saloon'],
  ['spa',      'saloon'],
  ['facial',   'saloon'],
  ['manicure', 'saloon'],
  // Mobile / tech accessories
  ['mobile',   'mobileCovers'],
  ['phone',    'mobileCovers'],
  ['cover',    'mobileCovers'],
  ['case',     'mobileCovers'],
  ['gadget',   'mobileCovers'],
  // Movies / entertainment
  ['movie',    'movie'],
  ['cinema',   'movie'],
  ['film',     'movie'],
  ['ticket',   'movie'],
  // Travel
  ['travel',   'travel'],
  ['holiday',  'travel'],
  ['vacation', 'travel'],
  ['trip',     'travel'],
  ['flight',   'travel'],
];

/**
 * Returns a bundled ImageSourcePropType for the given reward/offer name,
 * or null if no keyword matches (component should show its own placeholder).
 */
export function getRewardImage(name: string | null | undefined): ImageSourcePropType | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  for (const [keyword, key] of KEYWORD_MAP) {
    if (lower.includes(keyword)) return IMAGES[key];
  }
  return null;
}
