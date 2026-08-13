"use client";

import Link from "next/link";

type Props = {
  outlet?: any;
};

export default function PrivacyPolicy_en({ outlet }: Props) {
  const name = outlet?.outletName || "Restaurant";
  const website = outlet?.web || "#";
  const email = outlet?.email || "info@example.com";

    const formattedDate = outlet?.updatedAt
    ? new Date(outlet.updatedAt).toLocaleDateString("en-GB")
    : "";
  return (
    <div className="relative container mx-auto py-5 p-1">
      <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800">

        <div className="my-8 text-sm">
          🌍{" "}
          <Link href="/privacy" className="text-blue-600 underline">
            Cambiar a la versión en alemán
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <p className="mb-4">
          At <strong>{name}</strong> (
          <a href={website} className="text-blue-600 underline">
            {website}
          </a>
          ), we take your privacy seriously. This page explains how we collect, use, and protect your personal data.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. What Information We Collect</h2>
        <p className="mb-4">We only collect information necessary for processing your order:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Email address</li>
          <li>Order details</li>
          <li><strong>Address</strong> (for delivery or pickup)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
        <p className="mb-4">We use your data exclusively for the following purposes:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Order processing and confirmation</li>
          <li>Contacting you regarding your order</li>
          <li>Sending promotional emails (if opted-in)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Promotional Emails</h2>
        <p className="mb-4">
          We may occasionally send you exclusive offers via email. You can opt out anytime:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>By clicking the unsubscribe link included in every email</li>
          <li>Or by unchecking "Receive offers" during checkout</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Sharing of Data</h2>
        <p className="mb-4">
          We <strong>do not sell or share your data</strong> with any third parties for marketing purposes.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h2>
        <p className="mb-4">
          You have the right to request access, correction, or deletion of your personal data at any time.
          Please contact us at:
        </p>
        <p className="mb-4">
          📧{" "}
          <a href={`mailto:${email}`} className="text-blue-600 underline">
            {email}
          </a>
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Contact</h2>
        <p className="mb-4">
          If you have any questions regarding this privacy policy, feel free to reach out to us:
          <br />
          📧{" "}
          <a href={`mailto:${email}`} className="text-blue-600 underline">
            {email}
          </a>
        </p>

        <p className="text-sm text-gray-500 mt-10">
      Last updated: {formattedDate}
    </p>
      </div>
    </div>
  );
}