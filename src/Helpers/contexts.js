import { createContext } from "react";

// Export all contexts
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: String });
// Context for Form data control
export const FormDataControlContext = createContext("formDataControl");

// CRM ORDERS CONTEXT
export const CRMOrderContext = createContext("crmOrders");
