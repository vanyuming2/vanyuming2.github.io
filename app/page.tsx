"use client";

import { useEffect, useState } from "react";

import GardenInvitation from "./GardenInvitation";
import LifeInvitation from "./LifeInvitation";
import MemoryQuest from "./MemoryQuest";

const START_TIME = new Date("2026-04-29T00:17:00+08:00").getTime();
const DAY_IN_MS = 24 * 60 * 60 * 1000;

type ElapsedTime = {
  days: number;
  isCountdown: boolean;
};

const initialTime: ElapsedTime = {
  days: 0,
  isCountdown: false,
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

const letters = [
  {
    number: "01",
    date: "2007.09",
    dateTime: "2007-09",
    label: "第一次认识你",
    title: "我从这里开始认识你",
    text: "三年级，我转到实验小学，和你成了同班同桌。你是班长，总在早读时站在前面，活泼、明亮，好像每天都有用不完的力气。因为两家父母是同事，我们在放学以后也常常见面。那时的我还不懂什么是喜欢，只是很自然地把你充满生命力的样子记了很多年。",
  },
  {
    number: "02",
    date: "2025.09",
    dateTime: "2025-09",
    label: "我们又聊起来了",
    title: "熟悉好像从来没有走远",
    text: "隔了很多年，我们又从一句句近况开始聊天。后来消息慢慢变多，我也重新认识了现在的你。小时候那个熟悉的人已经有了新的模样，可和你说话时的自然，好像一直都还在。",
  },
  {
    number: "03",
    date: "2026.04.29",
    dateTime: "2026-04-29T00:17:00+08:00",
    label: "我把喜欢说出来",
    title: "这一次，我想认真走近你",
    text: "凌晨 00:17，我终于把喜欢说了出来。它不是故事的开头，却是我们一起往下写的新一页。从那以后，我更期待知道你的日常，也在等这个八月回家见你。",
  },
];

function getElapsed(now: number): ElapsedTime {
  const rawDistance = now - START_TIME;

  return {
    days: Math.floor(Math.abs(rawDistance) / DAY_IN_MS),
    isCountdown: rawDistance < 0,
  };
}

function formatToday(now: number) {
  return dateFormatter.format(new Date(now)).replace(/(星期.)$/, " · $1");
}

export default function Home() {
  const [time, setTime] = useState<ElapsedTime>(initialTime);
  const [today, setToday] = useState("今天");
  const [hasStarted, setHasStarted] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  useEffect(() => {
    let intervalId: number | undefined;

    const updateTime = () => {
      const now = Date.now();
      setTime(getElapsed(now));
      setToday(formatToday(now));
      setHasStarted(true);
    };

    updateTime();
    const timeoutId = window.setTimeout(() => {
      updateTime();
      intervalId = window.setInterval(updateTime, 60 * 1000);
    }, 60_020 - (Date.now() % (60 * 1000)));

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") updateTime();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const timerLabel = time.isCountdown ? "距离那天" : "从那天到现在";
  const accessibleSummary = time.isCountdown
    ? `距离告白还有 ${time.days} 天`
    : `从告白那天起已经过了 ${time.days} 天`;

  return (
    <main className="night">
      <div className="skyGlow" aria-hidden="true" />
      <div className="ambientStars" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <i key={index} />
        ))}
        <span className="shootingLight" />
      </div>

      <header className="nightHeader">
        <time>{today}</time>
      </header>

      <section id="top" className="starHero" aria-labelledby="page-title">
        <div className="starStage" aria-hidden="true">
          <i className="starAura" />
          <i className="starOrbit" />
          <span className="warmStar">⭐</span>
          <i className="littleSpark littleSparkOne" />
          <i className="littleSpark littleSparkTwo" />
        </div>

        <p className="forYou">偶尔更新</p>
        <h1 id="page-title">随便看看</h1>

        <div className="elapsed" aria-label={accessibleSummary}>
          <p>{timerLabel}</p>
          <div>
            <span>第</span>
            <strong>{hasStarted ? time.days : "—"}</strong>
            <span>天</span>
          </div>
          <time dateTime="2026-04-29T00:17:00+08:00">
            开始于 2026.04.29 · 00:17
          </time>
          <p className="srOnly" aria-live="polite" aria-atomic="true">
            {hasStarted ? accessibleSummary : ""}
          </p>
        </div>

        <p className="originThought">见面再说。</p>
      </section>

      <details className="privateArchive" open={archiveOpen}>
        <summary
          className="privateArchiveCover"
          aria-label="查看隐藏的私人记录"
          aria-expanded={archiveOpen}
          onClick={(event) => {
            event.preventDefault();
            setArchiveOpen((isOpen) => !isOpen);
          }}
        >
          <span className="privateArchiveTag">私人记录</span>
          <span className="privateArchiveBars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="privateArchiveAction">
            <span className="privateArchiveClosed">这里留了一些东西 · 点击查看</span>
            <span className="privateArchiveOpen">收起来</span>
          </span>
        </summary>

        <div className="privateArchiveContent">
          <div className="privateArchiveNotice" role="status">
            <p>这部分显示有点问题，暂时隐藏内容。</p>
          </div>

          <div className="privateArchiveStored" hidden>
            <section className="nightBody" aria-label="最近的事情">
              <article className="meetingCard">
                <div className="sectionMeta">
                  <p>这个八月</p>
                  <time dateTime="2026-08">2026 年 8 月</time>
                </div>
                <h2>等回家见你的那一天。</h2>
                <p>你暑假在家，我也准备回去找你玩。离见面，又近了一点。</p>
                <span>八月见</span>
              </article>

              <aside className="quietNote">
                <p>今晚留一句</p>
                <blockquote>
                  隔了这么久，和你说话还是很自然。这件事，我很喜欢。
                </blockquote>
                <span>雨铭</span>
              </aside>
            </section>

            <section className="lettersSection" aria-labelledby="letters-title">
              <header className="lettersHeading">
                <div>
                  <p>三封信</p>
                  <h2 id="letters-title">写给三个时期的你</h2>
                </div>
                <span>轻点信封，慢慢打开</span>
              </header>

              <div className="envelopeGrid">
                {letters.map((letter) => (
                  <details
                    className="envelopeItem"
                    key={letter.number}
                    name="memory-letters"
                  >
                    <summary aria-label={`打开 ${letter.date} 的信`}>
                      <div className="envelopeArt" aria-hidden="true">
                        <span className="envelopeBack" />
                        <span className="letterPeek">
                          <time>{letter.date}</time>
                        </span>
                        <span className="envelopeFront" />
                        <span className="envelopeFlap" />
                        <span className="envelopeSeal" />
                      </div>

                      <div className="envelopeCaption">
                        <p>{letter.label}</p>
                        <time>{letter.date}</time>
                      </div>
                    </summary>

                    <article className="letterContent">
                      <div>
                        <time dateTime={letter.dateTime}>{letter.date}</time>
                        <h3>{letter.title}</h3>
                        <p>{letter.text}</p>
                        <span>雨铭</span>
                      </div>
                    </article>
                  </details>
                ))}
              </div>
            </section>
          </div>
        </div>
      </details>

      <MemoryQuest />

      <GardenInvitation />

      <LifeInvitation />
    </main>
  );
}
