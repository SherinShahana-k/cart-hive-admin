import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Image,
  Linking,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { useAdmin } from '../context/AdminContext';
import {
  Search,
  Filter,
  MessageCircle,
  X,
  MapPin,
  User,
  Package,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  ChevronRight
} from 'lucide-react-native';

const OrdersScreen = () => {
  const {
    orders,
    updateOrderStatus,
    refreshing,
    refreshData
  } = useAdmin();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Status Filter Tabs
  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  // Filtering
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.phone?.includes(search) ||
      order.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: '#dcfce7', text: '#166534', icon: CheckCircle };
      case 'shipped': return { bg: '#dbeafe', text: '#1e40af', icon: Truck };
      case 'processing': return { bg: '#fef9c3', text: '#854d0e', icon: Clock };
      case 'cancelled': return { bg: '#fee2e2', text: '#991b1b', icon: XCircle };
      default: return { bg: '#f1f5f9', text: '#475569', icon: Clock };
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;
    setStatusUpdating(true);
    try {
      const result = await updateOrderStatus(selectedOrder.id, newStatus);
      if (result.success) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      } else {
        Alert.alert('Error', result.error || 'Failed to update order status');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const openWhatsApp = (phone, name, orderId) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Hello ${name}, this is regarding your order #${orderId.slice(0, 8)} from our store.`;
    const url = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to web link
          return Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`);
        }
      })
      .catch(() => Alert.alert('Error', 'Could not open WhatsApp. Ensure it is installed on your device.'));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <View style={styles.searchWrapper}>
          <Search size={18} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, phone, or order ID..."
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

      {/* Filter Tabs */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterTab, activeFilter === tab.id && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab.id)}
            >
              <Text style={[styles.filterTabText, activeFilter === tab.id && styles.filterTabActiveText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={refreshData}
        refreshing={refreshing}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Filter size={48} color="#94a3b8" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No matching orders</Text>
            <Text style={styles.emptySubtitle}>
              Ensure spelling is correct, try updating your filters, or check back later!
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = getStatusColor(item.status);
          const StatusIcon = status.icon;
          return (
            <TouchableOpacity
              style={styles.orderCard}
              onPress={() => setSelectedOrder(item)}
              activeOpacity={0.7}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(item.created_at).toLocaleDateString(undefined, { dateStyle: 'short' })}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  <StatusIcon size={10} color={status.text} style={{ marginRight: 4 }} />
                  <Text style={[styles.statusText, { color: status.text }]}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.orderBody}>
                <View style={styles.customerBlock}>
                  <Text style={styles.customerName}>{item.customer_name}</Text>
                  <Text style={styles.customerPhone}>{item.phone}</Text>
                </View>
                <View style={styles.amountBlock}>
                  <Text style={styles.orderAmount}>${Number(item.total_amount).toFixed(2)}</Text>
                  <Text style={styles.itemsCount}>{item.quantity} item(s)</Text>
                </View>
              </View>

              <View style={styles.productSnippet}>
                {item.products?.image && (
                  <Image source={{ uri: item.products.image }} style={styles.snippetImage} />
                )}
                <Text style={styles.snippetName} numberOfLines={1}>
                  {item.products?.name || 'Loading details...'}
                </Text>
                <ChevronRight size={14} color="#94a3b8" style={styles.snippetArrow} />
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Order Details Drawer */}
      <Modal
        visible={selectedOrder !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedOrder(null)}
      >
        {selectedOrder && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Order Details</Text>
                  <Text style={styles.modalSubTitle}>Order ID: #{selectedOrder.id}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalForm}
              >
                {/* Fulfillment Status Card */}
                <View style={styles.statusUpdateCard}>
                  <View style={styles.statusHeaderRow}>
                    <Text style={styles.statusLabel}>FULFILLMENT STATUS</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status).bg }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(selectedOrder.status).text }]}>
                        {selectedOrder.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.pickerTitle}>
                    <Text style={styles.pickerTitleText}>Change Status to:</Text>
                  </View>
                  {statusUpdating ? (
                    <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 12 }} />
                  ) : (
                    <View style={styles.statusButtonsGrid}>
                      {['pending', 'processing', 'shipped', 'completed', 'cancelled'].map((st) => (
                        <TouchableOpacity
                          key={st}
                          style={[
                            styles.statusGridBtn,
                            selectedOrder.status === st && styles.statusGridBtnActive,
                          ]}
                          onPress={() => handleUpdateStatus(st)}
                        >
                          <Text style={[
                            styles.statusGridBtnText,
                            selectedOrder.status === st && styles.statusGridBtnTextActive,
                          ]}>
                            {st}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Customer Info Card */}
                <View style={styles.detailCard}>
                  <View style={styles.detailHeader}>
                    <User size={16} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={styles.detailTitle}>Customer Details</Text>
                  </View>
                  <Text style={styles.infoPrimary}>{selectedOrder.customer_name}</Text>
                  <Text style={styles.infoSecondary}>{selectedOrder.email}</Text>
                  <TouchableOpacity
                    style={styles.whatsAppBtn}
                    onPress={() => openWhatsApp(selectedOrder.phone, selectedOrder.customer_name, selectedOrder.id)}
                    activeOpacity={0.8}
                  >
                    <MessageCircle size={18} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.whatsAppBtnText}>Chat on WhatsApp ({selectedOrder.phone})</Text>
                  </TouchableOpacity>
                </View>

                {/* Order Date Card */}
                <View style={styles.detailCard}>
                  <View style={styles.detailHeader}>
                    <Calendar size={16} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={styles.detailTitle}>Order Timeline</Text>
                  </View>
                  <Text style={styles.infoPrimary}>
                    {new Date(selectedOrder.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </Text>
                  <Text style={styles.infoSecondary}>
                    Placed at {new Date(selectedOrder.created_at).toLocaleTimeString()}
                  </Text>
                </View>

                {/* Shipping Address */}
                <View style={styles.detailCard}>
                  <View style={styles.detailHeader}>
                    <MapPin size={16} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={styles.detailTitle}>Shipping Destination</Text>
                  </View>
                  <View style={styles.addressBlock}>
                    <Text style={styles.addressPrimary}>{selectedOrder.address_line}</Text>
                    {selectedOrder.landmark && (
                      <Text style={styles.addressSecondary}>
                        <Text style={{ fontWeight: '700' }}>Landmark:</Text> {selectedOrder.landmark}
                      </Text>
                    )}
                    <Text style={styles.addressSecondary}>
                      {selectedOrder.district}, {selectedOrder.state}
                    </Text>
                    <Text style={styles.addressPincode}>Pincode: {selectedOrder.pincode}</Text>
                  </View>
                </View>

                {/* Item Ordered */}
                <View style={styles.detailCard}>
                  <View style={styles.detailHeader}>
                    <Package size={16} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={styles.detailTitle}>Items Ordered</Text>
                  </View>
                  <View style={styles.productDetailsBlock}>
                    {selectedOrder.products?.image && (
                      <Image source={{ uri: selectedOrder.products.image }} style={styles.prodImage} />
                    )}
                    <View style={styles.prodMeta}>
                      <Text style={styles.prodName}>{selectedOrder.products?.name}</Text>
                      <View style={styles.prodQuantities}>
                        <View>
                          <Text style={styles.labelMuted}>QUANTITY</Text>
                          <Text style={styles.valueStrong}>{selectedOrder.quantity}</Text>
                        </View>
                        <View style={{ marginLeft: 24 }}>
                          <Text style={styles.labelMuted}>TOTAL</Text>
                          <Text style={styles.valueStrongAccent}>
                            ${Number(selectedOrder.total_amount).toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {selectedOrder.customisation && (
                    <View style={styles.customisationNote}>
                      <Text style={styles.customisationLabel}>CUSTOMIZATION REQUEST:</Text>
                      <Text style={styles.customisationText}>{selectedOrder.customisation}</Text>
                    </View>
                  )}
                </View>

                {/* Receipt Upload */}
                <View style={styles.detailCard}>
                  <View style={styles.detailHeader}>
                    <CreditCard size={16} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={styles.detailTitle}>Payment Receipt</Text>
                  </View>
                  {selectedOrder.payment_reciept ? (
                    <View style={styles.receiptContainer}>
                      <Image
                        source={{ uri: selectedOrder.payment_reciept }}
                        style={styles.receiptImage}
                        resizeMode="contain"
                      />
                      <TouchableOpacity
                        style={styles.openReceiptLink}
                        onPress={() => Linking.openURL(selectedOrder.payment_reciept)}
                      >
                        <Text style={styles.openReceiptText}>View Full Size Image</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.noReceiptBlock}>
                      <CreditCard size={32} color="#94a3b8" strokeWidth={1} style={{ marginBottom: 6 }} />
                      <Text style={styles.noReceiptText}>No receipt uploaded by buyer</Text>
                    </View>
                  )}
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        )}
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
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
  filtersWrapper: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#2563eb',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  filterTabActiveText: {
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
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#f8fafc',
    paddingBottom: 12,
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  orderDate: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerBlock: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  customerPhone: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  itemsCount: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  productSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 10,
  },
  snippetImage: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  snippetName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  snippetArrow: {
    marginLeft: 4,
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
    height: '90%',
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
  modalSubTitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  modalForm: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  statusUpdateCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  pickerTitle: {
    marginBottom: 8,
  },
  pickerTitleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  statusButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  statusGridBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusGridBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  statusGridBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'capitalize',
  },
  statusGridBtnTextActive: {
    color: '#ffffff',
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 5,
    elevation: 0.5,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#f8fafc',
    paddingBottom: 8,
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  infoPrimary: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  infoSecondary: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 12,
  },
  whatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 10,
    height: 40,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  whatsAppBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  addressBlock: {
    lineHeight: 20,
  },
  addressPrimary: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 4,
  },
  addressSecondary: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  addressPincode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 6,
  },
  productDetailsBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prodImage: {
    width: 60,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  prodMeta: {
    flex: 1,
    marginLeft: 14,
  },
  prodName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  prodQuantities: {
    flexDirection: 'row',
    marginTop: 8,
  },
  labelMuted: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '700',
  },
  valueStrong: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  valueStrongAccent: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563eb',
    marginTop: 2,
  },
  customisationNote: {
    marginTop: 14,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  customisationLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  customisationText: {
    fontSize: 12,
    color: '#78350f',
    lineHeight: 16,
    fontWeight: '600',
  },
  receiptContainer: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  receiptImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  openReceiptLink: {
    marginTop: 10,
  },
  openReceiptText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  noReceiptBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noReceiptText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
});

export default OrdersScreen;
