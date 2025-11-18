import { Card, Col, Flex, Image, Row, theme, Typography } from "antd";
import { FALL_BACK } from "Helpers/ats.constants";
import { getDateTimeFormat } from "Helpers/ats.helper";
import React from "react";
import profileBackground from "Static/img/profile_background.svg";

const UserProfileCard = ({ userDetails }) => {
  const {
    token: { colorWhite }
  } = theme.useToken();
  const StyleSheet = {
    name: {
      fontSize: "24px",
      marginTop: 0,
      color: colorWhite
    },
    profileImage: {
      width: "100%",
      maxWidth: "125px",
      borderRadius: "8px",
      border: "1px solid #fff"
    },
    recordHeading: { color: colorWhite, fontSize: "16px" },
    recordData: { marginTop: 0, color: colorWhite, fontSize: "20px" }
  };

  return (
    <>
      <Card
        style={{
          backgroundImage: `url("${profileBackground}")`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
        className="fullWidth">
        <Flex vertical gap={12}>
          <Row gutter={24} align={"middle"}>
            <Col span={24}>
              <Flex gap={20} className="width100">
                <Flex gap={20} vertical>
                  <div className="fullHeight imageFullHeight">
                    <Image
                      style={StyleSheet.profileImage}
                      preview={false}
                      src={userDetails?.image}
                      fallback={FALL_BACK}
                    />
                  </div>
                </Flex>
                <Flex gap={0} vertical className="width100">
                  <Typography.Title level={2} style={StyleSheet.name}>
                    {userDetails?.dist_name}
                  </Typography.Title>
                  <Row gutter={20}>
                    {/* Associate Buyer Number */}
                    {userDetails?.dist_no && (
                      <Col span={6}>
                        <Typography.Text style={StyleSheet.recordHeading}>
                          Associate Buyer Number
                        </Typography.Text>
                        <Typography.Title level={3} style={StyleSheet.recordData}>
                          {userDetails?.dist_no}
                        </Typography.Title>
                      </Col>
                    )}

                    {/* Member Since */}
                    {userDetails?.member_since && (
                      <Col span={6}>
                        <Typography.Text style={StyleSheet.recordHeading}>
                          Member Since
                        </Typography.Text>
                        <Typography.Title level={3} style={StyleSheet.recordData}>
                          {" "}
                          {getDateTimeFormat(userDetails?.member_since, "DD / MMM / YYYY")}
                        </Typography.Title>
                      </Col>
                    )}

                    {/* Pin */}
                    {userDetails?.old_pin && (
                      <Col span={6}>
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
                        <Typography.Title level={3} style={StyleSheet.recordData}>
                          {userDetails?.old_pin}
                        </Typography.Title>
                      </Col>
                    )}

                    {/* Current Pin */}
                    {userDetails?.curr_pin && (
                      <Col span={6}>
                        <Typography.Text style={StyleSheet.recordHeading}>
                          Current Pin
                        </Typography.Text>
                        <Typography.Title level={3} style={StyleSheet.recordData}>
                          {userDetails?.curr_pin}
                        </Typography.Title>
                      </Col>
                    )}
                  </Row>
                </Flex>
              </Flex>
            </Col>
          </Row>
        </Flex>
      </Card>
    </>
  );
};

export default UserProfileCard;
