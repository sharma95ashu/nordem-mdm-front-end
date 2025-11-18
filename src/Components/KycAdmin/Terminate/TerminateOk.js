import { Card, Col, Flex, Form, Image, Input, Modal, Row, Typography } from "antd";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import React, { useState } from "react";
import FailedIcon from "Static/img/terminate_fail.svg";
import SuccessIcon from "Static/img/terminate_success.svg";

const TerminateOk = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Row gutter={[20, 24]}>
      <Col span={24}>
        <Flex justify="space-between" vertical>
          <Typography.Title level={4} className="removeMargin">
            {"Terminated OK "}
          </Typography.Title>
          <Typography.Text className="removeMargin">{`Terminate / Terminated OK`}</Typography.Text>
        </Flex>
      </Col>
      <Card className="fullWidth" bordered={true}>
        <Col span={12}>
          <Form name="search_form" layout="vertical">
            <Form.Item name="search_by" label={"Associate Buyer Number"}>
              <Input.Search
                placeholder="Enter Associate Buyer Number"
                allowClear
                enterButton="Search"
                size="large"
                onSearch={() => setIsModalOpen(true)}
              />
            </Form.Item>
          </Form>
        </Col>
      </Card>
      <Col span={24}>
        <SearchByFallbackComponent
          title={"Search by Associate Buyer Number"}
          subTitle={
            "Quickly search the Associate Buyer Number to process the terminated OK details."
          }
        />
      </Col>

      <Modal
        title="Terminated OK Status"
        className="successContainer"
        closable={true}
        onCancel={() => setIsModalOpen(false)}
        open={isModalOpen}
        footer={false}>
        <Flex vertical={true} align="center" gap={20}>
          <Image
            width={77}
            preview={false}
            src={SuccessIcon ? FailedIcon : FailedIcon}
            alt="terminate"
          />

          <Flex vertical={true} align="center" gap={8}>
            <Typography.Text strong size="large">
              Terminated
            </Typography.Text>
            <Typography.Text type="secondary" size="large">
              Associate Buyer is Terminated
            </Typography.Text>
          </Flex>
        </Flex>
      </Modal>
    </Row>
  );
};

export default TerminateOk;
