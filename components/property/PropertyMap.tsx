import React, { useState, useCallback, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Location01Icon,
  Home01Icon,
  Navigation03Icon,
} from "@hugeicons/core-free-icons";

interface PropertyMapProps {
  address: string;
  location: string;
  propertyTitle?: string;
  propertyPrice?: number;
  propertyImage?: string;
  center?: {
    lat: number;
    lng: number;
  };
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  address,
  location,
  propertyTitle,
  propertyPrice,
  propertyImage,
  center,
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLng | null>(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places", "geometry"],
  });

  // Default center (Seoul, Korea) or use provided coordinates
  const defaultCenter = useMemo(() => {
    return center || { lat: 37.5665, lng: 126.978 }; // Seoul coordinates
  }, [center]);

  // Map container style
  const containerStyle = {
    width: "100%",
    height: "100%",
  };

  // Map options
  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "on" }],
        },
        {
          featureType: "transit",
          elementType: "labels",
          stylers: [{ visibility: "on" }],
        },
      ],
    }),
    [],
  );

  // Geocode address to get coordinates
  const geocodeAddress = useCallback(
    async (searchAddress: string) => {
      if (!map) return;

      const geocoder = new google.maps.Geocoder();
      const fullAddress = `${searchAddress}, ${location}`;

      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const position = results[0].geometry.location;
          setMarkerPosition(position);
          map.setCenter(position);
          map.setZoom(15);
        } else {
          console.error("Geocoding failed:", status);
          // Fallback to default center
          map.setCenter(defaultCenter);
        }
      });
    },
    [map, location, defaultCenter],
  );

  // On map load
  const onLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);
      // Geocode address when map loads
      setTimeout(() => {
        geocodeAddress(address);
      }, 500);
    },
    [address, geocodeAddress],
  );

  // On map unmount
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle marker click
  const handleMarkerClick = () => {
    setShowInfo(!showInfo);
  };

  // Open in Google Maps
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${address}, ${location}`,
    )}`;
    window.open(url, "_blank");
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl">
        <div className="text-center space-y-2">
          <HugeiconsIcon
            icon={Location01Icon}
            size={48}
            color="#94a3b8"
            strokeWidth={1.5}
          />
          <p className="text-slate-600 text-sm">Failed to load map</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* Marker */}
        {markerPosition && (
          <Marker
            position={markerPosition}
            onClick={handleMarkerClick}
            animation={google.maps.Animation.DROP}
            icon={{
              url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%232563eb' stroke='white' stroke-width='2'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'%3E%3C/path%3E%3Ccircle cx='12' cy='10' r='3' fill='white'%3E%3C/circle%3E%3C/svg%3E",
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 40),
            }}
          />
        )}

        {/* Info Window */}
        {markerPosition && showInfo && (
          <InfoWindow
            position={markerPosition}
            onCloseClick={() => setShowInfo(false)}
          >
            <div className="p-2 max-w-xs">
              {propertyImage && (
                <img
                  src={propertyImage}
                  alt={propertyTitle}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
              )}
              <h4 className="font-semibold text-slate-900 mb-1">
                {propertyTitle || address}
              </h4>
              <p className="text-sm text-slate-600 mb-2">{address}</p>
              {propertyPrice && (
                <p className="text-lg font-bold text-blue-600">
                  ₩{propertyPrice.toLocaleString()}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={openInGoogleMaps}
          className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm border border-slate-200/50 rounded-lg shadow-md hover:bg-white transition-colors text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          <HugeiconsIcon
            icon={Navigation03Icon}
            size={16}
            color="currentColor"
            strokeWidth={1.5}
          />
          Open in Google Maps
        </button>
      </div>
    </div>
  );
};

export default PropertyMap;
