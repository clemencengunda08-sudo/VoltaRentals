'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { 
  Printer, ShieldCheck, Lock, Eye, Database, UserCheck, 
  Globe, Bell, ChevronRight, Mail, AlertTriangle, Server, RefreshCw
} from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export default function PrivacyPage() {
  const sections = [
    {
      id: "introduction",
      icon: <ShieldCheck className="h-5 w-5 text-primary" />,
      title: "Introduction & Scope",
      content: `VoltaRentals Tanzania ("we", "us", "our") is committed to protecting the personal information of every individual who interacts with our services. This Privacy Policy explains how we collect, use, store, share, and protect your personal data in compliance with applicable Tanzanian law, including the Electronic and Postal Communications Act (Cap. 306), and internationally recognized data protection best practices.

This Policy applies to all personal data collected through:
• Our website (voltarentals.co.tz) and mobile-optimized platform.
• Our WhatsApp booking service and customer support channel.
• Our physical office and direct interactions with our team.
• Our booking confirmation system, payment processing, and associated APIs.

By using any of our services, you consent to the collection and use of your information as described in this Policy. If you do not consent, you must discontinue use of our services immediately.`
    },
    {
      id: "collection",
      icon: <Eye className="h-5 w-5 text-primary" />,
      title: "Information We Collect",
      content: `PERSONAL IDENTIFICATION DATA (Required for Rental):
• Full legal name as it appears on your government-issued ID.
• Date of birth (to verify minimum age eligibility).
• National ID number (NIDA), Passport number, or equivalent identifier.
• Driver's license number, issuing country, and expiry date.
• Residential address and physical location.

CONTACT & COMMUNICATION DATA:
• Mobile phone number (used for booking confirmations, payment receipts, and emergency contact).
• Email address (used for formal communication, receipts, and marketing if opted in).
• WhatsApp conversation history related to your booking.

FINANCIAL & TRANSACTION DATA:
• Payment method details (we store only masked/tokenized references — we never store full card numbers or mobile money PINs).
• Transaction IDs and payment confirmation references from AzamPay, PesaPal, and mobile money providers.
• Booking amounts, deposit records, and refund history.

USAGE & TECHNICAL DATA (Collected Automatically):
• IP address and approximate geographic location.
• Browser type and version, device type and operating system.
• Pages visited, time spent on pages, and navigation behavior.
• Referral source (how you found our website).
• Cookies and similar tracking technologies (see our Cookie Policy).

VEHICLE USE DATA:
• Odometer readings at pickup and return.
• Pickup and drop-off locations.
• Reported incident details, accident reports, and damage photographs.`
    },
    {
      id: "purpose",
      icon: <Database className="h-5 w-5 text-primary" />,
      title: "How We Use Your Information",
      content: `We process your personal data solely for the following legitimate purposes:

RENTAL OPERATIONS:
• Verifying your identity and eligibility to rent a vehicle.
• Processing your booking, confirmation, and vehicle handover documentation.
• Fulfilling our legal obligations under Tanzania's road traffic and transportation laws.

PAYMENT PROCESSING:
• Processing payments through authorized third-party payment gateways.
• Issuing TRA-compliant Electronic Fiscal Receipts (EFD receipts).
• Processing security deposits, refunds, and any damage or fines recovery.

CUSTOMER COMMUNICATION:
• Sending booking confirmations, invoices, and service notifications.
• Responding to your inquiries, complaints, and support requests.
• Sending emergency notifications related to your active rental.

SAFETY & LEGAL COMPLIANCE:
• Maintaining records required by Tanzanian transportation authorities (LATRA, TRA, Police).
• Cooperating with law enforcement or legal proceedings when legally required.
• Managing accident reports, insurance claims, and vehicle incident documentation.

MARKETING (With Your Consent Only):
• Sending promotional offers, seasonal discounts, and new vehicle announcements.
• You may opt out of marketing communications at any time by replying "STOP" to any SMS or clicking "Unsubscribe" in any email.`
    },
    {
      id: "storage",
      icon: <Server className="h-5 w-5 text-primary" />,
      title: "Data Storage, Security & Retention",
      content: `STORAGE INFRASTRUCTURE:
Your data is stored on Google Firebase (Google Cloud Platform), which employs industry-standard encryption both in transit (TLS/SSL) and at rest (AES-256). Google Cloud data centers maintain ISO 27001, SOC 2, and SOC 3 certifications.

SECURITY MEASURES WE EMPLOY:
• Role-based access control — only authorized VoltaRentals personnel can access your data, and only to the extent required by their job function.
• Multi-factor authentication for all administrative systems.
• Automated audit logs for all data access and modifications.
• Regular security assessments and vulnerability testing.
• Strict data minimization — we collect only what is necessary.

RETENTION PERIODS:
• Booking and transaction records: 7 years (as required by TRA and Tanzanian business law).
• Identity verification documents: 3 years from last rental date.
• Accident and incident reports: 5 years (for insurance and legal claim purposes).
• Marketing data: Until you opt out or your account is deleted.
• Technical/Usage logs: 90 days on a rolling basis.

DATA BREACH RESPONSE:
In the unlikely event of a security breach that may compromise your personal data, VoltaRentals will notify affected individuals within 72 hours of becoming aware of the breach, detailing what data was affected and what steps we are taking to mitigate harm.`
    },
    {
      id: "sharing",
      icon: <Globe className="h-5 w-5 text-primary" />,
      title: "Data Sharing & Third Parties",
      content: `We never sell your personal data to any third party. We share your information only with trusted, carefully selected service providers who assist us in delivering our services, under strict data processing agreements:

AUTHORIZED SERVICE PROVIDERS:
• AzamPay & PesaPal — Payment gateway processing. Your financial data is handled under their own PCI-DSS compliant privacy frameworks.
• Google (Firebase, Analytics) — Hosting and performance analytics.
• Cloudinary — Secure storage of vehicle and document images.
• n8n Automation — Internal workflow automation (booking notifications, staff alerts). Data processed within secure private instances.
• WhatsApp Business API — Customer communication only.
• Insurance Partners — Sharing accident and incident data solely for claims processing.

LEGAL DISCLOSURES:
• We may be required to disclose your personal data to Tanzanian law enforcement, LATRA (Land Transport Regulatory Authority), Tanzania Revenue Authority (TRA), or court orders. We will only do so when legally compelled and will notify you when permitted by law.
• We may share anonymized, aggregated data with business analytics services. This data cannot identify you personally.

INTERNATIONAL DATA TRANSFERS:
Some service providers (e.g., Google Cloud) may process data outside Tanzania. All such transfers are governed by standard contractual clauses that ensure equivalent protection to your data.`
    },
    {
      id: "rights",
      icon: <UserCheck className="h-5 w-5 text-primary" />,
      title: "Your Privacy Rights",
      content: `As a data subject, you have the following rights regarding your personal information held by VoltaRentals:

• RIGHT TO ACCESS — You may request a full copy of all personal data we hold about you at any time.
• RIGHT TO RECTIFICATION — You may request correction of any inaccurate or incomplete data.
• RIGHT TO ERASURE ("Right to be Forgotten") — You may request deletion of your personal data where we no longer have a legal obligation to retain it. Note: data we are required to retain for tax or legal compliance purposes cannot be deleted before the retention period expires.
• RIGHT TO RESTRICT PROCESSING — You may request that we temporarily stop using your data while a dispute is being resolved.
• RIGHT TO DATA PORTABILITY — You may request your data in a commonly used machine-readable format (e.g., JSON or CSV).
• RIGHT TO OBJECT — You may object to processing of your data for marketing purposes at any time, without needing to give a reason.
• RIGHT TO WITHDRAW CONSENT — Where processing is based on your consent, you may withdraw consent at any time. This does not affect the lawfulness of processing prior to withdrawal.

To exercise any of these rights, submit a written request to: privacy@voltarentals.co.tz or call +255 790 942 616. We will respond within 30 days.`
    },
    {
      id: "cookies",
      icon: <RefreshCw className="h-5 w-5 text-primary" />,
      title: "Cookies & Tracking Technologies",
      content: `Our website uses cookies and similar technologies to enhance your browsing experience and help us understand how our platform is used.

TYPES OF COOKIES WE USE:
• Essential Cookies — Required for the website to function correctly (e.g., session cookies, authentication state). Cannot be disabled.
• Performance/Analytics Cookies — Help us understand how visitors interact with our website (via Google Analytics). All data is anonymized.
• Preference Cookies — Remember your settings such as language and theme preference.
• Marketing Cookies — Used to deliver relevant advertisements. Only activated with your explicit consent.

HOW TO MANAGE COOKIES:
You can control and manage cookies through your browser settings at any time. Please note that disabling certain cookies may affect the functionality of our website and booking system. For full details, see our dedicated Cookie Policy at voltarentals.co.tz/cookies.`
    },
    {
      id: "children",
      icon: <AlertTriangle className="h-5 w-5 text-primary" />,
      title: "Children's Privacy",
      content: `Our services are not directed at individuals under the age of 18. We do not knowingly collect personal information from minors. If you are a parent or guardian and believe your child has provided us with personal information without your consent, please contact us immediately at privacy@voltarentals.co.tz and we will delete that information promptly.

In line with our rental eligibility requirements (minimum age 23), any booking made by an individual under the minimum age is automatically void and any payments made may be forfeited depending on the timing of cancellation.`
    },
    {
      id: "notifications",
      icon: <Bell className="h-5 w-5 text-primary" />,
      title: "Marketing Communications & Opt-Out",
      content: `With your explicit consent, we may contact you with:
• Special offers, seasonal promotions, and loyalty rewards.
• New vehicle additions to our fleet.
• Policy updates and important service announcements.
• VoltaRentals newsletters and event invitations.

You have full control over your marketing preferences. To opt out:
• Reply "STOP" or "UNSUBSCRIBE" to any SMS from VoltaRentals.
• Click the "Unsubscribe" link in any marketing email.
• Send a written request to privacy@voltarentals.co.tz.
• Update your preferences directly in your VoltaRentals account profile.

Opting out of marketing communications will not affect service-critical communications (e.g., booking confirmations, payment receipts, emergency alerts).`
    },
    {
      id: "changes",
      icon: <Lock className="h-5 w-5 text-primary" />,
      title: "Policy Updates & Contact",
      content: `VoltaRentals reserves the right to update this Privacy Policy at any time. Whenever we make material changes, we will:
• Update the "Last Updated" date at the top of this page.
• Notify registered users via email or in-app notification.
• For significant changes, obtain fresh consent where required.

We encourage you to review this Policy periodically to stay informed about how we protect your information.

For all privacy-related inquiries, requests, or complaints:

VoltaRentals Privacy & Compliance Officer
Mikocheni, Dar es Salaam, Tanzania
Email: privacy@voltarentals.co.tz
Phone: +255 790 942 616
Office Hours: Monday–Friday, 8:00 AM – 5:00 PM EAT`
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 bg-background py-32 print:py-0 print:bg-white">
        <div className="container mx-auto max-w-5xl px-4 print:max-w-none print:px-0">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-20 border-b border-border pb-12 print:mb-12 print:border-black print:pb-8">
            <AnimatedSection>
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center shadow-xl border border-primary/20">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-5xl font-black tracking-tight text-foreground uppercase print:text-black print:text-3xl">
                    Privacy <span className="text-primary">Policy</span>
                  </h1>
                  <p className="text-muted-foreground uppercase text-[9px] font-black tracking-[0.3em] mt-1 print:text-black">
                    VoltaRentals Tanzania — Protecting your data — Last Updated: May 2026
                  </p>
                </div>
              </div>
            </AnimatedSection>
            <Button onClick={() => window.print()} variant="outline" className="rounded-xl h-12 gap-2 font-black no-print shrink-0">
              <Printer className="h-4 w-4" /> Print Document
            </Button>
          </div>

          {/* Quick Summary Banner */}
          <AnimatedSection delay={0.05}>
            <div className="mb-16 grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
              {[
                { icon: <Lock className="h-5 w-5 text-primary" />, label: "Never Sold", desc: "Your data is never sold to third parties." },
                { icon: <Server className="h-5 w-5 text-primary" />, label: "Encrypted", desc: "All data stored with AES-256 encryption." },
                { icon: <UserCheck className="h-5 w-5 text-primary" />, label: "Your Control", desc: "Request access, edit, or deletion anytime." },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 print:block">
            {/* Sticky Navigation */}
            <div className="hidden lg:block lg:col-span-1 space-y-1 sticky top-28 h-fit no-print">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-4">Section Index</p>
              {sections.map((s, i) => (
                <a key={i} href={`#${s.id}`} className="flex items-center justify-between text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border/30 group">
                  <span>{i + 1}. {s.title}</span>
                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
                </a>
              ))}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-16 print:space-y-12">
              {sections.map((s, i) => (
                <AnimatedSection key={i} delay={i * 0.03}>
                  <div id={s.id} className="scroll-mt-32 space-y-5 pb-16 border-b border-border last:border-0 print:pb-8 print:border-black">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">{s.icon}</div>
                      <h2 className="text-xl font-black uppercase tracking-tight text-foreground print:text-black print:text-base">
                        <span className="text-primary print:text-black">{i + 1}.</span> {s.title}
                      </h2>
                    </div>
                    <div className="pl-12">
                      {s.content.split('\n').map((para, pi) =>
                        para.trim().startsWith('•') ? (
                          <div key={pi} className="flex gap-2 mt-2">
                            <span className="text-primary font-black mt-0.5 shrink-0">•</span>
                            <p className="text-muted-foreground font-medium leading-relaxed print:text-black print:text-sm">
                              {para.replace('•', '').trim()}
                            </p>
                          </div>
                        ) : para.trim() ? (
                          <p key={pi} className={`text-muted-foreground font-medium leading-relaxed mt-3 first:mt-0 print:text-black print:text-sm ${para.trim() === para.trim().toUpperCase() && para.trim().length < 80 ? 'font-black text-foreground text-[11px] tracking-widest uppercase mt-6' : ''}`}>
                            {para}
                          </p>
                        ) : null
                      )}
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>

          {/* Contact Footer */}
          <AnimatedSection delay={0.3}>
            <div className="mt-32 p-12 bg-primary/5 rounded-[3rem] border border-primary/10 text-center print:mt-12 print:border-black print:p-8">
              <Mail size={32} className="mx-auto mb-6 text-primary print:text-black" />
              <h3 className="text-xl font-black uppercase tracking-tight text-foreground mb-4">Privacy Questions?</h3>
              <p className="text-sm font-medium text-muted-foreground max-w-lg mx-auto leading-relaxed print:text-black print:text-xs">
                For all privacy enquiries, data requests, or concerns about how we handle your information, contact our Privacy & Compliance Officer directly.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-6">
                <span className="font-black text-primary text-lg">privacy@voltarentals.co.tz</span>
                <span className="hidden sm:block h-4 w-px bg-border" />
                <span className="font-black text-foreground">+255 790 942 616</span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mt-8">
                Registered Business · Dar es Salaam, Tanzania · TCRA Compliant · © 2026 VoltaRentals
              </p>
            </div>
          </AnimatedSection>
        </div>
      </main>
      <Footer />

      <style jsx global>{`
        @media print {
          nav, footer, header, .no-print, #navbar, #footer { display: none !important; }
          body { background: white !important; color: #000000 !important; font-family: 'Times New Roman', Times, serif !important; }
          .print\:py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .print\:block { display: block !important; }
          .print\:border-black { border-color: #000000 !important; }
          .print\:text-black { color: #000000 !important; }
          
          /* Document layout for high-quality legal PDF print */
          @page {
            size: A4;
            margin: 20mm;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          h1 {
            font-size: 24pt !important;
            margin-bottom: 20pt !important;
            text-align: center !important;
            color: #000000 !important;
          }
          h2 {
            font-size: 14pt !important;
            margin-top: 25pt !important;
            margin-bottom: 10pt !important;
            color: #000000 !important;
            page-break-after: avoid;
          }
          p, li {
            font-size: 10pt !important;
            line-height: 1.5 !important;
            color: #111111 !important;
          }
        }
      `}</style>
    </div>
  );
}
