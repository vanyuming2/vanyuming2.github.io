import type { Metadata } from "next";
import Link from "next/link";

import GardenScene from "./GardenScene";
import styles from "./garden.module.css";

export const metadata: Metadata = {
  title: "第一块小花园｜万雨铭与张锦",
  description: "一座漂浮在星空里的小花园，先替我们收好几件回忆。",
};

export default function GardenPage() {
  return (
    <main className={styles.gardenPage} data-memory-garden="first-garden">
      <GardenScene />

      <header className={styles.gardenHeader}>
        <Link className={styles.backLink} href="/">
          <span aria-hidden="true">←</span>
          回到那颗星星
        </Link>
        <p>万雨铭 <span>和</span> 张锦</p>
      </header>

      <section className={styles.gardenIntro} aria-labelledby="garden-title">
        <p className={styles.eyebrow}>OUR LITTLE GARDEN · 01</p>
        <h1 id="garden-title">第一块小花园</h1>
        <p>
          先让池塘、白鹅、海星和那张课桌，<br />
          安静地长在同一片星空里。
        </p>
      </section>

      <aside className={styles.gardenNote}>
        <span aria-hidden="true">✦</span>
        <p>现在先用来看看。以后，每一件回忆都会有自己的位置。</p>
      </aside>
    </main>
  );
}
