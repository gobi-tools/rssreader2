import ReactSrv from "react-srv";
import config from "./react-srv.config.js";
import { h } from 'preact';
import { renderToString, renderToStaticMarkup } from 'preact-render-to-string';

export default new ReactSrv({
  ...config,
  // avoid having two copies of Preact
  runtime: { h, renderToString, renderToStaticMarkup },
});