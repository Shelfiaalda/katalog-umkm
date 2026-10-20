import { createClient } from "@supabase/supabase-js";
import { createServerClient as createSsrServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getCleanSupabaseUrl() {
  const rawUrl = process.env.SUPABASE_URL || "";
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

function getSupabaseSecretKey() {
  return (process.env.SUPABASE_SECRET_KEY || "").trim();
}

function getSupabasePublishableKey() {
  return (process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();
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

/**
 * Membuat koneksi Supabase dengan sesi admin menggunakan SUPABASE_PUBLISHABLE_KEY
 * dan cookie (@supabase/ssr). Digunakan untuk login, logout, ganti password, dan kelola produk.
 */
export async function buatKoneksiAdmin(customCookieStore) {
  const url = getCleanSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();

  if (!url || !publishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  const cookieStore = customCookieStore || (await cookies());

  return createSsrServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Abaikan jika dipanggil dari Server Component saat rendering murni
        }
      },
    },
  });
}

export const createServerClient = buatKoneksiServer;
export const createAdminClient = buatKoneksiServer;
export const createAdminSessionClient = buatKoneksiAdmin;
