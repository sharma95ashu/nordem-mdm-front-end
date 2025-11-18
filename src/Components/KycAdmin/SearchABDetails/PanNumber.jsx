import { Col, Row, Table } from "antd";
import React, { useState } from "react";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { useServices } from "Hooks/ServicesContext";
import { useQuery } from "react-query";
import ExportBtn from "Components/Shared/ExportBtn";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { PermissionAction } from "Helpers/ats.constants";
import SearchByDocument from "Static/KYC_STATIC/img/search_by_document.svg";

// Search by - PAN Number component
const PanNumber = () => {
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
    ["fetchAbDetailsByPanNo", payload],
    () => apiService.getAbDetailsByPanNo(payload),
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
          search_by: "pan_no",
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
        moduleName={"pan_number"}
        handleSearchClick={handleSearchClick}
        handleClear={handleClear}
        searchLoading={isLoading}
        searchInputField={true}
      />
      <Row gutter={[20, 24]}>
        {fetchData ? (
          <div className="kyc_admin_base">
            <Col span={24}>
              <ExportBtn columns={columns} fetchData={fetchData} fileName={"PAN Number details"} />
            </Col>
            <Col span={24}>
              <Table columns={columns} dataSource={fetchData} bordered pagination={false} />
            </Col>
          </div>
        ) : (
          <>
            <Col span={24}></Col>
            <SearchByFallbackComponent
              title={"Search by PAN Number"}
              subTitle={"Quickly search the PAN Number to process the Associate Buyers details."}
              image={SearchByDocument}
            />
          </>
        )}
      </Row>
    </>
  ) : (
    <></>
  );
};

export default PanNumber;
