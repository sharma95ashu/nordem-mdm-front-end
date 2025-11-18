import { Card, Col, Flex, Image, Row, Typography } from "antd";
import { FALL_BACK } from "Helpers/ats.constants";
import { getDateTimeFormat } from "Helpers/ats.helper";
import React from "react";
import profileBackground from "Static/img/cardkyc.svg";

const UserProfileCard = ({ userDetails }) => {
  const StyleSheet = {
    name: {
      fontSize: "24px",
      marginTop: 0,
      color: "#ffffff"
    },
    profileImage: {
      width: "100%",
      maxWidth: "125px",
      borderRadius: "8px",
      border: "1px solid #fff"
    },
    recordHeading: { color: "#ffffff", fontSize: "16px", fontWeight: "400" },
    recordData: { marginTop: 0, color: "#ffffff", fontSize: "20px" }
  };

  return (
    <>
      <Card
        className="fullWidth"
        style={{
          backgroundImage: `url("${profileBackground}")`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}>
        <Flex vertical gap={12}>
          <Row gutter={[24, 16]} align="middle">
            <Col span={24}>
              <Flex gap={20} className="width100">
                <Flex gap={20} vertical>
                  <Image
                    style={StyleSheet.profileImage}
                    preview={false}
                    src={userDetails?.image}
                    fallback={FALL_BACK}
                  />
                </Flex>
                <Flex gap={0} vertical className="width100">
                  <Typography.Title level={2} style={StyleSheet.name}>
                    {userDetails?.ab_name}
                  </Typography.Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6} lg={6}>
                      <Flex vertical gap={0} align={"start"}>
                        <Typography.Text style={StyleSheet.recordHeading}>
                          Associate Buyer Number
                        </Typography.Text>
                        <Typography.Title level={3} style={StyleSheet.recordData}>
                          {userDetails?.ab_no}
                        </Typography.Title>
                      </Flex>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                      <Flex vertical gap={0} align={"start"}>
                        <Typography.Text style={StyleSheet.recordHeading}>
                          Member Since
                        </Typography.Text>
                        <Typography.Title level={3} style={StyleSheet.recordData}>
                          {getDateTimeFormat(userDetails?.join_date, "DD / MMM / YYYY")}
                        </Typography.Title>
                      </Flex>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                      <Flex vertical gap={0} align={"start"}>
                        <Typography.Text style={StyleSheet.recordHeading}>
                          {`Pin  (${userDetails?.old_pin_date && userDetails?.old_pin_date})`}
                        </Typography.Text>
                        <Typography.Title level={3} style={StyleSheet.recordData}>
                          {userDetails?.old_pin}
                        </Typography.Title>
                      </Flex>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                      <Flex vertical gap={0} align={"start"}>
                        <Typography.Text style={StyleSheet.recordHeading}>
                          Current Pin
                        </Typography.Text>
                        <Typography.Title level={3} style={StyleSheet.recordData}>
                          {userDetails?.curr_pin}
                        </Typography.Title>
                      </Flex>
                    </Col>
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
