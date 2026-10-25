'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MedicalItem, CartItem, SavedItem } from '@/types';

interface CartContextType {
  cart: CartItem[];
  saved: SavedItem[];
  addToCart: (item: MedicalItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleSaveItem: (item: MedicalItem) => boolean; // returns true if now saved, false if removed
  isSaved: (itemId: string) => boolean;
  cartTotal: number;
  cartRegularTotal: number;
  cartSavings: number;
  cartCount: number;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load cart and saved from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('prime_life_care_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
      const storedSaved = localStorage.getItem('prime_life_care_saved');
      if (storedSaved) {
        setSaved(JSON.parse(storedSaved));
      }
    } catch (e) {
      console.warn('Error reading cart from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('prime_life_care_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Error saving cart to localStorage', e);
    }
  }, [cart, isLoaded]);

  // Save saved wishlist to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('prime_life_care_saved', JSON.stringify(saved));
    } catch (e) {
      console.warn('Error saving wishlist to localStorage', e);
    }
  }, [saved, isLoaded]);

  const addToCart = (item: MedicalItem, quantity: number = 1) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((c) => c.item.id === item.id);
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity
        };
        return next;
      } else {
        return [...prev, { item, quantity }];
      }
    });
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.item.id === itemId ? { ...c, quantity } : c))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleSaveItem = (item: MedicalItem): boolean => {
    let nowSaved = false;
    setSaved((prev) => {
      const exists = prev.some((s) => s.item.id === item.id);
      if (exists) {
        nowSaved = false;
        return prev.filter((s) => s.item.id !== item.id);
      } else {
        nowSaved = true;
        return [...prev, { item, savedAt: new Date().toISOString() }];
      }
    });
    return nowSaved;
  };

  const isSaved = (itemId: string): boolean => {
    return saved.some((s) => s.item.id === itemId);
  };

  const cartTotal = cart.reduce((sum, c) => {
    const price = c.item.salePriceLKR || c.item.priceLKR || 0;
    return sum + price * c.quantity;
  }, 0);

  const cartRegularTotal = cart.reduce((sum, c) => {
    const regular = c.item.regularPriceLKR || c.item.salePriceLKR || c.item.priceLKR || 0;
    return sum + regular * c.quantity;
  }, 0);

  const cartSavings = Math.max(0, cartRegularTotal - cartTotal);

  const cartCount = cart.reduce((count, c) => count + c.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        saved,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleSaveItem,
        isSaved,
        cartTotal,
        cartRegularTotal,
        cartSavings,
        cartCount,
        isCartDrawerOpen,
        openCartDrawer: () => setIsCartDrawerOpen(true),
        closeCartDrawer: () => setIsCartDrawerOpen(false)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
