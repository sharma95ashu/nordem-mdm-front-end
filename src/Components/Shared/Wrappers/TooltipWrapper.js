import { Tooltip } from "antd";

export const TooltipWrapper = ({ ChildComponent, addTooltTip, prompt }) => {
  return addTooltTip ? <Tooltip title={prompt}>{ChildComponent}</Tooltip> : ChildComponent;
};
