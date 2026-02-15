import {
  LayoutGrid,
  CreditCard,
  QrCode,
  PieChart,
  User,
  TrendingUp,
  Store,
  Gift,
  Settings,
} from 'lucide-react-native';

export const customerTabs = [
  { id: 'home', icon: LayoutGrid, label: 'Home' },
  { id: 'wallet', icon: CreditCard, label: 'Wallet' },
  { id: 'scan', icon: QrCode, label: 'Scan', primary: true },
  { id: 'stats', icon: PieChart, label: 'Insights' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export const merchantTabs = [
  { id: 'home', icon: TrendingUp, label: 'Home' },
  { id: 'store', icon: Store, label: 'Store' },
  { id: 'scan', icon: QrCode, label: 'Scan', primary: true },
  { id: 'catalog', icon: Gift, label: 'Catalog' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export const POINTS_CONVERSION_RATE = 0.01;
export const DAILY_SPIN_LIMIT = 1;
export const DAILY_SCRATCH_LIMIT = 1;

export const OFFERS = [
  {
    id: 1,
    title: "1-for-1 Kopi",
    desc: "Toast Box",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400", // Coffee
    price: 2.50
  },
  {
    id: 2,
    title: "$10 Voucher",
    desc: "Uniqlo",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400", // Clothing
    price: 10.00
  },
  {
    id: 3,
    title: "Free XLB",
    desc: "Din Tai Fung",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=400", // Dumplings
    price: 0.00
  },
  {
    id: 4,
    title: "15% Off",
    desc: "Charles & Keith",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400", // Shoes
    price: 50.00
  },
  {
    id: 5,
    title: "$5 Off",
    desc: "GrabFood",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400", // Food delivery
    price: 5.00
  },
  {
    id: 6,
    title: "Free Upsize",
    desc: "Starbucks",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400", // Coffee Cup
    price: 0.00
  },
  {
    id: 7,
    title: "20% Off Bill",
    desc: "Hai Di Lao",
    image: "https://images.unsplash.com/photo-1549396535-c11d5c55b9df?auto=format&fit=crop&q=80&w=400", // Hotpot
    price: 30.00
  },
  {
    id: 8,
    title: "Free Ticket",
    desc: "Golden Village",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400", // Cinema
    price: 14.50
  },
];

export const NEARBY_STORES = [
  { name: 'The Coffee House', category: 'Cafe', distance: '0.2 km', rating: 4.8, active: true },
  { name: 'Urban Outfitters', category: 'Fashion', distance: '0.5 km', rating: 4.5, active: false },
  { name: 'Tech Junction', category: 'Electronics', distance: '1.1 km', rating: 4.2, active: true },
  { name: 'Green Grocer', category: 'Grocery', distance: '1.4 km', rating: 4.9, active: true },
  { name: 'Fit Gym', category: 'Fitness', distance: '2.0 km', rating: 4.7, active: false },
];