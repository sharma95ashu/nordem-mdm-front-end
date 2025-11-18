import { Button, Card, Flex, Image, Typography } from "antd";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";

export const NoLeadAssigned = ({ assignNewKYCToExecutive }) => {
  return (
    <Card>
      <Flex vertical gap={24} align="center" justify="center">
        {/* Image */}
        <Image src={searchByIcon} preview={false} width={80}></Image>
        {/* Title and Text */}
        <Flex vertical gap={12} justify="center" align="center">
          <Typography.Title level={5} className="removeMargin">
            {/* No KYC Available */}
            Welcome to the KYC verification screen!
          </Typography.Title>
          <Typography.Text type="secondary">
            {/* Currently, there are no KYC verifications are available for today. Please check back
            later. */}
          Hit the Get KYC button and watch the magic happen!
          </Typography.Text>
        </Flex>

        {/* Button */}
        <Button type="primary" onClick={assignNewKYCToExecutive}>
          Get KYC
        </Button>
      </Flex>
    </Card>
  );
};
