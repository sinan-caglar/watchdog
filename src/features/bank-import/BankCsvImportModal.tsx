import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, Repeat, Sparkles } from 'lucide-react';
import type { Subscription } from '../../types';
import { KNOWN_SERVICES } from '../../lib/knownServicesData';
import { parseBankCsv, formatCurrency, type ParsedBankItem } from '../../lib/utils';

interface BankCsvImportModalProps {
  currency: string;
  onClose: () => void;
  onConfirmMatches: (matches: Partial<Subscription>[]) => void;
}

export const BankCsvImportModal: React.FC<BankCsvImportModalProps> = ({
  currency,
  onClose,
  onConfirmMatches
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [transactions, setTransactions] = useState<ParsedBankItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      alert('Please upload a valid CSV bank statement file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseBankCsv(content, KNOWN_SERVICES);
      setTransactions(parsed);
      setSelectedIndices(parsed.map((_, idx) => idx)); // Select all by default
    };
    reader.readAsText(file);
  };

  const toggleSelect = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter(i => i !== idx));
    } else {
      setSelectedIndices([...selectedIndices, idx]);
    }
  };

  const handleConfirmSelected = () => {
    const toAdd: Partial<Subscription>[] = selectedIndices.map(idx => {
      const tx = transactions[idx];
      const matchedSrv = KNOWN_SERVICES.find(s => s.slug === tx.suggested_service_slug);

      return {
        name: matchedSrv ? matchedSrv.name : tx.merchant_name || 'Imported Subscription',
        cost: tx.amount || 9.99,
        currency: tx.currency || currency,
        billing_cycle: 'monthly',
        type: 'paid',
        status: 'active',
        start_date: tx.transaction_date || new Date().toISOString().split('T')[0],
        next_charge_date: tx.transaction_date || new Date().toISOString().split('T')[0],
        payment_method_label: 'Bank Statement Import',
        category: matchedSrv ? matchedSrv.category : 'other',
        cancellation_url: matchedSrv?.cancellation_url,
        cancellation_steps: matchedSrv?.cancellation_steps,
        cancellation_difficulty: matchedSrv?.cancellation_difficulty
      };
    });

    onConfirmMatches(toAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] uppercase">
              Smart Pattern Analysis
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Detected Subscriptions & Recurring Charges
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close bank CSV import modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {transactions.length === 0 ? (
            /* Upload Zone */
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`p-8 border-2 border-dashed rounded-3xl text-center space-y-3 transition-colors ${
                dragActive ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Drag & Drop Bank CSV Statement
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Upload your bank CSV. Our smart algorithm matches known subscription services and identifies true 2+ recurring interval charges while filtering out one-off purchases (like Starbucks or single retail store items).
                </p>
              </div>

              <div>
                <label className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md cursor-pointer transition-colors">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Select CSV File</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          ) : (
            /* Parsed Transactions List */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Detected Subscriptions & Recurring Charges ({transactions.length})
                </h4>
                <button
                  onClick={() => setTransactions([])}
                  aria-label="Upload a different bank statement CSV file"
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Upload Different File
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {transactions.map((tx, idx) => {
                  const isSelected = selectedIndices.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelect(idx)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center text-white ${
                          isSelected ? 'bg-emerald-500 border-emerald-600' : 'border-slate-400'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{tx.merchant_name}</span>
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {tx.transaction_date}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {formatCurrency(tx.amount || 0, tx.currency || currency)}
                        </p>
                        <div className="flex items-center gap-1">
                          {tx.is_known_service && (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Known Service
                            </span>
                          )}
                          {tx.occurrence_count >= 2 && (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center gap-0.5">
                              <Repeat className="w-2.5 h-2.5" /> Recurring ({tx.occurrence_count}x)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        {transactions.length > 0 && (
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {selectedIndices.length} items selected
            </span>
            <button
              onClick={handleConfirmSelected}
              disabled={selectedIndices.length === 0}
              aria-label="Confirm adding selected subscriptions to Watchdog"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg transition-all"
            >
              Add Selected Subscriptions ({selectedIndices.length})
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
