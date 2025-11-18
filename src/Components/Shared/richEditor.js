// import DOMPurify from "dompurify";
import { ColorModeContext } from "Helpers/contexts";

import { useContext } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function RichEditor(props) {
  const { mode } = useContext(ColorModeContext);

  /** Editor modules in italic,underline */
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
      ["link", props?.image, "code"],
      // [{ color: [] }],
      ["clean"]
    ],
    clipboard: {
      matchVisual: false
    }
  };
  /**
   * Editor Formats
   */
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    props?.image,
    "code"
    // "color"
  ];

  return (
    <>
      <ReactQuill
        className={mode ? "richEditor" : "richEditorDark"}
        modules={modules}
        value={props.description || ""}
        formats={formats}
        onChange={(value, field = null) => {
          props.handleDescription(value, field);
        }}
        placeholder={props.placeholder}
      />
    </>
  );
}
