import CloseIcon from "../../assets/close_24px.svg";
import { useState, useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { supabase } from "../../supabaseClient";
import "./Ui.css";

export default function SideMenu({selectedHex, hexFundingData, onClose, refreshFundingData, user }) {
    const [fundingAmount, setFundingAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const menuRef = useRef(null);

    const layerToTableMap = {
        h5_family: "hexes_h5",
        h6_family: "hexes_h6",
        h7_family: "hexes_h7",
    };

    const tableName = layerToTableMap[selectedHex?.layerLevel] || "nope";

    useEffect(() => {
        const menu= menuRef.current;
        if(!menu) return;
        
        if (selectedHex) {
            gsap.killTweensOf(menu);
            gsap.fromTo(
                menuRef.current,
                    { x: "100%", opacity: 0 },
                    { x: "0%", opacity: 1, duration: 0.8, ease: "power3.out" }
            );
        } else {
            gsap.to(menu, {
                x: "100%",
                scale: 0.98,
                opacity: 0,
                duration: 0.6,
                ease: "power2.in",
            });
        }
    }, [selectedHex]);

    useEffect(() => {
        if (menuRef.current && selectedHex) {
            menuRef.current.style.display = "block";
        }
    }, [selectedHex]);

    useEffect(() => {
        console.log("🧩 Selected Hex:", selectedHex);
        console.log("🧭 TableName:", tableName);
        console.log("📦 hexFundingData count:", Object.keys(hexFundingData.hexData).length);
        console.log("🔎 Matching record:", Object.values(hexFundingData.hexData).find(h => h.grid_id === selectedHex?.GRID_ID));
    }, [selectedHex]);

    const hexRecord = useMemo(() => {
        if (!hexFundingData?.hexData || !selectedHex?.GRID_ID) return null;
        console.log("Searching for hex record...", selectedHex?.GRID_ID, tableName);
        console.log("check..", hexFundingData.hexData);

        return Object.values(hexFundingData.hexData).find(
            (hex) => hex.grid_id?.toLowerCase() === selectedHex?.GRID_ID?.toLowerCase()
        );
    }, [selectedHex, hexFundingData, tableName]);

    const ownershipData = useMemo(() => {
        if (!hexRecord || !hexFundingData?.ownershipData) return [];
        return hexFundingData.ownershipData.filter(
            (ownership) => ownership.hex_id === hexRecord.id
        );
    }, [hexRecord, hexFundingData]);

    const totalFunded = ownershipData.reduce((sum, record) => sum + record.amount_funded, 0);
    const percentageFunded = hexRecord ? ((totalFunded / hexRecord.funding_goal) * 100).toFixed(2) : 0;

    async function handleFundHex() {
        if (!user) {
            alert("Please log in to fund a hex.");
            return;
        }
        if (!fundingAmount || isNaN(fundingAmount) || Number(fundingAmount) <= 0) {
            alert("Please enter a valid funding amount.");
            return;
        }
        setLoading(true);
        setStatusMessage("");

        try {
            const existing = ownershipData.find(own => own.user_id === user.id);
            const amount = parseFloat(fundingAmount);
            const percentage = ((amount / hexRecord.price) * 100).toFixed(2);
            
            if (existing) {

                const newAmount = existing.amount_funded + amount;
                const newPercentage = ((newAmount / hexRecord.price) * 100).toFixed(2);

                await supabase
                    .from('hex_ownership')
                    .update({ amount_funded: newAmount, percentage_owned: newPercentage })
                    .eq('hex_id', hexRecord.id)
                    .eq('user_id', user.id);
            } else {
                await supabase
                    .from('hex_ownership')
                    .insert([{ hex_id: hexRecord.id, user_id: user.id, amount_funded: amount, percentage_owned: percentage }]);
            }

            const newTotal = (hexRecord.totalFunded || 0) + amount;
            await supabase
                .from(tableName)
                .update({ totalFunded: newTotal })
                .eq('id', hexRecord.id);

            setStatusMessage("Funding successful!");
            setFundingAmount("");
            await refreshFundingData();

            // 💠 GSAP pulse effect
            gsap.fromTo(
            ".progress-fill",
            { scaleX: 0.9, transformOrigin: "left center", filter: "brightness(1.2)" },
            {
                scaleX: 1,
                filter: "brightness(2)",
                duration: 0.4,
                yoyo: true,
                repeat: 1,
                ease: "power1.inOut",
            }
            );


        } catch (error) {
            console.error("Error funding hex:", error);
            setStatusMessage("Error funding hex. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (!selectedHex) return null;
    if (!hexRecord) 
        return (
            <div className="sideMenu" ref={menuRef}>
                <button className="close-button" onClick={onClose}>
                    <img src={CloseIcon} alt="Close" />
                </button>
                <p>Loading hex data...</p>
            </div>
        );
        
    return (
        <div className="sideMenu" ref={menuRef}>
            <button className="close-button" onClick={onClose}>
                <img src={CloseIcon} alt="Close" />
            </button>
            <h3>Hex Details</h3>
            <div className="hex-details">
                <p><strong>Hex ID: </strong>{selectedHex.GRID_ID}</p>
                <p><strong>Mean Depth: </strong>{selectedHex.MEAN}</p>
                <p><strong>Wrecks or Obstructions </strong>{selectedHex.wrecks_or_obstructions}</p>
            </div>
            <hr />
            <div className="fundingCard">
                <p><strong>Price:</strong> ${hexRecord.price?.toLocaleString()}</p>
                <p><strong>Total Funded:</strong> ${totalFunded.toLocaleString()} ({percentageFunded}%)</p>
                <p><strong>Funding Progress:</strong> {percentageFunded}%</p>

            {/* Progress Bar */}

            <div className="progress-bar-container">
                <div className="progress-fill" style={{ width: `${percentageFunded}%` }}/>
            </div>
            </div>
            <h4>Current Funders</h4>
            {ownershipData.length > 0 ? (
                <ul className="funderList">
                    {ownershipData.map((owner, idx) => (
                        <li key={idx}>
                            User: {owner.user_id} - Funded: ${owner.amount_funded.toLocaleString()} ({owner.percentage_owned}%)
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No funders yet. Be the first to fund this hex!</p>
            )}
            <hr />
            <div className="fundHex">
            <h4>Fund this Hex</h4>
            <input
                type="number"
                placeholder="Enter amount to fund"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
            />
            <button onClick={handleFundHex} disabled={loading}>
                {loading ? "Processing..." : "Fund Hex"}
            </button>
            {statusMessage && <p>{statusMessage}</p>}
            </div>
        </div>
        )
}
