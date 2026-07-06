import Link from "next/link";

export function AppShell({ children, active }: { children: React.ReactNode; active: "inbox"|"report"|"pages" }) {
  return <div className="app">
    <div className="topbar">
      <div className="brand"><div className="brand-dot">💬</div>Unified Inbox</div>
      <div className="nav">
        <Link className={active==="inbox"?"active":""} href="/inbox">Inbox</Link>
        <Link className={active==="report"?"active":""} href="/report">Staff Report</Link>
        <Link className={active==="pages"?"active":""} href="/settings/pages">Pages</Link>
      </div>
    </div>
    {children}
  </div>
}
