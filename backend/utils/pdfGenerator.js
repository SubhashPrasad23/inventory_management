const PDFDocument = require("pdfkit");

// Template 1
const generateProfessionalTemplate = (doc, sale, shopInfo) => {
  // Company info top left
  doc.fontSize(14).font("Helvetica-Bold").fillColor("#000").text(shopInfo.shopName, 50, 45);
  doc.fontSize(9).font("Helvetica").fillColor("#333");
  doc.text(shopInfo.address || "", 50, 65);
  doc.text(`Phone: ${shopInfo.phone || "N/A"}`, 50, 78);

  // INVOICE text top right
  doc.fontSize(20).font("Helvetica-Bold").fillColor("#333").text("INVOICE", 430, 45);

  // Invoice # and Date boxes
  doc.rect(370, 75, 85, 16).fillAndStroke("#8b0000", "#8b0000");
  doc.rect(460, 75, 85, 16).fillAndStroke("#8b0000", "#8b0000");
  doc.fill("#fff").fontSize(8).font("Helvetica-Bold");
  doc.text("INVOICE #", 380, 80);
  doc.text("DATE", 478, 80);

  doc.rect(370, 91, 85, 16).stroke("#8b0000");
  doc.rect(460, 91, 85, 16).stroke("#8b0000");
  doc.fillColor("#000").font("Helvetica").fontSize(8);
  doc.text(sale.invoiceNumber, 380, 96);
  doc.text(new Date(sale.createdAt).toLocaleDateString("en-IN"), 478, 96);

  // BILL TO box
  doc.rect(50, 125, 200, 16).fillAndStroke("#333", "#333");
  doc.fill("#fff").fontSize(9).font("Helvetica-Bold").text("BILL TO", 58, 130);

  doc.fillColor("#000").font("Helvetica").fontSize(9);
  doc.text(sale.customerName, 58, 148);
  doc.text(sale.customerAddress || "", 58, 161);
  doc.text(sale.customerPhone || "", 58, 174);

  // Table with border
  const tableTop = 205;
  // Table border
  doc.rect(50, tableTop, 495, 20).fillAndStroke("#8b0000", "#8b0000");
  doc.fill("#fff").fontSize(9).font("Helvetica-Bold");
  doc.text("DESCRIPTION", 60, tableTop + 6);
  doc.text("AMOUNT", 460, tableTop + 6);

  // Table body with full border
  let y = tableTop + 22;
  doc.fillColor("#000").font("Helvetica").fontSize(9);
  sale.items.forEach((item) => {
    doc.rect(50, y, 495, 20).stroke("#ccc");
    doc.text(`${item.productName} (x${item.quantity} @ Rs ${item.price.toFixed(2)})`, 60, y + 6);
    doc.text(`Rs ${item.itemTotal.toFixed(2)}`, 460, y + 6);
    y += 20;
  });

  // Discount row
  if (sale.discount > 0) {
    const subtotal = sale.items.reduce((s, item) => s + item.itemTotal, 0);
    doc.rect(50, y, 495, 20).stroke("#ccc");
    doc.fillColor("#8b0000").text(`Discount (${sale.discount}%)`, 60, y + 6);
    doc.text(`-Rs ${(subtotal * sale.discount / 100).toFixed(2)}`, 460, y + 6);
    y += 20;
    doc.fillColor("#000");
  }

  // Thank you + Total row
  y += 10;
  doc.rect(50, y, 300, 22).stroke("#ccc");
  doc.rect(350, y, 195, 22).stroke("#ccc");
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#8b0000");
  doc.text("Thank you for your business!", 60, y + 6);
  doc.fillColor("#000");
  doc.text("TOTAL", 360, y + 6);
  doc.text(`Rs ${sale.totalAmount.toFixed(2)}`, 460, y + 6);

  // Note
  if (sale.note) {
    y += 40;
    doc.fontSize(8).font("Helvetica-Bold").fillColor("#333").text("Note:", 50, y);
    doc.font("Helvetica").text(sale.note, 85, y);
  }

  // Footer
  y += 50;
  doc.fontSize(8).font("Helvetica").fillColor("#8b0000");
  doc.text("If you have any questions about this invoice, please contact", 50, 700, { align: "center", width: 495 });
  doc.fillColor("#333").text(`${shopInfo.shopName}, Phone: ${shopInfo.phone || "N/A"}`, 50, 712, { align: "center", width: 495 });

  doc.fontSize(7).fillColor("#999");
  doc.text(`Payment: ${sale.paymentMode.toUpperCase()} | GST: ${shopInfo.gstNumber || "N/A"}`, 50, 740, { align: "center", width: 495 });

  // Smart Dukan watermark
  doc.fontSize(7).fillColor("#ccc").text("Powered by Smart Dukan", 50, 770, { align: "center", width: 495 });
};

// Template 2
const generateModernYellowTemplate = (doc, sale, shopInfo) => {
  // Shop name top left
  doc.fontSize(14).font("Helvetica-Bold").fillColor("#1e293b").text(shopInfo.shopName, 50, 40);
  doc.fontSize(7).font("Helvetica").fillColor("#888");
  doc.text(shopInfo.address || "", 50, 58);

  // INVOICE title top right
  doc.fontSize(22).font("Helvetica-Bold").fillColor("#f59e0b").text("INVOICE", 420, 38);

  // Invoice details
  doc.fontSize(9).font("Helvetica-Bold").fillColor("#f59e0b").text("Invoice to:", 50, 85);
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#000").text(sale.customerName, 50, 100);
  doc.fontSize(8).font("Helvetica").fillColor("#666");
  doc.text(sale.customerAddress || "", 50, 114);
  doc.text(sale.customerPhone || "", 50, 126);

  doc.fontSize(9).font("Helvetica").fillColor("#333");
  doc.text("Invoice#", 420, 68);
  doc.text(sale.invoiceNumber, 480, 68);
  doc.text("Date", 420, 82);
  doc.text(new Date(sale.createdAt).toLocaleDateString("en-IN"), 480, 82);

  // Table header
  const tableTop = 155;
  doc.rect(50, tableTop, 495, 20).fill("#f59e0b");
  doc.fill("#fff").fontSize(8).font("Helvetica-Bold");
  doc.text("SL.", 58, tableTop + 6);
  doc.text("Item Description", 85, tableTop + 6);
  doc.text("Price", 320, tableTop + 6);
  doc.text("Qty.", 390, tableTop + 6);
  doc.text("Total", 450, tableTop + 6);

  // Table rows
  let y = tableTop + 26;
  doc.fillColor("#000").font("Helvetica").fontSize(9);
  sale.items.forEach((item, i) => {
    doc.text(String(i + 1), 58, y);
    doc.text(item.productName, 85, y);
    doc.text(`Rs ${item.price.toFixed(2)}`, 320, y);
    doc.text(String(item.quantity), 390, y);
    doc.text(`Rs ${item.itemTotal.toFixed(2)}`, 450, y);
    doc.moveTo(50, y + 14).lineTo(545, y + 14).strokeColor("#eee").lineWidth(0.5).stroke();
    y += 20;
  });

  // Totals
  y += 12;
  const subtotal = sale.items.reduce((s, item) => s + item.itemTotal, 0);
  doc.fontSize(9).font("Helvetica").fillColor("#333");
  doc.text("Sub Total:", 390, y);
  doc.text(`Rs ${subtotal.toFixed(2)}`, 470, y);
  y += 14;

  if (sale.discount > 0) {
    doc.fillColor("#dc2626").text(`Discount (${sale.discount}%):`, 390, y);
    doc.text(`-Rs ${(subtotal * sale.discount / 100).toFixed(2)}`, 470, y);
    y += 14;
    doc.fillColor("#333");
  }

  doc.text("Tax:", 390, y);
  doc.text("0.00%", 470, y);
  y += 18;

  // Total box
  doc.rect(380, y - 2, 165, 22).fill("#f59e0b");
  doc.fill("#fff").fontSize(10).font("Helvetica-Bold");
  doc.text("Total:", 390, y + 3);
  doc.text(`Rs ${sale.totalAmount.toFixed(2)}`, 470, y + 3);

  // Thank you + notes
  y += 35;
  doc.fillColor("#333").fontSize(9).font("Helvetica-Bold").text("Thank you for your business", 50, y);

  if (sale.note) {
    y += 18;
    doc.fontSize(8).font("Helvetica-Bold").text("Note:", 50, y);
    doc.font("Helvetica").text(sale.note, 85, y);
  }

  y += 25;
  doc.fontSize(8).font("Helvetica-Bold").fillColor("#333").text("Payment Info:", 50, y);
  doc.font("Helvetica").fillColor("#666");
  doc.text(`Mode: ${sale.paymentMode.toUpperCase()} | GST: ${shopInfo.gstNumber || "N/A"}`, 50, y + 12);

  // Bottom yellow bar with Smart Dukan tag
  const pageHeight = 792;
  doc.rect(0, pageHeight - 30, 595, 30).fill("#f59e0b");
  doc.fill("#fff").fontSize(7).font("Helvetica");
  doc.text(`${shopInfo.phone || ""} | ${shopInfo.address || ""} | Powered by Smart Dukan`, 50, pageHeight - 20, { align: "center", width: 495 });
};

// Main function
const generateInvoicePDF = (sale, shopInfo, res, template = "professional") => {
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${sale.invoiceNumber}.pdf`);
  doc.pipe(res);

  switch (template) {
    case "modern":
      generateModernYellowTemplate(doc, sale, shopInfo);
      break;
    default:
      generateProfessionalTemplate(doc, sale, shopInfo);
  }

  doc.end();
};

module.exports = { generateInvoicePDF };
