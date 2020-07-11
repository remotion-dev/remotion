import React, { useCallback } from "react";
import { useRecoilState } from "recoil";
import { previewSizeState } from "../state/preview-size";

export const SizeSelector = () => {
  const [size, setSize] = useRecoilState(previewSizeState);

  const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSize(e.target.value);
  }, []);

  return (
    <div>
      <select onChange={onChange}>
        <option value="0.25">25%</option>
        <option value="0.5">50%</option>
        <option value="1">100%</option>
      </select>
    </div>
  );
};
