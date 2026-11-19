"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Printer, ShieldCheck, StickyNote, X } from "lucide-react";
import type { Member } from "@/lib/mock-data";
import { currency } from "@/lib/mock-data";

const tabs = ["Overview", "Contributions Ledger", "Loan Ledger", "Guarantor Obligations", "Documents", "Activity Notes"] as const;
type ProfileTab = typeof tabs[number];

export function MemberProfile({ member, onClose }: { member: Member; onClose: () => void }) {
  const [tab, setTab] = useState<ProfileTab>("Overview");
  const ledger = useMemo(() => {
    const monthly = Math.min(member.subscription, Math.floor(member.contribution / 12));
    const withdrawalMonth = 5;
    const withdrawal = Math.min(monthly * 2, Math.max(0, member.contribution - monthly * 12));
    const firstBalance = member.contribution - monthly * 12 + withdrawal;
    const lastMonthAdjustment = member.contribution - (firstBalance + monthly * 12 - withdrawal);
    const contributions = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(2025, 11 + index, 1);
      const amount = monthly + (index === 11 ? lastMonthAdjustment : 0);
      const payout = index === withdrawalMonth ? withdrawal : 0;
      const balance = firstBalance + monthly * (index + 1) + (index === 11 ? lastMonthAdjustment : 0) - (index >= withdrawalMonth ? withdrawal : 0);
      return { date: date.toLocaleDateString("en-NG", { month: "short", year: "numeric" }), detail: payout ? "Monthly deposit · member withdrawal" : "Monthly thrift deposit", withdrawal: payout, contribution: amount, balance };
    });
    const repayment = member.loan > 0 ? Math.max(2500, Math.ceil(member.loan / 12 / 100) * 100) : 0;
    const loans = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(2025, 11 + index, 1);
      const disbursement = member.loan > 0 && index === 0 ? member.loan + repayment * 11 : 0;
      const paid = member.loan > 0 && index > 0 ? repayment : 0;
      const balance = member.loan > 0 ? member.loan + repayment * (11 - index) : 0;
      return { date: date.toLocaleDateString("en-NG", { month: "short", year: "numeric" }), detail: disbursement ? "STL disbursement" : paid ? "Salary deduction · repayment" : "No loan activity", repayment: paid, loan: disbursement, balance };
    });
    return { contributions, loans };
  }, [member]);

  const exportCsv = () => {
    const rows = ["Date,Details,Withdrawal,Contribution,Contribution Balance,Repayment,Loan,Loan Balance", ...ledger.contributions.map((row, index) => {
      const loan = ledger.loans[index];
      return [row.date, row.detail, row.withdrawal, row.contribution, row.balance, loan.repayment, loan.loan, loan.balance].join(",");
    })];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `JTLCS-${member.psn}-statement.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const status = member.status.toLowerCase().replace(/\s+/g, "-");
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal member-profile-modal" role="dialog" aria-modal="true" aria-labelledby="member-profile-title"><header className="modal-head"><div><p className="eyebrow">MEMBER PROFILE · PSN {member.psn}</p><h2 id="member-profile-title">{member.name}</h2></div><button className="icon-button" aria-label="Close member profile" onClick={onClose}><X /></button></header><div className="profile-summary"><div className="profile-avatar large-avatar">{member.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div><span className="eyebrow">GRADE {member.grade} · {member.station}</span><p>{member.bank} · {member.account}</p><span className={`status-badge status-${status}`}>{member.status}</span></div><div className="profile-actions"><button className="button button-outline" onClick={() => window.print()}><Printer size={15} /> Print statement</button><button className="button button-outline" onClick={exportCsv}><Download size={15} /> Export CSV</button></div></div><div className="profile-tabs" role="tablist" aria-label="Member profile sections">{tabs.map((item) => <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? "tab-current" : ""} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === "Overview" && <><div className="profile-metrics"><div><span>Total contribution</span><strong>{currency(member.contribution)}</strong></div><div><span>Monthly subscription</span><strong>{currency(member.subscription)}</strong></div><div><span>Loan balance</span><strong>{currency(member.loan)}</strong></div></div><div className="profile-detail-grid"><div><span>Personal sub-head number</span><strong>{member.psn}</strong></div><div><span>Grade level</span><strong>{member.grade}</strong></div><div><span>Present station</span><strong>{member.station}</strong></div><div><span>Membership status</span><strong>{member.status}</strong></div><div><span>Bank</span><strong>{member.bank}</strong></div><div><span>Account number</span><strong>{member.account}</strong></div><div><span>Phone</span><strong>{member.phone}</strong></div><div><span>Rank / designation</span><strong>{member.rank || "Staff"}</strong></div><div><span>Address</span><strong>{member.address || "Makurdi, Benue State"}</strong></div><div><span>Next of kin</span><strong>{member.nextOfKin || "Not provided"} · {member.nextOfKinPhone || "—"}</strong></div><div><span>Date of first appointment</span><strong>{member.appointmentDate || "—"}</strong></div><div><span>Effective date</span><strong>{member.effectiveDate || "—"}</strong></div></div><div className="side-by-side-statements"><section className="statement-card"><header><div><p className="eyebrow">CONTRIBUTION</p><strong>{currency(member.contribution)}</strong></div></header><div className="ledger-table-scroll"><table className="statement-table"><thead><tr><th>DATE</th><th>DETAILS</th><th>WITHDRAWAL</th><th>CONTRIBUTION</th><th>RUNNING BALANCE</th></tr></thead><tbody>{ledger.contributions.map((row) => <tr key={row.date}><td>{row.date}</td><td>{row.detail}</td><td>{currency(row.withdrawal)}</td><td>{currency(row.contribution)}</td><td><strong>{currency(row.balance)}</strong></td></tr>)}</tbody></table></div></section><section className="statement-card"><header><div><p className="eyebrow">LOAN</p><strong>{currency(member.loan)}</strong></div></header><div className="ledger-table-scroll"><table className="statement-table"><thead><tr><th>DATE</th><th>DETAILS</th><th>REPAYMENT</th><th>LOAN</th><th>RUNNING BALANCE</th></tr></thead><tbody>{ledger.loans.map((row) => <tr key={row.date}><td>{row.date}</td><td>{row.detail}</td><td>{currency(row.repayment)}</td><td>{currency(row.loan)}</td><td><strong>{currency(row.balance)}</strong></td></tr>)}</tbody></table></div></section></div></>}
    {tab === "Contributions Ledger" && <div className="ledger-table-scroll"><table className="statement-table"><thead><tr><th>DATE</th><th>DETAILS</th><th>WITHDRAWAL</th><th>CONTRIBUTION</th><th>RUNNING BALANCE</th></tr></thead><tbody>{ledger.contributions.map((row) => <tr key={row.date}><td>{row.date}</td><td>{row.detail}</td><td>{currency(row.withdrawal)}</td><td>{currency(row.contribution)}</td><td><strong>{currency(row.balance)}</strong></td></tr>)}</tbody></table></div>}
    {tab === "Loan Ledger" && <div className="ledger-table-scroll"><table className="statement-table"><thead><tr><th>DATE</th><th>DETAILS</th><th>REPAYMENT</th><th>LOAN</th><th>RUNNING BALANCE</th></tr></thead><tbody>{ledger.loans.map((row) => <tr key={row.date}><td>{row.date}</td><td>{row.detail}</td><td>{currency(row.repayment)}</td><td>{currency(row.loan)}</td><td><strong>{currency(row.balance)}</strong></td></tr>)}</tbody></table></div>}
    {tab === "Guarantor Obligations" && <div className="profile-placeholder"><ShieldCheck /><div><strong>No active guarantor obligations</strong><p>Guarantor relationships and any amounts at risk will appear here.</p></div></div>}
    {tab === "Documents" && <div className="profile-placeholder"><FileText /><div><strong>No member documents uploaded</strong><p>Membership forms and supporting documents will appear here.</p></div></div>}
    {tab === "Activity Notes" && <div className="profile-placeholder"><StickyNote /><div><strong>Member record created in demo</strong><p>Notes and actions for this member remain in this sample session.</p></div></div>}
    <footer className="profile-footer"><span>12-month illustrative member ledger · demo data only</span><button className="button button-outline" onClick={exportCsv}><Download size={14} /> Export statement to CSV</button></footer></section></div>;
}
