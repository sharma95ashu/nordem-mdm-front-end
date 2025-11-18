import React, { useContext, useState } from "react";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { Alert, Avatar, Card, Col, Divider, Flex, Image, Row, Spin, Table, Typography } from "antd";
import UserProfileCard from "../../UserProfileCard";
import SearchByComponent from "Components/Shared/SearchByComponent";
import KycTable from "../Shared/KycTable";
import ImageTextDetails from "../Shared/ImageTextDetails";
import RowColumnData from "../Shared/RowColumnData";
import {
  actionsPermissionValidator,
  getDateTimeFormat,
  modifyCustomerResponse
} from "Helpers/ats.helper";
import { FALL_BACK, PermissionAction } from "Helpers/ats.constants";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { EyeOutlined } from "@ant-design/icons";
import { KycAdminPaths } from "Router/KYCAdminPaths";
import { Link } from "react-router-dom";
import { ColorModeContext } from "Helpers/contexts";
import variables from "Styles/variables.scss";
import { getFullImageUrl } from "Helpers/functions";

const { Text } = Typography;

const KycSimilarEntities = () => {
  const [registeredBuyersDataSource, setRegisteredBuyersDataSource] = useState([]);
  const [similarEntriesFoundDataSource, setSimilarEntriesFoundDataSource] = useState([]);
  const [existingPanFoundDataSource, setExistingPanFoundDataSource] = useState([]);
  const [declarationDataSource, setDeclarationDataSource] = useState([]);
  const [photosList, setPhotosList] = useState({});

  const [ABDetails, setABDetails] = useState({});
  const [show, setShow] = useState(false);
  const { apiService } = useServices();
  const { mode: lightMode } = useContext(ColorModeContext);
  const { expInfoBGColorDr, expInfoBGColorLt } = variables;

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
  // ---------------- Get Kyc Similar Entities ----------------
  const { mutate: getABPhotoMutate, isLoading: fetchingPhoto } = useMutation(
    `getABPhotoByDistNumber`,
    (distNumber) => apiService.getABPhotoByDistNumber({ dist_no: distNumber }),
    {
      // Configuration options for the mutation
      onSuccess: (response, distNumber) => {
        if (response?.success && response.data) {
          setPhotosList((prev) => ({
            ...prev,
            [distNumber]: response.data
          }));
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  const TableColumns = {
    RegisteredBuyers: [
      {
        title: "AB Photo",
        dataIndex: "AB_Photo",
        width: 50,
        render: (_, field) => {
          return (
            <Flex justify="center">
              {photosList[field.proposer_id] ? (
                <Image
                  width={40}
                  height={40}
                  fallback={FALL_BACK}
                  src={getFullImageUrl(photosList[field.proposer_id])}
                />
              ) : (
                <Avatar
                  size={40}
                  icon={<EyeOutlined />}
                  className="cursorPointer"
                  onClick={() => {
                    getABPhotoMutate(field.proposer_id);
                  }}
                />
              )}
            </Flex>
          );
        }
      },
      {
        title: "Proposer Number (AB ID)",
        dataIndex: "proposer_id",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "CUST ID",
        dataIndex: "cust_id",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "RB Name",
        dataIndex: "rb_name",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      }
    ],
    SimilarEntries: [
      {
        title: "AB Photo",
        dataIndex: "AB_Photo",
        width: 50,
        render: (_, field) => {
          return (
            <Flex justify="center">
              {photosList[field.dist_no] ? (
                <Image
                  width={40}
                  height={40}
                  fallback={FALL_BACK}
                  src={getFullImageUrl(photosList[field.dist_no])}
                />
              ) : (
                <Avatar
                  size={40}
                  icon={<EyeOutlined />}
                  className="cursorPointer"
                  onClick={() => {
                    getABPhotoMutate(field.dist_no);
                  }}
                />
              )}
            </Flex>
          );
        }
      },
      {
        title: "AB ID",
        dataIndex: "dist_no",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "AB Name",
        dataIndex: "dist_name",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "Father Name",
        dataIndex: "father_name",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "Nominee Name",
        dataIndex: "nominee_name",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "City",
        dataIndex: "city",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "Address",
        dataIndex: "address_line",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "Remark",
        dataIndex: "remark",
        width: 100,
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "Resign Date",
        dataIndex: "resign_date",
        width: 150,
        render: (text) => {
          return (
            <Typography.Text>
              {" "}
              {text ? getDateTimeFormat(text, "DD / MMM / YYYY") : "-"}{" "}
            </Typography.Text>
          );
        }
      }
    ],
    PanFoundTable: [
      {
        title: "AB ID",
        dataIndex: "dist_no",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "AB Name",
        dataIndex: "dist_name",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      },
      {
        title: "PAN No.",
        dataIndex: "pan_no",
        render: (text) => <Typography.Text>{text ?? "-"}</Typography.Text>
      }
    ],
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
    getKycSimilarEntities(searchValue);
  };

  // ---------------- Get Kyc Similar Entities ----------------
  const { mutate: getKycSimilarEntities, isLoading: loadingSimilarEntities } = useMutation(
    `getKycSimilarEntities`,
    (distNumber) => apiService.getKycSimilarEntities({ dist_no: distNumber }),
    {
      // Configuration options for the mutation
      onSuccess: ({ data, success }) => {
        if (success) {
          // reset states
          setABDetails({});
          setRegisteredBuyersDataSource([]);
          setSimilarEntriesFoundDataSource([]);
          setExistingPanFoundDataSource([]);
          setDeclarationDataSource([]);

          // show dashboard
          setShow(true);

          // Updating Details with final response
          setABDetails(modifyCustomerResponse(data));

          // Registered Buyers Found
          if (data?.similar_reg_buyer?.length > 0) {
            setRegisteredBuyersDataSource(data.similar_reg_buyer);
          }

          // Similar Entries Found
          if (data?.similar_entities?.length > 0) {
            setSimilarEntriesFoundDataSource(data.similar_entities);
          }

          // Existing PAN Found
          if (data?.similar_pan?.dist_no) {
            setExistingPanFoundDataSource([data.similar_pan]);
          }

          // Securities Detail
          if (data?.security_details?.length > 0) {
            setDeclarationDataSource(data.security_details);
          }
        }
      },
      onError: (error) => {
        // reset states
        setABDetails({});
        setRegisteredBuyersDataSource([]);
        setSimilarEntriesFoundDataSource([]);
        setExistingPanFoundDataSource([]);
        setDeclarationDataSource([]);

        // hide dashboard
        setShow(false);

        console.log(error);
      }
    }
  );

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={loadingSimilarEntities || fetchingPhoto}>
      <Row gutter={[20, 24]}>
        <Col span={24}>
          <SearchByComponent
            handleClear={() => {
              /** */
            }}
            handleSearchClick={handleSearch}
            searchLoading={loadingSimilarEntities}
            moduleName={"kyc_similar_entities"}
          />
        </Col>
        {show && !loadingSimilarEntities ? (
          <Card className="fullWidth">
            <Row gutter={[0, 32]}>
              <Col span={24} style={StyleSheet.nullPaddingInline}>
                <UserProfileCard className="fullWidth" userDetails={ABDetails} />
              </Col>
              <Flex className="fullWidth" span={24} vertical gap={12}>
                {/*--------------------- Exception Info ---------------------*/}
                {ABDetails?.exp_info && (
                  <div
                    style={{
                      background: lightMode ? expInfoBGColorLt : expInfoBGColorDr,
                      padding: "10px",
                      borderRadius: "5px"
                    }}>
                    <RowColumnData
                      title={"ID Info"}
                      titleStyle={StyleSheet.sectionHeading}
                      columnData={ABDetails.EXP_INFO}
                    />
                  </div>
                )}

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

                {/*--------------------- KYC Not Ok Reason ---------------------*/}
                {!ABDetails?.kyc_info?.status && ABDetails?.not_ok_reasons?.descriptions && (
                  <>
                    <Flex vertical gap={4}>
                      <Typography.Text strong style={StyleSheet.sectionHeading}>
                        {"KYC Not OK Reason"}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        {"Your Application Form is not accepted due to following reasons :"}
                      </Typography.Text>

                      <Row gutter={[0, 16]}>
                        <Col span={24}></Col>
                        <Col span={24}>
                          <Flex gap={10}>
                            <div></div>
                            <Table
                              bordered
                              className="fullWidth"
                              columns={[
                                {
                                  title: "Sr. No.",
                                  dataIndex: "sr_no",
                                  key: "sr_no",
                                  width: 100,
                                  render: (_, __, index) => (
                                    <Typography.Text>{index + 1}</Typography.Text>
                                  )
                                },
                                {
                                  title: "Reason",
                                  dataIndex: "reason",
                                  key: "reason",
                                  render: (reason) => <Typography.Text>{reason}</Typography.Text>
                                }
                              ]}
                              dataSource={
                                ABDetails?.not_ok_reasons?.descriptions
                                  ? ABDetails.not_ok_reasons.descriptions?.map((reason) => {
                                      return reason?.toLowerCase() === "other"
                                        ? {
                                            reason: `${reason} ${
                                              ABDetails?.kyc_info?.remark &&
                                              "- " + ABDetails?.kyc_info?.remark
                                            }`
                                          }
                                        : { reason: reason };
                                    })
                                  : []
                              }
                              pagination={false}
                              scroll={{ x: true }}
                            />
                          </Flex>
                        </Col>
                      </Row>
                    </Flex>
                    <Divider style={StyleSheet.divider}></Divider>
                  </>
                )}

                {/*--------------------- KYC Termination Reason ---------------------*/}
                {ABDetails?.is_terminated &&
                  ABDetails?.termination_info?.descriptions?.length > 0 && (
                    <>
                      <Flex gap={16} align="center">
                        <Typography.Text strong style={StyleSheet.sectionHeading}>
                          {"KYC Termination Reason"}
                        </Typography.Text>
                        <Alert
                          message={`Associate Buyer is Terminated ${
                            ABDetails?.termination_info?.terminated_on &&
                            "on " + ABDetails?.termination_info?.terminated_on
                          } ${
                            ABDetails?.termination_info?.terminated_by &&
                            "by " + ABDetails?.termination_info?.terminated_by
                          }`}
                          type="error"
                          showIcon
                        />
                      </Flex>

                      <Row gutter={[0, 16]}>
                        <Col span={24}></Col>
                        <Col span={24}>
                          <Flex gap={10}>
                            <div></div>
                            <Table
                              bordered
                              className="fullWidth"
                              columns={[
                                {
                                  title: "Sr. No.",
                                  dataIndex: "sr_no",
                                  key: "sr_no",
                                  width: 100,
                                  render: (_, __, index) => (
                                    <Typography.Text>{index + 1}</Typography.Text>
                                  )
                                },
                                {
                                  title: "Reason",
                                  dataIndex: "reason",
                                  key: "reason",
                                  render: (reason) => <Typography.Text>{reason}</Typography.Text>
                                }
                              ]}
                              dataSource={
                                ABDetails?.termination_info?.descriptions
                                  ? ABDetails.termination_info?.descriptions?.map((reason) => {
                                      return reason?.toLowerCase() === "other"
                                        ? {
                                            reason: `${reason} ${
                                              ABDetails?.termination_info?.remark &&
                                              "- " + ABDetails?.termination_info?.remark
                                            }`
                                          }
                                        : { reason: reason };
                                    })
                                  : []
                              }
                              pagination={false}
                              scroll={{ x: true }}
                            />
                          </Flex>
                        </Col>
                      </Row>
                      <Divider style={StyleSheet.divider}></Divider>
                    </>
                  )}

                {/*--------------------- Sponsor/Proposer Info ---------------------*/}
                <RowColumnData
                  title={"Sponsor/Proposer Info"}
                  titleStyle={StyleSheet.sectionHeading}
                  columnData={ABDetails.SPONSOR_INFO}
                />

                {/*--------------------- Registered Buyers Found ---------------------*/}

                {registeredBuyersDataSource.length > 0 && (
                  <>
                    <Divider style={StyleSheet.divider}></Divider>
                    <Flex vertical gap={12}>
                      <Text strong style={StyleSheet.sectionHeading}>
                        {" "}
                        Registered Buyers Found{" "}
                      </Text>
                      <Flex gap={10}>
                        <div></div>
                        <KycTable
                          columns={TableColumns.RegisteredBuyers}
                          data={registeredBuyersDataSource}
                          tableKey={"rb-found"}></KycTable>
                      </Flex>
                    </Flex>
                  </>
                )}

                {/*--------------------- Similar Entries Found ---------------------*/}
                {similarEntriesFoundDataSource.length > 0 && (
                  <>
                    <Divider style={StyleSheet.divider}></Divider>
                    <Flex vertical gap={12}>
                      <Text strong style={StyleSheet.sectionHeading}>
                        {" "}
                        Similar Entries Found{" "}
                      </Text>
                      <Flex gap={10}>
                        <div></div>
                        <KycTable
                          columns={TableColumns.SimilarEntries}
                          data={similarEntriesFoundDataSource}
                          tableKey={"se-found"}></KycTable>
                      </Flex>
                    </Flex>
                  </>
                )}

                {/*--------------------- Existing PAN Found ---------------------*/}
                {existingPanFoundDataSource.length > 0 && (
                  <>
                    <Divider style={StyleSheet.divider}></Divider>
                    <Flex vertical gap={12}>
                      <Text strong style={StyleSheet.sectionHeading}>
                        {" "}
                        Existing PAN Found{" "}
                      </Text>
                      <Flex gap={10}>
                        <div></div>
                        <KycTable
                          columns={TableColumns.PanFoundTable}
                          data={existingPanFoundDataSource}
                          tableKey={"pan-found"}></KycTable>
                      </Flex>
                    </Flex>
                  </>
                )}

                {/*--------------------- Personal Info ---------------------*/}
                {ABDetails.personal_details && (
                  <>
                    <Divider style={StyleSheet.divider}></Divider>
                    <ImageTextDetails
                      ColumnData={ABDetails.PERSONAL_INFO}
                      title={"Personal Info"}
                      document={{
                        type: ABDetails.identity_proof_doc_name,
                        src: getFullImageUrl(ABDetails.identity_proof_doc_path)
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
                        src: getFullImageUrl(ABDetails.address_proof_doc_path)
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
                                src: getFullImageUrl(ABDetails.bank_proof_doc_path)
                              },
                              {
                                type: ABDetails.pan_proof_doc_name,
                                src: getFullImageUrl(ABDetails.pan_proof_doc_path)
                              }
                            ]
                          : {
                              type: ABDetails.bank_proof_doc_name,
                              src: getFullImageUrl(ABDetails.bank_proof_doc_path)
                            }
                      }
                    />
                  </>
                )}
              </Flex>
            </Row>
          </Card>
        ) : (
          <SearchByFallbackComponent
            title={"Search by Associate Buyer Number / Reference Number"}
            subTitle={
              "Quickly search the Associate Buyer Number / Reference Number to process the KYC similar entites details."
            }
          />
        )}
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default KycSimilarEntities;
