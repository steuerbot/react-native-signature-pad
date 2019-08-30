export default ({
    penColor = '#000000',
    dataURL = null,
    minWidth = 1,
    maxWidth = 3,
    dotSize = 3,
}) => `

  window.onerror = function(message, url, line, column, error) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      func: 'onError',
      args: {
        message: message,
        url: url,
        line: line,
        column: column,
        error: error,
      },
    }));
  };

  var showSignaturePad = function (signaturePadCanvas, bodyWidth, bodyHeight) {
    var width = bodyWidth;
    var height = bodyHeight;

    var sizeSignaturePad = function () {
      var devicePixelRatio = 1; /*window.devicePixelRatio || 1;*/
      var canvasWidth = width * devicePixelRatio;
      var canvasHeight = height * devicePixelRatio;
      signaturePadCanvas.width = canvasWidth;
      signaturePadCanvas.height = canvasHeight;
      signaturePadCanvas.getContext('2d').scale(devicePixelRatio, devicePixelRatio);
    };

    var enableSignaturePadFunctionality = function () {
      var signaturePad = new SignaturePad(signaturePadCanvas, {
        penColor: '${penColor || 'black'}',
        dotSize: window.devicePixelRatio * ${dotSize},
        minWidth: window.devicePixelRatio * ${minWidth},
        maxWidth: window.devicePixelRatio * ${maxWidth},
        onEnd: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            func: 'onChange',
            args: [signaturePad.toDataURL()],
          }));
        }
      });
      ${dataURL ? `signaturePad.fromDataURL('${dataURL}')` : ''}
    };

    sizeSignaturePad();
    enableSignaturePadFunctionality();
  };

  var bodyWidth = document.body.clientWidth || window.innerWidth;
  var bodyHeight = document.body.clientHeight || window.innerHeight;

  var canvasElement = document.querySelector('canvas');
  showSignaturePad(canvasElement, bodyWidth, bodyHeight);
`;
