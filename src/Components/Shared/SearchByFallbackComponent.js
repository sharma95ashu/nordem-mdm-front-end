import { Col, Flex, Typography } from "antd";
import React from "react";
import searchByIcon from "Static/img/searchby.svg";

const SearchByFallbackComponent = (props) => {
  const { title, subTitle, image } = props;
  return (
    <Col span={24}>
      <Flex vertical justify="center" align="center" gap={24} style={{ padding: "24px" }}>
        <img src={image ? image : searchByIcon} alt="category" style={StyleSheet.iconStyle} />
        <Flex vertical justify="center" align="center">
          <Typography.Title level={5}>{title}</Typography.Title>
          <Typography.Text type="secondary">{subTitle}</Typography.Text>
        </Flex>
      </Flex>
    </Col>
  );
};

export default SearchByFallbackComponent;
