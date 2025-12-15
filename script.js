/**
 * REVISI MENTOR: Netflix Email Reader (Secured)
 */

// Simpan API Key di Project Settings > Script Properties demi keamanan
// Key: 'API_SECRET', Value: 'password_super_sulit_anda'
const API_SECRET = PropertiesService.getScriptProperties().getProperty('API_SECRET') || 'DEV_KEY_123';

function doGet(e) {
  // 1. SECURITY LAYER: Tolak request tanpa kunci
  if (!e.parameter.key || e.parameter.key !== API_SECRET) {
    return createJSON({ success: false, error: "Access Denied: Invalid Key" });
  }

  try {
    const data = getNetflixEmails();
    return createJSON({
      success: true,
      timestamp: new Date().toISOString(),
      count: data.otpCodes.length + data.tempAccessLinks.length + data.householdLinks.length,
      data: data
    });
  } catch (error) {
    return createJSON({ success: false, error: error.toString() });
  }
}

function createJSON(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getNetflixEmails() {
  // ... (Kode konfigurasi sama) ...
  
  // OPTIMASI: Query dipersempit agar tidak scan sampah
  // subject: "code" atau "household" atau "access" mempercepat pencarian
  // Tapi hati-hati false negative. Kalau ragu, keep query lama.
  
  const threads = GmailApp.search(query, 0, CONFIG.MAX_EMAILS);
  const results = { otpCodes: [], householdLinks: [], tempAccessLinks: [] };

  for (const thread of threads) {
    // OPTIMASI: Hanya ambil 3 pesan terakhir dalam thread (biasanya yang relevan paling baru)
    // Netflix jarang reply-replyan panjang.
    const messages = thread.getMessages().slice(-3); 
    
    // Loop terbalik (dari terbaru ke terlama) biar kalau nemu, bisa break (opsional)
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      
      // Ambil Plain Body dulu (Ringan)
      const body = message.getPlainBody();
      const subject = message.getSubject();
      
      // ... Logic ekstraksi ...
      
      // HANYA ambil HTML body jika benar-benar butuh link yang tidak ada di plain text
      // Ini menghemat memori runtime GAS
      let htmlBody = "";
      const needsHtml = (
        subject.toLowerCase().includes('household') || 
        subject.toLowerCase().includes('access') || 
        subject.toLowerCase().includes('your sign-in code') || 
        subject.toLowerCase().includes('kode akses')
      );
      
      if (needsHtml) {
        htmlBody = message.getBody();
      }

      // ... Lanjutkan logic ekstraksi Anda ...
    }
  }
  return results;
}
