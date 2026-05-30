import { useState } from "react";
import { PreviewCtx } from "./previewCtx";

export function PreviewProvider({ children }) {
  const [preview, setPreview] = useState(false);
  return (
    <PreviewCtx.Provider value={{ preview, toggle: () => setPreview((p) => !p) }}>
      {children}
    </PreviewCtx.Provider>
  );
}
