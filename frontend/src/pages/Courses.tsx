import React, { useState } from 'react';
import { Plus, MapPin, Users, MoreHorizontal } from 'lucide-react';
import MapPicker from '../components/MapPicker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

interface Course {
    id: number;
    name: string;
    code: string;
    professor: number; // ID
    latitude: number;
    longitude: number;
    allowed_radius: number;
}

const Courses: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', code: '', lat: 37.5665, lon: 126.9780 });
    // Schedule State
    const [schedules, setSchedules] = useState<{ day_of_week: number, start_time: string, end_time: string }[]>([]);
    const [tempSchedule, setTempSchedule] = useState({ day_of_week: 0, start_time: '09:00', end_time: '10:30' });

    const queryClient = useQueryClient();

    const addSchedule = () => {
        setSchedules([...schedules, tempSchedule]);
    };

    const removeSchedule = (index: number) => {
        setSchedules(schedules.filter((_, i) => i !== index));
    };

    // Auth Store Access
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === 'ADMIN';

    // Fetch Courses
    const { data: courses, isLoading, isError, error } = useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            const res = await client.get('/courses/');
            const data = res.data;
            if (Array.isArray(data)) return data as Course[];
            if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as any).results)) {
                return (data as any).results as Course[];
            }
            return [];
        }
    });

    // Create Course Mutation
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            // Backend expects: { name, code, latitude, longitude, allowed_radius, ... }
            return await client.post('/courses/', {
                ...data,
                latitude: data.lat,
                longitude: data.lon,
                allowed_radius: 50, // default
                schedules: schedules // Include schedules
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            setIsModalOpen(false);
            setIsModalOpen(false);
            setNewCourse({ name: '', code: '', lat: 37.5665, lon: 126.9780 });
            setSchedules([]); // Reset schedules
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newCourse);
    };

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

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-sans">강의 관리</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isAdmin ? '강의를 생성하고 관리합니다.' : '수강 중인 강의 목록입니다.'}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
                    >
                        <Plus size={18} />
                        <span>새 강의 등록</span>
                    </button>
                )}
            </div>

            {/* Course List Grid */}
            {courses && courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div key={course.id} className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Users size={20} />
                                </div>
                                {isAdmin && (
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal size={20} />
                                    </button>
                                )}
                            </div>
                            {/* ... (Rest of card content) */}
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{course.name}</h3>
                            <p className="text-sm text-gray-400 font-mono mb-6">{course.code}</p>

                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                                <MapPin size={14} className="text-gray-400" />
                                <span className="font-mono truncate">
                                    {course.latitude?.toFixed(4)}, {course.longitude?.toFixed(4)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 mb-4">등록된 강의가 없습니다.</p>
                    {isAdmin && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            첫 번째 강의를 등록해보세요
                        </button>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-25 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">새 강의 등록</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">강의명</label>
                                        <input
                                            type="text"
                                            required
                                            value={newCourse.name}
                                            onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="예: 알고리즘 개론"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">강의 코드</label>
                                        <input
                                            type="text"
                                            required
                                            value={newCourse.code}
                                            onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                            placeholder="CS101"
                                        />
                                    </div>
                                </div>

                                {/* Map Picker Area */}
                                <div className="h-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">강의실 위치 설정</label>
                                    <div className="h-[300px]">
                                        <MapPicker
                                            onLocationSelect={(lat, lon) => setNewCourse({ ...newCourse, lat, lon })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Section */}
                            <div className="px-6 pb-6 border-b border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">강의 시간표 추가</label>
                                <div className="flex gap-2 mb-3 items-end">
                                    <div className="flex-1">
                                        <span className="text-xs text-gray-500 block mb-1">요일</span>
                                        <select
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                            value={tempSchedule.day_of_week}
                                            onChange={e => setTempSchedule({ ...tempSchedule, day_of_week: Number(e.target.value) })}
                                        >
                                            <option value={0}>월요일</option>
                                            <option value={1}>화요일</option>
                                            <option value={2}>수요일</option>
                                            <option value={3}>목요일</option>
                                            <option value={4}>금요일</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs text-gray-500 block mb-1">시작</span>
                                        <input
                                            type="time"
                                            value={tempSchedule.start_time}
                                            onChange={e => setTempSchedule({ ...tempSchedule, start_time: e.target.value })}
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs text-gray-500 block mb-1">종료</span>
                                        <input
                                            type="time"
                                            value={tempSchedule.end_time}
                                            onChange={e => setTempSchedule({ ...tempSchedule, end_time: e.target.value })}
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addSchedule}
                                        className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200 text-gray-600 mb-[1px]"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    {schedules.length === 0 && <span className="text-xs text-gray-400">추가된 시간표가 없습니다.</span>}
                                    {schedules.map((s, i) => (
                                        <span key={i} className="bg-white border border-blue-100 text-blue-600 text-xs px-2 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                                            <span className="font-bold">{['월', '화', '수', '목', '금'][s.day_of_week]}</span>
                                            <span>{s.start_time} - {s.end_time}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSchedule(i)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
                                >
                                    {createMutation.isPending ? '등록 중...' : '등록하기'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Courses;
