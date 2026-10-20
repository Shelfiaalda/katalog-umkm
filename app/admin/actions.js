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

export async function gantiPassword(prevState, formData) {
  const data =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
      ? prevState
      : null;
  const isActionState = formData instanceof FormData;

  const passwordBaru = data?.get("password_baru")?.toString() || "";
  const konfirmasiPassword =
    data?.get("konfirmasi_password")?.toString() || "";

  if (!passwordBaru || passwordBaru.length < 8) {
    const errorMsg = "Password baru minimal 8 karakter.";
    if (isActionState) return { error: errorMsg };
    redirect(`/admin/password?error=${encodeURIComponent(errorMsg)}`);
  }

  if (passwordBaru !== konfirmasiPassword) {
    const errorMsg = "Password baru dan konfirmasi password tidak sama.";
    if (isActionState) return { error: errorMsg };
    redirect(`/admin/password?error=${encodeURIComponent(errorMsg)}`);
  }

  const supabase = await buatKoneksiAdmin();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const errorMsg = "Anda harus masuk terlebih dahulu.";
    if (isActionState) return { error: errorMsg };
    redirect(`/admin/login?error=${encodeURIComponent(errorMsg)}`);
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    let errorMsg = error.message;
    if (error.message.includes("Password should be at least")) {
      errorMsg = "Password baru minimal 8 karakter.";
    }
    if (isActionState) return { error: errorMsg };
    redirect(`/admin/password?error=${encodeURIComponent(errorMsg)}`);
  }

  const suksesMsg = "Password berhasil diganti.";
  if (isActionState) return { success: suksesMsg };
  redirect(`/admin/password?sukses=${encodeURIComponent(suksesMsg)}`);
}

export const logout = keluar;
