'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { 
  Printer, ChevronRight, ShieldCheck, Zap, Car, CreditCard, 
  AlertTriangle, Scale, Clock, MapPin, UserCheck, Wrench, FileText, Phone
} from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

export default function TermsPage() {
  const sections = [
    {
      id: "acceptance",
      icon: <FileText className="h-5 w-5 text-primary" />,
      title: "Acceptance of Terms",
      content: `By booking a vehicle through VoltaRentals Tanzania — whether via our website, mobile platform, WhatsApp, or directly through our office — you ("the Client") unconditionally accept and agree to be legally bound by these Terms and Conditions in their entirety.

These Terms constitute a binding legal agreement governed by the laws of the United Republic of Tanzania. VoltaRentals reserves the right to update these Terms at any time, with updated versions taking effect immediately upon publication. Continued use of our services implies acceptance of any amendments.

If you do not agree with any part of these Terms, you must immediately cease use of all VoltaRentals services.`
    },
    {
      id: "eligibility",
      icon: <UserCheck className="h-5 w-5 text-primary" />,
      title: "Rental Eligibility & Driver Requirements",
      content: `To rent a vehicle from VoltaRentals, the Client must satisfy all of the following conditions at the time of pickup:

• Minimum age: 23 years old. Drivers aged 21–22 may be accepted subject to a Young Driver Surcharge of TZS 15,000 per day and management approval.
• Valid National ID (NIDA), Passport, or equivalent government-issued photo identification.
• A valid driver's license appropriate for the vehicle category being rented. Foreign licenses are accepted for a maximum of 90 days from entry into Tanzania.
• International Driving Permit (IDP) is required for licenses not written in English or Swahili.
• Drivers must present a clear, legible physical copy of their license — digital or phone-screen copies are not accepted at vehicle handover.
• The Client must be the primary driver unless VoltaRentals has been notified in advance and has authorized additional drivers in writing.

Any driver operating the vehicle who is not listed in the rental agreement will be considered unauthorized. VoltaRentals reserves the right to refuse vehicle handover to anyone who fails to meet these requirements, with no refund obligation.`
    },
    {
      id: "booking",
      icon: <Clock className="h-5 w-5 text-primary" />,
      title: "Booking, Confirmation & Modifications",
      content: `All bookings are provisional until confirmed in writing (via email or WhatsApp message) by a VoltaRentals representative.

A booking is considered confirmed only upon:
• Receipt of a minimum deposit of 30% of the total rental value, OR
• Full payment where required (e.g. same-day or next-day bookings).

VoltaRentals will not hold a vehicle exclusively without payment. Double-bookings arising from unpaid provisional reservations are not the responsibility of VoltaRentals.

Modifications to booking dates, vehicle type, or pickup/drop-off location may be accommodated subject to vehicle availability. Any modification request must be submitted at least 24 hours before the original scheduled pickup time. Modifications within 24 hours are subject to additional administrative fees of TZS 10,000 and are not guaranteed.

VoltaRentals reserves the right to substitute a vehicle of equivalent or higher class in the event of unforeseen mechanical issues. No additional charge will apply for an upgrade; in the case of a downgrade, a proportional refund will be processed within 5–7 business days.`
    },
    {
      id: "payment",
      icon: <CreditCard className="h-5 w-5 text-primary" />,
      title: "Payment Terms & Accepted Methods",
      content: `All rental prices are listed in Tanzanian Shillings (TZS). Prices may also be quoted in United States Dollars (USD) for international clients, converted at the prevailing Bank of Tanzania exchange rate on the day of payment.

Accepted payment methods include:
• M-Pesa (Vodacom), Tigo Pesa, Airtel Money, Halopesa
• AzamPay Mobile (all major Tanzanian networks)
• PesaPal (Visa, Mastercard, and East African mobile money)
• Direct Bank Transfer (NMB, CRDB, NBC, DTB Tanzania) — a copy of the transfer receipt must be shared with our team.
• Cash in TZS is accepted at our office for confirmed bookings only.

A security deposit of between TZS 100,000 – TZS 500,000 (depending on vehicle class) is required at the time of vehicle handover. This deposit is fully refundable within 48 hours of the vehicle being returned in the same condition it was provided, minus any applicable deductions for fuel, damages, or fines.

Prices are inclusive of applicable VAT in compliance with TRA regulations. An official Electronic Fiscal Receipt (EFD receipt) will be issued for all transactions.`
    },
    {
      id: "insurance",
      icon: <ShieldCheck className="h-5 w-5 text-primary" />,
      title: "Vehicle Insurance, Security & Accident Protocol",
      content: `All VoltaRentals vehicles are comprehensively insured under a Third-Party Motor Vehicle Insurance policy that meets or exceeds the minimum requirements set by the Tanzania Insurance Regulatory Authority (TIRA) under the Motor Vehicles Insurance Act.

BASIC COVERAGE INCLUDED (at no extra cost):
• Third-party bodily injury liability — covers injury or death to third parties resulting from an accident involving our vehicle.
• Third-party property damage — covers damage to third-party property up to the insured limit.
• Medical assistance for the registered driver — emergency medical expenses up to TZS 2,000,000.

OPTIONAL PREMIUM COVERAGE (add-on, charged per day):
• Collision Damage Waiver (CDW) — reduces Client's financial liability for vehicle damage in the event of an accident, subject to a deductible. CDW does NOT cover glass, tyres, wheels, undercarriage, or damage caused by negligent driving.
• Personal Accident Insurance (PAI) — provides additional cover for driver and occupants in the event of accidental injury or death.

CLIENT LIABILITY IN CASE OF ACCIDENT:
• In the event of an accident, the Client is fully responsible for an Excess/Deductible of TZS 500,000 (standard vehicles) or TZS 1,000,000 (premium/luxury vehicles), regardless of fault.
• This excess is reduced to zero if the optional CDW package was purchased.
• The Client is 100% liable for all damage caused by: DUI/driving under influence of alcohol or narcotics, unauthorized off-road driving, reckless or negligent driving, use by unauthorized drivers, or intentional damage.
• All vehicle accidents must be reported to VoltaRentals within 2 hours of occurrence and to the nearest Police Post for a Police Abstract. Failure to report timely voids all insurance protections.

ACCIDENT PROCEDURE:
1. Stop the vehicle and ensure safety of all occupants.
2. Call VoltaRentals Emergency Line immediately: +255 790 942 616.
3. Do not admit fault or liability to any third party.
4. Photograph all vehicle damage, license plates, and scene.
5. Obtain a Police Abstract from the nearest police station.
6. Provide VoltaRentals with all documentation within 24 hours.`
    },
    {
      id: "vehicle-use",
      icon: <Car className="h-5 w-5 text-primary" />,
      title: "Vehicle Use Policy & Prohibited Activities",
      content: `The Client agrees to operate the vehicle responsibly and only for lawful purposes. The following are strictly prohibited and will render the rental agreement void and insurance invalid:

• Driving outside the borders of the United Republic of Tanzania without prior written approval from VoltaRentals management.
• Driving under the influence of alcohol, narcotics, or any substance that impairs judgment.
• Using the vehicle for sub-letting, commercial transportation (e.g. Uber, Bolt, taxi services), or any paid conveyance of passengers without written authorization.
• Participating in or preparing for any motorsport, race, rally, or speed test.
• Driving on unpaved or off-road terrain not designated for the specific vehicle. (4WD-specific vehicles are exempt when approved in the booking.)
• Carrying illegal goods, weapons, or contraband.
• Overloading the vehicle beyond its stated passenger or cargo capacity.
• Towing or pushing another vehicle without prior written consent.
• Allowing an unauthorized or unlisted driver to operate the vehicle.

The Client is responsible for the vehicle's safe keeping at all times. In the event of theft, loss of keys, or vehicle damage due to negligence, the Client bears full financial responsibility.`
    },
    {
      id: "geography",
      icon: <MapPin className="h-5 w-5 text-primary" />,
      title: "Geographic Restrictions & Cross-Border Travel",
      content: `By default, all VoltaRentals vehicles are restricted to the territory of the United Republic of Tanzania, including Zanzibar and the Pemba Archipelago (subject to ferry transport provisions).

Cross-border travel to Kenya, Uganda, Rwanda, Burundi, DRC, Zambia, Mozambique, or Malawi may be authorized under the following conditions:
• Written request submitted at least 5 business days before travel.
• Additional cross-border insurance premium is purchased.
• A valid COMESA (Common Market for Eastern and Southern Africa) Yellow Card Insurance certificate is issued.
• VoltaRentals management approval confirmed in writing.

Violations of geographic restrictions will void all insurance coverage and subject the Client to the full replacement value of the vehicle, plus any legal or administrative penalties incurred.`
    },
    {
      id: "fuel",
      icon: <Zap className="h-5 w-5 text-primary" />,
      title: "Fuel Policy",
      content: `All vehicles are provided with a full tank of fuel. The Client is required to return the vehicle with a full tank of fuel. Failure to return the vehicle with a full tank will result in a fuel replenishment charge at the prevailing pump price plus a TZS 10,000 service fee.

The Client is responsible for using the correct fuel type as labeled inside the fuel cap of the vehicle. VoltaRentals accepts no responsibility for engine damage caused by incorrect fuel use — this damage is fully chargeable to the Client.

Petrol station receipts are encouraged for Client's own records. In cases of dispute regarding fuel level at return, the fuel gauge reading at handover (documented in the Vehicle Condition Report) serves as the binding reference.`
    },
    {
      id: "maintenance",
      icon: <Wrench className="h-5 w-5 text-primary" />,
      title: "Vehicle Condition, Breakdown & Maintenance",
      content: `All vehicles are thoroughly inspected, cleaned, and serviced before each rental. A Vehicle Condition Report (VCR) is completed jointly by VoltaRentals staff and the Client at pickup. Any pre-existing damage must be documented on the VCR before departure. Undocumented damage discovered at return will be assumed to have occurred during the rental period and charged accordingly.

In the event of a mechanical breakdown not caused by Client misuse:
• VoltaRentals will arrange for roadside assistance or a replacement vehicle as quickly as possible.
• VoltaRentals is not liable for costs arising from delays, missed flights, lost business, or any consequential loss due to a breakdown.
• The Client must not attempt unauthorized repairs or engage third-party mechanics without prior consent from VoltaRentals.
• Tyre punctures are the Client's responsibility (a spare tyre and changing equipment are provided in every vehicle). If a tyre is destroyed, the Client bears the replacement cost.`
    },
    {
      id: "cancellation",
      icon: <AlertTriangle className="h-5 w-5 text-primary" />,
      title: "Cancellation, Refund & No-Show Policy",
      content: `CANCELLATION BY CLIENT:
• More than 72 hours before pickup: Full refund less a TZS 10,000 administrative fee.
• 48–72 hours before pickup: 75% refund.
• 24–48 hours before pickup: 50% refund.
• Less than 24 hours before pickup: Non-refundable.
• No-show (Client fails to appear at pickup time and location without notice): No refund. The full booking amount is forfeited.

CANCELLATION BY VOLTARENTALS:
• In the rare event VoltaRentals cancels a confirmed booking due to factors within our control, a full refund will be processed within 3–5 business days, or an alternative vehicle of equal or greater value will be offered at no extra cost.
• VoltaRentals is not responsible for cancellations or service interruptions caused by natural disasters, civil unrest, government orders, or other circumstances beyond reasonable control (Force Majeure).

Refunds are processed to the original payment method. Mobile money refunds may take 1–3 business days. Bank transfer refunds may take up to 7 business days depending on the receiving institution.`
    },
    {
      id: "liability",
      icon: <Scale className="h-5 w-5 text-primary" />,
      title: "Limitation of Liability & Indemnification",
      content: `VoltaRentals total liability to any Client for any claim arising under these Terms shall not exceed the total amount paid by the Client for the specific rental transaction giving rise to the claim.

VoltaRentals shall not be liable for:
• Indirect, consequential, incidental, or punitive damages of any nature.
• Loss of business, revenue, profits, or goodwill.
• Personal belongings, valuables, or cargo left in or transported in the vehicle.
• Any injury, death, or property damage caused by or to third parties arising from Client's operation of the vehicle.

The Client agrees to indemnify, defend, and hold harmless VoltaRentals, its directors, employees, and agents from and against any claims, liabilities, damages, costs, and expenses (including legal fees) arising from: (i) Client's use or misuse of the vehicle; (ii) Client's violation of these Terms; (iii) any violation of applicable law by the Client or any passenger in the vehicle.`
    },
    {
      id: "governing",
      icon: <Scale className="h-5 w-5 text-primary" />,
      title: "Governing Law & Dispute Resolution",
      content: `These Terms and Conditions are governed exclusively by the laws of the United Republic of Tanzania.

In the event of a dispute arising from or relating to these Terms or any rental transaction, the parties agree to first seek resolution through good-faith negotiation. If negotiation fails within 14 days, disputes shall be referred to mediation under the Tanzania Mediation Centre rules.

If mediation is unsuccessful, the dispute shall be submitted to the exclusive jurisdiction of the competent courts of the United Republic of Tanzania, in the district of Dar es Salaam.

For all legal notices, service of process, and formal communications, the Client must send correspondence to: VoltaRentals Legal, Mikocheni, Dar es Salaam, Tanzania. Tel: +255 790 942 616. Email: legal@voltarentals.co.tz.`
    },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background py-32 print:py-0 print:bg-white">
        <div className="container mx-auto max-w-5xl px-4 print:max-w-none print:px-0">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-24 border-b border-border pb-12 print:mb-12 print:border-black print:pb-8">
            <AnimatedSection>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl">
                    <Zap size={26} className="text-white" fill="currentColor" />
                  </div>
                  <div>
                    <h1 className="text-5xl font-black tracking-tight text-foreground uppercase print:text-black print:text-3xl">Terms & <span className="text-primary print:text-black">Conditions</span></h1>
                    <p className="text-muted-foreground uppercase text-[9px] font-black tracking-[0.3em] mt-1 print:text-black">Official Fleet Protocol — VoltaRentals Tanzania — Last updated: May 2026</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
            <Button onClick={() => window.print()} variant="outline" className="rounded-xl h-12 gap-2 font-black no-print shrink-0">
              <Printer className="h-4 w-4" /> Print Document
            </Button>
          </div>

          {/* Emergency Banner */}
          <AnimatedSection delay={0.05}>
            <div className="mb-12 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center gap-4 no-print">
              <Phone className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">24/7 Emergency & Accident Line</p>
                <p className="font-black text-foreground text-xl tracking-wider">+255 790 942 616</p>
                <p className="text-[9px] text-muted-foreground mt-1">In the event of any accident or emergency, call this number immediately before anything else.</p>
              </div>
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
                      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        {s.icon}
                      </div>
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
                          <p key={pi} className={`text-muted-foreground font-medium leading-relaxed mt-3 first:mt-0 print:text-black print:text-sm ${para.trim() === para.trim().toUpperCase() && para.trim().length < 60 ? 'font-black text-foreground text-[11px] tracking-widest uppercase mt-5' : ''}`}>
                            {para}
                          </p>
                        ) : null
                      )}
                    </div>
                  </div>
                </AnimatedSection>
              ))}

              {/* Signature Block */}
              <AnimatedSection delay={0.2}>
                <div className="pt-8 border-t border-border print:pt-12 print:border-black">
                  <div className="flex flex-col md:flex-row justify-between gap-12">
                    <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary print:text-black">Authorized Signatory</p>
                      <div className="h-24 w-64 border-b-2 border-border bg-muted/20 rounded-t-xl print:bg-transparent print:border-black" />
                      <div>
                        <p className="text-xs font-black text-foreground uppercase">VoltaRentals Tanzania</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Operations & Compliance Director</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary print:text-black">Client Acknowledgment</p>
                      <div className="h-24 w-64 border-b-2 border-border bg-muted/20 rounded-t-xl print:bg-transparent print:border-black" />
                      <div>
                        <p className="text-xs font-black text-foreground uppercase">Full Legal Name & Signature</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Date of Agreement</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
          
          {/* Footer Notice */}
          <AnimatedSection delay={0.3}>
            <div className="mt-32 p-12 bg-primary/5 rounded-[3rem] border border-primary/10 text-center print:mt-12 print:border-black print:p-8">
              <ShieldCheck size={32} className="mx-auto mb-6 text-primary print:text-black" />
              <p className="text-sm font-medium text-muted-foreground max-w-2xl mx-auto leading-relaxed print:text-black print:text-xs">
                This document constitutes a binding legal agreement between <strong>VoltaRentals Tanzania</strong> and the Client. By completing a booking you confirm you have read, understood, and agreed to these Terms and Conditions in full. For legal inquiries, contact <span className="text-primary font-black">legal@voltarentals.co.tz</span>.
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mt-6">
                Registered Business · Dar es Salaam, Tanzania · TRA Compliant · © 2026 VoltaRentals
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
    </>
  );
}
