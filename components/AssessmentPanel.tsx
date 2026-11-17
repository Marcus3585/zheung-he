import React, { useState } from 'react';
import { Mic, MicOff, Send, CheckCircle2, Award, Loader2, Upload, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { gradeStudentReflection } from '../services/gemini';
import { AssessmentResult, StudentProfile } from '../types';

interface AssessmentPanelProps {
  onRestart: () => void;
  studentProfiles: StudentProfile[];
}

// Google Apps Script URL provided
const SCRIPT_URL = 'https://script.google.com/a/macros/wahyan.edu.hk/s/AKfycbwNuRES44a3iKx-_VFFbVih2qp2oo3U2k5ut2Inh8CGVWfPHzmyQep-BJmU7c5mWbcVBQ/exec';
const QUESTION_CODE = 'ZHENGHE_3D';

// Declare global for SpeechRecognition types since they might not be standard in all TS setups yet
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const PaperCard = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
    <div className={`bg-imperial-parchment border-2 border-imperial-ink/30 rounded-xl shadow-2xl relative overflow-hidden text-imperial-ink font-serif ${className}`}>
        <div className="absolute inset-0 bg-imperial-gold/5 pointer-events-none"></div>
        <div className="relative z-10">{children}</div>
    </div>
);

const AssessmentPanel: React.FC<AssessmentPanelProps> = ({ onRestart, studentProfiles }) => {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // 0: Q1, 1: Q2, 2: Loading, 3: Result
  const [summary, setSummary] = useState('');
  const [reflection, setReflection] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Local state to track upload progress for each student
  const [studentsStatus, setStudentsStatus] = useState<StudentProfile[]>(
    studentProfiles.map(s => ({ ...s, uploadStatus: 'idle' }))
  );

  const toggleListening = (setText: React.Dispatch<React.SetStateAction<string>>) => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("您的瀏覽器不支持語音輸入，請使用鍵盤輸入。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev + transcript);
    };

    recognition.start();
  };

  // Logic from the provided HTML file
  const generateSubmissionId = () => {
      return 'manual_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const submitViaIframe = (data: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.name = 'submitFrame_' + Date.now();
            document.body.appendChild(iframe);

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = SCRIPT_URL;
            form.target = iframe.name;
            form.style.display = 'none';

            Object.keys(data).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
                form.appendChild(input);
            });

            document.body.appendChild(form);

            setTimeout(() => {
                form.submit();
            }, 100);

            setTimeout(() => {
                try {
                    if (form.parentNode) form.parentNode.removeChild(form);
                    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
                } catch (e) {}
                resolve();
            }, 3000);

        } catch (error) {
            reject(error);
        }
    });
  };

  const updateStudentStatus = (id: string, status: StudentProfile['uploadStatus'], message?: string) => {
    setStudentsStatus(prev => prev.map(s => s.id === id ? { ...s, uploadStatus: status, uploadMessage: message } : s));
  };

  const executeUpload = async (student: StudentProfile, totalScore: number) => {
      updateStudentStatus(student.id, 'uploading');

      const submitPayload = {
        action: 'submitResults',
        studentInfo: {
            questionCode: QUESTION_CODE,
            className: student.className,
            classNumber: student.classNumber,
            studentId: student.studentId,
            studentName: student.studentName || ''
        },
        score: totalScore,
        timeUsed: 0,
        violations: 0,
        answers: [],
        correctAnswers: [],
        violationLog: [],
        timestamp: new Date().toISOString(),
        submissionId: generateSubmissionId(),
        isManualEntry: true
      };

      try {
          // Try fetch first
          let success = false;
          try {
              const response = await fetch(SCRIPT_URL, {
                  method: 'POST',
                  mode: 'cors',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(submitPayload)
              });
              if (response.ok) {
                  const data = await response.json();
                  if (data.success) success = true;
                  else if (data.error === 'DUPLICATE_SUBMISSION') throw new Error('重複提交');
                  else throw new Error(data.message || '提交失敗');
              }
          } catch (e) {
              console.log("Fetch failed, trying iframe fallback", e);
              await submitViaIframe(submitPayload);
              success = true;
          }

          if (success) {
              updateStudentStatus(student.id, 'success', '上傳成功');
          } else {
             throw new Error("上傳失敗");
          }
      } catch (error: any) {
          console.error(error);
          updateStudentStatus(student.id, 'error', error.message || '失敗');
      }
  };

  const handleSubmit = async () => {
    setStep(2);
    const grade = await gradeStudentReflection(summary, reflection);
    setResult(grade);

    if (grade.totalComment === 'ERROR_CONNECTION') {
        setStep(3);
        return;
    }

    setStep(3);
    
    // Auto Upload for all students upon successful grading
    const totalScore = grade.score1 + grade.score2;
    studentsStatus.forEach(s => {
        executeUpload(s, totalScore);
    });
  };

  const handleUploadSingleScore = (student: StudentProfile) => {
      if (!result) return;
      executeUpload(student, result.score1 + result.score2);
  };

  const handleUploadAll = () => {
      if (!result) return;
      const totalScore = result.score1 + result.score2;
      studentsStatus.forEach(s => {
          if (s.uploadStatus !== 'success') {
              executeUpload(s, totalScore);
          }
      });
  };

  if (step === 3 && result) {
    // Check if grading failed
    if (result.totalComment === 'ERROR_CONNECTION') {
        return (
            <PaperCard className="max-w-md w-full p-8 text-center animate-fadeIn">
                <AlertCircle size={64} className="mx-auto text-imperial-red mb-4" />
                <h3 className="text-2xl font-bold text-imperial-ink mb-2">評分連接失敗</h3>
                <p className="text-imperial-ink/70 mb-6">隨船史官似乎暫時無法回應（網絡或AI服務異常）。</p>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleSubmit} // Retry grading
                        className="w-full bg-imperial-gold text-imperial-ink font-bold py-3 rounded-full hover:bg-yellow-500 shadow-md flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={20} /> 重試評分
                    </button>
                    <button 
                        onClick={() => setStep(1)} // Go back to edit
                        className="w-full bg-white border border-imperial-ink/20 text-imperial-ink font-bold py-2 rounded-full hover:bg-gray-50"
                    >
                        返回修改回答
                    </button>
                </div>
            </PaperCard>
        );
    }

    const allSuccess = studentsStatus.every(s => s.uploadStatus === 'success');

    return (
      <PaperCard className="max-w-5xl w-full p-6 animate-fadeIn flex flex-col md:flex-row gap-6">
         {/* Left: Result Display */}
         <div className="flex-1">
            <div className="text-center mb-6">
                <Award size={48} className="mx-auto text-imperial-gold mb-2" />
                <h2 className="text-2xl font-bold text-imperial-ink">評分報告</h2>
                <div className="text-5xl font-bold text-imperial-red">{result.score1 + result.score2} <span className="text-xl text-imperial-ink/50">/ 20</span></div>
            </div>

            <div className="space-y-4 mb-6">
                <div className="bg-white/50 p-3 rounded-lg border border-imperial-ink/10">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-imperial-ocean text-sm">Q1 總結</span>
                        <span className="bg-imperial-ocean text-white px-2 py-0.5 rounded text-xs">{result.score1}/10</span>
                    </div>
                    <p className="text-xs text-imperial-ink/80">{result.feedback1}</p>
                </div>
                <div className="bg-white/50 p-3 rounded-lg border border-imperial-ink/10">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-imperial-ocean text-sm">Q2 觀點論證</span>
                        <span className="bg-imperial-ocean text-white px-2 py-0.5 rounded text-xs">{result.score2}/10</span>
                    </div>
                    <p className="text-xs text-imperial-ink/80">{result.feedback2}</p>
                </div>
            </div>
            
            <div className="bg-imperial-gold/10 p-3 rounded-lg border border-imperial-gold/30 mb-4">
                <h4 className="font-bold text-imperial-ink text-sm mb-1">史官點評</h4>
                <p className="text-xs text-imperial-ink/90">{result.totalComment}</p>
            </div>
         </div>

         {/* Right Divider (Mobile: Horizontal, Desktop: Vertical) */}
         <div className="w-full h-px md:w-px md:h-auto bg-imperial-ink/20"></div>

         {/* Right: Upload Form */}
         <div className="flex-1 flex flex-col justify-center">
             <div className="bg-white/60 p-6 rounded-xl border border-imperial-ink/10 shadow-inner h-full flex flex-col">
                <h3 className="text-xl font-bold text-imperial-ink mb-4 flex items-center gap-2">
                    <Upload size={20} /> 成績上傳狀態
                </h3>
                <p className="text-xs text-imperial-ink/50 mb-4">系統正在自動上傳您的成績...</p>

                <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                    {studentsStatus.map((s, idx) => (
                        <div key={s.id} className="bg-white p-3 rounded border border-imperial-ink/10 flex items-center justify-between shadow-sm">
                            <div>
                                <div className="font-bold text-imperial-ink text-sm">
                                    {s.className}班 ({s.classNumber}) {s.studentName}
                                </div>
                                <div className="text-xs font-mono text-imperial-ink/60">{s.studentId}</div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {s.uploadStatus === 'success' && <span className="text-green-600 text-xs font-bold flex items-center"><Check size={14}/> 已上傳</span>}
                                {s.uploadStatus === 'error' && <span className="text-red-600 text-xs flex items-center"><AlertCircle size={14}/> {s.uploadMessage}</span>}
                                {s.uploadStatus === 'uploading' && <span className="text-imperial-gold text-xs flex items-center"><Loader2 size={14} className="animate-spin"/> 上傳中</span>}
                                
                                {s.uploadStatus !== 'success' && s.uploadStatus !== 'uploading' && (
                                    <button 
                                        onClick={() => handleUploadSingleScore(s)}
                                        className="bg-imperial-ocean text-white px-3 py-1 rounded text-xs hover:bg-blue-900"
                                    >
                                        重試
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {allSuccess ? (
                    <div className="text-center">
                         <div className="text-green-700 font-bold mb-2 flex justify-center items-center gap-2"><CheckCircle2 size={20}/> 所有成績已上傳完成</div>
                         <button onClick={onRestart} className="w-full bg-imperial-gold text-imperial-ink font-bold py-2 px-6 rounded-full hover:bg-yellow-500 shadow-md">
                            重新開始旅程
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleUploadAll}
                        className="w-full bg-imperial-ocean text-white font-bold py-3 rounded-lg hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Upload size={18} /> 重試未完成項目
                    </button>
                )}
             </div>
         </div>
      </PaperCard>
    );
  }

  if (step === 2) {
    return (
      <PaperCard className="max-w-md w-full p-12 text-center animate-fadeIn">
        <Loader2 size={48} className="mx-auto text-imperial-gold animate-spin mb-4" />
        <h3 className="text-xl font-bold text-imperial-ink">史官正在審閱您的航海日誌...</h3>
      </PaperCard>
    );
  }

  const isQ1 = step === 0;
  const currentText = isQ1 ? summary : reflection;
  const setFunc = isQ1 ? setSummary : setReflection;
  const question = isQ1 
    ? "請總結你這次航行中遇到的最大挑戰，以及你的決策如何影響了結果？" 
    : "你較贊同以上哪一方的觀點（鄭和下西洋是否得不償失）？為甚麼？";

  return (
    <PaperCard className="max-w-2xl w-full p-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-6 border-b border-imperial-ink/10 pb-4">
            <h2 className="text-2xl font-bold text-imperial-ink">航後總結與反思</h2>
            <div className="flex gap-2">
                <div className={`w-3 h-3 rounded-full ${step === 0 ? 'bg-imperial-red' : 'bg-imperial-ink/20'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-imperial-red' : 'bg-imperial-ink/20'}`}></div>
            </div>
        </div>

        <div className="mb-6">
            <h3 className="text-lg font-bold text-imperial-ocean mb-2">問題 {step + 1}/2</h3>
            
            {/* Context for Q2: Viewpoints */}
            {!isQ1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-50 border-2 border-green-200 p-3 rounded-lg text-green-900 shadow-sm">
                        <h4 className="font-bold mb-1 text-sm flex items-center gap-2">
                            <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full">觀點一</span>
                            值得 (正面)
                        </h4>
                        <p className="text-xs leading-relaxed opacity-90">
                            鄭和將先進技術（如水稻種植）帶到西洋，推廣中國文化，擴大明朝影響力，並帶回珍貴物產（如長頸鹿、寶石），促進了文化與經濟交流。
                        </p>
                    </div>
                    <div className="bg-red-50 border-2 border-red-200 p-3 rounded-lg text-red-900 shadow-sm">
                        <h4 className="font-bold mb-1 text-sm flex items-center gap-2">
                            <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">觀點二</span>
                            不值得 (負面)
                        </h4>
                        <p className="text-xs leading-relaxed opacity-90">
                            下西洋花費白銀六百萬兩，賞賜繁多，帶回的多是奢侈品而非必需品。開支巨大，虛耗國力，對明朝財政構成嚴重負擔。
                        </p>
                    </div>
                </div>
            )}

            <p className="text-xl font-serif text-imperial-ink leading-relaxed">{question}</p>
        </div>

        <div className="relative mb-6">
             <textarea 
                className="w-full h-48 p-4 bg-white/50 border-2 border-imperial-ink/20 rounded-lg text-lg focus:outline-none focus:border-imperial-gold resize-none font-serif"
                placeholder={isQ1 ? "請在此輸入您的回答..." : "請選擇一方觀點，並提出理據支持..."}
                value={currentText}
                onChange={(e) => setFunc(e.target.value)}
             />
             <button 
                onClick={() => toggleListening(setFunc)}
                className={`absolute bottom-4 right-4 p-3 rounded-full transition-all ${
                    isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-lg scale-110' 
                    : 'bg-imperial-ocean text-white hover:bg-blue-900 shadow-md'
                }`}
                title="語音輸入"
             >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
             </button>
        </div>

        <div className="flex justify-end gap-4">
             {step === 1 && (
                 <button 
                    onClick={() => setStep(0)}
                    className="px-6 py-2 rounded-lg border border-imperial-ink/20 hover:bg-imperial-ink/5 transition-colors"
                 >
                    上一步
                 </button>
             )}
             <button 
                onClick={() => {
                    if (step === 0) setStep(1);
                    else handleSubmit();
                }}
                disabled={currentText.length < 5}
                className="bg-imperial-gold text-imperial-ink font-bold py-3 px-8 rounded-lg hover:bg-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
             >
                {step === 0 ? <>下一題 <CheckCircle2 size={18}/></> : <>提交評分 <Send size={18}/></>}
             </button>
        </div>
    </PaperCard>
  );
};

export default AssessmentPanel;