import { Card, Flex, Row, Spin, Tabs } from "antd";
import UserProfileCard from "Components/KycAdmin/UserProfileCard";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { actionsPermissionValidator, modifyCustomerResponse } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useRef, useState } from "react";
import { useQuery } from "react-query";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";
import { PermissionAction } from "Helpers/ats.constants";
import History from "./History";
import BasicDetails from "./BasicDetails";

const ABNameUpdate = () => {
  const [payload, setPayload] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [abData, setABData] = useState({});
  const [historyData, setHistoryData] = useState([]);

  const { apiService } = useServices();
  const searchRef = useRef();
  const [activeTab, setActiveTab] = useState("1");

  /**
   * Fetches AB details when the payload is available.
   */
  const { isLoading } = useQuery(
    ["fetchAbDetailsByABNo", payload],
    () => apiService.getABDetailsForNameUpdate(payload),
    {
      enabled: !!payload, // Fetch only when payload is available
      onSuccess: (data) => {
        if (data?.data) {
          setABData(modifyCustomerResponse(data?.data)); // Modifying AB Data for UI
          setHistoryData(data?.data?.history_details);
          setShowDashboard(true); // Show Dashboard
        }
      },
      onError: (error) => {
        setShowDashboard(false); // hide dashboard
        console.log(error);
      }
    }
  );

  // handles tab change in the UI.
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // handle search click
  const handleSearchClick = (val) => {
    try {
      val &&
        setPayload({
          dist_no: val
        });
    } catch (error) {}
  };

  // Resets the dashboard
  const reset = () => {
    setShowDashboard(false);
    if (searchRef.current) {
      searchRef.current.resetFields();
    }
    setPayload(null);
  };

  // Tab Items
  const items = [
    {
      key: "1",
      label: "Basic Details",
      children: (
        <>
          <BasicDetails ABDetails={abData || {}} reset={reset} payload={payload?.dist_no || null} />
        </>
      )
    },
    {
      key: "2",
      label: "History",
      children: (
        <>
          <History historyData={historyData} />
        </>
      )
    }
  ];

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={isLoading}>
      <SearchByComponent
        moduleName={"ab_name_update"}
        handleSearchClick={handleSearchClick}
        searchLoading={isLoading}
        handleClear={() => {
          //
        }}
        ref={searchRef}
      />
      {showDashboard ? (
        <Row gutter={[20, 12]} className="marginTop24">
          <Card className="fullWidth">
            <Flex gap={24} vertical={true}>
              <UserProfileCard className="fullWidth" userDetails={abData} />
              <div className="kycTab">
                <Tabs
                  activeKey={activeTab}
                  onChange={handleTabChange}
                  defaultActiveKey="1"
                  items={items}
                  size="large"
                />
              </div>
            </Flex>
          </Card>
        </Row>
      ) : (
        <SearchByFallbackComponent
          title={"Search by Associate Buyer Number / Reference Number"}
          subTitle={"Quickly search the Associate Buyer Number / Reference Number to update the Associate Buyer Name."}
          image={searchByIcon}
        />
      )}
    </Spin>
  ) : (
    <></>
  );
};

export default ABNameUpdate;
