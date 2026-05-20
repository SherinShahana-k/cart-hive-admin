import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAdmin } from '../context/AdminContext';
import { uploadImage } from '../lib/storage';
import { resolveStorefrontAsset } from '../lib/assets';
import { Save, Globe, Phone, Mail, Award, Lock, ShieldCheck, Heart, Upload, Image as ImageIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const StoreConfigScreen = () => {
  const { homeConfig, publishStoreConfig, business } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState('branding');
  const [publishing, setPublishing] = useState(false);

  // Form States
  const [logoUrl, setLogoUrl] = useState('');
  const [heroHeading, setHeroHeading] = useState('');
  const [heroSubtext, setHeroSubtext] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [tickerText, setTickerText] = useState('');
  const [footerAbout, setFooterAbout] = useState('');
  const [ourStory, setOurStory] = useState('');

  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [physicalAddress, setPhysicalAddress] = useState('');

  const [terms, setTerms] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [shipping, setShipping] = useState('');
  const [refund, setRefund] = useState('');

  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Upload Loading States
  const [logoUploading, setLogoUploading] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  useEffect(() => {
    if (homeConfig) {
      setLogoUrl(homeConfig.logo_url || '');
      setHeroHeading(homeConfig.hero_heading || '');
      setHeroSubtext(homeConfig.hero_subtext || '');
      setHeroImage(homeConfig.hero_image || '');
      setBannerTitle(homeConfig.banner_title || '');
      setBannerSubtitle(homeConfig.banner_subtitle || '');
      setBannerImage(homeConfig.banner_image || '');
      setTickerText(homeConfig.ticker_text || '');
      setFooterAbout(homeConfig.footer_about || '');
      setOurStory(homeConfig.our_story || '');

      setSupportEmail(homeConfig.support_email || '');
      setSupportPhone(homeConfig.support_phone || '');
      setPhysicalAddress(homeConfig.physical_address || '');

      setTerms(homeConfig.terms_and_conditions || '');
      setPrivacy(homeConfig.privacy_policy || '');
      setShipping(homeConfig.shipping_policy || '');
      setRefund(homeConfig.refund_policy || '');

      setInstagram(homeConfig.instagram_link || '');
      setFacebook(homeConfig.facebook_link || '');
      setTwitter(homeConfig.twitter_link || '');
      setLinkedin(homeConfig.linkedin_link || '');
      setWhatsapp(homeConfig.whatsapp_link || '');
    }
  }, [homeConfig]);

  // Picker Handlers
  const handlePickLogo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photo library to upload a store logo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setLogoUploading(true);
        const uploadedUrl = await uploadImage(result.assets[0].uri, 'logos');
        if (uploadedUrl) {
          setLogoUrl(uploadedUrl);
        }
      }
    } catch (e) {
      console.error('Logo upload error:', e);
      Alert.alert('Upload Error', 'Failed to upload store logo.');
    } finally {
      setLogoUploading(false);
    }
  };

  const handlePickHeroImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photo library to upload a hero banner image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setHeroUploading(true);
        const uploadedUrl = await uploadImage(result.assets[0].uri, 'homepage');
        if (uploadedUrl) {
          setHeroImage(uploadedUrl);
        }
      }
    } catch (e) {
      console.error('Hero image upload error:', e);
      Alert.alert('Upload Error', 'Failed to upload hero background image.');
    } finally {
      setHeroUploading(false);
    }
  };

  const handlePickBannerImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photo library to upload a promo banner image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setBannerUploading(true);
        const uploadedUrl = await uploadImage(result.assets[0].uri, 'homepage');
        if (uploadedUrl) {
          setBannerImage(uploadedUrl);
        }
      }
    } catch (e) {
      console.error('Promo banner image upload error:', e);
      Alert.alert('Upload Error', 'Failed to upload banner background image.');
    } finally {
      setBannerUploading(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    const updatedConfig = {
      ...homeConfig,
      logo_url: logoUrl.trim(),
      hero_heading: heroHeading.trim(),
      hero_subtext: heroSubtext.trim(),
      hero_image: heroImage.trim(),
      banner_title: bannerTitle.trim(),
      banner_subtitle: bannerSubtitle.trim(),
      banner_image: bannerImage.trim(),
      ticker_text: tickerText.trim(),
      footer_about: footerAbout.trim(),
      our_story: ourStory.trim(),

      support_email: supportEmail.trim(),
      support_phone: supportPhone.trim(),
      physical_address: physicalAddress.trim(),

      terms_and_conditions: terms.trim(),
      privacy_policy: privacy.trim(),
      shipping_policy: shipping.trim(),
      refund_policy: refund.trim(),

      instagram_link: instagram.trim(),
      facebook_link: facebook.trim(),
      twitter_link: twitter.trim(),
      linkedin_link: linkedin.trim(),
      whatsapp_link: whatsapp.trim(),
    };

    try {
      const result = await publishStoreConfig(updatedConfig);
      if (result.success) {
        Alert.alert('Success', 'Storefront designs and content published successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to publish changes');
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred during publishing');
    } finally {
      setPublishing(false);
    }
  };

  const subTabs = [
    { id: 'branding', label: 'Branding', icon: Award },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'policies', label: 'Policies', icon: ShieldCheck },
    { id: 'socials', label: 'Socials', icon: Globe },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Store Design</Text>
        <TouchableOpacity
          style={[styles.publishBtn, publishing && styles.publishBtnDisabled]}
          onPress={handlePublish}
          disabled={publishing}
          activeOpacity={0.8}
        >
          {publishing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Save size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.publishBtnText}>Publish</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Sub Tabs */}
      <View style={styles.subTabsContainer}>
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.subTab, isActive && styles.subTabActive]}
              onPress={() => setActiveSubTab(tab.id)}
            >
              <Icon size={14} color={isActive ? '#2563eb' : '#64748b'} style={{ marginRight: 4 }} />
              <Text style={[styles.subTabText, isActive && styles.subTabActiveText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Form Content */}
      <ScrollView
        contentContainerStyle={styles.formScroll}
        showsVerticalScrollIndicator={false}
      >
        {activeSubTab === 'branding' && (
          <View>
            <Text style={styles.sectionHeader}>Branding & Identity</Text>
            
            {/* Logo Picker Row */}
            <View style={styles.logoPickerRow}>
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={styles.inputLabel}>Store Logo</Text>
                <Text style={styles.pickerHelpText}>Recommended: high-quality 1:1 circular transparent PNG branding files.</Text>
              </View>
              <TouchableOpacity
                style={styles.logoUploaderBox}
                onPress={handlePickLogo}
                activeOpacity={0.8}
              >
                {logoUploading ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : logoUrl && !logoUrl.endsWith('logo.svg') ? (
                  <Image source={resolveStorefrontAsset(logoUrl)} style={styles.logoPreview} />
                ) : (
                  <View style={styles.logoMonogramPlaceholder}>
                    <Text style={styles.logoMonogramPlaceholderText}>
                      {business?.name ? business.name.charAt(0).toUpperCase() : 'B'}
                    </Text>
                  </View>
                )}
                <View style={styles.logoLabelBadge}>
                  <Text style={styles.logoLabelBadgeText}>Edit</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hero Main Title</Text>
              <TextInput
                style={styles.textInput}
                value={heroHeading}
                onChangeText={setHeroHeading}
                placeholder="e.g. Timeless Elegance"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hero Subtext Tagline</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={heroSubtext}
                onChangeText={setHeroSubtext}
                placeholder="e.g. Handcrafted jewelry for your precious moments."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Hero Banner Uploader */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hero Header Background Image</Text>
              <TouchableOpacity
                style={styles.horizontalUploader}
                onPress={handlePickHeroImage}
                activeOpacity={0.8}
              >
                {heroUploading ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : heroImage ? (
                  <View style={styles.fullSizeContainer}>
                    <Image source={resolveStorefrontAsset(heroImage)} style={styles.horizontalPreview} />
                    <View style={styles.overlayTextPill}>
                      <Text style={styles.overlayTextPillText}>Replace Image</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.horizontalUploaderPlaceholder}>
                    <ImageIcon size={22} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Text style={styles.uploaderPlaceholderText}>Select Header Image File</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionHeader}>Promo Banner Section</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Banner Title</Text>
              <TextInput
                style={styles.textInput}
                value={bannerTitle}
                onChangeText={setBannerTitle}
                placeholder="e.g. Exquisite Collections"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Banner Subtitle</Text>
              <TextInput
                style={styles.textInput}
                value={bannerSubtitle}
                onChangeText={setBannerSubtitle}
                placeholder="e.g. Discover our latest handcrafted gold."
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Promo Banner Uploader */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Promo Banner Background Image</Text>
              <TouchableOpacity
                style={styles.horizontalUploader}
                onPress={handlePickBannerImage}
                activeOpacity={0.8}
              >
                {bannerUploading ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : bannerImage ? (
                  <View style={styles.fullSizeContainer}>
                    <Image source={resolveStorefrontAsset(bannerImage)} style={styles.horizontalPreview} />
                    <View style={styles.overlayTextPill}>
                      <Text style={styles.overlayTextPillText}>Replace Image</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.horizontalUploaderPlaceholder}>
                    <ImageIcon size={22} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Text style={styles.uploaderPlaceholderText}>Select Banner Image File</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionHeader}>Marquee & About</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ticker Text (Floating Marquee)</Text>
              <TextInput
                style={styles.textInput}
                value={tickerText}
                onChangeText={setTickerText}
                placeholder="NEW ARRIVALS: Handcrafted Gold & Silver Collections..."
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Footer Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={footerAbout}
                onChangeText={setFooterAbout}
                placeholder="Dedicated to fine designs, crafting stories..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Our Story (Extended About)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={ourStory}
                onChangeText={setOurStory}
                placeholder="Describe your boutique's history, methods, and vision..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={6}
              />
            </View>
          </View>
        )}

        {activeSubTab === 'contact' && (
          <View>
            <Text style={styles.sectionHeader}>Support & Contacts</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Support Email Address</Text>
              <View style={styles.iconInputWrapper}>
                <Mail size={16} color="#64748b" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.iconTextInput}
                  value={supportEmail}
                  onChangeText={setSupportEmail}
                  placeholder="support@yourstore.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Support Phone Number</Text>
              <View style={styles.iconInputWrapper}>
                <Phone size={16} color="#64748b" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.iconTextInput}
                  value={supportPhone}
                  onChangeText={setSupportPhone}
                  placeholder="+1 123 456 7890"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Physical Store Address</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={physicalAddress}
                onChangeText={setPhysicalAddress}
                placeholder="123 Luxury Road, Jewelry Plaza, Suite 402"
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {activeSubTab === 'policies' && (
          <View>
            <Text style={styles.sectionHeader}>Legal & Policy Standards</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Terms & Conditions</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={terms}
                onChangeText={setTerms}
                placeholder="Describe guidelines for browsing, purchasing, and store ownership..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={5}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Privacy Policy</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={privacy}
                onChangeText={setPrivacy}
                placeholder="Detail how you protect client data and processing receipts..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={5}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Shipping Policy</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={shipping}
                onChangeText={setShipping}
                placeholder="Shipping duration, processing periods, rates..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Refund & Return Policy</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={refund}
                onChangeText={setRefund}
                placeholder="Eligibility periods, refund criteria..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        )}

        {activeSubTab === 'socials' && (
          <View>
            <Text style={styles.sectionHeader}>Social Integrations</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Instagram Profile Link</Text>
              <TextInput
                style={styles.textInput}
                value={instagram}
                onChangeText={setInstagram}
                placeholder="https://instagram.com/your_boutique"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Facebook Link</Text>
              <TextInput
                style={styles.textInput}
                value={facebook}
                onChangeText={setFacebook}
                placeholder="https://facebook.com/your_boutique"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Twitter / X Link</Text>
              <TextInput
                style={styles.textInput}
                value={twitter}
                onChangeText={setTwitter}
                placeholder="https://twitter.com/your_boutique"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>LinkedIn Link</Text>
              <TextInput
                style={styles.textInput}
                value={linkedin}
                onChangeText={setLinkedin}
                placeholder="https://linkedin.com/company/your_boutique"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>WhatsApp API Link</Text>
              <TextInput
                style={styles.textInput}
                value={whatsapp}
                onChangeText={setWhatsapp}
                placeholder="https://wa.me/11234567890"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
              />
            </View>
          </View>
        )}

        {/* Space for Bottom Tab */}
        <View style={{ height: 160 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 36,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  publishBtnDisabled: {
    backgroundColor: '#93c5fd',
  },
  publishBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    justifyContent: 'space-between',
  },
  subTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subTabActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  subTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  subTabActiveText: {
    color: '#2563eb',
  },
  formScroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  logoPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  pickerHelpText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 4,
  },
  logoUploaderBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  logoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoMonogramPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMonogramPlaceholderText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  logoLabelBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: 'rgba(37,99,235,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLabelBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
  },
  horizontalUploader: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullSizeContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  horizontalPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayTextPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(15,23,42,0.65)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  overlayTextPillText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  horizontalUploaderPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploaderPlaceholderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  iconInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    height: 46,
  },
  iconTextInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    height: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 20,
  },
});

export default StoreConfigScreen;
