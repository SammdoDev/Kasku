"use client";

import { useCallback, useState } from "react";
import { Database, Download, FileText, Upload, Loader } from "lucide-react";
import { DASHBOARD_FONT } from "@/lib/helper/layout-helper";
import { toast } from "@/components/layout/for-pages/toast";
import { downloadFromApi } from "@/lib/helper/apiService";
import ChildModalWrapper from "@/components/layout/for-pages/child-modal-wrapper";
import ModalImport from "./modal/modal-import";
import { useTranslate } from "@/lib/i18n/use-translate";

const DataManagementCard = () => {
  const CONSTANT = useTranslate();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const handle = useCallback(
    async (key: string, url: string, filename: string) => {
      setLoadingKey(key);
      try {
        await downloadFromApi(url, filename);
        toast.success(CONSTANT.downloadSuccess);
      } catch {
        toast.error(CONSTANT.failedDownload, CONSTANT.tryAgainLater);
      } finally {
        setLoadingKey(null);
      }
    },
    [CONSTANT],
  );

  const actions = [
    {
      key: "export-csv",
      label: CONSTANT.exportCsv,
      icon: Download,
      onClick: () =>
        handle(
          "export-csv",
          "/data/export-csv",
          `cashora-transactions-${today}.csv`,
        ),
    },
    {
      key: "export-report",
      label: CONSTANT.exportReport,
      icon: FileText,
      onClick: () =>
        handle(
          "export-report",
          "/data/export-report",
          `cashora-report-${today}.json`,
        ),
    },
    {
      key: "backup",
      label: CONSTANT.backupData,
      icon: Database,
      onClick: () =>
        handle("backup", "/data/backup", `cashora-backup-${today}.json`),
    },
    {
      key: "import",
      label: CONSTANT.importData,
      icon: Upload,
      onClick: () => setImportOpen(true),
    },
  ];

  return (
    <>
      <div
        className="bg-card border-[3px] border-border shadow-[6px_6px_0_hsl(var(--border))] overflow-hidden flex flex-col h-full"
        style={{ fontFamily: DASHBOARD_FONT }}
      >
        <div className="px-5 pt-4 pb-3.5 border-b-[3px] border-border">
          <span
            style={{ background: "var(--accent-bg)" }}
            className="inline-block text-[9px] font-black tracking-[0.22em] uppercase border-[2px] border-border px-2.5 py-1 mb-3"
          >
            {CONSTANT.dataManagement}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 flex-1">
          {actions.map(({ key, label, icon: Icon, onClick }, i) => (
            <button
              key={key}
              type="button"
              onClick={onClick}
              disabled={!!loadingKey}
              className={[
                "flex flex-col items-center justify-center gap-2 h-full py-5 px-2",
                "bg-card transition-colors duration-100",
                "hover:bg-[var(--accent)]",
                "disabled:opacity-50 disabled:pointer-events-none",
                i % 2 === 0 ? "border-r-[2px] border-border" : "",
                "md:border-r-[2px] md:border-border",
                i === actions.length - 1 ? "md:border-r-0" : "",
                i < 2 ? "border-b-[2px] border-border" : "",
              ].join(" ")}
            >
              {loadingKey === key ? (
                <Loader size={20} strokeWidth={2.5} className="animate-spin" />
              ) : (
                <Icon size={20} strokeWidth={2.5} />
              )}
              <span className="text-[9px] font-black uppercase tracking-[0.12em] text-center">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <ChildModalWrapper
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title={CONSTANT.importData.toUpperCase()}
        subtitle={CONSTANT.importDataSubtitle.toUpperCase()}
        width="md"
      >
        <ModalImport
          onClose={() => setImportOpen(false)}
          onSuccess={() => setImportOpen(false)}
        />
      </ChildModalWrapper>
    </>
  );
};

export default DataManagementCard;
