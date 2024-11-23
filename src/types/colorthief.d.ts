declare module 'colorthief' {
    export function getColor(imagePath: string): Promise<[number, number, number]>;
    export function getPalette(imagePath: string): Promise<[number, number, number][]>;
  }