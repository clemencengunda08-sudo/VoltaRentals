'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'sw';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    overview: 'Master Overview',
    reservations: 'Reservation Registry',
    fleet: 'Fleet Inventory Hub',
    financials: 'Financial Verification',
    analytics: 'Business Intelligence',
    audit: 'Audit Archives',
    crm: 'Customer CRM',
    feedback: 'Feedback Protocol',
    comms: 'Communication Node',
    settings: 'System Protocols',
    superadmin: 'Supreme Master Control',
    logout: 'Terminate Session',
    profile: 'Personal Registry',
    globalConfig: 'Global Config',
    authorityProfile: 'Authority Profile',
    
    // Payments & Bookings
    completePayment: 'Complete Payment',
    markAsPaid: 'Mark as Paid',
    financialResource: 'Financial & Resource Assignment',
    assignDriver: 'Assign Fleet Driver',
    manualPaymentReceived: 'Manual Payment Received (TSh)',
    commitFinancial: 'Commit Financial Protocol',
    workflowStatus: 'Workflow Status',
    digitalSignatures: 'Digital Signatures (Dual Authorization)',
    clientSignature: 'Client Signature',
    adminSignature: 'Admin / Dispatch Signature',
    unauthorized: 'Registry Pending',
    driverSelectorPlaceholder: 'Select Registry Driver',
    
    // Statuses
    pending: 'Pending',
    confirmed: 'Confirmed',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
    paid: 'Paid',
    partial: 'Partial',
    unpaid: 'Unpaid',
  },
  sw: {
    // Navigation
    overview: 'Muhtasari Mkuu',
    reservations: 'Rejesta ya Uhifadhi',
    fleet: 'Mali ya Magari (Fleet)',
    financials: 'Uthibitisho wa Kifedha',
    analytics: 'Uchambuzi wa Biashara',
    audit: 'Kumbukumbu za Ukaguzi',
    crm: 'CRM ya Wateja',
    feedback: 'Itifaki ya Maoni',
    comms: 'Mawasiliano',
    settings: 'Itifaki za Mfumo',
    superadmin: 'Kidhibiti Kikuu cha Mfumo',
    logout: 'Komesha Kipindi',
    profile: 'Wasifu Wangu',
    globalConfig: 'Usanidi wa Mfumo',
    authorityProfile: 'Wasifu wa Mamlaka',
    
    // Payments & Bookings
    completePayment: 'Kamilisha Malipo',
    markAsPaid: 'Weka Alama Imelipwa',
    financialResource: 'Mgawanyo wa Fedha na Rasilimali',
    assignDriver: 'Mkabidhi Dereva wa Volta',
    manualPaymentReceived: 'Malipo ya Mwongozo Yaliyopokelewa (TSh)',
    commitFinancial: 'Thibitisha Malipo ya Mwongozo',
    workflowStatus: 'Hali ya Shughuli',
    digitalSignatures: 'Saini za Kidijitali (Idhini Mbili)',
    clientSignature: 'Saini ya Mteja',
    adminSignature: 'Saini ya Msimamizi / Msafirishaji',
    unauthorized: 'Uhifadhi Unasubiri',
    driverSelectorPlaceholder: 'Chagua Dereva wa Volta',
    
    // Statuses
    pending: 'Inasubiri',
    confirmed: 'Imethibitishwa',
    active: 'Inaendelea',
    completed: 'Imekamilika',
    cancelled: 'Imeghairiwa',
    paid: 'Imelipwa Kamili',
    partial: 'Imelipwa Kiasi',
    unpaid: 'Haijalipwa',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('volta-lang') as Language;
    if (saved === 'en' || saved === 'sw') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('volta-lang', lang);
    // Dynamically toggle document lang for accessibility
    document.documentElement.lang = lang;
  };

  const t = (key: string, defaultValue?: string): string => {
    return translations[language][key] || defaultValue || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
