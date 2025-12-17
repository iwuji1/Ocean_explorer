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
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const {session, signUpNewUser } = UserAuth();
    const navigate = useNavigate();

    function validateSignup({ email, password }) {
        if (!email) return "Email is required.";
        if (!password) return "Password is required.";

        if (password.length < 6) {
        return "Password must be at least 6 characters long.";
        }

        // Optional extra rules
        // if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
        // if (!/[0-9]/.test(password)) return "Password must include a number.";

        return null;
    }

    const handleSignUp = async (e) => {
        e.preventDefault();
        setFormError(null);
        setLoading(true);

        const validationError = validateSignup({ email, password});
        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            
            const result = await signUpNewUser(full_name, email, password);

            if(result.success) {
                navigate('/dashboard')
            } else {
                setFormError(result?.error ?? "Sign up failed. Please try again");
            }
        } catch (err) {
        setFormError(err?.message ?? "Sign up failed. Please try again.");
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
          setFormError(error?.message ?? "Google sign-in failed.");
        }
      }

    return ( <div className="form">
        <div className="form-container">
            <h1>SignUp</h1>
            {formError && (
                <div className="auth-error">
                {formError}
                </div>
            )}
            <form className="signUpForm" onSubmit={handleSignUp}>
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
                onChange={(e) => {setEmail(e.target.value); setFormError(null); setError("");}}
                required
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {setPassword(e.target.value); setFormError(null); setError("");}}
                required
                />
                <button className="signUpbtn" disabled={loading} type="submit">
                    {loading ? "Signing up..." : "Sign Up"}
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
    </div>
    )
}