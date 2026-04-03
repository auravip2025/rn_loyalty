import { useEffect, useState } from 'react';

// MOCK QUERIES
export const GET_MERCHANTS = `
  query GetMerchants {
    merchants { id name category categoryEmoji distance rating reviewCount open address phone hours website image description tags visitCount programs { id name desc active icon color segments } offers { id title desc discount expires } reviews { author rating text date } }
  }
`;

export const GET_PROGRAMS = `
  query GetPrograms {
    programs {
      id
      name
      desc
      active
      color
      icon
      segments
    }
  }
`;

export const GET_WALLET = `
  query GetWallet {
    wallet {
      balance
      transactions {
        id
        merchant
        amount
        type
        date
      }
    }
  }
`;

export const GET_DAILY_QUESTS = `
  query GetDailyQuests {
    dailyQuests {
      id
      title
      desc
      points
      icon
      completed
    }
  }
`;

export const GET_OFFERS = `
  query GetOffers {
    offers {
      id
      title
      desc
      image
      price
    }
    storeMenus {
      storeName
      items {
        id
        title
        price
        image
      }
    }
  }
`;

// MOCK MUTATIONS
export const DEDUCT_POINTS = `mutation DeductPoints($amount: Int!, $merchant: String!) { deductPoints(amount: $amount, merchant: $merchant) { success wallet { balance } } }`;
export const EARN_POINTS = `mutation EarnPoints($amount: Int!, $merchant: String!) { earnPoints(amount: $amount, merchant: $merchant) { success wallet { balance } } }`;

// MOCK DATABASE
let DB = {
    merchants: [
        {
            id: 'm1', name: 'The Coffee House', category: 'Café', categoryEmoji: '☕',
            distance: '0.2 km', rating: 4.8, reviewCount: 312, open: true, visitCount: 980,
            address: '123 Orchard Road, #01-12', phone: '+65 6234 5678',
            hours: 'Mon–Sun: 7:00 AM – 10:00 PM', website: 'coffeehouse.com',
            image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600',
            description: 'Award-winning specialty coffee roasters serving single-origin brews and artisan pastries since 2012.',
            tags: ['Popular', 'Trending'],
            programs: [
                { id: 1, name: 'Loyalty Points', desc: '1 pt per $1 spent', active: true, icon: 'Star', color: 'indigo' },
                { id: 4, name: 'Digital Stamps', desc: 'Buy 9, Get 1 Free', active: true, icon: 'QrCode', color: 'emerald' },
                { id: 2, name: 'Wheel of Fortune', desc: 'Daily spin for bonus points', active: true, icon: 'RefreshCw', color: 'amber', 
                  segments: [
                    { label: '50 Pts', color: '#6366f1', type: 'points', value: 50 },
                    { label: '0 Luck', color: '#94a3b8', type: 'none', value: 0 },
                    { label: '10% Off', color: '#10b981', type: 'discount', value: 10 },
                    { label: 'Free Tea', color: '#f59e0b', type: 'item', value: 'Tea' },
                    { label: '2x Pts', color: '#ec4899', type: 'multiplier', value: 2 },
                  ]
                },
            ],
            offers: [
                { id: 'o1', title: '1-for-1 Latte', desc: 'Every Tuesday, 2–5 PM', discount: '50%', expires: '31 Dec 2025' },
                { id: 'o2', title: 'Free Pastry', desc: 'With any cold brew purchase', discount: 'FREE', expires: '15 Dec 2025' },
            ],
            reviews: [
                { author: 'Sarah L.', rating: 5, text: 'Best flat white in town. Cozy vibes and fast service!', date: '2 days ago' },
                { author: 'James T.', rating: 5, text: 'Love the loyalty stamps — already on my 8th!', date: '1 week ago' },
                { author: 'Priya K.', rating: 4, text: 'Great coffee, sometimes busy on weekends.', date: '2 weeks ago' },
            ],
        },
        {
            id: 'm2', name: 'Urban Outfitters', category: 'Fashion', categoryEmoji: '👗',
            distance: '0.5 km', rating: 4.5, reviewCount: 187, open: true, visitCount: 645,
            address: '456 Somerset Road, #03-08', phone: '+65 6345 6789',
            hours: 'Mon–Thu: 10:00 AM – 9:00 PM, Fri–Sun: 10:00 AM – 10:00 PM', website: 'urbanoutfitters.com',
            image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600',
            description: 'Curated lifestyle and fashion brand for the urban explorer. New arrivals every week.',
            tags: ['Trending'],
            programs: [
                { id: 2, name: 'Member Discount', desc: 'Flat 10% off for members', active: true, icon: 'Percent', color: 'blue' },
                { id: 8, name: 'Wheel of Fortune', desc: 'Style spin!', active: true, icon: 'RefreshCw', color: 'amber',
                  segments: [
                    { label: 'Shoes', color: '#6366f1', type: 'item', value: 'Shoes' },
                    { label: '20% Off', color: '#10b981', type: 'discount', value: 20 },
                    { label: '500 Pts', color: '#f59e0b', type: 'points', value: 500 },
                    { label: 'Try Next Time', color: '#94a3b8', type: 'none', value: 0 },
                  ]
                },
            ],
            offers: [
                { id: 'o3', title: '$10 Voucher', desc: 'Min. spend $50', discount: '$10 OFF', expires: '20 Dec 2025' },
                { id: 'o4', title: 'Student Deal', desc: '15% off with student ID', discount: '15%', expires: '31 Jan 2026' },
            ],
            reviews: [
                { author: 'Michelle C.', rating: 5, text: 'Great selection, loved the loyalty perks!', date: '3 days ago' },
                { author: 'Ali R.', rating: 4, text: 'Nice store layout and helpful staff.', date: '5 days ago' },
            ],
        },
        {
            id: 'm3', name: 'Tech Junction', category: 'Electronics', categoryEmoji: '💻',
            distance: '1.1 km', rating: 4.2, reviewCount: 89, open: true, visitCount: 420,
            address: '789 Plaza Singapura, #B1-15', phone: '+65 6456 7890',
            hours: 'Mon–Sun: 11:00 AM – 9:00 PM', website: 'techjunction.sg',
            image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
            description: 'Your one-stop shop for the latest gadgets, accessories and tech repairs.',
            tags: ['New'],
            programs: [
                { id: 3, name: 'Loyalty Points', desc: '2 pts per $1 spent', icon: 'Star', color: 'indigo' },
                { id: 7, name: 'Referral Engine', desc: 'Give $5, Get $5', icon: 'Users', color: 'indigo' },
            ],
            offers: [
                { id: 'o5', title: '5% Cashback', desc: 'On all accessories', discount: '5% BACK', expires: '28 Feb 2026' },
            ],
            reviews: [
                { author: 'Kevin W.', rating: 4, text: 'Good prices on accessories. Staff knows their stuff.', date: '1 week ago' },
                { author: 'Nadia M.', rating: 5, text: 'Got a great deal on earphones using my loyalty pts!', date: '2 weeks ago' },
            ],
        },
        {
            id: 'm4', name: 'Green Grocer', category: 'Grocery', categoryEmoji: '🛒',
            distance: '1.4 km', rating: 4.9, reviewCount: 534, open: true, visitCount: 1200,
            address: '321 Tiong Bahru, #01-05', phone: '+65 6567 8901',
            hours: 'Mon–Sun: 8:00 AM – 10:00 PM', website: 'greengrocer.sg',
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
            description: 'Premium organic grocery store with fresh produce, artisan foods and eco-friendly household products.',
            tags: ['Popular', 'Eco-Friendly'],
            programs: [
                { id: 3, name: 'Loyalty Points', desc: '1 pt per $1 spent', active: true, icon: 'Star', color: 'indigo' },
                { id: 9, name: 'Wheel of Fortune', desc: 'Fresh rewards!', active: true, icon: 'RefreshCw', color: 'amber',
                  segments: [
                    { label: 'Organic Apple', color: '#10b981', type: 'item', value: 'Apple' },
                    { label: 'Free Delivery', color: '#6366f1', type: 'item', value: 'Delivery' },
                    { label: '5% Extra', color: '#f59e0b', type: 'discount', value: 5 },
                    { label: 'No Luck', color: '#94a3b8', type: 'none', value: 0 },
                  ]
                },
            ],
            offers: [
                { id: 'o6', title: 'Fresh Friday', desc: '20% off all vegetables on Fridays', discount: '20%', expires: 'Weekly' },
                { id: 'o7', title: 'Bundle & Save', desc: 'Buy 3 organic items, pay for 2', discount: '33%', expires: '31 Dec 2025' },
            ],
            reviews: [
                { author: 'Anna B.', rating: 5, text: 'Best organic store in the area! Fresh every day.', date: '1 day ago' },
                { author: 'Daniel L.', rating: 5, text: 'The stamp rewards are fantastic. Shop here weekly!', date: '4 days ago' },
                { author: 'Grace C.', rating: 5, text: 'Eco-friendly packaging and amazing quality produce.', date: '1 week ago' },
            ],
        },
        {
            id: 'm5', name: 'Fit Gym', category: 'Fitness', categoryEmoji: '💪',
            distance: '2.0 km', rating: 4.7, reviewCount: 156, open: false, visitCount: 380,
            address: '654 Bugis Street, #04-01', phone: '+65 6678 9012',
            hours: 'Mon–Fri: 6:00 AM – 11:00 PM, Sat–Sun: 7:00 AM – 9:00 PM', website: 'fitgym.sg',
            image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
            description: 'Modern fitness centre with state-of-the-art equipment, group classes and personal training.',
            tags: [],
            programs: [
                { id: 6, name: 'Tiered Loyalty', desc: 'Bronze → Silver → Gold perks', icon: 'Crown', color: 'purple' },
                { id: 7, name: 'Referral Engine', desc: '1 free month per referral', icon: 'Users', color: 'indigo' },
            ],
            offers: [
                { id: 'o8', title: 'First Month Free', desc: 'New members only', discount: 'FREE', expires: '31 Jan 2026' },
                { id: 'o9', title: 'Buddy Pass', desc: 'Bring a friend free on weekends', discount: 'FREE', expires: 'Weekly' },
            ],
            reviews: [
                { author: 'Ryan T.', rating: 5, text: 'Clean facility, great equipment, friendly trainers.', date: '3 days ago' },
                { author: 'Fiona H.', rating: 4, text: 'Love the group classes. Gets a bit crowded at peak hours.', date: '1 week ago' },
            ],
        },
        {
            id: 'm6', name: 'Din Tai Fung', category: 'Restaurant', categoryEmoji: '🍜',
            distance: '0.8 km', rating: 4.9, reviewCount: 1240, open: true, visitCount: 2100,
            address: '2 Orchard Turn, #04-12 ION', phone: '+65 6732 4963',
            hours: 'Mon–Sun: 10:00 AM – 10:00 PM', website: 'dintaifung.com.sg',
            image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600',
            description: 'World-renowned Taiwanese restaurant famous for its handcrafted xiao long bao and quality dim sum.',
            tags: ['Popular', 'Trending'],
            programs: [
                { id: 3, name: 'Loyalty Points', desc: '1 pt per $1 spent', active: true, icon: 'Star', color: 'indigo' },
                { id: 5, name: 'Scratch & Win', desc: 'Try your luck!', active: true, icon: 'Ticket', color: 'rose',
                  segments: [
                    { label: '100 Pts', color: '#6366f1', type: 'points', value: 100 },
                    { label: '5% Off', color: '#10b981', type: 'discount', value: 5 },
                    { label: 'Free XLB', color: '#f59e0b', type: 'item', value: 'XLB' },
                    { label: 'Try Again', color: '#94a3b8', type: 'none', value: 0 },
                  ]
                },
            ],
            offers: [
                { id: 'o10', title: 'Free XLB Set', desc: 'Redeem with 500 points', discount: 'FREE', expires: 'Ongoing' },
                { id: 'o11', title: 'Weekday Lunch Deal', desc: 'Set meal from $18.80', discount: '15%', expires: 'Weekdays only' },
            ],
            reviews: [
                { author: 'Huiling T.', rating: 5, text: 'XLB are perfect every single time. Never disappoints!', date: '1 day ago' },
                { author: 'Martin L.', rating: 5, text: 'Queues are worth it. The best DTF branch in Singapore.', date: '3 days ago' },
            ],
        },
    ],
    programs: [
        {
            id: 1,
            name: 'Wheel of Fortune',
            desc: 'Daily spin for bonus points',
            active: true,
            color: 'amber',
            icon: 'RefreshCw',
            merchantId: 'm1',
            segments: [
                { label: '50 Pts', color: '#6366f1', type: 'points', value: 50 },
                { label: 'No Luck', color: '#94a3b8', type: 'none', value: 0 },
                { label: '10% Off', color: '#10b981', type: 'discount', value: 10 },
                { label: 'Free Tea', color: '#f59e0b', type: 'item', value: 'Tea' },
                { label: '2x Pts', color: '#ec4899', type: 'multiplier', value: 2 },
                { label: 'Try Again', color: '#94a3b8', type: 'none', value: 0 },
            ]
        },
        {
            id: 2,
            name: 'Scratch & Win',
            desc: 'Gamified chance to win discounts',
            active: true,
            color: 'rose',
            icon: 'Ticket',
            merchantId: 'm6',
            segments: [
                { label: '100 Pts', color: '#6366f1', type: 'points', value: 100 },
                { label: '5% Off', color: '#10b981', type: 'discount', value: 5 },
                { label: 'Free Coffee', color: '#f59e0b', type: 'item', value: 'Coffee' },
                { label: 'Better Luck Next Time', color: '#94a3b8', type: 'none', value: 0 },
            ]
        },
        { id: 3, name: 'Loyalty Points', desc: '1 pt per $1 spend', active: true, color: 'indigo', icon: 'Star' },
        { id: 4, name: 'Digital Stamps', desc: 'Buy 9, Get 1 Free', active: true, color: 'emerald', icon: 'QrCode', merchantId: 'm4' },
        { id: 5, name: 'Member Discount', desc: 'Flat 10% off for members', active: false, color: 'blue', icon: 'Percent' },
        { id: 6, name: 'Tiered Loyalty', desc: 'Bronze, Silver, Gold benefits', active: true, color: 'purple', icon: 'Crown' },
        { id: 7, name: 'Referral Engine', desc: 'Give $5, Get $5', active: true, color: 'indigo', icon: 'Users' },
    ],
    wallet: {
        balance: 12450,
        transactions: [
            { id: 1, merchant: 'The Coffee House', amount: 50, type: 'earn', date: 'Today, 10:23 AM' },
            { id: 2, merchant: 'Urban Outfitters', amount: 1200, type: 'spend', date: 'Yesterday' },
            { id: 3, merchant: 'Green Grocer', amount: 350, type: 'earn', date: 'Oct 24' },
        ]
    },
    dailyQuests: [
        { id: 1, title: 'Check In', desc: 'Visit a partnered store today', points: 10, icon: 'MapPin', completed: false },
        { id: 2, title: 'First Purchase', desc: 'Buy any coffee item', points: 25, icon: 'Coffee', completed: true },
        { id: 4, title: 'Daily Spin', desc: 'Spin the Wheel of Fortune', points: 50, icon: 'RefreshCw', completed: false },
        { id: 5, title: 'Daily Scratch', desc: 'Scratch a card to win', points: 50, icon: 'Eraser', completed: false },
        { id: 3, title: 'Refer a Friend', desc: 'Get a friend to sign up', points: 150, icon: 'UserPlus', completed: false }
    ],
    offers: [
        { id: 1, title: "1-for-1 Kopi", desc: "Toast Box", image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400", price: 2.50 },
        { id: 2, title: "$10 Voucher", desc: "Uniqlo", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400", price: 10.00 },
        { id: 3, title: "Free XLB", desc: "Din Tai Fung", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400", price: 0.00 },
        { id: 4, title: "15% Off", desc: "Charles & Keith", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400", price: 50.00 },
        { id: 5, title: "$5 Off", desc: "GrabFood", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400", price: 5.00 }
    ],
    storeMenus: {
        "Toast Box": [
            { id: 'tb1', title: 'Traditional Kaya Toast', price: 2.20, image: 'https://images.unsplash.com/photo-1484723091798-ddba0ce48fd9?w=200' },
            { id: 'tb2', title: 'Kopi O', price: 1.80, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200' },
            { id: 'tb3', title: 'Soft Boiled Eggs (2)', price: 2.00, image: 'https://images.unsplash.com/photo-1525286102434-2e90f23f6832?w=200' },
        ],
        "Uniqlo": [
            { id: 'uq1', title: 'AIRism Cotton T-Shirt', price: 19.90, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200' },
            { id: 'uq2', title: 'EZY Jeans', price: 49.90, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200' },
        ],
        "Din Tai Fung": [
            { id: 'dtf1', title: 'Pork Xiao Long Bao', price: 9.80, image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200' },
            { id: 'dtf2', title: 'Pork Chop Fried Rice', price: 14.50, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200' },
        ],
        "Charles & Keith": [
            { id: 'ck1', title: 'Classic Hobo Bag', price: 69.90, image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=200' },
            { id: 'ck2', title: 'Strappy Sandals', price: 49.90, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200' },
        ],
        "GrabFood": [
            { id: 'gf1', title: 'Delivery Pass', price: 9.90, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200' }
        ]
    }
};

// SIMULATED HOOKS
export const useQuery = (query, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refetch = async () => {
        setLoading(true);
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log("🛠️ Mock GraphQL executing:", query?.substring(0, 30));

                if (query === GET_MERCHANTS) {
                    setData({ merchants: JSON.parse(JSON.stringify(DB.merchants)) });
                } else if (query === GET_PROGRAMS) {
                    setData({ programs: JSON.parse(JSON.stringify(DB.programs)) });
                    console.log("🛠️ Mock GraphQL GET_PROGRAMS executed successfully");
                } else if (query === GET_WALLET) {
                    setData({ wallet: JSON.parse(JSON.stringify(DB.wallet)) });
                    console.log("🛠️ Mock GraphQL GET_WALLET executed successfully");
                } else if (query === GET_DAILY_QUESTS) {
                    setData({ dailyQuests: JSON.parse(JSON.stringify(DB.dailyQuests)) });
                    console.log("🛠️ Mock GraphQL GET_DAILY_QUESTS executed successfully");
                } else if (query === GET_OFFERS) {
                    setData({
                        offers: JSON.parse(JSON.stringify(DB.offers)),
                        storeMenus: JSON.parse(JSON.stringify(DB.storeMenus))
                    });
                    console.log("🛠️ Mock GraphQL GET_OFFERS executed successfully");
                } else {
                    console.warn("🛠️ Mock GraphQL query not found in DB match map: ", query);
                }
                setLoading(false);
                resolve();
            }, 600);
        });
    };

    useEffect(() => {
        refetch();
    }, [query]);

    return { data, loading, error, refetch };
};

export const useMutation = (mutation) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mutate = async ({ variables }) => {
        setLoading(true);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                setLoading(false);
                try {
                    if (mutation === DEDUCT_POINTS) {
                        DB.wallet.balance -= variables.amount;
                        const newTx = {
                            id: Date.now(), merchant: variables.merchant, amount: variables.amount, type: 'spend', date: 'Just now',
                        };
                        DB.wallet.transactions.unshift(newTx);
                        resolve({ data: { deductPoints: { success: true, wallet: DB.wallet } } });
                    } else if (mutation === EARN_POINTS) {
                        DB.wallet.balance += variables.amount;
                        const newTx = {
                            id: Date.now(), merchant: variables.merchant, amount: variables.amount, type: 'earn', date: 'Just now',
                        };
                        DB.wallet.transactions.unshift(newTx);
                        resolve({ data: { earnPoints: { success: true, wallet: DB.wallet } } });
                    } else if (typeof mutation === 'string' && mutation.includes('Authenticate')) {
                        resolve({
                            data: {
                                authenticate: {
                                    success: true,
                                    message: "Mock OTP sent successfully",
                                    expiresIn: 300,
                                    cooldown: 60
                                }
                            }
                        });
                    } else if (typeof mutation === 'string' && mutation.includes('VerifyOtp')) {
                        resolve({
                            data: {
                                verifyOtp: {
                                    success: true,
                                    message: "Mock OTP verified",
                                    token: "mock_token",
                                    refreshToken: "mock_refresh_token",
                                    isNewUser: false,
                                    expiresIn: 86400,
                                    tokenType: "Bearer",
                                    user: {
                                        id: "mock_user_1",
                                        email: variables.email,
                                        role: variables.email?.includes('merchant') ? 'merchant' : 'customer',
                                        isEmailVerified: true,
                                        createdAt: new Date().toISOString()
                                    }
                                }
                            }
                        });
                    } else {
                        resolve({ data: { success: true } });
                    }
                } catch (e) {
                    setError(e);
                    reject(e);
                }
            }, 500);
        });
    };

    return [mutate, { loading, error }];
};
