import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

/**
 * Generates and downloads a clean, professional multi-page A4 PDF report
 * @param {Object} reportData - aggregated report data from reportsService
 */
export const exportReportToPdf = (reportData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const todayStr = new Date().toISOString().split('T')[0];
  const generatedTime = new Date().toLocaleString();

  // Header Banner (Teal)
  doc.setFillColor(13, 148, 136); // teal-600
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MedQueue Healthcare Operations', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Hospital Capacity, Resource Allocation & Clinical Throughput Report', 14, 18);

  // Metadata block
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Metadata:', 14, 33);
  doc.setFont('helvetica', 'normal');
  doc.text(`Reporting Period: ${reportData.periodLabel}`, 14, 38);
  doc.text(`Generated On: ${generatedTime}`, 14, 43);
  doc.text(`Facility: Outpatient Diagnostic & Specialty Clinic (OPD Wing A)`, 14, 48);

  // Summary Metrics Table
  const summary = reportData.summary;
  autoTable(doc, {
    startY: 53,
    theme: 'grid',
    head: [['Total Appointments', 'Completed', 'Cancelled', 'Live Queue Waiting', 'Capacity Utilization']],
    body: [
      [
        `${summary.totalAppointments}`,
        `${summary.completed}`,
        `${summary.cancelled}`,
        `${summary.waiting}`,
        `${summary.overallUtilization}%`,
      ],
    ],
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9,
    },
    bodyStyles: {
      halign: 'center',
      fontSize: 10,
      fontStyle: 'bold',
      textColor: [13, 148, 136],
    },
  });

  let currentY = doc.lastAutoTable.finalY + 8;

  // Section 1: Appointment Status Distribution
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. Appointment Status Distribution', 14, currentY);

  const statusRows =
    reportData.statusDistribution && reportData.statusDistribution.length > 0
      ? reportData.statusDistribution.map((s) => [s.label, `${s.count}`, `${s.percentage}%`])
      : [['No appointment records found for this period', '0', '0%']];

  autoTable(doc, {
    startY: currentY + 3,
    theme: 'striped',
    head: [['Status Category', 'Appointment Count', 'Distribution Share (%)']],
    body: statusRows,
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Section 2: Doctor Utilization Ledger
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. Physician Utilization & Capacity Ledger', 14, currentY);

  const docRows =
    reportData.doctorUtilization && reportData.doctorUtilization.length > 0
      ? reportData.doctorUtilization.map((d) => [
          d.doctor,
          d.department,
          `${d.capacity} slots`,
          `${d.booked} slots`,
          `${d.utilizationRate}%`,
          d.utilizationRate >= 90 ? 'Near Peak' : 'Optimal',
        ])
      : [['No doctor utilization data found', '-', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: currentY + 3,
    theme: 'striped',
    head: [['Physician', 'Department', 'Daily Limit', 'Booked', 'Utilization', 'Capacity Status']],
    body: docRows,
    headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Check page overflow
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  // Section 3: Department Workload
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. Department Workload vs Capacity Limits', 14, currentY);

  const deptRows =
    reportData.departmentLoad && reportData.departmentLoad.length > 0
      ? reportData.departmentLoad.map((d) => [
          d.department,
          `${d.activePatients} patients`,
          `${d.maxCapacity} ceiling`,
          `${d.percentage}%`,
        ])
      : [['No department records found', '-', '-', '-']];

  autoTable(doc, {
    startY: currentY + 3,
    theme: 'striped',
    head: [['Department', 'Active Appointments', 'Capacity Ceiling', 'Workload (%)']],
    body: deptRows,
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Check page overflow
  if (currentY > 235) {
    doc.addPage();
    currentY = 20;
  }

  // Section 4: Live Queue Statistics
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('4. Live Queue & Patient Waiting Analysis', 14, currentY);

  const q = reportData.queueStats;
  autoTable(doc, {
    startY: currentY + 3,
    theme: 'grid',
    head: [['Queue Metric', 'Current Value']],
    body: [
      ['Patients Currently Waiting in Queue', `${q.totalWaiting}`],
      ['Patients in Active Consultation', `${q.totalInConsultation}`],
      ['Total Completed Consultations Today', `${q.totalCompleted}`],
      ['Total Skipped Patients', `${q.totalSkipped}`],
      ['Average Predicted Waiting Time', `${q.avgWaitMinutes} minutes`],
    ],
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // Section 5: Cancellations Root Causes (if any)
  if (reportData.cancellationsList && reportData.cancellationsList.length > 0) {
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('5. Cancellation Root Cause Log', 14, currentY);

    const cancelRows = reportData.cancellationsList.map((c) => [
      c.patientName,
      c.doctorName,
      c.departmentName,
      `${c.appointmentDate} ${c.appointmentTime || ''}`,
      c.reason,
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      theme: 'striped',
      head: [['Patient', 'Physician', 'Department', 'Scheduled Slot', 'Reported Cancellation Reason']],
      body: cancelRows,
      headStyles: { fillColor: [225, 29, 72], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
    });
  }

  // Page Numbers Footer on every page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `MedQueue Healthcare Operations Platform • Confidential Internal Report • Page ${i} of ${totalPages}`,
      105,
      290,
      { align: 'center' }
    );
  }

  doc.save(`healthcare-capacity-report-${todayStr}.pdf`);
};

/**
 * Generates and downloads a real .xlsx workbook with 6 sheets
 * @param {Object} reportData - aggregated report data from reportsService
 */
export const exportReportToExcel = async (reportData) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MedQueue Healthcare Operations';
  workbook.created = new Date();

  const todayStr = new Date().toISOString().split('T')[0];

  const tealFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0D9488' },
  };

  const darkFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F172A' },
  };

  const headerFont = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };

  // 1. Worksheet: Summary
  const wsSummary = workbook.addWorksheet('Summary');
  wsSummary.columns = [
    { header: 'Metric', key: 'metric', width: 35 },
    { header: 'Value', key: 'value', width: 25 },
    { header: 'Unit / Context', key: 'unit', width: 30 },
  ];
  wsSummary.getRow(1).font = headerFont;
  wsSummary.getRow(1).fill = tealFill;

  wsSummary.addRows([
    { metric: 'Report Title', value: 'Hospital Capacity & Resource Utilization Report', unit: 'Executive Summary' },
    { metric: 'Reporting Period', value: reportData.periodLabel, unit: 'Date Filter' },
    { metric: 'Generated On', value: new Date().toLocaleString(), unit: 'System Timestamp' },
    { metric: 'Total Appointments', value: reportData.summary.totalAppointments, unit: 'Appointments' },
    { metric: 'Completed Consultations', value: reportData.summary.completed, unit: 'Appointments' },
    { metric: 'Cancelled Appointments', value: reportData.summary.cancelled, unit: 'Appointments' },
    { metric: 'Live Queue Waiting', value: reportData.summary.waiting, unit: 'Patients' },
    { metric: 'Overall Capacity Utilization', value: `${reportData.summary.overallUtilization}%`, unit: 'Percentage' },
    { metric: 'Average Wait Time', value: `${reportData.queueStats.avgWaitMinutes} mins`, unit: 'Minutes' },
  ]);

  // 2. Worksheet: Appointments
  const wsAppts = workbook.addWorksheet('Appointments');
  wsAppts.columns = [
    { header: 'Appointment ID', key: 'id', width: 16 },
    { header: 'Patient Name', key: 'patientName', width: 25 },
    { header: 'Patient Code', key: 'patientCode', width: 18 },
    { header: 'Doctor Name', key: 'doctorName', width: 25 },
    { header: 'Department', key: 'departmentName', width: 22 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Time', key: 'time', width: 12 },
    { header: 'Type', key: 'type', width: 22 },
    { header: 'Priority', key: 'priority', width: 16 },
    { header: 'Status', key: 'status', width: 16 },
    { header: 'Notes / Reason', key: 'notes', width: 35 },
  ];
  wsAppts.getRow(1).font = headerFont;
  wsAppts.getRow(1).fill = darkFill;

  (reportData.appointments || []).forEach((a) => {
    wsAppts.addRow({
      id: a.id || a.appointmentNumber || '-',
      patientName: a.patientName || 'Patient',
      patientCode: a.patientCode || a.patientNumber || 'MED-PAT',
      doctorName: a.doctorName || 'Doctor',
      departmentName: a.departmentName || 'Department',
      date: a.appointmentDate || (a.scheduledStartTime ? String(a.scheduledStartTime).substring(0, 10) : ''),
      time: a.appointmentTime || (a.scheduledStartTime ? String(a.scheduledStartTime).substring(11, 16) : ''),
      type: a.appointmentTypeName || a.type || 'Consultation',
      priority: a.priority || 'NORMAL',
      status: a.status || 'SCHEDULED',
      notes: a.reason || a.cancellationReason || a.notes || '',
    });
  });

  // 3. Worksheet: Appointment Status
  const wsStatus = workbook.addWorksheet('Appointment Status');
  wsStatus.columns = [
    { header: 'Status Category', key: 'status', width: 25 },
    { header: 'Appointment Count', key: 'count', width: 20 },
    { header: 'Share Percentage', key: 'percentage', width: 20 },
  ];
  wsStatus.getRow(1).font = headerFont;
  wsStatus.getRow(1).fill = tealFill;

  (reportData.statusDistribution || []).forEach((s) => {
    wsStatus.addRow({
      status: s.label,
      count: s.count,
      percentage: `${s.percentage}%`,
    });
  });

  // 4. Worksheet: Doctor Utilization
  const wsDoc = workbook.addWorksheet('Doctor Utilization');
  wsDoc.columns = [
    { header: 'Doctor ID', key: 'id', width: 14 },
    { header: 'Physician Name', key: 'doctor', width: 28 },
    { header: 'Department', key: 'department', width: 24 },
    { header: 'Daily Limit', key: 'capacity', width: 16 },
    { header: 'Booked Slots', key: 'booked', width: 16 },
    { header: 'Utilization Rate', key: 'utilizationRate', width: 18 },
    { header: 'Capacity Status', key: 'status', width: 18 },
  ];
  wsDoc.getRow(1).font = headerFont;
  wsDoc.getRow(1).fill = darkFill;

  (reportData.doctorUtilization || []).forEach((d) => {
    wsDoc.addRow({
      id: d.id,
      doctor: d.doctor,
      department: d.department,
      capacity: `${d.capacity} slots`,
      booked: `${d.booked} slots`,
      utilizationRate: `${d.utilizationRate}%`,
      status: d.utilizationRate >= 90 ? 'Near Peak' : 'Optimal',
    });
  });

  // 5. Worksheet: Department Load
  const wsDept = workbook.addWorksheet('Department Load');
  wsDept.columns = [
    { header: 'Department ID', key: 'id', width: 16 },
    { header: 'Department Name', key: 'department', width: 28 },
    { header: 'Active Appointments', key: 'activePatients', width: 22 },
    { header: 'Capacity Ceiling', key: 'maxCapacity', width: 20 },
    { header: 'Workload Rate', key: 'percentage', width: 18 },
  ];
  wsDept.getRow(1).font = headerFont;
  wsDept.getRow(1).fill = tealFill;

  (reportData.departmentLoad || []).forEach((d) => {
    wsDept.addRow({
      id: d.id,
      department: d.department,
      activePatients: d.activePatients,
      maxCapacity: d.maxCapacity,
      percentage: `${d.percentage}%`,
    });
  });

  // 6. Worksheet: Queue Summary
  const wsQueue = workbook.addWorksheet('Queue Summary');
  wsQueue.columns = [
    { header: 'Queue Metric', key: 'metric', width: 35 },
    { header: 'Value', key: 'value', width: 20 },
    { header: 'Description', key: 'description', width: 35 },
  ];
  wsQueue.getRow(1).font = headerFont;
  wsQueue.getRow(1).fill = darkFill;

  const q = reportData.queueStats;
  wsQueue.addRows([
    { metric: 'Total Waiting Patients', value: q.totalWaiting, description: 'Patients in waiting hall' },
    { metric: 'In Consultation', value: q.totalInConsultation, description: 'Active clinical consultations' },
    { metric: 'Completed Consultations', value: q.totalCompleted, description: 'Finished appointments today' },
    { metric: 'Skipped Patients', value: q.totalSkipped, description: 'Called but unavailable' },
    { metric: 'Average Wait Time', value: `${q.avgWaitMinutes} mins`, description: 'Estimated wait time' },
  ]);

  // Write to buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `healthcare-capacity-report-${todayStr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
