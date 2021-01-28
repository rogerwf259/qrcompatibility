import React, { ReactElement, useEffect, useRef, useState } from "react";
import jsQR, { QRCode } from "jsqr";
import { Point } from "jsqr/dist/locator";
import { useHistory } from "react-router-dom";

interface Props {}

export default function QrReader({}: Props): ReactElement {
  const history = useHistory();
  const [outputData, setOutputData] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let context: CanvasRenderingContext2D | null | undefined = undefined;
  let video: HTMLVideoElement | null;
  let canvas: HTMLCanvasElement | null;
  let code: QRCode | null;
  let stream: MediaStream | null;
  const drawLine = (begin: Point, end: Point, color: string) => {
    if (context) {
      context.beginPath();
      context.moveTo(begin.x, begin.y);
      context.lineTo(end.x, end.y);
      context.lineWidth = 4;
      context.strokeStyle = color;
      context.stroke();
    }
  };
  const tick = () => {
    if (video?.readyState === video?.HAVE_ENOUGH_DATA && video && canvas) {
      canvas.hidden = false;
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      let imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
      if (imageData !== undefined)
        code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
      if (code) {
        drawLine(
          code.location.topLeftCorner,
          code.location.topRightCorner,
          "#fc2c03"
        );
        drawLine(
          code.location.topRightCorner,
          code.location.bottomRightCorner,
          "#fc2c03"
        );
        drawLine(
          code.location.bottomRightCorner,
          code.location.bottomLeftCorner,
          "#fc2c03"
        );
        drawLine(
          code.location.bottomLeftCorner,
          code.location.topLeftCorner,
          "#fc2c03"
        );
        setOutputData(code.data);
        setTimeout(() => {
          history.push("/ticket", { info: code });
        }, 3000);
      }
    }
    requestAnimationFrame(tick);
  };
  useEffect(() => {
    const startScan = async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (stream && video) {
        video.srcObject = stream;
        video.playsInline = true;
        video.play();
        requestAnimationFrame(tick);
      }
    };
    video = videoRef.current;
    canvas = canvasRef.current;
    context = canvas?.getContext("2d");
    startScan();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      if (video) video.srcObject = null;
    };
  }, []);
  useEffect(() => {
    console.log(outputData);
  }, [outputData]);
  return (
    <div className="qr-container">
      <h1>QR Code Scanner</h1>
      <button>Scan</button>
      <video hidden ref={videoRef} />
      <canvas ref={canvasRef} hidden id="canvas"></canvas>
      <div>
        <h3>Data:</h3>
        <span>{outputData.length > 0 ? outputData : "No data read yet"}</span>
      </div>
    </div>
  );
}
