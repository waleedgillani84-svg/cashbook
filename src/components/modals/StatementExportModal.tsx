import React from 'react';
import { Entry, Account } from '../../types';
import { X, Printer, Image, FileCode, Check } from 'lucide-react';
import { formatCurrency } from '../BalanceSummary';

interface StatementExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: Entry[];
  activeAccount?: Account;
  userName?: string;
}

export const StatementExportModal: React.FC<StatementExportModalProps> = ({
  isOpen,
  onClose,
  entries,
  activeAccount,
  userName,
}) => {
  const [downloadSuccess, setDownloadSuccess] = React.useState<string | null>(null);

  if (!isOpen) return null;

  let totalIn = 0;
  let totalOut = 0;
  for (const e of entries) {
    if (e.type === 'in') totalIn += e.amount;
    else totalOut += e.amount;
  }
  const net = totalIn - totalOut;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    try {
      const width = 650;
      const rowHeight = 32;
      const headerHeight = 220;
      const footerHeight = 40;
      const totalHeight = headerHeight + entries.length * rowHeight + footerHeight;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = Math.max(totalHeight, 350);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Title & Subtitle
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px sans-serif';
      const title = `${activeAccount ? activeAccount.icon + ' ' + activeAccount.name : 'Cash Book'} - Statement`;
      ctx.fillText(title, 24, 45);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Generated: ${new Date().toLocaleString('en-PK')} • Total Entries: ${entries.length}`, 24, 70);
      if (userName) {
        ctx.fillText(`Account Owner: ${userName}`, 24, 88);
      }

      // Summary boxes
      // Cash In box
      ctx.fillStyle = '#dcfce7';
      ctx.fillRect(24, 105, 185, 52);
      ctx.fillStyle = '#166534';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Cash In (+)', 36, 126);
      ctx.fillText(`+ ${formatCurrency(totalIn)}`, 36, 146);

      // Cash Out box
      ctx.fillStyle = '#fee2e2';
      ctx.fillRect(225, 105, 185, 52);
      ctx.fillStyle = '#991b1b';
      ctx.fillText('Cash Out (-)', 237, 126);
      ctx.fillText(`- ${formatCurrency(totalOut)}`, 237, 146);

      // Net Balance box
      ctx.fillStyle = '#dbeafe';
      ctx.fillRect(426, 105, 195, 52);
      ctx.fillStyle = '#1e40af';
      ctx.fillText('Net Balance', 438, 126);
      ctx.fillText(`${net >= 0 ? '+' : '-'} ${formatCurrency(net)}`, 438, 146);

      // Table Header
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(24, 175, 602, 28);
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('DATE & TIME', 34, 193);
      ctx.fillText('DESCRIPTION', 200, 193);
      ctx.textAlign = 'right';
      ctx.fillText('AMOUNT (PKR)', 610, 193);

      // Rows
      let y = 224;
      entries.forEach((e, idx) => {
        if (idx % 2 === 1) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(24, y - 18, 602, rowHeight);
        }
        const d = new Date(e.date);
        ctx.fillStyle = '#1e293b';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(
          `${d.toLocaleDateString('en-PK')} ${d.toLocaleTimeString('en-PK', {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
          34,
          y
        );

        ctx.fillText((e.details || '--').substring(0, 35), 200, y);

        ctx.textAlign = 'right';
        ctx.fillStyle = e.type === 'in' ? '#16a34a' : '#dc2626';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`${e.type === 'in' ? '+' : '-'} ${formatCurrency(e.amount)}`, 610, y);

        y += rowHeight;
      });

      // Footer
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText('Cash Book Pro • Cloud Synced Ledger • Powered by Firebase', width / 2, y + 20);

      const link = document.createElement('a');
      link.download = `statement_${activeAccount?.name || 'cashbook'}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloadSuccess('Picture downloaded!');
      setTimeout(() => setDownloadSuccess(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadHTML = () => {
    let rowsHtml = entries
      .map((e) => {
        const d = new Date(e.date);
        const isIn = e.type === 'in';
        return `<tr>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:12px;">${d.toLocaleDateString('en-PK')} ${d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</td>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:12px;">${e.details || '--'}</td>
          <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;color:${isIn ? '#16a34a' : '#dc2626'};">${isIn ? '+' : '-'} ${formatCurrency(e.amount)}</td>
        </tr>`;
      })
      .join('');

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${activeAccount?.name || 'Cash Book'} - Statement</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; max-width: 700px; margin: 0 auto; color: #0f172a; }
    h1 { margin-bottom: 4px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; font-size: 20px; }
    .meta { font-size: 11px; color: #64748b; margin-bottom: 16px; }
    .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 20px; }
    .box { padding: 12px; border-radius: 8px; text-align: center; }
    .box-in { background: #dcfce7; color: #166534; }
    .box-out { background: #fee2e2; color: #991b1b; }
    .box-net { background: #dbeafe; color: #1e40af; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #f1f5f9; padding: 8px; font-size: 11px; text-align: left; text-transform: uppercase; color: #475569; }
    .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>${activeAccount ? activeAccount.icon + ' ' + activeAccount.name : 'Cash Book'} - Statement</h1>
  <div class="meta">Generated: ${new Date().toLocaleString('en-PK')} • Total Entries: ${entries.length} ${userName ? '• Owner: ' + userName : ''}</div>
  <div class="summary">
    <div class="box box-in"><strong>Cash In</strong><br>+ ${formatCurrency(totalIn)}</div>
    <div class="box box-out"><strong>Cash Out</strong><br>- ${formatCurrency(totalOut)}</div>
    <div class="box box-net"><strong>Net Balance</strong><br>${net >= 0 ? '+' : '-'} ${formatCurrency(net)}</div>
  </div>
  <table>
    <thead>
      <tr><th>Date & Time</th><th>Description</th><th style="text-align:right">Amount</th></tr>
    </thead>
    <tbody>${rowsHtml || '<tr><td colspan="3" style="text-align:center;padding:12px;color:#94a3b8;">No entries found</td></tr>'}</tbody>
  </table>
  <div class="footer">Cash Book Pro • Cloud Synced Ledger • Powered by Firebase</div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statement_${activeAccount?.name || 'cashbook'}_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess('HTML File exported!');
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="text-base">📄</span>
            <h3 className="font-bold text-sm text-slate-100">Export Statement</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {downloadSuccess && (
          <div className="mx-4 mt-3 p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Printable Statement View Container */}
          <div
            id="printableStatementArea"
            className="bg-white text-slate-900 p-4 rounded-xl border border-slate-200 max-h-60 overflow-y-auto text-xs shadow-inner"
          >
            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2 mb-3">
              <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <span>{activeAccount?.icon || '💳'}</span>
                <span>{activeAccount?.name || 'Cash Book'}</span>
              </div>
              <div className="text-[10px] text-slate-500">{new Date().toLocaleDateString('en-PK')}</div>
            </div>

            {/* Summary Mini Grid */}
            <div className="grid grid-cols-3 gap-1.5 mb-3 text-center text-[10px]">
              <div className="bg-emerald-50 text-emerald-800 p-1.5 rounded font-semibold border border-emerald-200">
                In: +{formatCurrency(totalIn)}
              </div>
              <div className="bg-rose-50 text-rose-800 p-1.5 rounded font-semibold border border-rose-200">
                Out: -{formatCurrency(totalOut)}
              </div>
              <div className="bg-blue-50 text-blue-800 p-1.5 rounded font-bold border border-blue-200">
                Net: {net >= 0 ? '+' : '-'} {formatCurrency(net)}
              </div>
            </div>

            {/* Table */}
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <th className="py-1 px-1 text-left">Date</th>
                  <th className="py-1 px-1 text-left">Details</th>
                  <th className="py-1 px-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 50).map((e) => {
                  const d = new Date(e.date);
                  const isIn = e.type === 'in';
                  return (
                    <tr key={e.id} className="border-b border-slate-100">
                      <td className="py-1 px-1 text-slate-500 whitespace-nowrap">
                        {d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-1 px-1 text-slate-800 truncate max-w-[120px]">
                        {e.details || '--'}
                      </td>
                      <td
                        className={`py-1 px-1 text-right font-bold whitespace-nowrap ${
                          isIn ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIn ? '+' : '-'} {formatCurrency(e.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {entries.length > 50 && (
              <div className="text-center text-[9px] text-slate-400 py-1">
                + {entries.length - 50} more transactions included in full export
              </div>
            )}
          </div>

          {/* Export Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handlePrint}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-950/40 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadImage}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Image className="w-4 h-4" />
              <span>Download as Picture (PNG)</span>
            </button>

            <button
              onClick={handleDownloadHTML}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <FileCode className="w-4 h-4" />
              <span>Export HTML File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
