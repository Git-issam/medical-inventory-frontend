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
    Edit
} from "lucide-react";
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

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Menu className="sidebar-icon toggle-btn" size={24} onClick={toggleSidebar} title="Menu" />
                </div>

                <div className="sidebar-menu">
                    <div className="sidebar-item" onClick={() => navigate('/dashboard')}>
                        <Home className="sidebar-icon" size={24} title="Home" />
                        <span className="sidebar-label">Home</span>
                    </div>

                    <div className="sidebar-item" onClick={() => navigate('/medicine')}>
                        <Package className="sidebar-icon" size={24} title="Inventory" />
                        <span className="sidebar-label">Inventory</span>
                    </div>

                    <div className="sidebar-item" onClick={() => navigate('/settings')}>
                        <Settings className="sidebar-icon" size={24} title="Settings" />
                        <span className="sidebar-label">Settings</span>
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

                    <div className="inventory-card">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Medicine name</th>
                                    <th>Stock-Available</th>
                                    <th>Total Stock</th>
                                    <th>Batch-No</th>
                                    <th>supplier-Name</th>
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
                                        </tr>
                                    ))
                                ) : filteredMedicines.length === 0 ? (
                                    // Empty State
                                    <tr>
                                        <td colSpan="8">
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
                                        const lowStock = med.stock < 10;

                                        return (
                                            <tr key={med.id}>
                                                <td>{med.name || 'N/A'}</td>
                                                <td>{med.stock !== undefined ? med.stock : 'N/A'}</td>
                                                <td>{med.totalStock !== undefined ? med.totalStock : 'N/A'}</td>
                                                <td>{med.batchNo || 'N/A'}</td>
                                                <td>{med.supplier || 'N/A'}</td>
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
                                                <td>
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => navigate(`/medicine?id=${med.id}`)}
                                                        title="Edit medicine"
                                                    >
                                                        <Edit size={16} />
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
            </div>
        </div>
    );
}

export default Dashboard;
