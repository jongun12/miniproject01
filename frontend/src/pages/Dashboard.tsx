import React from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import {
    Users, BookOpen, Server, Activity,
    Calendar, MessageSquare, CheckCircle,
    Clock, Bell
} from 'lucide-react';

const Dashboard: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const role = user?.role;

    // Common Data Fetching
    const { data: stats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            try {
                const [gradeRes, attendanceRes, courseRes, userStatsRes, attendanceStatsRes] = await Promise.all([
                    client.get('/grades/'),
                    client.get('/attendance/'),
                    client.get('/courses/'),
                    role === 'ADMIN' ? client.get('/users/stats/') : Promise.resolve({ data: null }),
                    role === 'STUDENT' ? client.get('/attendance/stats/') : Promise.resolve({ data: null })
                ]);
                // Helper to handle pagination or direct array
                const getList = (res: any) => {
                    if (Array.isArray(res.data)) return res.data;
                    if (res.data && Array.isArray(res.data.results)) return res.data.results;
                    return [];
                };

                return {
                    grades: gradeRes.data,
                    attendance: attendanceRes.data,
                    courses: getList(courseRes), // Handle potential pagination
                    userStats: userStatsRes.data,
                    attendanceStats: attendanceStatsRes.data
                };
            } catch (e) {
                return null;
            }
        }
    });

    // Helper: Get Today's Python Day Index (0=Mon, 6=Sun)
    const getTodayIndex = () => {
        const jsDay = new Date().getDay(); // 0=Sun, 1=Mon...
        return (jsDay + 6) % 7;
    };

    const renderAdminDashboard = () => (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={<Users />} title="전체 재학생" value={stats?.userStats?.student_count || 0} color="bg-blue-100 text-blue-600" />
                <StatCard icon={<BookOpen />} title="개설된 강의" value={stats?.courses?.length || 0} color="bg-green-100 text-green-600" />
                <StatCard icon={<Server />} title="서버 상태" value="정상" subValue="Uptime: 99.9%" color="bg-indigo-100 text-indigo-600" />
                <StatCard
                    icon={<CheckCircle />}
                    title="실시간 출석률"
                    value={`${stats?.attendanceStats?.attendance_rate || 0}%`}
                    color="bg-green-100 text-green-600"
                />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-blue-500" />
                    가입 승인 대기 목록
                </h2>
                <div className="space-y-3">
                    {['김철수 (정보통신학과)', '이영희 (컴퓨터공학과)', '박민수 (인공지능학과)'].map((p, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <span className="text-sm font-medium text-gray-700">{p}</span>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600">승인</button>
                                <button className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-300">반려</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderProfessorDashboard = () => {
        const todayIdx = getTodayIndex();
        // Filter courses that have a schedule matching today
        // stats.courses is Array of Course objects. Each has 'schedules' array.
        const todayClasses = stats?.courses?.flatMap((c: any) =>
            c.schedules
                .filter((s: any) => s.day_of_week === todayIdx)
                .map((s: any) => ({ ...c, ...s }))
        ).sort((a: any, b: any) => a.start_time.localeCompare(b.start_time)) || [];

        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">교수 대시보드</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 1. Today's Schedule */}
                    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Calendar size={20} className="text-purple-500" />
                            오늘의 강의 일정
                        </h2>
                        {todayClasses.length > 0 ? (
                            <ul className="space-y-4">
                                {todayClasses.map((cls: any, idx: number) => (
                                    <li key={idx} className="flex gap-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                                        <div className="font-bold text-purple-700 w-16 text-center">
                                            {cls.start_time.slice(0, 5)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{cls.name}</div>
                                            <div className="text-xs text-gray-500">{cls.code} (공학관)</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 text-sm py-4">오늘 예정된 강의가 없습니다.</p>
                        )}
                    </div>

                    {/* 2. Notifications & Grading (Mock) */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <MessageSquare size={20} className="text-yellow-500" />
                                읽지 않은 학생 문의
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-auto">3</span>
                            </h2>
                            <p className="text-sm text-gray-500">최근 문의가 3건 있습니다. 확인해주세요.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <CheckCircle size={20} className="text-green-500" />
                                과제 채점 현황
                            </h2>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>알고리즘 과제 #3</span>
                                <span>28/40 완료</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderStudentDashboard = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">나의 학습 현황</h1>
                <span className="text-sm text-gray-500 font-mono">{new Date().toLocaleDateString()}</span>
            </div>

            {/* 1. Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-blue-100 text-sm mb-1">실시간 출석률</p>
                        <h3 className="text-3xl font-bold">{stats?.attendanceStats?.attendance_rate || 0}%</h3>
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-400 bg-opacity-30 rounded text-xs">안정권입니다</span>
                    </div>
                    <CheckCircle className="absolute right-4 bottom-4 text-blue-400 opacity-20" size={80} />
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                    <h3 className="text-gray-500 text-sm mb-2 flex items-center gap-2">
                        <Clock size={16} /> 마감 임박 과제
                    </h3>
                    <div className="font-bold text-gray-900 text-lg mb-1">데이터베이스 설계</div>
                    <p className="text-xs text-red-500 font-mono">오늘 23:59 마감</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                    <h3 className="text-gray-500 text-sm mb-2 flex items-center gap-2">
                        <Bell size={16} /> 최신 공지사항
                    </h3>
                    <ul className="space-y-2">
                        <li className="text-sm text-gray-700 truncate cursor-pointer hover:text-blue-500">• 중간고사 일정 안내</li>
                        <li className="text-sm text-gray-700 truncate cursor-pointer hover:text-blue-500">• 셔틀버스 운행 시간 변경</li>
                    </ul>
                </div>
            </div>

            {/* 2. Timetable (Visual) */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Calendar size={20} className="text-gray-600" />
                    이번 주 시간표
                </h2>
                <div className="grid grid-cols-5 gap-4">
                    {['월', '화', '수', '목', '금'].map((day, dayIndex) => {
                        // Find classes for this day (dayIndex 0=Mon, matching Python)
                        const classesForDay = stats?.courses?.flatMap((c: any) =>
                            c.schedules
                                .filter((s: any) => s.day_of_week === dayIndex)
                                .map((s: any) => ({ ...c, ...s }))
                        ).sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));

                        return (
                            <div key={day} className="text-center">
                                <div className="text-sm font-bold text-gray-400 mb-3">{day}</div>
                                <div className="space-y-2 min-h-[100px]">
                                    {classesForDay && classesForDay.length > 0 ? (
                                        classesForDay.map((cls: any, cIdx: number) => (
                                            <div key={cIdx} className={`p-2 rounded-lg text-xs font-bold mb-2 ${dayIndex % 2 === 0 ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                <div>{cls.name}</div>
                                                <div className="font-normal opacity-75">{cls.start_time.slice(0, 5)}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-200 text-xs">-</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    // Main Switch
    switch (role) {
        case 'ADMIN': return renderAdminDashboard();
        case 'PROFESSOR': return renderProfessorDashboard();
        case 'STUDENT': return renderStudentDashboard();
        default: return <div className="p-8 text-center text-gray-500">로그인 정보가 없습니다. (Role: {role || 'None'})</div>;
    }
};

// Helper Component for Stats
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StatCard = ({ icon, title, value, subValue, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:shadow-lg transition-shadow">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </div>
    </div>
);

export default Dashboard;
