import {useRef, useState} from 'react';
import {PED_SOCKS_COLORS} from '~/lib/jersey';
import {SocksPhoto} from './JerseyPhotos';

export function SocksGallery({selectedColor}: {selectedColor: string}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [color, setColor] = useState('Black');

  return (
    <>
      <button
        type="button"
        className="jersey-text-button"
        aria-label="View PED socks photos"
        aria-haspopup="dialog"
        aria-controls="jersey-socks-gallery"
        onClick={() => {
          setColor(selectedColor === 'White' ? 'White' : 'Black');
          dialogRef.current?.showModal();
        }}
      >
        View photos
      </button>
      <dialog
        ref={dialogRef}
        id="jersey-socks-gallery"
        className="jersey-kit-preview jersey-socks-gallery"
        aria-labelledby="jersey-socks-gallery-title"
      >
        <div className="jersey-kit-header">
          <h2 id="jersey-socks-gallery-title">PED socks</h2>
          <button
            type="button"
            className="jersey-text-button"
            aria-label="Close socks photos"
            onClick={() => dialogRef.current?.close()}
          >
            Close
          </button>
        </div>
        <div className="jersey-kit-content">
          <div
            className="jersey-choice-row"
            role="group"
            aria-label="Photo color"
          >
            {PED_SOCKS_COLORS.map((value) => (
              <button
                key={value}
                type="button"
                className={`pel-pdp__size${color === value ? ' is-active' : ''}`}
                aria-pressed={color === value}
                onClick={() => setColor(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="jersey-socks-gallery-photos">
            {(['pair', 'detail'] as const).map((view) => (
              <figure key={view}>
                <SocksPhoto
                  color={color}
                  view={view}
                  sizes="(min-width: 601px) 350px, 90vw"
                />
                <figcaption>
                  {color} · {view === 'pair' ? 'One pair' : 'Logo detail'}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </dialog>
    </>
  );
}
