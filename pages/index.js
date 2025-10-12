import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const DE_STEPS = [
  { id: 1, description: 'Open feeder breaker Q11-1 at HVDB0027 to remove supply to CSS092', requiresLock: true },
  { id: 2, description: 'Open incomer Q11-1 at CSS092 RMU; verify VPIS dark', requiresLock: true },
  { id: 3, description: 'Close earth switch Q11-1E to ground incoming cable and lock/tag', requiresLock: false },
  { id: 4, description: 'Open transformer feeder Q11-2 to de-energize transformer; verify VPIS dark', requiresLock: true },
  { id: 5, description: 'Close earth switch Q11-2E to ground transformer primary and lock/tag', requiresLock: false },
  { id: 6, description: 'Open LV main circuit breaker to isolate secondary side', requiresLock: true },
  { id: 7, description: 'Prove dead on all ways using approved detector', requiresLock: false },
  { id: 8, description: 'Fit danger signs and confirm equipment earthed', requiresLock: false },
  { id: 9, description: 'Issue Permit to Work; transfer PinC key to competent person', requiresLock: false },
];

const EN_STEPS = [
  { id: 1, description: 'Cancel permit and remove tools; retrieve keys', requiresLock: false },
  { id: 2, description: 'Remove earths in reverse order: Q11-2E → Q11-1E', requiresLock: false },
  { id: 3, description: 'Close incomer Q11-1 to energize bus; confirm VPIS lit', requiresLock: true },
  { id: 4, description: 'Close transformer feeder Q11-2 to energize transformer', requiresLock: true },
  { id: 5, description: 'Close LV main circuit breaker to energize secondary side', requiresLock: true },
  { id: 6, description: 'Close upstream breaker at HVDB0027 to restore supply', requiresLock: true },
  { id: 7, description: 'Remove danger signs and confirm normal operation', requiresLock: false },
];

function initializeSteps(steps) {
  return steps.map(step => ({
    ...step,
    techAName: '',
    techBName: '',
    checkedA: false,
    checkedB: false,
    lockA: false,
    lockB: false,
    timeA: '',
    timeB: '',
  }));
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('DE');
  const [deSteps, setDeSteps] = useState(initializeSteps(DE_STEPS));
  const [enSteps, setEnSteps] = useState(initializeSteps(EN_STEPS));
  const [finalAName, setFinalAName] = useState('');
  const [finalBName, setFinalBName] = useState('');
  const [finalAConfirm, setFinalAConfirm] = useState(false);
  const [finalBConfirm, setFinalBConfirm] = useState(false);

  const updateStep = (tab, index, updates) => {
    if (tab === 'DE') {
      const newSteps = [...deSteps];
      newSteps[index] = { ...newSteps[index], ...updates };
      setDeSteps(newSteps);
    } else {
      const newSteps = [...enSteps];
      newSteps[index] = { ...newSteps[index], ...updates };
      setEnSteps(newSteps);
    }
  };

  const handleCheck = (tab, index, tech) => {
    if (tab === 'DE') {
      const step = deSteps[index];
      if (tech === 'A' && !step.checkedA) {
        updateStep(tab, index, { checkedA: true, timeA: new Date().toLocaleString() });
      }
      if (tech === 'B' && !step.checkedB) {
        updateStep(tab, index, { checkedB: true, timeB: new Date().toLocaleString() });
      }
    } else {
      const step = enSteps[index];
      if (tech === 'A' && !step.checkedA) {
        updateStep(tab, index, { checkedA: true, timeA: new Date().toLocaleString() });
      }
      if (tech === 'B' && !step.checkedB) {
        updateStep(tab, index, { checkedB: true, timeB: new Date().toLocaleString() });
      }
    }
  };

  const handleLock = (tab, index, tech) => {
    if (tab === 'DE') {
      const step = deSteps[index];
      if (tech === 'A' && !step.lockA) {
        updateStep(tab, index, { lockA: true });
      }
      if (tech === 'B' && !step.lockB) {
        updateStep(tab, index, { lockB: true });
      }
    } else {
      const step = enSteps[index];
      if (tech === 'A' && !step.lockA) {
        updateStep(tab, index, { lockA: true });
      }
      if (tech === 'B' && !step.lockB) {
        updateStep(tab, index, { lockB: true });
      }
    }
  };

  const allDeComplete = deSteps.every(s => s.checkedA && s.checkedB && (!s.requiresLock || (s.lockA && s.lockB)));
  const allEnComplete = enSteps.every(s => s.checkedA && s.checkedB && (!s.requiresLock || (s.lockA && s.lockB)));
  const canExport = allDeComplete && allEnComplete && finalAConfirm && finalBConfirm;

  const exportPdf = async () => {
    if (typeof window === 'undefined') return;
    const { default: html2pdf } = await import('html2pdf.js');
    const element = document.getElementById('export-content');
    html2pdf().from(element).save('HV_Switching_Plan_CSS092.pdf');
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen p-4">
      <header className="flex items-center justify-between border-b pb-4 mb-4">
        <div className="flex items-center gap-4">
          <img src="/pbe-logo.png" alt="PBE Logo" className="h-12" />
          <h1 className="text-2xl font-bold">HV Switching Plan – CSS092</h1>
        </div>
      </header>
      <div className="flex gap-4 border-b mb-4">
        <button
          onClick={() => setActiveTab('DE')}
          className={`px-4 py-2 border-b-2 ${activeTab === 'DE' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-600'}`}
        >
          De-Energise
        </button>
        <button
          onClick={() => setActiveTab('EN')}
          className={`px-4 py-2 border-b-2 ${activeTab === 'EN' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-600'}`}
        >
          Energise
        </button>
      </div>
      <div id="export-content">
        {activeTab === 'DE' && (
          <div>
            {deSteps.map((step, idx) => (
              <div key={step.id} className="bg-white p-4 rounded-md shadow mb-4">
                <div className="font-semibold mb-2">
                  Step {step.id}: {step.description}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm">Tech A Name</label>
                    <input
                      value={step.techAName}
                      onChange={e => updateStep('DE', idx, { techAName: e.target.value })}
                      className="border rounded-md w-full p-2 mt-1 mb-2"
                    />
                    <button
                      disabled={!step.techAName || step.checkedA}
                      onClick={() => handleCheck('DE', idx, 'A')}
                      className={`w-full py-1 rounded-md mb-2 ${step.checkedA ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                    >
                      {step.checkedA ? `Open (Checked) ${step.timeA}` : 'Closed (Check)'}
                    </button>
                    {step.requiresLock && step.checkedA && (
                      <button
                        disabled={step.lockA}
                        onClick={() => handleLock('DE', idx, 'A')}
                        className={`w-full py-1 rounded-md ${step.lockA ? 'bg-blue-600 text-white' : 'bg-gray-500 text-white'}`}
                      >
                        {step.lockA ? 'Locks On' : 'Confirm Locks On'}
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm">Tech B Name</label>
                    <input
                      value={step.techBName}
                      onChange={e => updateStep('DE', idx, { techBName: e.target.value })}
                      className="border rounded-md w-full p-2 mt-1 mb-2"
                    />
                    <button
                      disabled={!step.techBName || step.checkedB}
                      onClick={() => handleCheck('DE', idx, 'B')}
                      className={`w-full py-1 rounded-md mb-2 ${step.checkedB ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                    >
                      {step.checkedB ? `Open (Checked) ${step.timeB}` : 'Closed (Check)'}
                    </button>
                    {step.requiresLock && step.checkedB && (
                      <button
                        disabled={step.lockB}
                        onClick={() => handleLock('DE', idx, 'B')}
                        className={`w-full py-1 rounded-md ${step.lockB ? 'bg-blue-600 text-white' : 'bg-gray-500 text-white'}`}
                      >
                        {step.lockB ? 'Locks On' : 'Confirm Locks On'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'EN' && (
          <div>
            {enSteps.map((step, idx) => (
              <div key={step.id} className="bg-white p-4 rounded-md shadow mb-4">
                <div className="font-semibold mb-2">
                  Step {step.id}: {step.description}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm">Tech A Name</label>
                    <input
                      value={step.techAName}
                      onChange={e => updateStep('EN', idx, { techAName: e.target.value })}
                      className="border rounded-md w-full p-2 mt-1 mb-2"
                    />
                    <button
                      disabled={!step.techAName || step.checkedA}
                      onClick={() => handleCheck('EN', idx, 'A')}
                      className={`w-full py-1 rounded-md mb-2 ${step.checkedA ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                    >
                      {step.checkedA ? `Open (Checked) ${step.timeA}` : 'Closed (Check)'}
                    </button>
                    {step.requiresLock && step.checkedA && (
                      <button
                        disabled={step.lockA}
                        onClick={() => handleLock('EN', idx, 'A')}
                        className={`w-full py-1 rounded-md ${step.lockA ? 'bg-blue-600 text-white' : 'bg-gray-500 text-white'}`}
                      >
                        {step.lockA ? 'Locks On' : 'Confirm Locks On'}
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm">Tech B Name</label>
                    <input
                      value={step.techBName}
                      onChange={e => updateStep('EN', idx, { techBName: e.target.value })}
                      className="border rounded-md w-full p-2 mt-1 mb-2"
                    />
                    <button
                      disabled={!step.techBName || step.checkedB}
                      onClick={() => handleCheck('EN', idx, 'B')}
                      className={`w-full py-1 rounded-md mb-2 ${step.checkedB ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                    >
                      {step.checkedB ? `Open (Checked) ${step.timeB}` : 'Closed (Check)'}
                    </button>
                    {step.requiresLock && step.checkedB && (
                      <button
                        disabled={step.lockB}
                        onClick={() => handleLock('EN', idx, 'B')}
                        className={`w-full py-1 rounded-md ${step.lockB ? 'bg-blue-600 text-white' : 'bg-gray-500 text-white'}`}
                      >
                        {step.lockB ? 'Locks On' : 'Confirm Locks On'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-white p-4 rounded-md shadow mb-8">
          <h2 className="font-semibold mb-4">Technician Final Sign-Off</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Technician A Name</label>
              <input
                value={finalAName}
                onChange={e => setFinalAName(e.target.value)}
                className="border rounded-md w-full p-2 mt-1 mb-2"
              />
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={finalAConfirm}
                  onChange={e => setFinalAConfirm(e.target.checked)}
                  className="mr-2"
                />
                I confirm all steps completed (Tech A)
              </label>
            </div>
            <div>
              <label className="block text-sm">Technician B Name</label>
              <input
                value={finalBName}
                onChange={e => setFinalBName(e.target.value)}
                className="border rounded-md w-full p-2 mt-1 mb-2"
              />
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={finalBConfirm}
                  onChange={e => setFinalBConfirm(e.target.checked)}
                  className="mr-2"
                />
                I confirm all steps completed (Tech B)
              </label>
            </div>
          </div>
          <button
            disabled={!canExport}
            onClick={exportPdf}
            className={`mt-4 px-4 py-2 rounded-md ${canExport ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}
          >
            Confirm & Export PDF
          </button>
          {!canExport && (
            <div className="flex items-center text-sm text-red-600 mt-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              Ensure all steps, locks and confirmations are complete before exporting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
