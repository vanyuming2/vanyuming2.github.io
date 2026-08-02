"use client";

import { useEffect, useState } from "react";

const START_TIME = new Date("2026-04-29T00:17:00+08:00").getTime();
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HOUR_IN_MS = 60 * 60 * 1000;
const MINUTE_IN_MS = 60 * 1000;

type TimeParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isCountdown: boolean;
};

const initialTime: TimeParts = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isCountdown: false,
};

function splitTime(now: number): TimeParts {
  const rawDistance = now - START_TIME;
  const distance = Math.abs(rawDistance);

  return {
    days: Math.floor(distance / DAY_IN_MS),
    hours: Math.floor((distance % DAY_IN_MS) / HOUR_IN_MS),
    minutes: Math.floor((distance % HOUR_IN_MS) / MINUTE_IN_MS),
    seconds: Math.floor((distance % MINUTE_IN_MS) / 1000),
    isCountdown: rawDistance < 0,
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function Home() {
  const [time, setTime] = useState<TimeParts>(initialTime);
  const [hasStarted, setHasStarted] = useState(false);
  const [accessibleSummary, setAccessibleSummary] = useState("");

  useEffect(() => {
    let intervalId: number | undefined;

    const updateTime = () => {
      const nextTime = splitTime(Date.now());
      setTime(nextTime);
      setHasStarted(true);

      const prefix = nextTime.isCountdown
        ? "距离故事开始还有"
        : "我们已经一起走过";
      const summary = `${prefix}${nextTime.days}天${nextTime.hours}小时${nextTime.minutes}分钟`;
      setAccessibleSummary((current) =>
        current === summary ? current : summary,
      );
    };

    updateTime();
    const timeoutId = window.setTimeout(() => {
      updateTime();
      intervalId = window.setInterval(updateTime, 1000);
    }, 1020 - (Date.now() % 1000));

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

  const timerHeading = time.isCountdown
    ? "距离我们的故事开始还有"
    : "我们已经一起走过";

  return (
    <main>
      <div className="ambient" aria-hidden="true">
        <span className="ambientOrb ambientOrbOne" />
        <span className="ambientOrb ambientOrbTwo" />
        <span className="fineLine fineLineOne" />
        <span className="fineLine fineLineTwo" />
      </div>

      <section className="hero" aria-labelledby="hero-title">
        <div className="heroContent">
          <p className="eyebrow">OUR LITTLE FOREVER</p>

          <h1 id="hero-title" className="names">
            <span>万雨铭</span>
            <span className="heartDivider" aria-hidden="true">
              <span className="heartLine" />
              <span className="heart">♡</span>
              <span className="heartLine" />
            </span>
            <span>张锦</span>
          </h1>

          <p className="heroSentence">从那一刻起，时间有了温度。</p>

          <div className="timerCard">
            <p className="timerHeading">{timerHeading}</p>

            <div
              className={`timerVisual${hasStarted ? " isReady" : ""}`}
              aria-hidden="true"
            >
              <div className="daysBlock">
                <span className="daysNumber">
                  {hasStarted ? time.days : "—"}
                </span>
                <span className="daysLabel">天</span>
              </div>

              <div className="timeGrid">
                <div className="timeUnit">
                  <span className="timeValue">
                    {hasStarted ? pad(time.hours) : "—"}
                  </span>
                  <span className="timeLabel">小时</span>
                </div>
                <span className="timeDot">·</span>
                <div className="timeUnit">
                  <span className="timeValue">
                    {hasStarted ? pad(time.minutes) : "—"}
                  </span>
                  <span className="timeLabel">分钟</span>
                </div>
                <span className="timeDot">·</span>
                <div className="timeUnit">
                  <span className="timeValue">
                    {hasStarted ? pad(time.seconds) : "—"}
                  </span>
                  <span className="timeLabel">秒</span>
                </div>
              </div>
            </div>

            <p className="srOnly" aria-live="polite" aria-atomic="true">
              {accessibleSummary}
            </p>

            <div className="startStamp">
              <span aria-hidden="true">✦</span>
              <time dateTime="2026-04-29T00:17:00+08:00">
                始于 2026.04.29 · 00:17 · 上海时间
              </time>
            </div>
          </div>

          <a className="scrollCue" href="#letter" aria-label="继续阅读">
            <span>往下，是想说给你听的话</span>
            <i aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="letter" className="letterSection" aria-labelledby="letter-title">
        <div className="letterCard">
          <p className="letterKicker">TO US</p>
          <h2 id="letter-title">写给我们的以后</h2>
          <blockquote>
            愿我们把每一个寻常的今天，
            <br />
            慢慢过成值得珍藏的后来。
          </blockquote>

          <div className="storyLine" aria-label="我们的故事时间线">
            <div className="storyItem">
              <span className="storyIndex">01</span>
              <div>
                <h3>那一刻</h3>
                <p>2026 年 4 月 29 日，00:17</p>
              </div>
            </div>
            <div className="storyItem">
              <span className="storyIndex">02</span>
              <div>
                <h3>每一天</h3>
                <p>认真收藏所有平凡的小事</p>
              </div>
            </div>
            <div className="storyItem">
              <span className="storyIndex">∞</span>
              <div>
                <h3>很久以后</h3>
                <p>仍然愿意和你分享日落与晚风</p>
              </div>
            </div>
          </div>

          <p className="signature">万雨铭 &amp; 张锦</p>
        </div>
      </section>

      <footer>
        <span aria-hidden="true">♡</span>
        <p>愿每一个普通日子，都值得被记住。</p>
      </footer>
    </main>
  );
}
