import {Link} from 'react-router';
import {PelLogoMark} from '~/components/PelLogo';
import oceanBankBlue from '~/assets/partners/ocean-bank-blue.png';
import oceanBankWhite from '~/assets/partners/ocean-bank-white.png';

export function PelPartnerLogo({light = false}: {light?: boolean}) {
  return (
    <div className="pel-partner-logo">
      <Link to="/" aria-label="Por El Deporte home">
        <PelLogoMark height={44} />
      </Link>
      <span className="pel-partner-logo__separator" aria-hidden="true">
        ×
      </span>
      <a
        href="https://www.oceanbank.com/"
        target="_blank"
        rel="noopener noreferrer sponsored"
      >
        <img
          className="pel-partner-logo__sponsor"
          src={light ? oceanBankWhite : oceanBankBlue}
          alt="Ocean Bank"
          width={light ? 335 : 400}
          height={light ? 54 : 64}
          decoding="async"
        />
      </a>
    </div>
  );
}
