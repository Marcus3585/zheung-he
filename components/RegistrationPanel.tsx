import React, { useState } from 'react';
import { Users, Plus, Trash2, Anchor, AlertCircle } from 'lucide-react';
import { StudentProfile } from '../types';

interface RegistrationPanelProps {
  onComplete: (profiles: StudentProfile[]) => void;
}

// Moved outside to prevent re-creation on every render
const PaperCard = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-imperial-parchment border-2 border-imperial-ink/30 rounded-xl shadow-2xl relative overflow-hidden text-imperial-ink font-serif ${className}`}>
      <div className="absolute inset-0 bg-imperial-gold/5 pointer-events-none"></div>
      <div className="relative z-10">{children}</div>
  </div>
);

const RegistrationPanel: React.FC<RegistrationPanelProps> = ({ onComplete }) => {
  const [students, setStudents] = useState<StudentProfile[]>([
    { id: Date.now().toString(), className: '', classNumber: '', studentId: '', studentName: '' }
  ]);
  const [error, setError] = useState<string | null>(null);

  // Helper to generate class options
  const classOptions: string[] = [];
  const levels = ['1', '2', '3', '4', '5', '6'];
  const groups = ['W', 'Y', 'H', 'K'];
  levels.forEach(l => {
      groups.forEach(g => {
          classOptions.push(`${l}${g}`);
      });
  });

  const addStudent = () => {
    if (students.length >= 5) return;
    setStudents([...students, { 
      id: Date.now().toString() + Math.random(), 
      className: students.length > 0 ? students[0].className : '', // Copy previous class for convenience
      classNumber: '', 
      studentId: '', 
      studentName: '' 
    }]);
  };

  const removeStudent = (id: string) => {
    if (students.length <= 1) return;
    setStudents(students.filter(s => s.id !== id));
  };

  const updateStudent = (id: string, field: keyof StudentProfile, value: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, [field]: value } : s));
    setError(null);
  };

  const validateAndSubmit = () => {
    for (const s of students) {
      if (!s.className || !s.classNumber || !s.studentId) {
        setError("所有學生的班級、班號和學生編號均為必填項。");
        return;
      }
      if (!/^\d{5}$/.test(s.studentId)) {
        setError(`學生編號 ${s.studentId} 格式錯誤，必須為5位數字。`);
        return;
      }
    }
    onComplete(students);
  };

  return (
    <PaperCard className="max-w-4xl w-full p-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-imperial-red mb-2 drop-shadow-sm">船員名錄</h1>
        <p className="text-imperial-ink/70">請登記登艦人員信息 (1-5人)</p>
      </div>

      <div className="space-y-4 mb-8 max-h-[50vh] overflow-y-auto pr-2">
        {students.map((student, index) => (
          <div key={student.id} className="bg-white/50 p-4 rounded-lg border border-imperial-ink/10 flex flex-col md:flex-row gap-4 items-end md:items-center">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="bg-imperial-ocean text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                {index + 1}
              </span>
              <div className="md:hidden font-bold text-imperial-ink">船員 {index + 1}</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
              <div>
                <label className="block text-xs font-bold text-imperial-ink/60 mb-1">班級 *</label>
                <select 
                  className="w-full p-2 rounded border border-imperial-ink/20 bg-white"
                  value={student.className}
                  onChange={(e) => updateStudent(student.id, 'className', e.target.value)}
                >
                  <option value="">選擇</option>
                  {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-imperial-ink/60 mb-1">班號 *</label>
                <select 
                  className="w-full p-2 rounded border border-imperial-ink/20 bg-white"
                  value={student.classNumber}
                  onChange={(e) => updateStudent(student.id, 'classNumber', e.target.value)}
                >
                  <option value="">選擇</option>
                  {Array.from({length: 38}, (_, i) => i + 1).map(n => {
                    const val = n.toString().padStart(2, '0');
                    return <option key={val} value={val}>{val}</option>;
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-imperial-ink/60 mb-1">學號 (5位) *</label>
                <input 
                  type="text"
                  maxLength={5}
                  className="w-full p-2 rounded border border-imperial-ink/20 font-mono"
                  placeholder="12345"
                  value={student.studentId}
                  onChange={(e) => updateStudent(student.id, 'studentId', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-imperial-ink/60 mb-1">姓名</label>
                <input 
                  type="text"
                  className="w-full p-2 rounded border border-imperial-ink/20"
                  placeholder="選填"
                  value={student.studentName}
                  onChange={(e) => updateStudent(student.id, 'studentName', e.target.value)}
                />
              </div>
            </div>

            {students.length > 1 && (
              <button 
                onClick={() => removeStudent(student.id)}
                className="p-2 text-imperial-ink/40 hover:text-red-600 transition-colors"
                title="移除"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-3 rounded flex items-center gap-2 text-sm animate-pulse-fast">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-imperial-ink/10">
        <button 
          onClick={addStudent}
          disabled={students.length >= 5}
          className="flex items-center gap-2 text-imperial-ocean font-bold hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={20} /> 添加船員
        </button>

        <button 
          onClick={validateAndSubmit}
          className="bg-imperial-gold text-imperial-ink font-bold py-3 px-8 rounded-full hover:bg-yellow-500 shadow-xl border-2 border-imperial-parchment flex items-center gap-2 transition-transform hover:scale-105"
        >
          <Anchor size={20} /> 確認登艦
        </button>
      </div>
    </PaperCard>
  );
};

export default RegistrationPanel;