'use client';

import { useEffect, useState } from 'react';
import { SideCart } from '@/components/MiniCart/SideCart';

const SafeSideCart = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures the code below runs only after client mounts
    setIsClient(true);
  }, []);

  if (!isClient) return null; // or loading spinner

  return <SideCart />;
};

export default SafeSideCart;
