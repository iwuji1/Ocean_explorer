import CloseIcon from "../../assets/close_24px.svg";
import { useState, useMemo, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { supabase } from "../../supabaseClient";
import "./Ui.css";

import FunderAvatarStack from "./AvatarStack";

export default function SideMenu({selectedHex, hexFundingData, onClose, refreshFundingData, user }) {
    const [fundingAmount, setFundingAmount] = useState(0);
    const [fundingPercent, setFundingPercent] = useState(0);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [funderProfiles, setFunderProfiles] = useState([]);
    const menuRef = useRef(null);

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
        console.log("📦 hexFundingData count:", Object.keys(hexFundingData.hexData).length);
        console.log("🔎 Matching record:", Object.values(hexFundingData.hexData).find(h => h.grid_id === selectedHex?.GRID_ID));
    }, [selectedHex]);

    const selectedKey = useMemo(() => normGridId(selectedHex?.GRID_ID), [selectedHex]);


    const hexRecord = useMemo(() => {
        if (!selectedKey) return null;
        console.log("check..", hexFundingData.hexData);

        return hexFundingData?.hexData?.[selectedKey] ?? null;
    }, [selectedKey, hexFundingData?.hexData]);


    const ownershipData = useMemo(() => {
        if (!hexRecord || !hexFundingData?.ownershipData) return [];
        return hexFundingData.ownershipData.filter(
            (ownership) => ownership.hex_id === hexRecord.grid_id
        );
    }, [hexRecord, hexFundingData]);

    const totalFunded = ownershipData.reduce((sum, record) => sum + record.amount_funded, 0);

    const fundingLimits = useMemo(() => {
        if (!hexRecord) return { maxAmount: 0, maxPercent: 0, previousUserAmount: 0 };

        const price = Number(hexRecord.price || 0);
        const previousUserAmount = ownershipData.find(o => o.user_id === user?.id)?.amount_funded || 0;

        const totalFundedAll = totalFunded; // from your reduce
        const totalFundedWithoutUser = totalFundedAll - previousUserAmount;

        const maxAmount = Math.max(0, price - totalFundedWithoutUser);
        const maxPercent = price > 0 ? Math.round((maxAmount / price) * 100) : 0;

        return {
            maxAmount,
            maxPercent,
            previousUserAmount,
        };
    }, [hexRecord, ownershipData, totalFunded, user]);

    useEffect(() => {
        if (!hexRecord) return;
        // Clamp current slider if the max dropped
        if (fundingPercent > fundingLimits.maxPercent) {
            const nextPercent = fundingLimits.maxPercent;

            setFundingPercent(nextPercent);
            const clampedAmount = ((nextPercent / 100) * Number(hexRecord.price || 0));
            setFundingAmount(String(Math.round(clampedAmount)));
        }
    }, [fundingLimits.maxPercent, fundingPercent, hexRecord]);

    const percentageFunded = hexRecord ? ((totalFunded / hexRecord.funding_goal) * 100).toFixed(2) : 0;
    const safePrice = Number(hexRecord?.price || 0);
    const isFullyFunded = !!hexRecord && totalFunded >= safePrice;



    useEffect(() => {
        const fetchFunderProfiles = async () => {
            if (!ownershipData.length) {
            setFunderProfiles([]);
            return;
            }

            // unique user ids for this hex
            const userIds = Array.from(
            new Set(ownershipData.map((o) => o.user_id).filter(Boolean))
            );

            if (!userIds.length) {
            setFunderProfiles([]);
            return;
            }

            const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", userIds);

            if (error) {
            console.error("Error fetching funder profiles:", error);
            setFunderProfiles([]);
            return;
            }

            setFunderProfiles(data || []);
        };

        fetchFunderProfiles();
    }, [ownershipData]);

    useEffect(() => {
        if (!selectedHex) return;

        const raw = String(selectedHex.GRID_ID);
        const norm = normGridId(raw);

        console.log("GRID raw:", raw, "len:", raw.length);
        console.log("GRID norm:", norm, "len:", norm.length);
        console.log("codes(raw):", [...raw].map(c => c.charCodeAt(0)));
        console.log("existsInMap(norm):", !!hexFundingData?.hexData?.[norm]);
    }, [selectedHex, hexFundingData]);

    useEffect(() => {
        const run = async () => {
            const id = selectedHex?.GRID_ID;
            if (!id) return;

            const { data, error } = await supabase
            .from("hexes")
            .select("grid_id, price, total_funded")
            .eq("grid_id", id)
            .maybeSingle();

            console.log("DB lookup for clicked GRID_ID:", id, { data, error });
        };
        run();
    }, [selectedHex]);




    async function handleFundHex() {
        if (!user) {
            alert("Please log in to fund a hex.");
            return;
        }
        if (!fundingAmount || isNaN(fundingAmount) || Number(fundingAmount) <= 0) {
            alert("Please enter a valid funding amount.");
            return;
        }

        if (!hexRecord) {
            console.error("No hexRecord found for selected hex");
            return;
        }


        setLoading(true);
        setStatusMessage("");

        try {

            const price = Number(hexRecord.price || 0);
            if (!price || price <= 0) {
                setStatusMessage("This hex cannot be funded at this time.");
                setLoading(false);
                return;
            }


            const existing = ownershipData.find(own => own.user_id === user.id);
            const previousUserAmount = existing ? existing.amount_funded : 0;
            const totalFundedAll = totalFunded;
            const totalFundedWithoutUser = totalFundedAll - previousUserAmount;

            const desiredAmount = Number(fundingAmount);

            const newUserAmount = Math.min(desiredAmount, fundingLimits.maxAmount);
            if (fundingLimits.maxAmount <= 0) {
                setStatusMessage("This hex is already fully funded.");
                return;
            }
            const rawPercentage = (newUserAmount / price) * 100;
            const percentage = Number(rawPercentage.toFixed(2));

            if (newUserAmount !== desiredAmount) {
                setFundingAmount(newUserAmount.toFixed(0));
                setFundingPercent(
                    Math.round((newUserAmount / price) * 100)
                );
            }

            if (newUserAmount === previousUserAmount) {
                setStatusMessage("No change in funding amount.");
                return;
            }

            const hexKey = hexRecord.grid_id;
            const delta = newUserAmount - previousUserAmount;

            console.log("hexKey:", hexKey, typeof hexKey, "userId:", user.id, typeof user.id);
            console.log({
                previousUserAmount,
                newUserAmount,
                totalFundedAll,
                totalFundedWithoutUser,
                delta,
            });

            let ownershipError;
            if (existing) {
                // Update existing record
                const { error } = await supabase
                    .from('hex_ownership')
                    .update({ 
                        amount_funded: newUserAmount,
                        percentage_owned: percentage
                    })
                    .eq('hex_id', hexKey)
                    .eq('user_id', user.id);
                ownershipError = error;
            } else {
                // Insert new record
                 const { error } = await supabase
                    .from('hex_ownership')
                    .insert({ 
                        hex_id: hexKey,
                        user_id: user.id,
                        amount_funded: newUserAmount,
                        percentage_owned: percentage
                    });
                ownershipError = error;
            }

            if (ownershipError) {
                console.error("Supabase hex_ownership error:", ownershipError);
                setStatusMessage(ownershipError.message || "Error funding hex. Please try again.");
                return;
            }

            const currentTotal = Number(hexRecord.total_funded || 0);
            let newTotal = currentTotal + delta;

            newTotal = Math.max(0, Math.min(newTotal, price));

            const {data: updated, error: hexesError } = await supabase
                .from("hexes")
                .update({ total_funded: newTotal })
                .eq("grid_id", hexKey)
                .select("grid_id, total_funded");

            console.log("hexes update result:", { updated, hexesError });

            if (hexesError) {
                console.error("Error updating hex total_funded:", hexesError);
                setStatusMessage(hexesError.message || "Error updating hex funding. Please try again.");
                setLoading(false);
                return;
            }

            setStatusMessage(
                newTotal >= price ? "Hex Fully Funded" : "Funding successful!"
            );
   
            await refreshFundingData();
            setFundingAmount(String(newUserAmount.toFixed(0)));
            setFundingPercent(Math.round((newUserAmount / price) * 100));

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

    function normGridId(v) {
      return String(v ?? "")
        .normalize("NFKC")
        .replace(/\u00A0/g, " ")   // NBSP -> space
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width chars
        .trim()
        .toLowerCase();
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
                <p><strong>Total Funded:</strong> ${Number(totalFunded || 0).toLocaleString()} ({percentageFunded}%)</p>
                <p><strong>Funding Progress:</strong> {fundingPercent}%</p>

            {/* Progress Bar */}

            <div className="progress-bar-container">
                <div className="progress-fill" style={{ width: `${fundingPercent}%` }}/>
            </div>
            </div>
            <h4>Current Funders</h4>
            {funderProfiles.length > 0 ? (
                <div>
                <FunderAvatarStack profiles={funderProfiles} maxShown={5} />
                <p className="funder-count">
                    {funderProfiles.length} funder{funderProfiles.length > 1 ? "s" : ""} so far
                </p>
                </div>
            ) : (
                <p>No funders yet. Be the first to fund this hex!</p>
            )}
            <hr />
            <div className="fundHex">
            <h4>Fund this Hex</h4>
            <input
                type="range"
                min="0"
                max={fundingLimits.maxPercent}
                step="5"
                value={fundingPercent}
                disabled={isFullyFunded}
                onChange={(e) => {
                    const percent = Number(e.target.value);
                    setFundingPercent(percent);
                    const calculatedAmount = (percent / 100) * safePrice;
                    const clamped = Math.min(calculatedAmount, fundingLimits.maxAmount);
                    setFundingAmount(Math.round(clamped));
                }}
            />
            {isFullyFunded ? (
                <p className="slider-label" style={{ color: "#00fff2" }}>
                    This hex is fully funded.
                </p>
            ) : (
            <p className="slider-label">
                Funding: <strong>${Number(fundingAmount || 0).toLocaleString()}</strong>
                &nbsp;({fundingPercent}%)
            </p>
            )}

            <button onClick={handleFundHex} disabled={loading || isFullyFunded}>
                {isFullyFunded ? "Hex Fully Funded" : loading ? "Processing..." : "Fund Hex"}
            </button>
            {statusMessage && <p>{statusMessage}</p>}
            </div>
        </div>
        )
}
