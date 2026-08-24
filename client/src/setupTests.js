// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom (via jest-environment-jsdom@27, bundled with react-scripts@5) does not
// provide TextEncoder/TextDecoder globals, which react-router@7 requires at
// import time. Polyfill from Node's util module so tests can load react-router-dom.
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
