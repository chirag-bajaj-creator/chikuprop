import { useState, useRef, useCallback } from "react";
import { uploadImages } from "../../services/propertyService";
import "./ImageUploader.css";

const MAX_IMAGES = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

function ImageUploader({ images, onChange, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const remaining = MAX_IMAGES - images.length;

  const validateFiles = (files) => {
    const fileArray = Array.from(files);
    if (fileArray.length > remaining) {
      return `You can only add ${remaining} more photo${remaining === 1 ? "" : "s"}`;
    }
    for (const file of fileArray) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return "Only JPG, PNG, and WebP images are allowed";
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return `Each image must be under ${MAX_SIZE_MB}MB`;
      }
    }
    return null;
  };

  const handleUpload = useCallback(async (files) => {
    if (disabled) return;

    const validationError = validateFiles(files);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setUploading(true);
    setProgress(0);

    try {
      const urls = await uploadImages(files, (percent) => {
        setProgress(percent);
      });
      onChange([...images, ...urls]);
    } catch (err) {
      const message = err.response?.data?.error || "Image upload failed. Please try again.";
      setError(message);
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset file input so same files can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [disabled, images, onChange, remaining]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!disabled && !uploading && e.dataTransfer.files?.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleRemove = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetCover = (index) => {
    if (index === 0) return;
    const updated = [...images];
    const [moved] = updated.splice(index, 1);
    updated.unshift(moved);
    onChange(updated);
  };

  return (
    <div className="image-uploader">
      <div className="image-uploader-header">
        <label>Property Photos</label>
        <span className="image-counter">{images.length}/{MAX_IMAGES} photos</span>
      </div>

      {remaining > 0 && (
        <div
          className={`image-dropzone${dragActive ? " dropzone-active" : ""}${disabled ? " dropzone-disabled" : ""}${uploading ? " dropzone-uploading" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload photos"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !disabled && !uploading) inputRef.current?.click();
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="image-input-hidden"
            disabled={disabled || uploading}
          />
          {uploading ? (
            <div className="dropzone-progress">
              <div className="dropzone-progress-bar">
                <div
                  className="dropzone-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="dropzone-progress-text">Uploading... {progress}%</span>
            </div>
          ) : (
            <>
              <div className="dropzone-icon">+</div>
              <p className="dropzone-text">
                <span className="dropzone-text-desktop">Drag photos here or click to browse</span>
                <span className="dropzone-text-mobile">Tap to add photos</span>
              </p>
              <p className="dropzone-hint">JPG, PNG, WebP up to {MAX_SIZE_MB}MB each</p>
            </>
          )}
        </div>
      )}

      {error && <span className="field-error">{error}</span>}

      {images.length > 0 && (
        <div className="image-grid">
          {images.map((url, index) => (
            <div key={url} className="image-thumb">
              <img src={url} alt={`Property photo ${index + 1}`} />
              {index === 0 && <span className="image-cover-badge">Cover</span>}
              {index !== 0 && (
                <button
                  className="image-set-cover"
                  onClick={() => handleSetCover(index)}
                  aria-label="Set as cover photo"
                  title="Set as cover photo"
                >
                  Set cover
                </button>
              )}
              <button
                className="image-remove"
                onClick={() => handleRemove(index)}
                aria-label={`Remove photo ${index + 1}`}
              >
                {"\u2715"}
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="image-optional-hint">
          You can add photos later by editing your listing.
        </p>
      )}
    </div>
  );
}

export default ImageUploader;
