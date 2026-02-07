import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Pill, Package, Calendar, CheckCircle, Menu, Home, Settings } from "lucide-react";
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
                // Convert date to YYYY-MM-DD format for input
                if (medicine.expiry) {
                    const date = new Date(medicine.expiry);
                    const formattedDate = date.toISOString().split('T')[0];
                    setExpiryDate(formattedDate);
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
            {/* Sidebar - Visual Consistency */}
            {/* Sidebar - Visual Consistency */}
            <aside className="sidebar">
                <Menu className="sidebar-icon" size={24} />
                <Home
                    className="sidebar-icon"
                    size={24}
                    onClick={() => navigate('/dashboard')}
                    title="Home"
                />
                <Package
                    className="sidebar-icon active"
                    size={24}
                    title="Inventory"
                />
                <Settings className="sidebar-icon" size={24} />
            </aside>

            <div className="form-main">
                <div className="form-card">
                    <Link to="/dashboard" className="btn-back">
                        <ArrowLeft size={20} /> Back
                    </Link>

                    <div className="form-header">
                        <h2>{isEditMode ? 'Edit Medicine' : 'Add Medicine'}</h2>
                        <p>{isEditMode ? 'Update medicine information' : 'Update your inventory with new stock'}</p>
                    </div>

                    {isLoading ? (
                        <div className="loading-state">
                            <span className="spinner"></span>
                            <p>Loading medicine data...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {error && <div className="error-message">{error}</div>}

                            <div className="form-group">
                                <label className="form-label">Medicine Name</label>
                                <div className="input-wrapper">
                                    <Pill size={20} />
                                    <input
                                        type="text"
                                        placeholder="e.g. Paracetamol"
                                        className="form-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Stock Available</label>
                                <div className="input-wrapper">
                                    <Package size={20} />
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
                                    <Package size={20} />
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

                            <div className="form-group">
                                <label className="form-label">Batch Number</label>
                                <div className="input-wrapper">
                                    <Pill size={20} />
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
                                <label className="form-label">Supplier Name</label>
                                <div className="input-wrapper">
                                    <Package size={20} />
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
                                    <Calendar size={20} />
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button className="btn-submit" disabled={isSaving}>
                                {isSaving ? <span className="spinner"></span> : <><CheckCircle size={20} /> {isEditMode ? 'Update Medicine' : 'Save Medicine'}</>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MedicineForm;
