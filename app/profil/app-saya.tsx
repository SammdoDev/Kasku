"use client";

import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import AccountStatStrip from "./components/account-stat-strip";
import BudgetPreferencesCard from "./components/budget-preferences-card";
import DangerZoneCard from "./components/danger-zone-card";
import DataManagementCard from "./components/data-management-card";
import LoginAccountCard from "./components/login-account-card";
import PremiumBanner from "./components/premium-banner";
import PrivacyPolicyCard from "./components/privacy-policy";
import ProfileCard from "./components/profile-card";
import TermsAccordion from "./components/terms-accordion";

const AppSaya = () => {
  return (
    <div
      className="card md:m-4 p-4 md:p-6"
      style={{ fontFamily: DASHBOARD_FONT, background: "transparent" }}
    >
      <div className="px-4 pt-4 flex flex-col gap-4">
        <AccountStatStrip />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ProfileCard />
          <LoginAccountCard />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <BudgetPreferencesCard />
          <DataManagementCard />
        </div>

        <PremiumBanner
          isActive
          expiresAt="31 Desember 2024"
          onViewBilling={() => console.log("billing history")}
          onUpgrade={() => console.log("upgrade plan")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TermsAccordion />
          <PrivacyPolicyCard />
        </div>

        <DangerZoneCard
          onResetBudgetData={() => console.log("reset budget data")}
          onDeleteAccount={() => console.log("delete account")}
        />
      </div>
    </div>
  );
};
export default AppSaya;
