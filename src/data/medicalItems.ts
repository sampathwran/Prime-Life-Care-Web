import { MedicalItem } from '@/types';

/**
 * Prime Life Care Authentic Medical Equipment Store Catalog
 * Cleaned to contain 1 authentic high-grade product with 5 multi-angle photos
 */
export const initialMedicalItems: MedicalItem[] = [
  {
    id: 'prod_icu_bed_3f',
    name: {
      en: '3-Function Motorized Electric ICU & Home Care Hospital Bed',
      si: '3-Function විදුලි මෝටර් පාලිත උසස් ICU සහ නිවසේ රෝගී සත්කාරක ඇඳ',
      ta: '3-செயல்பாடு மின்சார மருத்துவமனை மற்றும் வீட்டு பராமரிப்பு படுக்கை'
    },
    category: 'equipment',
    regularPriceLKR: 215000,
    salePriceLKR: 185000,
    priceLKR: 185000,
    discountPercentage: 14,
    rentalMonthlyLKR: 18500,
    stock: 6,
    inStock: true,
    badge: '14% OFF • Essential ICU Grade',
    brand: 'Paramount Healthcare',
    description: {
      en: 'Hospital-grade 3-function motorized electric care bed engineered for patient recovery and home nursing. Features remote-controlled backrest tilt (0-75°), knee elevation (0-45°), collapsible aluminum alloy side safety rails, central lockable medical castors, and emergency manual release. Perfect for stroke recovery, post-surgery rehabilitation, and long-term elderly bed rest.',
      si: 'රෝගී සත්කාරය සහ නිවසේ සාත්තු සේවය සඳහාම විශේෂයෙන් නිෂ්පාදනය කරන ලද 3-Function විදුලි මෝටර් පාලිත උසස් රෝහල් ඇඳ. රිමෝට් කන්ට්‍රෝලය මඟින් හිස සහ පිටුපස (0-75°) සහ කකුල් (0-45°) පහසුවෙන් එසවීම, නැමිය හැකි ඇලුමිනියම් ආරක්ෂිත පැති රේලි, බ්‍රේක් සහිත ශක්තිමත් රෝද සහ උසස් මෙට්ටය ඇතුළත් වේ. ආඝාතය, ශල්‍යකර්ම පසු සුවය ලබන සහ වැඩිහිටි රෝගීන්ට ඉතාමත් සුවපහසුයි.',
      ta: 'நோயாளி குணமடைவதற்கும் வீட்டுப் பராமரிப்பிற்கும் ஏற்ற 3-செயல்பாட்டு மோட்டார் பொருத்தப்பட்ட மின்சார படுக்கை. ரிமோட் மூலம் கட்டுப்படுத்தக்கூடிய தலை மற்றும் கால் பகுதி சரிசெய்தல், பாதுகாப்பு தண்டவாளங்கள் மற்றும் மருத்துவ சக்கரங்களை கொண்டுள்ளது.'
    },
    images: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=1200',
    ],
    features: [
      'Handheld ergonomic remote control for smooth silent motorized adjustments',
      'Independent backrest adjustment (0° to 75°) & knee-rest elevation (0° to 45°)',
      'High-grade ABS quick-release head and foot boards for easy sanitization',
      'Fold-down aviation aluminum alloy safety side rails to prevent accidental falls',
      'Four heavy-duty silent swivel caster wheels with individual foot brake locks',
      'Includes premium hospital-grade waterproof anti-decubitus mattress'
    ],
    isAvailable: true,
    createdAt: new Date().toISOString()
  }
];
