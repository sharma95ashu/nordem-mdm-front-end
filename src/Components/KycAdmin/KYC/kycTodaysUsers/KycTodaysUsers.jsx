import React, { useEffect, useRef, useState } from "react";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { Card, Col, Divider, Flex, Form, Row, Spin, Table, Typography } from "antd";
import UserProfileCard from "../../UserProfileCard";
import SearchByComponent from "Components/Shared/SearchByComponent";
import ImageTextDetails from "../Shared/ImageTextDetails";
import RowColumnData from "../Shared/RowColumnData";
import { Link, useSearchParams } from "react-router-dom";
import { KycAdminPaths } from "Router/KYCAdminPaths";
import { useQuery } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { PermissionAction } from "Helpers/ats.constants";
import { actionsPermissionValidator, modifyCustomerResponse } from "Helpers/ats.helper";
const { Text } = Typography;

const KycTodaysUsers = () => {
  // Initialized States
  const searchRef = useRef();
  const [declarationDataSource, setDeclarationDataSource] = useState([]);
  const [ABDetails, setABDetails] = useState({});
  const [show, setShow] = useState(false);
  const [kycStatusForm] = Form.useForm();
  const { apiService } = useServices();
  const [payload, setPayload] = useState(null);

  // Query Params
  const [searchParams] = useSearchParams();
  const abId = searchParams.get("ab_number");

  const StyleSheet = {
    divider: {
      marginTop: "14px",
      marginBottom: "14px"
    },
    sectionHeading: {
      color: "#1755A6"
    },
    submissionForm: {
      marginTop: "20px"
    },
    nullPaddingInline: {
      paddingInline: "0"
    },
    Card: {
      paddingBottom: "24px"
    },
    RecordColumn: {
      width: "100%",
      maxWidth: "25%"
    }
  };

  const TableColumns = {
    DeclarationTable: [
      {
        title: "AB ID",
        dataIndex: "dist_no",
        render: (ab_id) => {
          return (
            <Typography.Text underline>
              <Link to={`/${KycAdminPaths.abDetails}?ab_id=${ab_id}`}>{ab_id}</Link>
            </Typography.Text>
          );
        }
      },
      {
        title: "Name",
        dataIndex: "dist_name",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "Relation",
        dataIndex: "relation_name",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "Active",
        dataIndex: "status",
        render: (text) => <Typography.Text>{text ? "Y" : "N" ?? "-"}</Typography.Text>
      },
      {
        title: "Pin",
        dataIndex: "pin",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      }
    ]
  };

  const handleSearch = (searchValue) => {
    try {
      if (searchValue) {
        const payload = {
          dist_no: searchValue
        };
        setPayload(payload);
      }
    } catch (error) {}
  };

  // Reset States
  const resetApplicationStates = (clearSearchField = false) => {
    setABDetails({});
    setDeclarationDataSource([]);
    kycStatusForm.resetFields();

    // hide dashboard
    setShow(false);

    // clear search field
    if (clearSearchField && searchRef.current) {
      searchRef.current.resetFields(); // this will clear the search box
    }
  };

  // clear the param from URL
  const removeSearchParams = (paramName) => {
    const url = new URL(window.location.href);
    url.searchParams.delete(paramName);
    window.history.pushState({}, "", url);
  };

  useEffect(() => {
    removeSearchParams("ab_number");
  }, [payload]);

  // Set payload to DIST NO. if params exist
  useEffect(() => {
    if (abId) {
      // Set Value in the input box
      if (searchRef.current) {
        searchRef.current.setFormField("search_by", abId);
        setPayload({
          dist_no: abId
        });
      }
    }
  }, [abId]);

  const { isLoading: loadingTodaysUsersDetails } = useQuery(
    ["getKycTodaysUsersDetails", payload],
    () => apiService.getKycTodaysUsersDetails(payload),
    {
      enabled: !!payload,
      onSuccess: ({ data, success, message }) => {
        if (success) {
          // reset all states
          resetApplicationStates();

          // show dashboard
          setShow(true);

          // Updating Details with final response
          setABDetails(modifyCustomerResponse(data));

          // Securities Detail
          if (data?.security_details?.length > 0) {
            setDeclarationDataSource(data.security_details);
          }
        }
      },
      onError: (error) => {
        // reset all states
        resetApplicationStates();

        console.log(error);
      }
    }
  );

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={loadingTodaysUsersDetails} size="large">
      <Row gutter={[20, 24]}>
        <Col span={24}>
          <SearchByComponent
            ref={searchRef}
            handleClear={() => {
              /** */
            }}
            currentPath={window.location.pathname}
            handleSearchClick={handleSearch}
            searchLoading={loadingTodaysUsersDetails}
            moduleName={"kyc_todays_users"}
          />
        </Col>
        {show ? (
          <Card className="fullWidth">
            <Row gutter={[0, 32]}>
              <Col span={24} style={StyleSheet.nullPaddingInline}>
                <UserProfileCard className="fullWidth" userDetails={ABDetails} />
              </Col>
              <Flex className="fullWidth" span={24} vertical gap={12}>
                <>
                  {/*--------------------- KYC Info ---------------------*/}
                  {ABDetails?.kyc_info && (
                    <>
                      <RowColumnData
                        title={"KYC Info"}
                        titleStyle={StyleSheet.sectionHeading}
                        columnData={ABDetails.KYC_INFO}
                      />
                      <Divider style={StyleSheet.divider}></Divider>
                    </>
                  )}

                  {/*--------------------- Sponsor/Proposer Info ---------------------*/}
                  <RowColumnData
                    title={"Sponsor/Proposer Info"}
                    titleStyle={StyleSheet.sectionHeading}
                    columnData={ABDetails.SPONSOR_INFO}
                  />

                  {/*--------------------- Personal Info ---------------------*/}
                  {ABDetails.personal_details && (
                    <>
                      <Divider style={StyleSheet.divider}></Divider>
                      <ImageTextDetails
                        ColumnData={ABDetails.PERSONAL_INFO}
                        title={"Personal Info"}
                        document={{
                          type: ABDetails.identity_proof_doc_name,
                          src: `${process.env.REACT_APP_IMAGE_URL}${ABDetails.identity_proof_doc_path}`
                        }}
                      />
                    </>
                  )}

                  {/*--------------------- Associate Buyer Declaration ---------------------*/}
                  {/* This will only be visible if ""PERSONAL_INFO Declaration is YES. */}
                  {ABDetails?.PERSONAL_INFO?.Declaration?.toLowerCase()?.startsWith("y") &&
                    declarationDataSource.length > 0 && (
                      <Flex vertical gap={12}>
                        <Text strong style={StyleSheet.sectionHeading}>
                          {"Associate Buyer Declaration"}
                        </Text>
                        <Flex gap={10}>
                          <div></div>
                          <Table
                            className="fullWidth"
                            bordered
                            columns={TableColumns.DeclarationTable}
                            dataSource={declarationDataSource}
                            pagination={false}
                            scroll={{ x: true }}
                          />
                        </Flex>
                      </Flex>
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
                          src: `${process.env.REACT_APP_IMAGE_URL}${ABDetails.address_proof_doc_path}`
                        }}
                        copyIcon
                      />
                    </>
                  )}

                  {/*--------------------- Bank Account Info ---------------------*/}
                  {ABDetails.bank_details && (
                    <>
                      <Divider style={StyleSheet.divider}></Divider>
                      <ImageTextDetails
                        ColumnData={ABDetails.BANK_ACCOUNT_INFO}
                        title={"Bank Account Info"}
                        document={
                          ABDetails.pan_proof_doc_path
                            ? [
                                {
                                  type: ABDetails.bank_proof_doc_name,
                                  src: `${process.env.REACT_APP_IMAGE_URL}${ABDetails.bank_proof_doc_path}`
                                },
                                {
                                  type: ABDetails.pan_proof_doc_name,
                                  src: `${process.env.REACT_APP_IMAGE_URL}${ABDetails.pan_proof_doc_path}`
                                }
                              ]
                            : {
                                type: ABDetails.bank_proof_doc_name,
                                src: `${process.env.REACT_APP_IMAGE_URL}${ABDetails.bank_proof_doc_path}`
                              }
                        }
                      />
                    </>
                  )}
                </>
              </Flex>
            </Row>
          </Card>
        ) : (
          <SearchByFallbackComponent
            title={"Search by Reference Number"}
            subTitle={"Quickly search the Reference Number to process the KYC edit new details."}
          />
        )}
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default KycTodaysUsers;
