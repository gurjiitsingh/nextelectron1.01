"use client";

import { useEffect, useState } from "react";
import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";
import { fetchProducts } from "@/app/(universal)/action/products/dbOperation";
import ProductSlider from "../../components/level-1/ProductSlider";
import { FaUtensils } from "react-icons/fa";

import { Ultra } from "next/font/google";

const ultra = Ultra({
  subsets: ["latin"],
  weight: "400",
});

import { Chicle } from "next/font/google";
import { ProductType } from "@/lib/types/productType";

const chicle = Chicle({
  subsets: ["latin"],
  weight: "400",
});

type CategoryType = {
  id: string;
  name: string;
  description?: string;
  image?: string;
};



export default function SlidersByCatId() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
        ]);

        setCategories(Array.isArray(cats) ? cats : []);
        setProducts(Array.isArray(prods) ? prods : []);
      } catch (error) {
        console.error("Error loading data:", error);
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading)
    return (
      <div className="py-20 text-center text-gray-600 animate-pulse">
        Menü wird geladen...
      </div>
    );

  if (!categories.length)
    return (
      <div className="py-20 text-center text-gray-600">
        Keine Kategorien gefunden.
      </div>
    );

  return (
    <section className="max-w-7xl mx-auto  py-10 px-2 md:px-0 ">
      {categories.map((cat) => {
        const catProducts = products.filter((p) => p.categoryId === cat.id);
        if (!catProducts.length) return null;

        return (
          <div
            key={cat.id}
            id={cat.id}
            className="mb-16 scroll-mt-28 bg-[#fff2e9] p-6 rounded-3xl "
          >
            <CategoryHeader category={cat} />
            <ProductSlider products={catProducts} />
          </div>
        );
      })}
    </section>
  );
}

function CategoryHeader({ category }: { category: CategoryType }) {
  return (
    <div className="flex items-start gap-4 mb-5">
      <div className="w-14 h-14 rounded-xl bg-[#ffe5d2] flex items-center justify-center text-[#d24a0f]">
        {/* <FaUtensils size={22} /> */}
          <img
                          src={category.image || "/com.jpg"}
                          alt={category.name || "Category"}
                          className=" h-full object-cover rounded-xl transition-transform group-hover:scale-105"
                        />
      </div>
{/* className="text-2xl font-extrabold uppercase text-[#2b2b2b] tracking-wide */}
      <div>
        {/* <h2 className={`${ultra.className} text-2xl  uppercase text-[#2b2b2b] tracking-wide `} >
          {category.name}
        </h2>
          <h2 className={`${chicle.className} text-2xl font-bold  uppercase text-[#2b2b2b] tracking-wide `} >
          {category.name}
        </h2> */}
          <h2 className={`${ultra.className} text-2xl   text-[#2b2b2b] tracking-wide `} >
          {category.name}
        </h2>
          {/* <h2 className={`${chicle.className} text-2xl font-bold   text-[#2b2b2b] tracking-wide `} >
          {category.name}
        </h2> */}
        {category.description && (
          <p className="text-sm text-[#d24a0f] mt-1 italic">
            {category.description}
          </p>
        )}
      </div>
    </div>
  );
}
