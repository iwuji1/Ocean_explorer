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

    const {session, signOut} = UserAuth();
    const navigate = useNavigate()

    const handleSignOut = async (e) => {
        e.preventDefault()
        try {
            await signOut()
            navigate("/")
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        let ignore = false
        async function getProfile() {
            setLoading(true)
            const {user} = session

            const {data, error} = await supabase
            .from('profiles')
            .select(`full_name, website, avatar_url`)
            .eq('id', user.id)
            .single()

            if (!ignore) {
                if (error) {
                    console.warn(error)
                } else if (data) {
                    setFullname(data.full_name)
                    setAvatarUrl(data.avatar_url)
                }
            }

            setLoading(false)
        }

        getProfile()

        return () => {
            ignore = true
        }
    }, [session])

    async function updateProfile(event, avatarUrl) {
    event.preventDefault()
    setLoading(true)
    const { user } = session
    const updates = {
      id: user.id,
      fullname,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
      alert(error.message)
    } else {
      setAvatarUrl(avatarUrl)
    }
    setLoading(false)
  }



    return (
        <div>
            <h1>Dashboard</h1>
            <h2> Welcome, {session?.user?.user_metadata.full_name}</h2>
            <div className="form-container">
            <form onSubmit={updateProfile} className="form-widget">
                <Avatar
                    url={avatar_url}
                    size={150}
                    onUpload={(event, url) => {
                        updateProfile(event, url)
                    }}
                />

                <button onClick={() => navigate("/mainmap")}>Enter Your Map</button>

                <div>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="text" value={session.user.email} disabled />
                </div>
                <div>
                    <label htmlFor="fullname">Name</label>
                    <input id="fullname" type="text" required value={fullname || ''} onChange={(e) => setfullname(e.target.value)}/>
                </div>
                <div>
                    <button className="button block primary" type="submit" disabled={loading}>
                        {loading ? 'Loading ...' : 'Update'}
                        </button>
                </div>
            <div>

            </div>
            </form>
            </div>

            <div>
                <button onClick={handleSignOut}>
                    SignOut
                </button>
            </div>
        </div>
    )
}