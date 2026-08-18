import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string; // unique id combining slug, size, productType
  slug: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  productType: string;
  image: string;
};

export type Discount = {
  type: 'percentage' | 'fixed';
  value: number;
  code: string;
};

interface CartState {
  items: CartItem[];
  discount: Discount | null;
  isDrawerOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyDiscount: (discount: Discount | null) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: null,
      isDrawerOpen: false,
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      addItem: (item) => {
        const id = `${item.slug}-${item.productType}-${item.size}`;
        set((state) => {
          const existingItem = state.items.find((i) => i.id === id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, id }] };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },
      applyDiscount: (discount) => set({ discount }),
      clearCart: () => set({ items: [], discount: null }),
      getTotal: () => {
        const subtotal = get().items.reduce((total, item) => total + item.price * item.quantity, 0);
        const discount = get().discount;
        if (!discount) return subtotal;
        
        if (discount.type === 'percentage') {
          return subtotal - (subtotal * (discount.value / 100));
        } else {
          return Math.max(0, subtotal - discount.value);
        }
      },
    }),
    {
      name: 'artisan-cart-storage',
    }
  )
);
