import React, { useState } from 'react';

interface HistoricImageProps {
  src?: string;
  alt: string;
  /** Size, margin, radius, and border. Applied to a frame that keeps its height before the file loads. */
  className?: string;
  /** Extra classes for the image itself, such as object-top. */
  imgClassName?: string;
}

/**
 * Local illustration. The frame keeps its height while the file loads so the
 * page does not jump, then fades the picture in. A missing file leaves no broken icon.
 */
const HistoricImage: React.FC<HistoricImageProps> = ({ src, alt, className = '', imgClassName = '' }) => {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  if (!src || failed) return null;

  return (
    <div className={`relative overflow-hidden bg-imperial-parchment/40 ${className}`} aria-busy={!ready}>
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${ready ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        onLoad={() => setReady(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
};

export default HistoricImage;
