/**
 * AVENA — Categories Data (English version - 3 levels)
 * assets/js/modules/categories-data.js
 */

export const CATEGORIES_DATA = {
  school: {
    key: 'school',
    label: 'School Features',
    emoji: '🎓',
    featured: { tag: '🔥 Back to School 2025', text: 'Complete kits from', price: '15 GHS' },
    groups: [
      { 
        title: 'Supplies', 
        subcategories: ['Notebooks & Binders', 'Pens & Pencils', 'Calculators', 'Rulers & Geometry', 'Sticky Notes & Highlighters']
      },
      { 
        title: 'Bags & Transport', 
        subcategories: ['Backpacks', 'School Bags', 'Pencil Cases', 'Document Holders']
      },
      { 
        title: 'Books & Docs', 
        subcategories: ['Textbooks', 'Dictionaries', 'Planners & Agendas', 'Flashcards']
      },
      { 
        title: 'Printing', 
        subcategories: ['Course Printing', 'Thesis Binding', 'A4 Paper']
      }
    ]
  },
  electronics: {
    key: 'electronics',
    label: 'Electronics',
    emoji: '💻',
    featured: { tag: '⚡ Best Seller', text: 'Student Laptops from', price: '800 GHS' },
    groups: [
      { 
        title: 'Computers', 
        subcategories: ['Computers', 'Laptops', 'Tablets', 'Chromebooks', 'PC Accessories']
      },
      { 
        title: 'Audio', 
        subcategories: ['Audio', 'Headphones', 'Headsets', 'Bluetooth Speakers', 'Microphones']
      },
      { 
        title: 'Phones', 
        subcategories: ['Smartphones', 'Cases & Protection', 'Chargers', 'Power Banks']
      },
      { 
        title: 'Cables & Adapters', 
        subcategories: ['USB-C / USB-A', 'HDMI', 'USB Hubs']
      }
    ]
  },
  furniture: {
    key: 'furniture',
    label: 'Furniture',
    emoji: '🪑',
    featured: { tag: '🏠 Popular', text: 'Compact desk from', price: '120 GHS' },
    groups: [
      { 
        title: 'Desk', 
        subcategories: ['Desks', 'Office Chairs', 'Desk Lamps', 'Organizers']
      },
      { 
        title: 'Bedroom', 
        subcategories: ['Beds & Mattresses', 'Bookcases', 'Shelves', 'Mirrors']
      },
      { 
        title: 'Storage', 
        subcategories: ['Wardrobes', 'Storage Boxes', 'Hangers']
      },
      { 
        title: 'Decor', 
        subcategories: ['Cushions & Throws', 'Wall Art & Posters', 'Rugs']
      }
    ]
  },
  food: {
    key: 'food',
    label: 'Food & Snacks',
    emoji: '🍱',
    featured: { tag: '🍫 New', text: 'Weekly snack pack from', price: '25 GHS' },
    groups: [
      { 
        title: 'Snacks', 
        subcategories: ['Cookies & Cakes', 'Chips & Crackers', 'Dried Fruits & Nuts', 'Cereal Bars']
      },
      { 
        title: 'Drinks', 
        subcategories: ['Water & Juice', 'Coffee & Tea', 'Energy Drinks', 'Smoothies']
      },
      { 
        title: 'Fast Food', 
        subcategories: ['Ready Meals', 'Instant Soups', 'Sandwiches']
      },
      { 
        title: 'Dorm Kitchen', 
        subcategories: ['Spices & Sauces', 'Rice & Pasta', 'Canned Food']
      }
    ]
  },
  dress: {
    key: 'dress',
    label: 'Fashion',
    emoji: '👗',
    featured: { tag: '✨ Trending', text: 'Campus collection from', price: '35 GHS' },
    groups: [
      { 
        title: 'Women', 
        subcategories: ['Dresses & Skirts', 'T-Shirts & Tops', 'Jeans & Pants', 'Jackets & Hoodies']
      },
      { 
        title: 'Men', 
        subcategories: ['T-Shirts & Polos', 'Jeans & Shorts', 'Shirts', 'Hoodies & Sweats']
      },
      { 
        title: 'Shoes', 
        subcategories: ['Sneakers', 'Sandals', 'Loafers']
      },
      { 
        title: 'Accessories', 
        subcategories: ['Caps & Beanies', 'Belts', 'Watches']
      }
    ]
  },
  sport: {
    key: 'sport',
    label: 'Sports',
    emoji: '⚽',
    featured: { tag: '🏃 Active', text: 'Fitness kit from', price: '80 GHS' },
    groups: [
      { 
        title: 'Team Sports', 
        subcategories: ['Football', 'Basketball', 'Volleyball', 'Rugby']
      },
      { 
        title: 'Fitness', 
        subcategories: ['Yoga Mats', 'Dumbbells', 'Resistance Bands', 'Jump Ropes']
      },
      { 
        title: 'Running', 
        subcategories: ['Running Shoes', 'Armbands & GPS', 'Running Gear']
      },
      { 
        title: 'Swimming', 
        subcategories: ['Swimsuits', 'Swim Goggles', 'Swim Caps']
      }
    ]
  },
  beauty: {
    key: 'beauty',
    label: 'Beauty',
    emoji: '💄',
    featured: { tag: '🌸 Best Seller', text: 'Skincare routines from', price: '20 GHS' },
    groups: [
      { 
        title: 'Face Care', 
        subcategories: ['Moisturizers', 'Cleansers', 'Masks & Serums', 'SPF & Protection']
      },
      { 
        title: 'Makeup', 
        subcategories: ['Foundation', 'Lipsticks', 'Mascara & Eyeliner', 'Eyeshadow Palettes']
      },
      { 
        title: 'Hair', 
        subcategories: ['Shampoos', 'Hair Oils', 'Hair Accessories']
      },
      { 
        title: 'Body & Fragrance', 
        subcategories: ['Deodorants', 'Perfumes', 'Body Lotions']
      }
    ]
  }
};

export function getSubcategoriesForGroup(categoryKey, groupTitle) {
  const category = CATEGORIES_DATA[categoryKey];
  if (!category) return [];
  const group = category.groups.find(g => g.title === groupTitle);
  return group ? group.subcategories : [];
}

export function getGroups(categoryKey) {
  const category = CATEGORIES_DATA[categoryKey];
  return category ? category.groups : [];
}

export function getCategory(key) {
  return CATEGORIES_DATA[key] || null;
}

export function isValidSubcategory(categoryKey, subcategory) {
  const groups = getGroups(categoryKey);
  return groups.some(group => group.subcategories.includes(subcategory));
}