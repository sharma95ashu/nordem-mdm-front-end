import { createContext, useContext } from "react";
export const NotificationContext = createContext("notificationContext");
export function useNotify() {
  return useContext(NotificationContext);
}
