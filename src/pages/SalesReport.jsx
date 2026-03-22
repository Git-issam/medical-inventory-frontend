import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, TrendingUp, DollarSign, ShoppingCart,
    Package, Tag, Calendar, ChevronLeft, ChevronRight,
    FileText, LayoutDashboard, Settings, LogOut
} from "lucide-react";
import medicineService from "../services/medicineService";
import authService from "../services/authService";
import "./SalesReport.css";

function SalesReport() {
    const navigate = useNavigate();
    const [period, setPeriod] = useState("daily");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Derive query params from period + currentDate
    const getQueryParams = useCallback(() => {
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, "0");
        const d = String(currentDate.getDate()).padStart(2, "0");
        const dateStr = `${y}-${m}-${d}`;
        return { period, date: dateStr, year: String(y) };
    }, [period, currentDate]);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { period: p, date, year } = getQueryParams();
            const data = await medicineService.getSalesReport(p, date, year);
            setReportData(data);
        } catch (err) {
            console.error("Failed to fetch sales report:", err);
            if (err.response?.status === 401) {
                authService.logout();
                navigate("/");
            } else {
                setError("Failed to load sales report. Make sure the backend is running.");
            }
        } finally {
            setLoading(false);
        }
    }, [getQueryParams, navigate]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Navigation helpers
    const navigate_period = (direction) => {
        const d = new Date(currentDate);
        if (period === "daily") d.setDate(d.getDate() + direction);
        else if (period === "monthly") d.setMonth(d.getMonth() + direction);
        else if (period === "yearly") d.setFullYear(d.getFullYear() + direction);
        setCurrentDate(d);
    };

    const getPeriodLabel = () => {
        if (period === "daily")
            return currentDate.toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "long", day: "numeric" });
        if (period === "monthly")
            return currentDate.toLocaleDateString("en-IN", { year: "numeric", month: "long" });
        if (period === "yearly")
            return currentDate.getFullYear().toString();
        return "";
    };

    const isToday = () => {
        const now = new Date();
        if (period === "daily") return currentDate.toDateString() === now.toDateString();
        if (period === "monthly") return currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() === now.getMonth();
        if (period === "yearly") return currentDate.getFullYear() === now.getFullYear();
        return false;
    };

    const kpiCards = [
        {
            label: "Total Sales",
            value: `₹${(reportData?.totalSales || 0).toFixed(2)}`,
            icon: <DollarSign size={24} />,
            color: "blue",
        },
        {
            label: "Transactions",
            value: reportData?.transactions ?? 0,
            icon: <ShoppingCart size={24} />,
            color: "green",
        },
        {
            label: "Medicines Sold",
            value: reportData?.totalMedicinesSold ?? 0,
            icon: <Package size={24} />,
            color: "purple",
        },
        {
            label: "Total Discount",
            value: `₹${(reportData?.totalDiscount || 0).toFixed(2)}`,
            icon: <Tag size={24} />,
            color: "orange",
        },
    ];

    return (
        <div className="sr-layout">
            {/* Sidebar */}
            <aside className="sr-sidebar">
                <div className="sr-sidebar-content">
                    <div className="sr-sidebar-item" onClick={() => navigate("/dashboard")}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </div>
                    <div className="sr-sidebar-item" onClick={() => navigate("/bill")}>
                        <FileText size={20} />
                        <span>Billing</span>
                    </div>
                    <div className="sr-sidebar-item active">
                        <TrendingUp size={20} />
                        <span>Sales Report</span>
                    </div>
                    <div className="sr-sidebar-item" onClick={() => navigate("/settings")}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </div>
                    <div className="sr-sidebar-divider" />
                    <div className="sr-sidebar-item" onClick={() => { authService.logout(); navigate("/"); }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="sr-main">
                {/* Header */}
                <header className="sr-header">
                    <div className="sr-header-left">
                        <button className="sr-back-btn" onClick={() => navigate("/dashboard")}>
                            <ArrowLeft size={18} />
                        </button>
                        <div className="sr-title-group">
                            <TrendingUp size={26} className="sr-title-icon" />
                            <h1>Sales Report</h1>
                        </div>
                    </div>
                </header>

                <div className="sr-content">
                    {/* Period Tabs */}
                    <div className="sr-tabs">
                        {["daily", "monthly", "yearly"].map((p) => (
                            <button
                                key={p}
                                className={`sr-tab ${period === p ? "active" : ""}`}
                                onClick={() => setPeriod(p)}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Period Navigator */}
                    <div className="sr-period-nav">
                        <button className="sr-nav-btn" onClick={() => navigate_period(-1)}>
                            <ChevronLeft size={20} />
                        </button>
                        <div className="sr-period-label">
                            <Calendar size={16} />
                            <span>{getPeriodLabel()}</span>
                        </div>
                        <button
                            className="sr-nav-btn"
                            onClick={() => navigate_period(1)}
                            disabled={isToday()}
                        >
                            <ChevronRight size={20} />
                        </button>
                        {!isToday() && (
                            <button className="sr-today-btn" onClick={() => setCurrentDate(new Date())}>
                                Today
                            </button>
                        )}
                    </div>

                    {/* KPI Cards */}
                    {loading ? (
                        <div className="sr-kpi-grid">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="sr-kpi-card sr-skeleton-card">
                                    <div className="sr-skeleton sr-skeleton-icon" />
                                    <div className="sr-skeleton-text-group">
                                        <div className="sr-skeleton sr-skeleton-label" />
                                        <div className="sr-skeleton sr-skeleton-value" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="sr-error">{error}</div>
                    ) : (
                        <div className="sr-kpi-grid">
                            {kpiCards.map((card) => (
                                <div key={card.label} className={`sr-kpi-card sr-kpi-${card.color}`}>
                                    <div className="sr-kpi-icon">{card.icon}</div>
                                    <div className="sr-kpi-info">
                                        <span className="sr-kpi-label">{card.label}</span>
                                        <span className="sr-kpi-value">{card.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Transactions Table */}
                    <div className="sr-table-card">
                        <div className="sr-table-header">
                            <h2>Transactions</h2>
                            {!loading && !error && (
                                <span className="sr-count-badge">
                                    {reportData?.transactions ?? 0} records
                                </span>
                            )}
                        </div>

                        {loading ? (
                            <div className="sr-table-loading">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="sr-skeleton-row">
                                        <div className="sr-skeleton" style={{ width: "18%", height: "16px" }} />
                                        <div className="sr-skeleton" style={{ width: "20%", height: "16px" }} />
                                        <div className="sr-skeleton" style={{ width: "25%", height: "16px" }} />
                                        <div className="sr-skeleton" style={{ width: "12%", height: "16px" }} />
                                        <div className="sr-skeleton" style={{ width: "15%", height: "16px" }} />
                                    </div>
                                ))}
                            </div>
                        ) : error ? null : reportData?.sales?.length === 0 ? (
                            <div className="sr-empty">
                                <TrendingUp size={48} className="sr-empty-icon" />
                                <h3>No transactions found</h3>
                                <p>No bills were generated for this period.</p>
                            </div>
                        ) : (
                            <div className="sr-table-wrapper">
                                <table className="sr-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Bill No</th>
                                            <th>Customer</th>
                                            <th>Contact</th>
                                            <th>Items</th>
                                            <th>Subtotal (₹)</th>
                                            <th>Discount (₹)</th>
                                            <th>Grand Total (₹)</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData?.sales?.map((sale, idx) => {
                                            const totalDisc = sale.itemDiscountTotal + sale.billDiscountAmount;
                                            return (
                                                <tr key={sale.id}>
                                                    <td>{idx + 1}</td>
                                                    <td>
                                                        <span className="sr-bill-no">{sale.billNumber}</span>
                                                    </td>
                                                    <td>{sale.customerName}</td>
                                                    <td>{sale.customerContact || "—"}</td>
                                                    <td>
                                                        <div className="sr-items-list">
                                                            {(sale.items || []).map((item, i) => (
                                                                <span key={i} className="sr-item-pill">
                                                                    {item.name} ×{item.quantity}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td>₹{sale.subtotal?.toFixed(2)}</td>
                                                    <td className="sr-discount-cell">
                                                        {totalDisc > 0
                                                            ? `- ₹${totalDisc.toFixed(2)}`
                                                            : "—"}
                                                    </td>
                                                    <td className="sr-total-cell">
                                                        <strong>₹{sale.grandTotal?.toFixed(2)}</strong>
                                                    </td>
                                                    <td className="sr-time-cell">
                                                        {new Date(sale.soldAt).toLocaleTimeString("en-IN", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr className="sr-tfoot-row">
                                            <td colSpan={7} className="sr-tfoot-label">Period Total</td>
                                            <td className="sr-tfoot-total">
                                                ₹{(reportData?.totalSales || 0).toFixed(2)}
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SalesReport;
