import Logo from './components/Logo.tsx'
import Search from './components/Search.tsx'
import UserMenu from './components/UserMenu.tsx'
import styles from './Navbar.module.css'

type NavbarParams = {
    showLogo?:boolean,
    showSearch?:boolean,
    showUserMenu?:boolean,
}

export default function Navbar({showLogo=true, showSearch=false, showUserMenu=true}:NavbarParams) {
    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.leftSlot}>
                    {showLogo && <Logo />}
                </div>

                <div className={styles.centerSlot}>
                    {showSearch && <Search />}
                </div>

                <div className={styles.rightSlot}>
                    {showUserMenu && <UserMenu />}
                </div>
            </div>
        </nav>
    )
}