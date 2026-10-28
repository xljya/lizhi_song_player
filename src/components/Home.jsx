import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ARTIST_NAME, sortAlbumsByYear } from "../utils";
import AlbumCard from "./AlbumCard";

function AlbumRail({ children }) {
  const railRef = useRef(null);
  const drag = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const updateEdges = () => {
    const rail = railRef.current;
    setEdges({ start: rail.scrollLeft <= 1, end: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1 });
  };

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [children]);

  const scroll = (direction) => {
    railRef.current?.scrollBy({
      left: direction * railRef.current.clientWidth * 0.82,
      behavior: "smooth",
    });
  };

  return (
    <div className={`album-rail-wrap${edges.start && edges.end ? "" : " is-scrollable"}`}>
      <button
        className="album-rail-button album-rail-button-prev"
        type="button"
        onClick={() => scroll(-1)}
        disabled={edges.start}
        aria-label="查看上一组专辑"
      >
        <ChevronLeft size={20} />
      </button>
      <div
        className="album-rail"
        ref={railRef}
        onScroll={updateEdges}
        onPointerDown={(event) => {
          drag.current = null;
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft, moved: false };
        }}
        onPointerMove={(event) => {
          if (!drag.current || event.buttons !== 1) return;
          const delta = event.clientX - drag.current.x;
          if (!drag.current.moved && Math.abs(delta) < 6) return;
          drag.current.moved = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.classList.add("is-dragging");
          event.currentTarget.scrollLeft = drag.current.left - delta;
        }}
        onPointerUp={(event) => {
          event.currentTarget.classList.remove("is-dragging");
        }}
        onLostPointerCapture={(event) => {
          event.currentTarget.classList.remove("is-dragging");
        }}
        onPointerCancel={(event) => {
          drag.current = null;
          event.currentTarget.classList.remove("is-dragging");
        }}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (drag.current?.moved && event.detail > 0) {
            event.preventDefault();
            event.stopPropagation();
          }
          drag.current = null;
        }}
      >
        {children}
      </div>
      <button
        className="album-rail-button album-rail-button-next"
        type="button"
        onClick={() => scroll(1)}
        disabled={edges.end}
        aria-label="查看下一组专辑"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

export default function Home({
  albums,
  chartTracks,
  featuredAlbum,
  june4Album,
  artistCover,
  currentTrack,
  onOpenAlbum,
  onPlayTrack,
}) {
  return (
    <>
      <section className="hero" style={{ "--hero-cover": `url("${artistCover}")` }}>
        <div className="hero-inner">
          <div className="hero-art-wrap">
            <img
              className="hero-art"
              src={artistCover}
              alt={ARTIST_NAME}
              width="500"
              height="500"
              fetchPriority="high"
            />
          </div>
          <div className="hero-footer">
            <button
              className="hero-play"
              type="button"
              onClick={() => chartTracks[0] && onPlayTrack(chartTracks[0])}
              aria-label="播放"
            >
              <Play size={20} fill="currentColor" />
            </button>
            <span className="hero-name">{ARTIST_NAME}</span>
          </div>
        </div>
      </section>

      <main className="home-view">
      <section className="content-section">
        <div className="section-header">
          <h2>歌曲排行</h2>
        </div>
        <div className="chart-grid">
          {chartTracks.map((track) => (
            <button
              className={`chart-item${currentTrack?.id === track.id ? " is-active" : ""}`}
              type="button"
              key={track.id}
              onClick={() => onPlayTrack(track)}
            >
              <img
                src={track.cover}
                alt=""
                width="44"
                height="44"
                loading="lazy"
                decoding="async"
              />
              <span className="chart-meta">
                <strong>{track.name}</strong>
                <span>{track.albumName}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {featuredAlbum && (
        <section className="content-section">
          <h2>代表专辑</h2>
          <AlbumRail>
            <AlbumCard
              album={featuredAlbum}
              onOpen={() => onOpenAlbum(featuredAlbum)}
            />
            {june4Album && (
              <AlbumCard
                album={june4Album}
                onOpen={() => onOpenAlbum(june4Album)}
              />
            )}
          </AlbumRail>
        </section>
      )}

      <section className="content-section">
        <h2>专辑</h2>
        <AlbumRail>
          {sortAlbumsByYear(albums).map((album) => (
              <AlbumCard
                key={album.name}
                album={album}
                onOpen={() => onOpenAlbum(album)}
              />
            ))}
        </AlbumRail>
      </section>
    </main>
    </>
  );
}
