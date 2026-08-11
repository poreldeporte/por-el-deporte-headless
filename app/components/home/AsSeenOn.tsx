import {useRef, useState} from 'react';

/**
 * The Morning Footy segment: Nico Cantor wearing the club's kit on CBS Sports
 * Golazo Network, talking about where Por El Deporte came from.
 *
 * Click to play, deliberately. The file is 31 MB and 2:46 long with audio, so
 * autoplay would be both a bandwidth tax on every homepage visit and a
 * clip that starts talking at someone who did not ask for it. `preload="none"`
 * means nothing but the poster is fetched until the play button is pressed —
 * the poster is a still lifted from the clip itself at 1:20, where the crest
 * and the Ocean Bank sponsor are both legible.
 */
const VIDEO_SRC =
  'https://cdn.shopify.com/videos/c/o/v/26bfd648eb5146e6ad4634032a716ef9.mp4';

export function AsSeenOn() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = () => {
    const el = videoRef.current;
    if (!el) return;
    setPlaying(true);
    el.play().catch(() => setPlaying(false));
  };

  return (
    <section className="pel-press" aria-label="Por El Deporte on CBS Sports Golazo Network">
      <div className="pel-press__inner">
        <div className="pel-press__head">
          {/* The network's own mark carries more weight than the words do, and
              it is the thing people recognise before they read anything. Kept
              at a modest size and paired with the show name, which the logo
              does not say. */}
          <img
            className="pel-press__logo"
            src="/golazo-network.png"
            alt="CBS Sports Golazo Network"
            width={1000}
            height={562}
            loading="lazy"
            data-reveal
          />
          <div className="pel-press__eyebrow" data-reveal>
            Morning Footy
          </div>
          <h2 className="pel-press__title" data-reveal>
            They Wore Ours
            <br />
            On Air
          </h2>
          <p className="pel-press__sub" data-reveal>
            Nico Cantor presented Morning Footy in our kit and explained what
            Por El Deporte means: for the sport. Franco and Marco Viola started
            the club to give people in Miami a game to turn up to and a group to
            belong to, and it has been free to turn up ever since.
          </p>
        </div>

        <div className="pel-press__frame" data-reveal>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption --
              Shipped without captions by decision, not oversight. A <track>
              pointing at a file that is not there is worse than none: the
              browser advertises captions in the player and then shows nothing.
              If a caption file is ever added, drop this line. */}
          <video
            ref={videoRef}
            className="pel-press__video"
            src={VIDEO_SRC}
            poster="/golazo-poster.jpg"
            preload="none"
            controls={playing}
            playsInline
            width={848}
            height={480}
          />
          {!playing ? (
            <button
              type="button"
              className="pel-press__play"
              onClick={start}
              aria-label="Play the Morning Footy segment, 2 minutes 46 seconds"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
              </svg>
              <span>Watch the segment</span>
              <span className="pel-press__dur">2:46</span>
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
