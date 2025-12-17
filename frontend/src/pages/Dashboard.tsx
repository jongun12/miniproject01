import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const attendanceData = [
    { name: '1주', rate: 100 },
    { name: '2주', rate: 100 },
    { name: '3주', rate: 80 },
    { name: '4주', rate: 100 },
    { name: '5주', rate: 90 },
    { name: '6주', rate: 100 },
];

const gradeData = [
    { name: '알고리즘', score: 85 },
    { name: '데이터베이스', score: 92 },
    { name: '운영체제', score: 78 },
    { name: '네트워크', score: 88 },
];

const Dashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">이번 학기 평균 학점</h3>
                    <p className="text-3xl font-bold text-gray-900 font-mono">4.2<span className="text-lg text-gray-400 font-sans ml-1">/ 4.5</span></p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">총 출석률</h3>
                    <p className="text-3xl font-bold text-blue-600 font-mono">96<span className="text-lg text-gray-400 font-sans ml-1">%</span></p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">수강 과목 수</h3>
                    <p className="text-3xl font-bold text-gray-900 font-mono">5<span className="text-lg text-gray-400 font-sans ml-1">과목</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Chart */}
                <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 h-[320px] flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">주차별 출석 추이</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="rate" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grade Chart */}
                <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 h-[320px] flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">과목별 성적 현황</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradeData} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={[0, 100]} />
                                <Tooltip
                                    cursor={{ fill: '#F9FAFB' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="score" fill="#10B981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
