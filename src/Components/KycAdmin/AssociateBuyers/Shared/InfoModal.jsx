import { Col, Flex, Image, Modal, Row, Typography } from "antd";
import React from "react";
import infoIcon from "Static/img/exclamationInfoIcon.svg";
const InfoModal = () => {
  return (
    <Modal title="PAN Number Status" className="modal" open={true} width={600} footer={false}>
      <Row>
        <Col span={24}>
          <Flex vertical align="center">
            <Image src={infoIcon} preview={false} />
            <Typography.Title level={5} className="removeMargin">
              PAN Number Already Exists
            </Typography.Title>
            <Typography.Title level={5} type="secondary" className="removeMargin marginTop8">
              PAN Number for Associate Buyer Already Exists in Records
            </Typography.Title>
          </Flex>
        </Col>
      </Row>
    </Modal>
  );
};

export default InfoModal;
