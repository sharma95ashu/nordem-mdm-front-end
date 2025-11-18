import React, { useRef, useState } from "react";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { Card, Col, Divider, Flex, Row, theme } from "antd";
import SearchByComponent from "Components/Shared/SearchByComponent";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { PermissionAction } from "Helpers/ats.constants";
import { actionsPermissionValidator, modifyCustomerResponse } from "Helpers/ats.helper";
import RowColumnData from "../../KYC/Shared/RowColumnData";
import BankDetails from "./BankDetails";
import UserProfileCard from "Components/KycAdmin/UserProfileCard";

const ABBankAccountUpdate = () => {
  const [ABDetails, setABDetails] = useState({});
  const [distNo, setDistNo] = useState(null);
  const { apiService } = useServices();
  const searchRef = useRef();
  const bankDetailsRef = useRef();

  const {
    token: { colorBorder }
  } = theme.useToken();

  /**
   * Inline styles used within the component
   */
  const StyleSheet = {
    sectionHeading: {
      color: "#1755A6"
    },
    nullPaddingInline: {
      paddingInline: "0"
    },
    Card: {
      paddingBottom: "24px"
    },
    verDividerStyle: {
      borderColor: colorBorder
    }
  };

  /**
   * Handles the search functionality by fetching Associate Buyer details
   *
   * @param {string} searchValue - The Associate Buyer number to search for
   */
  const handleSearch = (searchValue) => {
    try {
      if (searchValue) {
        getABDetails(searchValue);
        setDistNo(searchValue);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Resets the application state and clears the search field
   */
  const reset = () => {
    setABDetails({});
    if (searchRef.current) {
      searchRef.current.resetFields(); // this will clear the search box
    }
  };

  /**
   * Fetches Associate Buyer details from the API service
   */
  const { mutate: getABDetails, isLoading: loadingABDetails } = useMutation(
    `getABDetails`,
    (distNumber) => apiService.getAbDetailsForBankDetailsUpdate({ dist_no: distNumber }),
    {
      onSuccess: ({ data, success }) => {
        if (success && data) {
          // reseting previous bank details
          if (bankDetailsRef.current) {
            bankDetailsRef.current.resetBankDetails();
          }

          // Updating Details with final response
          setABDetails(modifyCustomerResponse(data));
        }
      },
      onError: (error) => {
        // reseting previous bank details
        if (bankDetailsRef.current) {
          bankDetailsRef.current.resetBankDetails();
        }

        // reset all states
        reset();
        console.log(error);
      }
    }
  );

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Row gutter={[20, 24]}>
      <Col span={24}>
        <SearchByComponent
          ref={searchRef}
          handleClear={() => {
            /** */
          }}
          handleSearchClick={handleSearch}
          searchLoading={loadingABDetails}
          moduleName={"ab_bank_acnt_update"}
        />
      </Col>
      {Object.keys(ABDetails)?.length > 0 ? (
        <Card className="fullWidth">
          <Row gutter={[0, 20]}>
            <Col span={24} style={StyleSheet.nullPaddingInline}>
              <UserProfileCard className="fullWidth" userDetails={ABDetails} />
            </Col>
            <Flex className="fullWidth" span={24} vertical gap={12}>
              <RowColumnData
                title={"Sponsor/Proposer Info"}
                titleStyle={StyleSheet.sectionHeading}
                columnData={ABDetails.SPONSOR_INFO}
              />
            </Flex>
            <Divider style={StyleSheet.verDividerStyle} className="removeMargin" />
            <Col span={24}>
              <BankDetails
                ref={bankDetailsRef}
                distNo={distNo}
                fetchedABBankDetails={ABDetails}
                resetApplicationStates={reset}
                loadingABDetails={loadingABDetails}
                titleStyle={StyleSheet.sectionHeading}
                title={"Bank Details"}
              />
            </Col>
          </Row>
        </Card>
      ) : (
        <SearchByFallbackComponent
          title={"Search by Associate Buyer Number / Reference Number"}
          subTitle={"Quickly search the Associate Buyer Number / Reference Number to process the Bank Account Update."}
        />
      )}
    </Row>
  ) : (
    <></>
  );
};

export default ABBankAccountUpdate;
