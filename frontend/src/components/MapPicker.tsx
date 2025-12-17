import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

interface MapPickerProps {
    initialLat?: number;
    initialLon?: number;
    onLocationSelect: (lat: number, lon: number) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ initialLat = 37.5665, initialLon = 126.9780, onLocationSelect }) => {
    const [lat, setLat] = useState(initialLat);
    const [lon, setLon] = useState(initialLon);

    const handleManualChange = (type: 'lat' | 'lon', value: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) return;

        if (type === 'lat') {
            setLat(num);
            onLocationSelect(num, lon);
        } else {
            setLon(num);
            onLocationSelect(lat, num);
        }
    };

    return (
        <div className="w-full h-full bg-gray-100 rounded-xl relative overflow-hidden border border-gray-200 group">
            {/* Mock Map Background - Would be replaced by Real Map */}
            <div className="absolute inset-0 bg-blue-50 opacity-50 flex items-center justify-center pointer-events-none">
                <div className="w-full h-full flex flex-col items-center justify-center text-blue-300">
                    <MapPin size={48} className="mb-2" />
                    <span className="text-sm font-bold">지도 API 연동 필요</span>
                    <span className="text-xs">(현재는 좌표 직접 입력 모드)</span>
                </div>
            </div>

            {/* Pin Visualization */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 hover:scale-110 transition-transform cursor-pointer">
                <MapPin size={32} fill="currentColor" />
            </div>

            {/* Control Panel */}
            <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow-soft flex gap-4 items-center bg-opacity-90 backdrop-blur-sm z-10 opacity-100 transition-opacity">
                <div className="flex-1">
                    <label className="text-xs text-gray-500 font-mono block mb-1">Latitude</label>
                    <input
                        type="number"
                        step="0.0001"
                        value={lat}
                        onChange={(e) => handleManualChange('lat', e.target.value)}
                        className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg font-mono focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-xs text-gray-500 font-mono block mb-1">Longitude</label>
                    <input
                        type="number"
                        step="0.0001"
                        value={lon}
                        onChange={(e) => handleManualChange('lon', e.target.value)}
                        className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg font-mono focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default MapPicker;
