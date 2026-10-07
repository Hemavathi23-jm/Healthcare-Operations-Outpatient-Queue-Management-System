import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Activity,
  BarChart2,
  PieChart as PieIcon,
  Filter,
  ShieldAlert,
  Building,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import reportsService from '../services/reportsService';
import { exportReportToPdf, exportReportToExcel } from '../utils/reportExportUtils';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  // Filter States
  const [filterType, setFilterType] = useState('CURRENT_MONTH');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Action / Export States
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [exportNotice, setExportNotice] = useState({ type: '', message: '' });

  const loadReport = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await reportsService.getReportData(filterType, customStartDate, customEndDate);
      setReportData(data);
    } catch (err) {
      setError(err.message || 'Unable to load hospital capacity reports from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [filterType]);

  const handleApplyCustomFilter = (e) => {
    e.preventDefault();
    if (customStartDate && customEndDate) {
      loadReport();
    }
  };

  // Real Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Real PDF Export Handler
  const handleExportPdf = async () => {
    if (!reportData) return;
    try {
      setIsExportingPdf(true);
      setExportNotice({ type: '', message: '' });
      await exportReportToPdf(reportData);
      setExportNotice({ type: 'success', message: 'PDF report generated and downloaded successfully.' });
      setTimeout(() => setExportNotice({ type: '', message: '' }), 5000);
    } catch (err) {
      setExportNotice({ type: 'error', message: 'Unable to generate PDF. Please try again.' });
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Real Excel Export Handler
  const handleExportExcel = async () => {
    if (!reportData) return;
    try {
      setIsExportingExcel(true);
      setExportNotice({ type: '', message: '' });
      await exportReportToExcel(reportData);
      setExportNotice({ type: 'success', message: 'Excel workbook generated and downloaded successfully.' });
      setTimeout(() => setExportNotice({ type: '', message: '' }), 5000);
    } catch (err) {
      setExportNotice({ type: 'error', message: 'Unable to export Excel. Please try again.' });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const summary = reportData?.summary || {
    totalAppointments: 0,
    completed: 0,
    cancelled: 0,
    waiting: 0,
    overallUtilization: 0,
  };

  const statusDistribution = reportData?.statusDistribution || [];
  const doctorUtilization = reportData?.doctorUtilization || [];
  const departmentLoad = reportData?.departmentLoad || [];
  const queueStats = reportData?.queueStats || {
    totalWaiting: 0,
    totalInConsultation: 0,
    totalCompleted: 0,
    totalSkipped: 0,
    avgWaitMinutes: 0,
  };
  const cancellationsList = reportData?.cancellationsList || [];

  return (
    <div className="space-y-6">
      {/* Print-specific CSS */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #0f172a !important;
            font-size: 11pt !important;
          }
          aside, header, nav, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          #report-print-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-header {
            display: block !important;
            margin-bottom: 20px !important;
            border-bottom: 2px solid #0d9488 !important;
            padding-bottom: 10px !important;
          }
          .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl {
            box-shadow: none !important;
          }
          .border {
            border: 1px solid #cbd5e1 !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #e2e8f0 !important;
            padding: 6px 8px !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
        }
        .print-header {
          display: none;
        }
      `}</style>

      {/* Header & Controls (Hidden in Print) */}
      <div className="no-print bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
              <FileText className="w-3.5 h-3.5" />
              Executive Analytics &amp; Operations
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Hospital Capacity Reports</h1>
            <p className="text-sm text-slate-500">
              Comprehensive analytics on patient throughput, cancellation root causes, and resource allocation
            </p>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Print Button */}
            <button
              onClick={handlePrint}
              disabled={loading || !reportData}
              title="Open browser print dialog"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / PDF</span>
            </button>

            {/* Real PDF Export */}
            <button
              onClick={handleExportPdf}
              disabled={loading || isExportingPdf || !reportData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 shadow-sm shadow-teal-600/25 transition-all disabled:opacity-50"
            >
              {isExportingPdf ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </>
              )}
            </button>

            {/* Real Excel Export */}
            <button
              onClick={handleExportExcel}
              disabled={loading || isExportingExcel || !reportData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all shadow-sm disabled:opacity-50"
            >
              {isExportingExcel ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-800 border-t-transparent animate-spin"></span>
                  <span>Exporting Excel...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Export Excel</span>
                </>
              )}
            </button>

            {/* Refresh */}
            <button
              onClick={loadReport}
              disabled={loading}
              title="Refresh database report"
              className="p-2 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-700 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Filter className="w-3 h-3 text-teal-600" />
              Filter Period:
            </span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setFilterType('CURRENT_MONTH')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterType === 'CURRENT_MONTH'
                    ? 'bg-white text-teal-800 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Current Month
              </button>
              <button
                type="button"
                onClick={() => setFilterType('PREVIOUS_MONTH')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterType === 'PREVIOUS_MONTH'
                    ? 'bg-white text-teal-800 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Previous Month
              </button>
              <button
                type="button"
                onClick={() => setFilterType('TODAY')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterType === 'TODAY'
                    ? 'bg-white text-teal-800 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setFilterType('CUSTOM')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterType === 'CUSTOM'
                    ? 'bg-white text-teal-800 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>

          {filterType === 'CUSTOM' && (
            <form onSubmit={handleApplyCustomFilter} className="flex items-center gap-2">
              <input
                type="date"
                required
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                required
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
              >
                Apply
              </button>
            </form>
          )}

          <div className="text-slate-500 text-[11px] font-medium">
            Active Dataset: <span className="font-semibold text-slate-800">{reportData?.periodLabel || 'Loading...'}</span>
          </div>
        </div>

        {/* Export Status Notification */}
        {exportNotice.message && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 transition-all ${
              exportNotice.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            {exportNotice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            )}
            <span>{exportNotice.message}</span>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && <ErrorMessage message={error} onRetry={loadReport} />}

      {/* Loading state */}
      {loading ? (
        <div className="py-16">
          <Loading message="Aggregating clinical operations &amp; capacity metrics from MySQL..." />
        </div>
      ) : (
        <div id="report-print-container" className="space-y-6">
          {/* Header visible only during Browser Print */}
          <div className="print-header">
            <h1 className="text-2xl font-bold text-slate-900">MedQueue Healthcare Operations</h1>
            <p className="text-xs text-slate-600">Hospital Capacity, Resource Allocation &amp; Clinical Throughput Report</p>
            <div className="text-xs text-slate-500 mt-2 flex justify-between">
              <span>Reporting Period: {reportData?.periodLabel}</span>
              <span>Generated: {new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* 5 KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Appointments</span>
                <Calendar className="w-4 h-4 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{summary.totalAppointments}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Booked in period</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-600 mt-2">{summary.completed}</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {summary.totalAppointments > 0
                  ? `${Math.round((summary.completed / summary.totalAppointments) * 100)}% completion rate`
                  : '0% rate'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cancelled</span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <h3 className="text-2xl font-bold text-rose-600 mt-2">{summary.cancelled}</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {summary.totalAppointments > 0
                  ? `${Math.round((summary.cancelled / summary.totalAppointments) * 100)}% cancellation rate`
                  : '0% rate'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Waiting in Queue</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-amber-600 mt-2">{queueStats.totalWaiting}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Avg wait: {queueStats.avgWaitMinutes} mins</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Capacity Utilization</span>
                <Activity className="w-4 h-4 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-teal-700 mt-2">{summary.overallUtilization}%</h3>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div
                  className="bg-teal-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, summary.overallUtilization)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Section 1 & 2: Status Distribution & Department Workload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Appointment Status Distribution</h2>
                  <p className="text-xs text-slate-500">Clinical appointment breakdown by current lifecycle status</p>
                </div>
                <PieIcon className="w-4 h-4 text-slate-400" />
              </div>

              {statusDistribution.length > 0 ? (
                <>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="count"
                          nameKey="label"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '0.5rem',
                            border: 'none',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                    {statusDistribution.map((item) => (
                      <div key={item.status} className="flex justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.label}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-56 flex flex-col items-center justify-center text-center p-4 text-slate-400">
                  <Calendar className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-medium text-slate-600">No appointments recorded for this period</p>
                  <p className="text-[11px] text-slate-400 mt-1">Book an appointment from Appointments page to view live analytics</p>
                </div>
              )}
            </div>

            {/* Department Workload vs Capacity */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Department Workload vs Limit</h2>
                  <p className="text-xs text-slate-500">Active consultations compared to clinical capacity ceiling</p>
                </div>
                <BarChart2 className="w-4 h-4 text-slate-400" />
              </div>

              {departmentLoad.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentLoad} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis
                        dataKey="department"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: 'none',
                          borderRadius: '0.5rem',
                          color: '#fff',
                          fontSize: '11px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="maxCapacity" name="Capacity Ceiling" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="activePatients" name="Active Appointments" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-4 text-slate-400">
                  <Building className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-medium text-slate-600">No department load data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Doctor Utilization Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Physician Utilization &amp; Capacity Ledger</h3>
                <p className="text-xs text-slate-500">Verified doctor roster capacity and scheduled consultation hours</p>
              </div>
              <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                Live MySQL Data
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Physician Name</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Daily Patient Limit</th>
                    <th className="py-3 px-4">Booked Patients</th>
                    <th className="py-3 px-4">Utilization %</th>
                    <th className="py-3 px-4">Capacity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctorUtilization.length > 0 ? (
                    doctorUtilization.map((doc) => (
                      <tr key={doc.id || doc.doctor} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-900">{doc.doctor}</td>
                        <td className="py-3 px-4 text-teal-700 font-medium">{doc.department}</td>
                        <td className="py-3 px-4">{doc.capacity} slots</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{doc.booked} slots</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{doc.utilizationRate}%</span>
                            <div className="w-16 bg-slate-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  doc.utilizationRate >= 90
                                    ? 'bg-amber-500'
                                    : doc.utilizationRate > 0
                                    ? 'bg-teal-600'
                                    : 'bg-slate-300'
                                }`}
                                style={{ width: `${Math.max(5, doc.utilizationRate)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {doc.utilizationRate >= 90 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Near Peak Capacity
                            </span>
                          ) : doc.utilizationRate > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Optimal Capacity
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              Available / Open
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No physician capacity records available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Live Queue Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Queue &amp; Patient Waiting Analysis</h3>
                <p className="text-xs text-slate-500">Real-time outpatient queue metrics from active clinic tokens</p>
              </div>
              <Users className="w-4 h-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold uppercase text-slate-500">Waiting in Hall</span>
                <p className="text-xl font-bold text-amber-600 mt-1">{queueStats.totalWaiting}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold uppercase text-slate-500">In Consultation</span>
                <p className="text-xl font-bold text-teal-600 mt-1">{queueStats.totalInConsultation}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold uppercase text-slate-500">Completed Today</span>
                <p className="text-xl font-bold text-emerald-600 mt-1">{queueStats.totalCompleted}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold uppercase text-slate-500">Skipped Patients</span>
                <p className="text-xl font-bold text-rose-600 mt-1">{queueStats.totalSkipped}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold uppercase text-slate-500">Avg Wait Time</span>
                <p className="text-xl font-bold text-slate-800 mt-1">{queueStats.avgWaitMinutes} mins</p>
              </div>
            </div>
          </div>

          {/* Section 5: Cancellation Root Cause Log */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cancellation Root Cause Log</h3>
                <p className="text-xs text-slate-500">Documented justifications for unfulfilled appointment slots</p>
              </div>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>

            {cancellationsList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Patient Name</th>
                      <th className="py-2.5 px-4">Physician</th>
                      <th className="py-2.5 px-4">Department</th>
                      <th className="py-2.5 px-4">Scheduled Slot</th>
                      <th className="py-2.5 px-4">Documented Cancellation Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cancellationsList.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{c.patientName}</td>
                        <td className="py-2.5 px-4">{c.doctorName}</td>
                        <td className="py-2.5 px-4 text-teal-700">{c.departmentName}</td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {c.appointmentDate} {c.appointmentTime}
                        </td>
                        <td className="py-2.5 px-4 text-rose-700 font-medium">{c.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400">
                <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No Cancellations Recorded</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  All scheduled appointment slots for this period were fulfilled or remain active.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
