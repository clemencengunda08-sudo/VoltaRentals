'use client';

import { jsPDF } from "jspdf";
import { format } from "date-fns";

// ============================================================
// VOLTA RENTALS — BRAND COLOR SYSTEM (CLEAN CORPORATE)
// ============================================================
const C = {
  primaryBlue: [15, 38, 92] as [number, number, number],
  accentRed:   [218, 41, 28] as [number, number, number],
  bg:          [255, 255, 255] as [number, number, number], // Clean white
  card:        [248, 250, 252] as [number, number, number], // Very light blue/gray
  textDark:    [15, 23, 42] as [number, number, number],
  textMuted:   [100, 116, 139] as [number, number, number],
  border:      [226, 232, 240] as [number, number, number],
  green:       [16, 185, 129] as [number, number, number],
  gold:        [245, 158, 11] as [number, number, number],
  white:       [255, 255, 255] as [number, number, number],
};

// ============================================================
// HELPER UTILITIES
// ============================================================
const W = 210; // A4 width in mm
const H = 297; // A4 height in mm

function setFill(doc: jsPDF, color: [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setStroke(doc: jsPDF, color: [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function setFont(doc: jsPDF, color: [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function safeDate(val: any): Date {
  if (!val) return new Date();
  if (val?.toDate) return val.toDate();
  if (val?.seconds) return new Date(val.seconds * 1000);
  return new Date(val);
}

function formatDate(val: any): string {
  try { return format(safeDate(val), "dd MMMM yyyy"); }
  catch { return "—"; }
}

function truncate(str: string, max: number): string {
  return str?.length > max ? str.substring(0, max) + "..." : str ?? "—";
}

// ============================================================
// LOGO & HEADER
// ============================================================
function drawHeader(doc: jsPDF, docType: string) {
  // Top blue bar
  setFill(doc, C.primaryBlue);
  doc.rect(0, 0, W, 8, "F");

  // Red accent line
  setFill(doc, C.accentRed);
  doc.rect(0, 8, W, 1.5, "F");

  // Logo Placeholder (Initials)
  setFill(doc, C.primaryBlue);
  doc.roundedRect(14, 16, 20, 20, 2, 2, "F");
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  setFont(doc, C.white);
  doc.text("VR", 24, 29, { align: "center" });

  // Company Name
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  setFont(doc, C.primaryBlue);
  doc.text("VOLTA RENTALS", 40, 24);

  // Tagline
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setFont(doc, C.textMuted);
  doc.text("PREMIUM FLEET SERVICES • TANZANIA", 40, 31, { charSpace: 0.5 });

  // Document Type right aligned
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  setFont(doc, C.accentRed);
  doc.text(docType.toUpperCase(), W - 14, 26, { align: "right", charSpace: 1 });

  // Separator
  setStroke(doc, C.border);
  doc.setLineWidth(0.5);
  doc.line(14, 42, W - 14, 42);
}

// ============================================================
// WATERMARK
// ============================================================
function drawWatermark(doc: jsPDF, status: string) {
  const text = status === "paid" ? "PAID IN FULL" : "PENDING PAYMENT";
  const color: [number, number, number] = status === "paid" ? C.green : C.accentRed;

  doc.saveGraphicsState?.();
  doc.setGState?.(new (doc as any).GState({ opacity: 0.08 }));
  doc.setFontSize(50);
  setFont(doc, color);
  doc.text(text, W / 2, H / 2, {
    align: "center",
    angle: 45,
  });
  doc.restoreGraphicsState?.();
}

// ============================================================
// SECTION HELPER
// ============================================================
function drawSectionLabel(doc: jsPDF, label: string, y: number, x = 14) {
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  setFont(doc, C.primaryBlue);
  doc.text(label.toUpperCase(), x, y, { charSpace: 1 });

  setStroke(doc, C.border);
  doc.setLineWidth(0.3);
  doc.line(x, y + 2, W - 14, y + 2);
}

// ============================================================
// BOOKING SUMMARY HERO
// ============================================================
function drawBookingSummary(doc: jsPDF, booking: any, y: number) {
  setFill(doc, C.card);
  setStroke(doc, C.primaryBlue);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y, W - 28, 24, 2, 2, "FD");

  // Left side - Booking Code
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  setFont(doc, C.textMuted);
  doc.text("BOOKING REFERENCE", 20, y + 8);
  
  doc.setFontSize(14);
  doc.setFont("courier", "bold");
  setFont(doc, C.primaryBlue);
  doc.text(booking.bookingCode ?? "—", 20, y + 16);

  // Right side - Date
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setFont(doc, C.textMuted);
  doc.text(`Issued: ${format(new Date(), "dd MMM yyyy, HH:mm")}`, W - 20, y + 8, { align: "right" });

  // Payment Status Badge inside the card
  const isPaid = booking.paymentStatus === 'paid';
  setFill(doc, isPaid ? C.green : C.accentRed);
  doc.roundedRect(W - 48, y + 12, 28, 7, 1, 1, "F");
  
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  setFont(doc, C.white);
  doc.text(isPaid ? "PAID" : "PENDING", W - 34, y + 17, { align: "center", charSpace: 0.5 });
}

// ============================================================
// TWO COLUMN DETAILS
// ============================================================
function drawDetails(doc: jsPDF, booking: any, user: any, y: number) {
  const colW = (W - 28 - 10) / 2;
  const leftX = 14;
  const rightX = 14 + colW + 10;
  
  // CLIENT DETAILS
  drawSectionLabel(doc, "Client Information", y);
  const clientRows = [
    ["Name:", truncate(booking.userName ?? user?.displayName ?? "—", 30)],
    ["Email:", truncate(booking.userEmail ?? user?.email ?? "—", 35)],
    ["Phone:", booking.userPhone ?? "—"],
    ["Location:", booking.userCity ?? "Dar es Salaam"],
  ];
  
  clientRows.forEach(([label, value], i) => {
    const rowY = y + 8 + i * 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setFont(doc, C.textMuted);
    doc.text(label, leftX, rowY);
    
    doc.setFont("helvetica", "bold");
    setFont(doc, C.textDark);
    doc.text(value, leftX + 20, rowY);
  });

  // VEHICLE DETAILS
  drawSectionLabel(doc, "Vehicle Information", y, rightX);
  const vehicleRows = [
    ["Vehicle:", truncate(booking.vehicleName ?? "—", 30)],
    ["Plate No:", booking.vehiclePlate ?? "—"],
    ["Category:", booking.vehicleCategory ?? "Premium"],
    ["Service:", booking.withDriver ? "Chauffeur Driven" : "Self Drive"],
  ];

  vehicleRows.forEach(([label, value], i) => {
    const rowY = y + 8 + i * 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setFont(doc, C.textMuted);
    doc.text(label, rightX, rowY);
    
    doc.setFont("helvetica", "bold");
    setFont(doc, C.textDark);
    doc.text(value, rightX + 20, rowY);
  });

  return y + 36;
}

// ============================================================
// TIMELINE
// ============================================================
function drawTimeline(doc: jsPDF, booking: any, y: number) {
  drawSectionLabel(doc, "Rental Period", y);
  
  setFill(doc, C.card);
  setStroke(doc, C.border);
  doc.setLineWidth(0.3);
  doc.rect(14, y + 6, W - 28, 20, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setFont(doc, C.textMuted);
  
  doc.text("Pickup Date:", 20, y + 13);
  doc.text("Return Date:", W - 20, y + 13, { align: "right" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  setFont(doc, C.primaryBlue);
  
  doc.text(formatDate(booking.startDate), 20, y + 19);
  doc.text(formatDate(booking.endDate), W - 20, y + 19, { align: "right" });

  // Center Duration
  doc.setFontSize(9);
  setFont(doc, C.accentRed);
  doc.text(`${booking.totalDays ?? 1} DAYS`, W / 2, y + 17, { align: "center", charSpace: 1 });
  
  // Arrow line
  setStroke(doc, C.border);
  doc.line(W / 2 - 20, y + 19, W / 2 + 20, y + 19);

  return y + 34;
}

// ============================================================
// FINANCIAL TABLE
// ============================================================
function drawFinancialTable(doc: jsPDF, booking: any, y: number): number {
  drawSectionLabel(doc, "Financial Breakdown", y);
  y += 6;

  const colX = [14, 100, 140, 172];
  const rowH = 10;

  // Header
  setFill(doc, C.primaryBlue);
  doc.rect(14, y, W - 28, rowH, "F");
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  setFont(doc, C.white);
  ["DESCRIPTION", "QTY (DAYS)", "RATE", "TOTAL"].forEach((h, i) => {
    doc.text(h, colX[i] + 3, y + 6.5, { charSpace: 0.5 });
  });
  y += rowH;

  // Rows
  const driverFee = booking.withDriver ? (booking.driverFee ?? 30000) : 0;
  
  const rows = [
    ["Vehicle Rental", `${booking.totalDays ?? 1}`, `TSh ${(booking.vehiclePricePerDay ?? 0).toLocaleString()}`, `TSh ${((booking.vehiclePricePerDay ?? 0) * (booking.totalDays ?? 1)).toLocaleString()}`],
  ];
  
  if (booking.withDriver) {
    rows.push(["Chauffeur Service", `${booking.totalDays ?? 1}`, `TSh ${(booking.driverFee ?? 30000).toLocaleString()}`, `TSh ${(driverFee * (booking.totalDays ?? 1)).toLocaleString()}`]);
  }

  rows.forEach((row, i) => {
    const rowY = y + i * rowH;
    setFill(doc, i % 2 === 0 ? C.white : C.card);
    doc.rect(14, rowY, W - 28, rowH, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setFont(doc, C.textDark);
    row.forEach((cell, j) => {
      doc.text(cell, colX[j] + 3, rowY + 6.5);
    });
  });

  y += rows.length * rowH;

  // Total
  setFill(doc, C.card);
  setStroke(doc, C.primaryBlue);
  doc.setLineWidth(0.5);
  doc.rect(14, y, W - 28, 12, "FD");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  setFont(doc, C.primaryBlue);
  doc.text("TOTAL AMOUNT", colX[0] + 3, y + 8);
  
  setFont(doc, C.accentRed);
  doc.text(`TSh ${(booking.totalPrice ?? 0).toLocaleString()}`, colX[3] + 3, y + 8);

  return y + 20;
}

// ============================================================
// FOOTER
// ============================================================
function drawFooter(doc: jsPDF, bookingCode: string, pageNum: number, totalPages: number) {
  const footerY = H - 20;

  setStroke(doc, C.border);
  doc.setLineWidth(0.5);
  doc.line(14, footerY, W - 14, footerY);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  setFont(doc, C.textMuted);
  
  doc.text("Volta Rentals Tanzania", 14, footerY + 5);
  doc.text("info@voltarentals.co.tz | +255 700 000 000", W / 2, footerY + 5, { align: "center" });
  doc.text(`Page ${pageNum} of ${totalPages}`, W - 14, footerY + 5, { align: "right" });
  
  doc.text(`Doc Ref: ${bookingCode}-${Date.now().toString().slice(-6)}`, W / 2, footerY + 10, { align: "center" });
}

// ============================================================
// PAGE 2: TERMS AND SIGNATURES
// ============================================================
function drawTerms(doc: jsPDF, y: number): number {
  drawSectionLabel(doc, "Terms & Conditions", y);
  y += 8;

  const terms = [
    "1. FUEL POLICY: Vehicle must be returned with the same fuel level as at pickup. Shortfall incurs TSh 15,000 fee plus fuel cost.",
    "2. LATE RETURN: Returns exceeding agreed time by 2+ hours are charged at the full daily rate for that additional day.",
    "3. DAMAGE LIABILITY: Renter is fully liable for damage beyond normal wear. A damage deposit may be required at collection.",
    "4. CANCELLATION: Cancellations 48+ hours before pickup receive a full refund. Within 48 hours, 50% of total is forfeited.",
    "5. PROHIBITED USE: Vehicles may not be used for racing, unauthorized off-road, subletting, or transporting illegal goods.",
    "6. JURISDICTION: This agreement is governed by the laws of the United Republic of Tanzania."
  ];

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  setFont(doc, C.textDark);

  terms.forEach(term => {
    const lines = doc.splitTextToSize(term, W - 28);
    doc.text(lines, 14, y);
    y += lines.length * 5;
  });

  return y + 10;
}

function drawSignatures(doc: jsPDF, booking: any, y: number) {
  drawSectionLabel(doc, "Signatures & Authorization", y);
  y += 12;

  const colW = (W - 28 - 20) / 2;
  
  // Left: Volta
  setFill(doc, C.card);
  doc.roundedRect(14, y, colW, 35, 2, 2, "F");
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  setFont(doc, C.primaryBlue);
  doc.text("AUTHORIZED BY (VOLTA RENTALS)", 18, y + 6);
  
  if (booking.adminSignature) {
    try {
      doc.addImage(booking.adminSignature, "PNG", 18, y + 8, 40, 15);
    } catch (e) {
      // Fallback
      setStroke(doc, C.border);
      doc.line(18, y + 22, 14 + colW - 4, y + 22);
    }
  } else {
    setStroke(doc, C.border);
    doc.line(18, y + 22, 14 + colW - 4, y + 22);
  }
  
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  setFont(doc, C.textMuted);
  doc.text("Fleet Manager Signature & Stamp", 18, y + 28);
  doc.text(`Date: ${format(new Date(), "dd MMM yyyy")}`, 18, y + 32);

  // Right: Client
  const rightX = 14 + colW + 20;
  setFill(doc, C.card);
  doc.roundedRect(rightX, y, colW, 35, 2, 2, "F");
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  setFont(doc, C.primaryBlue);
  doc.text("CLIENT ACCEPTANCE", rightX + 4, y + 6);
  
  if (booking.clientSignature) {
    try {
      doc.addImage(booking.clientSignature, "PNG", rightX + 10, y + 8, 40, 15);
    } catch (e) {
      // Fallback if image breaks
      setStroke(doc, C.border);
      doc.line(rightX + 4, y + 22, rightX + colW - 4, y + 22);
    }
  } else {
    setStroke(doc, C.border);
    doc.line(rightX + 4, y + 22, rightX + colW - 4, y + 22);
  }
  
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  setFont(doc, C.textMuted);
  doc.text(`${booking.userName ?? 'Client'} Signature`, rightX + 4, y + 28);
  doc.text(`Date: ${formatDate(booking.createdAt)}`, rightX + 4, y + 32);
}

// ============================================================
// MAIN GENERATORS
// ============================================================
export const generateBookingReceipt = (booking: any, user?: any) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const totalPages = 2;

  // --- PAGE 1: RECEIPT DETAILS ---
  drawHeader(doc, "BOOKING RECEIPT");
  drawWatermark(doc, booking.paymentStatus ?? "pending");

  let y = 55;
  drawBookingSummary(doc, booking, y);
  y += 32;

  y = drawDetails(doc, booking, user, y);
  y = drawTimeline(doc, booking, y);
  y = drawFinancialTable(doc, booking, y);
  
  drawFooter(doc, booking.bookingCode ?? "VOLTA", 1, totalPages);

  // --- PAGE 2: TERMS AND SIGNATURE ---
  doc.addPage();
  drawHeader(doc, "TERMS & CONDITIONS");
  
  y = 55;
  y = drawTerms(doc, y);
  drawSignatures(doc, booking, y);
  
  drawFooter(doc, booking.bookingCode ?? "VOLTA", 2, totalPages);

  doc.save(`VoltaRentals-Receipt-${booking.bookingCode}.pdf`);
};

export const generateRentalContract = (booking: any, user?: any) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const totalPages = 2;

  // --- PAGE 1: CONTRACT DETAILS ---
  drawHeader(doc, "RENTAL CONTRACT");
  drawWatermark(doc, booking.paymentStatus ?? "pending");

  let y = 55;
  drawBookingSummary(doc, booking, y);
  y += 32;

  y = drawDetails(doc, booking, user, y);
  y = drawTimeline(doc, booking, y);
  y = drawFinancialTable(doc, booking, y);
  
  drawFooter(doc, booking.bookingCode ?? "VOLTA", 1, totalPages);

  // --- PAGE 2: TERMS AND SIGNATURE ---
  doc.addPage();
  drawHeader(doc, "TERMS & SIGNATURES");
  
  y = 55;
  y = drawTerms(doc, y);
  drawSignatures(doc, booking, y);
  
  drawFooter(doc, booking.bookingCode ?? "VOLTA", 2, totalPages);

  doc.save(`VoltaRentals-Contract-${booking.bookingCode}.pdf`);
};