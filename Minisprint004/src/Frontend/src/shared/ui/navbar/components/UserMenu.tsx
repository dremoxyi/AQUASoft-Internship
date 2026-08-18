import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from '../Navbar.module.css'
import { whoami, logout } from '../../../../api/auth-api'
import { Paths } from '../../../../routes'

interface WhoamiUser {
    id?: string
    username?: string
    email?: string
    rolename?: string
}

export default function UserMenu() {
    const [user, setUser] = useState<WhoamiUser | null>(null)
    const isLoggedIn = user?.id !== undefined
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await whoami();
                setUser(response);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        loadUser();

        const refreshUser = () => {
            loadUser();
        }

        window.addEventListener('auth-change', refreshUser)

        return () => {
            window.removeEventListener('auth-change', refreshUser)
        }
    }, []);

    async function handleLogout() {
        try {
        await logout()
        } catch {
        } finally {
        setUser(null);
        window.dispatchEvent(new Event('auth-change'))
        navigate('/')
        }
    }

    if (loading) {
        return <div className={styles.userSection} />
    }

    return (
        <div className={styles.userSection}>
        {isLoggedIn ? (
            <div className={styles.userMenu}>
            <span className={styles.welcome}>
                Hi, <span className={styles.username}> {user?.username || 'User'} </span>
            </span>

            <Link to={Paths.dashboard} className={styles.dashboardLink}>
                Dashboard
            </Link>

            <Link to="/me" className={styles.profileLink}>
                Profile
            </Link>

            <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
            </button>
            </div>
        ) : (
            <div className={styles.authButtons}>
                <Link to="/login" className={styles.loginBtn}>Login</Link>
                <Link to="/register" className={styles.registerBtn}>Register</Link>
            </div>
        )}
        </div>
    )
}