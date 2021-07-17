export const fileMapping = (fileName: string): string => {
  const prefix = 'language-';

  const extension_regex = /(?:\.([^.]+))?$/;
  let extension = extension_regex.exec(fileName)[1];
  if (extension === undefined) {
    extension = fileName;
  }

  let fileType = 'plaintext';

  if (extension === 'sh' || extension === 'zsh') {
    fileType = 'sh';
  }
  if (extension === 'cs') {
    fileType = 'csharp';
  }
  if (extension === 'c' || extension === 'h') {
    fileType = 'c';
  }
  if (extension === 'cpp' || extension === 'hpp') {
    fileType = 'cpp';
  }
  if (extension === 'cmake') {
    fileType = 'cmake';
  }
  if (extension === 'css') {
    fileType = 'css';
  }
  if (extension === 'dart') {
    fileType = 'dart';
  }
  if (extension === 'Dockerfile') {
    fileType = 'docker';
  }
  if (extension === 'erl') {
    fileType = 'erl';
  }
  if (extension === 'go') {
    fileType = 'go';
  }
  if (extension === 'gradle') {
    fileType = 'gradle';
  }
  if (extension === 'xml' || extension === 'svg') {
    fileType = 'xml';
  }
  if (extension === 'html') {
    fileType = 'html';
  }
  if (extension === 'hs') {
    fileType = 'haskell';
  }
  if (extension === 'json') {
    fileType = 'json';
  }
  if (extension === 'java') {
    fileType = 'java';
  }
  if (extension === 'js' || extension === 'jsx') {
    fileType = 'jsx';
  }
  if (extension === 'jl') {
    fileType = 'julia';
  }
  if (extension === 'kt') {
    fileType = 'kotlin';
  }
  if (extension === 'lua') {
    fileType = 'lua';
  }
  if (extension === 'makefile' || extension === 'Makefile') {
    fileType = 'make';
  }
  if (extension === 'm') {
    fileType = 'matlab';
  }
  if (extension === 'nginx') {
    fileType = 'nginx';
  }
  if (extension === 'php') {
    fileType = 'php';
  }
  if (extension === 'txt') {
    fileType = 'txt';
  }
  if (extension === 'sql') {
    fileType = 'sql';
  }
  if (extension === 'py') {
    fileType = 'python';
  }
  if (extension === 'r') {
    fileType = 'r';
  }
  if (extension === 'rb') {
    fileType = 'rb';
  }
  if (extension === 'scss') {
    fileType = 'scss';
  }
  if (extension === 'ts' || extension === 'tsx') {
    fileType = 'typescript';
  }
  if (extension === 'vba') {
    fileType = 'vba';
  }
  if (extension === 'asm' || extension === 'a') {
    fileType = 'x86asm';
  }
  if (extension === 'yaml' || extension === 'yml') {
    fileType = 'yml';
  }
  return prefix + fileType;
};
