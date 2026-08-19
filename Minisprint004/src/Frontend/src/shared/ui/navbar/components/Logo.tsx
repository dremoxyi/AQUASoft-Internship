import styles from '../Navbar.module.css';

export default function Logo() {
    return (
        <div className={styles.logo}>
            <a href='/'>
                <img src='/favicon.svg'></img>
            </a>
        </div>
    )
}