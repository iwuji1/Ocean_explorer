import { useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext"
import { useState, useEffect } from 'react'
import { supabase } from "../../supabaseClient";

import Avatar from './Avatar'
import "./Auth.css"
import UserIcon from "/user.svg"

export default function Dashboard() {
    const [loading, setLoading] = useState(true)
    const [fullname, setFullname] = useState(null)
    const [avatar_url, setAvatarUrl] = useState(null)
    const [ownedHexes, setOwnedHexes] = useState([]);
    const [totalFunded, setTotalFunded] = useState(0);
    const [fundingSummary, setFundingSummary] = useState([]);

    const {session, signOut} = UserAuth();
    const navigate = useNavigate();
    const user = session?.user || null;

     const headerAvatarSrc = (() => {
        if (!avatar_url) return UserIcon;

        if (avatar_url.startsWith("http://") || avatar_url.startsWith("https://")) {
            return avatar_url;
        }

        // treat as supabase storage path
        const { data } = supabase.storage.from("avatars").getPublicUrl(avatar_url);
        return data?.publicUrl || UserIcon;
    })();


    useEffect(() => {
        if (!user) return;

        setFullname(user?.user_metadata.full_name || '');
        setAvatarUrl(user?.user_metadata.avatar_url || null);

        (async () =>
        {
            getProfile();
            fetchOwnedHexes();
    })();
    }, [user]);

    async function getProfile() {
        if (!user) return;
        setLoading(true);

        const {data, error} = await supabase
            .from('profiles')
            .select(`full_name, avatar_url`)
            .eq('id', user.id)
            .single();

        if (error) {
            console.warn(error);
        } else if (data) {
            setFullname(data.full_name ?? '')
            setAvatarUrl(data.avatar_url ?? '')
        }
        
        setLoading(false);
    }

    async function updateProfile(event, newAvatarUrl = avatar_url) {
        event?.preventDefault();
        if (!user) return;
        setLoading(true);

        const updates = {
            id: user.id,
            full_name: fullname,
            avatar_url: newAvatarUrl,
            updated_at: new Date(),
        };

        const { error } = await supabase.from('profiles').upsert(updates);
        
        if (error) {
            alert(error.message);
        } else {
            setAvatarUrl(newAvatarUrl);
        }

        setLoading(false);
    }

    async function fetchOwnedHexes() {
        if (!user) return;

        const { data, error } = await supabase
            .from('hex_ownership')
            .select(`hex_id, amount_funded, percentage_owned, hexes(grid_id, price)`)
            .eq('user_id', user.id);

        if (error) {
            console.error("Error fetching owned hexes:", error);
            return;
        }

        const rows = data || [];

        setOwnedHexes(rows);
        const total = rows.reduce((sum, record) => sum + Number(record.amount_funded || 0), 0);
        setTotalFunded(total);
    }

    // async function getFundingSummary() {
    //     const { data, error } = await supabase
    //         .from('v_hex_funding_summary')
    //         .select('*')
    //         .eq('user_id', user.id)
    //         .single();
            
    //     if (error) {
    //         console.error("Error fetching funding summary:", error);
    //         return;
    //     }

    //     setFundingSummary(data || {});
    //     console.log("Funding Summary:", data);
    // }

    async function handleAvatarDelete() {
        if (!user) return;

        const {error} = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

        if (error) {
            console.error("Error deleting avatar URL from profile:", error);
            return;
        }

        setAvatarUrl(null);
    }

    const handleSignOut = async (e) => {
        e.preventDefault()
        try {
            await signOut()
            navigate("/")
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-inner">
            <div className="dashboard-header">
                <img className="dashboard-avatar" src={headerAvatarSrc} alt="User Avatar" />
                <div>
                <h1>Donor Portal</h1>
                <div className="avatar-detail">
                    <p>{fullname || user?.user_metadata.full_name}</p>
                    <p>{user?.email}</p>
                </div>
                </div>
            </div>

            <div className="dashboard-main">
                {/* LEFT: Profile form */}
                <div className="form-container">
                <form onSubmit={updateProfile} className="form-widget">
                    <Avatar
                    url={avatar_url}
                    size={150}
                    defaultUrl={UserIcon}
                    onUpload={(event, url) => {
                        updateProfile(event, url);
                    }}
                    onDelete={handleAvatarDelete}
                    />

                    <div>
                    <label htmlFor="email">Email </label>
                    <input id="email" type="text" value={user.email} disabled />
                    </div>

                    <div>
                    <label htmlFor="fullname">Display Name </label>
                    <input
                        id="fullname"
                        type="text"
                        required
                        value={fullname || ""}
                        onChange={(e) => setFullname(e.target.value)}
                    />
                    </div>

                    <button className="button block primary" type="submit" disabled={loading}>
                    {loading ? "Loading ..." : "Update Profile"}
                    </button>
                </form>
                <hr />
                </div>

                {/* RIGHT: Funding summary + hex grid */}
                <div className="funding-summary">
                <h3>Funding Summary</h3>
                <button onClick={() => navigate("/mainmap")}>Enter Your Map</button>
                <p>
                    <strong>Total Funded:</strong> ${totalFunded.toLocaleString()}
                </p>

                {ownedHexes.length > 0 ? (
                    <ul className="owned-hex-list">
                    {ownedHexes.map((hex, idx) => {
                        const gridId = hex.hexes?.grid_id || hex.hex_id;
                        const price = hex.hexes?.price ?? null;

                        return (
                        <li key={idx} className="owned-hex-item">
                            <p>
                            <strong>Hex:</strong> {gridId}
                            </p>
                            {price != null && (
                            <p>
                                <strong>Hex Price:</strong> $
                                {Number(price).toLocaleString()}
                            </p>
                            )}
                            <p>
                            <strong>Your Contribution:</strong> $
                            {Number(hex.amount_funded).toLocaleString()}
                            </p>
                            <p>
                            <strong>Your Ownership:</strong>{" "}
                            {Number(hex.percentage_owned).toFixed(2)}%
                            </p>
                        </li>
                        );
                    })}
                    </ul>
                ) : (
                    <p>You haven’t funded any hexes yet.</p>
                )}
                </div>
            </div>

            <button onClick={handleSignOut} className="button danger signOutbtn">
                SignOut
            </button>
            </div>
        </div>
    )
}