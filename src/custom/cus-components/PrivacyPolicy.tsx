"use client";

import Link from "next/link";

type Props = {
  outlet?: any;
};

export default function PrivacyPolicy({ outlet }: Props) {
  const name = outlet?.outletName || "Restaurante";
  const website = outlet?.web || "#";
  const email = outlet?.email || "info@example.com";
  
  const formattedDate = outlet?.updatedAt
    ? new Date(outlet.updatedAt).toLocaleDateString("en-GB")
    : "";

  return (
    <div className="relative container mx-auto py-5 p-1">
      <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800">

        <div className="my-8 text-sm">
          🔄{" "}
          <Link href="/privacy/en" className="text-blue-600 underline">
            Switch to English version
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Política de privacidad</h1>

        <p className="mb-4">
          En <strong>{name}</strong> (
          <a href={website} className="text-blue-600 underline">
            {website}
          </a>
          ) nos tomamos muy en serio la protección de sus datos personales. Esta política de privacidad explica qué datos recopilamos y cómo los utilizamos.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. ¿Qué datos recopilamos?</h2>
        <p className="mb-4">
          Solo recopilamos la información necesaria para procesar su pedido:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Dirección de correo electrónico</li>
          <li>Datos del pedido</li>
          <li><strong>Dirección</strong> (para entrega o recogida)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Uso de sus datos</h2>
        <p className="mb-4">Utilizamos sus datos únicamente para:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Procesar y confirmar su pedido</li>
          <li>Contactarle en caso de dudas</li>
          <li>Enviar correos electrónicos con ofertas (si lo desea)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Correos electrónicos de marketing</h2>
        <p className="mb-4">
          Ocasionalmente enviamos ofertas especiales por correo electrónico. Puede darse de baja en cualquier momento:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>A través del enlace de cancelación en cada correo electrónico</li>
          <li>O desactivando la opción “Recibir correos con ofertas” durante el proceso de pedido</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Compartir datos</h2>
        <p className="mb-4">
          Sus datos <strong>nunca se venden ni se comparten con terceros con fines publicitarios</strong>.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Sus derechos</h2>
        <p className="mb-4">
          Tiene derecho en cualquier momento a acceder, corregir o eliminar sus datos.
          Para ello, contáctenos en:
        </p>
        <p className="mb-4">
          📧{" "}
          <a href={`mailto:${email}`} className="text-blue-600 underline">
            {email}
          </a>
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Contacto</h2>
        <p className="mb-4">
          Si tiene preguntas sobre la protección de datos, estamos disponibles en todo momento:
          <br />
          📧{" "}
          <a href={`mailto:${email}`} className="text-blue-600 underline">
            {email}
          </a>
        </p>

        <p className="text-sm text-gray-500 mt-10">
          Última actualización: {formattedDate}
        </p>

     
      </div>
    </div>
  );
}