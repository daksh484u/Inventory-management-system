import { useContext } from "react";
import { PreviewCtx } from "../context/previewCtx";

export const usePreview = () => useContext(PreviewCtx);
