import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAdmin } from '../context/AdminContext';
import { uploadImage } from '../lib/storage';
import { resolveStorefrontAsset } from '../lib/assets';
import { Plus, Search, Edit2, Trash2, X, Tag, Package, DollarSign, Upload, FolderPlus, Save, AlertCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ProductsScreen = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshing,
    refreshData
  } = useAdmin();

  // Search and Filter State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Product Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Category Management Modal State
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatCover, setNewCatCover] = useState('');
  const [catImageUploading, setCatImageUploading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editCatName, setEditCatName] = useState('');

  // Filtered Products
  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      item.categories?.name === selectedCategory ||
      (item.category_id && categories.find(c => c.id === item.category_id)?.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Handle Image Pick for Products
  const handlePickProductImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photo library to upload product images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setImageUploading(true);
        const uploadedUrl = await uploadImage(result.assets[0].uri, 'products');
        if (uploadedUrl) {
          setImageUrl(uploadedUrl);
        }
      }
    } catch (e) {
      console.error('Product image pick and upload error:', e);
      Alert.alert('Upload Error', 'Failed to upload selected image to Supabase.');
    } finally {
      setImageUploading(false);
    }
  };

  // Handle Image Pick for Categories
  const handlePickCategoryCover = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photo library to upload category images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setCatImageUploading(true);
        const uploadedUrl = await uploadImage(result.assets[0].uri, 'products');
        if (uploadedUrl) {
          setNewCatCover(uploadedUrl);
        }
      }
    } catch (e) {
      console.error('Category cover pick and upload error:', e);
      Alert.alert('Upload Error', 'Failed to upload category cover image.');
    } finally {
      setCatImageUploading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setStock('');
    setCategoryId(categories[0]?.id || '');
    setImageUrl('');
    setDescription('');
    setModalVisible(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name || '');
    setPrice(product.price ? String(product.price) : '');
    setStock(product.stock !== null ? String(product.stock) : '');
    setCategoryId(product.category_id || categories[0]?.id || '');
    setImageUrl(product.image || '');
    setDescription(product.description || '');
    setModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Product Name is required');
      return;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    if (stock && (isNaN(Number(stock)) || Number(stock) < 0)) {
      Alert.alert('Error', 'Please enter a valid stock level');
      return;
    }
    if (!categoryId) {
      Alert.alert('Error', 'Please select or create a category first.');
      return;
    }

    setSaving(true);
    const prodPayload = {
      name: name.trim(),
      price: Number(price),
      stock: stock ? Number(stock) : 0,
      category_id: categoryId || null,
      image: imageUrl.trim() || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500',
      description: description.trim(),
    };

    try {
      let result;
      if (editingProduct) {
        result = await updateProduct(editingProduct.id, prodPayload);
      } else {
        result = await addProduct(prodPayload);
      }

      if (result.success) {
        setModalVisible(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to save product');
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to permanently delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteProduct(productId);
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  // Add Category Handler
  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      Alert.alert('Error', 'Category name is required.');
      return;
    }

    try {
      const payload = {
        name: newCatName.trim(),
        discription: newCatDesc.trim(),
        cover_img: newCatCover || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300'
      };

      const result = await addCategory(payload);
      if (result.success) {
        setNewCatName('');
        setNewCatDesc('');
        setNewCatCover('');
        Alert.alert('Success', 'Category added successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to add category.');
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  // Delete Category Handler with active check
  const handleDeleteCategory = async (catId) => {
    const hasProducts = products.some(p => p.category_id === catId);
    if (hasProducts) {
      Alert.alert(
        'Action Blocked',
        'Cannot delete this category because it contains active products. Please delete or reassign those products first.'
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteCategory(catId);
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to delete category.');
            }
          }
        }
      ]
    );
  };

  // Edit Category Name Handler
  const handleSaveEditCategory = async (catId) => {
    if (!editCatName.trim()) return;

    try {
      const result = await updateCategory(catId, { name: editCatName.trim() });
      if (result.success) {
        setEditingCategoryId(null);
        setEditCatName('');
      } else {
        Alert.alert('Error', result.error || 'Failed to update category name.');
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search & Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.title}>Inventory</Text>
          <TouchableOpacity
            style={styles.categoryManageBtn}
            onPress={() => setCatModalVisible(true)}
            activeOpacity={0.7}
          >
            <FolderPlus size={16} color="#1e293b" style={{ marginRight: 6 }} />
            <Text style={styles.categoryManageBtnText}>Categories</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrapper}>
          <Search size={18} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Tabs Carousel */}
      <View style={styles.categoryTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[styles.categoryTab, selectedCategory === 'All' && styles.categoryTabActive]}
            onPress={() => setSelectedCategory('All')}
          >
            <Text style={[styles.categoryTabText, selectedCategory === 'All' && styles.categoryTabActiveText]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryTab, selectedCategory === cat.name && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(cat.name)}
            >
              <Text style={[styles.categoryTabText, selectedCategory === cat.name && styles.categoryTabActiveText]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={refreshData}
        refreshing={refreshing}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color="#94a3b8" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Try altering your filters, search queries, or add a brand new product to get started.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isLowStock = item.stock !== null && item.stock < 5;
          const itemCat = categories.find((c) => c.id === item.category_id)?.name || item.categories?.name || 'Uncategorized';
          return (
            <View style={styles.prodCard}>
              <Image source={resolveStorefrontAsset(item.image)} style={styles.prodImage} />
              <View style={styles.prodInfo}>
                <Text style={styles.prodName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.metaRow}>
                  <View style={styles.catBadge}>
                    <Tag size={10} color="#64748b" style={{ marginRight: 3 }} />
                    <Text style={styles.catBadgeText}>{itemCat}</Text>
                  </View>
                  <Text style={styles.prodPrice}>${Number(item.price).toFixed(2)}</Text>
                </View>
                <View style={styles.stockRow}>
                  <Text style={[styles.stockText, isLowStock && styles.stockTextLow]}>
                    {item.stock} in stock
                  </Text>
                  {isLowStock && <Text style={styles.lowStockBadge}>Low Stock</Text>}
                </View>
              </View>
              <View style={styles.actionsColumn}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => openEditModal(item)}
                >
                  <Edit2 size={16} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteProduct(item.id)}
                >
                  <Trash2 size={16} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Floating Add Product Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openAddModal}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* 1. Add/Edit Product Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalForm}
            >
              {/* Product Image Uploader */}
              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>Product Image</Text>
                <TouchableOpacity
                  style={styles.imageUploadBox}
                  onPress={handlePickProductImage}
                  activeOpacity={0.8}
                >
                  {imageUploading ? (
                    <View style={styles.uploaderCenter}>
                      <ActivityIndicator size="large" color="#2563eb" />
                      <Text style={styles.uploadBoxText}>Uploading to Supabase...</Text>
                    </View>
                  ) : imageUrl ? (
                    <View style={styles.uploadedContainer}>
                      <Image source={resolveStorefrontAsset(imageUrl)} style={styles.uploadedImage} />
                      <View style={styles.imageOverlayButton}>
                        <Upload size={16} color="#ffffff" style={{ marginRight: 6 }} />
                        <Text style={styles.imageOverlayButtonText}>Replace Image</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.uploaderCenter}>
                      <Upload size={32} color="#94a3b8" style={{ marginBottom: 8 }} />
                      <Text style={styles.uploadBoxTitle}>Select Gallery File</Text>
                      <Text style={styles.uploadBoxSub}>Supports high-resolution PNG & JPEG</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>Product Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Handmade Silver Bracelet"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.modalLabel}>Price ($) *</Text>
                  <View style={styles.iconInputWrapper}>
                    <DollarSign size={14} color="#64748b" style={{ marginRight: 4 }} />
                    <TextInput
                      style={[styles.modalInput, { borderWidth: 0, paddingHorizontal: 0, flex: 1 }]}
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                      placeholder="59.99"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.modalLabel}>Stock Level</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={stock}
                    onChangeText={setStock}
                    keyboardType="numeric"
                    placeholder="25"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={[styles.modalLabel, { marginBottom: 0 }]}>Category *</Text>
                  {categories.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible(false);
                        setCatModalVisible(true);
                      }}
                      style={styles.addCategoryHeaderLink}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.addCategoryHeaderLinkText}>+ Add Category</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {categories.length > 0 ? (
                  <View style={styles.pickerWrapper}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingVertical: 4 }}
                    >
                      {categories.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.categorySelectorTab,
                            categoryId === cat.id && styles.categorySelectorTabActive,
                          ]}
                          onPress={() => setCategoryId(cat.id)}
                        >
                          <Text style={[
                            styles.categorySelectorText,
                            categoryId === cat.id && styles.categorySelectorTextActive,
                          ]}>
                            {cat.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                  <View style={styles.noCategoriesWarning}>
                    <AlertCircle size={18} color="#be123c" style={{ marginRight: 8, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.noCategoriesWarningText}>You need to create at least one category before adding products.</Text>
                      <TouchableOpacity
                        style={styles.createFirstCatBtn}
                        onPress={() => {
                          setModalVisible(false);
                          setCatModalVisible(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <Plus size={12} color="#ffffff" style={{ marginRight: 4 }} />
                        <Text style={styles.createFirstCatBtnText}>Create First Category</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.modalLabel}>Description</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Tell customers about the design, materials, and sizes available..."
                  placeholderTextColor="#94a3b8"
                  multiline={true}
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, (saving || categories.length === 0) && styles.saveBtnDisabled]}
                onPress={handleSaveProduct}
                disabled={saving || categories.length === 0}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. Category Management Modal */}
      <Modal
        visible={catModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCatModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '90%' }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Categories</Text>
              <TouchableOpacity onPress={() => setCatModalVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
              {/* Add New Category Panel */}
              <View style={styles.addCategoryBox}>
                <Text style={styles.subPanelTitle}>Create New Category</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>Category Name *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newCatName}
                    onChangeText={setNewCatName}
                    placeholder="e.g. Fine Necklaces"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>Description</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newCatDesc}
                    onChangeText={setNewCatDesc}
                    placeholder="Brief collection theme..."
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* Category Cover Image Uploader */}
                <View style={styles.inputGroup}>
                  <Text style={styles.modalLabel}>Cover Image</Text>
                  <TouchableOpacity
                    style={[styles.imageUploadBox, { height: 110 }]}
                    onPress={handlePickCategoryCover}
                    activeOpacity={0.8}
                  >
                    {catImageUploading ? (
                      <ActivityIndicator size="small" color="#2563eb" />
                    ) : newCatCover ? (
                      <View style={styles.uploadedContainer}>
                        <Image source={resolveStorefrontAsset(newCatCover)} style={styles.uploadedImage} />
                        <View style={[styles.imageOverlayButton, { height: 28 }]}>
                          <Text style={[styles.imageOverlayButtonText, { fontSize: 10 }]}>Change</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.uploaderCenter}>
                        <Upload size={20} color="#94a3b8" style={{ marginBottom: 4 }} />
                        <Text style={[styles.uploadBoxTitle, { fontSize: 11 }]}>Pick Cover Image</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.saveBtn, { height: 42, marginTop: 4 }]}
                  onPress={handleAddCategory}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>Add Category</Text>
                </TouchableOpacity>
              </View>

              {/* Existing Categories List */}
              <Text style={[styles.subPanelTitle, { marginTop: 12, marginBottom: 12 }]}>
                Existing Categories
              </Text>

              {categories.map((cat) => {
                const isEditing = editingCategoryId === cat.id;
                return (
                  <View key={cat.id} style={styles.catItemRow}>
                    {cat.cover_img ? (
                      <Image source={resolveStorefrontAsset(cat.cover_img)} style={styles.catMiniThumb} />
                    ) : (
                      <View style={[styles.catMiniThumb, styles.catMiniThumbPlaceholder]}>
                        <Tag size={12} color="#64748b" />
                      </View>
                    )}

                    {isEditing ? (
                      <View style={styles.catEditRow}>
                        <TextInput
                          style={styles.catEditInput}
                          value={editCatName}
                          onChangeText={setEditCatName}
                          autoFocus
                        />
                        <TouchableOpacity
                          style={styles.catActionMini}
                          onPress={() => handleSaveEditCategory(cat.id)}
                        >
                          <Save size={16} color="#10b981" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.catActionMini}
                          onPress={() => setEditingCategoryId(null)}
                        >
                          <X size={16} color="#64748b" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.catNameRow}>
                        <Text style={styles.catRowText}>{cat.name}</Text>
                        <View style={styles.catActionsRow}>
                          <TouchableOpacity
                            style={styles.catActionMini}
                            onPress={() => {
                              setEditingCategoryId(cat.id);
                              setEditCatName(cat.name);
                            }}
                          >
                            <Edit2 size={14} color="#2563eb" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.catActionMini}
                            onPress={() => handleDeleteCategory(cat.id)}
                          >
                            <Trash2 size={14} color="#dc2626" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}

              {categories.length === 0 && (
                <Text style={styles.emptyCatText}>No categories generated yet.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  categoryManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryManageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    height: '100%',
  },
  categoryTabsContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  categoryScroll: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#2563eb',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  categoryTabActiveText: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 180,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#475569',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 32,
  },
  prodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 10,
    elevation: 1,
  },
  prodImage: {
    width: 64,
    height: 74,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  prodInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  prodName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  prodPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563eb',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  stockTextLow: {
    color: '#d97706',
  },
  lowStockBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    borderWidth: 0.5,
    borderColor: '#fee2e2',
  },
  actionsColumn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  editBtn: {
    backgroundColor: '#eff6ff',
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    marginBottom: 0,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 112 : 98,
    right: 20,
    backgroundColor: '#2563eb',
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '85%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalForm: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 60,
  },
  inputGroup: {
    marginBottom: 18,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    height: 46,
  },
  pickerWrapper: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  categorySelectorTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  categorySelectorTabActive: {
    backgroundColor: '#2563eb',
  },
  categorySelectorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  categorySelectorTextActive: {
    color: '#ffffff',
  },
  noCategoriesWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  noCategoriesWarningText: {
    fontSize: 12,
    color: '#be123c',
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: 8,
  },
  createFirstCatBtn: {
    backgroundColor: '#be123c',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  createFirstCatBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  addCategoryHeaderLink: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  addCategoryHeaderLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  imageUploadBox: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  uploaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  uploadBoxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  uploadBoxSub: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  uploadBoxText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '700',
    marginTop: 8,
  },
  uploadedContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlayButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: 'rgba(15,23,42,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlayButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnDisabled: {
    backgroundColor: '#93c5fd',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  addCategoryBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  subPanelTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  catItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
  },
  catMiniThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  catMiniThumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  catNameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  catRowText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  catActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catActionMini: {
    padding: 6,
    marginLeft: 4,
  },
  catEditRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  catEditInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    height: 32,
    paddingHorizontal: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  emptyCatText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 12,
    fontWeight: '600',
  },
});

export default ProductsScreen;
