import React, { useState } from 'react';
import { PauseCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import { usePlanner } from '../../context/PlannerContext';

const PAUSE_REASONS = [
  'Personal commitments',
  'Health & recovery',
  'Work & job responsibilities',
  'Interviews & technical prep',
  'University / College exams',
  'Travel & vacation',
  'Need a brief breather'
];

export default function PauseModal({ isOpen, onClose }) {
  const { pauseJourney } = usePlanner();
  const [selectedReason, setSelectedReason] = useState(PAUSE_REASONS[0]);

  const handleConfirmPause = () => {
    pauseJourney(selectedReason);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pause your Winter Arc Journey?"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 block mb-1">Your progress is 100% safe & frozen.</strong>
            All completed videos, daily quizzes, coding exercises, study notes, logged hours, achievements, and active streaks will be preserved without penalty while you take a break.
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono uppercase">
            Select Pause Reason (Optional):
          </label>
          <div className="space-y-1.5">
            {PAUSE_REASONS.map((reason) => (
              <label
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                  selectedReason === reason
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="pauseReason"
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="accent-indigo-500"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmPause}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-colors"
          >
            <PauseCircle className="w-4 h-4" />
            <span>Confirm & Pause Journey</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

