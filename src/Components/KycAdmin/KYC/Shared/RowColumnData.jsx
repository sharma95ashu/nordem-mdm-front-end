import { Col, Flex, Row, Tag, Typography } from "antd";
import { renderColumnData } from "Helpers/ats.helper";
import React from "react";
import { Link } from "react-router-dom";
import { KycAdminPaths } from "Router/KYCAdminPaths";

// Check is type of value is object
const isObject = (value) => {
  return typeof value === "object";
};

const RowColumnData = ({ titleStyle, title, columnData, colSpan, indentation = true }) => {
  return (
    <Flex vertical gap={12}>
      <Typography.Text strong style={titleStyle} className="color-primary">
        {" "}
        {title}{" "}
      </Typography.Text>
      <Flex gap={10}>
        {indentation && <div></div>}
        <Row gutter={[20, 16]} className="fullWidth">
          {Object.values(columnData || {})?.length > 0 &&
            Object.entries(columnData || {}).map(([key, value], index) => {
              return (
                <Col key={index} xs={12} md={value?.span || colSpan || 6}>
                  <Flex vertical gap={2}>
                    <Typography.Text type="secondary">
                      {" "}
                      {renderColumnData(key?.toString())}{" "}
                    </Typography.Text>
                    {isObject(value) && value?.tag ? (
                      <Tag color={value.tag} className="width-fit-content">
                        {renderColumnData(value) || "N/A"}
                      </Tag>
                    ) : isObject(value) && value?.routerLink ? (
                      <Typography.Text underline>
                        <Link to={`/${KycAdminPaths.abDetails}?ab_id=${value?.routerLink}`}>
                          {value?.routerLink}
                        </Link>
                      </Typography.Text>
                    ) : (
                      <Typography.Text> {renderColumnData(value) || "N/A"} </Typography.Text>
                    )}
                  </Flex>
                </Col>
              );
            })}
        </Row>
      </Flex>
    </Flex>
  );
};

export default RowColumnData;
