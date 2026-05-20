import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { AdminProvider, useAdmin } from './src/context/AdminContext';

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import StoreConfigScreen from './src/screens/StoreConfigScreen';
import PreviewScreen from './src/screens/PreviewScreen';

// Import Components
import Navigation from './src/components/Navigation';

function AppContent() {
  const { user, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen setActiveTab={setActiveTab} />;
      case 'orders':
        return <OrdersScreen />;
      case 'products':
        return <ProductsScreen />;
      case 'config':
        return <StoreConfigScreen />;
      case 'preview':
        return <PreviewScreen />;
      default:
        return <DashboardScreen setActiveTab={setActiveTab} />;
    }
  };

  return (
    <View style={styles.appContainer}>
      <ExpoStatusBar style="dark" />
      <View style={styles.screenWrapper}>
        {renderActiveScreen()}
      </View>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  screenWrapper: {
    flex: 1,
    paddingBottom: Platform.OS === 'android' ? 16 : 0,
  },
});
