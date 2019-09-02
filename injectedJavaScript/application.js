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
      args: [{
        message: message,
        url: url,
        line: line,
        column: column,
        error: error,
      }],
    }));
  };
  
  var bodyWidth = document.body.clientWidth || window.innerWidth;
  var bodyHeight = document.body.clientHeight || window.innerHeight;
  var signaturePadCanvas = document.querySelector('canvas');
  
  signaturePadCanvas.width = bodyWidth;
  signaturePadCanvas.height = bodyHeight;
  
  var signaturePad = new SignaturePad(signaturePadCanvas, {
    penColor: '${penColor}',
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
  ${dataURL ? `signaturePad.fromDataURL('${dataURL}');` : ''}
    
  var eventHandler = function(event) {
    var obj = JSON.parse(event.data);
    if(obj.func === 'cropData') {
      var croppedDataUrl = getCroppedDataUrl();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        func: 'onDataCropped',
        args: [croppedDataUrl],
      }));
      return;
    }
    signaturePad[obj.func].apply(signaturePad, obj.args);
  };
  window.addEventListener('message', eventHandler);
  document.addEventListener('message', eventHandler);
  
  var getCroppedDataUrl = function() {
    var imgWidth = signaturePadCanvas.width;
    var imgHeight = signaturePadCanvas.height;
    var imageData = signaturePadCanvas.getContext("2d").getImageData(0, 0, imgWidth, imgHeight);
    var data = imageData.data;
    
    var getAlpha = function(x, y) {
      return data[(imgWidth*y + x) * 4 + 3]
    };
    var scanY = function (fromTop) {
      var offset = fromTop ? 1 : -1;

      // loop through each row
      for(var y = fromTop ? 0 : imgHeight - 1; fromTop ? (y < imgHeight) : (y > -1); y += offset) {
        // loop through each column
        for(var x = 0; x < imgWidth; x++) {
          if (getAlpha(x, y)) {
            return y;                        
          }      
        }
      }
      return null; // all image is white
    };
    var scanX = function (fromLeft) {
      var offset = fromLeft? 1 : -1;

      // loop through each column
      for(var x = fromLeft ? 0 : imgWidth - 1; fromLeft ? (x < imgWidth) : (x > -1); x += offset) {
        // loop through each row
        for(var y = 0; y < imgHeight; y++) {
          if (getAlpha(x, y)) {
            return x;                        
          }      
        }
      }
      return null; // all image is white
    };

    var cropTop = scanY(true),
    cropBottom = scanY(false),
    cropLeft = scanX(true),
    cropRight = scanX(false);
    
    if(cropTop === null || cropLeft === null || cropBottom === null || cropRight === null) {
      return null;
    }

    var relevantData = signaturePadCanvas.getContext("2d").getImageData(cropLeft, cropTop, cropRight-cropLeft, cropBottom-cropTop);
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropRight-cropLeft;
    tempCanvas.height = cropBottom-cropTop;
    tempCanvas.getContext("2d").putImageData(relevantData, 0, 0);
    
    return tempCanvas.toDataURL('image/png');
  }
`;
