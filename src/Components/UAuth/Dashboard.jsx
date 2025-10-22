import { useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext"
import { useState, useEffect } from 'react'
import { supabase } from "../../supabaseClient";

import Avatar from './Avatar'
import "./Auth.css"

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

    useEffect(() => {
        if (!user) {
            getProfile();
            fetchOwnedHexes();
            getFundingSummary();
    }
    }, [user]);

    async function getProfile() {
        setLoading(true)
        const {data, error} = await supabase
        .from('profiles')
        .select(`full_name, avatar_url`)
        .eq('id', user.id)
        .single();

        if (error) console.warn(error);
        else if (data) {
            setFullname(data.full_name)
            setAvatarUrl(data.avatar_url)
        }
        
        setLoading(false);
    }

    async function fetchOwnedHexes() {
        const { data, error } = await supabase
            .from('hex_ownership')
            .select(`hex_id, amount_funded, percentage_owned, hexes_h5(grid_id, price)`)
            .eq('user_id', user.id);

        if (error) {
            console.error("Error fetching owned hexes:", error);
            return;
        }

        setOwnedHexes(data || []);
        const total = data.reduce((sum, record) => sum + record.amount_funded, 0);
        setTotalFunded(total);
    }

    async function updateProfile(event, avatarUrl) {
        event?.preventDefault();
        setLoading(true);

        const updates = {
            id: user.id,
            full_name: fullname,
            avatar_url: newAvatarUrl || avatarUrl,
            updated_at: new Date(),
        };

        const { error } = await supabase.from('profiles').upsert(updates);
        
        if (error) {
            alert(error.message);
        } else {
            setAvatarUrl(avatarUrl);
        }

        setLoading(false);
    }

    async function getFundingSummary() {
        const { data, error } = await supabase
            .from('v_user_funding_summary')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
        if (error) {
            console.error("Error fetching funding summary:", error);
            return;
        }

        setFundingSummary(data || {});
        console.log("Funding Summary:", data);
    }

    async function handleAvatarDelete() {
        await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

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
            <h1>Dashboard</h1>
            <h2>Welcome, {fullname || user?.email}</h2>
            <div className="form-container">
            <form onSubmit={updateProfile} className="form-widget">
                <Avatar
                    url={avatar_url}
                    size={150}
                    onUpload={(event, url) => {
                        updateProfile(event, url)
                    }}
                    onDelete={handleAvatarDelete}
                />

                <div>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="text" value={user.email} disabled />
                </div>

                <div>
                    <label htmlFor="fullname">Display Name</label>
                    <input id="fullname" type="text" required value={fullname || ''} onChange={(e) => setFullname(e.target.value)}/>
                </div>

                <button className="button block primary" type="submit" disabled={loading}>
                    {loading ? 'Loading ...' : 'Update Profile'}
                </button>
            </form>
            <hr />
            </div>
            <div className="funding-summary">
                <h3>Funding Summary</h3>
                <button onClick={() => navigate("/mainmap")}>Enter Your Map</button>
                <p><strong>Total Funded:</strong> ${totalFunded.toLocaleString()}</p>

                {ownedHexes.length > 0 ? (
                <ul>
                    {ownedHexes.map((hex, idx) => (
                    <li key={idx}>
                        Hex: {hex.hexes_5?.grid_id || hex.hex_id} — Funded: $
                        {hex.amount_funded.toLocaleString()} ({hex.percentage_owned}%)
                    </li>
                    ))}
                </ul>
                ) : (
                <p>You haven’t funded any hexes yet.</p>
                )}
            </div>
            <button onClick={handleSignOut} className="button danger">
                SignOut
            </button>
        </div>
    )
}