import React, { useState } from 'react';
import { Plus, Search, MapPin, Users, MoreHorizontal } from 'lucide-react';
import MapPicker from '../components/MapPicker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';

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
    const queryClient = useQueryClient();

    // Fetch Courses
    const { data: courses, isLoading } = useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            // Temporary: fetching /courses/ API. 
            // Ensure your backend has a CourseViewSet registered at /api/courses/
            const res = await client.get('/courses/');
            return res.data as Course[];
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
                allowed_radius: 50 // default
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            setIsModalOpen(false);
            setNewCourse({ name: '', code: '', lat: 37.5665, lon: 126.9780 });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newCourse);
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading courses...</div>;

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-sans">강의 관리</h1>
                    <p className="text-gray-500 text-sm mt-1">등록된 강의 목록을 관리하고 출석 위치를 설정합니다.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
                >
                    <Plus size={18} />
                    <span>새 강의 등록</span>
                </button>
            </div>

            {/* Course List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses?.map((course) => (
                    <div key={course.id} className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Users size={20} />
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

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
