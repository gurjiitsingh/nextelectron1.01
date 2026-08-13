"use client";

import { FaMapMarkedAlt, FaPhoneAlt, FaEnvelope, FaCalendarAlt } from "react-icons/fa";

export default function ContactInfo({ outlet, schedule }: any) {
  if (!outlet) return null;

  return (
    <section className="bg-[#ffe5d2] text-[#2b2e4a] py-16 md:py-36 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 text-center">
        
        {/* Standort */}
        <div>
          <FaMapMarkedAlt className="w-8 h-8 mx-auto mb-4" />
          <h3 className="uppercase text-sm tracking-wider font-semibold mb-2">Address</h3>
          
          <p className="text-sm">{outlet.outletName}</p>
          <p className="text-sm">{outlet.addressLine1}</p>
          {outlet.addressLine2 && <p className="text-sm">{outlet.addressLine2}</p>}
          <p className="text-sm">{outlet.city}</p>
        </div>

        {/* Telefon */}
        <div>
          <FaPhoneAlt className="w-8 h-8 mx-auto mb-4" />
          <h3 className="uppercase text-sm tracking-wider font-semibold mb-2">Phone</h3>
          <p className="text-sm">{outlet.phone || "-"}</p>
           <p className="text-sm">{outlet.phone2 || ""}</p>
        </div>

        {/* E-Mail */}
        <div>
          <FaEnvelope className="w-8 h-8 mx-auto mb-4" />
          <h3 className="uppercase text-sm tracking-wider font-semibold mb-2">E-Mail</h3>
          {outlet.email ? (
            <a href={`mailto:${outlet.email}`} className="text-sm hover:underline">
              {outlet.email}
            </a>
          ) : (
            <p className="text-sm">-</p>
          )}
        </div>

        {/* Öffnungszeiten */}
        <div>
          <FaCalendarAlt className="w-8 h-8 mx-auto mb-4" />
          <h3 className="uppercase text-sm tracking-wider font-semibold mb-2">Timing</h3>

          <div className="text-sm space-y-1">
            {schedule?.map((line: string, i: number) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}