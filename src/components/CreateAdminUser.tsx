"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const CreateAdminUser = () => {
  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    const createAdmin = async () => {
      if (executed) return; // Ensure it runs only once per component mount

      setExecuted(true);
      const email = "henryscott@lspd.com";
      const password = "Hscott123";
      const badgeNumber = "001"; // Domyślny numer odznaki dla administratora

      toast.info(`Próba utworzenia konta administratora: ${email}...`);

      // 1. Sprawdź, czy użytkownik już istnieje
      const { data: existingUsers, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email);

      if (fetchError) {
        toast.error("Błąd podczas sprawdzania istniejących użytkowników: " + fetchError.message);
        console.error("Error checking existing users:", fetchError);
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        toast.info(`Konto ${email} już istnieje. Aktualizowanie roli i statusu...`);
        // Proceed to update role and status if user exists
      } else {
        // 2. Zarejestruj nowego użytkownika
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              badge_number: badgeNumber,
            },
          },
        });

        if (authError) {
          toast.error("Błąd podczas rejestracji użytkownika: " + authError.message);
          console.error("Error during user signup:", authError);
          return;
        }

        if (!authData.user) {
          toast.error("Błąd: Nie udało się utworzyć użytkownika.");
          return;
        }
        toast.success(`Użytkownik ${email} zarejestrowany pomyślnie.`);
      }

      // 3. Pobierz ID roli "High Command"
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "High Command")
        .single();

      if (roleError || !roleData) {
        toast.error("Błąd: Nie znaleziono roli 'High Command'. Upewnij się, że rola istnieje w bazie danych.");
        console.error("Error fetching High Command role:", roleError);
        return;
      }

      // 4. Zaktualizuj profil użytkownika na administratora
      const userId = existingUsers && existingUsers.length > 0 ? existingUsers[0].id : authData.user?.id;

      if (!userId) {
        toast.error("Błąd: Nie można uzyskać ID użytkownika do aktualizacji profilu.");
        return;
      }

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ role_id: roleData.id, status: "approved" })
        .eq("id", userId);

      if (profileUpdateError) {
        toast.error("Błąd podczas aktualizacji profilu administratora: " + profileUpdateError.message);
        console.error("Error updating admin profile:", profileUpdateError);
      } else {
        toast.success(`Konto administratora ${email} zostało pomyślnie utworzone/zaktualizowane.`);
      }
    };

    createAdmin();
  }, [executed]); // Dependency array to control execution

  return null; // This component doesn't render anything visible
};

export default CreateAdminUser;