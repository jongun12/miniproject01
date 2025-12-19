import React from 'react';
import { Menu, User, BookOpen, LayoutDashboard, MapPin, QrCode, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setSidebarOpen] = React.useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const menuItems = [
        { icon: LayoutDashboard, label: '대시보드', path: '/' },
        { icon: BookOpen, label: '강의 관리', path: '/courses' },
    ];

    // Dynamic Menu based on Role
    if (user?.role === 'STUDENT') {
        menuItems.push({ icon: MapPin, label: '출석 체크', path: '/attendance/student' });
    } else if (user?.role === 'PROFESSOR') {
        menuItems.push({ icon: QrCode, label: '출석 관리', path: '/attendance/professor' });
    }

    menuItems.push({ icon: User, label: '내 정보', path: '/profile' });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:relative md:translate-x-0`}
            >
                <div className="h-full flex flex-col">
                    <div className="h-[64px] flex items-center px-6 border-b border-gray-50">
                        <h1 className="text-xl font-bold text-gray-800 font-sans tracking-tight">Intelligent LMS</h1>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-50">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                {user?.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm transition-colors"
                        >
                            <LogOut size={16} />
                            <span>로그아웃</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="h-[64px] bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 bg-opacity-80 backdrop-blur-sm">
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 font-mono">{new Date().toLocaleDateString()}</span>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 max-w-[1200px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
