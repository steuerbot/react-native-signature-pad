export default ({
                    penColor,
                    dataURL,
                    minWidth,
                    maxWidth,
                    dotSize,
                    backgroundColor,
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
        dotSize: window.devicePixelRatio * ${dotSize || 3},
        minWidth: window.devicePixelRatio * ${minWidth || 1},
        maxWidth: window.devicePixelRatio * ${maxWidth || 4},
        onEnd: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            func: 'onChange',
            args: [signaturePad.toDataURL()],
          }));
        }
      });
      if ('${dataURL}') {
        signaturePad.fromDataURL('${dataURL}');
      }
    };

    sizeSignaturePad();
    enableSignaturePadFunctionality();
  };

  var bodyWidth = document.body.clientWidth || window.innerWidth;
  var bodyHeight = document.body.clientHeight || window.innerHeight;

  var canvasElement = document.querySelector('canvas');
  showSignaturePad(canvasElement, bodyWidth, bodyHeight);
  
  document.body.style.backgroundColor = '${backgroundColor || '#ffffff'}';
`;
