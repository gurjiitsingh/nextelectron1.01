"use client"


type Props = {
  outlet?: any;
};

export default function ContactUs({ outlet }: Props) {

  console.log("OUTLET DATA:", outlet);

  const name = outlet?.outletName || "Restaurant";
 const addressParts = [
  outlet?.addressLine1,
  outlet?.addressLine2,
  outlet?.city,
].filter(Boolean);

const address = addressParts.length > 0 ? addressParts.join(", ") : "Address not available";

  const phone = outlet?.phone || "-";
   const phone2 = outlet?.phone2 || "";
  const email = outlet?.email || "-";

  // ✅ Google Maps query (dynamic)
  const mapQuery = encodeURIComponent(address);
  return (
    <div className="relative container mx-auto py-5 p-1">
      <div className="flex flex-col gap-8 md:flex-row my-24 justify-between">
        {/* Address Section */}
        <div className="flex flex-col">
          <h1 className="text-[#333] text-[3rem]">{name}</h1>
          <div className="w-full md:w-[50%] space-y-3 text-lg">
            <a
              className="relative mb-5 block aspect-square w-20"
              href="/de"
            >
              {/* <img
                alt="pizzeria"
                src="https://assets-prod-gillz.s3.eu-central-1.amazonaws.com/e251843b-6f27-458d-9d6f-0bc164920168/1731781573178_kxSGE1X.png"
                width={80}
                height={80}
                className="object-contain"
              /> */}
            </a>
            <a
              className="flex items-center justify-start"
              title="Calle de Segle XX 9 (08041) Guinardo 
Barcelona   931416841  
Horario 12.30 A 00.30 Miercoles A Lunes 
Martes Estamos Cerrado"
              href="http://maps.google.com/maps?q=52.4717066,10.5434431"
              target="_blank"
              rel="noreferrer"
            >
           {address}
            </a>
           
            {/* Phone */}
            <a
              className="flex items-center justify-start"
              href={`tel:${phone}`}
            >
              {phone}
            </a>
              <a
              className="flex items-center justify-start"
              href={`tel:${phone2}`}
            >
              {phone2}
            </a>

            {/* Email */}
            <a
              className="flex items-center justify-start"
              href={`mailto:${email}`}
            >
              ✉️ {email}
            </a>
          </div>
        </div>

        {/* Google Map Section */}
        <div className="google_map w-full md:w-[50%]">
         <iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2991.7769972830206!2d2.1781470999999994!3d41.42235929999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4bd2cecc1d093%3A0x19a41736bcc7bbb!2sCarrer%20del%20Segle%20XX%2C%209%2C%20Horta-Guinard%C3%B3%2C%2008041%20Barcelona%2C%20Spain!5e0!3m2!1sen!2sin!4v1774751413429!5m2!1sen!2sin"
  width="100%"
  height="450"
  style={{ border: 0 }}
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
></iframe>
        </div>
      </div>
    </div>
  );
}
