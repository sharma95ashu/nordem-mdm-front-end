import { Card, Col, Divider, Flex, Row, Spin } from "antd";
import React, { useState } from "react";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { useServices } from "Hooks/ServicesContext";
import { useQuery } from "react-query";
import { actionsPermissionValidator, modifyCustomerResponse } from "Helpers/ats.helper";
import { PermissionAction } from "Helpers/ats.constants";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";
import UserProfileCard from "../UserProfileCard";
import RowColumnData from "../KYC/Shared/RowColumnData";
import ImageTextDetails from "../KYC/Shared/ImageTextDetails";
import { getFullImageUrl } from "Helpers/functions";

// Search by - ReferenceNumber Number component
const ReferenceNumber = () => {
  const [payload, setPayload] = useState(null);
  const { apiService } = useServices();

  // useQuery to fetch data
  const { data: ABDetails, isLoading } = useQuery(
    ["fetchAbDetailsByReferenceNo", payload],
    () => apiService.fetchAbDetailsByReferenceNo(payload),
    {
      enabled: !!payload, // Fetch only when payload is available
      select: (data) => {
        if (data?.success && data?.data) {
          return modifyCustomerResponse(data.data);
        }
        return {};
      },
      onError: (error) => {
        // Handle error here
      }
    }
  );

  // handle search click
  const handleSearchClick = (val) => {
    try {
      if (val) {
        const payload = {
          search_by: "reference_no",
          value: val
        };
        setPayload(payload);
      }
    } catch (error) {}
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={isLoading}>
      <SearchByComponent
        moduleName={"reference_number"}
        handleSearchClick={handleSearchClick}
        handleClear={() => {
          //
        }}
        searchLoading={isLoading}
        searchInputField={true}
      />
      <Row gutter={[20, 24]}>
        {Object.values(ABDetails || {})?.length > 0 ? (
          <>
            <Col span={24}></Col>
            <Card className="fullWidth">
              <Flex gap={24} vertical>
                {/*--------------------- Hero Card ---------------------*/}
                {Object.values(ABDetails)?.length > 0 && (
                  <UserProfileCard userDetails={ABDetails || {}} />
                )}

                {/*--------------------- Basic Details ---------------------*/}
                {ABDetails?.BASIC_DETAILS && (
                  <>
                    <RowColumnData title={"Basic Details"} columnData={ABDetails.BASIC_DETAILS} />
                  </>
                )}

                {/*--------------------- Personal Info ---------------------*/}
                {ABDetails?.personal_details && (
                  <>
                    <Divider className="divider-sm"></Divider>
                    <ImageTextDetails
                      ColumnData={ABDetails?.PERSONAL_INFO}
                      title={"Personal Info"}
                      document={{
                        type: ABDetails?.identity_proof_doc_name,
                        src: getFullImageUrl(ABDetails?.identity_proof_doc_path)
                      }}
                    />
                  </>
                )}
              </Flex>
            </Card>
          </>
        ) : (
          <>
            <Col span={24}></Col>
            <SearchByFallbackComponent
              title={"Search by Reference Number"}
              subTitle={"Quickly search the Reference Number to process the basic details."}
              image={searchByIcon}
            />
          </>
        )}
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default ReferenceNumber;
