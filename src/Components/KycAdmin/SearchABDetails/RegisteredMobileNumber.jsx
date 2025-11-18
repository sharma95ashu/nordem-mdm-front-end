import { Col, Row, Table, Typography } from "antd";
import ExportBtn from "Components/Shared/ExportBtn";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { PermissionAction } from "Helpers/ats.constants";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useState } from "react";
import { useQuery } from "react-query";

// Search by - Registered Mobile Number component
const RegisteredMobileNumber = () => {
  const [payload, setPayload] = useState(null);
  const { apiService } = useServices();

  const columns = [
    {
      title: "Associate Buyer Number",
      dataIndex: "Associate_Buyer_Number",
      key: "Associate_Buyer_Number",
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Associate Buyer Name",
      dataIndex: "Associate_Buyer_Name",
      key: "Associate_Buyer_Name",
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    }
  ];

  // useQuery to fetch data
  const { data: fetchData, isLoading } = useQuery(
    ["fetchAbDetailsByMobNo", payload],
    () => apiService.getAbDetailsByMobNo(payload),
    {
      enabled: !!payload, // Fetch only when payload is available
      select: (data) => data?.data || [],
      onError: (error) => {
        //
      }
    }
  );

  // handle search click
  const handleSearchClick = (val) => {
    try {
      if (val) {
        const payload = {
          search_by: "reg_mobile_no",
          value: val
        };
        setPayload(payload);
      }
    } catch (error) {}
  };

  // handle search change / search clear
  const handleClear = () => {
    //
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <SearchByComponent
        moduleName={"registered_mobile_number"}
        handleSearchClick={handleSearchClick}
        handleClear={handleClear}
        searchLoading={isLoading}
        searchInputField={true}
      />
      <Row gutter={[20, 24]}>
        {fetchData ? (
          <div className="kyc_admin_base">
            <Col span={24}>
              <ExportBtn
                columns={columns}
                fetchData={fetchData}
                fileName={"Registered Mobile Number details"}
              />
            </Col>
            <Col span={24}>
              <Table columns={columns} dataSource={fetchData} bordered pagination={false} />
            </Col>
          </div>
        ) : (
          <>
            <Col span={24}></Col>
            <SearchByFallbackComponent
              title={"Search by Registered Mobile Number"}
              subTitle={
                "Quickly search the registered mobile number to process the Associate Buyer's Details."
              }
            />
          </>
        )}
      </Row>
    </>
  ) : (
    <></>
  );
};

export default RegisteredMobileNumber;
