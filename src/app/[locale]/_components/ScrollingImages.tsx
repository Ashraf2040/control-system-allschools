import React from 'react';
import styles from './ScrollingImages.module.css';

interface Image {
  src: string;
  alt: string;
}

interface ScrollingImagesProps {
  images: Image[];
}

const ScrollingImages: React.FC<ScrollingImagesProps> = ({ images }) => {
  return (
    <div className={styles.imageContainer}>
      <div className={styles.scrollingImages}>
        {images.map((image, index) => (
          <img key={index} src={image.src} alt={image.alt} className={styles.image} />
        ))}
        {/* Duplicate images for seamless looping */}
        {images.map((image, index) => (
          <img key={index + images.length} src={image.src} alt={image.alt} className={styles.image} />
        ))}
      </div>
    </div>
  );
};

export default ScrollingImages;
