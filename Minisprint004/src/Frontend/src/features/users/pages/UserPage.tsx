import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../../shared/ui/navbar/Navbar'
import styles from '../UserPage.module.css'
import { updateMe, whoami } from '../../../api/auth-api'
import { Paths } from '../../../routes'

export default function UserPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [initialUsername, setInitialUsername] = useState('')
  const [initialEmail, setInitialEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const normalizedUsername = username.trim()
  const normalizedEmail = email.trim()
  const usernameChanged = normalizedUsername !== initialUsername
  const emailChanged = normalizedEmail !== initialEmail
  const passwordChanged = password.length > 0
  const hasChanges = usernameChanged || emailChanged || passwordChanged

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await whoami()

        if (!response) {
          navigate('/login')
          return
        }

        const nextUsername = response.username ?? ''
        const nextEmail = response.email ?? ''

        setUsername(nextUsername)
        setEmail(nextEmail)
        setInitialUsername(nextUsername)
        setInitialEmail(nextEmail)
      } catch {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [navigate])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!hasChanges) {
      setMessage('No changes to save.')
      return
    }

    setSaving(true)

    try {
      const response = await updateMe({
        username: normalizedUsername,
        email: normalizedEmail,
        password: password || undefined,
      })

      const nextUsername = response.username ?? normalizedUsername
      const nextEmail = response.email ?? normalizedEmail

      setUsername(nextUsername)
      setEmail(nextEmail)
      setInitialUsername(nextUsername)
      setInitialEmail(nextEmail)
      setPassword('')
      setConfirmPassword('')
      setMessage('Profile updated successfully.')
      window.dispatchEvent(new Event('auth-change'))
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to update your profile right now.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar showSearch={false} />
        <main className={styles.page}>
          <section className={styles.shell}>
            <p className={styles.status}>Loading your profile...</p>
          </section>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar showSearch={false} />
      <main className={styles.page}>
        <section className={styles.card}>
          <header className={styles.header}>
            <h2>Edit profile</h2>
            <p>Save any changes below. Leave password fields empty to keep your current password.</p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <div className={styles.fieldHeader}>
                <label className={styles.fieldLabel} htmlFor="profile-username">
                  Username
                </label>
                <button
                  type="button"
                  className={styles.resetButton}
                  onClick={() => {
                    setUsername(initialUsername)
                    setMessage('')
                    setError('')
                  }}
                  disabled={!usernameChanged}
                >
                  Reset
                </button>
              </div>
              <input
                id="profile-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
              <p className={styles.helper}>Current username: {initialUsername || 'Not set'}</p>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldHeader}>
                <label className={styles.fieldLabel} htmlFor="profile-email">
                  Email
                </label>
                <button
                  type="button"
                  className={styles.resetButton}
                  onClick={() => {
                    setEmail(initialEmail)
                    setMessage('')
                    setError('')
                  }}
                  disabled={!emailChanged}
                >
                  Reset
                </button>
              </div>
              <input
                id="profile-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <p className={styles.helper}>Current email: {initialEmail || 'Not set'}</p>
            </div>

            <div className={styles.passwordGrid}>
              <label className={styles.field} htmlFor="profile-password">
                <span className={styles.fieldLabel}>New password</span>
                <input
                  id="profile-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Leave blank to keep current password"
                />
              </label>

              <label className={styles.field} htmlFor="profile-confirm-password">
                <span className={styles.fieldLabel}>Confirm new password</span>
                <input
                  id="profile-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat the new password"
                />
              </label>
            </div>

            {error ? <p className={`${styles.message} ${styles.error}`}>{error}</p> : null}
            {message ? <p className={`${styles.message} ${styles.success}`}>{message}</p> : null}

            <div className={styles.actions}>
              <Link className={styles.homeButton} to={Paths.homepage}>
                Go home
              </Link>
              <button className={styles.saveButton} type="submit" disabled={saving || !hasChanges}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  )
}