'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

import { UseSiteContext } from '@/SiteContext/SiteContext';
import { ProductType } from '@/lib/types/productType';
import { addOnType } from '@/lib/types/addOnType';

export default function Products() {
  const {
    productCategoryIdG,
    productToSearchQuery,
    setAllProduct,
  } = UseSiteContext();

  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [variants, setVariants] = useState<ProductType[]>([]);
  const [addOns] = useState<addOnType[]>([]);

  const [modifierGroups, setModifierGroups] = useState<any[]>([]);
  const [productModifiers, setProductModifiers] = useState<any[]>([]);

  // ===============================
  // LOAD PRODUCTS FROM SQLITE
  // ===============================
  useEffect(() => {
    async function loadProducts() {
      try {
        const data: ProductType[] =
          await window.posApi.getAllProducts();

        // Keep the same sorting
        const sorted = [...data].sort(
          (a, b) =>
            (a.sortOrder ?? 0) -
            (b.sortOrder ?? 0)
        );

        // SQLite uses parentId instead of type='variant'
        const parents = sorted.filter(
          (p) => !p.parentId
        );

        const childVariants = sorted.filter(
          (p) => !!p.parentId
        );

        setAllProducts(parents);
        setVariants(childVariants);
        setAllProduct(parents);
      } catch (err) {
        console.error(
          'Failed to load products from SQLite',
          err
        );
      }
    }

    loadProducts();
  }, [setAllProduct]);

  // ===============================
  // FILTER PRODUCTS
  // ===============================
  const products = useMemo(() => {
    let list = allProducts;

    if (productCategoryIdG) {
      list = list.filter(
        (p) => p.categoryId === productCategoryIdG
      );
    }

    if (productToSearchQuery?.trim()) {
      const q =
        productToSearchQuery.toLowerCase();

      list = list.filter((p) =>
        p.name.toLowerCase().includes(q)
      );
    }

    return list;
  }, [
    allProducts,
    productCategoryIdG,
    productToSearchQuery,
  ]);

  // ===============================
  // LOAD MODIFIERS FROM SQLITE
  // ===============================
  useEffect(() => {
    async function loadModifiers() {
      try {
        const [groupsData, mappingData] =
          await Promise.all([
            window.posApi.getModifierGroups(),
            window.posApi.getProductModifiers(),
          ]);

        setModifierGroups(groupsData);
        setProductModifiers(mappingData);
      } catch (err) {
        console.error(
          'Error loading modifiers from SQLite',
          err
        );
      }
    }

    loadModifiers();
  }, []);

  // ===============================
  // CARD COMPONENT
  // ===============================
  const cardType =
    process.env.NEXT_PUBLIC_PRODUCT_CARD_TYPE;

  const Card = useMemo(() => {
    switch (cardType) {
      case '1':
        return dynamic(
          () =>
            import('../level-2/ProductCard-h1')
        );

      case '11':
        return dynamic(
          () =>
            import('../level-2/ProductCard-h1_1')
        );

      case '111':
        return dynamic(
          () =>
            import(
              '../level-2/ProductCard-h1_1_1'
            )
        );

      case '2':
        return dynamic(
          () =>
            import('../level-2/ProductCard-v2')
        );

      default:
        return dynamic(
          () =>
            import('../level-2/ProductCard-h1')
        );
    }
  }, [cardType]);

  // KEEPING YOUR ORIGINAL UI
  let containerClass = '';

  switch (cardType) {
    case '1':
      containerClass =
        'flex flex-col justify-between md:flex-row md:flex-wrap ';
      break;

    case '11':
      containerClass =
        'flex flex-col justify-between md:flex-row md:flex-wrap ';
      break;

    case '12':
      containerClass =
        'flex flex-col justify-between md:flex-row md:flex-wrap  ';
      break;

    case '2':
    case '3':
      containerClass =
        'flex flex-col md:flex-row justify-between md:flex-wrap  justify-center';
      break;

    default:
      containerClass = 'flex flex-wrap ';
  }

  return (
    <div className='flex flex-wrap '>
      {products.map((product, i) => (
        <Card
          key={product.id ?? `${product.name}-${i}`}
          product={product}
          variants={variants}
          allAddOns={addOns}
          modifierGroups={modifierGroups}
          productModifiers={productModifiers}
        />
      ))}
    </div>
  );
}