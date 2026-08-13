'use client'
import Link from "next/link";
import { Router } from "next/router";

export default function SpecialRecommendations() {
  const dishes = [
    {
      image: "/images/samosa-2.jpg",
      name: "Samosa",
      description:
        "zwei gefüllte Teigtasche mit Kartoffeln, grünen Erbsen, Chili und Koriandersamen,",
      price: "",
    },
    {
      image: "/images/chicken-tikka-2.jpg",
      name: "Chicken Tikka",
      description:
        "mariniertes Hühnerbrustfilet mit Paprika, Tomaten, Zwiebeln, frischem Ingwer, Knoblauch und im Ofen gegrillt",
      price: "",
    },
    {
      image: "/images/chicken-mango-3.jpg",
      name: "Mango Chicken",
      description: "Hühnerbrustfilet mit indischer Mango-Currysauce",
      price: "",
    },
    {
      image: "/images/butter-checken-5.jpg",
      name: "Butter Chicken",
      description: "Hühnerbrustfilet in Butter gebraten mit Tomaten-Currysauce",
      price: "",
    },
  ];

  return (
    <section className="bg-[#f4efdf] text-[#2b2e4a] py-26 px-6">
      <div className="max-w-7xl mx-auto text-center">
        {/* Heading */}
        <h2 className="playfair-display-400 text-3xl md:text-5xl font-medium mb-12">
          Besondere  <span className="text-[#d24a0f]"> Empfehlungen</span>
        </h2>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {dishes.map((dish, index) => (
            <div key={index} className="flex flex-col items-center">
              <img
                src={dish.image}
                alt={dish.name}
                className="w-full h-56 object-cover"
              />
              <h3 className="mt-4 text-lg font-medium">{dish.name}</h3>
              <p className="text-sm text-gray-700 mt-2 px-4 leading-snug">
                {dish.description}
              </p>
              <p className="mt-4 text-base font-medium">{dish.price}</p>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="mt-12">
        

<Link 
  href="/menu"
  className="bg-[#d24a0f] text-white px-8 py-3 tracking-wider uppercase text-sm hover:bg-[#1f2035] transition"
>
  Speisekarte
</Link>

        </div>
      </div>
    </section>
  );
}
