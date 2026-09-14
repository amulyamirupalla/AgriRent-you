import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('agrirent_cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('agrirent_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (equipment) => {
    setCart(prev => {
      // Check if already in cart
      if (prev.find(item => item._id === equipment._id)) {
        return prev;
      }
      return [...prev, { ...equipment, days: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id))
  }

  const updateDays = (id, days) => {
    setCart(prev => prev.map(item => 
      item._id === id ? { ...item, days: Math.max(1, days) } : item
    ))
  }

  const clearCart = () => setCart([])

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * (item.days || 1)), 0)
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateDays, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  )
}
