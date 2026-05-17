import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import { RiGasStationFill } from "react-icons/ri";
import { FaFireFlameCurved } from "react-icons/fa6";
import { BsWind } from "react-icons/bs";
import { GiOilDrum } from "react-icons/gi";

const FUEL_TYPES = [
  { id: "Diesel", label: "Diesel", price: 94.5, unit: "L", icon: RiGasStationFill, color: "#f59e0b" },
  { id: "Petrol", label: "Petrol", price: 102.3, unit: "L", icon: FaFireFlameCurved, color: "#ef4444" },
  { id: "CNG", label: "CNG", price: 76.0, unit: "kg", icon: BsWind, color: "#22c55e" },
  { id: "HSD", label: "HSD", price: 91.2, unit: "L", icon: GiOilDrum, color: "#3b82f6" },
];

const AddressInput = ({ value, onSelect }) => {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=in&limit=5`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSuggestions([]);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (item) => {
    setQuery(item.display_name);
    onSelect(item.display_name);
    setSuggestions([]);
    setFocused(false);
  };

  return (
    <div ref={wrapperRef} className="address-wrapper">
      <div className="address-input-container">
        <span className="address-pin">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSelect(e.target.value);
          }}
          onFocus={() => setFocused(true)}
          placeholder="Start typing your address..."
          className="input address-field"
          required
        />
      </div>

      {focused && suggestions.length > 0 && (
        <ul className="address-suggestions">
          {suggestions.map((item) => (
            <li
              key={item.place_id}
              className="address-suggestion-item"
              onClick={() => handleSelect(item)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="suggestion-icon">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{item.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const PlaceOrderPage = () => {
  const [selectedFuel, setSelectedFuel] = useState("Diesel");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const activeFuel = FUEL_TYPES.find((f) => f.id === selectedFuel);
  const total = quantity > 0 ? (activeFuel.price * quantity).toFixed(2) : "0.00";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      toast.error("Please select both delivery date and time");
      return;
    }

    const deliveryDateTime = new Date(selectedDate);
    deliveryDateTime.setHours(selectedTime.getHours());
    deliveryDateTime.setMinutes(selectedTime.getMinutes());

    setLoading(true);
    try {
      await API.post("/orders", {
        fuelType: selectedFuel,
        quantity,
        location,
        deliveryTime: deliveryDateTime.toISOString(),
      });
      toast.success("Order placed successfully");
      navigate("/history");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page animate-fadeUp">
      <div className="section-label">New Order</div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Place Fuel Order</h1>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>Select fuel type and fill in delivery details</p>

      <form onSubmit={handleSubmit}>
        <div className="order-layout">
          <div>
            <label className="label">Fuel Type</label>
            <div className="fuel-grid">
              {FUEL_TYPES.map((fuel) => {
                const Icon = fuel.icon;
                const isActive = selectedFuel === fuel.id;
                const rgbMap = { Diesel: "245,158,11", Petrol: "239,68,68", CNG: "34,197,94", HSD: "59,130,246" };
                return (
                  <div
                    key={fuel.id}
                    onClick={() => setSelectedFuel(fuel.id)}
                    style={{
                      background: isActive ? `rgba(${rgbMap[fuel.id]},0.08)` : "#0f0f1a",
                      border: isActive ? `1.5px solid ${fuel.color}` : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "12px",
                      padding: "18px 16px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      boxShadow: isActive ? `0 0 0 1px ${fuel.color}22, 0 8px 24px rgba(0,0,0,0.3)` : "none",
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: `${fuel.color}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon size={18} color={fuel.color} />
                    </div>
                    <div style={{
                      fontSize: 15, fontWeight: 600,
                      color: isActive ? "#f0f0f8" : "#9ca3af",
                      transition: "color 0.2s ease",
                    }}>
                      {fuel.label}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: isActive ? fuel.color : "#4b5563",
                      transition: "color 0.2s ease",
                    }}>
                      ₹{fuel.price}/{fuel.unit}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="label">Quantity ({activeFuel.unit})</label>
              <input type="number" min="1" value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity" required className="input" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="label">Delivery Location</label>
              <AddressInput
                value={location}
                onSelect={(address) => setLocation(address)}
              />
            </div>

            <div className="date-time-row" style={{ marginBottom: 20 }}>
              <div>
                <label className="label">Delivery Date</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  minDate={new Date()}
                  dateFormat="dd MMM yyyy"
                  placeholderText="Select delivery date"
                  className="custom-datepicker-input"
                  calendarClassName="custom-calendar"
                />
              </div>
              <div>
                <label className="label">Delivery Time</label>
                <DatePicker
                  selected={selectedTime}
                  onChange={(time) => setSelectedTime(time)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption="Delivery Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select delivery time"
                  className="custom-datepicker-input"
                  calendarClassName="custom-calendar time-only-calendar"
                  minTime={new Date(new Date().setHours(6, 0, 0, 0))}
                  maxTime={new Date(new Date().setHours(22, 0, 0, 0))}
                />
              </div>
            </div>
          </div>

          <div className="card summary-card">
            <div className="section-label">Order Summary</div>
            <div className="summary-row">
              <span className="sr-label">Fuel Type</span>
              <span className="sr-value">{selectedFuel}</span>
            </div>
            <div className="summary-row">
              <span className="sr-label">Quantity</span>
              <span className="sr-value">{quantity || 0} {activeFuel.unit}</span>
            </div>
            <div className="summary-row">
              <span className="sr-label">Unit Price</span>
              <span className="sr-value">₹{activeFuel.price}/{activeFuel.unit}</span>
            </div>
            <div className="divider"></div>
            <div className="summary-total-label">Total</div>
            {quantity && quantity > 0 ? (
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 36, fontWeight: 800, color: "#f0f0f8",
                marginBottom: 4,
              }}>
                ₹{(quantity * activeFuel.price).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            ) : (
              <div style={{
                fontSize: 14, color: "#4b5563",
                fontStyle: "italic", marginBottom: 4,
              }}>
                Enter quantity to see total
              </div>
            )}
            <div className="summary-note">incl. delivery charges</div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? "Placing Order..." : "Confirm Order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrderPage;
