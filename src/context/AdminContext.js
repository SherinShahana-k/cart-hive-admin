import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [homeConfig, setHomeConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkPersistedSession();
  }, []);

  const checkPersistedSession = async () => {
    try {
      const savedUserStr = await AsyncStorage.getItem('carthive_user');
      if (savedUserStr) {
        const userData = JSON.parse(savedUserStr);
        setUser(userData);
        await fetchBusinessAndData(userData);
      }
    } catch (e) {
      console.error('Session persistence load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessAndData = async (userData) => {
    try {
      setRefreshing(true);
      
      // 1. Fetch Business
      const { data: biz, error: bizErr } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', userData.business_id)
        .single();
      
      if (bizErr) throw bizErr;
      setBusiness(biz);

      // 2. Fetch Homepage Config
      const { data: configs } = await supabase
        .from('homepage_content')
        .select('*')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      setHomeConfig(configs?.[0] || null);

      // 3. Fetch Categories
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('business_id', biz.id);
      
      setCategories(cats || []);

      // 4. Fetch Products
      const { data: prods } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('business_id', biz.id);
      
      setProducts(prods || []);

      // 5. Fetch Orders
      const { data: ords } = await supabase
        .from('orders')
        .select('*, products(name, image)')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false });
      
      setOrders(ords || []);

    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, businesses(*)')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        throw new Error('Invalid email or password');
      }

      setUser(data);
      await AsyncStorage.setItem('carthive_user', JSON.stringify(data));
      await fetchBusinessAndData(data);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setBusiness(null);
    setProducts([]);
    setCategories([]);
    setOrders([]);
    setHomeConfig(null);
    await AsyncStorage.removeItem('carthive_user');
  };

  const refreshData = async () => {
    if (user) {
      await fetchBusinessAndData(user);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Update state locally
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      return { success: true };
    } catch (e) {
      console.error('Update status error:', e);
      return { success: false, error: e.message };
    }
  };

  const addProduct = async (productData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          business_id: business.id,
        })
        .select()
        .single();

      if (error) throw error;
      await refreshData();
      return { success: true };
    } catch (e) {
      console.error('Add product error:', e);
      return { success: false, error: e.message };
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId);

      if (error) throw error;
      await refreshData();
      return { success: true };
    } catch (e) {
      console.error('Update product error:', e);
      return { success: false, error: e.message };
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      await refreshData();
      return { success: true };
    } catch (e) {
      console.error('Delete product error:', e);
      return { success: false, error: e.message };
    }
  };

  const addCategory = async (categoryData) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
          business_id: business.id,
        })
        .select()
        .single();

      if (error) throw error;
      await refreshData();
      return { success: true, data };
    } catch (e) {
      console.error('Add category error:', e);
      return { success: false, error: e.message };
    }
  };

  const updateCategory = async (categoryId, categoryData) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', categoryId);

      if (error) throw error;
      await refreshData();
      return { success: true };
    } catch (e) {
      console.error('Update category error:', e);
      return { success: false, error: e.message };
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      await refreshData();
      return { success: true };
    } catch (e) {
      console.error('Delete category error:', e);
      return { success: false, error: e.message };
    }
  };

  const publishStoreConfig = async (newConfig) => {
    try {
      const logo = newConfig.logo_url;

      // 1. Sync logo to business
      await supabase.from('businesses').update({
        logo_url: logo,
        logo: logo,
        store_logo: logo,
        avatar_url: logo
      }).eq('id', business.id);

      // 2. Extract fields
      const { id, created_at, logo_url, ...configToSave } = newConfig;

      // 3. Upsert to homepage_content
      const { error } = await supabase.from('homepage_content').upsert({
        ...configToSave,
        business_id: business.id,
        store_name: business.name,
        logo_url: logo,
      }, { onConflict: 'business_id' });

      if (error) throw error;
      await refreshData();
      return { success: true };
    } catch (e) {
      console.error('Publish storefront configuration error:', e);
      return { success: false, error: e.message };
    }
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        business,
        products,
        categories,
        orders,
        homeConfig,
        loading,
        refreshing,
        login,
        logout,
        refreshData,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        publishStoreConfig,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
