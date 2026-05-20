import { jsPDF } from "jspdf";
import { format } from "date-fns";

export const pdfService = {
  generateReceipt: (booking: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(185, 28, 28); // Primary Red
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("VOLTA RENTALS", 20, 25);
    
    doc.setFontSize(10);
    doc.text("OFFICIAL BOOKING RECEIPT", 140, 25);
    
    // Body
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Booking Code: ${booking.bookingCode}`, 20, 60);
    doc.text(`Date: ${format(new Date(), 'PPP')}`, 140, 60);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 65, 190, 65);
    
    // Customer Info
    doc.setFont("helvetica", "bold");
    doc.text("CUSTOMER DETAILS", 20, 80);
    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${booking.userName}`, 20, 90);
    doc.text(`Phone: ${booking.userPhone}`, 20, 100);
    doc.text(`Email: ${booking.userEmail || 'N/A'}`, 20, 110);
    
    // Vehicle Info
    doc.setFont("helvetica", "bold");
    doc.text("VEHICLE DETAILS", 110, 80);
    doc.setFont("helvetica", "normal");
    doc.text(`Asset: ${booking.vehicleName}`, 110, 90);
    doc.text(`Plate: ${booking.vehiclePlate}`, 110, 100);
    doc.text(`Duration: ${booking.totalDays} Day(s)`, 110, 110);
    
    // Dates
    doc.text(`Start: ${format(new Date(booking.startDate), 'PP')}`, 20, 130);
    doc.text(`Return: ${format(new Date(booking.endDate), 'PP')}`, 110, 130);
    
    doc.line(20, 140, 190, 140);
    
    // Pricing Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 150, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, 157);
    doc.text("Amount (TSh)", 150, 157);
    
    // Pricing Rows
    doc.setFont("helvetica", "normal");
    doc.text("Base Rental Fee", 25, 170);
    doc.text(booking.baseRate?.toLocaleString() || '0', 150, 170);
    
    if (booking.driverFee > 0) {
      doc.text("Chauffeur Service", 25, 180);
      doc.text(booking.driverFee?.toLocaleString() || '0', 150, 180);
    }
    
    if (booking.airportFee > 0) {
      doc.text("Airport Delivery", 25, 190);
      doc.text(booking.airportFee?.toLocaleString() || '0', 150, 190);
    }
    
    doc.line(20, 200, 190, 200);
    
    // Total
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL PAID:", 25, 215);
    doc.text(`TSh ${booking.totalPrice?.toLocaleString()}`, 130, 215);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated receipt. No signature required.", 105, 270, { align: 'center' });
    doc.text("VoltaRentals Executive Fleet | Dar es Salaam, Tanzania", 105, 275, { align: 'center' });
    
    doc.save(`Receipt-${booking.bookingCode}.pdf`);
  }
};
