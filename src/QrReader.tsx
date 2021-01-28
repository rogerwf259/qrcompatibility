import React, { ReactElement, useEffect, useRef, useState } from "react";
import jsQR, { QRCode } from "jsqr";
import { Point } from "jsqr/dist/locator";
import { useHistory } from "react-router-dom";
const QrReader: React.FC = (): ReactElement => {
  const history = useHistory();
  const [outputData, setOutputData] = useState<string>("");
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  let context = useRef<CanvasRenderingContext2D | null | undefined>();
  const drawLine = (begin: Point, end: Point, color: string) => {
    if (context.current) {
      context.current.beginPath();
      context.current.moveTo(begin.x, begin.y);
      context.current.lineTo(end.x, end.y);
      context.current.lineWidth = 4;
      context.current.strokeStyle = color;
      context.current.stroke();
    }
  };
  useEffect(() => {
    let stream: MediaStream;
    let code: QRCode | null;
    const tick = () => {
      if (
        video.current?.readyState === video.current?.HAVE_ENOUGH_DATA &&
        video.current &&
        canvas.current
      ) {
        canvas.current.hidden = false;
        canvas.current.height = video.current.videoHeight;
        canvas.current.width = video.current.videoWidth;
        context.current?.drawImage(
          video.current,
          0,
          0,
          canvas.current.width,
          canvas.current.height
        );
        let imageData = context.current?.getImageData(
          0,
          0,
          canvas.current.width,
          canvas.current.height
        );
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
    const startScan = async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (stream && video.current) {
        video.current.srcObject = stream;
        video.current.playsInline = true;
        video.current.play();
        requestAnimationFrame(tick);
      }
    };
    context.current = canvas.current?.getContext("2d");
    const v = video.current;
    startScan();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      if (v) v.srcObject = null;
    };
  }, [history]);
  useEffect(() => {
    console.log(outputData);
  }, [outputData]);
  return (
    <div className="qr-container">
      <h1>QR Code Scanner</h1>
      <button>Scan</button>
      <video hidden ref={video} />
      <canvas ref={canvas} hidden id="canvas"></canvas>
      <div>
        <h3>Data:</h3>
        <span>{outputData.length > 0 ? outputData : "No data read yet"}</span>
      </div>
    </div>
  );
};

export default QrReader;
