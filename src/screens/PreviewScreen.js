import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useAdmin } from '../context/AdminContext';
import { resolveStorefrontAsset } from '../lib/assets';
import { ShoppingBag, Eye, Heart, MessageCircle, Mail, Phone, MapPin, Tag } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PreviewScreen = () => {
  const { business, products, categories, homeConfig } = useAdmin();

  // Fallbacks matched exactly with the web portal storefront
  const defaults = {
    logo_url: '../../assets/logo.svg',
    hero_image: '../../assets/hero-img.avif',
    hero_heading: 'Timeless Elegance',
    hero_subtext: 'Handcrafted jewelry for your most precious moments.',
    banner_image: '../../assets/banner.avif',
    banner_title: 'Exquisite Collections',
    banner_subtitle: 'Discover our latest handcrafted bracelets and rings.',
    ticker_text: 'NEW ARRIVALS: Handcrafted Gold & Silver Collections • Worldwide Shipping • Ethical & Sustainable • ',
    footer_about: 'Dedicated to the art of fine jewelry, we craft pieces that tell your unique story with elegance and precision.',
    our_story: 'Dedicated to the art of fine jewelry, we craft pieces that tell your unique story with elegance and precision. Our journey began with a simple passion for transforming raw materials into timeless treasures. Today, we celebrate individuality and bring radiant confidence to everyone who wears our collections.',
    support_email: `support@${business?.name?.toLowerCase().replace(/\s/g, '') || 'store'}.com`,
    support_phone: '+1 123 456 7890',
    physical_address: '123 Jewelry Lane, Luxury City',
  };

  const config = {
    logo_url: homeConfig?.logo_url || business?.logo_url || defaults.logo_url,
    hero_image: homeConfig?.hero_image || defaults.hero_image,
    hero_heading: homeConfig?.hero_heading || defaults.hero_heading,
    hero_subtext: homeConfig?.hero_subtext || defaults.hero_subtext,
    banner_image: homeConfig?.banner_image || defaults.banner_image,
    banner_title: homeConfig?.banner_title || defaults.banner_title,
    banner_subtitle: homeConfig?.banner_subtitle || defaults.banner_subtitle,
    ticker_text: homeConfig?.ticker_text || defaults.ticker_text,
    footer_about: homeConfig?.footer_about || defaults.footer_about,
    our_story: homeConfig?.our_story || defaults.our_story,
    support_email: homeConfig?.support_email || defaults.support_email,
    support_phone: homeConfig?.support_phone || defaults.support_phone,
    physical_address: homeConfig?.physical_address || defaults.physical_address,
  };

  // Mock fallbacks matching initial web assets
  const mockProducts = [
    { id: 'm1', name: 'Midnight Bloom Earrings', price: 125, image: '../../assets/bestseller-1.jpg', description: 'Exquisitely handcrafted earrings featuring a delicate floral pattern.' },
    { id: 'm2', name: 'Ethereal Silver Chain', price: 210, image: '../../assets/best seller2.png', description: 'A timeless sterling silver chain that adds a touch of grace to any outfit.' },
    { id: 'm3', name: 'Golden Aura Bracelet', price: 185, image: '../../assets/best seller-3.jpg', description: 'A sophisticated gold-plated bracelet designed for everyday elegance.' },
  ];

  // Category fallback images matching initial web assets
  const mockCategories = [
    { id: 'c1', name: 'Bracelets', cover_img: '../../assets/category-bracelet.jpg' },
    { id: 'c2', name: 'Chains', cover_img: '../../assets/category-chain.jpg' },
    { id: 'c3', name: 'Earrings', cover_img: '../../assets/category-earing.avif' },
    { id: 'c4', name: 'Rings', cover_img: '../../assets/category-ring.jpg' },
  ];

  const displayProducts = products.length > 0 ? products : mockProducts;
  const displayCategories = categories.length > 0 ? categories : mockCategories;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Top Banner indicating preview mode */}
      <View style={styles.previewModeHeader}>
        <Eye size={14} color="#1e40af" style={{ marginRight: 6 }} />
        <Text style={styles.previewModeText}>Interactive Storefront Mobile Preview</Text>
      </View>

      {/* Simulated Device Frame Wrapper */}
      <View style={styles.deviceWrapper}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. Simulated Store Header */}
          <View style={styles.storeHeader}>
            <View style={styles.storeHeaderLeft}>
              {config.logo_url && !config.logo_url.endsWith('logo.svg') ? (
                <Image source={resolveStorefrontAsset(config.logo_url)} style={styles.storeHeaderLogo} />
              ) : (
                <View style={styles.storeHeaderLogoPlaceholder}>
                  <Text style={styles.storeHeaderLogoPlaceholderText}>
                    {business?.name ? business.name.charAt(0).toUpperCase() : 'B'}
                  </Text>
                </View>
              )}
              <Text style={styles.storeHeaderTitle}>{business?.name || 'Your Boutique'}</Text>
            </View>
            <TouchableOpacity style={styles.cartIconWrapper} disabled>
              <ShoppingBag size={18} color="#0f172a" />
              <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>0</Text></View>
            </TouchableOpacity>
          </View>

          {/* 2. Hero Section */}
          <View style={styles.heroSection}>
            <Image source={resolveStorefrontAsset(config.hero_image)} style={styles.heroBg} />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{config.hero_heading}</Text>
              <Text style={styles.heroSubtitle}>{config.hero_subtext}</Text>
              <View style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>SHOP NOW</Text>
              </View>
            </View>
          </View>

          {/* 3. Ticker Marquee */}
          <View style={styles.tickerContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
              <Text style={styles.tickerText}>{config.ticker_text.repeat(3)}</Text>
            </ScrollView>
          </View>

          {/* 4. Best Sellers Product Grid */}
          <View style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Best Sellers</Text>
            <View style={styles.productsGrid}>
              {displayProducts.map((prod) => (
                <View key={prod.id} style={styles.prodCard}>
                  <View style={styles.prodImgWrapper}>
                    <Image source={resolveStorefrontAsset(prod.image)} style={styles.prodImg} />
                    <TouchableOpacity style={styles.favBtn} disabled>
                      <Heart size={14} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.prodDetails}>
                    <Text style={styles.prodName} numberOfLines={1}>{prod.name}</Text>
                    <Text style={styles.prodDesc} numberOfLines={2}>{prod.description}</Text>
                    <View style={styles.prodPriceRow}>
                      <Text style={styles.prodPrice}>${Number(prod.price).toFixed(2)}</Text>
                      <TouchableOpacity style={styles.addToCartBtn} disabled>
                        <ShoppingBag size={12} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 5. Promotional Banner Section */}
          <View style={styles.promoBanner}>
            <Image source={resolveStorefrontAsset(config.banner_image)} style={styles.promoBg} />
            <View style={styles.promoOverlay} />
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>{config.banner_title}</Text>
              <Text style={styles.promoSubtitle}>{config.banner_subtitle}</Text>
              <View style={styles.promoBtn}>
                <Text style={styles.promoBtnText}>Shop Collection</Text>
              </View>
            </View>
          </View>

          {/* 6. Shop by Category (Restructured Below Featured Banner as Rounded Cards) */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catScroll}
            >
              {displayCategories.map((cat, idx) => {
                const sampleProduct = products.find((p) => p.category_id === cat.id);
                const displayImage = cat.cover_img || sampleProduct?.image || '../../assets/hero-img.avif';
                return (
                  <View key={cat.id || idx} style={styles.catCard}>
                    <Image source={resolveStorefrontAsset(displayImage)} style={styles.catCardBg} />
                    <View style={styles.catCardOverlay} />
                    <View style={styles.catLabelPill}>
                      <Text style={styles.catLabelText} numberOfLines={1}>
                        {cat.name}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* 7. Our Story */}
          <View style={styles.storySection}>
            <Text style={styles.storyHeader}>OUR STORY</Text>
            <Text style={styles.storyBody}>{config.our_story}</Text>
          </View>

          {/* 8. Footer Contacts */}
          <View style={styles.footer}>
            <Text style={styles.footerLogo}>{business?.name || 'Your Boutique'}</Text>
            <Text style={styles.footerDesc}>{config.footer_about}</Text>
            
            <View style={styles.contactDetails}>
              <View style={styles.contactItem}>
                <Phone size={14} color="#94a3b8" />
                <Text style={styles.contactText}>{config.support_phone}</Text>
              </View>
              <View style={styles.contactItem}>
                <Mail size={14} color="#94a3b8" />
                <Text style={styles.contactText}>{config.support_email}</Text>
              </View>
              <View style={styles.contactItem}>
                <MapPin size={14} color="#94a3b8" />
                <Text style={styles.contactText}>{config.physical_address}</Text>
              </View>
            </View>

            <View style={styles.footerBottom}>
              <Text style={styles.footerBottomText}>© 2026 {business?.name || 'Boutique'}. All rights reserved.</Text>
              <Text style={styles.footerPowered}>Powered by CartHive</Text>
            </View>
          </View>

          {/* Bottom padding spacing for Tab Bar */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  previewModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderBottomWidth: 1,
    borderColor: '#bfdbfe',
    paddingVertical: 8,
  },
  previewModeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e40af',
  },
  deviceWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    backgroundColor: '#ffffff',
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  storeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeHeaderLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  storeHeaderLogoPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  storeHeaderLogoPlaceholderText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  storeHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginLeft: 8,
  },
  cartIconWrapper: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#2563eb',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
  },
  heroSection: {
    height: 320,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#f1f5f9',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  heroBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  heroBtnText: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  tickerContainer: {
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tickerText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  categoriesSection: {
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    paddingHorizontal: 16,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  catScroll: {
    paddingHorizontal: 12,
  },
  catCard: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginHorizontal: 6,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  catCardBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  catCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
  },
  catLabelPill: {
    backgroundColor: '#rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  catLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a',
    textTransform: 'capitalize',
  },
  productsSection: {
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  prodCard: {
    width: (width - 36) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
    overflow: 'hidden',
  },
  prodImgWrapper: {
    height: 160,
    position: 'relative',
    backgroundColor: '#f8fafc',
  },
  prodImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodDetails: {
    padding: 10,
  },
  prodName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  prodDesc: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 14,
    height: 28,
    marginBottom: 8,
  },
  prodPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prodPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563eb',
  },
  addToCartBtn: {
    backgroundColor: '#0f172a',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBanner: {
    height: 220,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  promoBg: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  promoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  promoContent: {
    alignItems: 'center',
    zIndex: 2,
    paddingHorizontal: 20,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 11,
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 14,
  },
  promoBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  promoBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  storySection: {
    paddingVertical: 30,
    paddingHorizontal: 24,
    backgroundColor: '#fbfbfb',
    alignItems: 'center',
  },
  storyHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 2,
    marginBottom: 14,
  },
  storyBody: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#0f172a',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  footerLogo: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  footerDesc: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
    marginBottom: 20,
  },
  contactDetails: {
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    color: '#94a3b8',
    fontSize: 11,
    marginLeft: 8,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderColor: '#1e293b',
    paddingTop: 16,
    alignItems: 'center',
  },
  footerBottomText: {
    color: '#64748b',
    fontSize: 9,
    marginBottom: 4,
  },
  footerPowered: {
    color: '#3b82f6',
    fontSize: 9,
    fontWeight: '700',
  },
});

export default PreviewScreen;
