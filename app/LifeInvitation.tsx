import Link from "next/link";

import styles from "./life-invitation.module.css";

export default function LifeInvitation() {
  return (
    <section className={styles.invitation} aria-labelledby="life-invitation-title">
      <div className={styles.cards} aria-hidden="true">
        <i data-color="plain"><span>向阳而生</span><small>快乐 +2</small></i>
        <i data-color="blue"><span>远方来信</span><small>少见</small></i>
        <i data-color="gold"><span>星星的孩子</span><small>传说</small></i>
      </div>

      <div className={styles.copy}>
        <p>另一种可能</p>
        <h2 id="life-invitation-title">如果人生可以再写一次。</h2>
        <span>抽三张天赋，把二十点放进新的开头，然后慢慢走完这一页。</span>
        <Link href="/remake/" prefetch={false}>
          去试试另一种人生
          <i aria-hidden="true">→</i>
        </Link>
      </div>
    </section>
  );
}
