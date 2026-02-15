import { useState, useCallback } from 'react';

export const useCoupons = () => {
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [couponHistory, setCouponHistory] = useState([]);

  const applyCoupon = useCallback((coupon) => {
    setActiveCoupon(coupon);
    setCouponHistory(prev => [{
      ...coupon,
      appliedAt: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const redeemCoupon = useCallback(() => {
    if (activeCoupon) {
      setCouponHistory(prev => 
        prev.map(c => 
          c.id === activeCoupon.id 
            ? {...c, redeemedAt: new Date().toISOString()} 
            : c
        )
      );
      setActiveCoupon(null);
    }
  }, [activeCoupon]);

  const removeCoupon = useCallback(() => {
    setActiveCoupon(null);
  }, []);

  return {
    activeCoupon,
    couponHistory,
    applyCoupon,
    redeemCoupon,
    removeCoupon,
    setActiveCoupon,
  };
};