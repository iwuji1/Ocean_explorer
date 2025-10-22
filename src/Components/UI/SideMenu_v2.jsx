
import CloseIcon from "../../assets/close_24px.svg";
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "./Ui.css";

export default function SideMenu({selectedHex, hexFundingData, onClose, refreshFundingData, user }) {
    const [fundingData, setFundingData] = useState([]);
    const [hexRecord, setHexRecord] = useState(null);
    const [fundingAmount, setFundingAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        if (!selectedHex || !hexFundingData) return;
        
        const hex = Object.values(hexFundingData.hexData).find(h => h.grid_id === selectedHex.GRID_ID);
        setHexRecord(hex || null);

        const ownershipData = hexFundingData.ownershipData.filter(own => own.hex_id === (hex ? hex.id : null));
        setFundingData(ownershipData);
    }, [selectedHex, hexFundingData]);

    async function fetchHexFunding() {
        try {
            const { data: hex} = await supabase
            .from("hexes_h5")
            .select("*")
            .eq("grid_id", selectedHex.GRID_ID)
            .single();

            setHexRecord(hex);

            if (hex) {
                const { data: ownershipData, error: ownershipError } = await supabase
                .from("hex_ownership")
                .select("user_id, amount_funded, percentage_owned")
                .eq("hex_id", hex.id);
                setFundingData(ownershipData || []);
            }
        } catch (error) {
            console.error("Error fetching funding data:", error.message);
        }
    }

    async function handleFundHex() {
        if (!user) {
            alert("You must be logged in to fund a hex.");
            return;
        }
        if (!fundingAmount || isNaN(fundingAmount) || fundingAmount <= 0) {
            alert("Please enter a valid funding amount.");
            return;
        }

        setLoading(true);
        setStatusMessage("");

        try {
            const existing = fundingData.find(fund => fund.user_id === user.id);
            const amount = parseFloat(fundingAmount);
            const percentage = ((amount / hexRecord.price) * 100).toFixed(2);

            if (existing) {
                // Update existing record 
                const newAmount = existing.amount_funded + amount;
                const newPercentage = (parseFloat(existing.percentage_owned) + parseFloat(percentage)).toFixed(2);
                
                await supabase.from("hex_ownership").update({
                    amount_funded: newAmount,
                    percentage_owned: newPercentage,
                }).eq("user_id", user.id).eq("hex_id", hexRecord.id);

            } else {
                // Insert new record
                await supabase.from("hex_ownership").insert([
                    {
                        user_id: user.id,
                        hex_id: hexRecord.id,
                        amount_funded: amount,
                        percentage_owned: percentage,
                    },
                ]);
            }
            
            // Update total funded in hexes_h5 table

            const newTotalFunded = (hexRecord.total_funded || 0) + amount;
            await supabase.from("hexes_h5").update({
                total_funded: newTotalFunded,
            }).eq("id", hexRecord.id);

            setFundingAmount("");
            setStatusMessage("✅ Thank you for funding this hex!");
            await refreshFundingData();
            fetchHexFunding();
        } catch (error) {
            console.error("Error processing funding:", error.message);
            setStatusMessage("There was an error processing your funding. Please try again.");
        } finally {
            setLoading(false);
        }
    }


    if (!selectedHex) return <div className="p-4">Select a hex to see details</div>;

    return (
        <div className="sideMenu">
            <button onClick={onClose} className="closeBtn">
                <img src={CloseIcon} alt="Close" style={{ width: 24, height: 24 }} />
            </button>
            <h3>Hex Details</h3>
            <p><strong>Hex ID: </strong>{selectedHex.GRID_ID}</p>
          <p><strong>Avg Depth: </strong>{selectedHex.COUNT}</p>
          <p><strong>Avg Depth: </strong>{selectedHex.MEAN}</p>
          <p><strong>Wrecks or Obs: </strong>{selectedHex.wrecks_or_obstructions}</p>
    { hexRecord && (<>
        <p><strong>Price: </strong>${hexRecord.price?.toLocaleString()}</p>
        <p><strong>Total Funded: </strong>${(hexRecord.total_funded || 0).toLocaleString()}</p>
        <p><strong>Funding Progress: </strong>{hexRecord.price > 0 ? (((hexRecord.total_funded || 0) / hexRecord.price) * 100).toFixed(2) : 0}%</p>
        <div className="progressBar">
            <div className="progress-fill" style={{ width: `${percentageFunded}%`, background: percentageFunded >= 100 ? "#4CAF50" : "#44DBDA" }}></div>
        </div>
        <h4>Current Funders</h4>
        {fundingData.length > 0 ? (
            <ul>
                {fundingData.map((owner, idx) => (
                    <li key={idx}>
                        User: <strong>{owner.user_id}</strong> - Funded: <strong>${owner.amount_funded.toLocaleString()}</strong> ({owner.percentage_owned}%)
                    </li>
                ))}
            </ul>
        ) : (
            <p>No current funders for this hex.</p>
        )}

        <h4>Fund this Hex</h4>
        <input type="number" value={fundingAmount} onChange={(e) => setFundingAmount(e.target.value)}
        placeholder="Enter amount"
        />
        <button className="buyHexbtn" onClick={handleFundHex} disabled={loading}>
            {loading ? "Processing..." : "Fund this Hex"}
        </button>
        {statusMessage && <p className={`statusMessage ${statusMessage.startsWith("✅") ? "success" : "error"}`}>
            {statusMessage}
        </p>}
    </>
)}
            
        </div>
    )

    // const ownershipData = hexFundingData?.ownershipData.filter(own => own.hex_id === selectedHex.GRID_ID) || [];

    // const totalFunded = ownershipData.reduce((sum, o) => sum + (o.amount_funded || 0), 0);
    // const hexPrice = selectedHex.price || 0; // Default price if not provided
    // const percentageFunded = hexPrice > 0 ? ((totalFunded / hexPrice) * 100).toFixed(2) : 0;

    // const handleFundHex = async () => {
    //     if (!user) {
    //         setStatusMessage("You must be logged in to fund a hex.");
    //         return;
    //     }
    //     if (!fundingAmount || isNaN(fundingAmount) || fundingAmount <= 0) {
    //         setStatusMessage("Please enter a valid funding amount.");
    //         return;
    //     }

    //     setIsFunding(true);
    //     setStatusMessage("Processing your funding...");

    //     try {
    //         const percentageOwned = ((fundingAmount / hexPrice) * 100).toFixed(2);

    //         const { error } = await supabase.from("hex_ownership").insert([
    //             {
    //                 hex_id: selectedHex.GRID_ID,
    //                 user_id: user.id,
    //                 amount_funded: parseFloat(fundingAmount),
    //                 percentage_owned: parseFloat(percentageOwned),
    //             },
    //         ]);

    //         if (error) {
    //             throw error;
    //         }

    //         setStatusMessage("Thank you for funding this hex!");

    //         if (refreshFundingData) await refreshFundingData();
    //     } catch (error) {
    //         console.error("Error funding hex:", error.message);
    //         setStatusMessage("There was an error processing your funding. Please try again.");
    //     } finally {
    //         setIsFunding(false);
    //     }
    // };

    // return (
    //     <div 
    //     className="sideMenu"
    //     style={{
    //         position: 'absolute',
    //         top: 20,
    //         right: 0,
    //         width: '300px',
    //         height: '70vh',
    //         backgroundColor: "#fff",
    //         padding: "20px",
    //         overflowY: "auto",
    //         zIndex: 30,
    //         boxShadow: "-2px 0 5px rgba(0,0,0,0.2)"
    //         }}>
    //             <button
    //                 onClick={onClose}
    //                 style={{
    //                 position: "absolute",
    //                 top: 10,
    //                 right: 10,
    //                 background: "none",
    //                 border: "none",
    //                 fontSize: "1.5rem",
    //                 cursor: "pointer",
    //                 }}>
    //                 <img src={CloseIcon} alt="Close" style={{ width: 24, height: 24 }} />
    //             </button>

    //         <h3>Hex Details</h3>
    //         <div>
    //             <p><strong>Hex ID: </strong>{selectedHex.GRID_ID}</p>
    //             <p><strong>Avg Depth: </strong>{selectedHex.COUNT}</p>
    //             <p><strong>Avg Depth: </strong>{selectedHex.MEAN}</p>
    //             <p><strong>Wrecks or Obs: </strong>{selectedHex.wrecks_or_obstructions}</p>
    //             <p><strong>Price: </strong>${selectedHex.price?.toLocaleString()}</p>
    //             <p><strong>Total Funded: </strong>${totalFunded.toLocaleString()}</p>
    //             <p><strong>Funding Progress: </strong>{percentageFunded}%</p>
    //         </div>
    //         {/* Progress Bar */}
    //         <div
    //             style={{
    //             width: "100%",
    //             height: "10px",
    //             background: "#eee",
    //             borderRadius: "5px",
    //             overflow: "hidden",
    //             marginTop: "8px",
    //             marginBottom: "16px",
    //             }}
    //         >
    //             <div
    //             style={{
    //                 width: `${percentageFunded}%`,
    //                 height: "100%",
    //                 background: percentageFunded >= 100 ? "#4CAF50" : "#44DBDA",
    //                 transition: "width 0.3s ease",
    //             }}
    //             />
    //         </div>
    //         {ownershipData.length > 0 ? (
    //             <div>
    //                 <h4>Current Backers</h4>
    //                 <ul>
    //                     {ownershipData.map((owner) => (
    //                         <li key={idx}>
    //                             User: <strong>{owner.user_id}</strong> - Funded: <strong>${owner.amount_funded.toLocaleString()}</strong> ({owner.percentage_owned}%)
    //                         </li>
    //                     ))}
    //                 </ul>
    //             </div>
    //         ) : (
    //         <p>No current backers for this hex.</p>
    //         )}

    //         <div>
    //             <label>
    //             Enter Funding Amount: $
    //             </label>
    //             <input
    //                 type="number"
    //                 value={fundingAmount}
    //                 onChange={(e) => setFundingAmount(e.target.value)}
    //                 placeholder="e.g. 500"
    //                 />
    //         <button 
    //         className="buyHexbtn" 
    //         disabled={isFunding}
    //         onClick={handleFundHex}
    //         >
    //             {isFunding ? "Processing..." : "Fund this Hex"}
    //         </button>
    //         {statusMessage && <p 
    //             style={{
    //             marginTop: "10px",
    //             color: statusMessage.startsWith("✅") ? "green" : "red",
    //             fontSize: "0.85rem",
    //             }}>
    //             {statusMessage}
    //             </p>}
    //             </div>
    //         </div>
    
    // )
}