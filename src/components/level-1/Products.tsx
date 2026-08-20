"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import { UseSiteContext } from "@/SiteContext/SiteContext";
import { ProductType } from "@/lib/types/productType";
import { addOnType } from "@/lib/types/addOnType";
import { FAVORITES_CATEGORY_ID } from "../pos/PosSidebarCategories";

import { FiSearch, FiX } from "react-icons/fi";

export default function Products() {
  const {
    productCategoryIdG,
    productToSearchQuery,
    setProductToSearchQuery,
    setAllProduct,
  } = UseSiteContext();
  

  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [variants, setVariants] = useState<ProductType[]>([]);
  const [addOns] = useState<addOnType[]>([]);

  const [modifierGroups, setModifierGroups] = useState<any[]>([]);
  const [productModifiers, setProductModifiers] = useState<any[]>([]);

  // =====================================================
  // LOAD PRODUCTS FROM SQLITE
  // =====================================================

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
          "Failed to load products from SQLite",
          err
        );
      }
    }

    loadProducts();
  }, [setAllProduct]);

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const products = useMemo(() => {
    const query =
      productToSearchQuery?.trim().toLowerCase();

    // ===================================================
    // 1. SEARCH
    // Search ALL products by name OR search code
    // ===================================================

    if (query) {
      return allProducts.filter((p) => {
        const name =
          p.name?.toLowerCase() ?? "";

        const searchCode =
          p.searchCode?.toLowerCase() ?? "";

        return (
          name.includes(query) ||
          searchCode.includes(query)
        );
      });
    }

    // ===================================================
    // 2. FAVORITES
    // ===================================================

    if (
      productCategoryIdG ===
      FAVORITES_CATEGORY_ID
    ) {
      return allProducts.filter(
        (p) => p.favorite === true
      );
    }

    // ===================================================
    // 3. NORMAL CATEGORY
    // ===================================================

    if (productCategoryIdG) {
      return allProducts.filter(
        (p) =>
          p.categoryId === productCategoryIdG
      );
    }

    // ===================================================
    // 4. DEFAULT
    // ===================================================

    return allProducts.filter(
      (p) => p.favorite === true
    );
  }, [
    allProducts,
    productCategoryIdG,
    productToSearchQuery,
  ]);

  // =====================================================
  // LOAD MODIFIERS FROM SQLITE
  // =====================================================

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
          "Error loading modifiers from SQLite",
          err
        );
      }
    }

    loadModifiers();
  }, []);

  // =====================================================
  // CARD COMPONENT
  // =====================================================

  const cardType =
    process.env.NEXT_PUBLIC_PRODUCT_CARD_TYPE;

  const Card = useMemo(() => {
    switch (cardType) {
      case "1":
        return dynamic(
          () =>
            import("../level-2/ProductCard-h1")
        );

      case "11":
        return dynamic(
          () =>
            import("../level-2/ProductCard-h1_1")
        );

      case "111":
        return dynamic(
          () =>
            import(
              "../level-2/ProductCard-h1_1_1"
            )
        );

      case "2":
        return dynamic(
          () =>
            import("../level-2/ProductCard-v2")
        );

      default:
        return dynamic(
          () =>
            import("../level-2/ProductCard-h1")
        );
    }
  }, [cardType]);

  // =====================================================
  // CONTAINER CLASS
  // =====================================================

  let containerClass = "";

  switch (cardType) {
    case "1":
      containerClass =
        "flex flex-col justify-between md:flex-row md:flex-wrap";
      break;

    case "11":
      containerClass =
        "flex flex-col justify-between md:flex-row md:flex-wrap";
      break;

    case "12":
      containerClass =
        "flex flex-col justify-between md:flex-row md:flex-wrap";
      break;

    case "2":
    case "3":
      containerClass =
        "flex flex-col md:flex-row justify-between md:flex-wrap justify-center";
      break;

    default:
      containerClass = "flex flex-wrap";
  }

  // =====================================================
  // SEARCH HANDLERS
  // =====================================================

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductToSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setProductToSearchQuery("");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="w-full">
      {/* =================================================
          SEARCH BAR
      ================================================= */}

      <div
        className="
          sticky
          top-0
          z-20
          w-full
          px-2
          py-2
          bg-inherit
        "
      >
        <div
          className="
            relative
            flex
            items-center
            w-full
            h-11
            rounded-md
            border
            border-zinc-300
            dark:border-zinc-600
            bg-white
            dark:bg-zinc-800
          "
        >
          <FiSearch
            size={19}
            className="
              ml-3
              shrink-0
              text-zinc-400
            "
          />

          <input
            type="text"
            value={productToSearchQuery ?? ""}
            onChange={handleSearchChange}
            placeholder="Search product name or code..."
            className="
              flex-1
              h-full
              px-3
              text-sm
              outline-none
              bg-transparent
              text-zinc-800
              dark:text-white
              placeholder:text-zinc-400
            "
          />

          {productToSearchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              title="Clear search"
              className="
                mr-2
                p-1.5
                rounded
                text-zinc-400
                hover:text-zinc-700
                dark:hover:text-white
                hover:bg-zinc-100
                dark:hover:bg-zinc-700
                transition
              "
            >
              <FiX size={18} />
            </button>
          )}
        </div>
      </div>

      {/* =================================================
          PRODUCTS
      ================================================= */}

      <div className="flex flex-wrap">
        {products.map((product, i) => (
          <Card
            key={
              product.id ??
              `${product.name}-${i}`
            }
            product={product}
            variants={variants}
            allAddOns={addOns}
            modifierGroups={modifierGroups}
            productModifiers={productModifiers}
          />
        ))}
      </div>

      {/* =================================================
          NO RESULTS
      ================================================= */}

      {products.length === 0 &&
        productToSearchQuery?.trim() && (
          <div
            className="
              flex
              items-center
              justify-center
              py-10
              text-sm
              text-zinc-500
            "
          >
            No products found
          </div>
        )}
    </div>
  );
}