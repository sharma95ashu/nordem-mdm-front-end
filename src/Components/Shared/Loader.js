import { Spin } from "antd";

const Loader = () => {
  return (
    <>
      <Spin style={styleSheet.loaderStyle} tip="Loading..." fullscreen={true}></Spin>
    </>
  );
};

export default Loader;

const styleSheet = {
  loaderStyle: { background: "rgba(0,0,0,0.8)" }
};
