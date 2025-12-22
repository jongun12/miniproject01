import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import client from '../api/client';
import { RefreshCw, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const AttendanceProfessor: React.FC = () => {
    // 1. State Hooks
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [generatedData, setGeneratedData] = useState<{ code: string, valid_for: string } | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(30); // Countdown state

    // Manual Attendance Hooks (Moved to top)
    const [sheetData, setSheetData] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const { refetch: fetchSheet } = useQuery({
        queryKey: ['attendance-sheet', selectedCourseId, selectedDate],
        queryFn: async () => {
            if (!selectedCourseId) return [];
            const res = await client.get(`/attendance/sheet/?course_id=${selectedCourseId}&date=${selectedDate}`);
            setSheetData(res.data);
            return res.data;
        },
        enabled: !!selectedCourseId
    });

    const updateMutation = useMutation({
        mutationFn: async (data: { student_id: number, status: string }) => {
            return await client.post('/attendance/update_status/', {
                course_id: selectedCourseId,
                date: selectedDate,
                ...data
            });
        },
        onSuccess: () => fetchSheet()
    });

    const batchAbsentMutation = useMutation({
        mutationFn: async () => {
            return await client.post('/attendance/batch_absent/', {
                course_id: selectedCourseId,
                date: selectedDate
            });
        },
        onSuccess: (data) => {
            alert(data.data.message);
            fetchSheet();
        }
    });

    // Auto-fetch sheet when course/date changes
    useEffect(() => {
        if (selectedCourseId) {
            fetchSheet();
        }
    }, [selectedCourseId, selectedDate, fetchSheet]);

    // 2. Data Fetching Hooks
    const { data: courses, isLoading, isError, error } = useQuery({
        queryKey: ['my-courses'],
        queryFn: async () => {
            const res = await client.get('/courses/');
            const data = res.data;
            if (Array.isArray(data)) return data;
            if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as any).results)) {
                return (data as any).results;
            }
            return [];
        }
    });

    // 3. Helper Functions
    const generateCode = async () => {
        if (!selectedCourseId) return;
        try {
            const res = await client.get(`/attendance/generate-qr/${selectedCourseId}/`);
            setGeneratedData(res.data);
            setTimeLeft(30); // Reset countdown
        } catch (e) {
            console.error('Failed to generate code', e);
        }
    };

    // 4. Effect Hooks
    // Auto-refresh hook (30s)
    useEffect(() => {
        let interval: number | undefined;
        if (generatedData && selectedCourseId) {
            interval = window.setInterval(() => {
                generateCode();
            }, 30000);
        }
        return () => window.clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generatedData, selectedCourseId]);

    // Countdown Timer Hook (1s)
    useEffect(() => {
        if (!generatedData) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [generatedData]);


    // 5. Conditional Rendering (MUST BE AFTER ALL HOOKS)
    if (isLoading) return (
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (isError) return (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl m-6">
            <h3 className="font-bold mb-2">데이터를 불러오지 못했습니다.</h3>
            <p className="text-sm">{(error as any)?.message || '알 수 없는 오류가 발생했습니다.'}</p>
        </div>
    );

    // 6. Main Render
    // Only show 'Empty' state if we definitely have no courses AND logic is done
    if (!courses || courses.length === 0) return (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 mb-4">등록된 강의가 없습니다.</p>
            <p className="text-sm text-gray-400">강의 관리 메뉴에서 새 강의를 등록해주세요.</p>
        </div>
    );




    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-sans">출석 관리 (교수용)</h1>
                    <p className="text-gray-500 text-sm mt-1">학생들이 출석할 수 있도록 인증 코드를 생성하고, 수동으로 상태를 변경할 수 있습니다.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Control Panel */}
                <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100 h-fit">
                    <label className="block text-sm font-medium text-gray-700 mb-2">강의 선택</label>
                    <select
                        className="w-full p-3 border border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500"
                        value={selectedCourseId}
                        onChange={(e) => {
                            setSelectedCourseId(e.target.value);
                            setGeneratedData(null);
                        }}
                    >
                        <option value="">강의를 선택하세요</option>
                        {courses.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                        ))}
                    </select>

                    <button
                        onClick={generateCode}
                        disabled={!selectedCourseId}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={20} />
                        출석 코드 생성
                    </button>

                    <p className="text-xs text-gray-400 mt-4 text-center">
                        코드는 30초마다 갱신되며, 생성 시 4시간 동안 세션이 유지됩니다.
                    </p>
                </div>

                {/* Display Panel */}
                <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                    {generatedData ? (
                        <div className="text-center animate-fade-in space-y-6">
                            <div className="p-4 bg-white rounded-xl shadow-lg inline-block">
                                <QRCodeSVG value={generatedData.code} size={200} />
                            </div>

                            <div>
                                <h3 className="text-gray-500 text-sm uppercase tracking-wide font-semibold mb-2">인증 코드 (30초)</h3>
                                <p className="text-5xl font-mono font-bold text-blue-600 tracking-widest">{generatedData.code}</p>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Clock size={16} className="animate-pulse text-blue-500" />
                                    <span className="text-blue-500 font-medium">자동 갱신 중...</span>
                                </div>
                                {/* Countdown Progress Bar */}
                                <div className="w-64 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                                        style={{ width: `${(timeLeft / 30) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm font-mono text-gray-400 mt-1">{timeLeft}초 남음</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <RefreshCw size={32} />
                            </div>
                            <p>강의를 선택하고 코드를 생성해주세요.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Manual Attendance Table */}
            {selectedCourseId && (
                <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            수강생 출석부
                            <input
                                type="date"
                                className="text-sm font-normal border border-gray-200 rounded p-1"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </h2>
                        <button
                            onClick={() => batchAbsentMutation.mutate()}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200"
                        >
                            미출석 인원 전체 결석 처리
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 text-sm">
                                    <th className="py-3">이름 (아이디)</th>
                                    <th className="py-3 text-center">상태</th>
                                    <th className="py-3 text-right">작업</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {sheetData.map((student) => (
                                    <tr key={student.student_id} className="group hover:bg-gray-50 transition-colors">
                                        <td className="py-4 font-medium text-gray-700">
                                            {student.student_name}
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold
                                                ${student.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                                    student.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                                                        student.status === 'ABSENT' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`
                                            }>
                                                {student.status === 'NONE' ? '미처리' : student.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex gap-1 justify-end">
                                                <button
                                                    onClick={() => updateMutation.mutate({ student_id: student.student_id, status: 'PRESENT' })}
                                                    className={`px-3 py-1 rounded text-xs border ${student.status === 'PRESENT' ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 hover:bg-gray-100'}`}
                                                >출석</button>
                                                <button
                                                    onClick={() => updateMutation.mutate({ student_id: student.student_id, status: 'LATE' })}
                                                    className={`px-3 py-1 rounded text-xs border ${student.status === 'LATE' ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-200 hover:bg-gray-100'}`}
                                                >지각</button>
                                                <button
                                                    onClick={() => updateMutation.mutate({ student_id: student.student_id, status: 'ABSENT' })}
                                                    className={`px-3 py-1 rounded text-xs border ${student.status === 'ABSENT' ? 'bg-red-500 text-white border-red-500' : 'border-gray-200 hover:bg-gray-100'}`}
                                                >결석</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {sheetData.length === 0 && (
                            <p className="text-center text-gray-400 py-8">수강생이 없습니다.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceProfessor;
