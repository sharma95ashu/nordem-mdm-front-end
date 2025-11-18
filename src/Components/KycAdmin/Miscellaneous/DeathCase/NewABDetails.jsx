import { Button, Card, Col, Divider, Flex, Form, Row, Table, Typography } from "antd";
import ConfirmationModal from "Components/KycAdmin/AssociateBuyers/Shared/Modal";
import ImageTextDetails from "Components/KycAdmin/KYC/Shared/ImageTextDetails";
import RowColumnData from "Components/KycAdmin/KYC/Shared/RowColumnData";
import UserProfileCard from "Components/KycAdmin/UserProfileCard";
import { snackBarSuccessConf } from "Helpers/ats.constants";
import { getFullImageUrl } from "Helpers/functions";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";
import { KycAdminPaths } from "Router/KYCAdminPaths";

const NewABDetails = ({
  diedABNo,
  diedABName,
  newABData: ABDetails,
  reset,
  handleShowABDetails
}) => {
  const [form] = Form.useForm();
  const [modal, setModal] = useState(false);
  const { apiService } = useServices();

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
    },
    content: {
      backgroundColor: "#F5F5F5",
      borderRadius: "12px",
      padding: "16px",
      marginTop: "16px"
    },
    icon: {
      color: "#FA8C16",
      fontSize: "24px",
      marginTop: 4
    }
  };

  const { mutate: updateDeathCase, isLoading: updatingDeathCase } = useMutation(
    `getDeathCaseDetails`,
    (payload) => apiService.updateDeathCase(payload),
    {
      onSuccess: ({ data, success, message }) => {
        if (success) {
          enqueueSnackbar(message, snackBarSuccessConf);
          setModal(false);
          reset();
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  const handleSubmit = () => {
    setModal(true);
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

  const handleModal = (val) => {
    setModal(val);
  };

  const handleConfirmationClick = () => {
    const payload = {
      dist_no: ABDetails.dist_no,
      died_dist_no: diedABNo
    };

    updateDeathCase(payload); // call api
  };
  return (
    <>
      <Row gutter={[20, 24]} className="margin-top-8px">
        <Card className="fullWidth">
          {" "}
          <Form name="search_form" form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={[0, 10]}>
              <Col span={24} style={StyleSheet.nullPaddingInline}>
                <UserProfileCard className="fullWidth" userDetails={ABDetails} />
              </Col>
              <Flex className="fullWidth" span={24} vertical gap={12}>
                <>
                  {ABDetails.SPONSOR_INFO && (
                    <>
                      <Divider style={StyleSheet.divider}></Divider>
                      <RowColumnData
                        title={"Sponsor/Proposer Info"}
                        titleStyle={StyleSheet.sectionHeading}
                        columnData={ABDetails.SPONSOR_INFO}
                      />
                    </>
                  )}

                  {/*--------------------- Personal Info ---------------------*/}
                  {ABDetails.personal_details ? (
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
                  ) : (
                    ""
                  )}

                  {/*--------------------- Associate Buyer Declaration ---------------------*/}
                  {ABDetails?.security_details ? (
                    Object.keys(ABDetails?.security_details)?.length > 0 ? (
                      <Flex vertical gap={12}>
                        <Typography.Text strong style={StyleSheet.sectionHeading}>
                          {"Associate Buyer Declaration"}
                        </Typography.Text>
                        <Flex gap={10}>
                          <Table
                            className="kycTable-death-case-new-ab-details fullWidth"
                            // className="KycTable__exec-remark fullWidth"
                            bordered
                            columns={TableColumns.DeclarationTable}
                            dataSource={ABDetails?.security_details}
                            pagination={false}
                            scroll={{ x: true }}
                          />
                        </Flex>
                      </Flex>
                    ) : (
                      ""
                    )
                  ) : (
                    ""
                  )}

                  {/*--------------------- Nominee Info ---------------------*/}
                  {ABDetails.nominee_details ? (
                    <>
                      <Divider style={StyleSheet.divider}></Divider>
                      <RowColumnData
                        title={"Nominee Info"}
                        titleStyle={StyleSheet.sectionHeading}
                        columnData={ABDetails.NOMINEE_INFO}
                      />
                    </>
                  ) : (
                    ""
                  )}

                  {/*--------------------- Communication Info ---------------------*/}
                  {ABDetails.communication_details ? (
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
                  ) : (
                    ""
                  )}

                  {/*--------------------- BANK Info ---------------------*/}
                  {ABDetails.bank_details ? (
                    <>
                      <Divider style={StyleSheet.divider}></Divider>
                      <ImageTextDetails
                        ColumnData={ABDetails.bank_details}
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
                        copyIcon
                      />
                    </>
                  ) : (
                    ""
                  )}
                </>
              </Flex>
            </Row>
            <Row gutter={[12, 12]} className="marginTop24">
              <Col span={12}>
                <Button
                  size="large"
                  className="width100"
                  variant="outlined"
                  onClick={handleShowABDetails}>
                  Back{" "}
                </Button>
              </Col>
              <Col span={12}>
                <Button size="large" className="width100" type="primary" htmlType="submit">
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </Row>

      {modal && (
        <ConfirmationModal
          handleConfirmation={handleConfirmationClick}
          loadingSubmission={updatingDeathCase}
          handleModal={handleModal}
          cnfrmTnTitle={"Confirm to Replace with New AB ID?"}
          module={"Death Case"}
          userDetails={{
            diedABNo: diedABNo,
            diedABName: diedABName,
            newABNAme: ABDetails?.dist_name,
            newABNo: ABDetails?.dist_no
          }}
        />
      )}
    </>
  );
};

export default NewABDetails;
