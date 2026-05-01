/**
 * rewardDetails — keyword-based mock product details for reward/offer items.
 *
 * Works the same way as rewardImages.ts: the first keyword that matches
 * the reward name (case-insensitive) wins. Falls back to DEFAULT_DETAILS.
 */

export interface RewardDetails {
  category: string;
  highlights: string[];                       // emoji-prefixed short phrases (×3)
  specs: { label: string; value: string }[];  // table rows
  includes?: string[];                        // "what's included" bullet list
  allergens?: string;                         // allergy / dietary note
  terms: string;                              // fine print
}

// ── Detail catalogue ──────────────────────────────────────────────────────────
const DETAILS_MAP: [string, RewardDetails][] = [

  // ── Cappuccino ──────────────────────────────────────────────────────────────
  ['cappucc', {
    category: 'Hot Coffee',
    highlights: ['☕ Double Espresso Shot', '🥛 Steamed Whole Milk', '🫧 Velvety Microfoam'],
    specs: [
      { label: 'Size',         value: 'Regular (240 ml)' },
      { label: 'Temperature',  value: 'Hot' },
      { label: 'Espresso',     value: '2 shots' },
      { label: 'Milk options', value: 'Whole · Oat · Soy' },
      { label: 'Calories',     value: '~120 kcal' },
    ],
    allergens: 'Contains dairy. Oat/soy milk alternatives available on request.',
    terms: 'Redeemable once per customer. Valid at participating outlets during operating hours. Cannot be combined with other offers.',
  }],

  // ── Latte ───────────────────────────────────────────────────────────────────
  ['latte', {
    category: 'Hot Coffee',
    highlights: ['☕ Espresso Base', '🥛 Silky Steamed Milk', '🎨 Latte Art'],
    specs: [
      { label: 'Size',         value: 'Regular (300 ml)' },
      { label: 'Temperature',  value: 'Hot or Iced' },
      { label: 'Espresso',     value: '1–2 shots' },
      { label: 'Milk options', value: 'Whole · Oat · Almond' },
      { label: 'Calories',     value: '~150 kcal' },
    ],
    allergens: 'Contains dairy.',
    terms: 'Valid at all participating outlets during operating hours.',
  }],

  // ── Espresso ────────────────────────────────────────────────────────────────
  ['espresso', {
    category: 'Hot Coffee',
    highlights: ['☕ Pure Espresso', '⚡ Bold & Intense', '🫘 Single Origin Beans'],
    specs: [
      { label: 'Volume',      value: '30 ml' },
      { label: 'Temperature', value: 'Hot' },
      { label: 'Roast',       value: 'Medium-dark' },
      { label: 'Extraction',  value: '25–30 seconds' },
      { label: 'Calories',    value: '~5 kcal' },
    ],
    terms: 'One redemption per visit. Valid at participating cafés.',
  }],

  // ── Flat white ──────────────────────────────────────────────────────────────
  ['flat white', {
    category: 'Hot Coffee',
    highlights: ['☕ Ristretto Base', '🥛 Microfoam Milk', '🎨 Velvet Texture'],
    specs: [
      { label: 'Size',        value: 'Small (160 ml)' },
      { label: 'Temperature', value: 'Hot' },
      { label: 'Espresso',    value: 'Double ristretto' },
      { label: 'Milk ratio',  value: '3:1 milk-to-coffee' },
      { label: 'Calories',    value: '~100 kcal' },
    ],
    allergens: 'Contains dairy.',
    terms: 'Valid at participating outlets. Not transferable.',
  }],

  // ── Generic coffee ──────────────────────────────────────────────────────────
  ['coffee', {
    category: 'Beverages',
    highlights: ['☕ Freshly Brewed', '🫘 Specialty Beans', '🌡️ Hot or Iced'],
    specs: [
      { label: 'Size',        value: 'Regular' },
      { label: 'Temperature', value: 'Hot or Iced' },
      { label: 'Beans',       value: 'Arabica blend' },
      { label: 'Calories',    value: '~80 kcal' },
    ],
    terms: 'Valid at participating outlets during operating hours.',
  }],

  // ── Americano ───────────────────────────────────────────────────────────────
  ['americano', {
    category: 'Hot Coffee',
    highlights: ['☕ Espresso & Hot Water', '🫘 Rich & Smooth', '⚡ High Caffeine'],
    specs: [
      { label: 'Size',        value: 'Regular (300 ml)' },
      { label: 'Temperature', value: 'Hot or Iced' },
      { label: 'Espresso',    value: '2 shots' },
      { label: 'Calories',    value: '~10 kcal' },
    ],
    terms: 'Valid at participating outlets. One redemption per customer.',
  }],

  // ── Mocha ───────────────────────────────────────────────────────────────────
  ['mocha', {
    category: 'Hot Coffee',
    highlights: ['☕ Espresso & Chocolate', '🥛 Steamed Milk', '🍫 Rich Cocoa'],
    specs: [
      { label: 'Size',        value: 'Regular (300 ml)' },
      { label: 'Temperature', value: 'Hot or Iced' },
      { label: 'Espresso',    value: '2 shots' },
      { label: 'Chocolate',   value: 'Belgian dark cocoa' },
      { label: 'Calories',    value: '~220 kcal' },
    ],
    allergens: 'Contains dairy and may contain traces of nuts.',
    terms: 'Valid at participating outlets. Not combinable with other offers.',
  }],

  // ── Juice ───────────────────────────────────────────────────────────────────
  ['juice', {
    category: 'Fresh Beverages',
    highlights: ['🍊 Cold-Pressed', '🌿 No Added Sugar', '💊 Vitamin C Boost'],
    specs: [
      { label: 'Volume',    value: '300 ml' },
      { label: 'Served',    value: 'Chilled' },
      { label: 'Made from', value: 'Seasonal fresh fruit' },
      { label: 'Sugar',     value: 'None added' },
      { label: 'Calories',  value: '~90 kcal' },
    ],
    allergens: 'May contain traces of nuts. Not suitable for severe nut allergies.',
    terms: 'Redeemable once per customer. Subject to seasonal availability.',
  }],

  // ── Smoothie ────────────────────────────────────────────────────────────────
  ['smoothie', {
    category: 'Fresh Beverages',
    highlights: ['🫐 Fresh Blended', '🌿 No Preservatives', '🥤 Nutrient-Rich'],
    specs: [
      { label: 'Volume',   value: '350 ml' },
      { label: 'Base',     value: 'Fruit & yogurt' },
      { label: 'Sugar',    value: 'Natural only' },
      { label: 'Calories', value: '~180 kcal' },
    ],
    allergens: 'Contains dairy (yogurt base). Dairy-free options may be available.',
    terms: 'Valid at participating outlets. One redemption per visit.',
  }],

  // ── Milo ────────────────────────────────────────────────────────────────────
  ['milo', {
    category: 'Hot & Cold Drinks',
    highlights: ['🧋 Malt Chocolate', '🧊 Iced or Hot', '💪 Energising Blend'],
    specs: [
      { label: 'Volume',    value: '250 ml' },
      { label: 'Temp',      value: 'Hot or Iced' },
      { label: 'Sweetness', value: 'Regular or Less Sugar' },
      { label: 'Milk',      value: 'Whole milk' },
      { label: 'Calories',  value: '~180 kcal' },
    ],
    allergens: 'Contains dairy and barley malt.',
    terms: 'Valid at participating outlets. Not exchangeable for cash.',
  }],

  // ── Cake ────────────────────────────────────────────────────────────────────
  ['cake', {
    category: 'Desserts & Pastries',
    highlights: ['🎂 Freshly Baked Daily', '🧁 Artisan Crafted', '🍫 Premium Ingredients'],
    specs: [
      { label: 'Serves',   value: '1 person' },
      { label: 'Made',     value: 'Fresh daily' },
      { label: 'Size',     value: 'Regular slice (~120 g)' },
      { label: 'Storage',  value: 'Best enjoyed same day' },
      { label: 'Calories', value: '~320 kcal' },
    ],
    allergens: 'Contains gluten, dairy, and eggs. May contain traces of nuts.',
    terms: 'Subject to daily availability. Redeemable once per visit. No cash equivalent.',
  }],

  // ── Pastry / croissant ──────────────────────────────────────────────────────
  ['pastry', {
    category: 'Bakery',
    highlights: ['🥐 Oven Fresh', '🧈 Butter Laminated', '☕ Perfect with Coffee'],
    specs: [
      { label: 'Made',     value: 'Fresh each morning' },
      { label: 'Layers',   value: '72-layer lamination' },
      { label: 'Butter',   value: 'French AOP butter' },
      { label: 'Calories', value: '~290 kcal' },
    ],
    allergens: 'Contains gluten and dairy.',
    terms: 'Subject to morning availability. Best enjoyed before 3 pm.',
  }],

  // ── Muffin / cupcake ────────────────────────────────────────────────────────
  ['muffin', {
    category: 'Bakery',
    highlights: ['🧁 Freshly Baked', '🍓 Seasonal Fillings', '🌾 Whole Grain Option'],
    specs: [
      { label: 'Serves',   value: '1 person' },
      { label: 'Size',     value: 'Standard (~100 g)' },
      { label: 'Made',     value: 'Fresh daily' },
      { label: 'Calories', value: '~350 kcal' },
    ],
    allergens: 'Contains gluten, dairy, and eggs.',
    terms: 'Subject to daily availability. One per redemption.',
  }],

  // ── Donut ───────────────────────────────────────────────────────────────────
  ['donut', {
    category: 'Sweet Treats',
    highlights: ['🍩 Freshly Glazed', '🎨 Choice of Flavour', '☕ Pairs with Coffee'],
    specs: [
      { label: 'Count',    value: '1 donut' },
      { label: 'Made',     value: 'Fresh daily' },
      { label: 'Flavours', value: 'Classic · Chocolate · Strawberry' },
      { label: 'Size',     value: 'Regular (~80 g)' },
      { label: 'Calories', value: '~280 kcal' },
    ],
    allergens: 'Contains gluten, dairy, and eggs. Frying oil shared with nuts.',
    terms: 'Subject to flavour availability. One per redemption. Valid same day.',
  }],

  // ── Biryani ─────────────────────────────────────────────────────────────────
  ['biryani', {
    category: 'Signature Meals',
    highlights: ['🍛 Slow-Cooked 4 Hours', '🌶️ Choice of Spice Level', '🧄 Aromatic Basmati'],
    specs: [
      { label: 'Serves',      value: '1 person' },
      { label: 'Preparation', value: 'Slow-cooked 4 hours' },
      { label: 'Rice',        value: 'Long grain basmati' },
      { label: 'Protein',     value: 'Chicken · Mutton · Veg' },
      { label: 'Spice',       value: 'Mild · Medium · Spicy' },
      { label: 'Calories',    value: '~650 kcal' },
    ],
    allergens: 'Contains gluten (wheat). Nuts used in preparation.',
    terms: 'Redeemable during dine-in only. Valid at participating outlets. One redemption per visit.',
  }],

  // ── Generic meal ────────────────────────────────────────────────────────────
  ['meal', {
    category: 'Main Course',
    highlights: ['🍽️ Chef Prepared', '🌿 Fresh Ingredients', '🔥 Made to Order'],
    specs: [
      { label: 'Serves',      value: '1 person' },
      { label: 'Preparation', value: 'Made fresh per order' },
      { label: 'Included',    value: 'Main + side' },
    ],
    terms: 'Valid during dining hours. Dine-in only. Subject to menu availability.',
  }],

  // ── Salon ───────────────────────────────────────────────────────────────────
  ['salon', {
    category: 'Beauty & Wellness',
    highlights: ['💆 Professional Stylist', '⏱️ 45–60 Minutes', '✨ Premium Products'],
    specs: [
      { label: 'Service',     value: 'Hair Cut & Style' },
      { label: 'Duration',    value: '45–60 minutes' },
      { label: 'Appointment', value: 'Required (24h advance)' },
      { label: 'Gender',      value: 'Unisex' },
    ],
    includes: ['Shampoo & blow dry', 'Style consultation', 'Complimentary scalp massage'],
    terms: 'Advance booking required. Cannot be used on public holidays. One redemption per customer per month.',
  }],

  // ── Hair ────────────────────────────────────────────────────────────────────
  ['hair', {
    category: 'Hair Care',
    highlights: ['✂️ Expert Cut', '💈 Styling Included', '🧴 Treatment Available'],
    specs: [
      { label: 'Service',     value: 'Haircut & Finish' },
      { label: 'Duration',    value: '30–45 minutes' },
      { label: 'Appointment', value: 'Walk-in or booked' },
    ],
    includes: ['Hair wash', 'Cut & blow dry', 'Styling'],
    terms: 'Subject to stylist availability. Booking recommended on weekends.',
  }],

  // ── Spa ─────────────────────────────────────────────────────────────────────
  ['spa', {
    category: 'Spa & Wellness',
    highlights: ['🧖 Full Body Relaxation', '🌿 Aromatherapy Oils', '⏱️ 60 Minutes'],
    specs: [
      { label: 'Duration',    value: '60 minutes' },
      { label: 'Type',        value: 'Swedish or deep tissue' },
      { label: 'Appointment', value: 'Required (48h advance)' },
    ],
    includes: ['60-minute full-body massage', 'Aromatherapy oil of your choice', 'Post-session herbal tea'],
    terms: 'Advance booking required. Non-refundable once confirmed. Not valid on public holidays.',
  }],

  // ── Mobile / phone accessories ───────────────────────────────────────────────
  ['mobile', {
    category: 'Tech Accessories',
    highlights: ['📱 Wide Compatibility', '🛡️ Military-Grade Drop Protection', '🎨 Multiple Designs'],
    specs: [
      { label: 'Type',        value: 'Protective case' },
      { label: 'Compatible',  value: 'All major phone brands' },
      { label: 'Material',    value: 'Polycarbonate + TPU' },
      { label: 'Protection',  value: 'MIL-STD-810G drop' },
      { label: 'Warranty',    value: '6 months' },
    ],
    includes: ['1 phone case', 'Microfibre cleaning cloth', 'Screen wipe'],
    terms: 'Exchange/return within 14 days with original packaging intact. Colours and models subject to stock availability.',
  }],

  // ── Movie ticket ─────────────────────────────────────────────────────────────
  ['movie', {
    category: 'Entertainment',
    highlights: ['🎬 Any Movie', '💺 Standard Seat', '🍿 Complimentary Snack'],
    specs: [
      { label: 'Ticket type', value: 'Standard admission' },
      { label: 'Valid at',    value: 'All partner cinemas' },
      { label: 'Seat type',   value: 'Standard class' },
      { label: 'Validity',    value: '3 months from redemption' },
      { label: 'Transferable', value: 'No' },
    ],
    includes: ['1 standard cinema ticket', 'Complimentary small popcorn', 'Choice of any film & showtime'],
    terms: 'Not valid for premium formats (IMAX, 4DX, Dolby Atmos). Valid for one admission per redemption. Subject to seat availability. Online booking fee may apply.',
  }],

  // ── Travel voucher ───────────────────────────────────────────────────────────
  ['travel', {
    category: 'Travel & Holidays',
    highlights: ['✈️ Flexible Booking Dates', '🏨 Hotels & Flights', '🌏 Worldwide Use'],
    specs: [
      { label: 'Voucher value', value: 'As displayed' },
      { label: 'Valid for',     value: 'Flights, hotels & packages' },
      { label: 'Booking',       value: 'Via partner app or website' },
      { label: 'Validity',      value: '6 months from issue date' },
      { label: 'Stackable',     value: 'Up to 3 vouchers per booking' },
    ],
    includes: ['Digital voucher code (emailed within 24h)', 'Applicable to any partner booking', 'Priority customer support line'],
    terms: 'Cannot be exchanged for cash. Subject to seat/room availability. Blackout dates may apply during peak travel seasons.',
  }],
];

// ── Fallback ──────────────────────────────────────────────────────────────────
const DEFAULT_DETAILS: RewardDetails = {
  category: 'Special Offer',
  highlights: ['🎁 Exclusive Reward', '✅ Verified Offer', '⚡ Limited Time Deal'],
  specs: [
    { label: 'Type',         value: 'Loyalty Reward' },
    { label: 'Validity',     value: 'As displayed' },
    { label: 'Transferable', value: 'No' },
  ],
  terms: 'Terms and conditions apply. Contact the merchant for full details. One redemption per customer per offer.',
};

/**
 * Returns mock product/service details for the given reward name.
 * First keyword match wins; falls back to DEFAULT_DETAILS.
 */
export function getRewardDetails(name: string | null | undefined): RewardDetails {
  if (!name) return DEFAULT_DETAILS;
  const lower = name.toLowerCase();
  for (const [keyword, details] of DETAILS_MAP) {
    if (lower.includes(keyword)) return details;
  }
  return DEFAULT_DETAILS;
}
