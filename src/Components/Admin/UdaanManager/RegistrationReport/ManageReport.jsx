import { Tabs } from "antd";
import { PermissionAction } from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import React, { useEffect, useState } from "react";
import { Paths } from "Router/Paths";

import RegistrationList from "./RegistrationList/RegistrationList";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "Hooks/UserContext";
import RegistrationSummary from "./RegistrationList/RegistrationSummary";
import EligibleReport from "./RegistrationList/EligibleReport";

function ManageReport() {
  const navigate = useNavigate();
  const { setBreadCrumb } = useUserContext();
  const [activeTab, setActiveTab] = useState("1");

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? null
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Udaan",
      icon: "",
      titlePath: Paths.udaanReport,
      subtitle: "Registration Report",
      path: Paths.users
    });
  }, []);
  return (
    <div>
      <Tabs
        defaultActiveKey="1"
        onChange={(key) => setActiveTab(key)}
        activeKey={activeTab}
        items={[
          {
            label: "Registration Summary",
            key: "1",

            children: activeTab === "1" ? <RegistrationSummary activeTab={activeTab} /> : null
          },
          {
            label: "Registration List",
            key: "2",
            children: activeTab === "2" ? <RegistrationList activeTab={activeTab} /> : null
          },
          {
            label: "Eligible AB Report",
            key: "3",
            children: activeTab === "3" ? <EligibleReport activeTab={activeTab} /> : null
          }
        ]}
      />
    </div>
  );
}

export default ManageReport;
