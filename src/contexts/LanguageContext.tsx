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
    // Navigation & Sidebar
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
    adminProtocol: 'Admin Protocol',
    masterArchitect: 'MASTER ARCHITECT',
    adminCommand: 'Admin Command',
    
    // Sidebar Groups & Items
    operations: 'Operations',
    intelligence: 'Intelligence',
    management: 'Management',
    supremeAuthority: 'Supreme Authority',
    commandCenter: 'Command Center',
    registryOrders: 'Registry Orders',
    manualBooking: 'Manual Booking',
    fleetControl: 'Fleet Control',
    driverDispatch: 'Driver Dispatch',
    financialLedger: 'Financial Ledger',
    analyticsTerminal: 'Analytics Terminal',
    eliteTravelers: 'Elite Travelers',
    feedbackAudit: 'Feedback Audit',
    inquiryHub: 'Inquiry Hub',
    complianceTRA: 'Compliance (TRA)',
    masterCommand: 'Master Command',
    authorityRegistry: 'Authority Registry',
    themeStudio: 'Theme Studio',
    visualMedia: 'Visual Media',
    automationHub: 'Automation Hub',
    maintenanceProtocol: 'Maintenance Protocol',
    globalProtocols: 'Global Protocols',
    terminateSession: 'Terminate Session',
    personalRegistry: 'Personal Registry',
    queryRegistry: 'Query registry...',
    noTerminalFound: 'No matching terminal found.',

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
    unpaidBalanceNotice: 'Outstanding Balance Due',
    syncNotice: 'Settling this will instantly update paymentStatus to "paid" and trigger n8n ledger sync.',
    completePaymentInFull: 'Complete Payment in Full',
    completePaymentShort: 'Complete Payment',
    clientBound: 'Client Bound',
    adminAuthorized: 'Admin Authorized',
    resetSignature: 'Reset Signature',
    clientSignTip: '"Client must sign here"',
    adminSignTip: '"Admin authorizes vehicle release"',
    analyze: 'Analyze',
    contract: 'Contract',
    receipt: 'Receipt',
    manualPaymentTip: '"Use this to log cash or office settlements."',
    protocolNotice: '"Protocol Notice: Manual payments are logged in the financial ledger and synced with n8n accounting nodes instantly."',

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
    // Navigation & Sidebar
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
    adminProtocol: 'Itifaki ya Msimamizi',
    masterArchitect: 'MBUNIFU MKUU',
    adminCommand: 'Amri ya Usimamizi',

    // Sidebar Groups & Items
    operations: 'Shughuli',
    intelligence: 'Uchambuzi na Fedha',
    management: 'Usimamizi wa Mfumo',
    supremeAuthority: 'Mamlaka Kuu',
    commandCenter: 'Kituo cha Amri',
    registryOrders: 'Rejesta ya Uhifadhi',
    manualBooking: 'Uhifadhi wa Mwongozo',
    fleetControl: 'Usimamizi wa Magari',
    driverDispatch: 'Kazi za Madereva',
    financialLedger: 'Daftari la Fedha',
    analyticsTerminal: 'Uchambuzi wa Biashara',
    eliteTravelers: 'Wateja Wakuu',
    feedbackAudit: 'Tathmini ya Maoni',
    inquiryHub: 'Kituo cha Maswali',
    complianceTRA: 'Uzingatiaji (TRA)',
    masterCommand: 'Udhibiti Mkuu',
    authorityRegistry: 'Orodha ya Watawala',
    themeStudio: 'Ubunifu wa Rangi',
    visualMedia: 'Picha na Vyombo vya Habari',
    automationHub: 'Kituo cha Uendeshaji',
    maintenanceProtocol: 'Itifaki ya Matengenezo',
    globalProtocols: 'Itifaki za Jumla',
    terminateSession: 'Komesha Kipindi',
    personalRegistry: 'Wasifu Wangu',
    queryRegistry: 'Tafuta kwenye rejesta...',
    noTerminalFound: 'Kituo kinacholingana hakikupatikana.',
    
    // Payments & Bookings
    completePayment: 'Kamilisha Malipo',
    markAsPaid: 'Weka Alama Imelipwa',
    financialResource: 'Mgawanyo wa Fedha na Rasilimali',
    assignDriver: 'Mkabidhi Dereva wa Volta',
    manualPaymentReceived: 'Malipo ya Mwongozo Yaliyopokelewa (TSh)',
    commitFinancial: 'Thibitisha Malipo ya Mwongozo',
    workflowStatus: 'Hali ya Uhifadhi',
    digitalSignatures: 'Saini za Kidijitali (Idhini Mbili)',
    clientSignature: 'Saini ya Mteja',
    adminSignature: 'Saini ya Msimamizi / Msafirishaji',
    unauthorized: 'Uhifadhi Unasubiri',
    driverSelectorPlaceholder: 'Chagua Dereva wa Volta',
    unpaidBalanceNotice: 'Kiasi Kilichobaki Kinafaa Kulipwa',
    syncNotice: 'Kukamilisha hili kutabadilisha mara moja hali ya malipo kuwa "Imelipwa Kamili" na kusawazisha na n8n.',
    completePaymentInFull: 'Kamilisha Malipo Kamili Sasa',
    completePaymentShort: 'Kamilisha Malipo',
    clientBound: 'Mteja Ameidhinisha',
    adminAuthorized: 'Msimamizi Ameidhinisha',
    resetSignature: 'Futa Saini',
    clientSignTip: '"Mteja anapaswa kusaini hapa"',
    adminSignTip: '"Msimamizi anaidhinisha kuachiliwa kwa gari"',
    analyze: 'Changanua',
    contract: 'Mkataba',
    receipt: 'Stakabadhi',
    manualPaymentTip: '"Tumia hii kuandika malipo ya pesa taslimu au ya ofisini."',
    protocolNotice: '"Taarifa ya Itifaki: Malipo ya mwongozo yanaandikwa kwenye daftari la fedha na kusawazishwa na n8n papo hapo."',
    
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
