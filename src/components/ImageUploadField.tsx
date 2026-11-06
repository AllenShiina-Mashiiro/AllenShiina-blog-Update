"use client";
import { useEffect, useState } from "react";

type Props = { onUploaded: (url: string) => void; cropAspect?: number };

export default function ImageUploadField({ onUploaded, cropAspect }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);

  useEffect(() => {
    if (!pending) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(pending);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pending]);

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      let finalFile = file;
      if (cropAspect && file.type !== "image/gif") {
        const bitmap = await createImageBitmap(file);
        let sourceWidth = bitmap.width;
        let sourceHeight = bitmap.height;
        if (sourceWidth / sourceHeight > cropAspect) sourceWidth = sourceHeight * cropAspect;
        else sourceHeight = sourceWidth / cropAspect;

        const sourceX = (bitmap.width - sourceWidth) * x / 100;
        const sourceY = (bitmap.height - sourceHeight) * y / 100;
        const width = Math.min(1920, Math.round(sourceWidth));
        const height = Math.max(1, Math.round(width / cropAspect));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          bitmap.close();
          throw new Error("无法处理图片");
        }
        context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
        bitmap.close();

        const preserveAlpha = file.type === "image/png" || file.type === "image/webp";
        const outputType = preserveAlpha ? file.type : "image/jpeg";
        const extension = outputType === "image/png" ? ".png" : outputType === "image/webp" ? ".webp" : ".jpg";
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (value) => value ? resolve(value) : reject(new Error("图片裁剪失败")),
            outputType,
            preserveAlpha ? undefined : 0.92,
          );
        });
        finalFile = new File([blob], file.name.replace(/\.[^.]+$/, "") + extension, { type: outputType });
      }

      const data = new FormData();
      data.set("file", finalFile);
      const response = await fetch("/api/media", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "上传失败");
      onUploaded(result.asset.url);
      setMessage("图片已上传并应用。");
      setPending(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "上传失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="image-upload-field">
      <label>
        选择图片（最大 20MB；PNG/WebP 保留透明背景，GIF 保留动画但不裁剪）
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.currentTarget.value = "";
            setX(50);
            setY(50);
            if (cropAspect) setPending(file || null);
            else void upload(file);
          }}
        />
      </label>
      {pending && preview && (
        <div className="crop-panel">
          <div
            className="crop-preview"
            style={{
              aspectRatio: String(cropAspect),
              backgroundImage: "url(" + preview + ")",
              backgroundPosition: x + "% " + y + "%",
            }}
          />
          <label>
            水平位置
            <input type="range" min="0" max="100" value={x} onChange={(event) => setX(Number(event.target.value))} />
          </label>
          <label>
            垂直位置
            <input type="range" min="0" max="100" value={y} onChange={(event) => setY(Number(event.target.value))} />
          </label>
          <button type="button" className="primary-button" disabled={busy} onClick={() => void upload(pending)}>
            裁剪并上传
          </button>
        </div>
      )}
      {message && <p className="form-message">{message}</p>}
    </div>
  );
}
