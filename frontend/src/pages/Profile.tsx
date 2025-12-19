import React from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Shield, Book, Award } from 'lucide-react';

const Profile: React.FC = () => {
    const user = useAuthStore((state) => state.user);

    if (!user) return <div>로그인이 필요합니다.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 font-sans">내 정보</h1>

            <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 relative">
                    <div className="absolute -bottom-10 left-8">
                        <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                <User size={40} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-14 px-8 pb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                            <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                                {user.role}
                            </span>
                        </div>
                        <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                            프로필 수정
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <InfoRow icon={<Mail size={18} />} label="이메일" value={`${user.username}@university.ac.kr`} />
                            <InfoRow icon={<Shield size={18} />} label="계정 권한" value={user.role} />
                        </div>

                        {user.role === 'STUDENT' && (
                            <div className="space-y-4">
                                <InfoRow icon={<Book size={18} />} label="학적 상태" value="재학 (3학년 1학기)" />
                                <InfoRow icon={<Award size={18} />} label="총 이수 학점" value="84 / 130 학점" />
                            </div>
                        )}

                        {user.role === 'PROFESSOR' && (
                            <div className="space-y-4">
                                <InfoRow icon={<Book size={18} />} label="소속 학과" value="컴퓨터공학과" />
                                <InfoRow icon={<Award size={18} />} label="담당 과목 수" value="3 과목" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">계정 보안</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                        <div className="font-medium text-gray-900">비밀번호 변경</div>
                        <div className="text-xs text-gray-500">주기적인 비밀번호 변경으로 계정을 보호하세요.</div>
                    </div>
                    <button className="text-blue-600 text-sm font-medium hover:underline">변경하기</button>
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-center gap-3 text-sm">
        <div className="text-gray-400">{icon}</div>
        <div className="flex-1">
            <span className="text-gray-500 block text-xs">{label}</span>
            <span className="font-medium text-gray-900">{value}</span>
        </div>
    </div>
);

export default Profile;
