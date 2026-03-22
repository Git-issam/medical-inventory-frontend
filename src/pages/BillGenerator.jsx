import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Printer, Download, FileText, Tag } from "lucide-react";
import medicineService from "../services/medicineService";
import authService from "../services/authService";
import signatureImg from "../assets/signature.jpg";
import "./BillGenerator.css";

function BillGenerator() {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedicines, setSelectedMedicines] = useState([]);
    const [customerDetails, setCustomerDetails] = useState({
        name: "",
        contact: "",
        address: ""
    });
    const [showBill, setShowBill] = useState(false);
    const [billNumber, setBillNumber] = useState("");
    const [billDiscount, setBillDiscount] = useState(0); // Overall bill discount %
    const [billData, setBillData] = useState(null); // Bill summary returned from API

    useEffect(() => {
        fetchMedicines();
        generateBillNumber();
    }, []);

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const medicinesData = await medicineService.getAllMedicines();
            // Filter out expired medicines
            const availableMedicines = medicinesData.filter(med => {
                const expiryDate = new Date(med.expiry);
                return expiryDate > new Date() && med.stock > 0;
            });
            setMedicines(availableMedicines);
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

    const generateBillNumber = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        setBillNumber(`BILL-${timestamp}-${random}`);
    };

    const addMedicineRow = () => {
        setSelectedMedicines([
            ...selectedMedicines,
            { medicineId: "", quantity: 1, price: 0, discount: 0 }
        ]);
    };

    const removeMedicineRow = (index) => {
        const updated = selectedMedicines.filter((_, i) => i !== index);
        setSelectedMedicines(updated);
    };

    const updateMedicineRow = (index, field, value) => {
        const updated = [...selectedMedicines];
        updated[index][field] = value;

        // If medicine is selected, auto-fill price from actual medicine data
        if (field === "medicineId" && value) {
            const medicine = medicines.find(m => m.id === parseInt(value));
            if (medicine) {
                updated[index].price = medicine.price !== undefined ? medicine.price : 0;
            }
        }

        setSelectedMedicines(updated);
    };

    // Per-item net = price * qty * (1 - discount/100)
    const calculateItemNet = (item) => {
        const gross = item.quantity * item.price;
        return gross - (gross * (item.discount || 0)) / 100;
    };

    // Subtotal before bill discount
    const calculateSubtotal = () => {
        return selectedMedicines.reduce((total, item) => total + calculateItemNet(item), 0);
    };

    // Grand total after bill discount
    const calculateGrandTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal - (subtotal * (billDiscount || 0)) / 100;
    };

    const handleGenerateBill = async () => {
        if (!customerDetails.name || selectedMedicines.length === 0) {
            alert("Please fill customer details and add at least one medicine");
            return;
        }

        // Validate all medicines are selected
        const hasEmptyMedicine = selectedMedicines.some(item => !item.medicineId);
        if (hasEmptyMedicine) {
            alert("Please select medicine for all rows");
            return;
        }

        // Validate discount values
        if (billDiscount < 0 || billDiscount > 100) {
            alert("Bill discount must be between 0 and 100");
            return;
        }

        // Dispense medicines and deduct stock via API (new format with discounts)
        try {
            const response = await medicineService.dispenseMedicines({
                billNumber,
                customerName: customerDetails.name,
                customerContact: customerDetails.contact,
                items: selectedMedicines.map(item => ({
                    id: parseInt(item.medicineId),
                    quantity: item.quantity,
                    discount: parseFloat(item.discount) || 0
                })),
                billDiscount: parseFloat(billDiscount) || 0
            });
            // Store bill summary from API (or compute locally as fallback)
            setBillData(response?.bill || null);
            setShowBill(true);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to generate bill. Please check stock levels.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        window.print();
    };

    const getMedicineName = (medicineId) => {
        const medicine = medicines.find(m => m.id === parseInt(medicineId));
        return medicine ? medicine.name : "";
    };

    const getMedicineBatch = (medicineId) => {
        const medicine = medicines.find(m => m.id === parseInt(medicineId));
        return medicine ? medicine.batchNo : "";
    };

    // ── Bill Preview ─────────────────────────────────────────────────────────
    if (showBill) {
        // Use API-calculated values if available, otherwise fall back to local calc
        const totalBeforeItemDisc = selectedMedicines.reduce((s, i) => s + i.quantity * i.price, 0);
        const itemDiscTotal = selectedMedicines.reduce((s, i) => {
            const gross = i.quantity * i.price;
            return s + (gross * (i.discount || 0)) / 100;
        }, 0);
        const afterItemDisc = totalBeforeItemDisc - itemDiscTotal;
        const billDiscAmt = (afterItemDisc * (billDiscount || 0)) / 100;
        const grandTotal = afterItemDisc - billDiscAmt;

        return (
            <div className="bill-container">
                <div className="bill-actions no-print">
                    <button className="btn-back" onClick={() => setShowBill(false)}>
                        <ArrowLeft size={18} />
                        Edit Bill
                    </button>
                    <div className="action-buttons">
                        <button className="btn-print" onClick={handlePrint}>
                            <Printer size={18} />
                            Print
                        </button>
                        <button className="btn-download" onClick={handleDownload}>
                            <Download size={18} />
                            Download
                        </button>
                    </div>
                </div>

                <div className="bill-document">
                    <div className="bill-header">
                        <div className="clinic-info">
                            <h1>HealthHub</h1>
                            <p>123 Health Street, Medical District</p>
                            <p>Phone: +91 98765 43210 | Email: info@healthhub.com</p>
                            <p>License No: MED-2024-12345</p>
                        </div>
                        <div className="bill-meta">
                            <h2>INVOICE</h2>
                            <p><strong>Bill No:</strong> {billNumber}</p>
                            <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
                            <p><strong>Time:</strong> {new Date().toLocaleTimeString('en-IN')}</p>
                        </div>
                    </div>

                    <div className="bill-customer">
                        <h3>Customer Details</h3>
                        <p><strong>Name:</strong> {customerDetails.name}</p>
                        <p><strong>Contact:</strong> {customerDetails.contact}</p>
                        {customerDetails.address && <p><strong>Address:</strong> {customerDetails.address}</p>}
                    </div>

                    <table className="bill-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Medicine Name</th>
                                <th>Batch No</th>
                                <th>Qty</th>
                                <th>Price (₹)</th>
                                <th>Disc %</th>
                                <th>Disc Amt (₹)</th>
                                <th>Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedMedicines.map((item, index) => {
                                const gross = item.quantity * item.price;
                                const discAmt = (gross * (item.discount || 0)) / 100;
                                const net = gross - discAmt;
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{getMedicineName(item.medicineId)}</td>
                                        <td>{getMedicineBatch(item.medicineId)}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{item.price.toFixed(2)}</td>
                                        <td>{item.discount || 0}%</td>
                                        <td>₹{discAmt.toFixed(2)}</td>
                                        <td>₹{net.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="7" className="text-right">Subtotal (after item discounts):</td>
                                <td>₹{afterItemDisc.toFixed(2)}</td>
                            </tr>
                            {billDiscount > 0 && (
                                <tr>
                                    <td colSpan="7" className="text-right">Bill Discount ({billDiscount}%):</td>
                                    <td>- ₹{billDiscAmt.toFixed(2)}</td>
                                </tr>
                            )}
                            <tr className="grand-total-row">
                                <td colSpan="7" className="text-right"><strong>Grand Total:</strong></td>
                                <td><strong>₹{grandTotal.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="bill-footer">
                        <div className="terms">
                            <h4>Terms &amp; Conditions:</h4>
                            <ul>
                                <li>All medicines are non-returnable</li>
                                <li>Please check expiry date before use</li>
                                <li>Keep medicines away from children</li>
                                <li>Store in cool and dry place</li>
                            </ul>
                        </div>
                        <div className="signature">
                            <img
                                src={signatureImg}
                                alt="Authorized Signature"
                                className="signature-img"
                            />
                            <p>Authorized Signature</p>
                        </div>
                    </div>

                    <div className="bill-thank-you">
                        <p>Thank you for your business!</p>
                        <p className="tagline">Your health is our priority</p>
                        <p className="powered-by">Powered by Pharmetix</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Bill Form ────────────────────────────────────────────────────────────
    return (
        <div className="bill-generator-container">
            <div className="bill-gen-header">
                <button className="btn-back" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>
                <h1 className="page-title">
                    <FileText size={28} />
                    Generate Bill
                </h1>
            </div>

            <div className="bill-form-container">
                {/* Customer Details Section */}
                <div className="form-section">
                    <h2 className="section-title">Customer Details</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Customer Name *</label>
                            <input
                                type="text"
                                placeholder="Enter customer name"
                                value={customerDetails.name}
                                onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Contact Number *</label>
                            <input
                                type="tel"
                                placeholder="Enter contact number"
                                value={customerDetails.contact}
                                onChange={(e) => setCustomerDetails({ ...customerDetails, contact: e.target.value })}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Address (Optional)</label>
                            <input
                                type="text"
                                placeholder="Enter address"
                                value={customerDetails.address}
                                onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Medicine Selection Section */}
                <div className="form-section">
                    <div className="section-header">
                        <h2 className="section-title">Select Medicines</h2>
                        <button className="btn-add-row" onClick={addMedicineRow}>
                            <Plus size={18} />
                            Add Medicine
                        </button>
                    </div>

                    {selectedMedicines.length === 0 ? (
                        <div className="empty-medicine-state">
                            <FileText size={48} className="empty-icon" />
                            <p>No medicines added yet</p>
                            <button className="btn-add-first" onClick={addMedicineRow}>
                                <Plus size={18} />
                                Add First Medicine
                            </button>
                        </div>
                    ) : (
                        <div className="medicine-table-wrapper">
                            <table className="medicine-selection-table">
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Quantity</th>
                                        <th>Price (₹)</th>
                                        <th>Discount %</th>
                                        <th>Net (₹)</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedMedicines.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <select
                                                    value={item.medicineId}
                                                    onChange={(e) => updateMedicineRow(index, "medicineId", e.target.value)}
                                                    className="medicine-select"
                                                >
                                                    <option value="">Select Medicine</option>
                                                    {medicines.map((med) => (
                                                        <option key={med.id} value={med.id}>
                                                            {med.name} (Stock: {med.stock})
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => updateMedicineRow(index, "quantity", parseInt(e.target.value) || 1)}
                                                    className="quantity-input"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.price}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => updateMedicineRow(index, "price", parseFloat(e.target.value) || 0)}
                                                    className="price-input"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.5"
                                                    value={item.discount || 0}
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => updateMedicineRow(index, "discount", parseFloat(e.target.value) || 0)}
                                                    className="discount-input"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="total-cell">
                                                ₹{calculateItemNet(item).toFixed(2)}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-remove"
                                                    onClick={() => removeMedicineRow(index)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Total and Generate Button */}
                {selectedMedicines.length > 0 && (
                    <div className="bill-summary">
                        <div className="total-section">
                            <div className="summary-line">
                                <span>Subtotal (after item discounts):</span>
                                <span>₹{calculateSubtotal().toFixed(2)}</span>
                            </div>

                            {/* Overall Bill Discount */}
                            <div className="summary-line bill-discount-row">
                                <label className="bill-discount-label">
                                    <Tag size={16} />
                                    Overall Bill Discount (%):
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={billDiscount}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => setBillDiscount(parseFloat(e.target.value) || 0)}
                                    className="bill-discount-input"
                                    placeholder="0"
                                />
                            </div>

                            {billDiscount > 0 && (
                                <div className="summary-line discount-line">
                                    <span>Bill Discount ({billDiscount}%):</span>
                                    <span>- ₹{((calculateSubtotal() * billDiscount) / 100).toFixed(2)}</span>
                                </div>
                            )}

                            <div className="summary-line grand-total-line">
                                <h3>Grand Total:</h3>
                                <div className="total-amount">₹{calculateGrandTotal().toFixed(2)}</div>
                            </div>
                        </div>
                        <button className="btn-generate-bill" onClick={handleGenerateBill}>
                            <FileText size={20} />
                            Generate Bill
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BillGenerator;
