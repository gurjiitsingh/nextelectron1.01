
import PosSidebarCategories from "@/components/pos/PosSidebarCategories";
import CartPanel from "@/components/pos/CartPanel";

import Products from "@/components/level-1/Products";
import PosTopBar from "@/components/pos/home/PosTopBar";

export default async function Page() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">

     

      {/* EXISTING MAIN SCREEN */}
      <main className="flex-1 flex min-h-0 p-0 m-0 overflow-hidden">

        <aside className="w-[250px] bg-white border-r border-slate-200  shrink-0 overflow-y-auto">
          <PosSidebarCategories />
        </aside>

        <section className="flex-1 overflow-y-auto mx-0 px-0 ">
          <Products />
        </section>

        <aside className="hidden xl:flex w-[440px] bg-white border-l border-slate-200">
          <CartPanel />
        </aside>

      </main>
    </div>
  );
}

 
// import PosSidebarCategories from "@/components/pos/PosSidebarCategories";
// import CartPanel from "@/components/pos/CartPanel";
 
// import Products from "@/components/level-1/Products";


// export default async function Page() {
  
//   return (
//     <main className="flex flex-1 overflow-hidden">
//       <aside className="w-[250px] bg-slate-800 text-white border-r border-slate-700 overflow-y-auto">
//         <PosSidebarCategories />
//       </aside>

//       <section className="flex-1 overflow-y-auto p-4">
//       <Products  />
//       </section>

//       <aside className="hidden xl:flex w-[360px] bg-white border-l border-slate-200">
//         <CartPanel />
//       </aside>
//     </main>
//   );
// }