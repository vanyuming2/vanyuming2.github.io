import Link from "next/link";

import styles from "./garden-invitation.module.css";

export default function GardenInvitation() {
  return (
    <section className={styles.invitation} aria-labelledby="garden-invitation-title">
      <div className={styles.copy}>
        <p>刚刚长出来</p>
        <h2 id="garden-invitation-title">去看看我们的第一块小花园。</h2>
        <span>池塘边有一只鹅，沙地里藏着一颗海星。</span>
        <Link href="/garden/" prefetch={false}>
          走进去看看
          <i aria-hidden="true">→</i>
        </Link>
      </div>

      <div className={styles.miniature} aria-hidden="true">
        <div className={styles.island}>
          {Array.from({ length: 9 }, (_, index) => (
            <i key={index} />
          ))}
          <span className={styles.pond} />
          <span className={styles.tree} />
          <span className={styles.lamp}>✦</span>
        </div>
      </div>
    </section>
  );
}
