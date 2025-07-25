// dalxiis-demo/src/components/i18n.ts
import { useLanguage } from './Navbar';

const translations = {
  en: {
    welcome: 'Welcome to Dalxiis Tourism',
    explore: 'Explore',
    bookNow: 'Book Now',
    home: 'Home',
    packages: 'Packages',
    services: 'Services',
    destinations: 'Destinations',
    about: 'About',
    contact: 'Contact',
    admin: 'Admin',
    testimonialsTitle: 'What Our Travelers Say',
    // ...add more as needed
  },
  so: {
    welcome: 'Ku soo dhawoow Dalxiis Tourism',
    explore: 'Soo Baaro',
    bookNow: 'Hadda Booqo',
    home: 'Bogga Hore',
    packages: 'Xirmooyinka',
    services: 'Adeegyada',
    destinations: 'Meelaha Dalxiiska',
    about: 'Nagu Saabsan',
    contact: 'La Xiriir',
    admin: 'Maamul',
    testimonialsTitle: 'Maxay Dalxiisayaashu Ka Yiraahdeen',
    // ...add more as needed
  }
};

export function useTranslation() {
  const { language } = useLanguage();
  function t(key: keyof typeof translations['en']) {
    return translations[language][key] || translations['en'][key] || key;
  }
  return { t, language };
} 