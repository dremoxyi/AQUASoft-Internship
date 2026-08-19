import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register, checkAvailability } from '../../../api/auth-api'
import styles from '../auth.module.css'
import Navbar from '../../../shared/ui/navbar/Navbar'

type FieldStatus = 'idle' | 'checking' | 'valid' | 'invalid'

function statusClass(status: FieldStatus) {
  if (status === 'checking') return styles['field-checking']
  if (status === 'valid') return styles['field-valid']
  if (status === 'invalid') return styles['field-invalid']
  return ''
}

export default function Register() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [usernameStatus, setUsernameStatus] = useState<FieldStatus>('idle')
  const [usernameHint, setUsernameHint] = useState('')
  const [emailStatus, setEmailStatus] = useState<FieldStatus>('idle')
  const [emailHint, setEmailHint] = useState('')

  async function handleUsernameBlur() {
    const value = username.trim()
    if (!value) {
      setUsernameStatus('idle')
      setUsernameHint('')
      return
    }

    setUsernameStatus('checking')
    setUsernameHint('Checking availability')

    try {
      const { response: { isAvailable } } = await checkAvailability('name', value)
      if (isAvailable) {
        setUsernameStatus('valid')
        setUsernameHint('Username is available')
      } else {
        setUsernameStatus('invalid')
        setUsernameHint('Username already taken')
      }
    } catch {
      setUsernameStatus('idle')
      setUsernameHint('')
    }
  }

  async function handleEmailBlur() {
    const value = email.trim()
    if (!value) {
      setEmailStatus('idle')
      setEmailHint('')
      return
    }

    setEmailStatus('checking')
    setEmailHint('Checking availability')

    try {
      const { response: { isAvailable } } = await checkAvailability('email', value)
      if (isAvailable) {
        setEmailStatus('valid')
        setEmailHint('Email is available')
      } else {
        setEmailStatus('invalid')
        setEmailHint('Email already registered')
      }
    } catch {
      setEmailStatus('idle')
      setEmailHint('')
    }
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (usernameStatus === 'invalid' || emailStatus === 'invalid') {
      setError('Please resolve the highlighted fields before continuing.')
      return
    }

    setLoading(true)

    try {
      const response = await register(username.trim(), email.trim(), password)
      setMessage(`Account created for ${response?.username ?? username}.`)
      navigate('/')
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to create your account right now.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <Navbar></Navbar>
    <main className={styles['auth-page']}>
      <section className={styles['auth-shell']}>
        <aside className={styles['auth-hero']}>
          <h1>Sign Up</h1>
        </aside>

        <section className={styles['auth-card']}>
          <header>
            <h2>Create account</h2>
            <p>Fill in the details below to get started.</p>
          </header>

          <form className={styles['auth-form']} onSubmit={handleSubmit}>
            <div className={styles['auth-row']}>
              <div className={`${styles.field} ${statusClass(usernameStatus)}`}>
                <label htmlFor="register-username">Username</label>
                <input
                  id="register-username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  onBlur={handleUsernameBlur}
                  required
                />
                {usernameHint ? (
                  <p className={`${styles['field-hint']} ${styles[`field-hint--${usernameStatus}`]}`}>
                    {usernameHint}
                  </p>
                ) : null}
              </div>

              <div className={`${styles.field} ${statusClass(emailStatus)}`}>
                <label htmlFor="register-email">Email</label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={handleEmailBlur}
                  required
                />
                {emailHint ? (
                  <p className={`${styles['field-hint']} ${styles[`field-hint--${emailStatus}`]}`}>
                    {emailHint}
                  </p>
                ) : null}
              </div>
            </div>

            <div className={styles['auth-row']}>
              <div className={styles.field}>
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="register-confirm-password">Confirm password</label>
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat the password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
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
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <p className={styles['auth-switch']}>
            Already have an account? <Link to="/login">Sign in instead</Link>
          </p>
        </section>
      </section>
    </main>
    </>
  )
}