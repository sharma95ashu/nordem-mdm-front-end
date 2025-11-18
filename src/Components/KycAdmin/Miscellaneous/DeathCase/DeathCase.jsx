import React, { useEffect, useRef, useState } from "react";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { Button, Card, Col, Divider, Form, Input, Row } from "antd";
import UserProfileCard from "../../UserProfileCard";
import SearchByComponent from "Components/Shared/SearchByComponent";

import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { abNoMaxLength, MESSAGES, PermissionAction } from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  hasEditPermission,
  modifyCustomerResponse,
  validateABnumber,
  validationNumber
} from "Helpers/ats.helper";
import ImageTextDetails from "Components/KycAdmin/KYC/Shared/ImageTextDetails";
import RowColumnData from "Components/KycAdmin/KYC/Shared/RowColumnData";
import NewABDetails from "./NewABDetails";
import { TooltipWrapper } from "Components/Shared/Wrappers/TooltipWrapper";
import { getFullImageUrl } from "Helpers/functions";
import { SearchOutlined } from "@ant-design/icons";

const DeathCase = () => {
  const [form] = Form.useForm();
  const { apiService } = useServices();
  const searchRef = useRef();
  const [ABDetails, setABDetails] = useState({});
  const [newABDetails, setNewABDetails] = useState({});

  const [showOldABDetails, setShowOldABDetails] = useState(false);
  const [showNewABDetails, setShowNewABDetails] = useState(false);

  const StyleSheet = {
    divider: {
      marginTop: "14px",
      marginBottom: "14px"
    },
    sectionHeading: {
      color: "#1755A6"
    },
    nullPaddingInline: {
      paddingInline: "0"
    }
  };

  /**
   * Handles search action by fetching death case details.
   * @param {string} searchValue - The search input value.
   */
  const handleSearch = (searchValue) => {
    if (!searchValue) return;

    if (Object.keys(ABDetails).length == 0) {
      // Old AB search
      getDeathCaseDetails({ dist_no: searchValue });
    } else {
      // New AB search
      getNewAbDetails({ dist_no: searchValue, died_dist_no: ABDetails?.dist_no });
      setShowNewABDetails(false);
    }
  };

  /**
   * Fetch death case details.
   */
  const { mutate: getDeathCaseDetails, isLoading: loadingDeathCaseDetails } = useMutation(
    `getDeathCaseDetails`,
    (payload) => apiService.getDiedABDetails(payload),
    {
      onSuccess: ({ data, success }, payload) => {
        if (success) {
          setABDetails(modifyCustomerResponse(data));
          setShowOldABDetails(true);
          setNewABDetails({});
          form.resetFields();
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  /**
   * Fetch new Associate Buyer details after submission.
   */
  const { mutate: getNewAbDetails, isLoading: loadingNewABDetails } = useMutation(
    `getDeathCaseDetails`,
    (payload) => apiService.getNewABDetailsForDeathCase(payload),
    {
      onSuccess: ({ data, success, message }) => {
        if (success) {
          setNewABDetails(modifyCustomerResponse(data));
          setShowNewABDetails(true);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.setFormField("search_by", ABDetails?.dist_no);
    }
  }, [showOldABDetails]);

  /**
   * Handles form submission to fetch new AB details.
   * @param {Object} values - Form values.
   */
  const handleSubmit = (values) => {
    if (ABDetails?.dist_no && values.dist_no) {
      getNewAbDetails({ dist_no: values.dist_no, died_dist_no: ABDetails?.dist_no }); // api call
    }
  };

  /**
   * Resets search fields and details.
   */
  const reset = () => {
    setABDetails({});
    setNewABDetails({});
    setShowNewABDetails(false);
    if (searchRef.current) {
      searchRef.current.resetFields();
    }
    form.resetFields();
  };

  const handleShowABDetails = () => {
    setShowOldABDetails(true);
    setShowNewABDetails(false);
  };

  const handleBackBtnClick = () => {
    reset();
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Row gutter={[20, 24]}>
        {!showNewABDetails && (
          <Col span={24}>
            <SearchByComponent
              ref={searchRef}
              handleSearchClick={handleSearch}
              searchLoading={loadingDeathCaseDetails}
              moduleName={"death_case"}
              handleClear={() => {
                //
              }}
            />
          </Col>
        )}
        {!Object.keys(ABDetails).length && !Object.keys(newABDetails).length && (
          <SearchByFallbackComponent
            title={"Search by Associate Buyer Number / Reference Number"}
            subTitle={
              "Quickly Search by Associate Buyer Number / Reference Number to process the Death Case"
            }
          />
        )}

        {showOldABDetails && Object.keys(ABDetails).length > 0 && (
          <Card className="fullWidth">
            {" "}
            <Form name="search_form" form={form} layout="vertical" onFinish={handleSubmit}>
              <Row gutter={[0, 24]}>
                <Col span={24} style={StyleSheet.nullPaddingInline}>
                  <UserProfileCard className="fullWidth" userDetails={ABDetails} deathCase={true} />
                </Col>
                <Col span={24} style={StyleSheet.nullPaddingInline}>
                  <>
                    {/*--------------------- Personal Info ---------------------*/}
                    {ABDetails.AB_NAME_UPDATE_BASIC_DETAILS && (
                      <>
                        <RowColumnData
                          title={"Basic Details"}
                          titleStyle={StyleSheet.sectionHeading}
                          columnData={ABDetails.AB_NAME_UPDATE_BASIC_DETAILS}
                        />
                      </>
                    )}

                    {/*--------------------- Nominee Info ---------------------*/}
                    {ABDetails.nominee_details && (
                      <>
                        <Divider style={StyleSheet.divider}></Divider>
                        <RowColumnData
                          title={"Nominee Info"}
                          titleStyle={StyleSheet.sectionHeading}
                          columnData={ABDetails.NOMINEE_INFO}
                        />
                      </>
                    )}

                    {/*--------------------- Communication Info ---------------------*/}
                    {ABDetails.communication_details && (
                      <>
                        <Divider style={StyleSheet.divider}></Divider>
                        <ImageTextDetails
                          ColumnData={ABDetails.COMMUNICATION_INFO}
                          title={"Communication Info"}
                          document={{
                            type: ABDetails.address_proof_doc_name,
                            src: getFullImageUrl(ABDetails.address_proof_doc_path)
                          }}
                          copyIcon
                        />
                      </>
                    )}
                  </>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name={"dist_no"}
                    label={"Associate Buyer Number"}
                    className="removeMargin"
                    required
                    layout="vertical"
                    onFinish={handleSubmit}
                    rules={[{ validator: validateABnumber }]}>
                    {!showNewABDetails ? (
                      <Input
                        placeholder={`Enter New Associate Buyer Number`}
                        size="large"
                        type="text"
                        maxLength={abNoMaxLength}
                        onInput={validationNumber}
                      />
                    ) : (
                      <Input.Search
                        placeholder={`Enter New Associate Buyer Number`}
                        size="large"
                        enterButton={
                          <Button icon={<SearchOutlined />} type="primary">
                            Search
                          </Button>
                        }
                        allowClear
                        maxLength={abNoMaxLength}
                        onInput={validationNumber}
                        type="text"
                        loading={loadingNewABDetails}
                        disabled={!hasEditPermission() || loadingNewABDetails}
                        onSearch={(value) => {
                          handleSearch(value);
                        }}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              {!showNewABDetails && (
                <Row gutter={[12, 12]} className="marginTop24">
                  <Col span={12}>
                    <Button
                      size="large"
                      className="width100"
                      variant="outlined"
                      onClick={handleBackBtnClick}>
                      Back{" "}
                    </Button>
                  </Col>
                  <Col span={12}>
                    <TooltipWrapper
                      ChildComponent={
                        <Button
                          size="large"
                          className="width100"
                          type="primary"
                          htmlType="submit"
                          loading={loadingNewABDetails}
                          disabled={!hasEditPermission() || loadingNewABDetails}>
                          Review & Next
                        </Button>
                      }
                      addTooltTip={!hasEditPermission()}
                      prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                    />
                  </Col>
                </Row>
              )}
            </Form>
          </Card>
        )}
      </Row>
      {showNewABDetails && Object.keys(newABDetails).length > 0 ? (
        <NewABDetails
          diedABNo={ABDetails?.dist_no}
          diedABName={ABDetails?.dist_name}
          newABData={newABDetails}
          reset={reset}
          handleShowABDetails={handleShowABDetails}
        />
      ) : (
        ""
      )}
    </>
  ) : (
    <></>
  );
};

export default DeathCase;
