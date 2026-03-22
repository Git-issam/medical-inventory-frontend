import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Menu,
    Search,
    Bell,
    User,
    Plus,
    XCircle,
    AlertTriangle,
    CheckCircle,
    Home,
    Package,
    Settings,
    Clock,
    LogOut,
    FileText,
    Edit,
    LayoutDashboard,
    UserCircle,
    Activity,
    Trash2,
    TrendingUp
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, ReferenceLine, Legend
} from "recharts";
import medicineService from "../services/medicineService";
import authService from "../services/authService";
import "./Dashboard.css";
import avatar from "../assets/doctor_avatar.png";

function Dashboard() {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState({
        totalMedicines: 0,
        lowStock: 0,
        expired: 0,
        nearExpiry: 0
    });

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const [medicinesData, statsData] = await Promise.all([
                medicineService.getAllMedicines(),
                medicineService.getStats()
            ]);
            setMedicines(medicinesData);
            setStats(statsData);
        } catch (error) {
            console.error("Error fetching medicines:", error);
            if (error.response?.status === 401) {
                authService.logout();
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const isExpired = (expiryDate) => {
        return new Date(expiryDate) < new Date();
    };

    const isNearExpiry = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 30;
    };

    // Use stats from backend
    const totalMedicines = stats.totalMedicines;
    const lowStockCount = stats.lowStock;
    const expiredCount = stats.expired;
    const nearExpiryCount = stats.nearExpiry;

    // Filter Medicines
    const filteredMedicines = medicines.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
        try {
            await medicineService.deleteMedicine(id);
            await fetchMedicines();
        } catch (error) {
            console.error('Error deleting medicine:', error);
            alert('Failed to delete medicine. Please try again.');
        }
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-content">
                    <div className="sidebar-item active" onClick={() => navigate('/dashboard')}>
                        <LayoutDashboard className="sidebar-icon" size={20} />
                        <span className="sidebar-label">Dashboard</span>
                    </div>

                    <div className="sidebar-item" onClick={() => navigate('/medicine')}>
                        <Package className="sidebar-icon" size={20} />
                        <span className="sidebar-label">Inventory</span>
                    </div>

                    <div className="sidebar-item" onClick={() => navigate('/bill')}>
                        <FileText className="sidebar-icon" size={20} />
                        <span className="sidebar-label">Billing</span>
                    </div>

                    <div className="sidebar-item" onClick={() => navigate('/sales')}>
                        <TrendingUp className="sidebar-icon" size={20} />
                        <span className="sidebar-label">Sales Report</span>
                    </div>

                    <div className="sidebar-item" onClick={() => navigate('/settings')}>
                        <Settings className="sidebar-icon" size={20} />
                        <span className="sidebar-label">Settings</span>
                    </div>

                    <div className="sidebar-divider"></div>

                    <div className="sidebar-item" onClick={() => {
                        authService.logout();
                        navigate('/');
                    }}>
                        <LogOut className="sidebar-icon" size={20} />
                        <span className="sidebar-label">Logout</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content">
                {/* Top Bar */}
                <header className="top-bar">
                    <div className="search-bar">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search medicine..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="top-icons">
                        {/* Removed redundant duplicate Search icon */}
                        <Bell size={20} className="icon-btn" onClick={() => alert("No new notifications")} title="Notifications" />
                        <img src={avatar} alt="Profile" className="avatar" />
                    </div>
                </header>

                {/* Content Area */}
                <main className="content-area">
                    <div className="page-header">
                        <h1 className="page-title">Medicine Inventory</h1>
                        <div className="header-actions">
                            <Link to="/bill" className="btn-generate-bill">
                                <FileText size={18} />
                                Generate Bill
                            </Link>
                            <Link to="/medicine" className="btn-add-medicine">
                                <Plus size={18} />
                                Add Medicine
                            </Link>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="kpi-grid">
                        <div className="kpi-card">
                            <div className="kpi-icon-wrapper bg-blue-100">
                                <Package size={24} />
                            </div>
                            <div className="kpi-content">
                                <span className="kpi-label">Total Medicines</span>
                                {loading ? <div className="skeleton skeleton-text" style={{ width: '40px' }}></div> : <span className="kpi-value">{totalMedicines}</span>}
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-icon-wrapper bg-yellow-100">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="kpi-content">
                                <span className="kpi-label">Low Stock Items</span>
                                {loading ? <div className="skeleton skeleton-text" style={{ width: '40px' }}></div> : <span className="kpi-value">{lowStockCount}</span>}
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-icon-wrapper bg-red-100">
                                <XCircle size={24} />
                            </div>
                            <div className="kpi-content">
                                <span className="kpi-label">Expired Medicines</span>
                                {loading ? <div className="skeleton skeleton-text" style={{ width: '40px' }}></div> : <span className="kpi-value">{expiredCount}</span>}
                            </div>
                        </div>

                        <div className="kpi-card">
                            <div className="kpi-icon-wrapper bg-purple-100">
                                <Clock size={24} />
                            </div>
                            <div className="kpi-content">
                                <span className="kpi-label">Near Expiry (30 days)</span>
                                {loading ? <div className="skeleton skeleton-text" style={{ width: '40px' }}></div> : <span className="kpi-value">{nearExpiryCount}</span>}
                            </div>
                        </div>
                    </div>

                    {/* ── Stock Charts ─────────────────────────────── */}
                    {!loading && medicines.length > 0 && (() => {
                        // Prepare chart data — top 15 by stock, non-expired
                        const chartData = [...medicines]
                            .filter(m => new Date(m.expiry) > new Date())
                            .sort((a, b) => b.stock - a.stock)
                            .slice(0, 12)
                            .map(m => ({
                                name: m.name.length > 10 ? m.name.slice(0, 10) + '…' : m.name,
                                stock: m.stock,
                                totalStock: m.totalStock,
                            }));

                        const CustomTooltip = ({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="chart-tooltip">
                                        <p className="chart-tooltip-label">{label}</p>
                                        {payload.map((p, i) => (
                                            <p key={i} style={{ color: p.color }}>
                                                {p.name}: <strong>{p.value}</strong>
                                            </p>
                                        ))}
                                    </div>
                                );
                            }
                            return null;
                        };

                        return (
                            <div className="charts-row">
                                {/* Bar Chart — Current Stock */}
                                <div className="chart-card">
                                    <div className="chart-card-header">
                                        <h3 className="chart-title">📦 Stock Levels</h3>
                                        <span className="chart-subtitle">Top 12 medicines by available stock</span>
                                    </div>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                angle={-35}
                                                textAnchor="end"
                                                interval={0}
                                            />
                                            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <ReferenceLine y={10} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: 'Low stock', position: 'insideTopRight', fontSize: 10, fill: '#f59e0b' }} />
                                            <Bar dataKey="stock" name="Available" radius={[4, 4, 0, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.stock <= 10 ? '#ef4444' : entry.stock <= 30 ? '#f59e0b' : '#3b82f6'}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="chart-legend">
                                        <span className="legend-dot" style={{ background: '#3b82f6' }} /> Healthy
                                        <span className="legend-dot" style={{ background: '#f59e0b' }} /> Warning (≤30)
                                        <span className="legend-dot" style={{ background: '#ef4444' }} /> Low (≤10)
                                    </div>
                                </div>

                                {/* Bar Chart — Stock vs Total Stock */}
                                <div className="chart-card">
                                    <div className="chart-card-header">
                                        <h3 className="chart-title">📊 Stock vs Total</h3>
                                        <span className="chart-subtitle">Available vs originally stocked</span>
                                    </div>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                angle={-35}
                                                textAnchor="end"
                                                interval={0}
                                            />
                                            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                                            <Bar dataKey="totalStock" name="Total Stock" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="stock" name="Available" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        );
                    })()}

                    {/* ── Inventory Table ──────────────────────────── */}
                    <div className="inventory-card">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Medicine name</th>
                                    <th>Stock-Available</th>
                                    <th>Total Stock</th>
                                    <th>Batch-No</th>
                                    <th>supplier-Name</th>
                                    <th>Price (₹)</th>
                                    <th>Expiry</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    // Skeleton Loader
                                    [...Array(5)].map((_, index) => (
                                        <tr key={`skeleton-${index}`}>
                                            <td><div className="skeleton skeleton-text"></div></td>
                                            <td><div className="skeleton skeleton-text"></div></td>
                                            <td><div className="skeleton skeleton-text"></div></td>
                                            <td><div className="skeleton skeleton-text"></div></td>
                                            <td><div className="skeleton skeleton-text"></div></td>
                                            <td><div className="skeleton skeleton-text"></div></td>
                                            <td><div className="skeleton skeleton-text"></div></td>
                                            <td><div className="skeleton skeleton-text"></div></td>
                                            <td><div className="skeleton skeleton-text"></div></td>
                                        </tr>
                                    ))
                                ) : filteredMedicines.length === 0 ? (
                                    // Empty State
                                    <tr>
                                        <td colSpan="9">
                                            <div className="empty-state">
                                                <Package className="empty-state-icon" size={48} />
                                                <h3>No medicines found</h3>
                                                <p>Try adjusting your search or add a new medicine.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMedicines.map((med) => {
                                        const expired = isExpired(med.expiry);
                                        const lowStock = med.stock <= 10;

                                        return (
                                            <tr key={med.id}>
                                                <td>{med.name || 'N/A'}</td>
                                                <td>{med.stock !== undefined ? med.stock : 'N/A'}</td>
                                                <td>{med.totalStock !== undefined ? med.totalStock : 'N/A'}</td>
                                                <td>{med.batchNo || 'N/A'}</td>
                                                <td>{med.supplier || 'N/A'}</td>
                                                <td>₹{med.price !== undefined ? Number(med.price).toFixed(2) : '0.00'}</td>
                                                <td>{med.expiry ? new Date(med.expiry).toLocaleDateString('en-IN') : 'N/A'}</td>
                                                <td>
                                                    {expired ? (
                                                        <span className="status-badge status-expired">
                                                            <XCircle size={14} /> Expired
                                                        </span>
                                                    ) : lowStock ? (
                                                        <span className="status-badge status-low">
                                                            <AlertTriangle size={14} /> Low Stock
                                                        </span>
                                                    ) : (
                                                        <span className="status-badge status-ok">
                                                            <CheckCircle size={14} /> Available
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="actions-cell">
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => navigate(`/medicine?id=${med.id}`)}
                                                        title="Edit medicine"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleDelete(med.id, med.name)}
                                                        title="Delete medicine"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div >
        </div >
    );
}

export default Dashboard;
