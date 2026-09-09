// WhatsApp Integration Service for MysticDeck (Private Reading Upsell)

const DEFAULT_ADMIN_WA_NUMBER = "6281288467698";

function generateCustomerCode() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ARC-${randomNum}`;
}

function buildWhatsAppUrl(customerCode, selectedPackage = "3 Cards (Rp 10.000)", customCardName = "", phoneNumber = DEFAULT_ADMIN_WA_NUMBER) {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  const pkgText = selectedPackage || "3 Cards (Rp 10.000)";
  
  let message = `Halo Admin ArcanaReflect! 🔮\n\nSaya tertarik untuk memesan Private Reading (Berbayar) yang lebih mendalam.\n\n★ Kode Unik Customer saya: ${customerCode}\n★ Kartu Hari Ini: ${pkgText}\n\nMohon informasi pilihan paket reading dan langkah pembayarannya. Terima kasih! 💜`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

function redirectToWhatsAppPrivateReading(selectedPackage = "3 Cards (Rp 10.000)", cardName = "", phoneNumber = DEFAULT_ADMIN_WA_NUMBER) {
  const code = generateCustomerCode();
  const url = buildWhatsAppUrl(code, selectedPackage, cardName, phoneNumber);
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  return {
    success: true,
    customerCode: code,
    whatsappUrl: url
  };
}

if (typeof window !== "undefined") {
  window.ArcanaWhatsApp = {
    DEFAULT_ADMIN_WA_NUMBER,
    generateCustomerCode,
    buildWhatsAppUrl,
    redirectToWhatsAppPrivateReading
  };
}
