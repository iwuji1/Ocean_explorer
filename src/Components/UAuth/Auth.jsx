import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Auth({ onAuthenticated }) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formError, setFormError] = useState(null);
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



  const handleLogin = async (event) => {
    event.preventDefault()
    setFormError(null);
    setLoading(true)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuthenticated(data.session?.user ?? true)
        navigate('/')
      } else {

        const validationError = validateSignup({ email, password})

        if (validationError) {
          setFormError(validationError);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password, 
          options: {
            data: { full_name: displayName},
          }, 
        });

        if (error) throw error

        if(!data.session) {
          alert('Sign-up successful! Please check your email for a confirmation link.')
        } else {
          onAuthenticated(data.session?.user ?? true)
          navigate('/')
        }
      }
    } catch (error) {
      if(error.message?.toLowerCase().includes("password")) {
        setFormError("Password must be at least 6 characters long.");
      } else if (error.message?.includes("email")) {
        setFormError("Please enter a valid email address.");
      } else {
      setFormError(error.message || "Something went wrong. Please try again.");
    }
    } finally {
      setLoading(false)
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
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      {formError && (
        <div className="auth-error">
          {formError}
        </div>
      )}
      <form onSubmit={handleLogin}>
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
        {!isLogin && password.length > 0 && password.length < 6 && (
          <small style={{ color: "#d32f2f" }}>
            Password must be at least 6 characters
          </small>
        )}
        <button disabled={loading} type="submit">
          {loading ? 'Loading…' : isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <p>
        {isLogin ? 'Need an account?' : 'Already have an account?'}
        <span
          style={{ color: '#1978c8', cursor: 'pointer' }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? ' Sign Up' : ' Login'}
        </span>
      </p>

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