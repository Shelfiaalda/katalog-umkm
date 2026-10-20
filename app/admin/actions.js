"use server";

import { redirect } from "next/navigation";
import { buatKoneksiAdmin } from "@/lib/supabase";

export async function login(prevState, formData) {
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
      ? prevState
      : null;
  const isActionState = formData instanceof FormData;

  const email = data?.get("email");
  const password = data?.get("password");

  if (!email || !password) {
    const errorMsg = "Email dan password wajib diisi.";
    if (isActionState) return { error: errorMsg };
    redirect(`/admin/login?error=${encodeURIComponent(errorMsg)}`);
  }

  const supabase = await buatKoneksiAdmin();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    let errorMsg = "Email atau password salah. Silakan periksa kembali.";
    if (error.message.includes("Invalid login credentials")) {
      errorMsg = "Email atau password salah. Silakan periksa kembali.";
    } else if (error.message.includes("Email not confirmed")) {
      errorMsg = "Email belum dikonfirmasi.";
    } else {
      errorMsg = error.message;
    }

    if (isActionState) return { error: errorMsg };
    redirect(
      `/admin/login?error=${encodeURIComponent(errorMsg)}&email=${encodeURIComponent(
        String(email).trim()
      )}`
    );
  }

  redirect("/admin");
}

export async function keluar() {
  const supabase = await buatKoneksiAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export const logout = keluar;

