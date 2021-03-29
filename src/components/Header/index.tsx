import styles from './header.module.scss';

export default function Header() {
  return (
    <div className={styles.container}>
      <img src="/icon.svg" alt="Logo" />
      <h1>
        spacetraveling
      </h1>
      <p>.</p>
    </div>
  )
}
