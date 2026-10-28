import Document from './documents/Document.js';

export default { 
  Document, 
  framework: "preact",
  isProd: process.env.NODE_ENV === 'production',
  outPath: './public/hydrate',
  srcPath: './src',
  minify: true,
} as any;