// components/FlyerBuffet.tsx
import Image from "next/image";

export default function FlyerBuffet() {
  return (
    <section id="bf" className="bg-white text-[#2b2e4a]  px-4">
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-start md:items-center gap-12">
        {/* Left side: Image */}
        <div className="w-full md:w-1/2 flex-shrink-0">
          <Image
            src="/images/buffet-1.jpg"
            alt="Indian Buffet"
            width={800}
            height={600}
            className="object-cover w-full h-auto"
          />
        </div>

        {/* Right side: Text + QR integrated */}
        <div className="w-full md:w-1/2 flex flex-col space-y-6">
          <div>
            <h2 className="w-full  playfair-display-400 text-left text-[#2B2E4A] text-3xl md:text-4xl font-bold mb-2">MASALA  <span className="text-[#d24a0f]">– Taste of India</span></h2>
            <h2 className="text-2xl font-bold mb-2">Indisches Buffet</h2>
            <h3 className="text-xl font-semibold mb-4">
              + Alkoholfreies Getränk <span className="text-sm font-normal">(1× – 0,4 L)</span>
            </h3>

            <div className="text-lg text-[#2b2e4a] space-y-1 mb-6">
              <p className="font-semibold">Pro Person 19,99 €</p>
              <p className="font-semibold">Kinder bis 7 Jahre 9,99 €</p>
              <p className="underline mt-2">Angebot bis 31.12.2025</p>
            </div>

            <div className="text-[#2b2e4a] space-y-1 mb-6">
              <p className="font-medium">Freitag, Samstag, Sonntag</p>
              <p>Von 17:00 bis 21:00 Uhr</p>
            </div>

            <div className="text-sm text-gray-700 space-y-1">
              <p>Braunschweigerstr. 93, 38518 Gifhorn</p>
              <p>05371 62 66 291 | masala-gf.de</p>
            </div>
          </div>

<button
  className="bg-[#d24a0f] text-white w-fit font-semibold px-6 py-3 hover:bg-slate-500 transition mb-5"
  onClick={() => {
    window.location.href = "https://www.google.com/maps/reserve/v/dine/c/6JTgdCnqFvM?source=pa&opi=89978449&hl=en-IN&gei=tyL_aJLxDNCL4-EP4_HqqQQ&sourceurl=https://www.google.com/search?q%3Dmasala%2Btaste%2Bof%2Bindia%2Bbraunschweig%26rlz%3D1C1UEAD_enIN1131IN1131%26oq%3Dmasala%2Btaste%2Bof%2Bindia%2B%26gs_lcrp%3DEgZjaHJvbWUqBwgBEAAYgAQyBggAEEUYOTIHCAEQABiABDIHCAIQABiABDIGCAMQRRg9MgYIBBBFGDwyBggFEEUYPTIGCAYQRRhBMgYIBxBFGEHSAQg5NzUwajFqN6gCCLACAfEF8AkcktHNSkY%26sourceid%3Dchrome%26ie%3DUTF-8"
  }}
>
  Tischreservierung
</button>
         {/* QR + call to action row */}
          {/* <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-semibold text-[#2b2e4a] mb-2">
                Hier scannen und Tisch reservieren
              </h2>
              <p className="text-gray-700">
                Einfach QR-Code scannen – in wenigen Sekunden reservieren.
              </p>
            </div>
            <div className="flex-1 flex justify-center md:justify-end">
              <div className="bg-transparent p-0">
                <Image
                  src="/images/code.png"
                  alt="QR Code to reserve a table"
                  width={180}
                  height={180}
                />
              </div>
            </div>
          </div> */}
        </div>

      </div>
    </section>
  );
}
