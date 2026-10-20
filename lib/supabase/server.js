import { createClient } from "@supabase/supabase-js";

function getCleanSupabaseUrl() {
  const rawUrl = process.env.SUPABASE_URL || "";
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

function getSupabaseSecretKey() {
  return (process.env.SUPABASE_SECRET_KEY || "").trim();
}

/**
 * Membuat koneksi Supabase di sisi server menggunakan SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca data publik (seperti katalog dan detail produk) melewati RLS.
 */
export function buatKoneksiServer() {
  const url = getCleanSupabaseUrl();
  const secretKey = getSupabaseSecretKey();

  if (!url || !secretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createServerClient = buatKoneksiServer;
export const createAdminClient = buatKoneksiServer;

