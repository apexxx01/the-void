import { useEffect } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useAuth } from "@clerk/react";

export function AuthSetup({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Inject the Clerk token getter into the generated API hooks
    setAuthTokenGetter(() => getToken());
  }, [getToken]);

  return <>{children}</>;
}
