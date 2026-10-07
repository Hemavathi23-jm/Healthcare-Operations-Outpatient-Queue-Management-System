import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a clean, professional medical prescription PDF.
 * @param {Object} consultation - Consultation data object
 */
export const generatePrescriptionPdf = (consultation) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Header Banner / Hospital Branding
  doc.setFillColor(15, 118, 110); // Teal 700 (#0f766e)
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Hospital Name & Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MEDQUEUE HEALTHCARE PLATFORM', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Center for Specialized Clinical Care & Queue Management', margin, 18);
  doc.text('Tel: +1 (555) 0199-CARE  |  Email: contact@medqueue-health.org', margin, 23);

  // Right Header Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('MEDICAL PRESCRIPTION', pageWidth - margin, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const dateStr = consultation.createdAt ? new Date(consultation.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : new Date().toLocaleDateString();
  doc.text(`Date: ${dateStr}`, pageWidth - margin, 21, { align: 'right' });

  // 2. Doctor & Patient Information Box
  let currentY = 34;

  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 34, 3, 3, 'FD');

  // Doctor Info (Left)
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(consultation.doctorName ? `Dr. ${consultation.doctorName.replace(/^Dr\.\s*/i, '')}` : 'Consulting Physician', margin + 4, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Specialization: ${consultation.doctorSpecialization || 'General Practitioner'}`, margin + 4, currentY + 13);
  doc.text(`Department: ${consultation.departmentName || 'Outpatient Clinic'}`, margin + 4, currentY + 19);
  doc.text(`Appointment Ref: #${consultation.appointmentNumber || consultation.appointmentId || 'N/A'}`, margin + 4, currentY + 25);

  // Patient Info (Right)
  const patientLeft = pageWidth / 2 + 6;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Patient: ${consultation.patientName || 'N/A'}`, patientLeft, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Patient ID: ${consultation.patientCode || 'PAT-N/A'}   |   Gender: ${consultation.patientGender || 'N/A'}`, patientLeft, currentY + 13);
  doc.text(`Phone: ${consultation.patientPhone || 'N/A'}   |   Blood Group: ${consultation.patientBloodGroup || 'N/A'}`, patientLeft, currentY + 19);
  if (consultation.patientDob) {
    doc.text(`DOB: ${consultation.patientDob}`, patientLeft, currentY + 25);
  }

  currentY += 40;

  // 3. Vital Signs Bar
  const vitals = [];
  if (consultation.bloodPressure) vitals.push(`BP: ${consultation.bloodPressure} mmHg`);
  if (consultation.pulseRate) vitals.push(`Pulse: ${consultation.pulseRate} bpm`);
  if (consultation.temperature) vitals.push(`Temp: ${consultation.temperature} °F`);
  if (consultation.spo2) vitals.push(`SpO2: ${consultation.spo2}%`);
  if (consultation.weightKg) vitals.push(`Weight: ${consultation.weightKg} kg`);

  if (vitals.length > 0) {
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 10, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 118, 110);
    doc.text('VITALS: ', margin + 3, currentY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(vitals.join('   |   '), margin + 20, currentY + 6.5);

    currentY += 15;
  }

  // 4. Clinical Diagnosis & Chief Complaints
  if (consultation.chiefComplaints || consultation.diagnosis) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('CLINICAL ASSESSMENT & DIAGNOSIS', margin, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    if (consultation.chiefComplaints) {
      doc.setFont('helvetica', 'bold');
      doc.text('Chief Complaints: ', margin, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(consultation.chiefComplaints, margin + 32, currentY);
      currentY += 6;
    }

    if (consultation.diagnosis) {
      doc.setFont('helvetica', 'bold');
      doc.text('Primary Diagnosis: ', margin, currentY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 118, 110);
      doc.text(consultation.diagnosis, margin + 33, currentY);
      doc.setTextColor(51, 65, 85);
      currentY += 8;
    }
  }

  // 5. Rx Medication Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110);
  doc.text('Rx - PRESCRIBED MEDICATIONS', margin, currentY);
  currentY += 3;

  const prescriptionItems = consultation.prescriptionItems || [];
  const tableData = prescriptionItems.length > 0
    ? prescriptionItems.map((item, index) => [
        index + 1,
        item.medicineName || 'Medicine',
        item.dosage || '-',
        item.frequency || '1-0-1',
        item.duration || '5 Days',
        item.instructions || 'After food',
      ])
    : [['1', 'No prescription items added', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Medicine / Formulation', 'Dosage', 'Frequency', 'Duration', 'Special Instructions']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 55, fontStyle: 'bold' },
      2: { cellWidth: 25 },
      3: { cellWidth: 28 },
      4: { cellWidth: 24 },
      5: { cellWidth: 40 },
    },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 6. Diagnostic Tests & Clinical Advice
  if (consultation.labInvestigations) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Lab Investigations / Diagnostics Recommended:', margin, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(consultation.labInvestigations, margin, currentY);
    currentY += 8;
  }

  if (consultation.clinicalNotes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Doctor Advice & General Instructions:', margin, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(consultation.clinicalNotes, pageWidth - margin * 2);
    doc.text(splitNotes, margin, currentY);
    currentY += splitNotes.length * 4.5 + 4;
  }

  if (consultation.followUpDate) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.text(`Follow-up Recommended On: ${consultation.followUpDate}`, margin, currentY);
    currentY += 10;
  }

  // 7. Signature & Stamp Footer (Bottom of Page)
  const footerY = pageHeight - 32;

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer generated medical record and digital prescription.', margin, footerY + 6);
  doc.text('Powered by MedQueue Health OS — Confidential Medical Record.', margin, footerY + 10);

  // Doctor Signature Line
  const sigLeft = pageWidth - margin - 50;
  doc.setDrawColor(100, 116, 139);
  doc.line(sigLeft, footerY + 14, pageWidth - margin, footerY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(consultation.doctorName ? `Dr. ${consultation.doctorName.replace(/^Dr\.\s*/i, '')}` : 'Doctor Signature', sigLeft, footerY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Medical Practitioner', sigLeft, footerY + 22);

  // Save / Download PDF
  const filename = `Prescription_${consultation.patientCode || 'PAT'}_${consultation.appointmentNumber || 'RX'}.pdf`;
  doc.save(filename);
};
