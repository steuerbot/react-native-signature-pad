export default `
window.onerror = function(message, url, line, column, error) {
  executePropsFunction('onError', {message: message, url: url, line: line, column: column});
};
`;
