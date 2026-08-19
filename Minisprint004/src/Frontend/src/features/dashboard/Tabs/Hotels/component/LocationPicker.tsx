import { MapContainer, Marker, TileLayer, useMap,useMapEvents } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import L, { type LatLngExpression } from "leaflet";
import { reverseGeocode } from "./geo_helper";

import "leaflet/dist/leaflet.css";
console.log("Map file rendered");
// Fix missing marker icons in Vite/React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});
type LocationData = {
    latitude: number;
    longitude: number;
    city: string;
    province: string;
    country: string;
    address: string;
};


type Props = {
    latitude: string | number;
    longitude: string | number;
    onChange: (location: LocationData) => void;
    height?: number;
};

const DEFAULT_LOCATION: LatLngExpression = [45.9432, 24.9668];

function Recenter({ position }: { position: LatLngExpression }) {
    const map = useMap();

    useEffect(() => {
        map.setView(position);
    }, [map, position]);

    return null;
}

function LocationMarker({
    position,
    onChange,
}: {
    position: LatLngExpression;
    onChange: (location: LocationData) => void;
}) {
    const [markerPosition, setMarkerPosition] = useState(position);
    console.log("Map rendered");

    useEffect(() => {
        setMarkerPosition(position);
    }, [position]);

    useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;

            setMarkerPosition([lat, lng]);

            const address = await reverseGeocode(lat, lng);

            onChange({
                latitude: lat,
                longitude: lng,
                ...address,
            });
        }
    });

    return (
        <Marker
            draggable
            position={markerPosition}
            eventHandlers={{
                dragend: async (event) => {
                    const marker = event.target;
                    const { lat, lng } = marker.getLatLng();
                    setMarkerPosition([lat, lng]);
                    const address = await reverseGeocode(lat, lng);
                    onChange({
                        latitude: lat,
                        longitude: lng,
                        ...address,
                    });     
                },
            }}
        />
    );
}

export default function LocationPicker({
    latitude,
    longitude,
    onChange,
    height = 400,
}: Props) {
    const lat = Number(latitude);
    const lng = Number(longitude);

    const center = useMemo<LatLngExpression>(() => {
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            return [lat, lng];
        }

        return DEFAULT_LOCATION;
    }, [lat, lng]);

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{
                width: "100%",
                height,
                borderRadius: 10,
            }}
            scrollWheelZoom
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Recenter position={center} />

            <LocationMarker
                position={center}
                onChange={onChange}
            />
        </MapContainer>
    );
}