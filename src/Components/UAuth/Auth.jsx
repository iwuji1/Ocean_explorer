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
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuthenticated(data.session?.user ?? true)
        navigate('/')
      } else {
        const { data, error } = await supabase.auth.signUp({ displayName, email, password })
        if (error) throw error

        if(!data.session) {
          alert('Sign-up successful! Please check your email for a confirmation link.')
        } else {
          onAuthenticated(data.session?.user ?? true)
          navigate('/')
        }
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, // Redirect back to your app after login
        },
      })
    } catch (error) {
      console.error('Google sign-in error:', error)
    }
  }

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
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