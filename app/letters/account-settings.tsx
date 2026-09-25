"use client";

import { useSearchParams } from "next/navigation";
import type { FC } from "react";
import { Modal } from "@/components/modal";
import { ChangeEmailForm } from "./change-email-form";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccountForm } from "./delete-account-form";

const TITLES = { email: "Change email", password: "Change password", delete: "Delete account" } as const;
type Setting = keyof typeof TITLES;

/**
 * The Account rows; each opens its form in a dialog. `?settings=<setting>` holds the open one,
 * so the Undeliverable banner can deep-link to Change email (SPEC §3 `/letters`).
 */
export const AccountSettings: FC<{ email: string }> = ({ email }) => {
  const searchParams = useSearchParams();
  const param = searchParams.get("settings");
  const openSetting = isSetting(param) ? param : null;

  // The History API updates useSearchParams without a server round trip.
  const setOpenSetting = (setting: Setting | null) => {
    const params = new URLSearchParams(searchParams);
    if (setting) params.set("settings", setting);
    else params.delete("settings");
    window.history.replaceState(null, "", params.size ? `?${params}` : window.location.pathname);
  };

  // Native <dialog> restores focus to the row it opened from, but a deep link had no row focused.
  const close = (setting: Setting) => {
    setOpenSetting(null);
    document.getElementById(`settings-${setting}`)?.focus();
  };

  return (
    <>
      <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
        {(Object.keys(TITLES) as Setting[]).map((setting) => (
          <li key={setting}>
            <button
              id={`settings-${setting}`}
              type="button"
              onClick={() => setOpenSetting(setting)}
              className={`flex w-full items-center justify-between gap-4 py-4 text-left ${setting === "delete" ? "text-red" : ""}`}
            >
              <span>
                <span className="block font-medium">{TITLES[setting]}</span>
                {setting === "email" && <span className="block break-all text-sm text-bark">{email}</span>}
              </span>
              <span aria-hidden className="text-xl">
                ›
              </span>
            </button>
          </li>
        ))}
      </ul>
      {openSetting && (
        <Modal key={openSetting} title={TITLES[openSetting]} onClose={() => close(openSetting)}>
          <div className="mt-6">
            {openSetting === "email" && <ChangeEmailForm currentEmail={email} />}
            {openSetting === "password" && <ChangePasswordForm />}
            {openSetting === "delete" && <DeleteAccountForm />}
          </div>
        </Modal>
      )}
    </>
  );
};

function isSetting(param: string | null): param is Setting {
  return param !== null && Object.hasOwn(TITLES, param);
}
