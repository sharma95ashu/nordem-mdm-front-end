import { Col, Row, Spin, Table } from "antd";
import React, { useState } from "react";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { useServices } from "Hooks/ServicesContext";
import { useQuery } from "react-query";
import ExportBtn from "Components/Shared/ExportBtn";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { PermissionAction } from "Helpers/ats.constants";
import SearchByDocument from "Static/KYC_STATIC/img/search_by_document.svg";

// Search by - Aadhar Number component
const AadharNumber = () => {
  const [payload, setPayload] = useState(null);
  const { apiService } = useServices();

  const columns = [
    {
      title: "Associate Buyer Number",
      dataIndex: "ab_no",
      key: "ab_no"
    },
    {
      title: "Associate Buyer Name",
      dataIndex: "ab_name",
      key: "ab_name"
    }
  ];

  // useQuery to fetch data
  const { data: fetchData, isLoading } = useQuery(
    ["fetchAbDetailsByAadharNo", payload],
    () => apiService.getAbDetailsByAadharNo(payload),
    {
      enabled: !!payload, // Fetch only when payload is available
      select: (data) =>
        data?.success && data?.data
          ? data?.data?.map((item) => ({
              ab_no: item?.Associate_Buyer_Number,
              ab_name: item?.Associate_Buyer_Name
            }))
          : [],
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
          search_by: "aadhar_no",
          value: val
        };
        setPayload(payload);
      }
    } catch (error) {}
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={isLoading}>
      <SearchByComponent
        moduleName={"aadhar_number"}
        handleSearchClick={handleSearchClick}
        handleClear={() => {
          //
        }}
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
                fileName={"Aadhar Number details"}
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
              title={"Search by Aadhar Number"}
              subTitle={
                "Quickly search the Aadhar number to process the Associate Buyer's Details."
              }
              image={SearchByDocument}
            />
          </>
        )}
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default AadharNumber;
