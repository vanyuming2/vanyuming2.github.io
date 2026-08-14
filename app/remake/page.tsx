import type { Metadata } from "next";
import Link from "next/link";

import LifeRestartGame from "./LifeRestartGame";
import styles from "./remake.module.css";

export const metadata: Metadata = {
  title: "另一种人生｜万雨铭与张锦",
  description: "原版中文事件与天赋内容，换一种温暖的方式重开人生。",
};

export default function RemakePage() {
  return (
    <main className={styles.page} data-life-remake="original-zh-cn-complete-loop">
      <div className={styles.stars} aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
      </div>

      <header className={styles.pageHeader}>
        <Link href="/">
          <span aria-hidden="true">←</span>
          回到那颗星星
        </Link>
        <p>ANOTHER LIFE · LOCAL SAVE</p>
      </header>

      <LifeRestartGame />
    </main>
  );
}
