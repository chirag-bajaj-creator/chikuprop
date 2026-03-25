import { useState, useRef } from "react";
import { uploadVideo } from "../../services/propertyService";
import "./VideoUploader.css";

const MAX_SIZE_MB = 50;

function VideoUploader({ video, onChange, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const inputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (disabled) return;

    if (file.type !== "video/mp4") {
      setError("Only MP4 videos are allowed");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Video must be under ${MAX_SIZE_MB}MB`);
      return;
    }

    setError("");
    setUploading(true);
    setProgress(0);
    setFileName(file.name);

    try {
      const url = await uploadVideo(file, (percent) => {
        setProgress(percent);
      });
      onChange(url);
    } catch (err) {
      const message = err.response?.data?.error || "Video upload failed. Please try again.";
      setError(message);
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
    setFileName("");
    setError("");
  };

  return (
    <div className="video-uploader">
      <label className="video-uploader-label">Video Walkthrough (optional)</label>

      {!video && !uploading && (
        <div
          className={`video-dropzone${disabled ? " video-dropzone-disabled" : ""}`}
          onClick={() => !disabled && inputRef.current?.click()}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload video"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !disabled) inputRef.current?.click();
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4"
            onChange={handleFileSelect}
            className="video-input-hidden"
            disabled={disabled}
          />
          <div className="video-dropzone-icon">
            <span>{"\u25B6"}</span>
          </div>
          <p className="video-dropzone-text">Upload a video walkthrough</p>
          <p className="video-dropzone-hint">MP4 only, up to {MAX_SIZE_MB}MB</p>
        </div>
      )}

      {uploading && (
        <div className="video-uploading">
          <p className="video-filename">{fileName}</p>
          <div className="video-progress-bar">
            <div
              className="video-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="video-progress-text">Uploading... {progress}%</span>
        </div>
      )}

      {video && !uploading && (
        <div className="video-uploaded">
          <div className="video-uploaded-icon">
            <span>{"\u25B6"}</span>
          </div>
          <span className="video-uploaded-name">{fileName || "Video uploaded"}</span>
          <button
            className="video-remove"
            onClick={handleRemove}
            aria-label="Remove video"
          >
            {"\u2715"}
          </button>
        </div>
      )}

      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export default VideoUploader;
