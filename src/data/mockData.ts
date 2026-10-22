import { Branch, User, RawIngredient, MenuItem, Transaction, StockAlert } from '../types';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b-senopati',
    name: 'KopiKula Senopati (Flagship)',
    code: 'SNP',
    city: 'Jakarta Selatan',
    address: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
    phone: '021-57892341',
    managerName: 'Siti Aisyah',
    isHQ: true,
    isActive: true,
  },
  {
    id: 'b-dago',
    name: 'KopiKula Dago Heritage',
    code: 'DGO',
    city: 'Bandung',
    address: 'Jl. Ir. H. Juanda No. 118, Dago, Bandung',
    phone: '022-4219988',
    managerName: 'Dian Permata',
    isHQ: false,
    isActive: true,
  },
  {
    id: 'b-canggu',
    name: 'KopiKula Sunset Canggu',
    code: 'CGU',
    city: 'Bali',
    address: 'Jl. Pantai Batu Bolong No. 88, Canggu, Badung, Bali',
    phone: '0361-987234',
    managerName: 'Wayan Putra',
    isHQ: false,
    isActive: true,
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    name: 'Rendra Pratama',
    role: 'admin_pusat',
    branchId: 'b-senopati',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    pin: '1234',
  },
  {
    id: 'u-manager-senopati',
    name: 'Siti Aisyah',
    role: 'manajer_toko',
    branchId: 'b-senopati',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    pin: '2345',
  },
  {
    id: 'u-cashier-senopati',
    name: 'Budi Santoso',
    role: 'kasir',
    branchId: 'b-senopati',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    pin: '3456',
  },
  {
    id: 'u-manager-dago',
    name: 'Dian Permata',
    role: 'manajer_toko',
    branchId: 'b-dago',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    pin: '4567',
  },
];

export const INITIAL_INGREDIENTS: RawIngredient[] = [
  {
    id: 'ing-kopi-gayo',
    name: 'Biji Kopi Arabika Gayo (Roast Profile Medium)',
    sku: 'ING-KOP-01',
    category: 'Kopi & Biji',
    unit: 'gram',
    minStockThreshold: 2000,
    costPerUnit: 280, // Rp 280 per gram
    stockByBranch: {
      'b-senopati': 4500,
      'b-dago': 1800, // below min threshold (triggers warning!)
      'b-canggu': 3200,
    },
    supplier: 'Koperasi Tani Gayo Highlands',
    lastRestockedAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'ing-kopi-robusta',
    name: 'Biji Kopi Robusta Dampit Malang',
    sku: 'ING-KOP-02',
    category: 'Kopi & Biji',
    unit: 'gram',
    minStockThreshold: 1500,
    costPerUnit: 160,
    stockByBranch: {
      'b-senopati': 3800,
      'b-dago': 2900,
      'b-canggu': 2100,
    },
    supplier: 'CV Roastery Nusantara',
    lastRestockedAt: '2026-10-15T11:00:00Z',
  },
  {
    id: 'ing-susu-fresh',
    name: 'Susu Segar Pasteurised Full Cream',
    sku: 'ING-DAI-01',
    category: 'Susu & Dairy',
    unit: 'ml',
    minStockThreshold: 8000,
    costPerUnit: 26, // Rp 26/ml (~Rp 26.000 / Liter)
    stockByBranch: {
      'b-senopati': 5200, // critical/warning!
      'b-dago': 12000,
      'b-canggu': 9500,
    },
    supplier: 'PT Greenfields Dairy Indonesia',
    lastRestockedAt: '2026-10-21T06:00:00Z',
  },
  {
    id: 'ing-susu-oat',
    name: 'Susu Oat Barista Edition (Oatly)',
    sku: 'ING-DAI-02',
    category: 'Susu & Dairy',
    unit: 'ml',
    minStockThreshold: 3000,
    costPerUnit: 48,
    stockByBranch: {
      'b-senopati': 4000,
      'b-dago': 1200, // below min!
      'b-canggu': 3500,
    },
    supplier: 'PT Multi Boga Lestari',
    lastRestockedAt: '2026-10-19T09:30:00Z',
  },
  {
    id: 'ing-gula-aren',
    name: 'Gula Aren Organik Cair Murni',
    sku: 'ING-SRP-01',
    category: 'Sirup & Gula',
    unit: 'ml',
    minStockThreshold: 2500,
    costPerUnit: 35,
    stockByBranch: {
      'b-senopati': 6800,
      'b-dago': 4200,
      'b-canggu': 5100,
    },
    supplier: 'Gula Aren Semut Lestari Banten',
    lastRestockedAt: '2026-10-20T14:00:00Z',
  },
  {
    id: 'ing-sirup-karamel',
    name: 'Sirup Karamel Gourmet Monin',
    sku: 'ING-SRP-02',
    category: 'Sirup & Gula',
    unit: 'ml',
    minStockThreshold: 1000,
    costPerUnit: 90,
    stockByBranch: {
      'b-senopati': 2100,
      'b-dago': 1500,
      'b-canggu': 1800,
    },
    supplier: 'PT Prambanan Kencana',
    lastRestockedAt: '2026-10-12T13:00:00Z',
  },
  {
    id: 'ing-matcha',
    name: 'Pure Matcha Uji Ceremonial Grade',
    sku: 'ING-TEH-01',
    category: 'Teh & Powder',
    unit: 'gram',
    minStockThreshold: 400,
    costPerUnit: 420,
    stockByBranch: {
      'b-senopati': 1100,
      'b-dago': 650,
      'b-canggu': 320, // warning!
    },
    supplier: 'Kyoto Tea Importers',
    lastRestockedAt: '2026-10-10T10:00:00Z',
  },
  {
    id: 'ing-cokelat',
    name: 'Belgian Dark Chocolate Powder 70%',
    sku: 'ING-TEH-02',
    category: 'Teh & Powder',
    unit: 'gram',
    minStockThreshold: 800,
    costPerUnit: 240,
    stockByBranch: {
      'b-senopati': 2400,
      'b-dago': 1900,
      'b-canggu': 1500,
    },
    supplier: 'Callebaut Indo Distributor',
    lastRestockedAt: '2026-10-16T11:00:00Z',
  },
  {
    id: 'ing-cup-cold',
    name: 'Cup PET Bening 16oz + Tutup Dome',
    sku: 'ING-PKG-01',
    category: 'Packaging',
    unit: 'pcs',
    minStockThreshold: 250,
    costPerUnit: 950,
    stockByBranch: {
      'b-senopati': 750,
      'b-dago': 420,
      'b-canggu': 610,
    },
    supplier: 'PT Kemasan Citra Mandiri',
    lastRestockedAt: '2026-10-17T15:00:00Z',
  },
  {
    id: 'ing-cup-hot',
    name: 'Paper Cup Double Wall 8oz + Lid',
    sku: 'ING-PKG-02',
    category: 'Packaging',
    unit: 'pcs',
    minStockThreshold: 150,
    costPerUnit: 800,
    stockByBranch: {
      'b-senopati': 480,
      'b-dago': 310,
      'b-canggu': 290,
    },
    supplier: 'PT Kemasan Citra Mandiri',
    lastRestockedAt: '2026-10-17T15:00:00Z',
  },
  {
    id: 'ing-sedotan',
    name: 'Sedotan PLA Bio-Degradable 8mm',
    sku: 'ING-PKG-03',
    category: 'Packaging',
    unit: 'pcs',
    minStockThreshold: 300,
    costPerUnit: 180,
    stockByBranch: {
      'b-senopati': 1200,
      'b-dago': 850,
      'b-canggu': 900,
    },
    supplier: 'EcoPack Bali Green',
    lastRestockedAt: '2026-10-14T09:00:00Z',
  },
  {
    id: 'ing-mentega',
    name: 'French Butter Elle & Vire 82% Fat',
    sku: 'ING-BKR-01',
    category: 'Bakery & Dapur',
    unit: 'gram',
    minStockThreshold: 1500,
    costPerUnit: 195,
    stockByBranch: {
      'b-senopati': 3200,
      'b-dago': 2100,
      'b-canggu': 1900,
    },
    supplier: 'PT Sukanda Djaya',
    lastRestockedAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'ing-daging-wagyu',
    name: 'Daging Cincang Wagyu Meltique MB5',
    sku: 'ING-BKR-02',
    category: 'Bakery & Dapur',
    unit: 'gram',
    minStockThreshold: 1200,
    costPerUnit: 250,
    stockByBranch: {
      'b-senopati': 3500,
      'b-dago': 2200,
      'b-canggu': 1800,
    },
    supplier: 'Meat Prima Supply Jakarta',
    lastRestockedAt: '2026-10-19T07:00:00Z',
  },
  {
    id: 'ing-kentang',
    name: 'Shoestring Potato Fries Premium',
    sku: 'ING-BKR-03',
    category: 'Bakery & Dapur',
    unit: 'gram',
    minStockThreshold: 2000,
    costPerUnit: 45,
    stockByBranch: {
      'b-senopati': 5400,
      'b-dago': 3100,
      'b-canggu': 4200,
    },
    supplier: 'PT Sukanda Djaya',
    lastRestockedAt: '2026-10-18T11:00:00Z',
  },
  {
    id: 'ing-truffle-oil',
    name: 'White Truffle Infused Olive Oil',
    sku: 'ING-BKR-04',
    category: 'Bakery & Dapur',
    unit: 'ml',
    minStockThreshold: 200,
    costPerUnit: 600,
    stockByBranch: {
      'b-senopati': 850,
      'b-dago': 420,
      'b-canggu': 510,
    },
    supplier: 'Gourmet Imports Asia',
    lastRestockedAt: '2026-10-10T14:00:00Z',
  },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm-kopi-susu-kula',
    name: 'Kopi Susu Kula Aren (Signature)',
    sku: 'COF-KULA-01',
    category: 'Signature',
    basePrice: 24000,
    description: 'Double espresso Arabika Gayo berpadu dengan susu segar lembut dan manis legit gula aren organik.',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=500&q=80',
    isAvailable: true,
    isFeatured: true,
    recipe: [
      { ingredientId: 'ing-kopi-gayo', ingredientName: 'Biji Kopi Arabika Gayo', quantity: 18, unit: 'gram' },
      { ingredientId: 'ing-susu-fresh', ingredientName: 'Susu Segar Full Cream', quantity: 140, unit: 'ml' },
      { ingredientId: 'ing-gula-aren', ingredientName: 'Gula Aren Organik', quantity: 25, unit: 'ml' },
      { ingredientId: 'ing-cup-cold', ingredientName: 'Cup Cold 16oz', quantity: 1, unit: 'pcs' },
      { ingredientId: 'ing-sedotan', ingredientName: 'Sedotan Bio', quantity: 1, unit: 'pcs' },
    ],
    sugarOptions: ['Normal (100%)', 'Less Sweet (50%)', 'Slight Sweet (25%)', 'No Sugar (0%)'],
    iceOptions: ['Normal Ice', 'Less Ice', 'No Ice'],
    milkOptions: [
      { name: 'Fresh Milk (Default)', extraPrice: 0 },
      { name: 'Oat Milk Oatly', extraPrice: 8000 },
    ],
    sizeOptions: [
      { name: 'Regular 16oz', extraPrice: 0 },
      { name: 'Large 20oz (+1 shot)', extraPrice: 6000 },
    ],
  },
  {
    id: 'm-caramel-macchiato',
    name: 'Caramel Macchiato Velvet',
    sku: 'COF-CARA-02',
    category: 'Signature',
    basePrice: 32000,
    description: 'Espresso bold dengan silky steamed milk berlayer sirup karamel Monin dan drizzle saus karamel keemasan.',
    imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=500&q=80',
    isAvailable: true,
    isFeatured: true,
    recipe: [
      { ingredientId: 'ing-kopi-gayo', ingredientName: 'Biji Kopi Arabika Gayo', quantity: 18, unit: 'gram' },
      { ingredientId: 'ing-susu-fresh', ingredientName: 'Susu Segar Full Cream', quantity: 160, unit: 'ml' },
      { ingredientId: 'ing-sirup-karamel', ingredientName: 'Sirup Karamel Monin', quantity: 20, unit: 'ml' },
      { ingredientId: 'ing-cup-cold', ingredientName: 'Cup Cold 16oz', quantity: 1, unit: 'pcs' },
      { ingredientId: 'ing-sedotan', ingredientName: 'Sedotan Bio', quantity: 1, unit: 'pcs' },
    ],
    sugarOptions: ['Normal Sweet', 'Less Sweet', 'No Added Sugar'],
    iceOptions: ['Normal Ice', 'Less Ice'],
    milkOptions: [
      { name: 'Fresh Milk (Default)', extraPrice: 0 },
      { name: 'Oat Milk Oatly', extraPrice: 8000 },
    ],
  },
  {
    id: 'm-espresso-solo',
    name: 'Espresso Doppio (Double Shot)',
    sku: 'COF-ESP-01',
    category: 'Kopi',
    basePrice: 18000,
    description: 'Ekstraksi murni 36ml dengan crema tebal keemasan, aroma floral & citrus khas Arabika Gayo.',
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=500&q=80',
    isAvailable: true,
    recipe: [
      { ingredientId: 'ing-kopi-gayo', ingredientName: 'Biji Kopi Arabika Gayo', quantity: 18, unit: 'gram' },
      { ingredientId: 'ing-cup-hot', ingredientName: 'Cup Hot 8oz', quantity: 1, unit: 'pcs' },
    ],
  },
  {
    id: 'm-americano',
    name: 'Americano Classico (Hot / Iced)',
    sku: 'COF-AME-01',
    category: 'Kopi',
    basePrice: 22000,
    description: 'Espresso double shot dipadukan dengan air mineral murni, clean aftertaste dan kaya cita rasa.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
    isAvailable: true,
    recipe: [
      { ingredientId: 'ing-kopi-gayo', ingredientName: 'Biji Kopi Arabika Gayo', quantity: 18, unit: 'gram' },
      { ingredientId: 'ing-cup-cold', ingredientName: 'Cup Cold 16oz', quantity: 1, unit: 'pcs' },
      { ingredientId: 'ing-sedotan', ingredientName: 'Sedotan Bio', quantity: 1, unit: 'pcs' },
    ],
    iceOptions: ['Iced (Dingin)', 'Hot (Panas)'],
  },
  {
    id: 'm-cafe-latte',
    name: 'Artisan Cafe Latte',
    sku: 'COF-LAT-01',
    category: 'Kopi',
    basePrice: 28000,
    description: 'Harmoni espresso arabika dan steamed fresh milk dengan microfoam lembut berhias latte art indah.',
    imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=500&q=80',
    isAvailable: true,
    recipe: [
      { ingredientId: 'ing-kopi-gayo', ingredientName: 'Biji Kopi Arabika Gayo', quantity: 18, unit: 'gram' },
      { ingredientId: 'ing-susu-fresh', ingredientName: 'Susu Segar Full Cream', quantity: 180, unit: 'ml' },
      { ingredientId: 'ing-cup-hot', ingredientName: 'Cup Hot 8oz', quantity: 1, unit: 'pcs' },
    ],
    iceOptions: ['Hot (Panas)', 'Iced (Dingin +Rp 2.000)'],
    milkOptions: [
      { name: 'Fresh Milk', extraPrice: 0 },
      { name: 'Oat Milk Oatly', extraPrice: 8000 },
    ],
  },
  {
    id: 'm-manual-brew-v60',
    name: 'Manual Brew V60 Gayo Single Origin',
    sku: 'COF-V60-01',
    category: 'Kopi',
    basePrice: 30000,
    description: 'Metode seduh manual pour-over mengeluarkan profil rasa buah berry, jasmine blossom, dan honey.',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80',
    isAvailable: true,
    recipe: [
      { ingredientId: 'ing-kopi-gayo', ingredientName: 'Biji Kopi Arabika Gayo', quantity: 15, unit: 'gram' },
      { ingredientId: 'ing-cup-hot', ingredientName: 'Cup Hot 8oz', quantity: 1, unit: 'pcs' },
    ],
  },
  {
    id: 'm-matcha-latte',
    name: 'Kyoto Uji Matcha Latte',
    sku: 'NCF-MTC-01',
    category: 'Non-Kopi',
    basePrice: 32000,
    description: 'Bubuk Matcha asli Kyoto Jepang grade seremonial yang kaya antioksidan dan rasa umami seimbang.',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80',
    isAvailable: true,
    recipe: [
      { ingredientId: 'ing-matcha', ingredientName: 'Pure Matcha Uji', quantity: 12, unit: 'gram' },
      { ingredientId: 'ing-susu-fresh', ingredientName: 'Susu Segar Full Cream', quantity: 160, unit: 'ml' },
      { ingredientId: 'ing-cup-cold', ingredientName: 'Cup Cold 16oz', quantity: 1, unit: 'pcs' },
      { ingredientId: 'ing-sedotan', ingredientName: 'Sedotan Bio', quantity: 1, unit: 'pcs' },
    ],
    sugarOptions: ['Normal Sweet', 'Less Sweet', 'No Added Sugar'],
    iceOptions: ['Normal Ice', 'Less Ice'],
    milkOptions: [
      { name: 'Fresh Milk', extraPrice: 0 },
      { name: 'Oat Milk Oatly', extraPrice: 8000 },
    ],
  },
  {
    id: 'm-belgian-choco',
    name: 'Royal Belgian Dark Chocolate',
    sku: 'NCF-CHO-01',
    category: 'Non-Kopi',
    basePrice: 29000,
    description: 'Cokelat hitam Belgia 70% yang kaya, kental, dan creamy dengan aroma vanili alami.',
    imageUrl: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=500&q=80',
    isAvailable: true,
    recipe: [
      { ingredientId: 'ing-cokelat', ingredientName: 'Belgian Chocolate Powder', quantity: 30, unit: 'gram' },
      { ingredientId: 'ing-susu-fresh', ingredientName: 'Susu Segar Full Cream', quantity: 160, unit: 'ml' },
      { ingredientId: 'ing-cup-cold', ingredientName: 'Cup Cold 16oz', quantity: 1, unit: 'pcs' },
      { ingredientId: 'ing-sedotan', ingredientName: 'Sedotan Bio', quantity: 1, unit: 'pcs' },
    ],
    iceOptions: ['Iced (Dingin)', 'Hot (Panas)'],
  },
  {
    id: 'm-croissant-butter',
    name: 'Flaky French Butter Croissant',
    sku: 'PST-CRS-01',
    category: 'Pastry & Snack',
    basePrice: 25000,
    description: 'Croissant panggang renyah berlayer mentega Prancis Elle & Vire asli, gurih dan harum semerbak.',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80',
    isAvailable: true,
    isFeatured: true,
    recipe: [
      { ingredientId: 'ing-mentega', ingredientName: 'French Butter Elle & Vire', quantity: 45, unit: 'gram' },
    ],
  },
  {
    id: 'm-truffle-fries',
    name: 'Parmesan Truffle Fries',
    sku: 'PST-FRS-01',
    category: 'Pastry & Snack',
    basePrice: 32000,
    description: 'Kentang goreng renyah disiram minyak truffle Italia mewah, ditaburi keju parmesan parut dan parsley.',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=80',
    isAvailable: true,
    recipe: [
      { ingredientId: 'ing-kentang', ingredientName: 'Kentang Fries Premium', quantity: 180, unit: 'gram' },
      { ingredientId: 'ing-truffle-oil', ingredientName: 'White Truffle Oil', quantity: 8, unit: 'ml' },
    ],
  },
  {
    id: 'm-nasgor-wagyu',
    name: 'Nasi Goreng Wagyu Sambal Ijo',
    sku: 'FOD-NSG-01',
    category: 'Makanan',
    basePrice: 48000,
    description: 'Nasi goreng harum bumbu rempah nusantara dengan potongan daging Wagyu Meltique empuk & telur mata sapi.',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80',
    isAvailable: true,
    isFeatured: true,
    recipe: [
      { ingredientId: 'ing-daging-wagyu', ingredientName: 'Daging Wagyu MB5', quantity: 90, unit: 'gram' },
      { ingredientId: 'ing-mentega', ingredientName: 'Butter Elle & Vire', quantity: 15, unit: 'gram' },
    ],
  },
];

// Helper to generate realistic historical 30 days transactions for rich charts & reports
export const generateSeedTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const paymentMethods: Transaction['paymentMethod'][] = ['QRIS', 'QRIS', 'QRIS', 'CASH', 'CASH', 'GOPAY', 'OVO', 'SHOPEEPAY', 'DEBIT_CREDIT'];
  const customerNames = [
    'Arya Pratama', 'Nadia Safitri', 'Dimas Anggara', 'Rina Wulandari', 
    'Fajar Nugraha', 'Putri Ayu', 'Kevin Sanjaya', 'Clara Santika', 
    'Bambang Wijaya', 'Siska Amelia', 'Reza Rahardian', 'Tiara Andini'
  ];

  const now = new Date('2026-10-22T14:30:00Z');

  // Let's create transactions across 30 days
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - dayOffset);

    // Number of transactions per day: 10 to 18 orders
    const ordersCount = dayOffset === 0 ? 12 : Math.floor(10 + Math.random() * 8);

    for (let i = 0; i < ordersCount; i++) {
      const hour = 8 + Math.floor(Math.random() * 13); // 8 AM to 9 PM
      const minute = Math.floor(Math.random() * 60);
      const txDate = new Date(targetDate);
      txDate.setHours(hour, minute, Math.floor(Math.random() * 60));

      const branch = INITIAL_BRANCHES[Math.floor(Math.random() * INITIAL_BRANCHES.length)];
      const customer = customerNames[Math.floor(Math.random() * customerNames.length)];
      const payMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const orderType: Transaction['orderType'] = Math.random() > 0.4 ? 'dine_in' : (Math.random() > 0.5 ? 'takeaway' : 'delivery');
      const tableNumber = orderType === 'dine_in' ? `Meja ${Math.floor(1 + Math.random() * 15).toString().padStart(2, '0')}` : undefined;

      // Select 1 to 3 items
      const numItems = Math.floor(1 + Math.random() * 3);
      const chosenMenuItems: MenuItem[] = [];
      for (let k = 0; k < numItems; k++) {
        const item = INITIAL_MENU_ITEMS[Math.floor(Math.random() * INITIAL_MENU_ITEMS.length)];
        if (!chosenMenuItems.find(x => x.id === item.id)) {
          chosenMenuItems.push(item);
        }
      }

      let subtotal = 0;
      let totalCost = 0;
      const txItems = chosenMenuItems.map(m => {
        const qty = Math.random() > 0.7 ? 2 : 1;
        const itemSubtotal = m.basePrice * qty;
        subtotal += itemSubtotal;
        
        // estimate recipe cost
        const costOne = m.recipe.reduce((acc, r) => {
          const ing = INITIAL_INGREDIENTS.find(ig => ig.id === r.ingredientId);
          return acc + (ing ? ing.costPerUnit * r.quantity : 3000);
        }, 0);
        totalCost += costOne * qty;

        return {
          menuItemId: m.id,
          name: m.name,
          quantity: qty,
          unitPrice: m.basePrice,
          costPrice: costOne,
          optionsSummary: 'Reguler, Normal Ice',
          subtotal: itemSubtotal,
        };
      });

      const discountRate = Math.random() > 0.85 ? 10 : 0;
      const discountAmount = Math.round((subtotal * discountRate) / 100);
      const taxable = subtotal - discountAmount;
      const taxRate = 11;
      const taxAmount = Math.round((taxable * taxRate) / 100);
      const serviceChargeRate = orderType === 'dine_in' ? 5 : 0;
      const serviceChargeAmount = Math.round((taxable * serviceChargeRate) / 100);
      const total = taxable + taxAmount + serviceChargeAmount;
      const grossProfit = total - taxAmount - serviceChargeAmount - totalCost;

      const txId = `TR-${txDate.getFullYear()}${String(txDate.getMonth() + 1).padStart(2, '0')}${String(txDate.getDate()).padStart(2, '0')}-${String(1000 + transactions.length + 1).slice(1)}`;
      
      let cashTendered: number | undefined;
      let changeAmount: number | undefined;
      if (payMethod === 'CASH') {
        const roundUp = Math.ceil(total / 50000) * 50000;
        cashTendered = roundUp === total ? total : roundUp;
        changeAmount = cashTendered - total;
      }

      transactions.push({
        id: txId,
        receiptNumber: `${branch.code}-${txDate.toISOString().slice(2, 10).replace(/-/g, '')}-${String(100 + transactions.length)}`,
        branchId: branch.id,
        branchName: branch.name,
        cashierId: 'u-cashier-senopati',
        cashierName: 'Budi Santoso',
        orderType,
        tableNumber,
        customerName: customer,
        items: txItems,
        subtotal,
        discountRate,
        discountAmount,
        taxRate,
        taxAmount,
        serviceChargeRate,
        serviceChargeAmount,
        total,
        totalCost,
        grossProfit,
        paymentMethod: payMethod,
        paymentStatus: 'paid',
        cashTendered,
        changeAmount,
        paymentReference: payMethod === 'QRIS' ? `NMID-ID${Math.floor(1000000000 + Math.random() * 9000000000)}` : undefined,
        createdAt: txDate.toISOString(),
      });
    }
  }

  // Sort by createdAt descending
  return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const INITIAL_STOCK_ALERTS: StockAlert[] = [
  {
    id: 'alt-1',
    ingredientId: 'ing-kopi-gayo',
    ingredientName: 'Biji Kopi Arabika Gayo',
    branchId: 'b-dago',
    branchName: 'KopiKula Dago Heritage',
    currentStock: 1800,
    minThreshold: 2000,
    unit: 'gram',
    severity: 'warning',
    createdAt: '2026-10-22T06:30:00Z',
    isRead: false,
  },
  {
    id: 'alt-2',
    ingredientId: 'ing-susu-fresh',
    ingredientName: 'Susu Segar Pasteurised Full Cream',
    branchId: 'b-senopati',
    branchName: 'KopiKula Senopati (Flagship)',
    currentStock: 5200,
    minThreshold: 8000,
    unit: 'ml',
    severity: 'warning',
    createdAt: '2026-10-22T07:15:00Z',
    isRead: false,
  },
  {
    id: 'alt-3',
    ingredientId: 'ing-susu-oat',
    ingredientName: 'Susu Oat Barista Edition (Oatly)',
    branchId: 'b-dago',
    branchName: 'KopiKula Dago Heritage',
    currentStock: 1200,
    minThreshold: 3000,
    unit: 'ml',
    severity: 'critical',
    createdAt: '2026-10-22T08:00:00Z',
    isRead: false,
  },
];
