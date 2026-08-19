import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../../api/auth-api'
import styles from '../auth.module.css'
import Navbar from '../../../shared/ui/navbar/Navbar'

export default function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const response = await login(username.trim(), password)
      setMessage(`Welcome back, ${response?.user_connected?.username ?? username}.`)
      navigate('/')
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to sign in right now.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <Navbar showSearch={false}/>
    <main className={styles['auth-page']}>
      <section className={styles['auth-shell']}>
        <aside className={styles['auth-hero']}>
          <h1>Sign In</h1>
        </aside>
        <section className={styles['auth-card']}>
          <header>
            <h2>Log In</h2>
            <p>Use your username and password to continue.</p>
          </header>

          <form className={styles['auth-form']} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                name="username"
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {error ? (
              <div className={`${styles['auth-message']} ${styles['auth-message--error']}`} role="alert">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className={`${styles['auth-message']} ${styles['auth-message--success']}`} role="status">
                {message}
              </div>
            ) : null}

            <div className={styles['auth-actions']}>
              <button className={styles['auth-button']} type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <p className={styles['auth-switch']}>
            New here? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </section>
    </main>
    </>
  )
}