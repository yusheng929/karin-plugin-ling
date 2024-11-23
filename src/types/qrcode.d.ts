declare module 'qrcode' {
    interface QRCodeOptions {
      errorCorrectionLevel?: 'low' | 'medium' | 'quartile' | 'high';
      type?: 'image/png' | 'image/jpeg' | 'image/webp' | 'svg' | 'utf8';
      width?: number;
      scale?: number;
      margin?: number;
      color?: {
        dark?: string; // Color for dark blocks (e.g. "#000000")
        light?: string; // Color for light blocks (e.g. "#FFFFFF")
      };
    }
  
    export function toDataURL(
      text: string,
      options?: QRCodeOptions
    ): Promise<string>;
  
    export function toString(
      text: string,
      options?: QRCodeOptions
    ): Promise<string>;
  
    export function toFile(
      path: string,
      text: string,
      options?: QRCodeOptions
    ): Promise<void>;
  
    export function toFileStream(
      stream: NodeJS.WritableStream,
      text: string,
      options?: QRCodeOptions
    ): void;
  }