import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";
import "./Auth.css"

export default function Signup() {
    const [full_name, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState('');

    const {session, signUpNewUser } = UserAuth();
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            
            const result = await signUpNewUser(full_name, email, password);

            if(result.success) {
                navigate('/dashboard')
            }
        } catch (err) {
        setError("an error occured");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/dashboard`, // Redirect back to your app after login
            },
          })
        } catch (error) {
          console.error('Google sign-in error:', error)
        }
      }

    return (
        <div className="form-container">
            <h1>SignUp</h1>
            <form onSubmit={handleSignUp}>
                 <p>Already have an account? <Link to={"/signin"}>Sign In!</Link></p>
                 <input
                 type="full_name"
                 placeholder="full_name"
                 value={full_name}
                 onChange={(e) => setFullName(e.target.value)} 
                 required
                 />
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
                <button disabled={loading} type="submit">
                    Sign Up
                </button>
                {error && <p>{error}</p>}
            </form>

            <div style={{ marginTop: '1rem'}}>
                <button onClick={handleGoogleSignIn} className="google-button">
                <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="Google"
                    style={{ width: 18, marginRight: 8, verticalAlign: 'middle' }}
                />
                Sign in with Google
                </button>
            </div>
        </div>
    )
}