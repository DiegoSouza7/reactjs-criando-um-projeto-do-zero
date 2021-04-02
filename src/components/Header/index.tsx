import Link from 'next/link'
import styles from './header.module.scss';

export default function Header() {
  return (
    <div className={styles.container}>
      <Link href="/">
        <img src="/icon.svg" alt="logo" />
      </Link>
      <h1>
        spacetraveling
      </h1>
      <p>.</p>
    </div>
  )
}
