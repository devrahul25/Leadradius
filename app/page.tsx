import { redirect } from "next/navigation";

export default function Home() {
  // Prototype: send everyone to the dashboard. In production this would check
  // the auth cookie/JWT and redirect to /login if not authenticated.
  redirect("/dashboard");
}
