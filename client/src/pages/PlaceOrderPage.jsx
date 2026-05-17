import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";

const fuels = [
  { name: "Diesel", dotColor: "#f59e0b", rate: 94.5, unit: "L" },
  { name: "Petrol", dotColor: "#ef4444", rate: 102.3, unit: "L" },
  { name: "CNG", dotColor: "#22c55e", rate: 76, unit: "kg" },
  { name: "HSD", dotColor: "#3b82f6", rate: 91.2, unit: "L" },
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
  const [fuelType, setFuelType] = useState("Diesel");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const selected = fuels.find((f) => f.name === fuelType);
  const total = quantity > 0 ? (selected.rate * quantity).toFixed(2) : "0.00";

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
        fuelType,
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
              {fuels.map((f) => (
                <div key={f.name}
                  className={`fuel-card ${fuelType === f.name ? "selected" : ""}`}
                  onClick={() => setFuelType(f.name)}>
                  <span className="fuel-dot" style={{ background: f.dotColor }} />
                  <div className="fc-name">{f.name}</div>
                  <div className="fc-rate">₹{f.rate}/{f.unit}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="label">Quantity ({selected.unit})</label>
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
              <span className="sr-value">{fuelType}</span>
            </div>
            <div className="summary-row">
              <span className="sr-label">Quantity</span>
              <span className="sr-value">{quantity || 0} {selected.unit}</span>
            </div>
            <div className="summary-row">
              <span className="sr-label">Unit Price</span>
              <span className="sr-value">₹{selected.rate}/{selected.unit}</span>
            </div>
            <div className="divider"></div>
            <div className="summary-total-label">Total</div>
            <div className="summary-total">₹{total}</div>
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
