import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

const MYFUELS_ORIGIN = {
  lat: 28.4595,
  lng: 77.0266,
  label: "MyFuels Warehouse, Gurgaon",
};

const originIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 14px; height: 14px;
    background: #f59e0b;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 3px rgba(245,158,11,0.3);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const destIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 14px; height: 14px;
    background: #ffffff;
    border: 3px solid #f59e0b;
    border-radius: 50%;
    box-shadow: 0 0 0 3px rgba(255,255,255,0.2);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const truckIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 32px; height: 32px;
    background: #f59e0b;
    border: 2px solid #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(245,158,11,0.5);
  ">🚛</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const getMarkerProgress = (status) => {
  switch (status) {
    case "Pending": return 0.0;
    case "Accepted": return 0.15;
    case "Out for Delivery": return 0.65;
    case "Delivered": return 1.0;
    default: return 0.0;
  }
};

const getPointAlongRoute = (coords, progress) => {
  if (!coords.length) return null;
  if (progress <= 0) return coords[0];
  if (progress >= 1) return coords[coords.length - 1];
  const targetIndex = Math.floor(progress * (coords.length - 1));
  return coords[targetIndex];
};

const FitBounds = ({ origin, destination }) => {
  const map = useMap();
  useEffect(() => {
    if (origin && destination) {
      const bounds = L.latLngBounds([origin, destination]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [map, origin, destination]);
  return null;
};

const DeliveryMap = ({ order }) => {
  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order?.lat || !order?.lng) {
      setLoading(false);
      return;
    }

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${MYFUELS_ORIGIN.lng},${MYFUELS_ORIGIN.lat};${order.lng},${order.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );
          setRouteCoords(coords);
        }
      } catch (err) {
        console.error("Route fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [order?.lat, order?.lng]);

  if (!order?.lat || !order?.lng) {
    return (
      <div style={{
        height: 300, background: "#0f0f1a",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 8,
      }}>
        <span style={{ fontSize: 32 }}>🗺️</span>
        <p style={{ color: "#6b7280", fontSize: 14 }}>
          Map not available for this order
        </p>
        <p style={{ color: "#4b5563", fontSize: 12 }}>
          Place a new order to see live tracking
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        height: 380,
        background: "linear-gradient(90deg, #13131f 25%, #1a1a2e 50%, #13131f 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
        borderRadius: 16,
      }} />
    );
  }

  const progress = getMarkerProgress(order?.status);
  const markerPosition = getPointAlongRoute(routeCoords, progress);

  const statusMessages = {
    Pending: "Awaiting pickup from warehouse",
    Accepted: "Order confirmed — preparing for dispatch",
    "Out for Delivery": "En route to your location",
    Delivered: "Delivered successfully",
  };

  return (
    <div style={{
      borderRadius: 16, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{
        background: "#0f0f1a", padding: "12px 20px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: order?.status === "Delivered" ? "#22c55e" : "#f59e0b",
            boxShadow: order?.status !== "Delivered" ? "0 0 0 3px rgba(245,158,11,0.2)" : "none",
            animation: order?.status === "Out for Delivery" ? "pulse-amber 1.5s infinite" : "none",
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f8" }}>
            {statusMessages[order?.status] || "Processing"}
          </span>
        </div>
        <span style={{ fontSize: 12, color: "#6b7280" }}>
          Gurgaon → {order?.location?.split(",")[0]}
        </span>
      </div>

      <MapContainer
        center={[
          (MYFUELS_ORIGIN.lat + order.lat) / 2,
          (MYFUELS_ORIGIN.lng + order.lng) / 2,
        ]}
        zoom={11}
        style={{ height: 360, width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />

        <FitBounds
          origin={[MYFUELS_ORIGIN.lat, MYFUELS_ORIGIN.lng]}
          destination={[order.lat, order.lng]}
        />

        {routeCoords.length > 0 && (
          <>
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: "rgba(255,255,255,0.08)",
                weight: 6,
                lineCap: "round",
              }}
            />
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: "#f59e0b",
                weight: 3,
                lineCap: "round",
                dashArray: order?.status === "Out for Delivery" ? "8 6" : undefined,
              }}
            />
          </>
        )}

        <Marker position={[MYFUELS_ORIGIN.lat, MYFUELS_ORIGIN.lng]} icon={originIcon}>
          <Popup>
            <div style={{ fontFamily: "Inter", fontSize: 13 }}>
              <strong>MyFuels Warehouse</strong><br />
              Gurgaon, Haryana
            </div>
          </Popup>
        </Marker>

        <Marker position={[order.lat, order.lng]} icon={destIcon}>
          <Popup>
            <div style={{ fontFamily: "Inter", fontSize: 13 }}>
              <strong>Delivery Location</strong><br />
              {order.location}
            </div>
          </Popup>
        </Marker>

        {markerPosition && order?.status !== "Pending" && (
          <Marker position={markerPosition} icon={truckIcon}>
            <Popup>
              <div style={{ fontFamily: "Inter", fontSize: 13 }}>
                {order?.status === "Delivered" ? "Delivered" : "Out for delivery"}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div style={{
        background: "#0f0f1a", padding: "12px 20px",
        display: "flex", alignItems: "center", gap: 20,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        flexWrap: "wrap",
      }}>
        {[
          { dot: "#f59e0b", label: "MyFuels Warehouse" },
          { dot: "#ffffff", label: "Delivery location", border: true },
          { dot: "#f59e0b", label: "Route", dashed: true },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {item.dashed ? (
              <div style={{ width: 20, height: 0, borderTop: "2px dashed #f59e0b" }} />
            ) : (
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: item.dot,
                border: item.border ? "2px solid #f59e0b" : "none",
              }} />
            )}
            <span style={{ fontSize: 12, color: "#6b7280" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryMap;
