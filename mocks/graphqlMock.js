import { useEffect, useState } from 'react';

// MOCK QUERIES
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
    programs: [
        {
            id: 1,
            name: 'Wheel of Fortune',
            desc: 'Daily spin for bonus points',
            active: true,
            color: 'amber',
            icon: 'RefreshCw',
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
            segments: [
                { label: '100 Pts', color: '#6366f1', type: 'points', value: 100 },
                { label: '5% Off', color: '#10b981', type: 'discount', value: 5 },
                { label: 'Free Coffee', color: '#f59e0b', type: 'item', value: 'Coffee' },
                { label: 'Better Luck Next Time', color: '#94a3b8', type: 'none', value: 0 },
            ]
        },
        { id: 3, name: 'Loyalty Points', desc: '1 pt per $1 spend', active: true, color: 'indigo', icon: 'Star' },
        { id: 4, name: 'Digital Stamps', desc: 'Buy 9, Get 1 Free', active: true, color: 'emerald', icon: 'QrCode' },
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

                if (query === GET_PROGRAMS) {
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
