import { Popconfirm, Tooltip } from "antd";

export const PopconfirmWrapper = ({
  ChildComponent,
  addTooltTip,
  prompt,
  onConfirm,
  title,
  description,
  okText,
  cancelText,
  ...otherProps
}) => {
  return (
    <Popconfirm
      onConfirm={onConfirm}
      title={title}
      description={description}
      okText={okText}
      cancelText={cancelText}
      {...otherProps}>
      {addTooltTip ? <Tooltip title={prompt}>{ChildComponent}</Tooltip> : ChildComponent}
    </Popconfirm>
  );
};
