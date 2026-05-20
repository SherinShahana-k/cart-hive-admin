import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image
} from 'react-native';
import { useAdmin } from '../context/AdminContext';
import { resolveStorefrontAsset } from '../lib/assets';
import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  LogOut
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ setActiveTab }) => {
  const {
    user,
    business,
    products,
    orders,
    refreshing,
    refreshData,
    logout
  } = useAdmin();

  // Calculations
  const completedOrders = orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const totalSalesStr = `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const lowStockProducts = products.filter(p => p.stock !== null && p.stock !== undefined && p.stock < 5);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return { bg: '#dcfce7', text: '#166534' };
      case 'shipped': return { bg: '#dbeafe', text: '#1e40af' };
      case 'processing': return { bg: '#fef9c3', text: '#854d0e' };
      case 'cancelled': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {business?.logo_url && !business.logo_url.endsWith('logo.svg') ? (
            <Image
              source={resolveStorefrontAsset(business.logo_url)}
              style={styles.storeLogo}
            />
          ) : (
            <View style={styles.storeLogoPlaceholder}>
              <Text style={styles.storeLogoPlaceholderText}>
                {business?.name ? business.name.charAt(0).toUpperCase() : 'B'}
              </Text>
            </View>
          )}
          <View style={styles.headerTitles}>
            <Text style={styles.greeting}>Hello, {user?.name || 'Store Owner'}</Text>
            <Text style={styles.storeName}>{business?.name || 'Your Boutique'}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={refreshData} style={styles.iconBtn}>
            <RefreshCw size={18} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={[styles.iconBtn, styles.logoutBtn]}>
            <LogOut size={18} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} colors={['#2563eb']} />
        }
      >
        {/* Payment Plan Status */}
        <View style={styles.planCard}>
          <View style={styles.planLeft}>
            <Text style={styles.planLabel}>ACTIVE BILLING PLAN</Text>
            <Text style={styles.planName}>{business?.payment_plan || 'Launch Free'}</Text>
          </View>
          <View style={styles.planBadge}>
            <TrendingUp size={14} color="#1e40af" />
            <Text style={styles.planBadgeText}>Active</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Revenue */}
          <View style={[styles.statCard, { width: width - 48 }]}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#ecfdf5' }]}>
              <DollarSign size={22} color="#10b981" />
            </View>
            <View style={styles.statDetails}>
              <Text style={styles.statLabel}>Total Sales</Text>
              <Text style={styles.statValue}>{totalSalesStr}</Text>
            </View>
          </View>

          {/* Orders */}
          <View style={[styles.statCard, { width: (width - 60) / 2 }]}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#eff6ff' }]}>
              <ShoppingBag size={20} color="#3b82f6" />
            </View>
            <View style={styles.statDetails}>
              <Text style={styles.statLabel}>Orders</Text>
              <Text style={styles.statValue}>{orders.length}</Text>
              {pendingOrders.length > 0 && (
                <Text style={styles.statSubText}>{pendingOrders.length} pending</Text>
              )}
            </View>
          </View>

          {/* Products */}
          <View style={[styles.statCard, { width: (width - 60) / 2 }]}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#fff7ed' }]}>
              <Package size={20} color="#f97316" />
            </View>
            <View style={styles.statDetails}>
              <Text style={styles.statLabel}>Products</Text>
              <Text style={styles.statValue}>{products.length}</Text>
              <Text style={styles.statSubText}>In Inventory</Text>
            </View>
          </View>
        </View>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <View style={styles.alertsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Inventory Alerts</Text>
              <View style={styles.alertCountBadge}>
                <Text style={styles.alertCountText}>{lowStockProducts.length}</Text>
              </View>
            </View>
            <View style={styles.alertsCard}>
              {lowStockProducts.slice(0, 3).map((prod) => (
                <View key={prod.id} style={styles.alertItem}>
                  <AlertTriangle size={18} color="#f59e0b" style={styles.alertIcon} />
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertName} numberOfLines={1}>
                      {prod.name}
                    </Text>
                    <Text style={styles.alertDetail}>
                      Only <Text style={styles.stockHighlight}>{prod.stock} items</Text> left in stock!
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.restockBtn}
                    onPress={() => setActiveTab('products')}
                  >
                    <Text style={styles.restockText}>Restock</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {lowStockProducts.length > 3 && (
                <TouchableOpacity
                  style={styles.moreAlertsBtn}
                  onPress={() => setActiveTab('products')}
                >
                  <Text style={styles.moreAlertsText}>
                    View remaining {lowStockProducts.length - 3} items
                  </Text>
                  <ChevronRight size={14} color="#f59e0b" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Recent Orders */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => setActiveTab('orders')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={14} color="#2563eb" />
            </TouchableOpacity>
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyCard}>
              <ShoppingBag size={32} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptySubtitle}>
                When customers purchase products from your site, they'll show up here.
              </Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {orders.slice(0, 3).map((order) => {
                const statusStyle = getStatusStyle(order.status);
                return (
                  <TouchableOpacity
                    key={order.id}
                    style={styles.orderCard}
                    onPress={() => setActiveTab('orders')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.orderLeft}>
                      <View style={styles.orderBadge}>
                        <Text style={styles.orderBadgeText}>#</Text>
                      </View>
                      <View style={styles.orderInfo}>
                        <Text style={styles.customerName}>{order.customer_name}</Text>
                        <Text style={styles.orderItemName} numberOfLines={1}>
                          {order.products?.name || 'Jewelry Piece'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.orderRight}>
                      <Text style={styles.orderAmount}>
                        ${Number(order.total_amount).toFixed(2)}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                          {order.status}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Space for Floating Bar */}
        <View style={{ height: 100 }} />
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
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeLogo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
  },
  storeLogoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  storeLogoPlaceholderText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  headerTitles: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logoutBtn: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginBottom: 20,
  },
  planLeft: {},
  planLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#3b82f6',
    letterSpacing: 1,
    marginBottom: 2,
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e40af',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e40af',
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statDetails: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  statSubText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  alertsContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  alertCountBadge: {
    backgroundColor: '#ef4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertCountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  alertsCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#fef08a',
  },
  alertIcon: {
    marginRight: 10,
  },
  alertInfo: {
    flex: 1,
  },
  alertName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350f',
  },
  alertDetail: {
    fontSize: 11,
    color: '#92400e',
    marginTop: 2,
  },
  stockHighlight: {
    fontWeight: '800',
    color: '#dc2626',
  },
  restockBtn: {
    backgroundColor: '#d97706',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  restockText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  moreAlertsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  moreAlertsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d97706',
    marginRight: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
    marginRight: 4,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#475569',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
  ordersList: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  orderBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#64748b',
  },
  orderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  orderItemName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});

export default DashboardScreen;
