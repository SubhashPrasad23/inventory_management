import { useState, useEffect, useRef } from "react";
import { HiOutlineCamera, HiOutlineUpload } from "react-icons/hi";
import { Html5QrcodeScanner } from "html5-qrcode";
import { BrowserMultiFormatReader } from "@zxing/browser";


const BarcodeScanner = ({ onScan, id = "barcode-scanner" }) => {
  const [mode, setMode] = useState("camera");
  const [showCamera, setShowCamera] = useState(true);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Camera scanner
  useEffect(() => {
    if (showCamera && mode === "camera") {
      const scanner = new Html5QrcodeScanner(id, {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        rememberLastUsedCamera: true,
        videoConstraints: {
          facingMode: "environment",
        },
      });

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          scanner.clear();
          setShowCamera(false);
        },
        () => {}
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          try { scannerRef.current.clear(); } catch { /* ignore */ }
        }
      };
    }
  }, [showCamera, mode]);

  // Image upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    try {
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageUrl(imageUrl);
      onScan(result.getText());
    } catch {
      alert("Could not detect barcode from image. Try a clearer photo.");
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  };

  return (
    <div className="space-y-3">
      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          type="button"
          onClick={() => { setMode("camera"); setShowCamera(true); }}
          className={`flex-1 py-2 rounded-md text-xs font-medium transition ${mode === "camera" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}
        >
          <HiOutlineCamera className="w-3.5 h-3.5 inline mr-1" />
          Camera
        </button>
        <button
          type="button"
          onClick={() => { setMode("upload"); setShowCamera(false); }}
          className={`flex-1 py-2 rounded-md text-xs font-medium transition ${mode === "upload" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}
        >
          <HiOutlineUpload className="w-3.5 h-3.5 inline mr-1" />
          Upload
        </button>
      </div>

      {/* Camera*/}
      {showCamera && mode === "camera" && (
        <div className="border-2 border-dashed border-teal-200 rounded-lg p-3 bg-teal-50/30">
          <p className="text-xs text-gray-500 mb-2 text-center">Point camera at barcode</p>
          <div id={id}></div>
        </div>
      )}

      {/* Upload */}
      {mode === "upload" && (
        <div className="border-2 border-dashed border-teal-200 rounded-lg p-4 bg-teal-50/30 text-center">
          <HiOutlineUpload className="w-7 h-7 text-teal-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500 mb-3">Upload barcode image</p>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border border-gray-300 text-gray-700 text-xs px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Choose Image
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
