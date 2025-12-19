import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import client from '../api/client';
import { MapPin, QrCode, AlertCircle, CheckCircle2 } from 'lucide-react';

const AttendanceStudent: React.FC = () => {
    const [courseId, setCourseId] = useState('');
    const [code, setCode] = useState('');
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const checkInMutation = useMutation({
        mutationFn: async (data: { course_id: number, code: string, lat: number, lon: number }) => {
            return await client.post('/attendance/check-in/', data);
        },
        onSuccess: (data) => {
            setStatusMsg({ type: 'success', msg: data.data.message });
        },
        onError: (error: any) => {
            setStatusMsg({
                type: 'error',
                msg: error.response?.data?.error || 'Attendance failed. Please check your code or location.'
            });
        }
    });

    const handleCheckIn = () => {
        if (!courseId || !code) {
            setStatusMsg({ type: 'error', msg: 'Please enter course ID and code.' });
            return;
        }

        if (!navigator.geolocation) {
            setStatusMsg({ type: 'error', msg: 'Geolocation is not supported by your browser.' });
            return;
        }

        setStatusMsg(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                checkInMutation.mutate({
                    course_id: parseInt(courseId),
                    code: code,
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            },
            () => {
                setStatusMsg({ type: 'error', msg: 'Failed to get location. Please allow location access.' });
            }
        );
    };

    return (
        <div className="max-w-md mx-auto mt-10 space-y-8">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Attendance Check-In</h1>
                <p className="text-gray-500 mt-2">Enter the provided code and verify your location.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course ID</label>
                    <input
                        type="number"
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">6-Digit Code</label>
                    <div className="relative">
                        <QrCode className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={code}
                            maxLength={6}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
                            placeholder="000000"
                        />
                    </div>
                </div>

                <button
                    onClick={handleCheckIn}
                    disabled={checkInMutation.isPending}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {checkInMutation.isPending ? (
                        'Verifying...'
                    ) : (
                        <>
                            <MapPin size={18} />
                            Check In
                        </>
                    )}
                </button>

                {statusMsg && (
                    <div className={`p-4 rounded-xl flex items-start gap-3 ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {statusMsg.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        <p className="text-sm font-medium">{statusMsg.msg}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceStudent;
