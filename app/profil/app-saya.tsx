"use client";

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
    <div className="mx-auto bg-background min-h-screen">
      <div className="flex flex-col gap-5 p-6">
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
