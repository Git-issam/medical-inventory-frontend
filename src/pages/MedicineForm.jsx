import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    Pill,
    Package,
    Calendar,
    CheckCircle,
    IndianRupee,
    ClipboardList,
    Truck,
    Layers,
    LayoutDashboard
} from "lucide-react";
import medicineService from "../services/medicineService";
import authService from "../services/authService";
import "./MedicineForm.css";

function MedicineForm() {
    const [name, setName] = useState("");
    const [stockAvailable, setStockAvailable] = useState("");
    const [totalStock, setTotalStock] = useState("");
    const [batchNo, setBatchNo] = useState("");
    const [supplierName, setSupplierName] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [price, setPrice] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const medicineId = searchParams.get('id');
    const isEditMode = !!medicineId;

    useEffect(() => {
        if (isEditMode) {
            fetchMedicineData();
        }
    }, [medicineId]);

    const fetchMedicineData = async () => {
        try {
            setIsLoading(true);
            const medicines = await medicineService.getAllMedicines();
            const medicine = medicines.find(m => m.id === parseInt(medicineId));

            if (medicine) {
                setName(medicine.name || "");
                setStockAvailable(medicine.stock?.toString() || "");
                setTotalStock(medicine.totalStock?.toString() || "");
                setBatchNo(medicine.batchNo || "");
                setSupplierName(medicine.supplier || "");
                setPrice(medicine.price !== undefined ? medicine.price.toString() : "");
                if (medicine.expiry) {
                    const date = new Date(medicine.expiry);
                    setExpiryDate(date.toISOString().split('T')[0]);
                }
            } else {
                setError("Medicine not found");
            }
        } catch (err) {
            console.error("Error fetching medicine:", err);
            if (err.response?.status === 401) {
                authService.logout();
                navigate('/');
            }
            setError("Failed to load medicine data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        try {
            const medicineData = {
                name,
                stock: parseInt(stockAvailable),
                totalStock: parseInt(totalStock),
                batchNo,
                supplier: supplierName,
                price: parseFloat(price) || 0,
                expiry: expiryDate
            };

            if (isEditMode) {
                await medicineService.updateMedicine(medicineId, medicineData);
            } else {
                await medicineService.addMedicine(medicineData);
            }
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} medicine. Please try again.`);
            setIsSaving(false);
        }
    };

    return (
        <div className="form-layout">
            {/* ── Left Brand Panel ── */}
            <div className="form-brand-panel">
                <div className="brand-icon-circle">
                    <Pill size={36} />
                </div>
                <h1 className="brand-title">MedInventory</h1>
                <p className="brand-subtitle">
                    Manage your pharmacy stock with precision. Always keep your inventory up to date.
                </p>
                <div className="brand-dots">
                    <span className="active"></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            {/* ── Right Side ── */}
            <div className="form-main">
                {/* Sticky Top Bar with Back Button */}
                <div className="form-topbar">
                    <Link to="/dashboard" className="btn-back">
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Link>
                    <span className="form-topbar-title">
                        {isEditMode ? 'Editing Medicine' : 'New Medicine Entry'}
                    </span>
                </div>

                {/* Form Card */}
                <div className="form-content">
                    <div className="form-card">
                        {/* Card Header */}
                        <div className="form-header">
                            <div className="form-header-icon">
                                <Package size={26} />
                            </div>
                            <h2>{isEditMode ? 'Edit Medicine' : 'Add Medicine'}</h2>
                            <p>{isEditMode ? 'Update the medicine information below' : 'Fill in the details to add a new medicine to your inventory'}</p>
                        </div>

                        {/* Card Body */}
                        <div className="form-body">
                            {isLoading ? (
                                <div className="loading-state">
                                    <span className="spinner"></span>
                                    <p>Loading medicine data…</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    {error && <div className="error-message">{error}</div>}

                                    {/* Medicine Name — full width */}
                                    <div className="form-group">
                                        <label className="form-label">Medicine Name</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon"><Pill size={17} /></span>
                                            <input
                                                type="text"
                                                placeholder="e.g. Paracetamol 500mg"
                                                className="form-input"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Stock & Total Stock — two columns */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Stock Available</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon"><Layers size={17} /></span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    className="form-input"
                                                    value={stockAvailable}
                                                    onChange={(e) => setStockAvailable(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Total Stock</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon"><Package size={17} /></span>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    className="form-input"
                                                    value={totalStock}
                                                    onChange={(e) => setTotalStock(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Batch No & Price — two columns */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Batch Number</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon"><ClipboardList size={17} /></span>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. B1001"
                                                    className="form-input"
                                                    value={batchNo}
                                                    onChange={(e) => setBatchNo(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Price (₹ per unit)</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon"><IndianRupee size={17} /></span>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                    className="form-input"
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Supplier & Expiry — two columns */}
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Supplier Name</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon"><Truck size={17} /></span>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Alpha Pharma"
                                                    className="form-input"
                                                    value={supplierName}
                                                    onChange={(e) => setSupplierName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Expiry Date</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon"><Calendar size={17} /></span>
                                                <input
                                                    type="date"
                                                    className="form-input"
                                                    value={expiryDate}
                                                    onChange={(e) => setExpiryDate(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-divider"></div>

                                    <button className="btn-submit" disabled={isSaving}>
                                        {isSaving
                                            ? <><span className="spinner"></span> Saving…</>
                                            : <><CheckCircle size={20} /> {isEditMode ? 'Update Medicine' : 'Save Medicine'}</>
                                        }
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MedicineForm;
