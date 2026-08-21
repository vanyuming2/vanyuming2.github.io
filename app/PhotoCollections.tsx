"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import PhotoDoodle from "./PhotoDoodles";
import { photoCollections, type PhotoCollection } from "./photo-collections";

type CollectionId = PhotoCollection["id"];
type PhotoOrientation = "landscape" | "portrait" | "square";

const initialPages: Record<CollectionId, number> = {
  life: 0,
  styled: 0,
};

export default function PhotoCollections() {
  const [activeCollectionId, setActiveCollectionId] = useState<CollectionId | null>(null);
  const [pageByCollection, setPageByCollection] = useState(initialPages);
  const [photoOrientations, setPhotoOrientations] = useState<Record<string, PhotoOrientation>>({});
  const touchStartX = useRef<number | null>(null);
  const journalRef = useRef<HTMLElement | null>(null);
  const activeCollection = photoCollections.find(({ id }) => id === activeCollectionId) ?? null;
  const activePage = activeCollection ? pageByCollection[activeCollection.id] : 0;
  const activeItem = activeCollection?.items[activePage] ?? null;

  const turnPage = (direction: -1 | 1) => {
    if (!activeCollection) return;

    setPageByCollection((current) => ({
      ...current,
      [activeCollection.id]: Math.min(
        activeCollection.items.length - 1,
        Math.max(0, current[activeCollection.id] + direction),
      ),
    }));
  };

  useEffect(() => {
    if (!activeCollection) return;

    const turnWithKeyboard = (direction: -1 | 1) => {
      setPageByCollection((current) => ({
        ...current,
        [activeCollection.id]: Math.min(
          activeCollection.items.length - 1,
          Math.max(0, current[activeCollection.id] + direction),
        ),
      }));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") turnWithKeyboard(-1);
      if (event.key === "ArrowRight") turnWithKeyboard(1);
      if (event.key === "Escape") setActiveCollectionId(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeCollection]);

  useEffect(() => {
    if (!activeCollectionId) return;
    const frame = window.requestAnimationFrame(() => {
      journalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeCollectionId]);

  useEffect(() => {
    if (!activeCollection) return;
    const useMobileImage = window.matchMedia("(max-width: 720px)").matches;
    for (const item of activeCollection.items.slice(activePage + 1, activePage + 3)) {
      const preload = new window.Image();
      preload.src = useMobileImage ? item.mobileImagePath : item.imagePath;
    }
  }, [activeCollection, activePage]);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 48) return;
    turnPage(distance > 0 ? -1 : 1);
  };

  const recordPhotoOrientation = (id: string, image: HTMLImageElement) => {
    const ratio = image.naturalWidth / image.naturalHeight;
    const orientation: PhotoOrientation = ratio < 0.85
      ? "portrait"
      : ratio > 1.18
        ? "landscape"
        : "square";
    setPhotoOrientations((current) => current[id] === orientation
      ? current
      : { ...current, [id]: orientation });
  };

  return (
    <section className="photoCollections" aria-labelledby="photo-collections-title">
      <header className="photoCollectionsHeading">
        <div>
          <p>图片集合</p>
          <h2 id="photo-collections-title">照片</h2>
        </div>
        <span>翻开相册，一次只看一页。</span>
      </header>

      <div className="photoAlbumShelf">
        {photoCollections.map((collection, index) => (
          <button
            aria-controls={`photo-journal-${collection.id}`}
            aria-expanded={activeCollectionId === collection.id}
            className={`photoAlbumCover photoAlbumCover--${collection.id}`}
            key={collection.id}
            onClick={() => setActiveCollectionId(collection.id)}
            style={{ "--album-offset": `${index * 34}px` } as React.CSSProperties}
            type="button"
          >
            <span className="photoAlbumSpine" aria-hidden="true" />
            <span className="photoAlbumCopy">
              <small>ALBUM {String(index + 1).padStart(2, "0")}</small>
              <strong>{collection.title}</strong>
              <em>{collection.items.length} 页</em>
            </span>
            <span className="photoAlbumPeek" aria-hidden="true">
              <Image
                alt=""
                decoding="async"
                fill
                loading="lazy"
                sizes="72px"
                src={collection.items[0].placeholderPath}
                style={{ imageRendering: "pixelated" }}
                unoptimized
              />
            </span>
            <span className="photoAlbumOpen">翻开 <i aria-hidden="true">↗</i></span>
          </button>
        ))}
      </div>

      {activeCollection && activeItem && (
        <article
          aria-label={`${activeCollection.title}阅览器`}
          className="photoJournalViewer"
          id={`photo-journal-${activeCollection.id}`}
          onTouchCancel={() => { touchStartX.current = null; }}
          onTouchEnd={onTouchEnd}
          onTouchStart={onTouchStart}
          ref={journalRef}
          tabIndex={-1}
        >
          <header className="photoJournalToolbar">
            <div>
              <small>{activeCollection.description}</small>
              <h3>{activeCollection.title}</h3>
            </div>
            <button onClick={() => setActiveCollectionId(null)} type="button">合上</button>
          </header>

          <div className="photoJournalPage">
            <div className="journalPageMarks" aria-hidden="true">
              <span>{String(activePage + 1).padStart(2, "0")}</span>
              <i />
            </div>

            <div className="journalPhotoArea">
              <div
                className="journalPhotoFrame"
                data-orientation={photoOrientations[activeItem.id] ?? "landscape"}
              >
                <picture>
                  <source media="(max-width: 720px)" srcSet={activeItem.mobileImagePath} />
                  <img
                    alt={activeItem.label}
                    decoding="async"
                    loading="eager"
                    onLoad={(event) => recordPhotoOrientation(activeItem.id, event.currentTarget)}
                    src={activeItem.imagePath}
                  />
                </picture>
              </div>
            </div>

            <div className="journalWriting">
              <span>{activeItem.label}</span>
              {activeItem.caption ? (
                <p>{activeItem.caption}</p>
              ) : (
                <div className="journalBlankLines" aria-label="台词留白">
                  <i /><i /><i />
                </div>
              )}
            </div>

            <div className="photoDoodleLayer">
              {activeItem.doodles.map((placement, index) => (
                <PhotoDoodle key={`${activeItem.id}-${placement.type}-${index}`} placement={placement} />
              ))}
            </div>
          </div>

          <nav className="photoJournalNavigation" aria-label="相册翻页">
            <button disabled={activePage === 0} onClick={() => turnPage(-1)} type="button">
              <span aria-hidden="true">←</span> 上一页
            </button>
            <p><strong>{activePage + 1}</strong> / {activeCollection.items.length}</p>
            <button
              disabled={activePage === activeCollection.items.length - 1}
              onClick={() => turnPage(1)}
              type="button"
            >
              下一页 <span aria-hidden="true">→</span>
            </button>
          </nav>
          <p className="photoJournalHint">也可以使用方向键，手机上左右滑动。</p>
        </article>
      )}
    </section>
  );
}
