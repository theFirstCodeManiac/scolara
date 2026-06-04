import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const baseStyles = 'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-800 flex-shrink-0';

  const showImage = src && !imgError;

  return (
    <div className={`${baseStyles} ${sizes[size]} ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-semibold text-gray-300 select-none">
          {initials || '?'}
        </span>
      )}
    </div>
  );
};
