import React, { useState } from 'react';

interface HistoricImageProps {
  src?: string;
  alt: string;
  className?: string;
}

/** Local illustration. If the file is missing, the surrounding text stays put. */
const HistoricImage: React.FC<HistoricImageProps> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};

export default HistoricImage;
