import { AppShell } from "@/components/AppShell";
import InboxClient from "@/components/InboxClient";

export default function InboxPage(){
  return <AppShell active="inbox"><InboxClient /></AppShell>;
}
