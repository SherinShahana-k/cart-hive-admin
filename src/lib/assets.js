/**
 * Resolves storefront images by mapping web bundle imports or fallbacks
 * to local bundled assets, or handles dynamic Supabase HTTPS URLs directly.
 * 
 * @param {string|number|object} imageSource - The image source from database or state
 * @returns {object|number} - React Native compatible Image source
 */
export const resolveStorefrontAsset = (imageSource) => {
  if (!imageSource) {
    // Default global placeholder
    return require('../assets/hero-img.avif');
  }

  // If it's already a local require resource ID (number), return it directly
  if (typeof imageSource === 'number') {
    return imageSource;
  }

  // If it's an object (e.g., { uri: '...' }), return it directly
  if (typeof imageSource === 'object' && imageSource.uri) {
    return imageSource;
  }

  // If it's a standard network URL or local device file path, load it as URI
  if (
    typeof imageSource === 'string' &&
    (imageSource.startsWith('http://') ||
      imageSource.startsWith('https://') ||
      imageSource.startsWith('file://') ||
      imageSource.startsWith('ph://') ||
      imageSource.startsWith('data:image'))
  ) {
    return { uri: imageSource };
  }

  // Check if it's a web bundle path import (e.g. "../../assets/hero-img.avif")
  if (typeof imageSource === 'string') {
    // Extract the final filename
    const filename = imageSource.split('/').pop()?.split('?')[0];

    switch (filename) {
      case 'logo.svg':
      case 'logo.png':
        // SVGs aren't natively supported, return bundled adaptive icon as logo fallback
        return require('../../assets/icon.png');
      case 'hero-img.avif':
        return require('../assets/hero-img.avif');
      case 'banner.avif':
        return require('../assets/banner.avif');
      
      // Category Covers
      case 'category-bracelet.jpg':
        return require('../assets/category-bracelet.jpg');
      case 'category-chain.jpg':
        return require('../assets/category-chain.jpg');
      case 'category-earing.avif':
        return require('../assets/category-earing.avif');
      case 'category-ring.jpg':
        return require('../assets/category-ring.jpg');

      // Best Sellers
      case 'bestseller-1.jpg':
        return require('../assets/bestseller-1.jpg');
      case 'bestseller2.png':
        return require('../assets/bestseller2.png');
      case 'bestseller3.jpg':
        return require('../assets/bestseller3.jpg');
      case 'bestseller4.jpg':
        return require('../assets/bestseller4.jpg');
      case 'bestseller5.jpg':
        return require('../assets/bestseller5.jpg');

      // Instagram feeds
      case 'insta-1.jpg':
        return require('../assets/insta-1.jpg');
      case 'insta2.jpg':
        return require('../assets/insta2.jpg');
      case 'insta3.jpg':
        return require('../assets/insta3.jpg');
      case 'insta4.jpg':
        return require('../assets/insta4.jpg');
      case 'insta5.jpg':
        return require('../assets/insta5.jpg');
      case 'insta6.jpg':
        return require('../assets/insta6.jpg');

      default:
        // Attempt to render as network URI
        return { uri: imageSource };
    }
  }

  return { uri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500' };
};
