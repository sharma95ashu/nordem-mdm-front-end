import { Button, Card, Col, Flex, Grid, Image, Row, Tag, Typography, Upload } from "antd";
import { FALL_BACK, MESSAGES } from "Helpers/ats.constants";
import { getDateTimeFormat, hasEditPermission, isDesktopScreen } from "Helpers/ats.helper";
import React from "react";

import profileBackground from "Static/img/profile_background.svg";
import Pencilicon from "Static/img/Pencilicon.svg";
import variables from "Styles/variables.scss";
import { TooltipWrapper } from "Components/Shared/Wrappers/TooltipWrapper";
import { getFullImageUrl } from "Helpers/functions";
const UserProfileCard = ({
  moduleType,
  handlePhotoDelete,
  userDetails,
  uploadOnChange,
  loading,
  imageUrl,
  deathCase
}) => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const { deathCaseColor, deathCaseBorder, deathCaseFontColor } = variables;

  // will check if current is desktop screen

  const StyleSheet = {
    Card: {
      // backgroundImage: `url("${profileBackground}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      ...(deathCase
        ? { backgroundColor: deathCaseColor, border: `1px solid ${deathCaseBorder}` }
        : { backgroundImage: `url("${profileBackground}")` })
    },
    name: {
      fontSize: "24px",
      marginTop: 0,
      color: deathCase ? deathCaseFontColor : "#ffffff",
      marginBottom: 0
    },
    Relative: {
      position: "relative"
    },
    profileImage: {
      width: "115px",
      maxWidth: "115px",
      height: "115px",
      borderRadius: "8px",
      border: deathCase ? `2px solid ${deathCaseBorder}` : "2px solid #fff",
      objectFit: "cover"
    },
    recordHeading: { color: deathCase ? deathCaseFontColor : "#ffffff", fontSize: "16px" },
    recordData: {
      marginTop: 0,
      marginBottom: 0,
      color: deathCase ? deathCaseFontColor : "#ffffff",
      fontSize: "20px"
    },
    ChangePhotoLink: { color: "#ffffff", cursor: "pointer" },
    ChangeIconSection: {
      position: "absolute",
      top: "9px",
      right: "9px",
      width: "24px",
      height: "24px",
      color: "#ffffff",
      backgroundColor: "#737373",
      borderRadius: "90px",
      cursor: "pointer",
      border: "1px solid #ffffff"
    },
    PencilIcon: {
      width: "12px",
      marginBottom: "3px"
    }
  };

  return (
    <>
      <Card className="UserProfileCard fullWidth " style={StyleSheet.Card}>
        <Flex vertical gap={12}>
          <Row gutter={24} align={"middle"}>
            <Col span={24}>
              <Flex
                gap={20}
                className="width100"
                {...(!isDesktopScreen(screens) && { vertical: "true" })}>
                <Flex gap={8} vertical align={isDesktopScreen(screens) ? "center" : "start"}>
                  <div style={StyleSheet.Relative}>
                    <Image
                      style={StyleSheet.profileImage}
                      preview={false}
                      src={imageUrl ? imageUrl : getFullImageUrl(userDetails?.doc_path)}
                      fallback={FALL_BACK}
                      loading={loading}
                    />

                    {/* KYC Document Update */}
                    {moduleType === "kyc-document-update" && (
                      <Flex align="center" justify="center" style={StyleSheet.ChangeIconSection}>
                        <Upload
                          accept=".jpg,.jpeg,.png"
                          onChange={uploadOnChange}
                          maxCount={1}
                          showUploadList={false}
                          beforeUpload={() => false}>
                          <Image
                            preview={false}
                            src={Pencilicon}
                            fallback={FALL_BACK}
                            style={StyleSheet.PencilIcon}
                          />
                        </Upload>
                      </Flex>
                    )}
                  </div>

                  {/* AB Photo Delete */}
                  {moduleType === "photo-delete" && (
                    <TooltipWrapper
                      ChildComponent={
                        <Button
                          disabled={!hasEditPermission()}
                          size="middle"
                          type="primary"
                          danger
                          className="width100"
                          onClick={handlePhotoDelete}>
                          Enable Photo
                        </Button>
                      }
                      addTooltTip={!hasEditPermission()}
                      prompt={MESSAGES.NOT_REQUIRED_PERMISSIONS}
                    />
                  )}

                  {/* KYC Document Update Change Photo */}
                  {moduleType === "kyc-document-update" && (
                    <Upload
                      accept=".jpg,.jpeg,.png"
                      onChange={uploadOnChange}
                      showUploadList={false}
                      maxCount={1}
                      beforeUpload={() => false}>
                      <Typography.Text underline style={StyleSheet.ChangePhotoLink}>
                        {"Change Photo"}
                      </Typography.Text>
                    </Upload>
                  )}

                  {/* KYC AB Photo Update */}
                  {moduleType === "kyc-ab-photo-update" && (
                    <Upload
                      accept=".jpg,.jpeg,.png"
                      onChange={uploadOnChange}
                      maxCount={1}
                      showUploadList={false}
                      beforeUpload={() => false}>
                      <Typography.Text underline style={StyleSheet.ChangePhotoLink}>
                        {"Upload Photo"}
                      </Typography.Text>
                    </Upload>
                  )}
                </Flex>
                <Flex gap={12} vertical className="width100" justify="space-evenly">
                  <Flex gap={16} align="center">
                    <Typography.Title level={3} style={StyleSheet.name}>
                      {userDetails?.dist_name}
                    </Typography.Title>
                    {userDetails?.is_terminated && <Tag color="red">Terminated</Tag>}
                  </Flex>

                  <Row gutter={[20, 24]}>
                    {/* Associate Buyer Number */}
                    {userDetails?.dist_no && (
                      <Col xs={24} md={6}>
                        <Flex vertical gap={0} align={"start"}>
                          <Typography.Text style={StyleSheet.recordHeading}>
                            Associate Buyer Number
                          </Typography.Text>
                          <Typography.Title level={4} style={StyleSheet.recordData}>
                            {userDetails?.dist_no}
                          </Typography.Title>
                        </Flex>
                      </Col>
                    )}

                    {/* Member Since */}

                    {userDetails?.member_since && (
                      <Col xs={24} md={6}>
                        <Flex vertical gap={0} align={"start"}>
                          <Typography.Text style={StyleSheet.recordHeading}>
                            Member Since
                          </Typography.Text>
                          <Typography.Title level={4} style={StyleSheet.recordData}>
                            {userDetails?.member_since
                              ? getDateTimeFormat(userDetails?.member_since, "DD / MMM / YYYY")
                              : "N/A"}
                          </Typography.Title>
                        </Flex>
                      </Col>
                    )}

                    {/* Pin */}
                    {userDetails?.old_pin && (
                      <Col xs={24} md={6}>
                        <Flex vertical gap={0} align={"start"}>
                          <Typography.Text style={StyleSheet.recordHeading}>
                            Pin{" "}
                            {userDetails?.old_pin_date ? (
                              <>{` (${getDateTimeFormat(
                                userDetails?.old_pin_date,
                                "MMMM YYYY"
                              )}) `}</>
                            ) : (
                              <></>
                            )}{" "}
                          </Typography.Text>
                          <Typography.Title level={4} style={StyleSheet.recordData}>
                            {userDetails?.old_pin}
                          </Typography.Title>
                        </Flex>
                      </Col>
                    )}

                    {/* Current Pin */}
                    {userDetails?.curr_pin && (
                      <Col xs={24} md={6}>
                        <Flex vertical gap={0} align={"start"}>
                          <Typography.Text style={StyleSheet.recordHeading}>
                            Current Pin
                          </Typography.Text>
                          <Typography.Title level={4} style={StyleSheet.recordData}>
                            {userDetails?.curr_pin}
                          </Typography.Title>
                        </Flex>
                      </Col>
                    )}
                  </Row>
                </Flex>
              </Flex>
            </Col>
          </Row>
        </Flex>

        <Flex vertical align="center" gap={20}></Flex>
      </Card>
    </>
  );
};
export default UserProfileCard;
