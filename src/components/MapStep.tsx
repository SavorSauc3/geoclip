import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Form } from 'react-bootstrap';
import 'leaflet/dist/leaflet.css';

interface MapStepProps {
    locations: { latitude: number, longitude: number, confidence: number }[];
}

const MapStep: React.FC<MapStepProps> = ({ locations }) => {
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('map', { 
                center: [0, 0], 
                zoom: 2, 
                zoomControl: false 
            });
        }

        const map = mapRef.current;

        const themes: { [key: string]: L.TileLayer } = {
            'esri-imagery': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '&copy; Esri',
                maxZoom: 18,
            }),
            'osm': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            }),
            'dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CARTO',
                maxZoom: 19,
            }),
            'light': L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CARTO',
                maxZoom: 19,
            }),
        };

        if (!map.hasLayer(themes['esri-imagery'])) {
            themes['esri-imagery'].addTo(map);
        }

        const handleThemeChange = (e: Event) => {
            const target = e.target as HTMLSelectElement;
            const selectedTheme = target.value;

            map.eachLayer((layer: L.Layer) => {
                map.removeLayer(layer);
            });

            themes[selectedTheme].addTo(map);
        };

        document.getElementById('theme')?.addEventListener('change', handleThemeChange);

        // Clear previous markers
        map.eachLayer((layer: L.Layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Add new markers
        locations.forEach(location => {
            const { latitude, longitude, confidence } = location;

            // Convert confidence to a color
            const color = `hsl(${(confidence * 120)}, 100%, 50%)`;

            const marker = L.circleMarker([latitude, longitude], {
                radius: 8,
                fillColor: color,
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
            }).addTo(map);
        });

        return () => {
            document.getElementById('theme')?.removeEventListener('change', handleThemeChange);
        };
    }, [locations]);

    return (
        <div style={{ 
            position: 'relative', 
            height: '75vh',
            margin: 0, 
            padding: 0, 
            overflow: 'hidden'
        }}>
            <div id="theme-selector" style={{ 
                position: 'absolute', 
                top: '10px', 
                left: '10px', 
                zIndex: 1000,
                backgroundColor: 'transparent', 
                padding: '0 10px'
            }}>
                <label htmlFor="theme" style={{ marginRight: '10px', color: 'white'}}>Select Map Theme:</label>
                <Form.Select id="theme" style={{ width: '200px', padding: '5px' }}>
                    <option value="esri-imagery">Esri World Imagery</option>
                    <option value="osm">OpenStreetMap</option>
                    <option value="dark">CartoDB Dark Matter</option>
                    <option value="light">CartoDB Light</option>
                </Form.Select>
            </div>
            <div id="map" style={{ 
                position: 'absolute', 
                top: 0, 
                bottom: 0, 
                left: 0, 
                right: 0, 
                zIndex: 1 
            }}></div>
        </div>
    );
};

export default MapStep;
